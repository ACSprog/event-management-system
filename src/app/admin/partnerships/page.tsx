"use client";

import { SelectOther } from "@/components/select-other";

import { useState } from "react";
import { CheckCircle2, Clock, ShieldAlert } from "lucide-react";
import { Badge, Button, Card, cx, Field, Input, Modal, PageHeader, Progress, SectionTitle, Select, Textarea, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function Partnerships() {
  const toast = useToast();
  const list = api.settlements.partnerships();
  const [sel, setSel] = useState(list[0].id);
  const [create, setCreate] = useState(false);
  const p = list.find((x) => x.id === sel)!;
  const spent = p.contributions.reduce((a, c) => a + c.amount, 0);
  const base = p.live ? p.live.gross - p.live.refunds - p.live.charges : 0;
  const emsShare = Math.round((base * p.share) / 100);

  return (
    <>
      <PageHeader title="Partnerships" sub="Revenue-share deals with selected organisers. Organisers can't pick this themselves: EMS sets the terms, both sides accept online, then events are linked." actions={<Button onClick={() => setCreate(true)}>New agreement</Button>} />
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <div className="space-y-2">
          {list.map((x) => (
            <button key={x.id} onClick={() => setSel(x.id)} className={cx("w-full rounded-xl border-2 p-4 text-left", sel === x.id ? "border-kafue bg-kafue-soft" : "border-line bg-surface hover:border-ink-3")}>
              <div className="flex items-center justify-between gap-2"><p className="font-semibold">{x.org}</p><Badge tone={x.status === "Active" ? "green" : x.status === "Application" ? "grey" : "gold"}>{x.status}</Badge></div>
              <p className="text-sm text-ink-3">{x.events.join(", ")}</p>
              <p className="mt-1 font-mono text-xs text-ink-3">{x.id}, EMS {x.share}%</p>
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <Card>
            <SectionTitle title={`${p.org}: ${p.events.join(", ")}`} sub={p.id} action={p.status === "Application" ? <Button size="sm" onClick={() => toast("Draft agreement created from the application")}>Draft terms</Button> : undefined} />
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div><dt className="text-ink-3">Split</dt><dd className="font-semibold">EMS {p.share}%, organiser {100 - p.share}%</dd></div>
              <div><dt className="text-ink-3">Shared amount</dt><dd className="font-semibold">{p.base}</dd></div>
              <div><dt className="text-ink-3">Costs that may be deducted</dt><dd className="font-semibold">{p.deductions.length ? p.deductions.join("; ") : "None"}</dd></div>
              <div><dt className="text-ink-3">Down payment</dt><dd className="font-semibold">{p.downPayment ? `${kwacha(p.downPayment)}, ${p.downTreatment.replace(/^./, (c) => c.toLowerCase())}` : "None"}</dd></div>
              <div><dt className="text-ink-3">If the event is cancelled</dt><dd className="font-semibold">{p.cancellation}</dd></div>
              <div><dt className="text-ink-3">Ticket money</dt><dd className="font-semibold">Collected by EMS, settled once after the event</dd></div>
            </dl>
            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {([["Organiser", p.accepted.org], ["EMS", p.accepted.ems]] as const).map(([who, at]) => (
                <div key={who} className="flex items-center gap-2 rounded-lg bg-surface-2 p-3 text-sm">
                  {at ? <CheckCircle2 size={16} className="text-leaf" /> : <Clock size={16} className="text-ink-3" />}
                  <span>{who} {at ? `accepted on ${at}` : "has not accepted yet"}</span>
                </div>
              ))}
            </div>
            {p.status === "Waiting for organiser" && <Button size="sm" variant="secondary" className="mt-3" onClick={() => toast("Reminder sent to Zed Live Entertainment")}>Remind organiser</Button>}
            <p className="mt-3 text-xs text-ink-3">Terms are frozen once both sides accept. Changes need a new version accepted by both.</p>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <SectionTitle title="EMS's exposure" sub="The most EMS can put into this deal" />
              {p.maxExposure ? (<>
                <p className="font-display text-2xl font-bold">{kwacha(spent)} <span className="text-base font-normal text-ink-3">of {kwacha(p.maxExposure)}</span></p>
                <Progress className="mt-2" value={(spent / p.maxExposure) * 100} tone={spent / p.maxExposure > 0.9 ? "marigold" : "kafue"} />
                <ul className="mt-3 space-y-1 text-sm">{p.contributions.map((c) => <li key={c.kind} className="flex justify-between"><span>{c.kind}</span><span className="tabular-nums">{kwacha(c.amount)}</span></li>)}</ul>
              </>) : <p className="text-sm text-ink-3">Set when the terms are drafted.</p>}
            </Card>
            <Card>
              <SectionTitle title="Live split" sub="Both sides see these same figures" />
              {p.live ? (
                <ul className="space-y-2 text-sm">
                  {[["Ticket sales", p.live.gross], ["Refunds", -p.live.refunds], ["Payment charges", -p.live.charges], ["Shared amount", base], [`EMS ${p.share}%`, emsShare], ["Less down payment already paid", -p.downPayment], [`Organiser ${100 - p.share}%, before agreed costs`, base - emsShare]].map(([k, v], i) => (
                    <li key={k as string} className={cx("flex justify-between", i === 3 && "border-t border-line pt-2 font-semibold")}><span>{k}</span><span className="tabular-nums">{(v as number) < 0 ? `(${kwacha(-(v as number))})` : kwacha(v as number)}</span></li>
                  ))}
                </ul>
              ) : <p className="text-sm text-ink-3">Starts when tickets go on sale.</p>}
            </Card>
          </div>

          <Card className="flex gap-3">
            <ShieldAlert className="shrink-0 text-ink-3" />
            <div className="text-sm">
              <p className="font-semibold">Fair to every organiser</p>
              <p className="text-ink-3">Partner events get no access to other organisers&rsquo; customers or sales, and no hidden boost in search or recommendations. Paid placement is always labelled Featured.</p>
            </div>
          </Card>
        </div>
      </div>

      <Modal open={create} onClose={() => setCreate(false)} title="New partnership agreement" footer={<><Button variant="ghost" onClick={() => setCreate(false)}>Cancel</Button><Button onClick={() => { setCreate(false); toast("Agreement sent to the organiser to accept online"); }}>Send to organiser</Button></>}>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Organisation"><Select options={api.orgs.list().filter((o) => o.status === "Active").map((o) => o.name)} /></Field>
          <Field label="EMS share (%)"><Input defaultValue="20" inputMode="numeric" /></Field>
          <SelectOther label="Shared amount" options={["Ticket sales minus refunds and payment charges", "Ticket sales minus refunds, charges and listed costs"]} other="Something else (describe)" prompt="How the shared amount is worked out" placeholder="e.g. Ticket and bar sales minus refunds and charges" />
          <Field label="Down payment (K)"><Input defaultValue="0" inputMode="numeric" /></Field>
          <SelectOther label="Down payment counts as" options={["Advance against EMS's share", "Non-refundable fee", "Refundable deposit"]} other="Something else (describe)" prompt="How the down payment is treated" placeholder="e.g. Half advance, half fee" />
          <Field label="Most EMS will put in (K)"><Input placeholder="e.g. 60000" inputMode="numeric" /></Field>
          <div className="sm:col-span-2"><Field label="Costs that may be deducted" hint="Only these, and only when approved"><Textarea placeholder="e.g. Stage and sound hire, up to K200,000" /></Field></div>
          <div className="sm:col-span-2"><Field label="If the event is cancelled"><Textarea placeholder="Buyers are refunded from held funds first. Then…" /></Field></div>
        </div>
      </Modal>
    </>
  );
}
