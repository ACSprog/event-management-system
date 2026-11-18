"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { Check, Crosshair, Link2, Loader2, MapPin, Search, Hash } from "lucide-react";
import { Badge, Button, Field, Input, Textarea, cx } from "@/components/ui";
import { api } from "@/lib/api";
import { lusaka, nearestTown, parseMapLink, parsePlusCode, plusCodeFor, type EventLocation, type LocationSource } from "@/lib/location";

const PinMap = dynamic(() => import("@/components/pin-map"), { ssr: false, loading: () => <div className="flex h-[280px] items-center justify-center rounded-lg border border-line bg-surface-2 text-sm text-ink-3">Loading map…</div> });

const tabs: { key: LocationSource; label: string; icon: typeof Link2 }[] = [
  { key: "LINK", label: "Paste a link", icon: Link2 },
  { key: "PIN", label: "Pick on map", icon: MapPin },
  { key: "SEARCH", label: "Search", icon: Search },
  { key: "CURRENT", label: "My location", icon: Crosshair },
  { key: "PLUS_CODE", label: "Plus code", icon: Hash },
];

type Draft = { lat: number; lng: number; name: string; placeId?: string; source: LocationSource; note?: string };

/**
 * Where the event happens. Five ways in, one result: the organiser always sees
 * the pin on a map and confirms "Is this the right place?" before it is saved.
 */
