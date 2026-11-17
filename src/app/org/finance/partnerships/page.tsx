"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Handshake } from "lucide-react";
import { Badge, Button, Card, cx, PageHeader, SectionTitle, Textarea, useToast } from "@/components/ui";
import { useOrgRole } from "@/components/layout/org-role";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function OrgPartnerships() {
  const toast = useToast();
  const { role } = useOrgRole();
  const mine = api.settlements.partnerships().filter((p) => p.org === "Zed Live Entertainment");
  const [accepted, setAccepted] = useState<Record<string, string>>({});
  const [question, setQuestion] = useState("");

  return (
    <>
      <PageHeader title="Partnerships with EMS" sub="Events EMS co-funds or co-promotes with you for a share of ticket sales. Terms are agreed with EMS, then both sides accept them here." actions={<Button variant="secondary" onClick={() => toast("Request sent. EMS will contact you within 2 business days.")}><Handshake size={15} /> Propose a partnership</Button>} />
      {mine.map((p) => {
        const ok = p.accepted.org ?? accepted[p.id];
        const base = p.live ? p.live.gross - p.live.refunds - p.live.charges : 0;
        return (
          <Card key={p.id} className="mb-6">
            <SectionTitle title={p.events.join(", ")} sub={p.id} action={<Badge tone={ok ? "green" : "gold"}>{ok ? "Accepted" : "Waiting for you"}</Badge>} />
            <dl className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-3">
              <div><dt className="text-ink-3">Split of ticket sales</dt><dd className="font-semibold">EMS {p.share}%, you {100 - p.share}%</dd></div>
              <div><dt className="text-ink-3">What gets shared</dt><dd className="font-semibold">{p.base}</dd></div>
              <div><dt className="text-ink-3">Costs taken off first</dt><dd className="font-semibold">{p.deductions.join("; ") || "None"}</dd></div>
              <div><dt className="text-ink-3">Your down payment</dt><dd className="font-semibold">{p.downPayment ? `${kwacha(p.downPayment)}, ${p.downTreatment.replace(/^./, (c) => c.toLowerCase())}` : "None"}</dd></div>
              <div><dt className="text-ink-3">What EMS puts in</dt><dd className="font-semibold">{p.contributions.map((c) => `${c.kind} ${kwacha(c.amount)}`).join(", ")}</dd></div>
              <div><dt className="text-ink-3">If the event is cancelled</dt><dd className="font-semibold">{p.cancellation}</dd></div>
            </dl>
            <p className="mt-4 text-sm text-ink-3">Ticket money is collected by EMS and paid to you once, after the event, like every settlement. You both see the same live figures.</p>

            {p.live && (
              <div className="mt-4 rounded-lg bg-surface-2 p-4 text-sm">
                <p className="font-semibold">Live split so far</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-4">
                  {[["Shared amount", base], [`EMS ${p.share}%`, Math.round((base * p.share) / 100)], ["Less your down payment", -p.downPayment], [`Yours, before agreed costs`, base - Math.round((base * p.share) / 100) + p.downPayment]].map(([k, v]) => <div key={k as string}><p className="text-ink-3">{k}</p><p className="font-display text-lg font-bold">{(v as number) < 0 ? `(${kwacha(-(v as number))})` : kwacha(v as number)}</p></div>)}
                </div>
              </div>
            )}

            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {([["EMS", p.accepted.ems], ["You", ok]] as const).map(([who, at]) => (
                <div key={who} className={cx("flex items-center gap-2 rounded-lg p-3 text-sm", at ? "bg-leaf-soft" : "bg-marigold-soft")}>
                  {at ? <CheckCircle2 size={16} className="text-leaf" /> : <Clock size={16} />}
                  {who} {at ? `accepted on ${at}` : "haven't accepted yet"}
                </div>
              ))}
            </div>
            {!ok && (
              <div className="mt-4 space-y-3 border-t border-line pt-4">
                {role === "admin" ? (
                  <>
                    <Textarea rows={2} placeholder="Questions or changes you'd like (optional)" value={question} onChange={(e) => setQuestion(e.target.value)} />
                    <div className="flex flex-wrap gap-2">
                      <Button onClick={() => { setAccepted({ ...accepted, [p.id]: "2026-11-17" }); toast("Agreement accepted. The terms are now fixed for this event."); }}>Accept the terms</Button>
                      <Button variant="secondary" disabled={!question.trim()} onClick={() => { setQuestion(""); toast("Sent to EMS. They'll reply with updated terms."); }}>Ask for changes</Button>
                    </div>
                  </>
                ) : <p className="text-sm text-ink-3">Only your organisation admin can accept the terms.</p>}
              </div>
            )}
          </Card>
        );
      })}
    </>
  );
}
