"use client";

import { useState } from "react";
import { CheckCircle2 } from "lucide-react";
import { Button, cx, Field, Input, Select, Textarea } from "@/components/ui";

const steps = ["Organisation", "Your account", "Payouts", "Review"];

export default function RegisterOrg() {
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [f, setF] = useState({ name: "", type: "Concert promoter", city: "Lusaka", pacra: "", about: "", admin: "", email: "", phone: "", payout: "MTN MoMo business wallet", account: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const next = () => {
    const e: Record<string, string> = {};
    if (i === 0 && f.name.length < 3) e.name = "Enter your organisation's registered name.";
    if (i === 1 && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter a work email.";
    if (i === 1 && f.admin.length < 3) e.admin = "Enter your full name.";
    if (i === 2 && f.account.length < 6) e.account = "Enter the wallet number or bank account for payouts.";
    setErr(e);
    if (!Object.keys(e).length) i === 3 ? setDone(true) : setI(i + 1);
  };
  if (done)
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <CheckCircle2 size={48} className="mx-auto text-leaf" />
        <h1 className="mt-4 text-3xl font-semibold">Application received</h1>
        <p className="mt-2 text-ink-2">We check every organisation before its first paid event goes live, usually within one working day. You can start building events in draft now.</p>
        <Button href="/org/" className="mt-6">Open your workspace</Button>
      </div>
    );
  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Register your organisation</h1>
      <ol className="mt-6 flex gap-2">
        {steps.map((s, n) => (
          <li key={s} className="flex-1">
            <div className={cx("h-1.5 rounded-full", n <= i ? "bg-kafue" : "bg-line")} />
            <p className={cx("mt-2 text-xs font-medium", n === i ? "text-ink" : "text-ink-3")}>{n + 1}. {s}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8 space-y-4 rounded-2xl border border-line bg-surface p-6">
        {i === 0 && (<>
          <Field label="Organisation name" error={err.name}><Input value={f.name} onChange={set("name")} placeholder="e.g. Zed Live Entertainment" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type"><Select value={f.type} onChange={set("type")} options={["Concert promoter", "Church", "Business association", "Training provider", "Sports organiser", "Charity", "Government", "School or university", "Individual"]} /></Field>
            <Field label="Town or city"><Select value={f.city} onChange={set("city")} options={["Lusaka", "Kitwe", "Ndola", "Livingstone", "Kabwe", "Chipata", "Solwezi", "Other"]} /></Field>
          </div>
          <Field label="PACRA or registration number" hint="Optional now, needed before your first payout"><Input value={f.pacra} onChange={set("pacra")} /></Field>
          <Field label="About you" hint="Shown on your public organiser page"><Textarea value={f.about} onChange={set("about")} /></Field>
        </>)}
        {i === 1 && (<>
          <Field label="Your full name" error={err.admin}><Input value={f.admin} onChange={set("admin")} /></Field>
          <Field label="Work email" error={err.email}><Input value={f.email} onChange={set("email")} type="email" /></Field>
          <Field label="Mobile number" hint="Used for sign-in codes"><Input value={f.phone} onChange={set("phone")} inputMode="tel" /></Field>
        </>)}
        {i === 2 && (<>
          <Field label="Where should we pay your ticket money?"><Select value={f.payout} onChange={set("payout")} options={["MTN MoMo business wallet", "Airtel Money business wallet", "Bank account (Zanaco, Stanbic, FNB, Absa…)"]} /></Field>
          <Field label="Wallet number or account number" error={err.account}><Input value={f.account} onChange={set("account")} /></Field>
          <p className="text-sm text-ink-3">Payouts are made after each event, or weekly for courses, once refunds have closed.</p>
        </>)}
        {i === 3 && (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {Object.entries({ Organisation: f.name, Type: f.type, City: f.city, Admin: f.admin, Email: f.email, Payouts: `${f.payout}, ${f.account}` }).map(([k, v]) => (
              <div key={k}><dt className="text-ink-3">{k}</dt><dd className="font-semibold">{v || "—"}</dd></div>
            ))}
          </dl>
        )}
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Back</Button>
        <Button onClick={next}>{i === 3 ? "Submit application" : "Continue"}</Button>
      </div>
    </div>
  );
}
