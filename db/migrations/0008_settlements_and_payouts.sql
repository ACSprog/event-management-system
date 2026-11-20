-- 0008 Settlements and payouts. (Spec section 5, design 2.6 and 5.)
-- Ticket money is paid out once, after the event, through one settlement per event.
-- The database enforces: no payout before the event is completed and the settlement
-- approved; approvals only by platform finance staff; two different approvers above the
-- threshold, the second a finance manager; one payout per settlement; payout accounts
-- usable only 48 hours after verification.

create type completion_outcome as enum ('COMPLETED', 'CANCELLED', 'POSTPONED', 'INCOMPLETE');
create type settlement_status as enum ('AWAITING_EVENT_COMPLETION', 'RECONCILIATION_PENDING', 'ORGANISER_REVIEW',
  'UNDER_FINANCE_REVIEW', 'DISPUTED', 'AWAITING_APPROVAL', 'AWAITING_SECOND_APPROVAL', 'APPROVED',
  'PAYOUT_PROCESSING', 'SETTLED', 'FAILED', 'CANCELLED');
create type payout_method as enum ('MTN', 'AIRTEL', 'ZAMTEL', 'BANK');
create type payout_status as enum ('INITIATED', 'PROCESSING', 'CONFIRMED', 'FAILED');

-- Versioned finance settings; a change needs a second finance person to confirm.
create table finance_settings (
  version                    int primary key,
  reconcile_days             int not null default 3,
  review_days                int not null default 2,
  payout_days                int not null default 2,
  dual_threshold             bigint not null default 5000000,     -- K50,000
  account_change_wait_hours  int not null default 48,
  licence_cancel_fee_bp      int not null default 1000,
  grace_days                 int not null default 14,
  material_discrepancy       bigint not null default 10000,       -- K100
  contribution_auto_limit    bigint not null default 500000,      -- K5,000 per day (placeholder)
  proposed_by                uuid not null references users(id),
  confirmed_by               uuid references users(id),
  confirmed_at               timestamptz,
  created_at                 timestamptz not null default now(),
  check (confirmed_by is null or confirmed_by <> proposed_by)
);
create trigger finance_settings_audit after insert or update on finance_settings for each row execute function app.audit_row();

create or replace function app.finance_setting() returns finance_settings language sql stable as $$
  select * from finance_settings where confirmed_at is not null order by version desc limit 1;
$$;

create table public_holidays (
  day       date primary key,
  name      text not null,
  observed  boolean not null default true
);

create table event_completions (
  event_id  uuid primary key references events(id),
  outcome   completion_outcome not null,
  by_system boolean not null default false,
  by_user   uuid references users(id),
  at        timestamptz not null default now(),
  note      text
);
create or replace function app.check_completion() returns trigger language plpgsql as $$
begin
  if new.outcome = 'COMPLETED' and now() < (select ends_at from events where id = new.event_id) then
    raise exception 'An event cannot be completed before its scheduled end';
  end if;
  return new;
end $$;
create trigger event_completions_check before insert or update on event_completions for each row execute function app.check_completion();
create trigger event_completions_audit after insert or update on event_completions for each row execute function app.audit_row();

