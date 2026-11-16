"use client";

import { Badge, Button, Card, PageHeader, SectionTitle, Stat, Table } from "@/components/ui";
import { kwacha } from "@/lib/brand";

export default function Payouts() {
  return (
    <>
      <PageHeader title="Payouts" sub="Money from ticket sales, less refunds and fees, paid to your MTN MoMo business wallet ending 0081." actions={<Button>Request payout</Button>} />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Available now" value={kwacha(1_284_220)} />
        <Stat label="Held until after the event" value={kwacha(6_102_480)} hint="Lusaka Summer Jam, refund window open" />
        <Stat label="Paid out this year" value={kwacha(7_640_900)} />
      </div>
      <SectionTitle title="Settlement for Zed Live Sessions: October" />
      <Card pad={false}>
        <ul className="divide-y divide-line text-sm">
          {[["Gross ticket sales", 1_041_000], ["Refunds", -12_500], ["Platform fee (3% + K2 per ticket)", -33_208], ["Payment provider fees", -18_740]].map(([k, v]) => <li key={k as string} className="flex justify-between px-5 py-3"><span>{k}</span><span className="tabular-nums">{(v as number) < 0 ? `(${kwacha(-(v as number))})` : kwacha(v as number)}</span></li>)}
          <li className="flex justify-between bg-surface-2 px-5 py-3 font-semibold"><span>Paid to you on 31 Oct</span><span>{kwacha(976_552)}</span></li>
        </ul>
      </Card>
      <SectionTitle title="History" />
      <Table rows={[
        { ref: "PO-ZL-0412", date: "2026-10-31", amount: 976_552, to: "MTN MoMo ****0081", status: "Paid" },
        { ref: "PO-ZL-0388", date: "2026-08-12", amount: 4_610_300, to: "Zanaco ****2290", status: "Paid" },
        { ref: "PO-ZL-0350", date: "2026-06-30", amount: 412_000, to: "MTN MoMo ****0081", status: "Paid" },
      ]} columns={[{ key: "ref", label: "Reference", render: (r) => <span className="font-mono text-xs">{r.ref}</span> }, { key: "date", label: "Date" }, { key: "to", label: "Paid to" }, { key: "amount", label: "Amount", align: "right", render: (r) => kwacha(r.amount) }, { key: "status", label: "Status", render: () => <Badge tone="green">Paid</Badge> }]} />
    </>
  );
}
