"use client";

import { useState } from "react";
import { Plus, Star, Trophy } from "lucide-react";
import { Badge, Button, Card, cx, Modal, PageHeader, SectionTitle, Table, Tabs, useToast } from "@/components/ui";
import { useOrgRole } from "@/components/layout/org-role";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function Vendors() {
  const toast = useToast();
  const [tab, setTab] = useState("Directory");
  const [award, setAward] = useState<string | null>(null);
  const [profile, setProfile] = useState<ReturnType<typeof api.vendors.list>[number] | null>(null);
  const [invoices, setInvoices] = useState(api.vendors.invoices());
  const { can } = useOrgRole();
  const quotes = api.vendors.quotes();
  const cheapest = Math.min(...quotes.map((q) => q.amount));
  return (
    <>
      <PageHeader title="Vendors and quotes" actions={<><Button variant="secondary"><Plus size={15} /> Add vendor</Button><Button><Plus size={15} /> Request quotes</Button></>} />
      <Tabs tabs={["Directory", "Compare quotes", "Purchase orders", "Contracts", "Invoices"]} value={tab} onChange={setTab} />
      {tab === "Directory" && (
        <Table rows={api.vendors.list()} onRow={setProfile} columns={[
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
      {tab === "Contracts" && (
        <Table rows={api.vendors.contracts()} columns={[
          { key: "id", label: "Contract", render: (c) => <span className="font-mono text-xs">{c.id}</span> }, { key: "vendor", label: "Vendor", render: (c) => <span className="font-semibold">{c.vendor}</span> },
          { key: "event", label: "Event" }, { key: "value", label: "Value", align: "right", render: (c) => kwacha(c.value) }, { key: "signed", label: "Signed" },
          { key: "status", label: "Status", render: (c) => <Badge tone={c.status === "Signed by both" ? "green" : "gold"}>{c.status}</Badge> },
        ]} />
      )}
      {tab === "Invoices" && (
        <Table rows={invoices} columns={[
          { key: "id", label: "Invoice", render: (x) => <span className="font-mono text-xs">{x.id}</span> }, { key: "vendor", label: "Vendor", render: (x) => <><p className="font-semibold">{x.vendor}</p><p className="text-xs text-ink-3">{x.note}</p></> },
          { key: "due", label: "Due" }, { key: "amount", label: "Amount", align: "right", render: (x) => kwacha(x.amount) },
          { key: "status", label: "Status", render: (x) => <Badge tone={x.status === "Paid" ? "green" : x.status === "Approved" ? "teal" : "gold"}>{x.status}</Badge> },
          { key: "a", label: "", render: (x) => (x.status === "Awaiting approval" && can("payouts.approve") ? <Button size="sm" onClick={() => { setInvoices(invoices.map((i) => (i.id === x.id ? { ...i, status: "Approved" } : i))); toast("Invoice approved for payment"); }}>Approve</Button> : x.status === "Approved" && can("payouts.approve") ? <Button size="sm" variant="secondary" onClick={() => { setInvoices(invoices.map((i) => (i.id === x.id ? { ...i, status: "Paid" } : i))); toast("Marked as paid and recorded in expenses"); }}>Mark paid</Button> : null) },
        ]} />
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
      <Modal open={!!profile} onClose={() => setProfile(null)} title={profile?.name ?? ""}>
        {profile && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              {[["Service", profile.category], ["Town", profile.city], ["Contact", profile.contact], ["Rating", `${profile.rating} from ${profile.jobs} jobs`]].map(([k, v]) => <div key={k}><p className="text-ink-3">{k}</p><p className="font-semibold">{v}</p></div>)}
            </div>
            <div>
              <p className="mb-1 font-semibold">Services and prices</p>
              {api.vendors.services(profile.name).length ? (
                <ul className="divide-y divide-line rounded-lg border border-line">{api.vendors.services(profile.name).map((x) => <li key={x.s} className="flex justify-between px-3 py-2"><span>{x.s}</span><span className="font-semibold">{kwacha(x.price)} <span className="font-normal text-ink-3">{x.unit}</span></span></li>)}</ul>
              ) : <p className="text-ink-3">No price list yet. Request a quote.</p>}
            </div>
            <div>
              <p className="mb-1 font-semibold">History with you</p>
              <p className="text-ink-2">{profile.jobs} jobs since 2023. Last: Lusaka Summer Jam (contracted). Average rating from your team: {profile.rating}.</p>
            </div>
            <div className="flex gap-2"><Button size="sm">Request a quote</Button><Button size="sm" variant="secondary">Rate this vendor</Button></div>
          </div>
        )}
      </Modal>
    </>
  );
}
