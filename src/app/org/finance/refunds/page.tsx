"use client";

import { useState } from "react";
import { CheckCircle2, ShieldAlert, XCircle } from "lucide-react";
import { Badge, Button, Card, Field, Input, Modal, PageHeader, SectionTitle, Stat, Table, Tabs, Toggle, useToast } from "@/components/ui";
import { SelectOther } from "@/components/select-other";
import { useOrgRole } from "@/components/layout/org-role";
import { api, type RefundRequest } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function Refunds() {
  const toast = useToast();
  const { can } = useOrgRole();
  const [rows, setRows] = useState(api.refunds.requests("org1"));
  const [tab, setTab] = useState("Requests");
  const [decline, setDecline] = useState<RefundRequest | null>(null);
  const [cb, setCb] = useState(api.refunds.chargebacks("org1"));
  const [rules, setRules] = useState(api.refunds.rules());
  const waiting = rows.filter((r) => r.status === "Waiting");
  const act = can("refunds.issue");

  const approve = (r: RefundRequest) => {
    setRows(rows.map((x) => (x.id === r.id ? { ...x, status: "Approved", decidedBy: "You" } : x)));
    toast(`Refund of ${kwacha(r.amount)} approved. ${r.buyer.split(" ")[0]} gets an SMS, the tickets are cancelled, and the money goes back to their ${r.method}.`);
  };

  return (
    <>
      <PageHeader title="Refunds" sub="Refund requests from buyers, refunds you've made, and card chargebacks. Refunds come out of the money EMS is holding for your event." />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="Waiting for you" value={waiting.length} hint={waiting.length ? `${kwacha(waiting.reduce((a, r) => a + r.amount, 0))} requested` : "All answered"} />
        <Stat label="Refunded this month" value={kwacha(rows.filter((r) => r.status === "Refunded" || r.status === "Approved").reduce((a, r) => a + r.amount, 0))} />
        <Stat label="Refund rate" value="1.4%" hint="of tickets sold this month" />
        <Stat label="Chargebacks open" value={cb.filter((c) => c.status === "Send evidence").length} hint="Card disputes" />
      </div>
      <SectionTitle title="" />
      <Tabs tabs={["Requests", "Chargebacks", "Rules"]} value={tab} onChange={setTab} />

      {tab === "Requests" && (
        <Table<RefundRequest>
          rows={rows}
          columns={[
            { key: "buyer", label: "Buyer", render: (r) => <><p className="font-semibold">{r.buyer}</p><p className="text-xs text-ink-3">{r.phone}, {r.requested}</p></> },
            { key: "event", label: "Event", render: (r) => <><p>{r.event}</p><p className="text-xs text-ink-3">{r.tickets} ticket{r.tickets > 1 ? "s" : ""}, {r.method}</p></> },
            { key: "reason", label: "Reason", render: (r) => <><p>{r.reason}</p>{r.note && <p className="max-w-xs text-xs text-ink-3">&ldquo;{r.note}&rdquo;</p>}</> },
            { key: "policy", label: "Your policy", render: (r) => <Badge tone={r.policy === "Within policy" ? "green" : "gold"}>{r.policy}</Badge> },
            { key: "amount", label: "Amount", align: "right", render: (r) => kwacha(r.amount) },
            { key: "status", label: "", render: (r) => r.status === "Waiting" ? (act ? (
              <div className="flex justify-end gap-1">
                <Button size="sm" variant="ghost" onClick={() => setDecline(r)}><XCircle size={14} /> Decline</Button>
                <Button size="sm" onClick={() => approve(r)}><CheckCircle2 size={14} /> Approve</Button>
              </div>
            ) : <Badge tone="gold">Waiting</Badge>) : <span className="text-sm"><Badge tone={r.status === "Declined" ? "red" : "green"}>{r.status}</Badge><span className="block text-xs text-ink-3">by {r.decidedBy}</span></span> },
          ]}
        />
      )}
      {tab === "Requests" && !act && <p className="mt-3 text-sm text-ink-3">Your role can see refund requests but not approve them.</p>}

      {tab === "Chargebacks" && (
        <>
          <Card className="mb-4 flex gap-3 text-sm">
            <ShieldAlert className="shrink-0 text-ink-3" size={18} />
            <p className="text-ink-2">A chargeback is when a card holder asks their bank to reverse a payment. Send evidence before the due date, such as the scan record showing the ticket was used. Chargebacks you lose are taken off your next settlement.</p>
          </Card>
          <Table rows={cb} columns={[
            { key: "id", label: "Case", render: (c) => <><p className="font-mono text-xs">{c.id}</p><p className="text-xs text-ink-3">{c.buyer}</p></> },
            { key: "event", label: "Event" },
            { key: "reason", label: "Bank's reason" },
            { key: "amount", label: "Amount", align: "right", render: (c) => kwacha(c.amount) },
            { key: "due", label: "Evidence due", render: (c) => c.status === "Send evidence" ? <span className="font-semibold text-[#a35f00] dark:text-marigold">{c.due}</span> : "—" },
            { key: "status", label: "", render: (c) => c.status === "Send evidence" && act
              ? <Button size="sm" onClick={() => { setCb(cb.map((x) => (x.id === c.id ? { ...x, status: "Evidence sent" } : x))); toast(`Evidence sent: ${c.evidence}`); }}>Send scan record</Button>
              : <Badge tone={c.status === "Won" ? "green" : c.status === "Accepted" ? "grey" : "gold"}>{c.status}</Badge> },
          ]} />
        </>
      )}

      {tab === "Rules" && (
        <Card className="max-w-2xl space-y-4">
          <SectionTitle title="How refund requests are handled" />
          <Toggle checked={rules.autoApproveWithinPolicy} onChange={(v) => setRules({ ...rules, autoApproveWithinPolicy: v })} label="Approve requests within our policy automatically" />
          {rules.autoApproveWithinPolicy && <Field label="Only up to (K)" hint="Bigger requests still wait for a person"><Input inputMode="numeric" value={rules.maxAutoAmount} onChange={(e) => setRules({ ...rules, maxAutoAmount: Number(e.target.value.replace(/\D/g, "")) })} /></Field>}
          <Toggle checked={rules.keepBookingFee} onChange={(v) => setRules({ ...rules, keepBookingFee: v })} label="Keep the booking fee when a buyer asks for a refund" />
          <p className="text-sm text-ink-3">If you cancel an event, every buyer is refunded in full automatically, including booking fees. Refund policies are set per event on the Policies step.</p>
          <Button disabled={!act} onClick={() => toast("Refund rules saved")}>Save rules</Button>
        </Card>
      )}

      <Modal open={!!decline} onClose={() => setDecline(null)} title={`Decline ${decline?.buyer}'s request`} footer={<><Button variant="ghost" onClick={() => setDecline(null)}>Cancel</Button><Button variant="danger" onClick={() => { setRows(rows.map((x) => (x.id === decline!.id ? { ...x, status: "Declined", decidedBy: "You" } : x))); toast("Request declined. The buyer gets your reason and a reminder that they can transfer the tickets."); setDecline(null); }}>Decline request</Button></>}>
        <div className="space-y-4">
          <SelectOther label="Reason the buyer will see" options={["Outside our refund policy", "The event is about to start", "Tickets were already used"]} prompt="Your reason" placeholder="e.g. We can move you to next month's show instead" />
          <p className="text-sm text-ink-3">Buyers can still transfer declined tickets to someone else.</p>
        </div>
      </Modal>
    </>
  );
}
