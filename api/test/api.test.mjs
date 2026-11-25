// API tests: start the built server against a migrated and seeded database (connecting as
// the restricted ems_api_login) and check the public endpoints and safety behaviour.
// Needs API_DATABASE_URL. Run: npm run build && npm test
import { spawn } from "node:child_process";
import { after, before, test } from "node:test";
import assert from "node:assert/strict";

const url = process.env.API_DATABASE_URL;
if (!url) throw new Error("API_DATABASE_URL is not set");
const port = 18000 + Math.floor(Math.random() * 1000);
const base = `http://127.0.0.1:${port}`;
let server;

before(async () => {
  server = spawn("node", ["dist/main.js"], { env: { ...process.env, DATABASE_URL: url, APP_ENV: "ci", PORT: String(port) }, stdio: "inherit" });
  for (let i = 0; i < 50; i++) {
    try { if ((await fetch(`${base}/health`)).ok) return; } catch {}
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("API did not start");
});
after(() => server?.kill());

const get = async (path) => { const r = await fetch(base + path); return { status: r.status, headers: r.headers, body: await r.json() }; };

test("health reports the database and migrations", async () => {
  const r = await get("/health");
  assert.equal(r.status, 200);
  assert.equal(r.body.status, "ok");
  assert.ok(r.body.migrations >= 14);
});

test("security headers are set and the framework is not advertised", async () => {
  const r = await get("/health");
  assert.ok(r.headers.get("content-security-policy"));
  assert.equal(r.headers.get("x-powered-by"), null);
});

test("discovery lists only public, upcoming, published events", async () => {
  const r = await get("/v1/events?limit=100");
  assert.equal(r.status, 200);
  assert.ok(r.body.events.length > 0);
  for (const e of r.body.events) {
    assert.ok(["APPROVED", "ON_SALE", "SOLD_OUT", "POSTPONED"].includes(e.status), `${e.slug} has status ${e.status}`);
    assert.ok(new Date(e.ends_at) > new Date(), `${e.slug} has ended`);
  }
  assert.ok(!r.body.events.some((e) => e.slug === "funeral-joseph-mwansa"), "unlisted events are not in discovery");
});

test("near-me search returns distances", async () => {
  const r = await get("/v1/events?lat=-15.41&lng=28.28&km=15&limit=50");
  assert.equal(r.status, 200);
  for (const e of r.body.events) assert.ok(e.distance_km <= 15);
});

test("an unlisted event opens by link; a draft does not", async () => {
  assert.equal((await get("/v1/events/funeral-joseph-mwansa")).status, 200);
  assert.equal((await get("/v1/events/copperbelt-nights-kitwe")).status, 404);
});

test("event detail includes tickets with what they include, prices in ngwee", async () => {
  const r = await get("/v1/events/lusaka-summer-jam-2026");
  assert.equal(r.status, 200);
  const vip = r.body.tickets.find((t) => t.name === "VIP");
  assert.ok(vip, "VIP ticket present");
  assert.match(vip.price, /^\d+$/);
  assert.ok(vip.includes.some((i) => i.label === "Dinner"));
});

test("bad input is rejected without internal details", async () => {
  const r = await get("/v1/events?category=NOT_A_CATEGORY");
  assert.equal(r.status, 400);
  assert.deepEqual(r.body.fields, ["category"]);
  const s = await get("/v1/events/Robert'); drop table users;--");
  assert.equal(s.status, 404);
});
