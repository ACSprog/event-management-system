// Loads the showcase's sample data (src/lib/mock) into the database, so the database
// matches what the screens show. For local development and CI only: refused on production.
// Run as the owner role after migrations: npm run seed (DATABASE_URL must be set).
//
// IDs are deterministic (derived from the sample IDs), so running it twice is safe.

import { createHash } from "node:crypto";
import pg from "pg";
import * as dataMod from "../../src/lib/mock/data";
import * as dayMod from "../../src/lib/mock/event-day";
import * as rolesMod from "../../src/lib/roles";

// tsx loads these as CommonJS; take the named exports from wherever they are.
const pick = <T,>(m: unknown): T => ((m as { default?: T }).default ?? m) as T;
const data = pick<typeof import("../../src/lib/mock/data")>(dataMod);
const day = pick<typeof import("../../src/lib/mock/event-day")>(dayMod);
const roles = pick<typeof import("../../src/lib/roles")>(rolesMod);

const url = process.env.DATABASE_URL;
if (!url) { console.error("DATABASE_URL is not set"); process.exit(2); }
if (process.env.NODE_ENV === "production") { console.error("Refusing to seed sample data in production"); process.exit(2); }

const id = (key: string) => {
  const h = createHash("sha1").update(`ems-seed:${key}`).digest("hex");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-5${h.slice(13, 16)}-8${h.slice(17, 20)}-${h.slice(20, 32)}`;
};
const ngwee = (k: number) => Math.round(k * 100);
const enumOf = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "");

const orgType: Record<string, string> = { "Concert promoter": "PROMOTER", "Business association": "BUSINESS", Church: "CHURCH", "Training provider": "SCHOOL",
  "Sports organiser": "SPORTS", Charity: "CHARITY", Family: "FAMILY", "Comedy collective": "PROMOTER" };
const orgStatus: Record<string, string> = { Active: "ACTIVE", Trial: "ACTIVE", Pending: "PENDING", Suspended: "SUSPENDED" };
const eventStatus: Record<string, string> = { Draft: "DRAFT", "Pending approval": "PENDING_APPROVAL", Approved: "APPROVED", Published: "ON_SALE",
  "Registration open": "ON_SALE", "Sold out": "SOLD_OUT", "Registration closed": "ON_SALE", "In progress": "ON_SALE", Completed: "ENDED", Cancelled: "CANCELLED", Archived: "ARCHIVED" };
const audienceOf = (a?: string) => (a === "18+" ? "ADULTS_18" : a === "Family-friendly" ? "FAMILY_FRIENDLY" : "ALL_AGES");

const people = [
  { key: "chanda", name: "Chanda Mulenga", phone: "+260971234567", email: "chanda.mulenga@mail.example", gender: "FEMALE" },
  { key: "mwila", name: "Mwila Banda", phone: "+260961100100", email: "mwila@zedlive.example", gender: "MALE", org: "org1", role: "admin" },
  { key: "precious", name: "Precious Nyirenda", phone: "+260961100101", email: "precious@zedlive.example", gender: "FEMALE", org: "org1", role: "finance" },
  { key: "joseph", name: "Joseph Banda", phone: "+260971100201", gender: "MALE", org: "org1", role: "gate" },
  { key: "brian", name: "Brian Chanda", phone: "+260971100203", gender: "MALE", org: "org1", role: "gate" },
  { key: "pastor", name: "Pastor Daniel Phiri", phone: "+260977300300", gender: "MALE", org: "org3", role: "admin" },
  { key: "mwansa", name: "Esther Mwansa", phone: "+260955400400", gender: "FEMALE", org: "org8", role: "admin" },
  { key: "thandiwe", name: "Thandiwe Lungu", email: "thandiwe@ems.example", phone: "+260970000001", gender: "FEMALE", platform: "OWNER", limit: 0 },
  { key: "natasha", name: "Natasha Zulu", email: "natasha@ems.example", phone: "+260970000002", gender: "FEMALE", platform: "FINANCE_MANAGER", limit: 50_000 },
  { key: "bwalya", name: "Bwalya Phiri", email: "bwalya@ems.example", phone: "+260970000003", gender: "FEMALE", platform: "FINANCE_OFFICER", limit: 50_000 },
];

const client = new pg.Client({ connectionString: url });
await client.connect();
const q = (sql: string, params: unknown[] = []) => client.query(sql, params);

try {
  await q("begin");

  // Reference data
  for (const [code, name] of [["FREE", "Free"], ["STARTER", "Starter"], ["PROFESSIONAL", "Professional"], ["ENTERPRISE", "Enterprise"]])
    await q("insert into plans values ($1, $2) on conflict do nothing", [code, name]);
  // Placeholder prices until the cost model sets them.
  const pv = [["FREE", 0, 0, 500, 300], ["STARTER", 45_000, 450_000, 400, 200], ["PROFESSIONAL", 120_000, 1_200_000, 300, 200], ["ENTERPRISE", 0, 0, 250, 200]] as const;
  for (const [code, m, a, bp, fixed] of pv)
    await q("insert into plan_versions (id, plan_code, version, monthly_price, annual_price, fee_bp, fee_fixed) values ($1,$2,1,$3,$4,$5,$6) on conflict do nothing",
      [id(`plan:${code}`), code, m, a, bp, fixed]);
  for (const [code, name, guests, price] of [["BASIC", "Basic", 100, 75_000], ["STANDARD", "Standard", 300, 180_000], ["PREMIUM", "Premium", 1000, 450_000]] as const) {
    await q("insert into licence_packages values ($1, $2) on conflict do nothing", [code, name]);
    await q("insert into licence_package_versions (id, code, version, guests, price) values ($1,$2,1,$3,$4) on conflict do nothing", [id(`lic:${code}`), code, guests, price]);
  }
  await q("insert into addons values ('SMS_1000', '1,000 SMS credits', 35000), ('TEAM_SEAT', 'Extra team member', 15000) on conflict do nothing");
  for (const [d, n] of [["2026-12-25", "Christmas Day"], ["2027-01-01", "New Year's Day"], ["2026-10-24", "Independence Day"], ["2026-10-18", "National Day of Prayer"]])
    await q("insert into public_holidays values ($1, $2) on conflict do nothing", [d, n]);

  // People
  for (const p of people)
    await q("insert into users (id, name, phone, email, gender) values ($1,$2,$3,$4,$5) on conflict (id) do nothing",
      [id(`user:${p.key}`), p.name, p.phone ?? null, p.email ?? null, p.gender]);
  for (const p of people.filter((x) => x.platform))
    await q("insert into platform_staff (user_id, role, approval_limit) values ($1,$2,$3) on conflict do nothing", [id(`user:${p.key}`), p.platform, ngwee(p.limit ?? 0)]);
  await q(`insert into finance_settings (version, proposed_by, confirmed_by, confirmed_at) values (1, $1, $2, now()) on conflict do nothing`, [id("user:natasha"), id("user:bwalya")]);

  // Organisations, default team roles, members
  for (const o of data.organisations) {
    await q(`insert into organisations (id, slug, name, type, status, city, about, verified_at, created_at) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict (id) do nothing`,
      [id(`org:${o.id}`), o.slug, o.name, orgType[o.type] ?? "OTHER", orgStatus[o.status] ?? "PENDING", o.city, o.about, o.verified ? o.joined : null, o.joined]);
    for (const k of roles.roleOrder) {
      const r = roles.teamRoles[k];
      await q("insert into org_roles (org_id, key, name, permissions) values ($1,$2,$3,$4) on conflict do nothing", [id(`org:${o.id}`), k, r.label, r.perms]);
    }
    const plan = o.plan.toUpperCase();
    if (plan !== "FREE")
      await q(`insert into subscriptions (id, org_id, plan_version_id, period, status, current_period_end) values ($1,$2,$3,'ANNUAL',$4, now() + interval '200 days') on conflict do nothing`,
        [id(`sub:${o.id}`), id(`org:${o.id}`), id(`plan:${plan}`), o.status === "Trial" ? "TRIAL" : "ACTIVE"]);
  }
  for (const p of people.filter((x) => x.org))
    await q("insert into org_members (org_id, user_id, role_key) values ($1,$2,$3) on conflict do nothing", [id(`org:${p.org}`), id(`user:${p.key}`), p.role]);

  // Venues
  for (const v of data.venues)
    await q(`insert into venues (id, name, address, city, location, capacity) values ($1,$2,$3,$4, st_setsrid(st_makepoint($5,$6),4326)::geography, $7) on conflict (id) do nothing`,
      [id(`venue:${v.id}`), v.name, v.address, v.city, v.lng, v.lat, v.capacity]);

  // Events, ticket types, commercial terms, extras, stations
  const all = [...data.events, ...data.orgEventsExtra.filter((x) => !data.events.some((e) => e.id === x.id))];
  const plans = new Map(data.organisations.map((o) => [o.id, o.plan]));
  for (const e of all) {
    const s = day.setupFor(e.id);
    const status = eventStatus[e.status] ?? "DRAFT";
    const published = status === "DRAFT" || status === "PENDING_APPROVAL" ? null : e.start;
    const venue = data.venues.find((v) => v.id === e.venueId);
    await q(`insert into events (id, org_id, slug, title, subtitle, description, category, format, entry, listing, audience, seating, status, venue_id, location,
        starts_at, ends_at, rsvp, checkin_qr, meal_pass, reentry, menu_enabled, sales_tracking, palette, published_at)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14, case when $15::float8 is null then null else st_setsrid(st_makepoint($15,$16),4326)::geography end,
        $17,$18,$19,$20,$21,$22,$23,$24,$25,$26) on conflict (id) do nothing`,
      [id(`event:${e.id}`), id(`org:${e.orgId}`), e.slug, e.title, e.subtitle, e.description, enumOf(e.category), e.format.toUpperCase(), s.entry,
        e.listing === "Unlisted" ? "UNLISTED" : "PUBLIC", audienceOf(e.audience), e.seating.toUpperCase(), status, venue ? id(`venue:${venue.id}`) : null,
        venue?.lng ?? null, venue?.lat ?? null, e.start, e.end, !!s.rsvp, !!s.checkinQr, !!s.mealPass, !!s.reentry, !!s.menu, s.salesTracking ?? null, e.palette, published]);

    const free = s.entry === "OPEN" || e.tickets.every((t) => t.price === 0);
    const plan = plans.get(e.orgId) ?? "Free";
    const pvId = id(`plan:${plan.toUpperCase()}`);
    const fee = pv.find((p) => p[0] === plan.toUpperCase())!;
    await q(`insert into event_commercial_terms (event_id, arrangement, fee_bp, fee_fixed, plan_version_id, sales_tracking, sales_tracking_price, sales_tracking_bp, frozen_at)
      values ($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict do nothing`,
      [id(`event:${e.id}`), free ? "FREE_EVENT" : plan === "Free" ? "TICKET_FEE" : "SUBSCRIPTION", free ? 0 : fee[3], free ? 0 : fee[4] * 100, pvId,
        s.salesTracking ?? null, s.salesTracking === "PACKAGE" ? 45_000 : null, s.salesTracking === "COMMISSION" ? 300 : null, published]);

    for (const [i, t] of e.tickets.entries())
      await q(`insert into ticket_types (id, event_id, name, price, capacity, admits, max_per_order, who_can_buy, sort) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict do nothing`,
        [id(`tt:${t.id}`), id(`event:${e.id}`), t.name, ngwee(t.price), t.capacity, /table of (\d+)/i.exec(t.name)?.[1] ?? 1, t.perOrderLimit || 10, t.who ?? "Everyone", i]);

    for (const a of s.allowances ?? []) {
      await q(`insert into allowances (id, event_id, key, label, after_entry, sell_price) values ($1,$2,$3,$4,$5,$6) on conflict do nothing`,
        [id(`al:${e.id}:${a.key}`), id(`event:${e.id}`), a.key, a.label, !!a.afterEntry, s.sellExtras?.[a.key] ? ngwee(s.sellExtras[a.key]) : null]);
    }
    for (const [ticket, inc] of Object.entries(s.includes ?? {})) {
      const t = e.tickets.find((x) => x.name === ticket);
      if (!t) continue;
      for (const [key, qty] of Object.entries(inc))
        await q("insert into ticket_type_allowances values ($1,$2,$3) on conflict do nothing", [id(`tt:${t.id}`), id(`al:${e.id}:${key}`), qty]);
    }
    for (const st of s.stations)
      await q(`insert into stations (id, event_id, kind, label, allowance_id, point) values ($1,$2,$3,$4,$5,$6) on conflict do nothing`,
        [id(`st:${e.id}:${st.key}`), id(`event:${e.id}`), st.kind, st.label, st.allowance ? id(`al:${e.id}:${st.allowance}`) : null, st.kind === "ORDERS" ? st.label : null]);
  }

  // Food and merchandise: menu items with opening stock, restocks, sales and write-offs
  for (const [eventId, items] of Object.entries(day.menus)) {
    for (const [i, m] of items.entries()) {
      const itemId = id(`menu:${eventId}:${m.id}`);
      const ins = await q(`insert into menu_items (id, event_id, name, kind, price, point, art, note, adults_only, sort) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) on conflict do nothing returning id`,
        [itemId, id(`event:${eventId}`), m.name, m.kind.toUpperCase(), ngwee(m.price), m.point, m.art ? JSON.stringify(m.art) : null, m.note ?? null, /18\+/.test(m.note ?? ""), i]);
      if (!ins.rowCount) continue;
      const moves: [string, number, string | null][] = [["OPENING", m.opening, null]];
      if (m.restocked) moves.push(["RESTOCK", m.restocked, null]);
      if (m.sold) moves.push(["SALE", -m.sold, null]);
      if (m.writtenOff) moves.push(["WRITE_OFF", -m.writtenOff, "Damaged or spoiled (sample)"]);
      for (const [kind, qty, reason] of moves)
        await q("insert into stock_movements (item_id, kind, qty, reason, by_user) values ($1,$2,$3,$4,$5)", [itemId, kind, qty, reason, id("user:mwila")]);
    }
  }

  // Giving pages and funds
  for (const g of day.givingPages) {
    const orgKey = data.organisations.find((o) => o.slug === g.orgSlug)?.id;
    if (!orgKey) continue;
    const ev = g.eventSlug ? all.find((e) => e.slug === g.eventSlug) : undefined;
    await q(`insert into giving_pages (id, org_id, slug, kind, title, intro, event_id, palette, fee_bp) values ($1,$2,$3,$4,$5,$6,$7,$8,$9) on conflict do nothing`,
      [id(`give:${g.slug}`), id(`org:${orgKey}`), g.slug, g.kind, g.title, g.intro, ev ? id(`event:${ev.id}`) : null, g.palette, 250]);
    for (const [i, f] of g.funds.entries())
      await q("insert into giving_funds (id, page_id, key, label, sub, sort) values ($1,$2,$3,$4,$5,$6) on conflict do nothing",
        [id(`fund:${g.slug}:${f.key}`), id(`give:${g.slug}`), f.key, f.label, f.sub ?? null, i]);
  }

  await q("commit");
  const counts = await q(`select (select count(*) from organisations) orgs, (select count(*) from users) users, (select count(*) from events) events,
    (select count(*) from ticket_types) ticket_types, (select count(*) from menu_items) menu_items, (select count(*) from giving_pages) giving_pages`);
  console.log("Seeded:", counts.rows[0]);
} catch (e) {
  await q("rollback");
  console.error("Seed failed:", (e as Error).message);
  process.exitCode = 1;
} finally {
  await client.end();
}
