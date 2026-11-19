"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Map as MapIcon, MapPin, Navigation, SlidersHorizontal, Video, X } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { Button, cx, EmptyState } from "@/components/ui";
import { api, fromPrice, sold, type EventItem } from "@/lib/api";
import { kwacha } from "@/lib/brand";
import { dateRangeLabels, overlaps, rangeFor, type DateRangeKey } from "@/lib/date-ranges";

const cats = ["All", "Music", "Nightlife", "Comedy", "Arts and theatre", "Film", "Food and drink", "Family and kids", "Church", "Sports", "Fitness", "Conference", "Business", "Technology", "Education", "Workshop", "Exhibition", "Charity"];
const radii = [5, 10, 25, 50, 100];
const dateKeys: DateRangeKey[] = ["any", "today", "tomorrow", "weekend", "this-week", "next-week", "this-month", "next-month", "custom"];
const sorts = { soonest: "Soonest first", nearest: "Nearest first", cheapest: "Lowest price", popular: "Most popular" } as const;
type SortKey = keyof typeof sorts;
type Format = "any" | "in-person" | "online";
type Audience = "any" | "Family-friendly" | "All ages" | "18+";

interface Filters {
  q: string; cat: string; when: DateRangeKey; from: string; to: string; format: Format; city: string; radius: number;
  free: boolean; min: string; max: string; audience: Audience; sort: SortKey;
}
const empty: Filters = { q: "", cat: "All", when: "any", from: "", to: "", format: "any", city: "All of Zambia", radius: 0, free: false, min: "", max: "", audience: "any", sort: "soonest" };

const isOnline = (e: EventItem) => e.format === "Virtual";
const hasOnline = (e: EventItem) => e.format !== "Physical";

/** Every filter except the date, so the date list can show how many events each option would give. */
function matchOthers(e: EventItem, f: Filters) {
  const price = fromPrice(e);
  const min = Number(f.min) || 0;
  const max = f.max === "" ? Infinity : Number(f.max);
  return (f.cat === "All" || e.category === f.cat)
    && (!f.q || `${e.title} ${e.subtitle} ${e.lineup?.join(" ") ?? ""} ${e.city} ${api.venues.get(e.venueId).name}`.toLowerCase().includes(f.q.toLowerCase()))
    && (f.format === "any" || (f.format === "online" ? hasOnline(e) : !isOnline(e)))
    && (f.city === "All of Zambia" || e.city === f.city || (isOnline(e) && f.format !== "in-person"))
    && (!f.radius || isOnline(e) || e.distanceKm <= f.radius)
    && (f.free ? price === 0 : price >= min && price <= max)
    && (f.audience === "any" || (e.audience ?? "All ages") === f.audience);
}

const label = "mb-1.5 block text-xs font-semibold uppercase tracking-wide text-ink-3";
const field = "w-full rounded-lg border border-line bg-canvas px-3 py-2 text-sm focus:border-kafue focus:outline-none";

