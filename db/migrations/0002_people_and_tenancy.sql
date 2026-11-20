-- 0002 People and tenancy: users, sign-in codes, organisations, verification,
-- organiser team roles, platform staff, follows and preferences.

create type gender as enum ('FEMALE', 'MALE', 'PREFER_NOT_TO_SAY');
create type org_type as enum ('PROMOTER', 'CHURCH', 'SCHOOL', 'BUSINESS', 'CHARITY', 'SPORTS', 'VENUE', 'PLANNER', 'FAMILY', 'INDIVIDUAL', 'OTHER');
create type org_status as enum ('PENDING', 'ACTIVE', 'RESTRICTED', 'SUSPENDED');
create type verification_kind as enum ('PACRA', 'DIRECTOR_ID', 'NRC', 'TEST_PAYMENT');
create type verification_status as enum ('PENDING', 'VERIFIED', 'REJECTED');
create type platform_role as enum ('OWNER', 'FINANCE_OFFICER', 'FINANCE_MANAGER', 'SUPPORT', 'MODERATOR');

-- Users: attendees, organiser staff and platform staff are all users.
create table users (
  id             uuid primary key default gen_random_uuid(),
  phone          text unique check (phone ~ '^\+[1-9][0-9]{6,14}$'),   -- E.164
  email          citext unique,
  name           text not null check (length(name) between 1 and 120),
  gender         gender not null default 'PREFER_NOT_TO_SAY',
  date_of_birth  date,
  mfa_enabled    boolean not null default false,
  mfa_secret_ref text,          -- reference to Secret Manager, never the secret itself
  status         text not null default 'ACTIVE' check (status in ('ACTIVE', 'BLOCKED', 'DELETED')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  deleted_at     timestamptz,
  check (phone is not null or email is not null)
);
create trigger users_touch before update on users for each row execute function app.touch_updated_at();

-- One-time sign-in codes (SMS). Only a hash is stored; codes expire and lock after attempts.
create table otp_challenges (
  id          uuid primary key default gen_random_uuid(),
  phone       text not null check (phone ~ '^\+[1-9][0-9]{6,14}$'),
  code_hash   text not null,
  purpose     text not null check (purpose in ('SIGN_IN', 'MFA', 'PHONE_CHANGE', 'CHECKOUT')),
  expires_at  timestamptz not null,
  attempts    smallint not null default 0 check (attempts <= 5),
  used_at     timestamptz,
  ip          inet,
  created_at  timestamptz not null default now()
);
create index otp_challenges_phone on otp_challenges (phone, created_at desc);

create table organisations (
  id             uuid primary key default gen_random_uuid(),
  slug           text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name           text not null,
  type           org_type not null,
  status         org_status not null default 'PENDING',
  parent_org_id  uuid references organisations(id),
  city           text,
  about          text,
  pacra_no       text,
  verified_at    timestamptz,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create trigger organisations_touch before update on organisations for each row execute function app.touch_updated_at();
create trigger organisations_audit after insert or update on organisations for each row execute function app.audit_row();

-- Organisations prove who they are before money can be paid out:
-- businesses with PACRA + director ID + test payment; families and individuals with NRC + test payment.
create table org_verifications (
  id            uuid primary key default gen_random_uuid(),
  org_id        uuid not null references organisations(id),
  kind          verification_kind not null,
  status        verification_status not null default 'PENDING',
  evidence_file text,        -- Cloud Storage object path (private bucket)
  checked_by    uuid references users(id),
  checked_at    timestamptz,
  note          text,
  created_at    timestamptz not null default now(),
  unique (org_id, kind)
);
create trigger org_verifications_audit after insert or update on org_verifications for each row execute function app.audit_row();

-- Organiser team roles: defaults per organisation, editable by the organisation admin.
-- Permission keys match src/lib/roles.ts in the web app. No organiser permission can
-- approve a settlement or payout: those exist only for platform finance staff.
create table org_roles (
  org_id       uuid not null references organisations(id),
  key          text not null check (key ~ '^[a-z_]+$'),
  name         text not null,
  permissions  text[] not null default '{}',
  is_default   boolean not null default true,
  primary key (org_id, key),
  check (not ('settlements.approve' = any (permissions)) and not ('payouts.approve' = any (permissions)))
);

create table org_members (
  org_id      uuid not null references organisations(id),
  user_id     uuid not null references users(id),
  role_key    text not null,
  status      text not null default 'ACTIVE' check (status in ('INVITED', 'ACTIVE', 'REMOVED')),
  invited_by  uuid references users(id),
  created_at  timestamptz not null default now(),
  primary key (org_id, user_id),
  foreign key (org_id, role_key) references org_roles(org_id, key)
);
create trigger org_members_audit after insert or update or delete on org_members for each row execute function app.audit_row();

-- EMS's own staff. A finance person must never also work for an organiser
-- (conflict of interest), so finance roles and organiser membership exclude each other.
create table platform_staff (
  user_id         uuid primary key references users(id),
  role            platform_role not null,
  approval_limit  bigint not null default 0 check (approval_limit >= 0),  -- ngwee; used when approving alone
  active          boolean not null default true,
  created_at      timestamptz not null default now()
);
create trigger platform_staff_audit after insert or update or delete on platform_staff for each row execute function app.audit_row();

create or replace function app.check_finance_not_member() returns trigger language plpgsql as $$
begin
  if tg_table_name = 'platform_staff' then
    if new.role in ('FINANCE_OFFICER', 'FINANCE_MANAGER', 'OWNER')
       and exists (select 1 from org_members m where m.user_id = new.user_id and m.status <> 'REMOVED') then
      raise exception 'A platform finance user cannot be a member of an organisation';
    end if;
  else
    if new.status <> 'REMOVED' and exists (select 1 from platform_staff p where p.user_id = new.user_id
          and p.active and p.role in ('FINANCE_OFFICER', 'FINANCE_MANAGER', 'OWNER')) then
      raise exception 'Platform finance staff cannot join an organisation';
    end if;
  end if;
  return new;
end $$;
create trigger platform_staff_conflict before insert or update on platform_staff for each row execute function app.check_finance_not_member();
create trigger org_members_conflict before insert or update on org_members for each row execute function app.check_finance_not_member();

-- Does the current user hold a permission in the current organisation?
create or replace function app.has_perm(p_perm text) returns boolean language sql stable security definer set search_path = public, app as $$
  select exists (
    select 1 from org_members m join org_roles r on r.org_id = m.org_id and r.key = m.role_key
    where m.user_id = app.user_id() and m.org_id = app.org_id() and m.status = 'ACTIVE'
      and p_perm = any (r.permissions));
$$;

-- Is the current user an active member of the current organisation?
create or replace function app.is_member() returns boolean language sql stable security definer set search_path = public, app as $$
  select exists (select 1 from org_members m where m.user_id = app.user_id() and m.org_id = app.org_id() and m.status = 'ACTIVE');
$$;

create table follows (
  user_id    uuid not null references users(id),
  org_id     uuid not null references organisations(id),
  created_at timestamptz not null default now(),
  primary key (user_id, org_id)
);

create table user_preferences (
  user_id        uuid primary key references users(id),
  interests      text[] not null default '{}',
  home_location  geography(point, 4326),
  radius_km      smallint not null default 25 check (radius_km between 1 and 500),
  alerts         jsonb not null default '{}',
  updated_at     timestamptz not null default now()
);

-- Marketing consent per organisation (campaigns need opt-in; event messages don't).
create table marketing_consents (
  user_id      uuid not null references users(id),
  org_id       uuid not null references organisations(id),
  opted_in_at  timestamptz,
  opted_out_at timestamptz,
  primary key (user_id, org_id)
);
