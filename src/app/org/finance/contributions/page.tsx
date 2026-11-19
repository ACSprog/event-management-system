"use client";

import { useState } from "react";
import { useOrgRole } from "@/components/layout/org-role";
import { Badge, Button, Card, Field, Input, Modal, PageHeader, SectionTitle, Stat, Table, useToast } from "@/components/ui";
import { api, type Cashout } from "@/lib/api";
import { kwacha } from "@/lib/brand";

/**
 * Contribution money for the organiser: pledged (a record only), paid,
 * clearing and available. Organisers can cash out available money at any time.
 * At or below the daily limit the system releases it automatically once every
 * check passes; above it, EMS finance reviews. Organisers never approve it.
 */
export default function Contributions() {
  const toast = useToast();
  const { can } = useOrgRole();
  const b = api.contributions.balance();
  const settings = api.contributions.settings();
  const account = api.settlements.payoutAccount();
  const [available, setAvailable] = useState(b.available);
  const [history, setHistory] = useState<Cashout[]>([
    { id: "CO-0058", orgId: "org1", orgName: "Zed Live Entertainment", occasion: b.occasion, amount: b.last.amount, to: `${account.method} ${account.number}`, requestedBy: "Precious Nyirenda", at: `${b.last.at} 14:20`, route: "AUTOMATIC", status: "RELEASED" },
  ]);
  const [open, setOpen] = useState(false);
  const [amt, setAmt] = useState("");
  const [err, setErr] = useState("");

  const request = () => {
    const n = Number(amt);
    if (!n || n <= 0) return setErr("Enter an amount above zero.");
    if (n > available) return setErr(`You can cash out at most ${kwacha(available)}. Card money still clearing isn't available yet.`);
    const auto = settings.mode === "AUTOMATIC_BELOW_LIMIT" && n <= settings.dailyLimit;
    setAvailable(available - n);
    setHistory([{ id: `CO-${String(60 + history.length).padStart(4, "0")}`, orgId: "org1", orgName: "Zed Live Entertainment", occasion: b.occasion, amount: n, to: `${account.method} ${account.number}`, requestedBy: "You", at: "Just now", route: auto ? "AUTOMATIC" : "FINANCE", status: auto ? "RELEASED" : "WAITING_FOR_FINANCE" }, ...history]);
    setOpen(false); setAmt(""); setErr("");
    toast(auto ? `${kwacha(n)} released to ${account.method} ${account.number}.` : `${kwacha(n)} is above the daily limit, so EMS finance will review it. You'll be told when it's decided.`);
  };

  return (
    <>
      <PageHeader title="Contributions" sub={`${b.occasion}. Contributions are separate from ticket money and can be cashed out before the event.`} actions={can("contributions.cashout") ? <Button onClick={() => setOpen(true)} disabled={!available}>Cash out</Button> : undefined} />
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="Pledged" value={kwacha(b.pledged)} hint="A record only; can't be cashed out" />
        <Stat label="Paid" value={kwacha(b.paid)} />
        <Stat label="Still clearing" value={kwacha(b.clearing)} hint={`Card payments clear after ${settings.cardClearingDays} business days`} />
        <Stat label="Available now" value={kwacha(available)} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div>
          <SectionTitle title="Cashouts" />
          <Table<Cashout> rows={history} columns={[
            { key: "at", label: "Requested", render: (c) => <><p>{c.at}</p><p className="text-xs text-ink-3">{c.requestedBy}</p></> },
            { key: "to", label: "Paid to", render: (c) => <span className="font-mono text-xs">{c.to}</span> },
            { key: "status", label: "Status", render: (c) => (c.status === "RELEASED" ? <Badge tone="green">Released{c.route === "AUTOMATIC" ? " automatically" : ""}</Badge> : <Badge tone="gold">Waiting for EMS finance</Badge>) },
            { key: "amount", label: "Amount", align: "right", render: (c) => <span className="tabular-nums">{kwacha(c.amount)}</span> },
          ]} />
        </div>
        <Card className="space-y-3 text-sm">
          <SectionTitle title="How cashouts work" />
          <p>Up to {kwacha(settings.dailyLimit)} a day is released automatically when your organisation and payout account are verified, the account hasn&rsquo;t changed in the last 48 hours, and you confirm with your 2-step sign-in code.</p>
          <p>Larger amounts go to EMS finance. Your team can request a cashout but can&rsquo;t approve one.</p>
          <p>Contributors are told at payment that contributions are non-refundable, except where a system error occurs. EMS handles those cases.</p>
          <p className="text-ink-3">Ticket money is different: it is paid once, after the event, through the settlement statement.</p>
        </Card>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Cash out contributions" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={request}>Request cashout</Button></>}>
        <p className="text-sm text-ink-2">Paid to {account.method} {account.number} ({account.holder}). Available: <strong>{kwacha(available)}</strong>.</p>
        <div className="mt-4"><Field label="Amount (K)" error={err || undefined} hint={`Up to ${kwacha(settings.dailyLimit)} a day is released straight away`}><Input value={amt} onChange={(e) => setAmt(e.target.value.replace(/\D/g, ""))} inputMode="numeric" /></Field></div>
        <p className="mt-3 text-xs text-ink-3">We&rsquo;ll ask for your 2-step sign-in code before releasing the money.</p>
      </Modal>
    </>
  );
}
