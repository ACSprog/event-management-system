-- 0009 Giving and contributions: giving pages (church tithes and offerings, funeral
-- contributions, causes), funds, pledges, contributions and contribution cashouts.
--
-- Contribution money is separate from ticket money (ledger account 2600, per organisation):
-- * Non-refundable except for an EMS system failure (refund reason SYSTEM_FAILURE, finance only).
-- * EMS's fee is taken when each contribution is paid (account 4120).
-- * Organisers can cash out cleared money at any time: small cashouts are released
--   automatically when every check passes; larger ones go to EMS finance; dual approval
--   above the threshold. Mobile money clears on confirmation, cards after ~3 business days.

create type giving_kind as enum ('CHURCH', 'FUNERAL', 'CAUSE', 'FAMILY', 'OTHER');
create type contribution_status as enum ('PENDING', 'PAID', 'CLEARED', 'FAILED', 'REFUNDED_SYSTEM_FAILURE', 'CHARGED_BACK');
create type cashout_status as enum ('REQUESTED', 'CHECKS_FAILED', 'AWAITING_FINANCE', 'AWAITING_SECOND_APPROVAL', 'APPROVED', 'PAYOUT_PROCESSING', 'RELEASED', 'REJECTED', 'FAILED');

create table giving_pages (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organisations(id),
  slug        text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  kind        giving_kind not null,
  title       text not null,
  intro       text,
  event_id    uuid references events(id),          -- linked event (funeral, service) for per-event totals
  target      bigint check (target > 0),           -- causes and fundraisers
  ends_at     timestamptz,
  palette     text[],
  active      boolean not null default true,
  fee_bp      int not null default 0 check (fee_bp between 0 and 10000),   -- EMS fee, frozen per page
  fee_fixed   bigint not null default 0 check (fee_fixed >= 0),
  created_at  timestamptz not null default now()
);
create trigger giving_pages_audit after insert or update on giving_pages for each row execute function app.audit_row();

create table giving_funds (
  id        uuid primary key default gen_random_uuid(),
  page_id   uuid not null references giving_pages(id),
  key       text not null check (key ~ '^[a-z_]+$'),
  label     text not null,
  sub       text,
  sort      int not null default 0,
  unique (page_id, key)
);

-- Pledges are promises only; nothing is collected until paid.
create table pledges (
  id          uuid primary key default gen_random_uuid(),
  page_id     uuid not null references giving_pages(id),
  fund_id     uuid references giving_funds(id),
  user_id     uuid references users(id),
  name        text not null,
  phone       text,
  amount      bigint not null check (amount > 0),
  due_on      date,
  created_at  timestamptz not null default now()
);

create table contributions (
  id                 uuid primary key default gen_random_uuid(),
  receipt_no         text not null unique,             -- e.g. GV-GRA-482913
  page_id            uuid not null references giving_pages(id),
  fund_id            uuid not null references giving_funds(id),
  org_id             uuid not null references organisations(id),
  event_id           uuid references events(id),
  pledge_id          uuid references pledges(id),
  user_id            uuid references users(id),
  giver_name         text,
  anonymous          boolean not null default false,   -- name hidden from the organiser
  phone              text not null check (phone ~ '^\+[1-9][0-9]{6,14}$'),   -- for the SMS receipt
  amount             bigint not null check (amount > 0),
  fee                bigint not null default 0 check (fee >= 0),
  payment_intent_id  uuid references payment_intents(id),
  status             contribution_status not null default 'PENDING',
  paid_at            timestamptz,
  cleared_at         timestamptz,
  terms_text         text not null default 'Contributions are non-refundable, except where a system error occurs.',
  created_at         timestamptz not null default now(),
  check (fee <= amount)
);
create index contributions_page on contributions (page_id, paid_at desc);
create index contributions_org on contributions (org_id, status);
create trigger contributions_audit after update on contributions for each row execute function app.audit_row();

-- The only refund path is a system failure, recorded by finance with evidence.
create table contribution_refunds (
  id               uuid primary key default gen_random_uuid(),
  contribution_id  uuid not null unique references contributions(id),
  reason           text not null default 'SYSTEM_FAILURE' check (reason = 'SYSTEM_FAILURE'),
  failure_kind     text not null check (failure_kind in ('DUPLICATE_CHARGE', 'WRONG_AMOUNT', 'NOT_RECORDED', 'WRONG_RECIPIENT')),
  evidence         text not null,
  by_user          uuid not null references users(id),
  idempotency_key  text not null unique,
  created_at       timestamptz not null default now()
);
create or replace function app.check_contribution_refund() returns trigger language plpgsql as $$
begin
  if not exists (select 1 from platform_staff p where p.user_id = new.by_user and p.active and p.role in ('FINANCE_OFFICER', 'FINANCE_MANAGER')) then
    raise exception 'Only EMS finance can refund a contribution, and only for a system failure';
  end if;
  return new;
