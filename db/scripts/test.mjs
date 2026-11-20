// Runs db/tests/*.sql against a migrated and seeded database. Each file runs in its own
// transaction that is always rolled back, so tests never leave data behind.
// Helpers available to tests (temporary, per session):
//   pg_temp.ok(condition, message)         fails the test when condition is not true
//   pg_temp.expect_error(sql, fragment)    fails unless sql raises an error containing fragment
// Tests switch to the API role with "set local role ems_api" and app.set_context(...) to
// check row-level security exactly as the API will see it.

import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "tests");
const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is not set"); process.exit(2); }

const helpers = `
create or replace function pg_temp.ok(p_cond boolean, p_msg text) returns void language plpgsql as $$
begin
  if p_cond is not true then raise exception 'FAILED: %', p_msg; end if;
end $$;
create or replace function pg_temp.expect_error(p_sql text, p_fragment text) returns void language plpgsql as $$
begin
  begin
    execute p_sql;
    set constraints all immediate;   -- fire deferred checks (ledger balance, refund totals) now
    set constraints all deferred;
  exception when others then
    set constraints all deferred;
    if position(lower(p_fragment) in lower(sqlerrm)) = 0 then
      raise exception 'FAILED: expected an error containing "%", got "%"', p_fragment, sqlerrm;
    end if;
    return;
  end;
  raise exception 'FAILED: expected an error containing "%", but it succeeded: %', p_fragment, left(p_sql, 160);
end $$;
grant execute on function pg_temp.ok(boolean, text), pg_temp.expect_error(text, text) to ems_api;
`;

const client = new pg.Client({ connectionString: url });
await client.connect();
// The owner may switch to the API role inside tests.
await client.query("do $$ begin execute format('grant ems_api to %I', current_user); exception when others then null; end $$");

let failed = 0;
const files = readdirSync(dir).filter((f) => f.endsWith(".sql")).sort();
for (const f of files) {
  const sql = readFileSync(join(dir, f), "utf8");
  try {
    await client.query("begin");
    await client.query(helpers);
    await client.query(sql);
    console.log(`  ok    ${f}`);
  } catch (e) {
    failed++;
    console.log(`  FAIL  ${f}\n        ${e.message}`);
  } finally {
    await client.query("rollback");
  }
}
await client.end();
console.log(failed ? `\n${failed} of ${files.length} test file(s) failed` : `\nAll ${files.length} test files passed`);
process.exitCode = failed ? 1 : 0;
