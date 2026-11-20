-- 0001 Foundation: extensions, database roles, request context, shared triggers, audit log.
--
-- Security model (see db/README.md):
-- * Migrations run as the owner role (ems_owner). The API never connects as the owner.
-- * The API connects as a login role that is a member of ems_api. ems_api has only the
--   privileges granted in these migrations, and row-level security (RLS) applies to it.
-- * Every request sets its context with app.set_context() inside the transaction:
--   the signed-in user, the organisation being worked in (if any) and the platform
--   staff role (if any). Policies read the context; nothing is trusted from the client.
-- * Money, audit and journal tables are append-only (see app.forbid_change()).

create extension if not exists pgcrypto;
create extension if not exists citext;
create extension if not exists postgis;

create schema if not exists app;

-- Roles. NOLOGIN group roles; real login users are created per environment
-- (Cloud SQL IAM users or password users stored in Secret Manager) and granted these.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'ems_api') then
    create role ems_api nologin;
  end if;
  if not exists (select 1 from pg_roles where rolname = 'ems_readonly') then
    create role ems_readonly nologin; -- reporting (Metabase): read-only, still subject to RLS
  end if;
end $$;

grant usage on schema public, app to ems_api, ems_readonly;

-- Request context ------------------------------------------------------------

create or replace function app.set_context(p_user uuid, p_org uuid default null, p_platform_role text default null)
returns void language sql as $$
  select set_config('app.user_id', coalesce(p_user::text, ''), true),
         set_config('app.org_id', coalesce(p_org::text, ''), true),
         set_config('app.platform_role', coalesce(p_platform_role, ''), true);
$$;

create or replace function app.user_id() returns uuid language sql stable as
$$ select nullif(current_setting('app.user_id', true), '')::uuid $$;

create or replace function app.org_id() returns uuid language sql stable as
$$ select nullif(current_setting('app.org_id', true), '')::uuid $$;

create or replace function app.platform_role() returns text language sql stable as
$$ select nullif(current_setting('app.platform_role', true), '') $$;

create or replace function app.is_platform() returns boolean language sql stable as
$$ select app.platform_role() is not null $$;

create or replace function app.is_finance() returns boolean language sql stable as
$$ select app.platform_role() in ('OWNER', 'FINANCE_OFFICER', 'FINANCE_MANAGER') $$;

-- Shared trigger functions -----------------------------------------------------

create or replace function app.touch_updated_at() returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Append-only tables: corrections are new rows that reference what they correct.
create or replace function app.forbid_change() returns trigger language plpgsql as $$
begin
  raise exception '% is append-only: % is not allowed', tg_table_name, tg_op
    using errcode = 'insufficient_privilege';
end $$;

-- Audit log -----------------------------------------------------------------------

create table audit_log (
  id          bigint generated always as identity primary key,
  at          timestamptz not null default now(),
  actor_id    uuid,
  platform_role text,
  org_id      uuid,
  action      text not null,
  entity      text not null,
  entity_id   text,
  before      jsonb,
  after       jsonb,
  ip          inet
);
create index audit_log_entity on audit_log (entity, entity_id);
create index audit_log_org_at on audit_log (org_id, at desc);
create trigger audit_log_append_only before update or delete on audit_log
  for each row execute function app.forbid_change();

-- Generic row audit for sensitive tables: records who changed what, with before/after.
create or replace function app.audit_row() returns trigger language plpgsql security definer set search_path = public, app as $$
declare
  v_id text;
  v_org uuid;
  v_new jsonb := case when tg_op <> 'DELETE' then to_jsonb(new) end;
  v_old jsonb := case when tg_op <> 'INSERT' then to_jsonb(old) end;
begin
  v_id := coalesce(v_new ->> 'id', v_old ->> 'id');
  v_org := nullif(coalesce(v_new ->> 'org_id', v_old ->> 'org_id'), '')::uuid;
  insert into audit_log (actor_id, platform_role, org_id, action, entity, entity_id, before, after)
  values (app.user_id(), app.platform_role(), v_org, tg_op, tg_table_name, v_id, v_old, v_new);
  return coalesce(new, old);
end $$;

-- Read access to the audit log: platform staff, and an organisation's own entries.
alter table audit_log enable row level security;
alter table audit_log force row level security;
create policy audit_read on audit_log for select to ems_api, ems_readonly
  using (app.is_platform() or (org_id is not null and org_id = app.org_id()));
grant select on audit_log to ems_api, ems_readonly;
