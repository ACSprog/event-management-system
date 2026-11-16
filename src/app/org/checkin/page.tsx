"use client";

import { useEffect, useState } from "react";
import { Radio, WifiOff } from "lucide-react";
import { Badge, Button, Card, PageHeader, Progress, SectionTitle, Stat } from "@/components/ui";
import { Bars } from "@/components/ui/charts";
import { api } from "@/lib/api";

export default function LiveCheckin() {
  const [n, setN] = useState(29_040);
  useEffect(() => { const t = setInterval(() => setN((x) => Math.min(31_160, x + Math.floor(Math.random() * 6))), 1200); return () => clearInterval(t); }, []);
  const gates = api.events.gates();
  return (
    <>
      <PageHeader title="Live check-in" sub="Lusaka Summer Jam, Heroes National Stadium" actions={<><Badge tone="red"><Radio size={12} /> Live</Badge><Button variant="secondary" href="/scan/">Open scanner</Button></>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card><p className="text-sm text-ink-3">Inside the venue</p><p className="font-display mt-1 text-4xl font-bold tabular-nums">{n.toLocaleString()}</p><Progress value={(n / 31_160) * 100} className="mt-3" /><p className="mt-1 text-xs text-ink-3">of 31,160 tickets sold</p></Card>
        <Stat label="Scans per minute" value="89" hint="peak 142 at 18:10" />
        <Stat label="Average scan time" value="0.4 s" hint="offline check on the phone" />
        <Stat label="Blocked" value="47" hint="31 already used, 12 cancelled, 4 fake" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <Card><SectionTitle title="Arrivals" /><Bars data={api.events.checkinSeries()} x="time" keys={["gateA", "gateB", "vip"]} labels={["Gate A", "Gate B", "VIP gate"]} stacked height={280} /></Card>
        <Card>
          <SectionTitle title="Gates" />
          <ul className="space-y-4">
            {gates.map((g, i) => (
              <li key={g.name}>
                <div className="flex justify-between text-sm"><span className="font-semibold">{g.name}</span><span className="text-ink-3">{g.rate}/min, {g.scanners} scanners</span></div>
                <Progress value={(g.scanned / 15000) * 100} className="mt-1.5" tone={i === 2 ? "marigold" : "kafue"} />
                {i === 1 && <p className="mt-1 flex items-center gap-1 text-xs text-[#a35f00] dark:text-marigold"><WifiOff size={12} /> Scanner #6 offline, checking locally. Last sync 2 min ago.</p>}
              </li>
            ))}
          </ul>
          <SectionTitle title="Incidents" />
          <ul className="space-y-2 text-sm">
            {api.events.incidents().map((x) => <li key={x.time} className="rounded-lg bg-surface-2 p-3"><p className="font-semibold">{x.time}, {x.gate}: {x.type}</p><p className="text-ink-2">{x.note}</p></li>)}
          </ul>
        </Card>
      </div>
    </>
  );
}
