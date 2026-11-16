"use client";

import { Badge, Button, Card, Field, Input, PageHeader, Progress, SectionTitle, Table, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function Payments() {
  const toast = useToast();
  return (
    <>
      <PageHeader title="Payments and fees" sub="Every provider plugs in through its own adapter. Callbacks are signature-checked and processed exactly once." />
      <Table rows={api.platform.gateways()} columns={[
        { key: "name", label: "Provider", render: (g) => <><p className="font-semibold">{g.name}</p><p className="text-xs text-ink-3">{g.type}</p></> },
        { key: "status", label: "Status", render: (g) => <Badge tone={g.status === "Connected" ? "green" : "gold"}>{g.status}</Badge> },
        { key: "successRate", label: "Success rate", render: (g) => <div className="w-32"><Progress value={g.successRate} tone={g.successRate > 95 ? "leaf" : "marigold"} /><p className="text-xs text-ink-3">{g.successRate}%</p></div> },
        { key: "avgConfirm", label: "Time to confirm" },
        { key: "volume", label: "Volume, 30 days", align: "right", render: (g) => kwacha(g.volume) },
      ]} />
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <SectionTitle title="Default transaction fees" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Starter"><Input defaultValue="5% + K2" /></Field>
            <Field label="Growth"><Input defaultValue="3% + K2" /></Field>
            <Field label="Enterprise"><Input defaultValue="Custom" /></Field>
          </div>
          <Field label="Booking fee shown to buyers" hint="Per ticket, on paid tickets only"><Input defaultValue="K5 + 2%" /></Field>
          <Button onClick={() => toast("Fee changes apply to orders from tomorrow 00:00")}>Save fees</Button>
        </Card>
        <Card>
          <SectionTitle title="Reconciliation, yesterday" />
          <ul className="space-y-2 text-sm">
            {[["MTN MoMo settlement", "Matched 12,804 of 12,804"], ["Airtel Money settlement", "Matched 7,210 of 7,212"], ["Card acquirer", "Matched 2,941 of 2,941"]].map(([k, v], i) => <li key={k} className="flex justify-between rounded-lg bg-surface-2 px-3 py-2"><span>{k}</span><span className={i === 1 ? "font-semibold text-[#a35f00] dark:text-marigold" : "font-semibold text-leaf"}>{v}</span></li>)}
          </ul>
          <p className="mt-3 text-sm text-ink-3">2 Airtel transactions were charged but the callback never arrived. They are being checked against Airtel&rsquo;s status API; no tickets have been issued for them yet.</p>
        </Card>
      </div>
    </>
  );
}
