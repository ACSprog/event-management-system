"use client";

import { useRouter } from "next/navigation";
import { Card, PageHeader, SectionTitle, Stat, Table } from "@/components/ui";
import { Countdown, NoEarlyPayouts, SettlementBadge } from "@/components/settlement";
import { api, payable, heldAmount, type Settlement } from "@/lib/api";
import { fmtDate, kwacha } from "@/lib/brand";

const steps = [
  ["Event ends", "Ticket sales stop. The event is marked finished automatically once its end time passes."],
  ["Reconciliation", "Within 3 business days EMS matches every payment, refund and charge, and sends you a statement."],
  ["You check it", "You have 2 business days to accept it or dispute a line. No reply counts as accepted."],
  ["EMS approval", "EMS finance approves it. Amounts over K50,000 need two approvers."],
  ["Payout", "Paid to your verified account within 2 business days, in one payment."],
];

export default function Settlements() {
  const router = useRouter();
  const rows = api.settlements.list("org1");
  const open = rows.filter((s) => !["SETTLED", "CANCELLED", "AWAITING_EVENT_COMPLETION"].includes(s.status));
  const held = rows.filter((s) => s.status === "AWAITING_EVENT_COMPLETION").reduce((a, s) => a + payable(s), 0);
  const paidYear = rows.filter((s) => s.status === "SETTLED" && s.payout?.at?.startsWith("2026")).reduce((a, s) => a + payable(s), 0);
  const review = rows.find((s) => s.status === "ORGANISER_REVIEW");

  return (
    <>
      <PageHeader title="Settlements" sub="One statement and one payment for every event, after it has happened." />
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Held for upcoming events" value={kwacha(held)} hint="Estimated, after fees and charges" />
        <Stat label="Being settled now" value={kwacha(open.reduce((a, s) => a + payable(s) - heldAmount(s), 0))} hint={`${open.length} events`} />
        <Stat label="Paid out this year" value={kwacha(paidYear)} />
      </div>

      {review && (
        <button onClick={() => router.push(`/org/finance/settlements/${review.ref}/`)} className="mt-6 w-full rounded-xl border-2 border-marigold bg-marigold-soft p-4 text-left">
          <p className="font-semibold">Your statement for {review.event} is ready to check</p>
          <p className="text-sm text-ink-2">Accept it or dispute a line by the end of today. If you do nothing, it counts as accepted and goes to EMS for approval.</p>
        </button>
      )}

      <SectionTitle title="All settlements" />
      <Table<Settlement>
        rows={rows}
        onRow={(s) => router.push(`/org/finance/settlements/${s.ref}/`)}
        columns={[
          { key: "event", label: "Event", render: (s) => <><p className="font-semibold">{s.event}</p><p className="font-mono text-xs text-ink-3">{s.ref}</p></> },
          { key: "ended", label: "Ended", render: (s) => fmtDate(s.ended, { day: "numeric", month: "short", year: "numeric" }) },
          { key: "status", label: "Status", render: (s) => <SettlementBadge s={s} /> },
          { key: "next", label: "Next step", render: (s) => s.status === "SETTLED" ? <span className="text-sm text-ink-3">Paid {fmtDate(s.payout!.at!, { day: "numeric", month: "short" })}</span> : <Countdown s={s} /> },
          { key: "amount", label: "Amount to you", align: "right", render: (s) => <span className="tabular-nums">{kwacha(payable(s) - heldAmount(s))}{s.status === "AWAITING_EVENT_COMPLETION" && <span className="block text-xs text-ink-3">so far</span>}</span> },
        ]}
      />

      <Card className="mt-6">
        <SectionTitle title="How settlement works" />
        <ol className="grid gap-4 md:grid-cols-5">
          {steps.map(([t, b], i) => (
            <li key={t}>
              <p className="font-display text-2xl font-bold text-kafue">{i + 1}</p>
              <p className="font-semibold">{t}</p>
              <p className="mt-1 text-sm text-ink-3">{b}</p>
            </li>
          ))}
        </ol>
        <NoEarlyPayouts className="mt-5 border-t border-line pt-4" />
      </Card>
    </>
  );
}
