"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { LayoutGrid, Map as MapIcon, MapPin, Navigation, SlidersHorizontal, Video } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { Button, cx, EmptyState, Select } from "@/components/ui";
import { api, fromPrice } from "@/lib/api";
import { kwacha } from "@/lib/brand";

const cats = ["All", "Music", "Conference", "Church", "Sports", "Education", "Workshop", "Exhibition", "Charity", "Comedy"];
const radii = [5, 10, 25, 50, 100, 500];
const whenOpts = ["Any date", "This weekend", "Next 30 days", "Next 3 months"];

export default function Discover() {
  const all = api.events.discover();
  const [cat, setCat] = useState("All");
  const [radius, setRadius] = useState(500);
  const [q, setQ] = useState("");
  const [when, setWhen] = useState("Any date");
  const [maxPrice, setMaxPrice] = useState("Any price");
  const [freeOnly, setFreeOnly] = useState(false);
  const [view, setView] = useState<"grid" | "map">("grid");
  const [located, setLocated] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("category")) setCat(p.get("category")!);
    if (p.get("q")) setQ(p.get("q")!);
    if (p.get("near")) { setRadius(25); setView("map"); setLocated(true); }
  }, []);

  const list = useMemo(() => {
    const limits: Record<string, number> = { "Any date": 1e13, "This weekend": 14, "Next 30 days": 30, "Next 3 months": 92 };
    const now = new Date("2026-11-16T12:00:00+02:00").getTime();
    return all
      .filter((e) => cat === "All" || e.category === cat)
      .filter((e) => e.format === "Virtual" || e.distanceKm <= radius)
      .filter((e) => !q || `${e.title} ${e.subtitle} ${e.lineup?.join(" ")} ${e.city}`.toLowerCase().includes(q.toLowerCase()))
      .filter((e) => (new Date(e.start).getTime() - now) / 864e5 <= limits[when])
      .filter((e) => (freeOnly ? fromPrice(e) === 0 : maxPrice === "Any price" || fromPrice(e) <= Number(maxPrice.replace(/\D/g, ""))))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }, [all, cat, radius, q, when, maxPrice, freeOnly]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold">Discover events</h1>
          <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-3">
            <Navigation size={14} className="text-kafue" />
            {located ? "Using your location: Rhodes Park, Lusaka" : "Showing all of Zambia"}
            {!located && (
              <button onClick={() => { setLocated(true); setRadius(25); }} className="ml-1 font-semibold text-kafue hover:underline">Use my location</button>
            )}
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
          <button key={c} onClick={() => setCat(c)} className={cx("shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium", cat === c ? "border-ink bg-ink text-canvas" : "border-line bg-surface hover:border-ink-3")}>
            {c}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-3 rounded-xl border border-line bg-surface p-4 sm:grid-cols-2 lg:grid-cols-5">
        <label className="lg:col-span-2">
          <span className="sr-only">Search</span>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by event, artist or town" className="w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm focus:border-kafue focus:outline-none" />
        </label>
        <div>
          <span className="sr-only">Distance</span>
          <Select aria-label="Distance" value={radius === 500 ? "Anywhere" : `Within ${radius} km`} onChange={(e) => setRadius(e.target.value === "Anywhere" ? 500 : Number(e.target.value.replace(/\D/g, "")))} options={[...radii.slice(0, -1).map((r) => `Within ${r} km`), "Anywhere"]} />
        </div>
        <Select aria-label="Date" value={when} onChange={(e) => setWhen(e.target.value)} options={whenOpts} />
        <Select aria-label="Price" value={freeOnly ? "Free only" : maxPrice} onChange={(e) => { setFreeOnly(e.target.value === "Free only"); setMaxPrice(e.target.value === "Free only" ? "Any price" : e.target.value); }} options={["Any price", "Free only", "Up to K200", "Up to K500", "Up to K1500"]} />
      </div>

      <p className="mt-6 flex items-center gap-2 text-sm text-ink-3">
        <SlidersHorizontal size={14} /> {list.length} event{list.length === 1 ? "" : "s"}
      </p>

      {list.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No events match these filters" body="Try a wider distance or a different date range. Online events always show, wherever you are." action={<Button variant="secondary" onClick={() => { setCat("All"); setRadius(500); setWhen("Any date"); setQ(""); setMaxPrice("Any price"); setFreeOnly(false); }}>Clear filters</Button>} />
        </div>
      ) : view === "grid" ? (
        <div className="mt-4 grid gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {list.map((e) => <EventCard key={e.id} e={e} />)}
        </div>
      ) : (
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <MapView events={list} radius={radius} />
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
