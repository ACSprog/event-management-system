"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Badge, Button, cx, Input, PageHeader, Select, Stat, Table, Tabs } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function AllTransactions() {
  const [tab, setTab] = useState("Transactions");
  const [org, setOrg] = useState("All organisers");
  const [type, setType] = useState("All");
  const [q, setQ] = useState("");
  const orgs = api.orgs.list();
  const orgName = (id: string) => orgs.find((o) => o.id === id)?.name ?? id;
  const byOrg = <T extends { orgId: string }>(rows: T[]) => rows.filter((r) => org === "All organisers" || orgName(r.orgId) === org);
  const tx = byOrg(api.platform.transactions()).filter((t) => (type === "All" || t.type === type || t.status === type) && `${t.id} ${t.customer} ${t.org}`.toLowerCase().includes(q.toLowerCase()));
  const refunds = byOrg(api.refunds.requests());
  const cbs = byOrg(api.refunds.chargebacks());
  const all = api.platform.transactions();

  return (
    <>
      <PageHeader title="Transactions" sub="Every payment, refund and chargeback across all organisers. Organisers see only their own." actions={<Button variant="secondary"><Download size={15} /> Export CSV</Button>} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="Payments, last 30 days" value={kwacha(all.filter((t) => t.amount > 0 && t.status === "Completed").reduce((a, t) => a + t.amount, 0))} hint={`${all.length} transactions`} />
        <Stat label="Refunds, last 30 days" value={kwacha(-all.filter((t) => t.amount < 0).reduce((a, t) => a + t.amount, 0))} />
        <Stat label="Refund requests waiting" value={api.refunds.requests().filter((r) => r.status === "Waiting").length} hint="Organisers answer these" />
        <Stat label="Open chargebacks" value={api.refunds.chargebacks().filter((c) => c.status === "Send evidence").length} />
      </div>
      <div className="mt-6 flex flex-wrap items-end gap-3">
        <div className="w-64"><Select aria-label="Organiser" value={org} onChange={(e) => setOrg(e.target.value)} options={["All organisers", ...orgs.map((o) => o.name)]} /></div>
        <div className="w-72"><Input placeholder="Search reference, buyer or organiser" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      <div className="mt-4"><Tabs tabs={["Transactions", "Refund requests", "Chargebacks"]} value={tab} onChange={setTab} /></div>

      {tab === "Transactions" && (<>
        <div className="mb-4 flex flex-wrap gap-2">
          {["All", "Ticket sale", "Refund", "Donation", "Sponsorship", "Pending", "Failed"].map((x) => <button key={x} onClick={() => setType(x)} className={cx("rounded-full border px-3.5 py-1.5 text-sm font-medium", type === x ? "border-ink bg-ink text-canvas" : "border-line bg-surface")}>{x}</button>)}
        </div>
        <Table rows={tx} columns={[
          { key: "id", label: "Reference", render: (t) => <span className="font-mono text-xs">{t.id}</span> },
          { key: "org", label: "Organiser" },
          { key: "date", label: "Date" },
          { key: "customer", label: "Buyer" },
          { key: "type", label: "Type", render: (t) => <Badge tone={t.type === "Refund" ? "gold" : t.type === "Ticket sale" ? "grey" : "teal"}>{t.type}</Badge> },
          { key: "method", label: "Method" },
          { key: "amount", label: "Amount", align: "right", render: (t) => <span className={t.amount < 0 ? "text-hibiscus" : ""}>{t.amount < 0 ? `−${kwacha(-t.amount)}` : kwacha(t.amount)}</span> },
          { key: "status", label: "Status", render: (t) => <Badge tone={t.status === "Completed" ? "green" : t.status === "Pending" ? "gold" : "red"}>{t.status}</Badge> },
        ]} />
      </>)}

      {tab === "Refund requests" && (
        <Table rows={refunds} columns={[
          { key: "id", label: "Request", render: (r) => <span className="font-mono text-xs">{r.id}</span> },
          { key: "org", label: "Organiser", render: (r) => orgName(r.orgId) },
          { key: "buyer", label: "Buyer" },
          { key: "event", label: "Event" },
          { key: "policy", label: "Policy", render: (r) => <Badge tone={r.policy === "Within policy" ? "green" : "gold"}>{r.policy}</Badge> },
          { key: "amount", label: "Amount", align: "right", render: (r) => kwacha(r.amount) },
          { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Waiting" ? "gold" : r.status === "Declined" ? "red" : "green"}>{r.status}</Badge> },
        ]} />
      )}

      {tab === "Chargebacks" && (
        <Table rows={cbs} columns={[
          { key: "id", label: "Case", render: (c) => <span className="font-mono text-xs">{c.id}</span> },
          { key: "org", label: "Organiser", render: (c) => orgName(c.orgId) },
          { key: "event", label: "Event" },
          { key: "reason", label: "Bank's reason" },
          { key: "amount", label: "Amount", align: "right", render: (c) => kwacha(c.amount) },
          { key: "status", label: "Status", render: (c) => <Badge tone={c.status === "Won" ? "green" : c.status === "Send evidence" ? "gold" : "grey"}>{c.status}</Badge> },
        ]} />
      )}
    </>
  );
}
