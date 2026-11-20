// Applies db/migrations/*.sql in order, each in its own transaction.
//
// * Connection comes from DATABASE_URL (never hard-coded; in Cloud SQL use Secret Manager
//   or IAM authentication). Run as the owner role, never as the API role.
// * Applied files are recorded with a SHA-256 checksum. If an applied migration is later
//   edited, the run stops: published migrations are never changed, a new one is added.
// * --reset drops and recreates the public and app schemas first (local and CI only;
//   refused when NODE_ENV=production or the URL is not localhost).
// * --check only reports pending migrations and checksum problems (used in CI).

import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const dir = join(dirname(fileURLToPath(import.meta.url)), "..", "migrations");
const url = process.env.DATABASE_URL;
if (!url) {
  console.error("DATABASE_URL is not set. Example: postgres://ems:ems@localhost:5432/ems_dev");
  process.exit(2);
}
const reset = process.argv.includes("--reset");
const check = process.argv.includes("--check");

const client = new pg.Client({ connectionString: url });
await client.connect();

try {
  if (reset) {
    const host = new URL(url).hostname;
    if (process.env.NODE_ENV === "production" || !["localhost", "127.0.0.1", "postgres"].includes(host)) {
      throw new Error("--reset is only allowed on a local or CI database");
    }
    await client.query("drop schema if exists public cascade; drop schema if exists app cascade; create schema public;");
    console.log("Reset: schemas dropped");
  }

  await client.query(`create table if not exists schema_migrations (
    filename text primary key, checksum text not null, applied_at timestamptz not null default now())`);

  const applied = new Map((await client.query("select filename, checksum from schema_migrations")).rows.map((r) => [r.filename, r.checksum]));
  const files = readdirSync(dir).filter((f) => /^\d{4}_[a-z0-9_]+\.sql$/.test(f)).sort();

  let pending = 0;
  for (const f of files) {
    const sql = readFileSync(join(dir, f), "utf8");
    const sum = createHash("sha256").update(sql).digest("hex");
    if (applied.has(f)) {
      if (applied.get(f) !== sum) throw new Error(`${f} was changed after it was applied. Add a new migration instead.`);
      continue;
    }
    pending++;
    if (check) { console.log(`pending: ${f}`); continue; }
    process.stdout.write(`applying ${f} ... `);
    await client.query("begin");
    try {
      await client.query(sql);
      await client.query("insert into schema_migrations (filename, checksum) values ($1, $2)", [f, sum]);
      await client.query("commit");
      console.log("ok");
    } catch (e) {
      await client.query("rollback");
      console.log("failed");
      throw new Error(`${f}: ${e.message}`);
    }
  }
  console.log(check ? `${pending} pending migration(s)` : pending ? `${pending} migration(s) applied` : "Database is up to date");
} catch (e) {
  console.error(e.message);
  process.exitCode = 1;
} finally {
  await client.end();
}
