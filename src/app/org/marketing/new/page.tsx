"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { Button, Card, cx, Field, Input, PageHeader, Select, Textarea, useToast } from "@/components/ui";

export default function NewCampaign() {
  const toast = useToast();
  const [ch, setCh] = useState("SMS");
  const [msg, setMsg] = useState("Lusaka Summer Jam is 26 days away and Standard tickets are 70% gone. Get yours: evtra.zm/jam STOP to opt out");
  return (
    <>
      <PageHeader title="New campaign" back={{ href: "/org/marketing/", label: "Marketing" }} />
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="space-y-5">
          <Field label="Channel"><div className="flex gap-2">{["SMS", "Email", "Push", "WhatsApp"].map((c) => <button key={c} onClick={() => setCh(c)} className={cx("flex-1 rounded-lg border-2 py-2 text-sm font-semibold", ch === c ? "border-kafue bg-kafue-soft" : "border-line")}>{c}</button>)}</div></Field>
          <Field label="Campaign name"><Input defaultValue="Summer Jam: 26 days to go" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Audience"><Select options={["Concert fans, Lusaka 25 km (18,420)", "VIP regulars (2,104)", "Lapsed 6 months (6,880)", "Everyone who opted in (34,200)"]} /></Field>
            <Field label="Promote"><Select options={["Lusaka Summer Jam", "New Year's Eve Countdown", "Copperbelt Nights: Kitwe"]} /></Field>
          </div>
          {ch === "Email" && <Field label="Subject"><Input defaultValue="26 days to Summer Jam. Are you in?" /></Field>}
          <Field label="Message" hint={ch === "SMS" ? `${msg.length} characters, ${Math.ceil(msg.length / 160)} SMS` : undefined}><Textarea rows={5} value={msg} onChange={(e) => setMsg(e.target.value)} /></Field>
          <Button size="sm" variant="secondary" onClick={() => setMsg("Only 8,600 Standard tickets left for Lusaka Summer Jam on 12 Dec. Yo Maps, Macky 2 and Chef 187 live at Heroes. Buy with MoMo: evtra.zm/jam STOP to opt out")}><Sparkles size={14} /> Rewrite with AI</Button>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Send"><Select options={["Now", "Schedule for later", "Best time for each person"]} /></Field>
            <Field label="Date and time"><Input type="datetime-local" defaultValue="2026-11-18T10:00" /></Field>
          </div>
          <div className="flex justify-end gap-2 border-t border-line pt-4"><Button variant="secondary" onClick={() => toast("Test sent to 0964 471 220")}>Send test</Button><Button onClick={() => toast("Campaign scheduled for 18 Nov at 10:00")}>Schedule campaign</Button></div>
        </Card>
        <div>
          <p className="mb-2 text-sm font-semibold text-ink-3">Preview</p>
          <div className="rounded-[28px] border-8 border-ink bg-canvas p-4">
            <div className="rounded-2xl bg-surface p-3 text-sm shadow-sm"><p className="text-xs font-semibold text-ink-3">{ch === "SMS" ? "EVENTRA" : ch === "Push" ? "Eventra, now" : ch}</p><p className="mt-1">{msg}</p></div>
          </div>
          <p className="mt-3 text-xs text-ink-3">Estimated cost: K0.18 per SMS, about K3,316. Quiet hours (21:00 to 07:00) and frequency limits are applied automatically.</p>
        </div>
      </div>
    </>
  );
}
