import { BadRequestException, Controller, Get, NotFoundException, Param, Query } from "@nestjs/common";
import { z } from "zod";
import { ANONYMOUS, DbService } from "../db/db.service.js";

const categories = ["MUSIC", "NIGHTLIFE", "COMEDY", "ARTS_AND_THEATRE", "FILM", "FOOD_AND_DRINK", "FAMILY_AND_KIDS", "CHURCH", "WEDDING",
  "SPORTS", "FITNESS", "CONFERENCE", "BUSINESS", "TECHNOLOGY", "EDUCATION", "WORKSHOP", "EXHIBITION", "CHARITY"] as const;

const listQuery = z.object({
  q: z.string().trim().max(80).optional(),
  category: z.enum(categories).optional(),
  city: z.string().trim().max(60).optional(),
  when: z.enum(["now", "today", "tomorrow", "weekend", "this-week", "next-week", "this-month"]).optional(),
  lat: z.coerce.number().min(-90).max(90).optional(),
  lng: z.coerce.number().min(-180).max(180).optional(),
  km: z.coerce.number().min(1).max(500).default(25),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).max(10_000).default(0),
});

/** Date windows in Lusaka time (UTC+2, no daylight saving). */
const windows: Record<string, string> = {
  now: "e.starts_at <= now() and e.ends_at > now()",
  today: "e.starts_at < date_trunc('day', now() at time zone 'Africa/Lusaka') at time zone 'Africa/Lusaka' + interval '1 day' and e.ends_at > now()",
  tomorrow: "e.starts_at >= date_trunc('day', now() at time zone 'Africa/Lusaka') at time zone 'Africa/Lusaka' + interval '1 day' and e.starts_at < date_trunc('day', now() at time zone 'Africa/Lusaka') at time zone 'Africa/Lusaka' + interval '2 days'",
  weekend: "e.starts_at >= date_trunc('week', now() at time zone 'Africa/Lusaka') at time zone 'Africa/Lusaka' + interval '4 days 18 hours' and e.starts_at < date_trunc('week', now() at time zone 'Africa/Lusaka') at time zone 'Africa/Lusaka' + interval '7 days'",
  "this-week": "e.starts_at < date_trunc('week', now() at time zone 'Africa/Lusaka') at time zone 'Africa/Lusaka' + interval '7 days' and e.ends_at > now()",
  "next-week": "e.starts_at >= date_trunc('week', now() at time zone 'Africa/Lusaka') at time zone 'Africa/Lusaka' + interval '7 days' and e.starts_at < date_trunc('week', now() at time zone 'Africa/Lusaka') at time zone 'Africa/Lusaka' + interval '14 days'",
  "this-month": "e.starts_at < date_trunc('month', now() at time zone 'Africa/Lusaka') at time zone 'Africa/Lusaka' + interval '1 month' and e.ends_at > now()",
};

/**
 * Public event discovery (no sign-in needed). Row-level security already limits anonymous
 * requests to published events; discovery also leaves out unlisted ones (funerals, private
 * functions), which open only by link through GET /v1/events/:slug.
 * Money is returned in ngwee as strings (exact; K1 = 100).
 */
@Controller("v1/events")
export class EventsController {
  constructor(private readonly db: DbService) {}

  @Get()
  async list(@Query() query: Record<string, string>) {
    const parsed = listQuery.safeParse(query);
    if (!parsed.success) throw new BadRequestException({ message: "Invalid filters", fields: parsed.error.issues.map((i) => i.path.join(".")) });
    const f = parsed.data;
    const where: string[] = ["e.listing = 'PUBLIC'", "e.status in ('APPROVED', 'ON_SALE', 'SOLD_OUT', 'POSTPONED')", "e.ends_at > now()"];
    const params: unknown[] = [];
    const p = (v: unknown) => { params.push(v); return `$${params.length}`; };
    if (f.q) where.push(`(e.title ilike ${p(`%${f.q}%`)} or o.name ilike $${params.length} or v.name ilike $${params.length})`);
    if (f.category) where.push(`e.category = ${p(f.category)}`);
    if (f.city) where.push(`v.city ilike ${p(f.city)}`);
    if (f.when) where.push(windows[f.when]);
    let distance = "null::float8";
    if (f.lat !== undefined && f.lng !== undefined) {
      const point = `st_setsrid(st_makepoint(${p(f.lng)}, ${p(f.lat)}), 4326)::geography`;
      where.push(`st_dwithin(e.location, ${point}, ${p(f.km * 1000)})`);
      distance = `round((st_distance(e.location, ${point}) / 1000)::numeric, 1)::float8`;
    }
    const sql = `
      select e.id, e.slug, e.title, e.subtitle, e.category, e.format, e.entry, e.audience, e.status,
             e.starts_at, e.ends_at, e.palette, o.name as org_name, o.slug as org_slug,
             v.name as venue_name, v.city, ${distance} as distance_km,
             (select min(t.price) from ticket_types t where t.event_id = e.id)::text as from_price
      from events e
      join organisations o on o.id = e.org_id
      left join venues v on v.id = e.venue_id
      where ${where.join(" and ")}
      order by e.starts_at
      limit ${p(f.limit)} offset ${p(f.offset)}`;
    const rows = await this.db.withContext(ANONYMOUS, (c) => c.query(sql, params).then((r) => r.rows));
    return { events: rows, limit: f.limit, offset: f.offset };
  }

  @Get(":slug")
  async get(@Param("slug") slug: string) {
    if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(slug) || slug.length > 120) throw new NotFoundException();
    return this.db.withContext(ANONYMOUS, async (c) => {
      const e = (await c.query(`
        select e.id, e.slug, e.title, e.subtitle, e.description, e.category, e.format, e.entry, e.listing, e.audience, e.seating,
               e.status, e.starts_at, e.ends_at, e.timezone, e.palette, e.rsvp, e.checkin_qr, e.meal_pass, e.menu_enabled,
               json_build_object('name', o.name, 'slug', o.slug, 'city', o.city, 'verified', o.verified_at is not null) as organiser,
               case when v.id is null then null else json_build_object('name', v.name, 'address', v.address, 'city', v.city,
                 'lat', st_y(v.location::geometry), 'lng', st_x(v.location::geometry)) end as venue
        from events e join organisations o on o.id = e.org_id left join venues v on v.id = e.venue_id
        where e.slug = $1`, [slug])).rows[0];
      if (!e) throw new NotFoundException();
      const tickets = (await c.query(`
        select t.id, t.name, t.price::text, t.currency, t.admits, t.max_per_order, t.transferable, t.refundable, t.who_can_buy,
               (select coalesce(json_agg(json_build_object('label', a.label, 'qty', x.qty)), '[]') from ticket_type_allowances x
                  join allowances a on a.id = x.allowance_id where x.ticket_type_id = t.id) as includes
        from ticket_types t where t.event_id = $1 order by t.sort`, [e.id])).rows;
      const programme = (await c.query(`select title, stage, starts_at, ends_at, people from event_sessions where event_id = $1 order by starts_at, sort`, [e.id])).rows;
      return { ...e, tickets, programme };
    });
  }
}
