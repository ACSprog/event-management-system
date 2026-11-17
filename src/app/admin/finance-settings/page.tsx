"use client";

import { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import { Avatar, Badge, Button, Card, Field, Input, Modal, PageHeader, SectionTitle, Table, useToast } from "@/components/ui";
import { api, staffRoleCan, type StaffRole } from "@/lib/api";
import { fmtDate, kwacha } from "@/lib/brand";

export default function FinanceSettings() {
  const toast = useToast();
  const st = api.settlements.financeSettings();
  const [holidays, setHolidays] = useState(api.settlements.holidays().filter((h) => h.date >= "2026-11-17"));
  const [add, setAdd] = useState(false);
  const [h, setH] = useState({ date: "", name: "" });
  const staff = api.settlements.staff();
  const roles = Object.keys(staffRoleCan) as StaffRole[];

  return (
    <>
      <PageHeader title="Finance settings" sub="Settlement deadlines, approval rules and the people allowed to approve. Changes need a second person from finance to confirm." />

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <SectionTitle title="Settlement deadlines" sub="Business days: weekends and public holidays don't count" />
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Reconciliation" hint="After the event ends"><Input defaultValue={st.reconcileDays} inputMode="numeric" /></Field>
            <Field label="Organiser review" hint="No reply counts as accepted"><Input defaultValue={st.reviewDays} inputMode="numeric" /></Field>
            <Field label="Approval and payout" hint="After review"><Input defaultValue={st.payoutDays} inputMode="numeric" /></Field>
          </div>
          <p className="rounded-lg bg-surface-2 p-3 text-sm"><span className="font-semibold">Fixed rule:</span> no early, partial or milestone payouts. Organisers are paid once, after the event. This can&rsquo;t be changed here.</p>
          <Button onClick={() => toast("Sent to a second finance person to confirm")}>Save deadlines</Button>
        </Card>
        <Card className="space-y-4">
          <SectionTitle title="Approval rules" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Two approvers above (K)"><Input defaultValue={st.dualThreshold} inputMode="numeric" /></Field>
            <Field label="Wait after payout account change (hours)"><Input defaultValue={st.accountChangeWaitHours} inputMode="numeric" /></Field>
            <Field label="Material discrepancy"><Input defaultValue={st.materialDiscrepancy} /></Field>
            <Field label="Chargebacks after payout"><Input defaultValue={st.chargebackRecovery} /></Field>
            <Field label="Subscription grace period (days)"><Input defaultValue={st.graceDays} inputMode="numeric" /></Field>
          </div>
          <Button onClick={() => toast("Sent to a second finance person to confirm")}>Save rules</Button>
        </Card>
      </div>

      <SectionTitle title="Platform staff" sub="EMS's own people. These roles are separate from organisers' team roles: nobody in an organiser's team can approve a settlement." action={<Button size="sm" onClick={() => toast("Invitation sent")}><Plus size={14} /> Add staff</Button>} />
      <Card pad={false}>
        <ul className="divide-y divide-line">
          {staff.map((p) => (
            <li key={p.name} className="flex flex-wrap items-center gap-3 px-5 py-3">
              <Avatar name={p.name} />
              <div className="min-w-0 flex-1"><p className="font-semibold">{p.name}</p><p className="text-xs text-ink-3">{p.role}</p></div>
              <span className="text-sm text-ink-2">{p.limit === null ? (p.role === "Platform owner" ? "Cannot approve settlements" : "No approval limit") : p.limit ? `Approves up to ${kwacha(p.limit)}` : "No approvals"}</span>
              {p.mfa ? <Badge tone="green"><ShieldCheck size={11} /> 2-step on</Badge> : <Badge tone="red">2-step off</Badge>}
            </li>
          ))}
        </ul>
      </Card>
      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {roles.map((r) => (
          <Card key={r} className="p-4">
            <p className="font-semibold">{r}</p>
            <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-ink-3">{staffRoleCan[r].map((c) => <li key={c}>{c}</li>)}</ul>
          </Card>
        ))}
      </div>

      <SectionTitle title="Public holidays" sub="Used to count business days for settlement deadlines" action={<Button size="sm" variant="secondary" onClick={() => setAdd(true)}><Plus size={14} /> Add holiday</Button>} />
      <Table rows={holidays} columns={[
        { key: "date", label: "Date", render: (r) => fmtDate(r.date, { weekday: "short", day: "numeric", month: "long", year: "numeric" }) },
        { key: "name", label: "Holiday" },
        { key: "a", label: "", render: (r) => <Button size="sm" variant="ghost" onClick={() => setHolidays(holidays.filter((x) => x.date !== r.date))}>Remove</Button> },
      ]} />

      <Modal open={add} onClose={() => setAdd(false)} title="Add a public holiday" footer={<><Button variant="ghost" onClick={() => setAdd(false)}>Cancel</Button><Button onClick={() => { if (h.date && h.name) { setHolidays([...holidays, h].sort((a, b) => a.date.localeCompare(b.date))); setAdd(false); setH({ date: "", name: "" }); toast("Holiday added. Deadlines that fall after it move by one business day."); } }}>Add</Button></>}>
        <div className="space-y-4">
          <Field label="Date"><Input type="date" value={h.date} onChange={(e) => setH({ ...h, date: e.target.value })} /></Field>
          <Field label="Name" hint="Include declared or observed days, e.g. a Monday after a Sunday holiday"><Input value={h.name} onChange={(e) => setH({ ...h, name: e.target.value })} /></Field>
        </div>
      </Modal>
    </>
  );
}
