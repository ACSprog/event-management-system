"use client";

import { useState } from "react";
import { Plus, ShieldCheck } from "lucide-react";
import { Avatar, Badge, Button, Card, Field, Input, Modal, PageHeader, SectionTitle, Table, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { fmtDate } from "@/lib/brand";

export default function FinanceSettings() {
  const toast = useToast();
  const st = api.settlements.financeSettings();
  const [holidays, setHolidays] = useState(api.settlements.holidays().filter((h) => h.date >= "2026-11-17"));
  const [add, setAdd] = useState(false);
  const [h, setH] = useState({ date: "", name: "" });
  const staff = api.settlements.staff();

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

      <SectionTitle title="Approval limits" sub="How much each finance person can approve alone. Roles and permissions are on Staff and roles." action={<Button size="sm" variant="secondary" href="/admin/team/">Staff and roles</Button>} />
      <Table rows={staff.filter((p) => p.key === "finance_officer" || p.key === "finance_manager")} columns={[
        { key: "name", label: "Person", render: (p) => <span className="flex items-center gap-2"><Avatar name={p.name} size={28} />{p.name}</span> },
        { key: "role", label: "Role" },
        { key: "limit", label: "Approves alone up to", render: (p) => (p.limit === null ? "Any amount" : <Input aria-label={`Limit for ${p.name}`} className="w-32" defaultValue={p.limit} inputMode="numeric" />) },
        { key: "second", label: "Second approvals", render: (p) => (p.key === "finance_manager" ? <Badge tone="green">Yes</Badge> : <Badge tone="grey">No</Badge>) },
        { key: "mfa", label: "2-step", render: (p) => (p.mfa ? <Badge tone="green"><ShieldCheck size={11} /> On</Badge> : <Badge tone="red">Off</Badge>) },
      ]} />

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
