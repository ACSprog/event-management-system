"use client";

import Link from "next/link";
import { AlertTriangle, Check, Lock } from "lucide-react";
import { Badge, Button, cx } from "@/components/ui";
import { DEMO_TODAY, deadlines, heldAmount, holidayDates, payable, settlementStatus, settlementSteps, statementLines, type Settlement } from "@/lib/api";
import { businessDaysUntil } from "@/lib/business-days";
import { fmtDate, kwacha } from "@/lib/brand";

export const money = (n: number) => (n < 0 ? `(${kwacha(-n)})` : kwacha(n));
const day = (iso: string) => fmtDate(iso, { day: "numeric", month: "short", year: "numeric" });

export function SettlementBadge({ s }: { s: Settlement }) {
  const st = settlementStatus[s.status];
  return <Badge tone={s.hold ? "red" : st.tone}>{s.hold ? "Payout on hold" : st.label}</Badge>;
}

/** What happens next and by when, in business days. */
export function nextDeadline(s: Settlement): { label: string; date: string; left: number } | null {
  const d = deadlines(s.ended);
  const at = (label: string, date: string) => ({ label, date, left: businessDaysUntil(DEMO_TODAY, date, holidayDates) });
  switch (s.status) {
    case "AWAITING_EVENT_COMPLETION": return at("Event ends", s.ended);
    case "RECONCILIATION_PENDING": return at("Statement due", d.reconcile);
    case "ORGANISER_REVIEW": return at("Review closes", d.review);
    case "UNDER_FINANCE_REVIEW":
    case "AWAITING_APPROVAL":
    case "AWAITING_SECOND_APPROVAL":
    case "APPROVED": return at("Payout due", d.payout);
    default: return null;
  }
}

export function Countdown({ s }: { s: Settlement }) {
  const n = nextDeadline(s);
  if (!n) return <span className="text-ink-3">—</span>;
  const text = n.left < 0 ? `${-n.left} business day${n.left === -1 ? "" : "s"} overdue` : n.left === 0 ? "today" : `in ${n.left} business day${n.left === 1 ? "" : "s"}`;
  return (
    <span className={cx("text-sm", n.left < 0 ? "font-semibold text-hibiscus" : n.left === 0 ? "font-semibold text-[#a35f00] dark:text-marigold" : "text-ink-2")}>
      {n.label} {text}
      <span className="block text-xs font-normal text-ink-3">{day(n.date)}</span>
    </span>
  );
}

export function SettlementTimeline({ s }: { s: Settlement }) {
  const idx = settlementSteps.findIndex((x) => x.key.includes(s.status));
  const current = s.status === "CANCELLED" ? -1 : idx;
  const d = deadlines(s.ended);
  const dates = [s.ended, d.reconcile, d.review, d.payout, d.payout, s.payout?.at];
  return (
    <ol className="grid grid-cols-3 gap-y-4 sm:grid-cols-6">
      {settlementSteps.map((step, i) => {
        const done = i < current || s.status === "SETTLED";
        const now = i === current && s.status !== "SETTLED";
        const bad = now && (s.status === "DISPUTED" || s.status === "FAILED" || !!s.hold);
        return (
          <li key={step.label} className="relative pr-2">
            <div className="flex items-center gap-2">
              <span className={cx("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-xs font-bold",
                done ? "border-leaf bg-leaf text-white" : bad ? "border-hibiscus bg-hibiscus-soft text-hibiscus" : now ? "border-kafue bg-kafue-soft text-kafue-ink" : "border-line text-ink-3")}>
                {done ? <Check size={13} /> : bad ? "!" : i + 1}
              </span>
              {i < settlementSteps.length - 1 && <span className={cx("hidden h-0.5 flex-1 sm:block", done ? "bg-leaf" : "bg-line")} />}
            </div>
            <p className={cx("mt-2 text-xs font-semibold", now ? "text-ink" : "text-ink-3")}>{step.label}</p>
            {dates[i] && <p className="text-[11px] text-ink-3">{i === 0 || i === 5 ? "" : "by "}{day(dates[i]!)}</p>}
          </li>
        );
      })}
    </ol>
  );
}

export function StatementTable({ s, disputable, onDispute }: { s: Settlement; disputable?: boolean; onDispute?: (line: string, amount: number) => void }) {
  const lines = statementLines(s);
  const held = heldAmount(s);
  const total = payable(s);
  return (
    <div className="overflow-hidden rounded-xl border border-line">
      <table className="w-full text-sm">
        <tbody className="divide-y divide-line">
          {lines.map((l) => {
            const disputed = s.dispute?.status === "Open" && s.dispute.line === l.label;
            return (
              <tr key={l.key} className={disputed ? "bg-hibiscus-soft/50" : undefined}>
                <td className="px-5 py-3">
                  <p className={l.key === "gross" ? "font-semibold" : undefined}>{l.label}</p>
                  {l.note && <p className="text-xs text-ink-3">{l.note}</p>}
                  {disputed && <p className="mt-1 flex items-center gap-1 text-xs font-semibold text-hibiscus"><AlertTriangle size={12} /> Disputed: {kwacha(s.dispute!.amount)} held until resolved</p>}
                </td>
                <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums">{money(l.amount)}</td>
                {disputable && <td className="w-24 pr-3 text-right">{l.amount < 0 && <Button size="sm" variant="ghost" onClick={() => onDispute?.(l.label, -l.amount)}>Dispute</Button>}</td>}
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          {held > 0 && (
            <tr className="border-t border-line text-ink-2">
              <td className="px-5 py-2">Held while the dispute is resolved</td>
              <td className="px-5 py-2 text-right tabular-nums">({kwacha(held)})</td>
              {disputable && <td />}
            </tr>
          )}
          <tr className="border-t-2 border-ink/20 bg-surface-2">
            <td className="px-5 py-3 font-semibold">{s.status === "SETTLED" ? `Paid to ${s.payTo}` : `Payable to ${s.payTo}`}</td>
            <td className="font-display whitespace-nowrap px-5 py-3 text-right text-xl font-bold tabular-nums">{kwacha(total - held)}</td>
            {disputable && <td />}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}

/** Reminder shown wherever organisers see payouts. */
export function NoEarlyPayouts({ className }: { className?: string }) {
  return (
    <p className={cx("flex items-start gap-2 text-sm text-ink-3", className)}>
      <Lock size={15} className="mt-0.5 shrink-0" />
      <span>Ticket money is held safely until your event is over, so every buyer can be refunded if anything changes. You are paid once, after the event: statement within 3 business days, 2 days for you to check it, then payment within 2 business days. <Link href="/org/finance/settlements/" className="font-semibold text-kafue">How settlement works</Link></span>
    </p>
  );
}
