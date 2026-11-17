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
      <Tabs tabs={["Campaigns", "Donations", "Donors", "Pledges", "Sponsors", "Beneficiaries", "Fund use"]} value={tab} onChange={setTab} />
      {tab === "Campaigns" && <div className="grid gap-4 md:grid-cols-3">{api.fundraising.campaigns().map((c) => <Card key={c.id}><p className="font-semibold">{c.title}</p><p className="text-sm text-ink-3">{c.org}</p><p className="font-display mt-3 text-2xl font-bold">{kwacha(c.raised)}</p><Progress value={(c.raised / c.target) * 100} tone="marigold" className="mt-2" /><p className="mt-2 text-sm text-ink-3">of {kwacha(c.target)}, {c.donors} donors</p>{c.restricted && <Badge tone="teal" className="mt-2">Restricted fund</Badge>}</Card>)}</div>}
      {tab === "Donations" && <Table rows={api.fundraising.donations()} columns={[{ key: "date", label: "Date" }, { key: "donor", label: "Donor" }, { key: "type", label: "Type" }, { key: "method", label: "Method" }, { key: "amount", label: "Amount", align: "right", render: (d) => kwacha(d.amount) }, { key: "r", label: "Receipt", render: () => <Badge tone="green">Sent</Badge> }]} />}
      {tab === "Donors" && <Table rows={api.fundraising.donors()} columns={[{ key: "name", label: "Donor", render: (d) => <span className="font-semibold">{d.name}</span> }, { key: "type", label: "Type" }, { key: "gifts", label: "Gifts", align: "right" }, { key: "total", label: "Total given", align: "right", render: (d) => kwacha(d.total) }, { key: "since", label: "Since" }, { key: "last", label: "Last gift" }]} />}
      {tab === "Pledges" && <Table rows={api.fundraising.pledges()} columns={[{ key: "donor", label: "Donor", render: (p) => <><p className="font-semibold">{p.donor}</p><p className="text-xs text-ink-3">{p.campaign}</p></> }, { key: "amount", label: "Promised", align: "right", render: (p) => kwacha(p.amount) }, { key: "paid", label: "Paid so far", align: "right", render: (p) => <div className="w-28"><Progress value={(p.paid / p.amount) * 100} /><p className="text-xs text-ink-3">{kwacha(p.paid)}</p></div> }, { key: "due", label: "Due" }, { key: "status", label: "Status", render: (p) => <Badge tone={p.status === "On track" ? "green" : "gold"}>{p.status}</Badge> }]} />}
      {tab === "Beneficiaries" && <Table rows={api.fundraising.beneficiaries()} columns={[{ key: "name", label: "Beneficiary", render: (b) => <><p className="font-semibold">{b.name}</p><p className="text-xs text-ink-3">{b.place}</p></> }, { key: "learners", label: "Learners", align: "right" }, { key: "received", label: "Received", align: "right", render: (b) => kwacha(b.received) }, { key: "lastReport", label: "Reporting", render: (b) => <Badge tone={b.lastReport.startsWith("Report due") ? "gold" : "green"}>{b.lastReport}</Badge> }]} />}
      {tab === "Sponsors" && <Table rows={api.fundraising.sponsors()} columns={[{ key: "name", label: "Sponsor", render: (s) => <span className="font-semibold">{s.name}</span> }, { key: "tier", label: "Tier" }, { key: "deliverables", label: "What they get" }, { key: "amount", label: "Amount", align: "right", render: (s) => kwacha(s.amount) }, { key: "status", label: "Status", render: (s) => <Badge tone={s.status === "Paid" ? "green" : s.status === "Invoiced" ? "teal" : "gold"}>{s.status}</Badge> }]} />}
      {tab === "Fund use" && <Card><SectionTitle title="Feed 2,000 learners: how funds were used" sub="Restricted funds can only be spent on the stated purpose" /><ul className="space-y-3 text-sm">{[["Maize meal and relish, Term 3", 162_400], ["Cooks' allowances", 31_200], ["Transport to 6 schools", 17_900]].map(([k, v]) => <li key={k as string} className="flex justify-between"><span>{k}</span><span className="font-semibold">{kwacha(v as number)}</span></li>)}</ul></Card>}
    </>
  );
}