export function LocationPicker({ value, onChange }: { value: EventLocation | null; onChange: (l: EventLocation | null) => void }) {
  const [tab, setTab] = useState<LocationSource>("LINK");
  const [draft, setDraft] = useState<Draft | null>(value ? { lat: value.lat, lng: value.lng, name: value.name, placeId: value.placeId, source: value.source } : null);
  const [directions, setDirections] = useState(value?.directions ?? "");
  const [privateHome, setPrivateHome] = useState(value?.privateHome ?? false);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [link, setLink] = useState("");
  const [code, setCode] = useState("");
  const [q, setQ] = useState("");

  const propose = (d: Draft) => {
    setErr("");
    // A different place (more than ~200 m away) gets fresh directions, so old landmarks don't carry over.
    if (draft && Math.hypot(d.lat - draft.lat, (d.lng - draft.lng) * Math.cos((d.lat * Math.PI) / 180)) > 0.002) { setDirections(""); setPrivateHome(false); }
    setDraft(d);
    if (value) onChange(null);
  };
  const moveTo = (lat: number, lng: number) => propose({ ...(draft ?? { name: "", source: "PIN" as const }), lat, lng, placeId: undefined, source: draft?.source === "PIN" || !draft ? "PIN" : draft.source });

  const readLink = async () => {
    const r = parseMapLink(link);
    if (r.kind === "ok") return propose({ lat: r.lat, lng: r.lng, name: r.name ?? "", placeId: r.placeId, source: "LINK" });
    if (r.kind === "short") {
      setBusy(true);
      const s = await api.location.resolveShortLink(r.url);
      setBusy(false);
      return propose({ lat: s.lat, lng: s.lng, name: s.name, placeId: s.placeId, source: "LINK", note: "Preview: short links are opened by the EMS server. Every short link shows the same sample place here." });
    }
    if (r.kind === "name-only") { setQ(r.name); setTab("SEARCH"); return setErr(`That link only has a name ("${r.name}"), not a pin. Pick it from the search results below, or drop a pin.`); }
    const pc = parsePlusCode(link);
    if (pc) return propose({ lat: pc.lat, lng: pc.lng, name: "", source: "PLUS_CODE" });
    setErr("That doesn't look like a map link. Paste a Google Maps or Apple Maps link, a plus code, or coordinates like -15.4093, 28.2871.");
  };

  const readCode = () => {
    const pc = parsePlusCode(code, draft ?? lusaka);
    if (!pc) return setErr("Enter a plus code such as H7RP+7R Lusaka. You'll find it in Google Maps under the place's address.");
    propose({ lat: pc.lat, lng: pc.lng, name: "", source: "PLUS_CODE" });
  };

  const useMine = () => {
    if (!("geolocation" in navigator)) return setErr("This device can't share its location. Drop a pin instead.");
    setBusy(true);
    navigator.geolocation.getCurrentPosition(
      (p) => { setBusy(false); propose({ lat: p.coords.latitude, lng: p.coords.longitude, name: "", source: "CURRENT", note: p.coords.accuracy > 50 ? `Accurate to about ${Math.round(p.coords.accuracy)} m. Drag the pin to the exact gate if needed.` : undefined }); },
      (e) => { setBusy(false); setErr(e.code === e.PERMISSION_DENIED ? "Location permission was refused. Allow it in your browser, or drop a pin instead." : "Couldn't get your location. Try again outside, or drop a pin."); },
      { enableHighAccuracy: true, timeout: 15_000 }
    );
  };

  const confirm = () => {
    if (!draft) return;
    if (!draft.name.trim()) return setErr("Give the place a name, such as \"Mwaba's garden, Kabulonga\".");
    onChange({ lat: draft.lat, lng: draft.lng, name: draft.name.trim(), area: nearestTown(draft), placeId: draft.placeId, source: draft.source, directions: directions.trim(), privateHome });
  };

  const results = api.location.search(q);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label="How to set the location">
        {tabs.map((t) => (
          <button key={t.key} type="button" role="tab" aria-selected={tab === t.key} onClick={() => { setTab(t.key); setErr(""); if (t.key === "PIN" && !draft) propose({ ...lusaka, name: "", source: "PIN" }); }}
            className={cx("flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium", tab === t.key ? "border-kafue bg-kafue text-white" : "border-line bg-surface text-ink-2 hover:border-kafue")}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {tab === "LINK" && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1"><Field label="Map link" hint="A Google Maps link, including maps.app.goo.gl links from WhatsApp, an Apple Maps link, or coordinates"><Input value={link} onChange={(e) => setLink(e.target.value)} placeholder="https://maps.app.goo.gl/…" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), readLink())} /></Field></div>
          <Button type="button" onClick={readLink} disabled={!link.trim() || busy}>{busy ? <Loader2 size={16} className="animate-spin" /> : null} Find it</Button>
        </div>
      )}
      {tab === "PIN" && <p className="text-sm text-ink-2">Tap the map or drag the pin to the exact gate or entrance. This works for gardens, farms and homes that aren&rsquo;t on any map.</p>}
      {tab === "SEARCH" && (
        <div className="space-y-2">
          <Field label="Search places" hint="Places other organisers have used on Eventra. In the live system, Google results appear underneath."><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="e.g. Kabulonga, conference, wedding garden" /></Field>
          <ul className="max-h-60 divide-y divide-line overflow-y-auto rounded-lg border border-line">
            {results.length === 0 && <li className="px-3 py-3 text-sm text-ink-3">Nothing found. Try another word, or drop a pin.</li>}
            {results.map((p) => (
              <li key={p.id}>
                <button type="button" onClick={() => { propose({ lat: p.lat, lng: p.lng, name: p.name, source: "SEARCH" }); if (p.directions && !directions) setDirections(p.directions); }} className="flex w-full items-start gap-3 px-3 py-2.5 text-left hover:bg-surface-2">
                  <MapPin size={16} className="mt-0.5 shrink-0 text-kafue" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold">{p.name}</span>
                    <span className="block text-xs text-ink-3">{p.area} · used for {p.eventsHosted} events on Eventra ({p.eventTypes.join(", ")}){p.largestCheckIn ? ` · largest: ${p.largestCheckIn.toLocaleString()} checked in` : ""}</span>
                  </span>
                  {!p.onGoogle && <Badge tone="teal">Not on Google</Badge>}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
      {tab === "CURRENT" && (
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" onClick={useMine} disabled={busy}>{busy ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />} Use where I am now</Button>
          <p className="text-sm text-ink-3">Handy when you&rsquo;re standing at the venue. Your browser will ask first.</p>
        </div>
      )}
      {tab === "PLUS_CODE" && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <div className="flex-1"><Field label="Plus code" hint="Shown in Google Maps under a place's address, e.g. H7RP+7R Lusaka"><Input value={code} onChange={(e) => setCode(e.target.value)} placeholder="H7RP+7R Lusaka" onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), readCode())} /></Field></div>
          <Button type="button" onClick={readCode} disabled={!code.trim()}>Find it</Button>
        </div>
      )}

      {err && <p className="text-sm text-hibiscus">{err}</p>}

      {draft && (
        <div className="space-y-3 rounded-xl border border-line bg-surface-2 p-4">
          <p className="font-semibold">{value ? "Location saved" : "Is this the right place?"}</p>
          <PinMap lat={draft.lat} lng={draft.lng} onMove={moveTo} />
          <p className="text-xs text-ink-3">{nearestTown(draft)} · {plusCodeFor(draft.lat, draft.lng)} · {draft.lat.toFixed(5)}, {draft.lng.toFixed(5)}. Drag the pin to fine-tune.</p>
          {draft.note && <p className="rounded-lg bg-marigold-soft px-3 py-2 text-xs">{draft.note}</p>}
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Place name, as guests should see it"><Input value={draft.name} onChange={(e) => { setDraft({ ...draft, name: e.target.value }); if (value) onChange(null); }} placeholder="e.g. Mwaba's garden, Kabulonga" /></Field>
            <Field label="Directions in your own words" hint="Landmarks, gate colour, where to park"><Textarea rows={2} value={directions} onChange={(e) => { setDirections(e.target.value); if (value) onChange(null); }} placeholder="Opposite Shoprite, turn left after the green gate. Parking behind the church." /></Field>
          </div>
          <label className="flex items-start gap-2 text-sm">
            <input type="checkbox" checked={privateHome} onChange={(e) => { setPrivateHome(e.target.checked); if (value) onChange(null); }} className="mt-1 accent-[var(--color-kafue)]" />
            <span>This is a private home. Only invited guests and ticket holders see the exact pin and directions; everyone else sees &ldquo;{nearestTown(draft)}&rdquo;. It&rsquo;s never suggested to other organisers.</span>
          </label>
          {value ? <p className="flex items-center gap-1.5 text-sm font-semibold text-leaf"><Check size={16} /> Saved for this event</p> : <Button type="button" onClick={confirm}><Check size={16} /> Yes, use this place</Button>}
        </div>
      )}
    </div>
  );
}
