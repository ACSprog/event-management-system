"use client";

import { useState } from "react";
import { Check, Minus } from "lucide-react";
import { Badge, Button, Card, cx, Field, Input, Modal, PageHeader, Progress, SectionTitle, Select, Table, useToast } from "@/components/ui";
import { PlanLimit } from "@/components/plan-limit";
import { api, feeText, type PlanKey } from "@/lib/api";
import { fmtDate, kwacha } from "@/lib/brand";

const order: PlanKey[] = ["Free", "Starter", "Professional", "Enterprise"];

export default function Billing() {
  const toast = useToast();
  const sub = api.billing.subscription();
  const plans = api.billing.plans();
  const features = api.billing.features();
  const [annual, setAnnual] = useState(true);
  const [switchTo, setSwitchTo] = useState<PlanKey | null>(null);
  const [addon, setAddon] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const current = order.indexOf(sub.plan);
  const lost = switchTo ? features.filter((f) => f[current + 1] && !f[order.indexOf(switchTo) + 1]).map((f) => f[0]) : [];
  const sms = sub.usage.find((u) => u.label === "SMS credits left")!;

  return (
    <>
      <PageHeader title="Plan and billing" sub="Your plan, what you're using, add-ons and EMS invoices." />

      {sms.low && <PlanLimit className="mb-6" title={`Only ${sms.used.toLocaleString()} SMS credits left`} body="Campaigns and SMS tickets stop sending when credits run out. Tickets still work by email and WhatsApp, and check-in is never affected." action="Buy SMS credits" href="#addons" />}

      <div className="grid gap-6 xl:grid-cols-[1fr_1.2fr]">
        <Card>
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-ink-3">Current plan</p>
              <p className="font-display text-3xl font-bold">{sub.plan}</p>
            </div>
            <Badge tone="green">{sub.status}</Badge>
          </div>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-ink-3">Billing</dt><dd className="font-semibold">{sub.period}, {kwacha(sub.price)} a year</dd></div>
            <div><dt className="text-ink-3">Renews</dt><dd className="font-semibold">{fmtDate(sub.renews, { day: "numeric", month: "long", year: "numeric" })}</dd></div>
            <div><dt className="text-ink-3">Fee on paid tickets</dt><dd className="font-semibold">{feeText(plans[current])}</dd></div>
            <div><dt className="text-ink-3">Payment</dt><dd className="font-semibold">{sub.payBy}</dd></div>
          </dl>
          <p className="mt-4 text-xs text-ink-3">If a renewal payment fails you have 14 days to pay. After that you can&rsquo;t publish events or open new sales, but events you&rsquo;ve already sold tickets for keep check-in, refunds and payouts until 30 days after the last one. Nothing is deleted.</p>
        </Card>
        <Card>
          <SectionTitle title="What you're using" />
          <ul className="space-y-4">
            {sub.usage.map((u) => (
              <li key={u.label}>
                <div className="flex justify-between text-sm"><span>{u.label}</span><span className="font-semibold tabular-nums">{u.used.toLocaleString()}{u.limit ? ` of ${u.limit.toLocaleString()}` : ""}</span></div>
                {u.limit ? <Progress className="mt-1.5" value={(u.used / u.limit) * 100} tone={u.low ? "marigold" : "kafue"} /> : <p className="text-xs text-ink-3">No limit on your plan</p>}
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <SectionTitle title="Plans" action={<div className="flex rounded-lg border border-line p-0.5 text-sm">{["Monthly", "Annual"].map((p) => <button key={p} onClick={() => setAnnual(p === "Annual")} className={cx("rounded-md px-3 py-1", (p === "Annual") === annual ? "bg-kafue text-white dark:text-[#0f1522]" : "text-ink-2")}>{p}{p === "Annual" ? ", 2 months free" : ""}</button>)}</div>} />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {plans.map((p, i) => (
          <Card key={p.key} className={cx(i === current && "border-2 border-kafue")}>
            <div className="flex items-center justify-between"><p className="text-lg font-semibold">{p.key}</p>{i === current && <Badge tone="teal">Your plan</Badge>}</div>
            <p className="font-display mt-2 text-3xl font-bold">{p.monthly === null ? "Contract" : p.monthly === 0 ? "K0" : kwacha(annual ? p.annual! : p.monthly)}<span className="text-sm font-normal text-ink-3">{p.monthly ? (annual ? " a year" : " a month") : ""}</span></p>
            <p className="text-sm text-ink-3">{feeText(p)}</p>
            <p className="mt-2 text-sm">{p.blurb}</p>
            <p className="mt-2 text-xs text-ink-3">{p.team ? `${p.team} team members` : "Unlimited team members"}</p>
            {i !== current && <Button size="sm" variant={i > current ? "primary" : "secondary"} className="mt-4 w-full" onClick={() => (p.key === "Enterprise" ? toast("Request sent. EMS sales will call you within 1 business day.") : setSwitchTo(p.key))}>{p.key === "Enterprise" ? "Talk to us" : i > current ? `Upgrade to ${p.key}` : `Move to ${p.key}`}</Button>}
          </Card>
        ))}
      </div>
      <Card pad={false} className="mt-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-line text-ink-3"><th className="px-5 py-3 text-left font-medium">Included</th>{order.map((k) => <th key={k} className="px-3 py-3 font-medium">{k}</th>)}</tr></thead>
            <tbody>{features.map(([f, ...v]) => <tr key={f} className="border-b border-line last:border-0"><td className="px-5 py-2.5">{f}</td>{v.map((x, i) => <td key={i} className="text-center">{x ? <Check size={16} className="mx-auto text-leaf" aria-label="Included" /> : <Minus size={16} className="mx-auto text-ink-3" aria-label="Not included" />}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </Card>

      <div id="addons" />
      <SectionTitle title="Add-ons" />
      <div className="grid gap-4 md:grid-cols-2">
        {api.billing.addOns().map((a) => (
          <Card key={a.name} className="flex items-center justify-between gap-3">
            <div><p className="font-semibold">{a.name}</p><p className="text-sm text-ink-3">{kwacha(a.price)} for {a.unit}</p></div>
            <Button size="sm" onClick={() => { setAddon(a.name); setQty(a.name === "SMS credits" ? 5 : 1); }}>Buy</Button>
          </Card>
        ))}
      </div>

      <SectionTitle title="EMS invoices" sub="What you pay EMS. Ticket fees aren't invoiced; they're shown on each settlement statement." />
      <Table rows={sub.invoices} columns={[
        { key: "ref", label: "Invoice", render: (r) => <span className="font-mono text-xs">{r.ref}</span> },
        { key: "date", label: "Date", render: (r) => fmtDate(r.date, { day: "numeric", month: "short", year: "numeric" }) },
        { key: "what", label: "For" },
        { key: "amount", label: "Amount", align: "right", render: (r) => kwacha(r.amount) },
        { key: "status", label: "Status", render: () => <Badge tone="green">Paid</Badge> },
        { key: "a", label: "", render: () => <Button size="sm" variant="ghost" onClick={() => toast("Invoice PDF downloaded")}>Download</Button> },
      ]} />

      <Modal open={!!switchTo} onClose={() => setSwitchTo(null)} title={`Move to ${switchTo}`} footer={<><Button variant="ghost" onClick={() => setSwitchTo(null)}>Cancel</Button><Button onClick={() => { toast(`Plan change booked. You move to ${switchTo} on ${fmtDate(sub.renews, { day: "numeric", month: "long" })}.`); setSwitchTo(null); }}>Confirm change</Button></>}>
        {switchTo && (
          <div className="space-y-3 text-sm">
            <p>The change starts at your next renewal on {fmtDate(sub.renews, { day: "numeric", month: "long", year: "numeric" })}. Events already published keep the fees they were published with.</p>
            <p>New fee on paid tickets: <strong>{feeText(plans[order.indexOf(switchTo)])}</strong></p>
            {lost.length > 0 && <div className="rounded-lg bg-hibiscus-soft p-3"><p className="font-semibold text-hibiscus">You would lose</p><ul className="mt-1 list-disc pl-5">{lost.map((l) => <li key={l}>{l}</li>)}</ul><p className="mt-2 text-xs">Your data in those tools is kept read-only, so nothing is lost if you upgrade again.</p></div>}
          </div>
        )}
      </Modal>
      <Modal open={!!addon} onClose={() => setAddon(null)} title={`Buy ${addon?.toLowerCase()}`} footer={<><Button variant="ghost" onClick={() => setAddon(null)}>Cancel</Button><Button onClick={() => { toast("Invoice sent with a payment link. Credits are added as soon as it's paid."); setAddon(null); }}>Pay {kwacha(qty * (api.billing.addOns().find((a) => a.name === addon)?.price ?? 0))}</Button></>}>
        <div className="space-y-4">
          <Field label={addon === "SMS credits" ? "Bundles of 1,000 messages" : "People"}><Input inputMode="numeric" value={qty} onChange={(e) => setQty(Math.max(1, Number(e.target.value.replace(/\D/g, "")) || 1))} /></Field>
          <Field label="Pay with"><Select options={["Visa ending 4417", "MTN MoMo (we'll send a prompt)", "Airtel Money (we'll send a prompt)", "Invoice with payment link"]} /></Field>
        </div>
      </Modal>
    </>
  );
}
