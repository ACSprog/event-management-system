"use client";

import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, Lock } from "lucide-react";
import { Button, Card, Checkbox, cx, Field, Input } from "@/components/ui";
import { PhoneInput } from "@/components/phone-input";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";
import { parsePhone } from "@/lib/phone";

const methods = ["MTN MoMo", "Airtel Money", "Zamtel Kwacha", "Visa or Mastercard"];

/**
 * Public giving page: tithes and offerings for a church, or contributions for a
 * funeral. Opened from the organiser's shared link or QR code (bulletin,
 * projector, programme, WhatsApp). No account or app needed; an SMS receipt is
 * sent to the phone number given.
 *
 * Money is collected by EMS as contribution money: non-refundable except for an
 * EMS system error, and the organiser can cash it out at any time once cleared.
 */
export function GiveForm({ slug }: { slug: string }) {
  const g = api.giving.page(slug)!;
  const event = g.eventSlug ? api.events.bySlug(g.eventSlug) : undefined;
  const [fund, setFund] = useState(g.funds[0].key);
  const [amount, setAmount] = useState("");
  const [name, setName] = useState("Chanda Mulenga");
  const [anon, setAnon] = useState(false);
  const [phone, setPhone] = useState(parsePhone("0971 234 567"));
  const [method, setMethod] = useState(methods[0]);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<string | null>(null);
  const presets = g.kind === "FUNERAL" ? [100, 200, 500, 1000] : [50, 100, 200, 500];
  const value = Number(amount.replace(/\D/g, ""));
  const fundLabel = g.funds.find((f) => f.key === fund)!.label;

  const give = () => {
    if (value < 5) return setErr("Enter an amount of at least K5.");
    setErr("");
    setDone(`GV-${slug.slice(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 899999)}`);
  };

  return (
    <div className="mx-auto max-w-lg px-4 py-6 sm:py-10">
      <div className="rounded-2xl p-5 text-white sm:p-6" style={{ background: `linear-gradient(135deg, ${g.palette[0]}, ${g.palette[1]})` }}>
        <p className="text-sm opacity-80">{g.org}</p>
        <h1 className="font-display text-[24px] font-semibold leading-tight sm:text-[28px]">{g.title}</h1>
        <p className="mt-2 text-sm opacity-90">{g.intro}</p>
        {event && <Link href={`/events/${event.slug}/`} className="mt-3 inline-block rounded-full bg-white/15 px-3 py-1.5 text-sm font-semibold">{g.kind === "FUNERAL" ? "Funeral details and \"I'm coming\"" : `Linked to ${event.title}`} ›</Link>}
      </div>

      {done ? (
        <Card className="mt-5 text-center">
          <CheckCircle2 size={48} className="mx-auto text-leaf" />
          <p className="font-display mt-2 text-2xl font-semibold">Thank you{!anon && name ? `, ${name.split(" ")[0]}` : ""}</p>
          <p className="text-ink-2">{kwacha(value)} to {fundLabel}, paid with {method}.</p>
          <p className="mt-2 font-mono text-sm text-ink-3">Receipt {done}</p>
          <p className="mt-1 text-sm text-ink-3">An SMS receipt is on its way.</p>
          <Button variant="secondary" className="mt-4" onClick={() => { setDone(null); setAmount(""); }}>Give again</Button>
        </Card>
      ) : (
        <Card className="mt-5 space-y-5">
          <Field label={g.kind === "FUNERAL" ? "What is it for?" : "What are you giving?"}>
            <div className="flex flex-wrap gap-2">
              {g.funds.map((f) => (
                <button key={f.key} type="button" onClick={() => setFund(f.key)} aria-pressed={fund === f.key} className={cx("rounded-full border px-4 py-2 text-sm", fund === f.key ? "border-kafue bg-kafue-soft font-semibold text-kafue-ink" : "border-line")}>{f.label}</button>
              ))}
            </div>
            {g.funds.find((f) => f.key === fund)?.sub && <p className="mt-1.5 text-xs text-ink-3">{g.funds.find((f) => f.key === fund)?.sub}</p>}
          </Field>
          <Field label="Amount (K)" error={err || undefined}>
            <div className="grid grid-cols-4 gap-2">
              {presets.map((p) => <button key={p} type="button" onClick={() => setAmount(String(p))} className={cx("rounded-lg border py-2.5 text-sm font-semibold", value === p ? "border-kafue bg-kafue-soft text-kafue-ink" : "border-line")}>K{p.toLocaleString()}</button>)}
            </div>
            <Input className="mt-2 text-base" inputMode="numeric" placeholder="Other amount" value={amount} onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))} />
          </Field>
          <div className="space-y-2">
            <Field label="Your name"><Input value={name} disabled={anon} onChange={(e) => setName(e.target.value)} /></Field>
            <Checkbox checked={anon} onChange={setAnon} label={g.kind === "FUNERAL" ? "Don't show my name to the family" : "Give anonymously"} />
          </div>
          <Field label="Phone for the receipt"><PhoneInput value={phone} onChange={setPhone} /></Field>
          <Field label="Pay with">
            <div className="grid grid-cols-2 gap-2">
              {methods.map((m) => <button key={m} type="button" onClick={() => setMethod(m)} aria-pressed={method === m} className={cx("rounded-lg border px-3 py-2.5 text-left text-sm", method === m ? "border-kafue bg-kafue-soft font-semibold" : "border-line")}>{m}</button>)}
            </div>
          </Field>
          <Button variant="ticket" className="h-12 w-full text-base" onClick={give}>Give {value ? kwacha(value) : ""}</Button>
          <p className="flex items-start gap-1.5 text-xs text-ink-3"><Lock size={13} className="mt-0.5 shrink-0" /> Paid securely through EMS&rsquo;s licensed payment partner. Contributions are non-refundable, except where a system error occurs.</p>
        </Card>
      )}
    </div>
  );
}
