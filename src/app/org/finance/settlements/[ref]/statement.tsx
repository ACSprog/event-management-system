"use client";

import { useState } from "react";
import { CheckCircle2, Download, FileText, Paperclip } from "lucide-react";
import { Badge, Button, Card, Field, Input, Modal, PageHeader, SectionTitle, Select, Textarea, useToast } from "@/components/ui";
import { useOrgRole } from "@/components/layout/org-role";
import { Countdown, NoEarlyPayouts, SettlementBadge, SettlementTimeline, StatementTable } from "@/components/settlement";
import { api, arrangementLabel, collectionLabel, settlementStatus, statementLines, type Settlement } from "@/lib/api";
import { fmtDate, kwacha } from "@/lib/brand";

export function Statement({ ref_ }: { ref_: string }) {
  const toast = useToast();
  const { can } = useOrgRole();
  const [s, setS] = useState<Settlement>(api.settlements.get(ref_)!);
  const [dispute, setDispute] = useState<{ line: string; amount: number } | null>(null);
  const [reason, setReason] = useState("");
  const [err, setErr] = useState("");
  const terms = s.eventSlug ? api.settlements.termsFor(api.events.bySlug(s.eventSlug)?.id ?? "") : null;
  const reviewing = s.status === "ORGANISER_REVIEW" && can("settlements.review");
  const statementReady = !["AWAITING_EVENT_COMPLETION", "RECONCILIATION_PENDING"].includes(s.status);
  const deductible = statementLines(s).filter((l) => l.amount < 0);

  const accept = () => {
    setS({ ...s, status: "UNDER_FINANCE_REVIEW", history: [...s.history, { at: "2026-11-17", what: "Statement accepted", who: "You" }] });
    toast("Statement accepted. EMS finance will approve it and pay you within 2 business days.");
  };
  const sendDispute = () => {
    if (reason.trim().length < 15) return setErr("Explain what is wrong in a sentence or two, so EMS finance can check it.");
    setS({ ...s, status: "DISPUTED", dispute: { line: dispute!.line, amount: dispute!.amount, reason, by: "You", at: "2026-11-17", status: "Open" }, history: [...s.history, { at: "2026-11-17", what: `Dispute raised on ${dispute!.line.toLowerCase()} (${kwacha(dispute!.amount)})`, who: "You" }] });
    setDispute(null);
    setReason("");
    setErr("");
    toast("Dispute sent. The amount is held; EMS finance usually replies within 1 business day.");
  };

  return (
    <>
      <PageHeader
        back={{ href: "/org/finance/settlements/", label: "Settlements" }}
        title={s.event}
        sub={<span className="flex flex-wrap items-center gap-2"><SettlementBadge s={s} /><span className="font-mono text-xs">{s.ref}</span> Event ended {fmtDate(s.ended, { day: "numeric", month: "long", year: "numeric" })}</span>}
        actions={statementReady ? <Button variant="secondary" onClick={() => toast("Statement PDF downloaded")}><Download size={15} /> Download statement</Button> : undefined}
      />

      <Card>
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-semibold">{settlementStatus[s.status].who}</p>
            {s.hold && <p className="text-sm text-hibiscus">{s.hold}</p>}
          </div>
          <Countdown s={s} />
        </div>
        <SettlementTimeline s={s} />
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_340px]">
        <div>
          <SectionTitle
            title={statementReady ? "Statement" : "Expected statement"}
            sub={statementReady ? "Every line comes from the payment records. Nothing here can be edited; corrections are added as separate lines." : "Based on sales so far. The final statement comes after reconciliation."}
          />
          <StatementTable s={s} disputable={reviewing} onDispute={(line, amount) => setDispute({ line, amount })} />

          {reviewing && (
            <Card className="mt-4 flex flex-wrap items-center justify-between gap-3 border-marigold">
              <div>
                <p className="font-semibold">Is this statement right?</p>
                <p className="text-sm text-ink-3">Accept it, or press Dispute next to the line that is wrong. No reply by the end of the review period counts as accepted.</p>
              </div>
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setDispute({ line: deductible[0].label, amount: -deductible[0].amount })}>Dispute a line</Button>
                <Button onClick={accept}><CheckCircle2 size={16} /> Accept statement</Button>
              </div>
            </Card>
          )}
          {s.status === "ORGANISER_REVIEW" && !can("settlements.review") && <p className="mt-3 text-sm text-ink-3">Your organisation admin or finance officer can accept or dispute this statement.</p>}

          {s.dispute && (
            <Card className="mt-4">
              <div className="flex items-center justify-between"><p className="font-semibold">Dispute on {s.dispute.line.toLowerCase()}</p><Badge tone={s.dispute.status === "Open" ? "red" : "green"}>{s.dispute.status}</Badge></div>
              <p className="mt-2 text-sm text-ink-2">&ldquo;{s.dispute.reason}&rdquo;</p>
              <p className="mt-1 text-xs text-ink-3">{s.dispute.by}, {fmtDate(s.dispute.at, { day: "numeric", month: "short" })}. {kwacha(s.dispute.amount)} is held until EMS finance resolves it; the rest is paid as normal.</p>
              {s.dispute.status === "Open" && <Button size="sm" variant="secondary" className="mt-3" onClick={() => toast("Receipts uploaded and sent to EMS finance")}><Paperclip size={14} /> Add receipts or evidence</Button>}
            </Card>
          )}

          {s.payout?.at && (
            <Card className="mt-4 flex flex-wrap items-center gap-3">
              <CheckCircle2 className="text-leaf" />
              <div className="flex-1 text-sm"><p className="font-semibold">Paid on {fmtDate(s.payout.at, { day: "numeric", month: "long", year: "numeric" })}</p><p className="text-ink-3">{s.payTo}. Reference {s.payout.ref}, provider reference {s.payout.providerRef}.</p></div>
            </Card>
          )}
        </div>

        <div className="space-y-4">
          <Card>
            <SectionTitle title="Terms for this event" />
            <dl className="space-y-3 text-sm">
              <div><dt className="text-ink-3">How EMS earns</dt><dd className="font-semibold">{arrangementLabel[s.arrangement]}</dd></div>
              <div><dt className="text-ink-3">Fee</dt><dd className="font-semibold">{s.arrangement === "PARTNERSHIP" ? `EMS ${s.sharePct}% of sales after refunds and charges` : s.feeLabel}</dd></div>
              {s.agreement && <div><dt className="text-ink-3">Agreement</dt><dd className="font-mono text-xs font-semibold">{s.agreement}</dd></div>}
              <div><dt className="text-ink-3">Ticket money</dt><dd className="font-semibold">{collectionLabel[terms?.collection ?? "CENTRAL"]}</dd></div>
              <div><dt className="text-ink-3">Paid to</dt><dd className="font-semibold">{s.payTo}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-ink-3">Terms were fixed when the event was published. Later price changes don&rsquo;t affect it.</p>
          </Card>
          <Card>
            <SectionTitle title="History" />
            <ol className="space-y-3 text-sm">
              {s.history.map((h, i) => (
                <li key={i} className="flex gap-3">
                  <FileText size={14} className="mt-1 shrink-0 text-ink-3" />
                  <div><p>{h.what}</p><p className="text-xs text-ink-3">{h.who}, {fmtDate(h.at, { day: "numeric", month: "short", year: "numeric" })}</p></div>
                </li>
              ))}
            </ol>
          </Card>
          <NoEarlyPayouts />
        </div>
      </div>

      <Modal open={!!dispute} onClose={() => setDispute(null)} title="Dispute a line" footer={<><Button variant="ghost" onClick={() => setDispute(null)}>Cancel</Button><Button onClick={sendDispute}>Send dispute</Button></>}>
        {dispute && (
          <div className="space-y-4">
            <Field label="Which line is wrong?">
              <Select value={dispute.line} onChange={(e) => { const l = deductible.find((x) => x.label === e.target.value)!; setDispute({ line: l.label, amount: -l.amount }); }} options={deductible.map((l) => l.label)} />
            </Field>
            <Field label="Amount you dispute (K)" hint={`Up to ${kwacha(dispute.amount)}`}>
              <Input inputMode="numeric" value={dispute.amount} onChange={(e) => setDispute({ ...dispute, amount: Number(e.target.value.replace(/\D/g, "")) })} />
            </Field>
            <Field label="What is wrong?" error={err}><Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. These refunds were paid by us in cash at the venue, so they shouldn't be deducted again." /></Field>
            <p className="text-xs text-ink-3">The disputed amount is held. Everything else is approved and paid as normal.</p>
          </div>
        )}
      </Modal>
    </>
  );
}
