-- 0007 Ledger: double-entry accounting. The ledger is the source of truth for every
-- balance (what EMS holds for an organiser, what EMS has earned). (Design 2.5, 3, 4.)
-- * Amounts are signed ngwee: debit +, credit −. Every entry sums to 0 per currency.
-- * Entries and lines are insert-only; corrections are new entries (reverses_entry_id).
-- * (source_type, source_id, kind) is unique, so the same payment can't be posted twice.

create type account_type as enum ('ASSET', 'LIABILITY', 'REVENUE', 'EXPENSE', 'CONTRA');

-- Chart of accounts (design section 3, plus 2600/4120 for contribution money).
create table ledger_chart (
  code  int primary key,
  name  text not null,
  type  account_type not null,
  scope text not null check (scope in ('PLATFORM', 'PROVIDER', 'ORG', 'ORG_EVENT', 'EVENT', 'AGREEMENT'))
);
insert into ledger_chart values
  (1100, 'Aggregator collection account', 'ASSET', 'PROVIDER'),
  (1200, 'Receivable from organisers', 'ASSET', 'ORG'),
  (2100, 'Organiser funds held (tickets)', 'LIABILITY', 'ORG_EVENT'),
  (2200, 'Booking fees deferred', 'LIABILITY', 'EVENT'),
  (2300, 'Refunds payable to buyers', 'LIABILITY', 'EVENT'),
  (2400, 'Partnership down payments received', 'LIABILITY', 'AGREEMENT'),
  (2500, 'VAT payable', 'LIABILITY', 'PLATFORM'),
  (2600, 'Contribution funds held', 'LIABILITY', 'ORG'),
  (4100, 'Commission revenue', 'REVENUE', 'PLATFORM'),
  (4110, 'Booking fee revenue', 'REVENUE', 'PLATFORM'),
  (4120, 'Contribution fee revenue', 'REVENUE', 'PLATFORM'),
  (4200, 'Subscription revenue', 'REVENUE', 'PLATFORM'),
  (4300, 'Licence revenue', 'REVENUE', 'PLATFORM'),
  (4400, 'Partnership share revenue', 'REVENUE', 'PLATFORM'),
  (4500, 'Add-on, promotion and sales-tracking revenue', 'REVENUE', 'PLATFORM'),
  (5100, 'Payment provider charges', 'EXPENSE', 'PLATFORM'),
  (5110, 'Provider charges recovered from organisers', 'CONTRA', 'PLATFORM'),
  (5200, 'Payout transfer charges', 'EXPENSE', 'PLATFORM'),
  (5300, 'Chargeback losses (unrecovered)', 'EXPENSE', 'PLATFORM'),
  (5400, 'System-failure refunds absorbed by EMS', 'EXPENSE', 'PLATFORM');

create table ledger_accounts (
  id           uuid primary key default gen_random_uuid(),
  code         int not null references ledger_chart(code),
  provider     provider,
  org_id       uuid references organisations(id),
  event_id     uuid references events(id),
  agreement_id uuid references partnership_agreements(id),
  unique nulls not distinct (code, provider, org_id, event_id, agreement_id)
);

-- Find or create the account for a code and scope.
create or replace function app.ledger_account(p_code int, p_org uuid default null, p_event uuid default null,
  p_provider provider default null, p_agreement uuid default null) returns uuid
language plpgsql security definer set search_path = public, app as $$
declare v_id uuid;
begin
  select id into v_id from ledger_accounts where code = p_code and provider is not distinct from p_provider
    and org_id is not distinct from p_org and event_id is not distinct from p_event and agreement_id is not distinct from p_agreement;
  if v_id is null then
    insert into ledger_accounts (code, provider, org_id, event_id, agreement_id) values (p_code, p_provider, p_org, p_event, p_agreement)
    on conflict do nothing returning id into v_id;
    if v_id is null then
      select id into v_id from ledger_accounts where code = p_code and provider is not distinct from p_provider
        and org_id is not distinct from p_org and event_id is not distinct from p_event and agreement_id is not distinct from p_agreement;
    end if;
  end if;
  return v_id;