export default function Discover() {
  const all = api.events.discover();
  const cities = ["All of Zambia", ...Array.from(new Set(all.filter((e) => !isOnline(e)).map((e) => e.city))).sort()];
  const [f, setF] = useState<Filters>(empty);
  const set = <K extends keyof Filters>(k: K, v: Filters[K]) => setF((x) => ({ ...x, [k]: v }));
  const [view, setView] = useState<"grid" | "map">("grid");
  const [located, setLocated] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Filters live in the address, so a filtered list can be shared on WhatsApp.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const next = { ...empty };
    (Object.keys(empty) as (keyof Filters)[]).forEach((k) => {
      const v = p.get(k === "cat" ? "category" : k);
      if (v === null) return;
      (next as Record<string, unknown>)[k] = k === "radius" ? Number(v) : k === "free" ? v === "1" : v;
    });
    // Read after hydration: the page is pre-rendered without the address's filters.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (p.get("near")) { next.radius = 25; setView("map"); setLocated(true); }
    setF(next);
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);
  useEffect(() => {
    const p = new URLSearchParams();
    (Object.keys(empty) as (keyof Filters)[]).forEach((k) => {
      if (f[k] !== empty[k]) p.set(k === "cat" ? "category" : k, k === "free" ? "1" : String(f[k]));
    });
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [f]);

  const base = useMemo(() => all.filter((e) => matchOthers(e, f)), [all, f]);
  const counts = useMemo(() => Object.fromEntries(dateKeys.map((k) => [k, base.filter((e) => overlaps(e.start, e.end, rangeFor(k, undefined, { from: f.from, to: f.to }))).length])) as Record<DateRangeKey, number>, [base, f.from, f.to]);
  const list = useMemo(() => {
    const r = rangeFor(f.when, undefined, { from: f.from, to: f.to });
    const out = base.filter((e) => overlaps(e.start, e.end, r));
    const by: Record<SortKey, (a: EventItem, b: EventItem) => number> = {
      soonest: (a, b) => +new Date(a.start) - +new Date(b.start),
      nearest: (a, b) => (isOnline(a) ? 1e6 : a.distanceKm) - (isOnline(b) ? 1e6 : b.distanceKm),
      cheapest: (a, b) => fromPrice(a) - fromPrice(b),
      popular: (a, b) => sold(b) - sold(a),
    };
    return out.sort(by[f.sort]);
  }, [base, f.when, f.from, f.to, f.sort]);

  const priceError = !f.free && f.min !== "" && f.max !== "" && Number(f.min) > Number(f.max) ? "Minimum is more than maximum" : "";
  const chips: [string, () => void][] = [
    ...(f.q ? [[`“${f.q}”`, () => set("q", "")] as [string, () => void]] : []),
    ...(f.cat !== "All" ? [[f.cat, () => set("cat", "All")] as [string, () => void]] : []),
    ...(f.when !== "any" ? [[f.when === "custom" ? `${f.from || "now"} to ${f.to || "any time"}` : dateRangeLabels[f.when], () => setF((x) => ({ ...x, when: "any", from: "", to: "" }))] as [string, () => void]] : []),
    ...(f.format !== "any" ? [[f.format === "online" ? "Online" : "In person", () => set("format", "any")] as [string, () => void]] : []),
    ...(f.city !== "All of Zambia" ? [[f.city, () => set("city", "All of Zambia")] as [string, () => void]] : []),
    ...(f.radius ? [[`Within ${f.radius} km`, () => set("radius", 0)] as [string, () => void]] : []),
    ...(f.free ? [["Free", () => set("free", false)] as [string, () => void]] : []),
    ...(!f.free && (f.min || f.max) ? [[`${f.min ? kwacha(+f.min) : "K0"} to ${f.max ? kwacha(+f.max) : "any"}`, () => setF((x) => ({ ...x, min: "", max: "" }))] as [string, () => void]] : []),
    ...(f.audience !== "any" ? [[f.audience, () => set("audience", "any")] as [string, () => void]] : []),
  ];

  const panel = (
    <div className="space-y-5">
      <div>
        <label htmlFor="q" className={label}>Keyword</label>
        <input id="q" value={f.q} onChange={(e) => set("q", e.target.value)} placeholder="Event, artist, venue or town" className={field} />
      </div>

      <fieldset>
        <legend className={label}>Date</legend>
        <div className="space-y-1">
          {dateKeys.map((k) => (
            <label key={k} className={cx("flex cursor-pointer items-center justify-between rounded-md px-2 py-1.5 text-sm hover:bg-surface-2", f.when === k && "bg-kafue-soft font-semibold", k !== "any" && k !== "custom" && counts[k] === 0 && "text-ink-3")}>
              <span className="flex items-center gap-2"><input type="radio" name="when" checked={f.when === k} onChange={() => set("when", k)} className="accent-[var(--color-kafue)]" /> {dateRangeLabels[k]}</span>
              {k !== "custom" && <span className="tabular-nums text-xs text-ink-3">{counts[k]}</span>}
            </label>
          ))}
        </div>
        {f.when === "custom" && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-xs text-ink-3">From<input type="date" value={f.from} min="2026-11-18" onChange={(e) => set("from", e.target.value)} className={cx(field, "mt-1")} /></label>
            <label className="text-xs text-ink-3">To<input type="date" value={f.to} min={f.from || "2026-11-18"} onChange={(e) => set("to", e.target.value)} className={cx(field, "mt-1")} /></label>
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className={label}>Where</legend>
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-line bg-canvas p-1 text-xs">
          {([["any", "Anywhere"], ["in-person", "In person"], ["online", "Online"]] as [Format, string][]).map(([k, t]) => (
            <button key={k} type="button" onClick={() => set("format", k)} aria-pressed={f.format === k} className={cx("rounded-md px-1 py-1.5 font-semibold", f.format === k ? "bg-ink text-canvas" : "text-ink-2")}>{t}</button>
          ))}
        </div>
        {f.format !== "online" && (
          <div className="mt-2 grid gap-2">
            <select aria-label="Town or city" value={f.city} onChange={(e) => set("city", e.target.value)} className={field}>{cities.map((c) => <option key={c}>{c}</option>)}</select>
            <select aria-label="Distance from you" value={f.radius} onChange={(e) => { set("radius", Number(e.target.value)); if (Number(e.target.value)) setLocated(true); }} className={field}>
              <option value={0}>Any distance</option>
              {radii.map((r) => <option key={r} value={r}>Within {r} km</option>)}
            </select>
          </div>
        )}
      </fieldset>

      <fieldset>
        <legend className={label}>Ticket price</legend>
        <label className="mb-2 flex items-center gap-2 text-sm"><input type="checkbox" checked={f.free} onChange={(e) => set("free", e.target.checked)} className="accent-[var(--color-kafue)]" /> Free events only</label>
        {!f.free && (
          <div className="grid grid-cols-2 gap-2">
            <label className="text-xs text-ink-3">Min (K)<input inputMode="numeric" value={f.min} onChange={(e) => set("min", e.target.value.replace(/\D/g, ""))} placeholder="0" className={cx(field, "mt-1")} /></label>
            <label className="text-xs text-ink-3">Max (K)<input inputMode="numeric" value={f.max} onChange={(e) => set("max", e.target.value.replace(/\D/g, ""))} placeholder="Any" className={cx(field, "mt-1")} /></label>
          </div>
        )}
        {priceError && <p className="mt-1 text-xs text-hibiscus">{priceError}</p>}
      </fieldset>

      <div>
        <label htmlFor="aud" className={label}>Audience</label>
        <select id="aud" value={f.audience} onChange={(e) => set("audience", e.target.value as Audience)} className={field}>
          <option value="any">Anyone</option>
          <option value="Family-friendly">Family-friendly</option>
          <option value="All ages">All ages</option>
          <option value="18+">18+ only</option>
        </select>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Discover events</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-3">
            <Navigation size={14} className="text-kafue" />
            {located ? "Using your location: Rhodes Park, Lusaka" : "Showing all of Zambia"}
            {!located && <button onClick={() => { setLocated(true); set("radius", 25); }} className="ml-1 font-semibold text-kafue hover:underline">Use my location</button>}
          </p>
        </div>
        <div className="flex rounded-lg border border-line bg-surface p-1">
          {(["grid", "map"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cx("flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium", view === v ? "bg-ink text-canvas" : "text-ink-2")}>
              {v === "grid" ? <LayoutGrid size={15} /> : <MapIcon size={15} />} {v === "grid" ? "List" : "Map"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-2 overflow-x-auto pb-1">
        {cats.map((c) => (
          <button key={c} onClick={() => set("cat", c)} className={cx("shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium", f.cat === c ? "border-ink bg-ink text-canvas" : "border-line bg-surface hover:border-ink-3")}>{c}</button>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[260px_1fr]">
        <div>
          <button onClick={() => setShowFilters(!showFilters)} aria-expanded={showFilters} className="flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-sm font-semibold lg:hidden">
            <span className="flex items-center gap-2"><SlidersHorizontal size={15} /> Filters</span>
            <span className="text-ink-3">{showFilters ? "Hide" : chips.length ? `${chips.length} active` : "None set"}</span>
          </button>
          <aside className={cx("mt-3 rounded-xl border border-line bg-surface p-4 lg:sticky lg:top-24 lg:mt-0 lg:block", showFilters ? "block" : "hidden")}>{panel}</aside>
        </div>

        <div className="min-w-0">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-ink-3"><span className="font-semibold text-ink">{list.length}</span> event{list.length === 1 ? "" : "s"} found</p>
            <label className="flex items-center gap-2 text-sm text-ink-3">Sort
              <select value={f.sort} onChange={(e) => set("sort", e.target.value as SortKey)} className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm text-ink">
                {(Object.keys(sorts) as SortKey[]).map((k) => <option key={k} value={k}>{sorts[k]}</option>)}
              </select>
            </label>
          </div>
          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {chips.map(([t, clear]) => (
                <button key={t} onClick={clear} className="flex items-center gap-1 rounded-full bg-kafue-soft px-3 py-1 text-xs font-semibold text-kafue-ink hover:opacity-80" aria-label={`Remove filter ${t}`}>{t} <X size={12} /></button>
              ))}
              <button onClick={() => { setF({ ...empty, sort: f.sort }); }} className="text-xs font-semibold text-kafue hover:underline">Clear all</button>
            </div>
          )}

          {list.length === 0 ? (
            <div className="mt-4">
              <EmptyState title="No events match these filters" body={f.when !== "any" && counts.any > 0 ? `${counts.any} event${counts.any === 1 ? "" : "s"} match if you choose any date.` : "Try a wider distance, another date or fewer filters."} action={<Button variant="secondary" onClick={() => setF({ ...empty, sort: f.sort })}>Clear filters</Button>} />
            </div>
          ) : view === "grid" ? (
            <div className="mt-4 grid gap-x-6 gap-y-10 sm:grid-cols-2 xl:grid-cols-3">
              {list.map((e) => <EventCard key={e.id} e={e} />)}
            </div>
          ) : (
            <div className="mt-4 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
              <MapView events={list} radius={f.radius || 500} />
              <ul className="max-h-[560px] space-y-2 overflow-y-auto">
                {list.filter((e) => e.format !== "Virtual" && e.distanceKm < 60).concat(list.filter((e) => e.format === "Virtual" || e.distanceKm >= 60)).map((e, i) => (
                  <li key={e.id}>
                    <Link href={`/events/${e.slug}/`} className="flex items-center gap-3 rounded-lg border border-line bg-surface px-4 py-3 hover:border-kafue">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-marigold text-xs font-bold text-[#2a1a00]">{e.format === "Virtual" ? <Video size={12} /> : e.distanceKm >= 60 ? <MapPin size={12} /> : i + 1}</span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">{e.title}</p>
                        <p className="text-sm text-ink-3">{e.format === "Virtual" ? "Online" : `${e.distanceKm} km away, ${e.city}`}</p>
                      </div>
                      <span className="shrink-0 text-sm font-semibold">{fromPrice(e) === 0 ? "Free" : kwacha(fromPrice(e))}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/** Schematic map. The production build swaps this for a real map provider (Google Maps or Mapbox) fed by PostGIS results. */
function MapView({ events, radius }: { events: ReturnType<typeof api.events.discover>; radius: number }) {
  const near = events.filter((e) => e.format !== "Virtual" && e.distanceKm < 60);
  const far = events.filter((e) => e.format !== "Virtual" && e.distanceKm >= 60);
  const r = Math.min(radius, 50);
  return (
    <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-[#e7efe9] dark:bg-[#18262a]">
      <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" aria-label="Map of events around Lusaka">
        <path d="M0 210 C80 190 140 230 220 200 S340 150 400 170" stroke="#b9d3e6" strokeWidth="10" fill="none" />
        <path d="M200 0 L205 300 M0 140 L400 150 M60 0 L250 300 M330 0 L150 300" stroke="var(--surface)" strokeOpacity=".8" strokeWidth="4" />
        <circle cx="200" cy="150" r={(r / 50) * 130} fill="var(--kafue)" fillOpacity=".08" stroke="var(--kafue)" strokeDasharray="4 4" />
        <circle cx="200" cy="150" r="6" fill="var(--kafue)" stroke="#fff" strokeWidth="2" />
        {near.map((e, i) => {
          const ang = (i * 137 + 20) % 360;
          const d = Math.min(1.25, e.distanceKm / r) * 130;
          const x = 200 + Math.cos((ang * Math.PI) / 180) * d;
          const y = 150 + Math.sin((ang * Math.PI) / 180) * d;
          return (
            <a key={e.id} href={`/events/${e.slug}/`}>
              <title>{e.title}, {e.distanceKm} km</title>
              <g transform={`translate(${x} ${y})`}>
                <path d="M0 0 C-9 -11 -9 -22 0 -24 C9 -22 9 -11 0 0Z" fill="var(--marigold)" stroke="#2a1a00" strokeWidth="1" />
                <text y="-12" textAnchor="middle" fontSize="10" fontWeight="700" fill="#2a1a00">{i + 1}</text>
              </g>
            </a>
          );
        })}
      </svg>
      <div className="absolute bottom-3 left-3 rounded-md bg-surface/95 px-3 py-2 text-xs shadow">
        <p className="font-semibold">You are here, Rhodes Park</p>
        <p className="text-ink-3">Circle shows {r} km. {far.length > 0 && `${far.length} more event${far.length > 1 ? "s" : ""} further away.`}</p>
      </div>
    </div>
  );
}
