"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Clock, ShieldCheck } from "lucide-react";
import { Badge, Button, Card, Field, Input, Modal, PageHeader, SectionTitle, Select, Table, useToast } from "@/components/ui";
import { NoEarlyPayouts } from "@/components/settlement";
import { useOrgRole } from "@/components/layout/org-role";
import { api, payable, type Settlement } from "@/lib/api";
import { fmtDate, kwacha } from "@/lib/brand";

export default function Payouts() {
  const toast = useToast();
  const router = useRouter();
  const { can } = useOrgRole();
  const acct = api.settlements.payoutAccount();
  const [change, setChange] = useState(false);
  const [pending, setPending] = useState<null | { method: string; number: string }>(null);
  const [f, setF] = useState({ method: "Bank account", number: "", holder: "Zed Live Entertainment Ltd" });
  const [err, setErr] = useState("");
  const paid = api.settlements.list("org1").filter((s) => s.status === "SETTLED");

  const submit = () => {
    if (f.number.replace(/\D/g, "").length < 6) return setErr("Enter the full wallet or account number.");
    setPending({ method: f.method, number: `****${f.number.replace(/\D/g, "").slice(-4)}` });
    setChange(false);
    setErr("");
    toast("Change requested. All organisation admins have been notified.");
  };

  return (
    <>
      <PageHeader title="Payouts" sub="Where your settlements are paid, and every payment so far." />
      <div className="grid gap-6 xl:grid-cols-[1fr_380px]">
        <Card>
          <SectionTitle title="Payout account" action={can("payouts.account") && !pending ? <Button size="sm" variant="secondary" onClick={() => setChange(true)}>Change account</Button> : undefined} />
          <div className="flex flex-wrap items-center gap-4 rounded-lg bg-surface-2 p-4">
            <ShieldCheck className="text-leaf" />
            <div className="flex-1">
              <p className="font-semibold">{acct.method} {acct.number}</p>
              <p className="text-sm text-ink-3">{acct.holder}. Verified {fmtDate(acct.verified, { day: "numeric", month: "long", year: "numeric" })}</p>
            </div>
            <Badge tone="green">Verified</Badge>
          </div>
          <ul className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
            {acct.checks.map((c) => <li key={c.what} className="flex gap-2"><CheckCircle2 size={16} className="mt-0.5 shrink-0 text-leaf" />{c.what}</li>)}
          </ul>
          {pending && (
            <div className="mt-4 flex gap-3 rounded-lg border border-marigold bg-marigold-soft p-4 text-sm">
              <Clock size={18} className="mt-0.5 shrink-0 text-[#a35f00] dark:text-marigold" />
              <div>
                <p className="font-semibold">New account waiting: {pending.method} {pending.number}</p>
                <p className="text-ink-2">We check that the account is in your organisation&rsquo;s name and send a K1 test payment. Once verified, the new account can be used after a 48-hour safety wait. Until then, payouts go to the current account or wait.</p>
              </div>
            </div>
          )}
          {!can("payouts.account") && <p className="mt-4 text-sm text-ink-3">Only your organisation admin can change the payout account.</p>}
        </Card>
        <Card>
          <SectionTitle title="When you get paid" />
          <NoEarlyPayouts />
          <Button variant="secondary" className="mt-4 w-full" href="/org/finance/settlements/">See settlements in progress</Button>
        </Card>
      </div>

      <SectionTitle title="Payment history" />
      <Table<Settlement>
        rows={paid}
        onRow={(s) => router.push(`/org/finance/settlements/${s.ref}/`)}
        columns={[
          { key: "ref", label: "Payout", render: (s) => <span className="font-mono text-xs">{s.payout!.ref}</span> },
          { key: "event", label: "Event" },
          { key: "date", label: "Paid on", render: (s) => fmtDate(s.payout!.at!, { day: "numeric", month: "short", year: "numeric" }) },
          { key: "to", label: "Paid to", render: (s) => s.payTo },
          { key: "amount", label: "Amount", align: "right", render: (s) => kwacha(payable(s)) },
          { key: "status", label: "Status", render: () => <Badge tone="green">Paid</Badge> },
        ]}
      />

      <Modal open={change} onClose={() => setChange(false)} title="Change the payout account" footer={<><Button variant="ghost" onClick={() => setChange(false)}>Cancel</Button><Button onClick={submit}>Request change</Button></>}>
        <div className="space-y-4">
          <Field label="Pay to"><Select value={f.method} onChange={(e) => setF({ ...f, method: e.target.value })} options={["Bank account", "MTN MoMo business wallet", "Airtel Money business wallet", "Zamtel Kwacha business wallet"]} /></Field>
          <Field label={f.method === "Bank account" ? "Account number" : "Wallet number"} error={err}><Input inputMode="numeric" value={f.number} onChange={(e) => setF({ ...f, number: e.target.value })} /></Field>
          <Field label="Account name" hint="Must match your organisation's registered name"><Input value={f.holder} onChange={(e) => setF({ ...f, holder: e.target.value })} /></Field>
          <p className="text-sm text-ink-3">For your protection: we confirm the change by SMS with every organisation admin, verify the account, and wait 48 hours before paying into it.</p>
        </div>
      </Modal>
    </>
  );
}
