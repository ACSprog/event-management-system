"use client";

import { Badge, Card, PageHeader, SectionTitle, Stat } from "@/components/ui";
import { AreaTrend } from "@/components/ui/charts";

const latency = Array.from({ length: 24 }, (_, i) => ({ h: `${String(i).padStart(2, "0")}:00`, ms: 120 + Math.round(60 * Math.sin(i / 3)) + (i === 18 ? 140 : 0) }));
const services = [["API (Cloud Run, Johannesburg)", "Healthy", "6 instances"], ["PostgreSQL + PostGIS", "Healthy", "CPU 41%, 182 connections"], ["Redis (queues and holds)", "Healthy", "Memory 38%"], ["Background workers", "Healthy", "1,204 jobs waiting"], ["MTN MoMo adapter", "Healthy", "p95 confirm 41 s"], ["Airtel Money adapter", "Degraded", "Slow callbacks since 13:40"], ["SMS gateway", "Healthy", "Delivery 98.2%"], ["Push (Firebase)", "Healthy", "—"]];

export default function Health() {
  return (
    <>
      <PageHeader title="System health" sub="Region: africa-south1 (Johannesburg)" />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Uptime, 30 days" value="99.97%" />
        <Stat label="API p95" value="184 ms" />
        <Stat label="Error rate" value="0.08%" />
        <Stat label="Last backup" value="03:00" hint="point-in-time recovery on" />
      </div>
      <Card className="mt-6"><SectionTitle title="API response time today (p95, ms)" /><AreaTrend data={latency} x="h" y="ms" height={200} /></Card>
      <SectionTitle title="Services" />
      <div className="grid gap-3 md:grid-cols-2">{services.map(([n, s, d]) => <Card key={n} className="flex items-center justify-between"><div><p className="font-semibold">{n}</p><p className="text-sm text-ink-3">{d}</p></div><Badge tone={s === "Healthy" ? "green" : "gold"}>{s}</Badge></Card>)}</div>
    </>
  );
}
