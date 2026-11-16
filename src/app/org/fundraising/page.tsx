"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge, Button, Card, PageHeader, Progress, SectionTitle, Stat, Table, Tabs } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function Fundraising() {
  const [tab, setTab] = useState("Campaigns");
  return (
    <>
      <PageHeader title="Fundraising and sponsors" actions={<Button><Plus size={15} /> New campaign</Button>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Donations this year" value={kwacha(2_165_800)} />
        <Stat label="Sponsorship" value={kwacha(940_000)} hint="4 sponsors" />
        <Stat label="Open pledges" value={kwacha(90_000)} />
        <Stat label="Monthly donors" value="418" />
      </div>
      <Tabs tabs={["Campaigns", "Donations", "Sponsors", "Fund use"]} value={tab} onChange={setTab} />
      {tab === "Campaigns" && <div className="grid gap-4 md:grid-cols-3">{api.fundraising.campaigns().map((c) => <Card key={c.id}><p className="font-semibold">{c.title}</p><p className="text-sm text-ink-3">{c.org}</p><p className="font-display mt-3 text-2xl font-bold">{kwacha(c.raised)}</p><Progress value={(c.raised / c.target) * 100} tone="marigold" className="mt-2" /><p className="mt-2 text-sm text-ink-3">of {kwacha(c.target)}, {c.donors} donors</p>{c.restricted && <Badge tone="teal" className="mt-2">Restricted fund</Badge>}</Card>)}</div>}
      {tab === "Donations" && <Table rows={api.fundraising.donations()} columns={[{ key: "date", label: "Date" }, { key: "donor", label: "Donor" }, { key: "type", label: "Type" }, { key: "method", label: "Method" }, { key: "amount", label: "Amount", align: "right", render: (d) => kwacha(d.amount) }, { key: "r", label: "Receipt", render: () => <Badge tone="green">Sent</Badge> }]} />}
      {tab === "Sponsors" && <Table rows={api.fundraising.sponsors()} columns={[{ key: "name", label: "Sponsor", render: (s) => <span className="font-semibold">{s.name}</span> }, { key: "tier", label: "Tier" }, { key: "deliverables", label: "What they get" }, { key: "amount", label: "Amount", align: "right", render: (s) => kwacha(s.amount) }, { key: "status", label: "Status", render: (s) => <Badge tone={s.status === "Paid" ? "green" : s.status === "Invoiced" ? "teal" : "gold"}>{s.status}</Badge> }]} />}
      {tab === "Fund use" && <Card><SectionTitle title="Feed 2,000 learners: how funds were used" sub="Restricted funds can only be spent on the stated purpose" /><ul className="space-y-3 text-sm">{[["Maize meal and relish, Term 3", 162_400], ["Cooks' allowances", 31_200], ["Transport to 6 schools", 17_900]].map(([k, v]) => <li key={k as string} className="flex justify-between"><span>{k}</span><span className="font-semibold">{kwacha(v as number)}</span></li>)}</ul></Card>}
    </>
  );
}
