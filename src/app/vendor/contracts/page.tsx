"use client";

import { Badge, PageHeader, SectionTitle, Table } from "@/components/ui";
import { kwacha } from "@/lib/brand";

export default function Contracts() {
  return (
    <>
      <PageHeader title="Contracts and invoices" />
      <SectionTitle title="Contracts" />
      <Table rows={[
        { c: "CT-2026-071", org: "Laugh Out Lusaka", event: "Comedy night, 15 Jan", value: 38_000, status: "Signed by both" },
        { c: "CT-2026-074", org: "Grace Chapel International", event: "Youth worship night, 6 Feb", value: 30_400, status: "Awaiting their signature" },
      ]} columns={[{ key: "c", label: "Contract", render: (r) => <span className="font-mono text-xs">{r.c}</span> }, { key: "org", label: "Organiser" }, { key: "event", label: "Event" }, { key: "value", label: "Value", align: "right", render: (r) => kwacha(r.value) }, { key: "status", label: "Status", render: (r) => <Badge tone={r.status.startsWith("Signed") ? "green" : "gold"}>{r.status}</Badge> }]} />
      <SectionTitle title="Invoices" />
      <Table rows={[
        { i: "INV-LP-0931", org: "Zed Live Entertainment", amount: 38_000, due: "2026-10-31", status: "Paid" },
        { i: "INV-LP-0944", org: "SkillUp Academy", amount: 30_400, due: "2026-11-30", status: "Unpaid" },
        { i: "INV-LP-0950", org: "Copperbelt Business Forum", amount: 38_000, due: "2026-12-05", status: "Unpaid" },
      ]} columns={[{ key: "i", label: "Invoice", render: (r) => <span className="font-mono text-xs">{r.i}</span> }, { key: "org", label: "Organiser" }, { key: "due", label: "Due" }, { key: "amount", label: "Amount", align: "right", render: (r) => kwacha(r.amount) }, { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Paid" ? "green" : "gold"}>{r.status}</Badge> }]} />
    </>
  );
}