end $$;

create table journal_entries (
  id                 uuid primary key default gen_random_uuid(),
  kind               text not null,                    -- e.g. TICKET_PAID, REFUND_APPROVED, PAYOUT_CONFIRMED
  occurred_at        timestamptz not null default now(),
  source_type        text not null,                    -- e.g. payment_intent, refund, payout, settlement
  source_id          text not null,
  idempotency_key    text not null unique,
  reverses_entry_id  uuid references journal_entries(id),
  memo               text,
  created_by         uuid,
  created_at         timestamptz not null default now(),
  unique (source_type, source_id, kind)
);

create table journal_lines (
  id          bigint generated always as identity primary key,
  entry_id    uuid not null references journal_entries(id),
  account_id  uuid not null references ledger_accounts(id),
  amount      bigint not null check (amount <> 0),       -- debit +, credit −
  currency    char(3) not null default 'ZMW'
);
create index journal_lines_account on journal_lines (account_id);
create index journal_lines_entry on journal_lines (entry_id);

create trigger journal_entries_append_only before update or delete on journal_entries for each row execute function app.forbid_change();
create trigger journal_lines_append_only before update or delete on journal_lines for each row execute function app.forbid_change();

-- Every entry must balance (checked at commit, so lines can be inserted one by one).
create or replace function app.check_entry_balanced() returns trigger language plpgsql as $$
declare v_bad record;
begin
  select currency, sum(amount) as total into v_bad from journal_lines where entry_id = new.entry_id
    group by currency having sum(amount) <> 0 limit 1;
  if found then
    raise exception 'Journal entry % does not balance in % (off by %)', new.entry_id, v_bad.currency, v_bad.total;
  end if;
  return null;
end $$;
create constraint trigger journal_lines_balanced after insert on journal_lines
  deferrable initially deferred for each row execute function app.check_entry_balanced();

-- An entry with no lines is not allowed either.
create or replace function app.check_entry_has_lines() returns trigger language plpgsql as $$
begin
  if not exists (select 1 from journal_lines where entry_id = new.id) then
    raise exception 'Journal entry % has no lines', new.id;
  end if;
  return null;
end $$;
create constraint trigger journal_entries_have_lines after insert on journal_entries
  deferrable initially deferred for each row execute function app.check_entry_has_lines();

-- Post a whole entry in one call. p_lines: [{"account": uuid, "amount": bigint}, ...]
create or replace function app.post_entry(p_kind text, p_source_type text, p_source_id text, p_key text,
  p_lines jsonb, p_memo text default null, p_reverses uuid default null) returns uuid
language plpgsql security definer set search_path = public, app as $$
declare v_entry uuid; v_line jsonb;
begin
  insert into journal_entries (kind, source_type, source_id, idempotency_key, reverses_entry_id, memo, created_by)
  values (p_kind, p_source_type, p_source_id, p_key, p_reverses, p_memo, app.user_id())
  on conflict (idempotency_key) do nothing returning id into v_entry;
  if v_entry is null then  -- already posted: idempotent
    select id into v_entry from journal_entries where idempotency_key = p_key;
    return v_entry;
  end if;
  for v_line in select * from jsonb_array_elements(p_lines) loop
    insert into journal_lines (entry_id, account_id, amount, currency)
    values (v_entry, (v_line ->> 'account')::uuid, (v_line ->> 'amount')::bigint, coalesce(v_line ->> 'currency', 'ZMW'));
  end loop;
  return v_entry;
end $$;

-- Balances are always derived, never stored.
create view account_balances with (security_invoker = true) as
select a.id as account_id, a.code, c.name, a.org_id, a.event_id, a.provider, a.agreement_id,
       coalesce(sum(l.amount), 0) as balance
from ledger_accounts a join ledger_chart c on c.code = a.code
left join journal_lines l on l.account_id = a.id
group by a.id, c.name;
