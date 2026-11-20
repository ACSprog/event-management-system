-- 0003 Commercial: plans and versions, subscriptions, licence packages, contracts,
-- partnerships, add-ons, discounts, entitlements. (Spec sections 1–3, design 2.2–2.3.)
-- Money is bigint ngwee (K1 = 100); rates are basis points (300 = 3.00%).

create type plan_code as enum ('FREE', 'STARTER', 'PROFESSIONAL', 'ENTERPRISE');
create type billing_period as enum ('MONTHLY', 'ANNUAL');
create type subscription_status as enum ('TRIAL', 'ACTIVE', 'GRACE', 'RESTRICTED', 'CANCELLED');
create type licence_code as enum ('BASIC', 'STANDARD', 'PREMIUM');
create type contract_kind as enum ('ENTERPRISE', 'DIRECT_COLLECTION');
create type partnership_status as enum ('APPLIED', 'DRAFT', 'OFFERED', 'ACCEPTED', 'ACTIVE', 'CLOSED');

create table plans (code plan_code primary key, name text not null);

-- New prices are new versions; existing subscriptions keep their version.
create table plan_versions (
  id             uuid primary key default gen_random_uuid(),
  plan_code      plan_code not null references plans(code),
  version        int not null,
  monthly_price  bigint not null check (monthly_price >= 0),
  annual_price   bigint not null check (annual_price >= 0),
  fee_bp         int not null check (fee_bp between 0 and 10000),
  fee_fixed      bigint not null default 0 check (fee_fixed >= 0),
  team_limit     int,
  features       jsonb not null default '{}',
  valid_from     timestamptz not null default now(),
  unique (plan_code, version)
);

create table subscriptions (
  id                  uuid primary key default gen_random_uuid(),
  org_id              uuid not null references organisations(id),
  plan_version_id     uuid not null references plan_versions(id),
  period              billing_period not null,
  status              subscription_status not null,
  current_period_end  timestamptz not null,
  trial_used          boolean not null default false,
  created_at          timestamptz not null default now()
);
-- One live subscription per organisation.
create unique index subscriptions_one_live on subscriptions (org_id) where status in ('TRIAL', 'ACTIVE', 'GRACE', 'RESTRICTED');
create trigger subscriptions_audit after insert or update on subscriptions for each row execute function app.audit_row();

create table licence_packages (code licence_code primary key, name text not null);
create table licence_package_versions (
  id                uuid primary key default gen_random_uuid(),
  code              licence_code not null references licence_packages(code),
  version           int not null,
  guests            int not null check (guests > 0),
  price             bigint not null check (price >= 0),
  features          jsonb not null default '{}',
  full_access_days  int not null default 90,
  read_only_days    int not null default 365,
  valid_from        timestamptz not null default now(),
  unique (code, version)
);

create table contracts (
  id         uuid primary key default gen_random_uuid(),
  org_id     uuid not null references organisations(id),
  kind       contract_kind not null,
  terms      jsonb not null default '{}',
  signed_at  timestamptz,
  valid_to   timestamptz
);

-- Revenue-share partnerships: set up by the super admin, accepted by both sides,
-- never self-service (R1.2). Terms freeze once accepted.
create table partnership_agreements (
  id                      uuid primary key default gen_random_uuid(),
  org_id                  uuid not null references organisations(id),
  status                  partnership_status not null default 'APPLIED',
  ems_share_bp            int check (ems_share_bp between 0 and 10000),
  base_rule               text not null default 'TICKET_SALES_MINUS_REFUNDS_AND_CHARGES',
  allowed_deductions      jsonb not null default '[]',
  down_payment            bigint not null default 0 check (down_payment >= 0),
  down_payment_treatment  text not null default 'ADVANCE_AGAINST_SHARE',
  max_exposure            bigint not null default 0 check (max_exposure >= 0),
  cancellation_terms      text,
  accepted_by_org_at      timestamptz,
  accepted_by_ems_at      timestamptz,
  created_at              timestamptz not null default now()
);
create trigger partnership_agreements_audit after insert or update on partnership_agreements for each row execute function app.audit_row();

create or replace function app.freeze_partnership_terms() returns trigger language plpgsql as $$
begin
  if old.status in ('ACCEPTED', 'ACTIVE', 'CLOSED') and (
       new.ems_share_bp is distinct from old.ems_share_bp or new.base_rule is distinct from old.base_rule
    or new.allowed_deductions is distinct from old.allowed_deductions or new.down_payment is distinct from old.down_payment
    or new.max_exposure is distinct from old.max_exposure) then
    raise exception 'Partnership terms are frozen once accepted';
  end if;
  return new;
end $$;
create trigger partnership_freeze before update on partnership_agreements for each row execute function app.freeze_partnership_terms();

create type partnership_contribution_kind as enum ('CASH', 'MARKETING', 'EQUIPMENT');
create table partnership_contributions (
  id            uuid primary key default gen_random_uuid(),
  agreement_id  uuid not null references partnership_agreements(id),
  kind          partnership_contribution_kind not null,
  amount        bigint not null check (amount > 0),
  note          text,
  created_at    timestamptz not null default now()
);
create or replace function app.check_partnership_exposure() returns trigger language plpgsql as $$
begin
  if (select coalesce(sum(amount), 0) from partnership_contributions where agreement_id = new.agreement_id)
     > (select max_exposure from partnership_agreements where id = new.agreement_id) then
    raise exception 'Partnership contributions exceed the agreed maximum exposure';
  end if;
  return new;
end $$;
create constraint trigger partnership_exposure after insert or update on partnership_contributions
  deferrable initially deferred for each row execute function app.check_partnership_exposure();

create table addons (code text primary key, name text not null, unit_price bigint not null check (unit_price >= 0));
create table org_addons (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organisations(id),
  addon_code  text not null references addons(code),
  quantity    int not null check (quantity > 0),
  valid_to    timestamptz,
  created_at  timestamptz not null default now()
);

create table discounts (
  code       citext primary key,
  kind       text not null check (kind in ('PERCENT_BP', 'FIXED')),
  value      bigint not null check (value > 0),
  max_uses   int,
  used       int not null default 0,
  valid_to   timestamptz,
  check (max_uses is null or used <= max_uses)
);

-- Entitlements: one service answers "may this organisation do X?" from grants − usage.
-- Check-in and scanning never consult it (they are never blocked).
create table entitlement_grants (
  id          uuid primary key default gen_random_uuid(),
  org_id      uuid not null references organisations(id),
  source      text not null check (source in ('PLAN', 'LICENCE', 'ADDON', 'CONTRACT')),
  key         text not null,
  "limit"     bigint,
  valid_from  timestamptz not null default now(),
  valid_to    timestamptz
);
create index entitlement_grants_org_key on entitlement_grants (org_id, key);

create table entitlement_usage (
  org_id  uuid not null references organisations(id),
  key     text not null,
  used    bigint not null default 0 check (used >= 0),
  primary key (org_id, key)
);
