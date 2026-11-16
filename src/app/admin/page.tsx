"use client";

import Link from "next/link";
import { Badge, Card, PageHeader, SectionTitle, Stat, Table } from "@/components/ui";
import { AreaTrend, Bars } from "@/components/ui/charts";
import { api, statusTone } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function AdminHome() {
  const series = api.platform.series();
  return (
    <>
      <PageHeader title="Platform overview" sub="All organisations, last 12 months" />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Organisations" value="571" delta="+38" hint="this month" />
        <Stat label="Ticket volume, November" value={kwacha(series[11].gmv)} delta="+19%" />
        <Stat label="Platform revenue, November" value={kwacha(series[11].fees + 412_000)} hint="fees + subscriptions" />
        <Stat label="Active customers, 30 days" value="186,400" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card><SectionTitle title="Ticket volume through the platform" /><AreaTrend data={series} x="month" y="gmv" money /></Card>
        <Card><SectionTitle title="Organisations on the platform" /><Bars data={series} x="month" keys={["orgs"]} labels={["Organisations"]} /></Card>
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div>
          <SectionTitle title="Organisations" action={<Link href="/admin/organisations/" className="text-sm font-semibold text-kafue">All</Link>} />
          <Table rows={api.orgs.list().slice(0, 5)} columns={[{ key: "name", label: "Organisation", render: (o) => <span className="font-semibold">{o.name}</span> }, { key: "plan", label: "Plan" }, { key: "revenue", label: "Sales, year", align: "right", render: (o) => kwacha(o.revenue) }, { key: "status", label: "Status", render: (o) => <Badge tone={statusTone[o.status]}>{o.status}</Badge> }]} />
        </div>
        <Card>
          <SectionTitle title="Right now" />
          <ul className="space-y-3 text-sm">
            <li className="flex justify-between"><span>Events live today</span><span className="font-semibold">14</span></li>
            <li className="flex justify-between"><span>Scanners online</span><span className="font-semibold">212</span></li>
            <li className="flex justify-between"><span>Payments in the last hour</span><span className="font-semibold">3,804</span></li>
            <li className="flex justify-between"><span>Payment success rate</span><span className="font-semibold text-leaf">96.9%</span></li>
            <li className="flex justify-between"><span>API response time (p95)</span><span className="font-semibold">184 ms</span></li>
            <li className="flex justify-between"><span>Notification queue</span><span className="font-semibold">1,204 waiting</span></li>
          </ul>
        </Card>
      </div>
    </>
  );
}
