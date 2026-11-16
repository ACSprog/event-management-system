"use client";

import { useState } from "react";
import { Plus, Star, Trophy } from "lucide-react";
import { Badge, Button, Card, cx, PageHeader, SectionTitle, Table, Tabs, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function Vendors() {
  const toast = useToast();
  const [tab, setTab] = useState("Directory");
  const [award, setAward] = useState<string | null>(null);
  const quotes = api.vendors.quotes();
  const cheapest = Math.min(...quotes.map((q) => q.amount));
  return (
    <>
      <PageHeader title="Vendors and quotes" actions={<><Button variant="secondary"><Plus size={15} /> Add vendor</Button><Button><Plus size={15} /> Request quotes</Button></>} />
      <Tabs tabs={["Directory", "Compare quotes", "Purchase orders"]} value={tab} onChange={setTab} />
      {tab === "Directory" && (
        <Table rows={api.vendors.list()} columns={[
          { key: "name", label: "Vendor", render: (v) => <><p className="font-semibold">{v.name}</p><p className="text-xs text-ink-3">{v.contact}</p></> },
          { key: "category", label: "Service" }, { key: "city", label: "Town" },
          { key: "rating", label: "Rating", render: (v) => <span className="flex items-center gap-1"><Star size={13} className="fill-marigold text-marigold" />{v.rating}</span> },
          { key: "jobs", label: "Jobs with you", align: "right" },
          { key: "status", label: "Status", render: (v) => <Badge tone={v.status === "Preferred" ? "green" : v.status === "Approved" ? "teal" : "gold"}>{v.status}</Badge> },
        ]} />
      )}
      {tab === "Compare quotes" && (
        <>
          <Card className="mb-4"><p className="text-sm text-ink-3">RFQ-1042, due 20 November</p><p className="font-semibold">Stage, sound and lighting for 35,000 people</p><p className="text-sm text-ink-3">Budget {kwacha(220_000)}. 4 quotes received.</p></Card>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {quotes.map((q) => (
              <Card key={q.vendor} className={cx(award === q.vendor && "ring-2 ring-kafue")}>
                <p className="font-semibold">{q.vendor}</p>
                <p className="font-display mt-2 text-2xl font-bold">{kwacha(q.amount)}</p>
                {q.amount === cheapest && <Badge tone="green">Lowest</Badge>}
                <dl className="mt-3 space-y-1.5 text-sm">
                  <div className="flex justify-between"><dt className="text-ink-3">Rating</dt><dd>{q.rating}</dd></div>
                  <div className="flex justify-between"><dt className="text-ink-3">Set-up</dt><dd>{q.delivery}</dd></div>
                </dl>
                <p className="mt-2 text-sm text-ink-2">{q.notes}</p>
                <Button size="sm" className="mt-4 w-full" variant={award === q.vendor ? "primary" : "secondary"} onClick={() => { setAward(q.vendor); toast(`Awarded to ${q.vendor}. Contract and purchase order drafted.`); }}><Trophy size={14} /> {award === q.vendor ? "Awarded" : "Award"}</Button>
              </Card>
            ))}
          </div>
        </>
      )}
      {tab === "Purchase orders" && (
        <Card pad={false}>
          <div className="p-5 pb-0"><SectionTitle title="Purchase orders" /></div>
          <Table rows={[
            { po: "PO-2026-118", vendor: "Sound Kings Zambia", amount: 205_000, status: "Issued", invoice: "Not yet" },
            { po: "PO-2026-114", vendor: "SecureForce Ltd", amount: 96_000, status: "Delivered", invoice: "Paid" },
            { po: "PO-2026-109", vendor: "PrintHub Lusaka", amount: 18_400, status: "Delivered", invoice: "Awaiting approval" },
          ]} columns={[{ key: "po", label: "PO", render: (r) => <span className="font-mono text-xs">{r.po}</span> }, { key: "vendor", label: "Vendor" }, { key: "amount", label: "Amount", align: "right", render: (r) => kwacha(r.amount) }, { key: "status", label: "Status", render: (r) => <Badge tone="teal">{r.status}</Badge> }, { key: "invoice", label: "Invoice" }]} />
        </Card>
      )}
    </>
  );
}
