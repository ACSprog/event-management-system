"use client";

import { useState } from "react";
import { useAdminRole } from "@/components/layout/admin-role";
import { Badge, Button, Card, Field, Input, Modal, PageHeader, SectionTitle, Stat, Table, Textarea, useToast } from "@/components/ui";
import { api, type Cashout } from "@/lib/api";
import { kwacha } from "@/lib/brand";

const statusLabel: Record<Cashout["status"], { text: string; tone: "green" | "gold" | "red" | "grey" }> = {
  RELEASED: { text: "Released", tone: "green" },
  WAITING_FOR_FINANCE: { text: "Waiting for finance", tone: "gold" },
  AWAITING_SECOND_APPROVAL: { text: "Second approval", tone: "gold" },
  REJECTED: { text: "Rejected", tone: "red" },
};

/**
 * Contribution cashouts. Contribution money is separate from ticket money and
 * is non-refundable except for a system failure, so organisers may cash it out
 * before the event. Small cashouts are released automatically once every check
 * passes; this page is where finance handles the rest.
 */
export default function Cashouts() {
  const toast = useToast();
  const { can } = useAdminRole();
  const settings = api.contributions.settings();
  const threshold = api.settlements.financeSettings().dualThreshold;
  const [rows, setRows] = useState(api.contributions.cashouts());
  const [limit, setLimit] = useState(String(settings.dailyLimit));
  const [reject, setReject] = useState<Cashout | null>(null);
  const [reason, setReason] = useState("");
  const waiting = rows.filter((r) => r.status === "WAITING_FOR_FINANCE" || r.status === "AWAITING_SECOND_APPROVAL");

  const approve = (c: Cashout) => {
    const needsSecond = c.amount > threshold && c.status === "WAITING_FOR_FINANCE";
    setRows(rows.map((r) => (r.id === c.id ? { ...r, status: needsSecond ? "AWAITING_SECOND_APPROVAL" : "RELEASED" } : r)));
    toast(needsSecond ? "First approval recorded. A finance manager must give the second." : `${kwacha(c.amount)} released to ${c.to}.`);
  };

  return (
    <>
      <PageHeader title="Contribution cashouts" sub="Contributions are kept apart from ticket money and can be cashed out before the event. Ticket money still follows post-event settlement." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Waiting for finance" value={waiting.length} hint={kwacha(waiting.reduce((a, c) => a + c.amount, 0))} />
        <Stat label="Released automatically, last 7 days" value={rows.filter((r) => r.route === "AUTOMATIC" && r.status === "RELEASED").length} />
        <Stat label="Automatic limit per organisation" value={kwacha(settings.dailyLimit)} hint="Per day" />
      </div>

      <SectionTitle title="Cashouts" />
      <Table<Cashout>
        rows={rows}
        empty="No cashouts yet."
        columns={[
          { key: "org", label: "Organiser", render: (c) => <><p className="font-semibold">{c.orgName}</p><p className="text-xs text-ink-3">{c.occasion}</p></> },
          { key: "to", label: "Paid to", render: (c) => <span className="font-mono text-xs">{c.to}</span> },
          { key: "at", label: "Requested", render: (c) => <><p className="text-sm">{c.at}</p><p className="text-xs text-ink-3">{c.requestedBy}</p></> },
          { key: "route", label: "Route", render: (c) => (c.route === "AUTOMATIC" ? <Badge tone="teal">Automatic</Badge> : <Badge>Finance review</Badge>) },
          { key: "status", label: "Status", render: (c) => <Badge tone={statusLabel[c.status].tone}>{statusLabel[c.status].text}</Badge> },
          { key: "amount", label: "Amount", align: "right", render: (c) => <span className="tabular-nums">{kwacha(c.amount)}</span> },
          {
            key: "act", label: "", render: (c) => {
              const canAct = c.status === "WAITING_FOR_FINANCE" ? can("settlements.approve") : c.status === "AWAITING_SECOND_APPROVAL" ? can("settlements.second") : false;
              return canAct ? <span className="flex gap-2"><Button size="sm" onClick={() => approve(c)}>Approve</Button><Button size="sm" variant="ghost" onClick={() => setReject(c)}>Reject</Button></span> : null;
            },
          },
        ]}
      />

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <SectionTitle title="Automatic release" sub="Agreed 18 Nov 2026: small cashouts are released without finance review" />
          <ul className="space-y-1 text-sm text-ink-2">
            <li>✓ Organisation verified (PACRA and director ID, or NRC for families and individuals)</li>
            <li>✓ Payout account verified, and not changed in the last 48 hours</li>
            <li>✓ 2-step sign-in confirmed for the request</li>
            <li>✓ Funds cleared: mobile money on confirmation, cards after {settings.cardClearingDays} business days</li>
            <li>✓ Within the daily limit (a new organisation&rsquo;s first cashout is capped at {kwacha(settings.firstCashoutCap)})</li>
          </ul>
          <Field label="Daily automatic limit per organisation (K)" hint="Placeholder until the owner sets it. Changes need a second finance person to confirm."><Input value={limit} onChange={(e) => setLimit(e.target.value.replace(/\D/g, ""))} inputMode="numeric" disabled={!can("finance.settings")} /></Field>
          {can("finance.settings") && <Button onClick={() => (limit ? toast("Sent to a second finance person to confirm") : toast("Enter a limit"))}>Save limit</Button>}
        </Card>
        <Card className="space-y-3 text-sm">
          <SectionTitle title="Refunds of contributions" />
          <p>Contributions are non-refundable. The only exception is a system failure on EMS&rsquo;s side: a duplicate charge, a wrong amount charged, a payment taken but not recorded, or a contribution recorded against the wrong event by a platform error.</p>
          <p>Only finance can refund these, with the reason <span className="font-mono">SYSTEM_FAILURE</span> and evidence from the provider statement. EMS carries the cost, and the fee and provider charge are returned too. Above {kwacha(threshold)} two approvers are needed.</p>
        </Card>
      </div>

      <Modal open={!!reject} onClose={() => setReject(null)} title={`Reject ${reject?.id ?? ""}`} footer={<><Button variant="ghost" onClick={() => setReject(null)}>Cancel</Button><Button variant="danger" onClick={() => { if (!reason.trim()) return; setRows(rows.map((r) => (r.id === reject!.id ? { ...r, status: "REJECTED" } : r))); setReject(null); setReason(""); toast("Rejected. The amount is back in the organiser's available balance and they have been told why."); }}>Reject cashout</Button></>}>
        <Field label="Reason (sent to the organiser)" error={reason.trim() ? undefined : "A reason is required"}><Textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} /></Field>
      </Modal>
    </>
  );
}
