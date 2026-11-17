"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, FileText, Lock, ShieldCheck } from "lucide-react";
import { Button, Card, Field, Input, Modal, PageHeader, SectionTitle, Select, Textarea, useToast } from "@/components/ui";
import { Countdown, SettlementBadge, SettlementTimeline, StatementTable } from "@/components/settlement";
import { api, arrangementLabel, payable, heldAmount, settlementStatus, type Settlement, type StaffRole } from "@/lib/api";
import { fmtDate, kwacha } from "@/lib/brand";

const TODAY = "2026-11-17";

export function AdminSettlement({ ref_ }: { ref_: string }) {
  const toast = useToast();
  const settings = api.settlements.financeSettings();
  const staff = api.settlements.staff().filter((p) => p.role === "Platform finance officer" || p.role === "Platform finance manager");
  const [me, setMe] = useState(staff.find((p) => p.name === "Natasha Zulu")!);
  const [s, setS] = useState<Settlement>(api.settlements.get(ref_)!);
  const [adjust, setAdjust] = useState(false);
  const [adj, setAdj] = useState({ amount: "", reason: "", sign: "Add to the organiser's payout" });
  const [adjErr, setAdjErr] = useState("");
  const [reject, setReject] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const amount = payable(s) - heldAmount(s);
  const need = payable(s) >= settings.dualThreshold ? 2 : 1;
  const isManager = me.role === "Platform finance manager";
  const withinLimit = me.limit === null || amount <= me.limit;
  const alreadyApproved = s.approvals.some((a) => a.by === me.name);
  const log = (what: string, patch: Partial<Settlement> = {}) => setS((cur) => ({ ...cur, ...patch, history: [...cur.history, { at: TODAY, what, who: me.name }] }));

  const approve = () => {
    const approvals = [...s.approvals, { by: me.name, role: me.role as StaffRole, at: TODAY }];
    const done = approvals.length >= need;
    log(`Approved (${approvals.length} of ${need})`, { approvals, status: done ? "APPROVED" : "AWAITING_SECOND_APPROVAL" });
    toast(done ? "Approved. You can start the payout." : "First approval recorded. A different person must give the second approval.");
  };
  const saveAdjustment = () => {
    const n = Number(adj.amount.replace(/\D/g, ""));
    if (!n) return setAdjErr("Enter the amount.");
    if (adj.reason.trim().length < 10) return setAdjErr("Give a reason. It appears on the organiser's statement.");
    const signed = adj.sign.startsWith("Add") ? n : -n;
    log(`Adjustment ${signed > 0 ? "+" : "−"}${kwacha(n)}: ${adj.reason}`, { adjustments: [...(s.adjustments ?? []), { amount: signed, reason: adj.reason, by: me.name, at: TODAY }] });
    setAdjust(false);
    setAdj({ amount: "", reason: "", sign: "Add to the organiser's payout" });
    setAdjErr("");
    toast("Adjustment posted to the ledger as a new entry. The original records are unchanged.");
  };

  let action: React.ReactNode = null;
  let why = "";
  switch (s.status) {
    case "UNDER_FINANCE_REVIEW":
      action = <Button onClick={() => { log("Finance review finished, no material discrepancies", { status: "AWAITING_APPROVAL" }); toast("Review finished. Ready for approval."); }}><ShieldCheck size={16} /> Finish review</Button>;
      break;
    case "AWAITING_APPROVAL":
    case "AWAITING_SECOND_APPROVAL":
      if (alreadyApproved) why = "You gave the first approval. A different person must give the second.";
      else if (need === 1 && !withinLimit) why = `Your approval limit is ${kwacha(me.limit!)}. A finance manager must approve this.`;
      else if (s.status === "AWAITING_SECOND_APPROVAL" && !isManager) why = "Second approvals above the threshold must come from a finance manager.";
      action = <Button disabled={!!why} onClick={approve}><CheckCircle2 size={16} /> {s.status === "AWAITING_SECOND_APPROVAL" ? "Give second approval" : "Approve settlement"}</Button>;
      break;
    case "APPROVED":
      if (s.hold) why = "Payout is blocked until the organisation is verified.";
      action = <Button disabled={!!why} onClick={() => { log(`Payout of ${kwacha(amount)} sent to ${s.payTo}`, { status: "PAYOUT_PROCESSING", payout: { ref: `PO-${s.ref.slice(3)}` } }); toast("Payout sent. It's marked paid only when the provider confirms it."); }}>Start payout of {kwacha(amount)}</Button>;
      break;
    case "PAYOUT_PROCESSING":
      action = <Button variant="secondary" onClick={() => { log("Paid and confirmed by the provider", { status: "SETTLED", payout: { ...s.payout!, at: TODAY, providerRef: "STANBIC-EFT-889120" } }); toast("Confirmed by the provider. Settlement closed."); }}>Check payout status</Button>;
      break;
    case "FAILED":
      action = <><Button variant="secondary" onClick={() => toast("Organisation asked to update and re-verify its payout account")}>Ask organiser to fix the account</Button><Button disabled title="The account must be re-verified first">Retry with the same reference</Button></>;
      why = "Retrying uses the same payout reference, so the organiser can never be paid twice.";
      break;
  }

  return (
    <>
      <PageHeader
        back={{ href: "/admin/settlements/", label: "Settlements" }}
        title={s.event}
        sub={<span className="flex flex-wrap items-center gap-2"><SettlementBadge s={s} /> {s.orgName}, <span className="font-mono text-xs">{s.ref}</span></span>}
        actions={
          <label className="flex items-center gap-2 text-sm text-ink-3">
            Acting as
            <Select aria-label="Acting as" className="w-64" value={me.name} onChange={(e) => setMe(staff.find((p) => p.name === e.target.value)!)} options={staff.map((p) => p.name)} />
          </label>
        }
      />
      <p className="-mt-4 mb-6 text-xs text-ink-3">Showcase only: switch between finance staff to see the separation of duties. {me.name} is a {me.role.toLowerCase()}{me.limit ? `, approval limit ${kwacha(me.limit)}` : ", no approval limit"}.</p>

      <Card>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div><p className="font-semibold">{settlementStatus[s.status].who}</p>{s.hold && <p className="text-sm text-hibiscus">{s.hold}</p>}</div>
          <Countdown s={s} />
        </div>
        <SettlementTimeline s={s} />
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          <SectionTitle title="Statement" sub="Generated from the ledger. The payout amount cannot be typed in; it is always this total." action={["UNDER_FINANCE_REVIEW", "DISPUTED", "AWAITING_APPROVAL"].includes(s.status) ? <Button size="sm" variant="secondary" onClick={() => setAdjust(true)}>Add adjustment</Button> : undefined} />
          <StatementTable s={s} />

          {s.dispute?.status === "Open" && (
            <Card className="border-hibiscus">
              <p className="flex items-center gap-2 font-semibold text-hibiscus"><AlertTriangle size={16} /> Dispute on {s.dispute.line.toLowerCase()}: {kwacha(s.dispute.amount)}</p>
              <p className="mt-2 text-sm">&ldquo;{s.dispute.reason}&rdquo;</p>
              <p className="mt-1 text-xs text-ink-3">{s.dispute.by}, {fmtDate(s.dispute.at, { day: "numeric", month: "short" })}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={() => { log(`Dispute upheld: +${kwacha(s.dispute!.amount)}`, { status: "UNDER_FINANCE_REVIEW", dispute: { ...s.dispute!, status: "Resolved" }, adjustments: [...(s.adjustments ?? []), { amount: s.dispute!.amount, reason: "Dispute upheld: refunds paid by the organiser in cash", by: me.name, at: TODAY }] }); toast("Dispute upheld. Adjustment added; the statement goes back to review."); }}>Uphold and adjust</Button>
                <Button variant="secondary" onClick={() => setReject(true)}>Reject with reason</Button>
              </div>
            </Card>
          )}

          <Card>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="font-semibold">Next action</p>
                <p className="text-sm text-ink-3">{need === 2 ? `Over ${kwacha(settings.dualThreshold)}: two different approvers needed.` : `Under ${kwacha(settings.dualThreshold)}: one approval needed.`} {s.approvals.length ? `Approved by ${s.approvals.map((a) => a.by).join(" and ")}.` : ""}</p>
              </div>
              <div className="flex flex-wrap gap-2">{action ?? <span className="text-sm text-ink-3">Nothing for finance to do at this step.</span>}</div>
            </div>
            {why && <p className="mt-3 flex items-center gap-2 text-sm text-ink-2"><Lock size={14} /> {why}</p>}
            {s.payout?.error && <p className="mt-3 rounded-lg bg-hibiscus-soft p-3 text-sm text-hibiscus">{s.payout.error}</p>}
          </Card>
        </div>

        <div className="space-y-4">
          <Card>
            <SectionTitle title="Reconciliation checks" />
            <ul className="space-y-2 text-sm">
              {[
                [`${s.tickets.toLocaleString()} payments matched to provider statements`, true],
                ["Refunds and chargebacks matched", true],
                ["Provider charges agree with statements", true],
                ["No open material discrepancies", s.status !== "DISPUTED"],
                ["Organisation and payout account verified", !s.hold && s.status !== "FAILED"],
              ].map(([t, ok]) => <li key={t as string} className="flex gap-2">{ok ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-leaf" /> : <AlertTriangle size={16} className="mt-0.5 shrink-0 text-hibiscus" />}{t}</li>)}
            </ul>
          </Card>
          <Card>
            <SectionTitle title="Terms" />
            <dl className="space-y-2 text-sm">
              <div><dt className="text-ink-3">Arrangement</dt><dd className="font-semibold">{arrangementLabel[s.arrangement]}{s.agreement ? ` (${s.agreement})` : ""}</dd></div>
              <div><dt className="text-ink-3">EMS earns</dt><dd className="font-semibold">{kwacha(s.emsFee)}{s.bookingFees ? ` + ${kwacha(s.bookingFees)} booking fees` : ""}</dd></div>
              <div><dt className="text-ink-3">Pay to</dt><dd className="font-semibold">{s.payTo}</dd></div>
            </dl>
          </Card>
          <Card>
            <SectionTitle title="Audit trail" />
            <ol className="space-y-3 text-sm">
              {s.history.map((h, i) => <li key={i} className="flex gap-3"><FileText size={14} className="mt-1 shrink-0 text-ink-3" /><div><p>{h.what}</p><p className="text-xs text-ink-3">{h.who}, {fmtDate(h.at, { day: "numeric", month: "short", year: "numeric" })}</p></div></li>)}
            </ol>
          </Card>
        </div>
      </div>

      <Modal open={adjust} onClose={() => setAdjust(false)} title="Add an adjustment" footer={<><Button variant="ghost" onClick={() => setAdjust(false)}>Cancel</Button><Button onClick={saveAdjustment}>Post adjustment</Button></>}>
        <div className="space-y-4">
          <Field label="Direction"><Select value={adj.sign} onChange={(e) => setAdj({ ...adj, sign: e.target.value })} options={["Add to the organiser's payout", "Take off the organiser's payout"]} /></Field>
          <Field label="Amount (K)" error={adjErr}><Input inputMode="numeric" value={adj.amount} onChange={(e) => setAdj({ ...adj, amount: e.target.value })} /></Field>
          <Field label="Reason" hint="Shown on the organiser's statement"><Textarea value={adj.reason} onChange={(e) => setAdj({ ...adj, reason: e.target.value })} /></Field>
          <Field label="Evidence"><div className="rounded-lg border-2 border-dashed border-line p-4 text-center text-sm text-ink-3">Attach receipts or provider statements</div></Field>
          <p className="text-xs text-ink-3">Adjustments are new ledger entries. Original payments and refunds are never changed.</p>
        </div>
      </Modal>
      <Modal open={reject} onClose={() => setReject(false)} title="Reject the dispute" footer={<><Button variant="ghost" onClick={() => setReject(false)}>Cancel</Button><Button variant="danger" onClick={() => { log(`Dispute rejected: ${rejectReason || "no reason given"}`, { status: "UNDER_FINANCE_REVIEW", dispute: { ...s.dispute!, status: "Resolved" } }); setReject(false); toast("Dispute rejected. The organiser has been told why."); }}>Reject dispute</Button></>}>
        <Field label="Reason the organiser will see"><Textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="e.g. The 14 refunds were made through MTN by EMS on 2 November; no cash refunds were recorded." /></Field>
      </Modal>
    </>
  );
}