end $$;
create trigger contribution_refunds_check before insert on contribution_refunds for each row execute function app.check_contribution_refund();
create trigger contribution_refunds_append_only before update or delete on contribution_refunds for each row execute function app.forbid_change();

create table contribution_cashouts (
  id                 uuid primary key default gen_random_uuid(),
  ref                text not null unique,
  org_id             uuid not null references organisations(id),
  amount             bigint not null check (amount > 0),
  route              text not null check (route in ('AUTOMATIC', 'FINANCE')),
  status             cashout_status not null default 'REQUESTED',
  requested_by       uuid not null references users(id),
  checks             jsonb not null default '{}',   -- which automatic checks passed or failed
  required_approvals smallint not null default 0 check (required_approvals between 0 and 2),
  created_at         timestamptz not null default now(),
  decided_at         timestamptz
);
create trigger contribution_cashouts_audit after insert or update on contribution_cashouts for each row execute function app.audit_row();

create table cashout_approvals (
  cashout_id   uuid not null references contribution_cashouts(id),
  step         smallint not null check (step in (1, 2)),
  approver_id  uuid not null references users(id),
  at           timestamptz not null default now(),
  primary key (cashout_id, step)
);
create trigger cashout_approvals_append_only before update or delete on cashout_approvals for each row execute function app.forbid_change();

-- Cleared contribution money held for an organisation, minus cashouts in progress or released.
create or replace function app.contribution_available(p_org uuid) returns bigint language sql stable security definer set search_path = public, app as $$
  select coalesce((select sum(amount - fee) from contributions where org_id = p_org and status = 'CLEARED'), 0)
       - coalesce((select sum(amount) from contribution_cashouts where org_id = p_org
                    and status in ('REQUESTED', 'AWAITING_FINANCE', 'AWAITING_SECOND_APPROVAL', 'APPROVED', 'PAYOUT_PROCESSING', 'RELEASED')), 0);
$$;

create or replace function app.check_cashout() returns trigger language plpgsql as $$
declare v_avail bigint; v_limit bigint; v_today bigint;
begin
  perform pg_advisory_xact_lock(hashtext('cashout' || new.org_id::text));
  v_avail := app.contribution_available(new.org_id);
  if new.amount > v_avail then
    raise exception 'Only % ngwee of cleared contribution money is available', v_avail;
  end if;
  v_limit := coalesce((app.finance_setting()).contribution_auto_limit, 500000);
  select coalesce(sum(amount), 0) into v_today from contribution_cashouts
    where org_id = new.org_id and route = 'AUTOMATIC' and created_at >= date_trunc('day', now()) and status <> 'REJECTED';
  if new.route = 'AUTOMATIC' and v_today + new.amount > v_limit then
    raise exception 'Over today''s automatic limit; send it to EMS finance instead';
  end if;
  if new.route = 'FINANCE' then
    new.required_approvals := case when new.amount >= coalesce((app.finance_setting()).dual_threshold, 5000000) then 2 else 1 end;
  end if;
  return new;
end $$;
create trigger contribution_cashouts_check before insert on contribution_cashouts for each row execute function app.check_cashout();

create or replace function app.check_cashout_approval() returns trigger language plpgsql as $$
declare v_role platform_role; c contribution_cashouts;
begin
  select * into c from contribution_cashouts where id = new.cashout_id;
  select role into v_role from platform_staff where user_id = new.approver_id and active;
  if c.route <> 'FINANCE' then raise exception 'Automatic cashouts are not approved by hand'; end if;
  if v_role is null or v_role not in ('FINANCE_OFFICER', 'FINANCE_MANAGER') then
    raise exception 'Only platform finance staff can approve cashouts';
  end if;
  if new.step = 2 and (v_role <> 'FINANCE_MANAGER' or exists (select 1 from cashout_approvals where cashout_id = new.cashout_id and approver_id = new.approver_id)) then
    raise exception 'The second approval must come from a different person who is a finance manager';
  end if;
  return new;
end $$;
create trigger cashout_approvals_check before insert on cashout_approvals for each row execute function app.check_cashout_approval();

alter table payouts add constraint payouts_cashout_fk foreign key (cashout_id) references contribution_cashouts(id);
create unique index payouts_one_per_cashout on payouts (cashout_id) where status <> 'FAILED' and cashout_id is not null;

-- Totals per fund for a giving page (what the organiser sees; names respect "anonymous").
create view giving_totals with (security_invoker = true) as
select c.page_id, c.fund_id, f.label as fund, c.event_id, count(*) as gifts, sum(c.amount) as amount
from contributions c join giving_funds f on f.id = c.fund_id
where c.status in ('PAID', 'CLEARED')
group by c.page_id, c.fund_id, f.label, c.event_id;
