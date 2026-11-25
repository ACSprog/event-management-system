// Creates or updates the API's database login (ems_api_login) as a plain member of ems_api.
// Run by the deploy pipeline as the owner, after migrations. The password comes from
// API_DB_PASSWORD (Secret Manager in the cloud) and is never printed.
// Fails if the login could bypass row-level security (superuser or BYPASSRLS).
import pg from "pg";

const url = process.env.DATABASE_URL;
const pw = process.env.API_DB_PASSWORD;
if (!url || !pw) { console.error("DATABASE_URL and API_DB_PASSWORD must be set"); process.exit(2); }
if (pw.length < 24) { console.error("API_DB_PASSWORD is too short"); process.exit(2); }

const c = new pg.Client({ connectionString: url });
await c.connect();
try {
  await c.query(`do $$ begin
    if not exists (select 1 from pg_roles where rolname = 'ems_api_login') then create role ems_api_login login; end if;
  end $$`);
  const { rows } = await c.query("select format('alter role ems_api_login with login password %L', $1::text) as sql", [pw]);
  await c.query(rows[0].sql);
  await c.query("grant ems_api to ems_api_login");
  const r = (await c.query("select rolsuper, rolbypassrls, rolcreaterole, rolcreatedb from pg_roles where rolname = 'ems_api_login'")).rows[0];
  if (r.rolsuper || r.rolbypassrls || r.rolcreaterole || r.rolcreatedb) throw new Error("ems_api_login has too many privileges");
  const owner = (await c.query("select count(*)::int as n from pg_auth_members m join pg_roles r on r.oid = m.roleid where m.member = (select oid from pg_roles where rolname = 'ems_api_login') and r.rolname <> 'ems_api'")).rows[0].n;
  if (owner) throw new Error("ems_api_login must belong only to ems_api");
  console.log("ems_api_login is ready (member of ems_api only, row-level security applies)");
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  await c.end();
}
