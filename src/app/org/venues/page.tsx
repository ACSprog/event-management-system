"use client";

import { useState } from "react";
import { MapPin, Plus, Star } from "lucide-react";
import { Badge, Button, Card, cx, PageHeader, SectionTitle, Tabs, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

const tools = ["Seat row", "Table of 8", "Table of 10", "Booth 3×3", "Stage", "Bar", "Gate"];

export default function Venues() {
  const toast = useToast();
  const [tab, setTab] = useState("Venues");
  const [tool, setTool] = useState("Table of 10");
  const [items, setItems] = useState<{ x: number; y: number; kind: string }[]>([
    { x: 40, y: 8, kind: "Stage" }, ...Array.from({ length: 12 }, (_, i) => ({ x: 14 + (i % 4) * 22, y: 32 + Math.floor(i / 4) * 20, kind: i < 4 ? "Table of 8" : "Table of 10" })), { x: 86, y: 88, kind: "Bar" }, { x: 4, y: 88, kind: "Gate" },
  ]);
  return (
    <>
      <PageHeader title="Venues and seating" actions={<Button><Plus size={15} /> Add venue</Button>} />
      <Tabs tabs={["Venues", "Floor plan editor", "Bookings"]} value={tab} onChange={setTab} />
      {tab === "Venues" && (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {api.venues.list().map((v) => (
            <Card key={v.id}>
              <div className="flex items-start justify-between"><p className="font-semibold">{v.name}</p><span className="flex items-center gap-1 text-sm"><Star size={13} className="fill-marigold text-marigold" />{v.rating}</span></div>
              <p className="flex items-center gap-1 text-sm text-ink-3"><MapPin size={13} />{v.address}</p>
              <p className="mt-3 text-sm"><span className="font-semibold">{v.capacity.toLocaleString()}</span> capacity, {v.dayRate ? `${kwacha(v.dayRate)} a day` : "own venue"}</p>
              <div className="mt-3 flex flex-wrap gap-1">{v.facilities.slice(0, 4).map((f) => <Badge key={f}>{f}</Badge>)}</div>
              <p className="mt-3 text-xs text-ink-3">Rooms: {v.rooms.map((r) => `${r.name} (${r.capacity.toLocaleString()})`).join(", ")}</p>
              <div className="mt-4 flex gap-2"><Button size="sm" variant="secondary" onClick={() => setTab("Floor plan editor")}>Floor plans</Button><Button size="sm" variant="ghost" onClick={() => toast(`Availability request sent to ${v.name}`)}>Check availability</Button></div>
            </Card>
          ))}
        </div>
      )}
      {tab === "Floor plan editor" && (
        <div className="grid gap-6 xl:grid-cols-[220px_1fr]">
          <Card>
            <SectionTitle title="Add to plan" sub="Click the plan to place" />
            <div className="space-y-1.5">{tools.map((t) => <button key={t} onClick={() => setTool(t)} className={cx("block w-full rounded-lg border-2 px-3 py-2 text-left text-sm font-medium", tool === t ? "border-kafue bg-kafue-soft" : "border-line")}>{t}</button>)}</div>
            <div className="mt-5 space-y-1 text-sm">
              <p className="flex justify-between"><span className="text-ink-3">Tables</span><span className="font-semibold">{items.filter((i) => i.kind.startsWith("Table")).length}</span></p>
              <p className="flex justify-between"><span className="text-ink-3">Seats</span><span className="font-semibold">{items.reduce((a, i) => a + (i.kind === "Table of 8" ? 8 : i.kind === "Table of 10" ? 10 : i.kind === "Seat row" ? 12 : 0), 0)}</span></p>
            </div>
            <Button className="mt-4 w-full" onClick={() => toast("Floor plan saved and linked to ticket types")}>Save plan</Button>
            <Button className="mt-2 w-full" variant="ghost" onClick={() => setItems([])}>Clear</Button>
          </Card>
          <Card>
            <SectionTitle title="Hope Charity Gala: Riverside lawn" sub="Click to place, click an item to remove it" />
            <div className="relative aspect-[16/10] cursor-crosshair rounded-lg border border-line bg-[repeating-linear-gradient(0deg,var(--surface-2)_0_1px,transparent_1px_24px),repeating-linear-gradient(90deg,var(--surface-2)_0_1px,transparent_1px_24px)]"
              onClick={(ev) => { const r = ev.currentTarget.getBoundingClientRect(); setItems([...items, { x: ((ev.clientX - r.left) / r.width) * 100, y: ((ev.clientY - r.top) / r.height) * 100, kind: tool }]); }}>
              {items.map((it, i) => (
                <button key={i} onClick={(ev) => { ev.stopPropagation(); setItems(items.filter((_, j) => j !== i)); }}
                  className={cx("absolute -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold", it.kind.startsWith("Table") ? "flex h-12 w-12 items-center justify-center rounded-full border-2 border-kafue bg-kafue-soft text-kafue-ink" : it.kind === "Stage" ? "h-10 w-48 rounded bg-ink text-canvas" : it.kind === "Booth 3×3" ? "h-10 w-10 border-2 border-marigold bg-marigold-soft" : it.kind === "Seat row" ? "h-4 w-28 rounded bg-kafue/30" : "rounded bg-surface-2 px-2 py-1 ring-1 ring-line")}
                  style={{ left: `${it.x}%`, top: `${it.y}%` }} aria-label={`Remove ${it.kind}`}>
                  {it.kind.startsWith("Table") ? `T${items.slice(0, i + 1).filter((x) => x.kind.startsWith("Table")).length}` : it.kind === "Seat row" ? "" : it.kind}
                </button>
              ))}
            </div>
          </Card>
        </div>
      )}
      {tab === "Bookings" && (
        <div className="space-y-3">
          {api.venues.bookings().map((b) => (
            <Card key={b.event} className="flex flex-wrap items-center justify-between gap-3">
              <div><p className="font-semibold">{b.event}</p><p className="text-sm text-ink-3">{b.venue}, {b.dates}</p></div>
              <div className="flex items-center gap-3"><span className="font-semibold">{kwacha(b.amount)}</span><Badge tone={b.status === "Confirmed" ? "green" : b.status === "Requested" ? "gold" : "teal"}>{b.status}</Badge></div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
