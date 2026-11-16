"use client";

import { Check } from "lucide-react";
import { Badge, Button, Card, PageHeader, SectionTitle, Table } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

const featureMatrix = [["Ticketing and QR check-in", 1, 1, 1], ["Reserved seating", 0, 1, 1], ["SMS, push and WhatsApp campaigns", 0, 1, 1], ["CRM and reviews", 0, 1, 1], ["Fundraising and sponsorship", 0, 1, 1], ["Virtual classrooms and Zoom", 0, 0, 1], ["Double-entry accounting", 0, 0, 1], ["Custom roles and API access", 0, 0, 1]] as const;

export default function Plans() {
  const plans = api.platform.plans();
  return (
    <>
      <PageHeader title="Plans and subscriptions" actions={<Button>New plan</Button>} />
      <div className="grid gap-4 md:grid-cols-3">
        {plans.map((p) => <Card key={p.name}><div className="flex justify-between"><p className="text-lg font-semibold">{p.name}</p><Badge tone="teal">{p.orgs} orgs</Badge></div><p className="font-display mt-2 text-3xl font-bold">{p.price ? kwacha(p.price) : "Free"}<span className="text-sm font-normal text-ink-3">{p.price ? " a month" : ""}</span></p><p className="text-sm text-ink-3">Ticket fee: {p.fee}</p><Button size="sm" variant="secondary" className="mt-4">Edit plan</Button></Card>)}
      </div>
      <SectionTitle title="Features by plan" />
      <Card pad={false}>
        <table className="w-full text-sm">
          <thead><tr className="border-b border-line text-ink-3"><th className="px-5 py-3 text-left font-medium">Feature</th>{plans.map((p) => <th key={p.name} className="px-4 py-3 font-medium">{p.name}</th>)}</tr></thead>
          <tbody>{featureMatrix.map(([f, ...v]) => <tr key={f} className="border-b border-line last:border-0"><td className="px-5 py-2.5">{f}</td>{v.map((x, i) => <td key={i} className="text-center">{x ? <Check size={16} className="mx-auto text-leaf" /> : <span className="text-ink-3">—</span>}</td>)}</tr>)}</tbody>
        </table>
      </Card>
      <SectionTitle title="Renewals and billing" />
      <Table rows={[{ org: "Copperbelt Business Forum", plan: "Growth", due: "2026-11-20", amount: 1450, status: "Card on file" }, { org: "Grace Chapel International", plan: "Growth", due: "2026-11-21", amount: 1450, status: "Invoice sent" }, { org: "Hope Children's Foundation", plan: "Trial", due: "2026-11-28", amount: 0, status: "Trial ends" }]} columns={[{ key: "org", label: "Organisation" }, { key: "plan", label: "Plan" }, { key: "due", label: "Renews" }, { key: "amount", label: "Amount", align: "right", render: (r) => kwacha(r.amount) }, { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Trial ends" ? "gold" : "grey"}>{r.status}</Badge> }]} />
    </>
  );
}
