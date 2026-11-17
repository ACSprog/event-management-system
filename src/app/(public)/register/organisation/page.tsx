"use client";

import { useEffect, useState } from "react";
import { CalendarHeart, CheckCircle2, Repeat } from "lucide-react";
import { Button, Checkbox, cx, Field, Input, Select, Textarea } from "@/components/ui";
import { api, feeText } from "@/lib/api";
import { kwacha } from "@/lib/brand";

type Kind = "regular" | "oneoff";
const stepsFor: Record<Kind, string[]> = {
  regular: ["How you'll use EMS", "Organisation", "Your account", "Payouts", "Review"],
  oneoff: ["How you'll use EMS", "Your event", "Your account", "Package", "Review"],
};
const startOptions = ["Start free", "Try Professional free for 14 days", "Starter", "Professional"];

export default function RegisterOrg() {
  const plans = api.billing.plans();
  const packages = api.billing.licencePackages();
  const [kind, setKind] = useState<Kind>("regular");
  const [i, setI] = useState(0);
  const [done, setDone] = useState(false);
  const [f, setF] = useState({ name: "", type: "Concert promoter", city: "Lusaka", pacra: "", about: "", admin: "", email: "", phone: "", payout: "MTN MoMo business wallet", account: "", start: startOptions[0], event: "", occasion: "Wedding", date: "", guests: "150", pkg: "Standard", payer: false, payWith: "MTN MoMo" });
  const [err, setErr] = useState<Record<string, string>>({});
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const steps = stepsFor[kind];
  const pkg = packages.find((p) => p.key === f.pkg)!;
  const suggested = packages.find((p) => p.guests >= Number(f.guests || 0)) ?? packages[2];

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("type") === "one-off") setKind("oneoff");
  }, []);

  const next = () => {
    const e: Record<string, string> = {};
    if (i === 1 && kind === "regular" && f.name.length < 3) e.name = "Enter your organisation's registered name.";
    if (i === 1 && kind === "oneoff" && f.event.length < 3) e.event = "Give your event a name, e.g. Natasha & Brian's Wedding.";
    if (i === 1 && kind === "oneoff" && !f.date) e.date = "Choose the date of the event.";
    if (i === 2 && !/^\S+@\S+\.\S+$/.test(f.email)) e.email = "Enter your email address.";
    if (i === 2 && f.admin.length < 3) e.admin = "Enter your full name.";
    if (i === 3 && kind === "regular" && f.account.length < 6) e.account = "Enter the wallet number or bank account for payouts.";
    setErr(e);
    if (!Object.keys(e).length) i === steps.length - 1 ? setDone(true) : setI(i + 1);
  };

  if (done)
    return (
      <div className="mx-auto max-w-lg px-4 py-20 text-center">
        <CheckCircle2 size={48} className="mx-auto text-leaf" />
        {kind === "regular" ? (<>
          <h1 className="mt-4 text-3xl font-semibold">Application received</h1>
          <p className="mt-2 text-ink-2">{f.start.startsWith("Try") ? "Your 14-day Professional trial has started. " : ""}You can build events in draft now. We check every organisation (PACRA certificate, director&rsquo;s ID and a K1 test payment to your payout account) before the first payout, usually within one working day.</p>
          <Button href="/org/" className="mt-6">Open your workspace</Button>
        </>) : (<>
          <h1 className="mt-4 text-3xl font-semibold">Your {pkg.key} licence is reserved</h1>
          <p className="mt-2 text-ink-2">{f.payer ? "We've created a payment link you can share with whoever is paying. " : `We've sent a ${f.payWith} prompt for ${kwacha(pkg.price)}. `}Start building your guest list now; your invitations go out as soon as the licence is paid.</p>
          <Button href="/org/" className="mt-6">Start planning</Button>
        </>)}
      </div>
    );

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-3xl font-semibold">{kind === "oneoff" && i > 0 ? "Set up your event" : "Register your organisation"}</h1>
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
          <div className="grid gap-3 sm:grid-cols-2">
            {([["regular", Repeat, "I organise events regularly", "Concerts, church events, conferences, sports, classes. Free to start; a plan lowers your fees."], ["oneoff", CalendarHeart, "I'm planning one event", "A wedding, kitchen party, anniversary or private function. Pay once for that event, no subscription."]] as const).map(([k, Icon, t, b]) => (
              <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className={cx("rounded-xl border-2 p-4 text-left", kind === k ? "border-kafue bg-kafue-soft" : "border-line hover:border-ink-3")}>
                <Icon className="text-kafue" />
                <p className="mt-2 font-semibold">{t}</p>
                <p className="mt-1 text-sm text-ink-2">{b}</p>
              </button>
            ))}
          </div>
          {kind === "regular" && (
            <Field label="How would you like to start?" hint="You can change plan at any time. Free events are always free.">
              <div className="space-y-2">
                {startOptions.map((o) => {
                  const p = plans.find((x) => o.endsWith(x.key)) ?? plans[0];
                  return (
                    <label key={o} className={cx("flex cursor-pointer items-center justify-between gap-3 rounded-lg border-2 px-3 py-2.5 text-sm", f.start === o ? "border-kafue bg-kafue-soft" : "border-line")}>
                      <span className="flex items-center gap-2"><input type="radio" name="start" checked={f.start === o} onChange={() => setF({ ...f, start: o })} className="accent-[var(--kafue)]" /><span className="font-semibold">{o}</span></span>
                      <span className="text-ink-3">{o === "Start free" ? `K0, ${feeText(plans[0])}` : o.startsWith("Try") ? "No card needed, then Free unless you subscribe" : `${kwacha(p.monthly!)} a month, ${feeText(p)}`}</span>
                    </label>
                  );
                })}
              </div>
            </Field>
          )}
        </>)}
        {i === 1 && kind === "regular" && (<>
          <Field label="Organisation name" error={err.name}><Input value={f.name} onChange={set("name")} placeholder="e.g. Zed Live Entertainment" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Type"><Select value={f.type} onChange={set("type")} options={["Concert promoter", "Church", "Business association", "Training provider", "Sports organiser", "Charity", "Government", "School or university", "Event planner", "Venue"]} /></Field>
            <Field label="Town or city"><Select value={f.city} onChange={set("city")} options={["Lusaka", "Kitwe", "Ndola", "Livingstone", "Kabwe", "Chipata", "Solwezi", "Other"]} /></Field>
          </div>
          <Field label="PACRA or registration number" hint="Optional now, needed before your first payout"><Input value={f.pacra} onChange={set("pacra")} /></Field>
          <Field label="About you" hint="Shown on your public organiser page"><Textarea value={f.about} onChange={set("about")} /></Field>
        </>)}
        {i === 1 && kind === "oneoff" && (<>
          <Field label="Event name" error={err.event}><Input value={f.event} onChange={set("event")} placeholder="e.g. Natasha & Brian's Wedding" /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Occasion"><Select value={f.occasion} onChange={set("occasion")} options={["Wedding", "Kitchen party", "Anniversary", "Birthday", "Memorial or funeral", "Family reunion", "Private function"]} /></Field>
            <Field label="Date" error={err.date}><Input type="date" value={f.date} onChange={set("date")} /></Field>
            <Field label="Expected guests"><Input inputMode="numeric" value={f.guests} onChange={(e) => setF({ ...f, guests: e.target.value.replace(/\D/g, ""), pkg: (packages.find((p) => p.guests >= Number(e.target.value.replace(/\D/g, "") || 0)) ?? packages[2]).key })} /></Field>
            <Field label="Town or city"><Select value={f.city} onChange={set("city")} options={["Lusaka", "Kitwe", "Ndola", "Livingstone", "Kabwe", "Chipata", "Solwezi", "Other"]} /></Field>
          </div>
          <p className="text-sm text-ink-3">Private events are unlisted: only people you invite can see them. One licence covers every function of the occasion, such as the kitchen party, ceremony and reception.</p>
        </>)}
        {i === 2 && (<>
          <Field label="Your full name" error={err.admin}><Input value={f.admin} onChange={set("admin")} /></Field>
          <Field label="Email" error={err.email}><Input value={f.email} onChange={set("email")} type="email" /></Field>
          <Field label="Mobile number" hint="Used for sign-in codes"><Input value={f.phone} onChange={set("phone")} inputMode="tel" /></Field>
        </>)}
        {i === 3 && kind === "regular" && (<>
          <Field label="Where should we pay your ticket money?"><Select value={f.payout} onChange={set("payout")} options={["MTN MoMo business wallet", "Airtel Money business wallet", "Zamtel Kwacha business wallet", "Bank account (Zanaco, Stanbic, FNB, Absa…)"]} /></Field>
          <Field label="Wallet number or account number" error={err.account}><Input value={f.account} onChange={set("account")} /></Field>
          <p className="text-sm text-ink-3">Ticket money is held safely by our licensed payment partner until each event is over, then paid to this account in one payment: statement within 3 business days, 2 days for you to check it, payment within 2 business days. The account must be in your organisation&rsquo;s name.</p>
        </>)}
        {i === 3 && kind === "oneoff" && (<>
          <Field label="Choose a package" hint={`For ${f.guests || 0} guests we suggest ${suggested.key}.`}>
            <div className="space-y-2">
              {packages.map((p) => (
                <label key={p.key} className={cx("flex cursor-pointer items-start justify-between gap-3 rounded-lg border-2 p-3 text-sm", f.pkg === p.key ? "border-kafue bg-kafue-soft" : "border-line")}>
                  <span className="flex gap-2"><input type="radio" name="pkg" checked={f.pkg === p.key} onChange={() => setF({ ...f, pkg: p.key })} className="mt-1 accent-[var(--kafue)]" /><span><span className="font-semibold">{p.key}, up to {p.guests.toLocaleString()} guests</span><span className="block text-ink-3">{p.features.join(", ")}</span></span></span>
                  <span className="font-display text-lg font-bold">{kwacha(p.price)}</span>
                </label>
              ))}
            </div>
          </Field>
          <Checkbox checked={f.payer} onChange={(v) => setF({ ...f, payer: v })} label="Someone else is paying (a parent or sponsor). Give me a link to share." />
          {!f.payer && <Field label="Pay with"><Select value={f.payWith} onChange={set("payWith")} options={["MTN MoMo", "Airtel Money", "Zamtel Kwacha", "Visa or Mastercard"]} /></Field>}
          <ul className="list-disc space-y-1 pl-5 text-sm text-ink-3">
            <li>Full access until 90 days after the event, then read-only for 12 months.</li>
            <li>More guests than expected? They&rsquo;re still let in on the day; you top up afterwards.</li>
            <li>Upgrade any time by paying the difference. Subscribe within 60 days and the licence is taken off your first payment.</li>
          </ul>
        </>)}
        {i === 4 && (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {Object.entries(kind === "regular"
              ? { Organisation: f.name, Type: f.type, City: f.city, Start: f.start, Admin: f.admin, Email: f.email, Payouts: `${f.payout}, ${f.account}` }
              : { Event: f.event, Occasion: f.occasion, Date: f.date, Guests: f.guests, Package: `${pkg.key}, ${kwacha(pkg.price)} once`, Payment: f.payer ? "Shareable payment link" : f.payWith, Organiser: f.admin, Email: f.email }
            ).map(([k, v]) => (
              <div key={k}><dt className="text-ink-3">{k}</dt><dd className="font-semibold">{v || "—"}</dd></div>
            ))}
          </dl>
        )}
      </div>
      <div className="mt-6 flex justify-between">
        <Button variant="ghost" disabled={i === 0} onClick={() => setI(i - 1)}>Back</Button>
        <Button onClick={next}>{i === steps.length - 1 ? (kind === "regular" ? "Submit application" : `Reserve and pay ${kwacha(pkg.price)}`) : "Continue"}</Button>
      </div>
    </div>
  );
}
