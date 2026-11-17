"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader, SectionTitle, Stat, Table, Tabs } from "@/components/ui";
import { Countdown, nextDeadline, SettlementBadge } from "@/components/settlement";
import { api, heldAmount, payable, type Settlement, type SettlementStatus } from "@/lib/api";
import { fmtDate, kwacha } from "@/lib/brand";

const needsAction: SettlementStatus[] = ["UNDER_FINANCE_REVIEW", "DISPUTED", "AWAITING_APPROVAL", "AWAITING_SECOND_APPROVAL", "APPROVED", "FAILED"];
const inProgress: SettlementStatus[] = ["AWAITING_EVENT_COMPLETION", "RECONCILIATION_PENDING", "ORGANISER_REVIEW", "PAYOUT_PROCESSING"];

export default function AdminSettlements() {
  const router = useRouter();
  const all = api.settlements.list();
  const threshold = api.settlements.financeSettings().dualThreshold;
  const [tab, setTab] = useState("Needs action");
  const rows = all.filter((s) => (tab === "Needs action" ? needsAction.includes(s.status) : tab === "In progress" ? inProgress.includes(s.status) : tab === "Paid" ? s.status === "SETTLED" : true));
  const unsettled = all.filter((s) => s.status !== "SETTLED" && s.status !== "CANCELLED");
  const overdue = unsettled.filter((s) => (nextDeadline(s)?.left ?? 0) < 0).length;

  return (
    <>
      <PageHeader title="Settlements" sub="Every event paid out once, after it has happened. Approvals are separated: above the threshold, two different finance staff must approve." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Held for organisers" value={kwacha(unsettled.reduce((a, s) => a + payable(s), 0))} hint="Owed to organisers, not EMS income" />
        <Stat label="Waiting for approval" value={all.filter((s) => s.status === "AWAITING_APPROVAL" || s.status === "AWAITING_SECOND_APPROVAL").length} />
        <Stat label="Disputes and failed payouts" value={all.filter((s) => s.status === "DISPUTED" || s.status === "FAILED").length} />
        <Stat label="Overdue steps" value={overdue} hint={overdue ? "Flagged to the finance manager" : "All on time"} />
      </div>
      <SectionTitle title="Queue" />
      <Tabs tabs={["Needs action", "In progress", "Paid", "All"]} value={tab} onChange={setTab} />
      <Table<Settlement>
        rows={rows}
        onRow={(s) => router.push(`/admin/settlements/${s.ref}/`)}
        empty="Nothing waiting. Every settlement is on time."
        columns={[
          { key: "event", label: "Event", render: (s) => <><p className="font-semibold">{s.event}</p><p className="text-xs text-ink-3">{s.orgName}, <span className="font-mono">{s.ref}</span></p></> },
          { key: "ended", label: "Ended", render: (s) => fmtDate(s.ended, { day: "numeric", month: "short" }) },
          { key: "status", label: "Status", render: (s) => <SettlementBadge s={s} /> },
          { key: "next", label: "Deadline", render: (s) => (s.status === "SETTLED" ? <span className="text-sm text-ink-3">Paid {fmtDate(s.payout!.at!, { day: "numeric", month: "short" })}</span> : <Countdown s={s} />) },
          { key: "approvals", label: "Approvals", render: (s) => { const need = payable(s) >= threshold ? 2 : 1; return <span className="text-sm">{s.approvals.length} of {need}</span>; } },
          { key: "amount", label: "Payable", align: "right", render: (s) => <span className="tabular-nums">{kwacha(payable(s) - heldAmount(s))}</span> },
        ]}
      />
    </>
  );
}
