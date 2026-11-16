"use client";

import Link from "next/link";
import { Download } from "lucide-react";
import { Button, Card, PageHeader, SectionTitle, Stat, Table } from "@/components/ui";
import { Lines } from "@/components/ui/charts";
import { kwacha } from "@/lib/brand";

const months = ["Jun", "Jul", "Aug", "Sep", "Oct", "Nov"].map((m, i) => ({ month: m, income: [1.2, 1.6, 4.9, 1.4, 2.3, 4.6][i] * 1e6, costs: [0.8, 0.9, 3.1, 1.0, 1.5, 1.2][i] * 1e6 }));

export default function Finance() {
  const pnl = [
    { line: "Ticket sales", amount: 14_211_400 }, { line: "Sponsorship", amount: 1_620_000 }, { line: "Membership", amount: 1_097_400 },
    { line: "Platform and payment fees", amount: -497_400 }, { line: "Refunds", amount: -214_900 }, { line: "Artist fees", amount: -4_280_000 },
    { line: "Venues", amount: -1_142_000 }, { line: "Production, sound and security", amount: -2_386_500 }, { line: "Marketing", amount: -412_300 },
  ];
  const net = pnl.reduce((a, l) => a + l.amount, 0);
  return (
    <>
      <PageHeader title="Finance overview" sub="Year to date, 1 Jan to 16 Nov 2026" actions={<><Button variant="secondary"><Download size={15} /> Export to Excel</Button><Button variant="secondary">Download PDF</Button></>} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Income" value={kwacha(16_928_800)} delta="+42%" hint="vs 2025" />
        <Stat label="Costs" value={kwacha(8_933_100)} />
        <Stat label="Net profit" value={kwacha(net)} hint={`${Math.round((net / 16_928_800) * 100)}% margin`} />
        <Stat label="Available for payout" value={kwacha(1_284_220)} hint="after the refund window closes" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <Card><SectionTitle title="Income and costs by month" /><Lines data={months} x="month" keys={["income", "costs"]} labels={["Income", "Costs"]} /></Card>
        <Card pad={false}>
          <div className="p-5 pb-0"><SectionTitle title="Profit and loss" /></div>
          <ul className="divide-y divide-line text-sm">
            {pnl.map((l) => <li key={l.line} className="flex justify-between px-5 py-2.5"><span>{l.line}</span><span className={l.amount < 0 ? "tabular-nums text-ink-2" : "tabular-nums font-semibold"}>{l.amount < 0 ? `(${kwacha(-l.amount)})` : kwacha(l.amount)}</span></li>)}
            <li className="flex justify-between bg-surface-2 px-5 py-3 font-semibold"><span>Net profit</span><span className="tabular-nums">{kwacha(net)}</span></li>
          </ul>
        </Card>
      </div>
      <SectionTitle title="Profit by event" />
      <Table rows={[
        { event: "Lusaka July Fest", income: 4_920_000, costs: 3_080_000 }, { event: "Zed Live Sessions: October", income: 1_041_000, costs: 512_000 },
        { event: "Lusaka Summer Jam (to date)", income: 6_398_000, costs: 1_201_400 }, { event: "Copperbelt Nights: Ndola", income: 1_210_000, costs: 1_330_000 },
      ]} columns={[
        { key: "event", label: "Event", render: (r) => <Link href="/org/events/lusaka-summer-jam-2026/" className="font-semibold hover:underline">{r.event}</Link> },
        { key: "income", label: "Income", align: "right", render: (r) => kwacha(r.income) }, { key: "costs", label: "Costs", align: "right", render: (r) => kwacha(r.costs) },
        { key: "p", label: "Profit", align: "right", render: (r) => <span className={r.income < r.costs ? "font-semibold text-hibiscus" : "font-semibold"}>{kwacha(r.income - r.costs)}</span> },
      ]} />
      <p className="mt-3 text-xs text-ink-3">Every figure comes from double-entry journal entries. Ticket sales, donations, sponsorships and pledges are recorded as separate income types.</p>
    </>
  );
}
