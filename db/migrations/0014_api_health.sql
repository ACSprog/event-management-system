-- 0014 Let the API role read which migrations are applied (for GET /health).
-- schema_migrations is created by the migration runner, so it exists before this file runs.
grant select on schema_migrations to ems_api;
alter table schema_migrations enable row level security;
create policy api_read on schema_migrations for select to ems_api using (true);
