-- Every table must have row-level security switched on, forced, and at least one policy
-- besides the owner's. A new table without policies fails this test.
do $$
declare v_missing text;
begin
  select string_agg(c.relname, ', ') into v_missing
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'r' and c.relname not in ('spatial_ref_sys', 'schema_migrations')
    and (not c.relrowsecurity or not c.relforcerowsecurity
         or not exists (select 1 from pg_policy p where p.polrelid = c.oid and p.polname <> 'owner_all'));
  perform pg_temp.ok(v_missing is null, 'tables without row-level security policies: ' || coalesce(v_missing, ''));
  -- Views must run with the caller's rights so RLS applies through them.
  select string_agg(c.relname, ', ') into v_missing
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public' and c.relkind = 'v' and c.relname not in ('geography_columns', 'geometry_columns')
    and not coalesce('security_invoker=true' = any (c.reloptions), false);
  perform pg_temp.ok(v_missing is null, 'views without security_invoker: ' || coalesce(v_missing, ''));
end $$;
