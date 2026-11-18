"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Landmark, Loader2, Lock, Smartphone, Timer } from "lucide-react";
import { Button, Checkbox, cx, Field, Input } from "@/components/ui";
import { Poster } from "@/components/poster";
import { api, bookingFee } from "@/lib/api";
import { fmtDate, fmtTime, kwacha } from "@/lib/brand";
import { PhoneInput } from "@/components/phone-input";
import { formatPhone, phoneError, type Phone } from "@/lib/phone";

const methods = [
  { id: "mtn", name: "MTN MoMo", icon: Smartphone, color: "#FFCB05", hint: "Numbers starting 096, 076" },
  { id: "airtel", name: "Airtel Money", icon: Smartphone, color: "#E40000", hint: "Numbers starting 097, 077" },
  { id: "zamtel", name: "Zamtel Kwacha", icon: Smartphone, color: "#1B8E3E", hint: "Numbers starting 095" },
  { id: "card", name: "Visa or Mastercard", icon: CreditCard, color: "#172033", hint: "Debit or credit card" },
  { id: "bank", name: "Bank transfer", icon: Landmark, color: "#4a5468", hint: "Tickets issued when funds clear (1–2 days)" },
];

type Stage = "details" | "waiting" | "failed";

export function Checkout({ slug }: { slug: string }) {
  const router = useRouter();
  const e = api.events.bySlug(slug)!;
  const [lines, setLines] = useState<{ name: string; qty: number; price: number }[]>([]);
  const [seats, setSeats] = useState<string | null>(null);
  const [method, setMethod] = useState("mtn");
  const [form, setForm] = useState({ name: "Chanda Mulenga", email: "chanda.mulenga@mail.example", code: "" });
  const [phone, setPhone] = useState<Phone>({ country: "ZM", number: "0964 471 220" });
  const [agree, setAgree] = useState(true);
  const [marketing, setMarketing] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [stage, setStage] = useState<Stage>("details");
  const [discount, setDiscount] = useState(0);
  const [hold, setHold] = useState(600);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("seats")) {
      const s = p.get("seats")!;
      setSeats(s);
      const n = s.split(",").length;
      setLines([{ name: `Reserved seat${n > 1 ? "s" : ""}`, qty: n, price: Number(p.get("amount")) / n }]);
    } else {
      const l = e.tickets.filter((t) => p.get(t.id)).map((t) => ({ name: t.name, qty: Number(p.get(t.id)), price: t.price }));
      const def = e.tickets.find((t) => t.sold < t.capacity) ?? e.tickets[0];
      setLines(l.length ? l : [{ name: def.name, qty: 2, price: def.price }]);
    }
    const t = setInterval(() => setHold((h) => Math.max(0, h - 1)), 1000);
    return () => clearInterval(t);
  }, [e]);

  const subtotal = lines.reduce((a, l) => a + l.qty * l.price, 0);
  // Booking fee only when the organiser chose "buyer pays" (frozen event terms).
  const buyerPays = api.settlements.termsFor(e.id).feePayer === "BUYER_PAYS";
  const fee = buyerPays ? lines.reduce((a, l) => a + l.qty * bookingFee(l.price), 0) : 0;
  const total = Math.max(0, subtotal - discount + fee);
  const isMobile = ["mtn", "airtel", "zamtel"].includes(method);

  const applyCode = () => {
    if (form.code.trim().toUpperCase() === "JAM2026") { setDiscount(Math.round(subtotal * 0.1)); setErrors({ ...errors, code: "" }); }
    else setErrors({ ...errors, code: "That code isn't valid for this event. Check the spelling or try JAM2026." });
  };

  const pay = () => {
    const err: Record<string, string> = {};
    if (form.name.trim().length < 3) err.name = "Enter your full name as it should appear on the ticket.";
    const phoneErr = phoneError(phone);
    if (phoneErr) err.phone = phoneErr;
    else if (["mtn", "airtel", "zamtel"].includes(method) && phone.country !== "ZM") err.phone = "Mobile money needs a Zambian number (+260). Use a card for a number from another country.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) err.email = "Enter an email address so we can send your tickets.";
    if (!agree) err.agree = "Accept the event terms to continue.";
    setErrors(err);
    if (Object.keys(err).length) return;
    if (total === 0) { router.push(`/checkout/success/?event=${slug}`); return; }
    setStage("waiting");
    setTimeout(() => router.push(`/checkout/success/?event=${slug}&paid=${total}`), 4500);
  };

  if (stage === "waiting") {
    const m = methods.find((x) => x.id === method)!;
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full" style={{ background: m.color + "22" }}>
          <Loader2 size={36} className="animate-spin text-kafue" />
        </div>
        <h1 className="mt-6 text-2xl font-semibold">{isMobile ? "Approve the payment on your phone" : "Confirming your payment"}</h1>
        <p className="mt-2 text-ink-2">
          {isMobile ? <>We sent a {m.name} prompt to <strong>{formatPhone(phone)}</strong> for <strong>{kwacha(total)}</strong>. Enter your PIN to approve it.</> : "Hold on while your bank confirms the payment."}
        </p>
        <p className="mt-4 text-sm text-ink-3">You can close this page. We issue your tickets the moment {m.name} confirms, and send them by SMS and email.</p>
        <div className="mt-8 flex justify-center gap-2">
          <Button variant="secondary" onClick={() => setStage("details")}>Change payment method</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <p className={cx("flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold", hold < 120 ? "bg-hibiscus-soft text-hibiscus" : "bg-marigold-soft text-[#7a4b00] dark:text-marigold")} role="timer">
          <Timer size={16} /> Tickets held for {Math.floor(hold / 60)}:{String(hold % 60).padStart(2, "0")}
        </p>
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold">Your details</h2>
            <p className="text-sm text-ink-3">Tickets go to this phone and email. No account needed.</p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Full name" error={errors.name}><Input value={form.name} onChange={(x) => setForm({ ...form, name: x.target.value })} autoComplete="name" /></Field>
              <Field label="Mobile number" error={errors.phone} hint="For your SMS ticket and mobile money prompt"><PhoneInput value={phone} onChange={setPhone} invalid={!!errors.phone} /></Field>
              <Field label="Email" error={errors.email}><Input value={form.email} onChange={(x) => setForm({ ...form, email: x.target.value })} type="email" autoComplete="email" /></Field>
            </div>
          </section>

          <section className="rounded-2xl border border-line bg-surface p-6">
            <h2 className="text-lg font-semibold">Pay with</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {methods.map((m) => (
                <button key={m.id} onClick={() => setMethod(m.id)} aria-pressed={method === m.id} className={cx("flex items-center gap-3 rounded-xl border-2 p-4 text-left", method === m.id ? "border-kafue bg-kafue-soft" : "border-line hover:border-ink-3")}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-white" style={{ background: m.color }}><m.icon size={18} className={m.id === "mtn" ? "text-[#172033]" : ""} /></span>
                  <span>
                    <span className="block font-semibold">{m.name}</span>
                    <span className="block text-xs text-ink-3">{m.hint}</span>
                  </span>
                </button>
              ))}
            </div>
            {method === "card" && (
              <div className="mt-4 grid gap-4 rounded-xl bg-surface-2 p-4 sm:grid-cols-3">
                <div className="sm:col-span-3"><Field label="Card number"><Input placeholder="1234 5678 9012 3456" inputMode="numeric" autoComplete="cc-number" /></Field></div>
                <Field label="Expiry"><Input placeholder="MM/YY" autoComplete="cc-exp" /></Field>
                <Field label="CVV"><Input placeholder="123" inputMode="numeric" autoComplete="cc-csc" /></Field>
                <p className="flex items-center gap-1.5 text-xs text-ink-3 sm:col-span-3"><Lock size={12} /> Card details go straight to the card processor. We never store them.</p>
              </div>
            )}
          </section>

          <section className="space-y-3 rounded-2xl border border-line bg-surface p-6">
            <Checkbox checked={agree} onChange={setAgree} label={<>I accept the event terms and refund policy. Refunds are available until 5 December.</>} />
            {errors.agree && <p className="text-xs text-hibiscus">{errors.agree}</p>}
            <Checkbox checked={marketing} onChange={setMarketing} label="Tell me about similar events near me (you can turn this off anytime)" />
          </section>
        </div>

        <aside className="h-fit space-y-4 lg:sticky lg:top-14">
          <div className="overflow-hidden rounded-2xl border border-line bg-surface">
            <Poster event={e} size="sm" className="h-24" />
            <div className="p-5">
              <p className="font-semibold">{e.title}</p>
              <p className="text-sm text-ink-3">{fmtDate(e.start, { weekday: "long", day: "numeric", month: "long" })}, {fmtTime(e.start)}</p>
              <ul className="mt-4 space-y-2 border-t border-line pt-4 text-sm">
                {lines.map((l) => (
                  <li key={l.name} className="flex justify-between"><span>{l.qty > 1 ? `${l.qty} × ` : ""}{l.name}</span><span>{kwacha(l.qty * l.price)}</span></li>
                ))}
                {seats && <li className="text-xs text-ink-3">{seats.replaceAll(",", ", ")}</li>}
                {discount > 0 && <li className="flex justify-between text-leaf"><span>Code JAM2026</span><span>−{kwacha(discount)}</span></li>}
                {fee > 0 ? <li className="flex justify-between text-ink-3"><span>Booking fee</span><span>{kwacha(fee)}</span></li> : subtotal > 0 && <li className="text-xs text-ink-3">No booking fee: the organiser pays it</li>}
              </ul>
              <div className="mt-3 flex items-end justify-between border-t border-line pt-3">
                <span className="font-semibold">Total</span>
                <span className="font-display text-2xl font-bold">{kwacha(total)}</span>
              </div>
              <div className="mt-4 flex gap-2">
                <Input aria-label="Discount code" placeholder="Discount code" value={form.code} onChange={(x) => setForm({ ...form, code: x.target.value })} />
                <Button variant="secondary" onClick={applyCode}>Apply</Button>
              </div>
              {errors.code && <p className="mt-1 text-xs text-hibiscus">{errors.code}</p>}
              <Button className="mt-4 w-full" size="lg" variant="ticket" onClick={pay}>
                {total === 0 ? "Confirm free registration" : `Pay ${kwacha(total)}`}
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
