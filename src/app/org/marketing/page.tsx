"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge, Button, Card, PageHeader, SectionTitle, Stat, Table, Tabs } from "@/components/ui";
import { api } from "@/lib/api";
import { PlanLimit } from "@/components/plan-limit";
import { kwacha } from "@/lib/brand";

export default function Marketing() {
  const [tab, setTab] = useState("Campaigns");
  return (
    <>
      <PageHeader title="Marketing" sub="Only customers who agreed to hear from you receive promotional messages." actions={<Button href="/org/marketing/new/"><Plus size={15} /> New campaign</Button>} />
      <PlanLimit className="mb-6" title="1,240 SMS credits left" body="That's enough for about one more campaign to your Lusaka customers. Email and WhatsApp campaigns don't use credits." action="Buy SMS credits" href="/org/settings/billing/#addons" />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Stat label="Revenue from campaigns, 30 days" value={kwacha(896_750)} delta="+31%" />
        <Stat label="Messages sent" value="72,520" />
        <Stat label="Click rate" value="9.2%" hint="SMS 12.5%, email 7.8%, push 9.0%" />
        <Stat label="Unsubscribes" value="0.3%" />
      </div>
      <Tabs tabs={["Campaigns", "Discount codes", "Automations", "Referrals"]} value={tab} onChange={setTab} />
      {tab === "Campaigns" && <Table rows={api.marketing.campaigns()} columns={[
        { key: "name", label: "Campaign", render: (c) => <><p className="font-semibold">{c.name}</p><p className="text-xs text-ink-3">{c.audience}</p></> },
        { key: "channel", label: "Channel", render: (c) => <Badge>{c.channel}</Badge> },
        { key: "sent", label: "Sent", align: "right", render: (c) => c.sent.toLocaleString() },
        { key: "clicked", label: "Clicks", align: "right", render: (c) => c.clicked.toLocaleString() },
        { key: "revenue", label: "Revenue", align: "right", render: (c) => (c.revenue ? kwacha(c.revenue) : "—") },
        { key: "status", label: "Status", render: (c) => <Badge tone={c.status === "Sent" ? "green" : c.status === "Scheduled" ? "teal" : "grey"}>{c.status}</Badge> },
        { key: "date", label: "Date" },
      ]} />}
      {tab === "Discount codes" && <Table rows={api.marketing.discountCodes()} columns={[
        { key: "code", label: "Code", render: (d) => <span className="font-mono font-semibold">{d.code}</span> }, { key: "type", label: "Discount" },
        { key: "uses", label: "Used", align: "right", render: (d) => `${d.uses.toLocaleString()} / ${d.limit.toLocaleString()}` }, { key: "expires", label: "Expires" },
        { key: "status", label: "Status", render: (d) => <Badge tone={d.status === "Active" ? "green" : "grey"}>{d.status}</Badge> },
      ]} />}
      {tab === "Automations" && (
        <div className="grid gap-4 md:grid-cols-2">
          {[["Ticket reminder", "48 hours and 3 hours before every event, by SMS and push", "On"], ["Abandoned checkout", "Email 1 hour after someone leaves checkout, only if they agreed to marketing", "On"], ["Review request", "Email the morning after, to checked-in attendees", "On"], ["Win-back", "SMS to customers who haven't bought in 6 months", "Off"]].map(([t, d, s]) => (
            <Card key={t}><div className="flex justify-between"><p className="font-semibold">{t}</p><Badge tone={s === "On" ? "green" : "grey"}>{s}</Badge></div><p className="mt-1 text-sm text-ink-2">{d}</p></Card>
          ))}
        </div>
      )}
      {tab === "Referrals" && <Card><SectionTitle title="Bring a friend" sub="Each buyer gets a link. When a friend buys, both get K25 off their next ticket." /><p className="text-sm">1,284 referred purchases this year, {kwacha(318_400)} in sales.</p></Card>}
    </>
  );
}