create table settlements (
  id                  uuid primary key default gen_random_uuid(),
  ref                 text not null unique,                 -- e.g. ST-ZL-0431
  event_id            uuid not null unique references events(id),
  org_id              uuid not null references organisations(id),
  status              settlement_status not null default 'AWAITING_EVENT_COMPLETION',
  payable             bigint check (payable >= 0),
  required_approvals  smallint not null default 1 check (required_approvals in (1, 2)),
  reconcile_due       date,
  review_due          date,
  payout_due          date,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create trigger settlements_touch before update on settlements for each row execute function app.touch_updated_at();
create trigger settlements_audit after insert or update on settlements for each row execute function app.audit_row();

-- Allowed status changes. Anything else is rejected.
create table settlement_transitions (from_status settlement_status, to_status settlement_status, primary key (from_status, to_status));
insert into settlement_transitions values
  ('AWAITING_EVENT_COMPLETION', 'RECONCILIATION_PENDING'), ('AWAITING_EVENT_COMPLETION', 'CANCELLED'),
  ('RECONCILIATION_PENDING', 'ORGANISER_REVIEW'),
  ('ORGANISER_REVIEW', 'UNDER_FINANCE_REVIEW'), ('ORGANISER_REVIEW', 'DISPUTED'),
  ('UNDER_FINANCE_REVIEW', 'AWAITING_APPROVAL'), ('UNDER_FINANCE_REVIEW', 'DISPUTED'),
  ('DISPUTED', 'UNDER_FINANCE_REVIEW'), ('DISPUTED', 'AWAITING_APPROVAL'),
  ('AWAITING_APPROVAL', 'AWAITING_SECOND_APPROVAL'), ('AWAITING_APPROVAL', 'APPROVED'),
  ('AWAITING_SECOND_APPROVAL', 'APPROVED'),
  ('APPROVED', 'PAYOUT_PROCESSING'),
  ('PAYOUT_PROCESSING', 'SETTLED'), ('PAYOUT_PROCESSING', 'FAILED'),
  ('FAILED', 'PAYOUT_PROCESSING');

create table settlement_lines (
  id             bigint generated always as identity primary key,
  settlement_id  uuid not null references settlements(id),
  kind           text not null,          -- GROSS, REFUNDS, CHARGEBACKS, PROVIDER_CHARGES, EMS_FEE, PARTNERSHIP_SHARE, ADJUSTMENT
  label          text not null,
  amount         bigint not null,
  generated_at   timestamptz not null default now()
);
create trigger settlement_lines_append_only before update or delete on settlement_lines for each row execute function app.forbid_change();

create table settlement_disputes (
  id             uuid primary key default gen_random_uuid(),
  settlement_id  uuid not null references settlements(id),
  line_kind      text not null,
  amount         bigint not null check (amount > 0),
  reason         text not null,
  raised_by      uuid not null references users(id),
  status         text not null default 'OPEN' check (status in ('OPEN', 'ACCEPTED', 'REJECTED')),
  resolution     text,
  resolved_by    uuid references users(id),
  ring_fenced    boolean not null default false,
  created_at     timestamptz not null default now()
);
create trigger settlement_disputes_audit after insert or update on settlement_disputes for each row execute function app.audit_row();

create table settlement_adjustments (
  id                uuid primary key default gen_random_uuid(),
  settlement_id     uuid not null references settlements(id),
  amount            bigint not null check (amount <> 0),
  reason            text not null,
  evidence_file     text,
  by_user           uuid not null references users(id),
  journal_entry_id  uuid not null references journal_entries(id),
  created_at        timestamptz not null default now()
);
create trigger settlement_adjustments_append_only before update or delete on settlement_adjustments for each row execute function app.forbid_change();

create table discrepancies (
  id             uuid primary key default gen_random_uuid(),
  settlement_id  uuid references settlements(id),
  kind           text not null,
  amount         bigint not null,
  material       boolean not null,
  status         text not null default 'OPEN' check (status in ('OPEN', 'RESOLVED')),
  note           text,
  created_at     timestamptz not null default now()
);

create table settlement_approvals (
  settlement_id  uuid not null references settlements(id),
  step           smallint not null check (step in (1, 2)),
  approver_id    uuid not null references users(id),
  at             timestamptz not null default now(),
  primary key (settlement_id, step)
);
create trigger settlement_approvals_append_only before update or delete on settlement_approvals for each row execute function app.forbid_change();

-- Approval rules (design 5.3).
create or replace function app.check_approval() returns trigger language plpgsql as $$
declare v_role platform_role; v_limit bigint; v_active boolean; s settlements;
begin
  select * into s from settlements where id = new.settlement_id;
  select role, approval_limit, active into v_role, v_limit, v_active from platform_staff where user_id = new.approver_id;
  if v_role is null or not v_active or v_role not in ('FINANCE_OFFICER', 'FINANCE_MANAGER') then
    raise exception 'Only active platform finance staff can approve settlements';
  end if;
  if new.step = 1 and s.status <> 'AWAITING_APPROVAL' then raise exception 'Settlement is not awaiting approval'; end if;
  if new.step = 2 then
    if s.required_approvals < 2 then raise exception 'This settlement needs only one approval'; end if;
    if s.status <> 'AWAITING_SECOND_APPROVAL' then raise exception 'Settlement is not awaiting a second approval'; end if;
    if v_role <> 'FINANCE_MANAGER' then raise exception 'The second approval must come from a finance manager'; end if;
    if exists (select 1 from settlement_approvals a where a.settlement_id = new.settlement_id and a.step = 1 and a.approver_id = new.approver_id) then
      raise exception 'The second approver must be a different person';
    end if;
  end if;
  if s.required_approvals = 1 and v_limit < s.payable then
    raise exception 'Payable exceeds this approver''s limit';
  end if;
  return new;
end $$;
create trigger settlement_approvals_check before insert on settlement_approvals for each row execute function app.check_approval();

-- Status guards.
create or replace function app.check_settlement_transition() returns trigger language plpgsql as $$
declare v_approvals int;
begin
  if new.status = old.status then return new; end if;
  if not exists (select 1 from settlement_transitions where from_status = old.status and to_status = new.status) then
    raise exception 'Settlement cannot move from % to %', old.status, new.status;
  end if;
  if new.status = 'RECONCILIATION_PENDING' and not exists (
      select 1 from event_completions where event_id = new.event_id and outcome = 'COMPLETED') then
    raise exception 'The event has not been completed';
  end if;
  if new.status = 'AWAITING_APPROVAL' then
    if exists (select 1 from discrepancies where settlement_id = new.id and material and status = 'OPEN') then
      raise exception 'A material discrepancy is still open';
    end if;
    if exists (select 1 from settlement_disputes where settlement_id = new.id and status = 'OPEN' and not ring_fenced) then
      raise exception 'A dispute is still open';
    end if;
    new.required_approvals := case when new.payable >= coalesce((app.finance_setting()).dual_threshold, 5000000) then 2 else 1 end;
  end if;
  select count(*) into v_approvals from settlement_approvals where settlement_id = new.id;
  if new.status = 'AWAITING_SECOND_APPROVAL' and (new.required_approvals < 2 or v_approvals < 1) then
    raise exception 'A first approval is needed before the second';
  end if;
  if new.status = 'APPROVED' and v_approvals < new.required_approvals then
    raise exception 'Settlement needs % approval(s), has %', new.required_approvals, v_approvals;
  end if;
  if new.payable is distinct from old.payable and old.status not in ('AWAITING_EVENT_COMPLETION', 'RECONCILIATION_PENDING', 'ORGANISER_REVIEW', 'UNDER_FINANCE_REVIEW', 'DISPUTED') then
    raise exception 'The payable amount is fixed once approval starts';
  end if;
  return new;
end $$;
create trigger settlements_transition before update on settlements for each row execute function app.check_settlement_transition();

create table payout_accounts (
  id             uuid primary key default gen_random_uuid(),
  org_id         uuid not null references organisations(id),
  method         payout_method not null,
  number_masked  text not null,                   -- full number lives with the payment provider / Secret Manager
  holder_name    text not null,
  status         text not null default 'PENDING' check (status in ('PENDING', 'VERIFIED', 'REJECTED', 'RETIRED')),
  verified_at    timestamptz,
  usable_from    timestamptz,                     -- verified_at + 48 h
  created_at     timestamptz not null default now()
);
create unique index payout_accounts_one_active on payout_accounts (org_id) where status in ('PENDING', 'VERIFIED');
create trigger payout_accounts_audit after insert or update on payout_accounts for each row execute function app.audit_row();

create or replace function app.set_usable_from() returns trigger language plpgsql as $$
begin
  if new.status = 'VERIFIED' and (old.status is distinct from 'VERIFIED') then
    new.verified_at := now();
    new.usable_from := now() + make_interval(hours => coalesce((app.finance_setting()).account_change_wait_hours, 48));
  end if;
  return new;
end $$;
create trigger payout_accounts_usable before update on payout_accounts for each row execute function app.set_usable_from();

create table payouts (
  id                 uuid primary key default gen_random_uuid(),
  settlement_id      uuid references settlements(id),
  cashout_id         uuid,                                  -- contribution cashouts (0009)
  payout_account_id  uuid not null references payout_accounts(id),
  amount             bigint not null check (amount > 0),
  status             payout_status not null default 'INITIATED',
  idempotency_key    text not null unique,
  provider_ref       text unique,
  initiated_by       uuid not null references users(id),
  created_at         timestamptz not null default now(),
  confirmed_at       timestamptz,
  check ((settlement_id is null) <> (cashout_id is null))
);
-- One non-failed payout per settlement (a ring-fenced dispute release uses a resolved second payout).
create unique index payouts_one_per_settlement on payouts (settlement_id) where status <> 'FAILED' and settlement_id is not null;
create trigger payouts_audit after insert or update on payouts for each row execute function app.audit_row();

-- No early payouts: the only way in is an approved settlement for a completed event,
-- to a verified account past its waiting period, for exactly the settlement's payable.
create or replace function app.check_payout() returns trigger language plpgsql as $$
declare s settlements; a payout_accounts; v_org uuid;
begin
  select * into a from payout_accounts where id = new.payout_account_id;
  if a.status <> 'VERIFIED' or a.usable_from is null or a.usable_from > now() then
    raise exception 'Payout account is not verified or is still in its waiting period';
  end if;
  if new.settlement_id is not null then
    select * into s from settlements where id = new.settlement_id;
    if s.status not in ('APPROVED', 'FAILED') then raise exception 'Settlement is not approved'; end if;
    if not exists (select 1 from event_completions where event_id = s.event_id and outcome = 'COMPLETED') then
      raise exception 'The event has not been completed';
    end if;
    if a.org_id <> s.org_id then raise exception 'Payout account belongs to another organisation'; end if;
    if new.amount <> s.payable then raise exception 'Payout must equal the settlement payable'; end if;
    if s.required_approvals = 2 and exists (select 1 from settlement_approvals where settlement_id = s.id and approver_id = new.initiated_by)
       and (select count(distinct approver_id) from settlement_approvals where settlement_id = s.id) < 2 then
      raise exception 'The payout initiator cannot be the only approver';
    end if;
    if exists (select 1 from organisations o where o.id = s.org_id and o.verified_at is null) then
      raise exception 'The organisation is not verified';
    end if;
  end if;
  return new;
end $$;
create trigger payouts_check before insert on payouts for each row execute function app.check_payout();

create or replace function app.check_payout_transition() returns trigger language plpgsql as $$
begin
  if old.status in ('CONFIRMED', 'FAILED') and new.status <> old.status then raise exception 'Payout % is final', old.id; end if;
  if new.amount <> old.amount or new.payout_account_id <> old.payout_account_id then raise exception 'Payout details cannot change'; end if;
  if new.status = 'CONFIRMED' and new.provider_ref is null then raise exception 'A confirmed payout needs the provider reference'; end if;
  return new;
end $$;
create trigger payouts_transition before update on payouts for each row execute function app.check_payout_transition();

create table payout_attempts (
  id                 bigint generated always as identity primary key,
  payout_id          uuid not null references payouts(id),
  attempt_no         int not null,
  provider_response  jsonb,
  at                 timestamptz not null default now(),
  unique (payout_id, attempt_no)
);
create trigger payout_attempts_append_only before update or delete on payout_attempts for each row execute function app.forbid_change();

alter table chargebacks add constraint chargebacks_settlement_fk foreign key (recovered_in_settlement_id) references settlements(id);
