"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { Badge, Button, Card, Field, Input, Modal, PageHeader, Progress, SectionTitle, Stat, Table, Tabs, useToast } from "@/components/ui";
import { api, feeText, licenceAccess, type PlanKey } from "@/lib/api";
import { fmtDate, kwacha } from "@/lib/brand";

const order: PlanKey[] = ["Free", "Starter", "Professional", "Enterprise"];

export default function Plans() {
  const toast = useToast();
  const [tab, setTab] = useState("Plans");
  const [edit, setEdit] = useState<string | null>(null);
  const plans = api.billing.plans();
  const features = api.billing.features();
  const conv = { last90Days: 31, started: 42, converted: 13 };

  return (
    <>
      <PageHeader title="Plans and packages" sub="Every event is covered by exactly one arrangement: free, a fee per ticket, a plan, a one-off licence, an enterprise contract or a partnership." />
      <div className="mb-6 rounded-xl border border-marigold/50 bg-marigold-soft px-4 py-3 text-sm"><span className="font-semibold">Prices are placeholders</span> until the cost model sets them. Changing a price creates a new version: organisations keep their current price until renewal, and published events keep their fees.</div>
      <Tabs tabs={["Plans", "One-off licences", "Add-ons and discounts", "Trials"]} value={tab} onChange={setTab} />

      {tab === "Plans" && (<>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {plans.map((p) => (
            <Card key={p.key}>
              <div className="flex justify-between"><p className="text-lg font-semibold">{p.key}</p><Badge tone="teal">{p.orgs} orgs</Badge></div>
              <p className="font-display mt-2 text-3xl font-bold">{p.monthly === null ? "Contract" : p.monthly ? kwacha(p.monthly) : "K0"}<span className="text-sm font-normal text-ink-3">{p.monthly ? " a month" : ""}</span></p>
              <p className="text-sm text-ink-3">{p.annual ? `${kwacha(p.annual)} a year` : p.monthly === 0 ? "Free for ever" : "Negotiated per organisation"}</p>
              <p className="mt-2 text-sm">Fee: {feeText(p)}</p>
              <p className="text-sm text-ink-3">{p.team ? `${p.team} team members` : "Unlimited team members"}</p>
              <Button size="sm" variant="secondary" className="mt-4" onClick={() => setEdit(p.key)}>Edit plan</Button>
            </Card>
          ))}
        </div>
        <SectionTitle title="Features by plan" sub="Checked by the entitlement service in the API. Hiding a button is never the only check." />
        <Card pad={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-line text-ink-3"><th className="px-5 py-3 text-left font-medium">Feature</th>{order.map((k) => <th key={k} className="px-4 py-3 font-medium">{k}</th>)}</tr></thead>
              <tbody>{features.map(([f, ...v]) => <tr key={f} className="border-b border-line last:border-0"><td className="px-5 py-2.5">{f}</td>{v.map((x, i) => <td key={i} className="text-center">{x ? <Check size={16} className="mx-auto text-leaf" aria-label="Included" /> : <Minus size={16} className="mx-auto text-ink-3" aria-label="Not included" />}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </Card>
        <SectionTitle title="Renewals and billing" sub="Mobile money renewals are sent as invoices with a payment link and reminders. 14 days' grace before an organisation is restricted." />
        <Table rows={[
          { org: "Copperbelt Business Forum", plan: "Starter, monthly", due: "2026-11-20", amount: 450, status: "Card on file" },
          { org: "Grace Chapel International", plan: "Starter, monthly", due: "2026-11-21", amount: 450, status: "Invoice sent" },
          { org: "SkillUp Academy", plan: "Starter, monthly", due: "2026-11-09", amount: 450, status: "Grace period, day 8 of 14" },
          { org: "Chipolopolo Sports Events", plan: "Professional, annual", due: "2026-12-02", amount: 14_500, status: "Invoice sent" },
        ]} columns={[
          { key: "org", label: "Organisation" },
          { key: "plan", label: "Plan" },
          { key: "due", label: "Renews", render: (r) => fmtDate(r.due, { day: "numeric", month: "short" }) },
          { key: "amount", label: "Amount", align: "right", render: (r) => kwacha(r.amount) },
          { key: "status", label: "Status", render: (r) => <Badge tone={r.status.startsWith("Grace") ? "red" : r.status === "Card on file" ? "green" : "grey"}>{r.status}</Badge> },
        ]} />
      </>)}

      {tab === "One-off licences" && (<>
        <div className="grid gap-4 md:grid-cols-3">
          {api.billing.licencePackages().map((l) => (
            <Card key={l.key}>
              <div className="flex justify-between"><p className="text-lg font-semibold">{l.key}</p><Badge tone="teal">{l.sold} sold</Badge></div>
              <p className="font-display mt-2 text-3xl font-bold">{kwacha(l.price)}<span className="text-sm font-normal text-ink-3"> once</span></p>
              <p className="text-sm text-ink-3">Up to {l.guests.toLocaleString()} guests</p>
              <ul className="mt-3 space-y-1 text-sm">{l.features.map((f) => <li key={f} className="flex gap-2"><Check size={15} className="mt-0.5 shrink-0 text-leaf" />{f}</li>)}</ul>
              <Button size="sm" variant="secondary" className="mt-4" onClick={() => setEdit(`${l.key} licence`)}>Edit package</Button>
            </Card>
          ))}
        </div>
        <Card className="mt-4 grid gap-4 text-sm sm:grid-cols-4">
          <div><p className="text-ink-3">Full access</p><p className="font-semibold">{licenceAccess.fullDays} days after the event</p></div>
          <div><p className="text-ink-3">Then read-only</p><p className="font-semibold">{licenceAccess.readOnlyMonths} months</p></div>
          <div><p className="text-ink-3">Cancelled before the event</p><p className="font-semibold">Refund less {licenceAccess.cancelFeePct}%</p></div>
          <div><p className="text-ink-3">Counts towards a subscription</p><p className="font-semibold">Within {licenceAccess.creditWindowDays} days</p></div>
        </Card>
        <SectionTitle title="Licences" />
        <Table rows={api.billing.licences()} columns={[
          { key: "event", label: "Event", render: (r) => <><p className="font-semibold">{r.event}</p><p className="text-xs text-ink-3">{r.id}, {r.holder}</p></> },
          { key: "pkg", label: "Package" },
          { key: "date", label: "Date", render: (r) => fmtDate(r.date, { day: "numeric", month: "short", year: "numeric" }) },
          { key: "guests", label: "Guests", render: (r) => <div className="w-36"><Progress value={(r.guests / r.limit) * 100} tone={r.guests > r.limit ? "hibiscus" : "kafue"} /><p className="text-xs text-ink-3">{r.guests} of {r.limit}{r.note ? `. ${r.note}` : ""}</p></div> },
          { key: "status", label: "Licence", render: (r) => <Badge tone={r.status === "Active" ? "green" : r.status === "Pending payment" ? "gold" : "grey"}>{r.status}</Badge> },
        ]} />
      </>)}

      {tab === "Add-ons and discounts" && (<>
        <div className="grid gap-4 md:grid-cols-2">
          {api.billing.addOns().map((a) => (
            <Card key={a.name} className="flex items-center justify-between"><div><p className="font-semibold">{a.name}</p><p className="text-sm text-ink-3">{kwacha(a.price)} for {a.unit}</p></div><Button size="sm" variant="secondary" onClick={() => setEdit(a.name)}>Edit</Button></Card>
          ))}
        </div>
        <SectionTitle title="Discount codes" action={<Button size="sm" onClick={() => toast("New discount code created")}>New code</Button>} />
        <Table rows={api.billing.discounts()} columns={[
          { key: "code", label: "Code", render: (r) => <span className="font-mono text-xs font-semibold">{r.code}</span> },
          { key: "what", label: "Offer" },
          { key: "used", label: "Used", render: (r) => (r.max ? `${r.used} of ${r.max}` : r.used) },
          { key: "ends", label: "Ends", render: (r) => (r.ends === "—" ? "—" : fmtDate(r.ends, { day: "numeric", month: "short", year: "numeric" })) },
        ]} />
      </>)}

      {tab === "Trials" && (<>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
          <Stat label="Trials started, 90 days" value={conv.started} />
          <Stat label="Became paying" value={conv.converted} />
          <Stat label="Conversion" value={`${conv.last90Days}%`} />
        </div>
        <SectionTitle title="Trials" sub="14 days of Professional, once per organisation. Trial organisations can sell real tickets; payouts wait for verification." />
        <Table rows={api.billing.trials()} columns={[
          { key: "org", label: "Organisation" },
          { key: "started", label: "Started", render: (r) => fmtDate(r.started, { day: "numeric", month: "short" }) },
          { key: "ends", label: "Ends", render: (r) => fmtDate(r.ends, { day: "numeric", month: "short" }) },
          { key: "sales", label: "Ticket sales", align: "right", render: (r) => kwacha(r.sales) },
          { key: "status", label: "Status", render: (r) => <Badge tone={r.status.startsWith("Converted") ? "green" : r.status === "Ends today" ? "gold" : "grey"}>{r.status}</Badge> },
          { key: "a", label: "", render: (r) => (r.status.startsWith("Day") || r.status === "Ends today" ? <Button size="sm" variant="ghost" onClick={() => toast(`${r.org}: trial extended by 7 days`)}>Extend 7 days</Button> : null) },
        ]} />
      </>)}

      <Modal open={!!edit} onClose={() => setEdit(null)} title={`Edit ${edit}`} footer={<><Button variant="ghost" onClick={() => setEdit(null)}>Cancel</Button><Button onClick={() => { toast("Saved as a new price version. Applies to new sign-ups now and to renewals from their next date."); setEdit(null); }}>Save new version</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Price (K)"><Input defaultValue="1450" inputMode="numeric" /></Field>
          <Field label="Annual price (K)"><Input defaultValue="14500" inputMode="numeric" /></Field>
          <Field label="Fee on paid tickets (%)"><Input defaultValue="3" inputMode="decimal" /></Field>
          <Field label="Plus per ticket (K)"><Input defaultValue="2" inputMode="decimal" /></Field>
          <Field label="Effective from"><Input type="date" defaultValue="2026-12-01" /></Field>
          <Field label="Reason"><Input placeholder="e.g. Set from cost model v1" /></Field>
        </div>
        <p className="mt-3 text-xs text-ink-3">Price changes need a second person from finance to confirm before they take effect.</p>
      </Modal>
    </>
  );
}
