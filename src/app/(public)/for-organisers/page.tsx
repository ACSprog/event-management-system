import { Check, ScanLine, Smartphone, Wallet, BarChart3, Users, Video } from "lucide-react";
import { Button } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export const metadata = { title: "For organisers" };

export default function ForOrganisers() {
  const plans = api.platform.plans();
  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display max-w-3xl text-5xl font-bold leading-[1.02]">Sell out, scan fast, get paid. One system for the whole event.</h1>
      <p className="mt-5 max-w-2xl text-lg text-ink-2">From a 40-seat workshop to a 35,000-person stadium night. Mobile money checkout, offline gate scanning and a live profit view, built for Zambia.</p>
      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        {[
          { i: Smartphone, t: "Mobile money checkout", b: "MTN, Airtel, Zamtel and cards. Tickets issued only after the payment is confirmed." },
          { i: ScanLine, t: "Gates that keep moving", b: "Any phone becomes a scanner. Works offline and blocks a ticket used at another gate." },
          { i: Wallet, t: "Know your profit", b: "Budgets, vendor bills and payouts next to your ticket sales." },
          { i: Users, t: "Your audience, your data", b: "Customer lists, segments and SMS, email and push campaigns." },
          { i: Video, t: "Online classes too", b: "Sell courses and run them on Zoom with attendance and certificates." },
          { i: BarChart3, t: "Reviews you can act on", b: "Verified attendee ratings, broken down by venue, sound, security and value." },
        ].map(({ i: I, t, b }) => (
          <div key={t}>
            <I className="text-kafue" />
            <p className="mt-3 font-semibold">{t}</p>
            <p className="mt-1 text-sm text-ink-2">{b}</p>
          </div>
        ))}
      </div>
      <h2 className="mt-16 text-3xl font-semibold">Pricing</h2>
      <p className="mt-1 text-ink-3">Free events are always free. Fees are only charged on paid tickets.</p>
      <div className="mt-6 grid gap-6 lg:grid-cols-3">
        {plans.map((p, i) => (
          <div key={p.name} className={i === 1 ? "rounded-2xl border-2 border-kafue bg-surface p-6" : "rounded-2xl border border-line bg-surface p-6"}>
            <p className="font-semibold">{p.name}</p>
            <p className="font-display mt-2 text-4xl font-bold">{p.price ? kwacha(p.price) : "K0"}<span className="text-base font-normal text-ink-3">{p.price ? " a month" : ""}</span></p>
            <p className="mt-1 text-sm text-ink-3">{p.fee}</p>
            <ul className="mt-5 space-y-2 text-sm">
              {p.features.map((f) => <li key={f} className="flex gap-2"><Check size={16} className="shrink-0 text-leaf" />{f}</li>)}
            </ul>
            <Button href="/register/organisation/" variant={i === 1 ? "primary" : "secondary"} className="mt-6 w-full">{p.name === "Enterprise" ? "Talk to us" : `Start on ${p.name}`}</Button>
          </div>
        ))}
      </div>
    </div>
  );
}
