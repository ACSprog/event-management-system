import { Check, ScanLine, Smartphone, Wallet, BarChart3, Users, Video } from "lucide-react";
import { Button } from "@/components/ui";
import { api, feeText } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export const metadata = { title: "For organisers" };

export default function ForOrganisers() {
  const plans = api.billing.plans();
  const features = api.billing.features();
  const licences = api.billing.licencePackages();
  const order = ["Free", "Starter", "Professional", "Enterprise"];
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
      <p className="mt-1 max-w-2xl text-ink-3">Free events are always free. Selling tickets? Start on the free plan and pay only a fee on paid tickets. Organise often? A plan lowers your fees and adds team and business tools.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {plans.map((p) => (
          <div key={p.key} className={p.key === "Professional" ? "rounded-2xl border-2 border-kafue bg-surface p-6" : "rounded-2xl border border-line bg-surface p-6"}>
            <p className="font-semibold">{p.key}</p>
            <p className="font-display mt-2 text-4xl font-bold">{p.monthly === null ? "Contract" : p.monthly ? kwacha(p.monthly) : "K0"}<span className="text-base font-normal text-ink-3">{p.monthly ? " a month" : ""}</span></p>
            <p className="mt-1 text-sm text-ink-3">{feeText(p)}</p>
            <p className="mt-3 text-sm">{p.blurb}</p>
            <ul className="mt-4 space-y-2 text-sm">
              {features.filter((f) => f[order.indexOf(p.key) + 1]).slice(0, 6).map((f) => <li key={f[0]} className="flex gap-2"><Check size={16} className="shrink-0 text-leaf" />{f[0]}</li>)}
            </ul>
            <Button href="/register/organisation/" variant={p.key === "Professional" ? "primary" : "secondary"} className="mt-6 w-full">{p.key === "Enterprise" ? "Talk to us" : p.key === "Free" ? "Start free" : `Try ${p.key} free for 14 days`}</Button>
          </div>
        ))}
      </div>
      <h3 className="mt-14 text-2xl font-semibold">Planning one wedding, party or private function?</h3>
      <p className="mt-1 max-w-2xl text-ink-3">Pay once for one event, no subscription. RSVP, QR invitations and check-in included. Guests over your limit are still let in on the day; you just top up afterwards.</p>
      <div className="mt-6 grid gap-6 md:grid-cols-3">
        {licences.map((l) => (
          <div key={l.key} className="rounded-2xl border border-line bg-surface p-6">
            <p className="font-semibold">{l.key}</p>
            <p className="font-display mt-2 text-3xl font-bold">{kwacha(l.price)}<span className="text-base font-normal text-ink-3"> once</span></p>
            <p className="text-sm text-ink-3">Up to {l.guests.toLocaleString()} guests</p>
            <ul className="mt-4 space-y-2 text-sm">{l.features.map((f) => <li key={f} className="flex gap-2"><Check size={16} className="shrink-0 text-leaf" />{f}</li>)}</ul>
            <Button href="/register/organisation/?type=one-off" variant="secondary" className="mt-6 w-full">Choose {l.key}</Button>
          </div>
        ))}
      </div>
      <p className="mt-6 text-sm text-ink-3">You&rsquo;re paid once, after your event: ticket money is held safely until it&rsquo;s over, so buyers can always be refunded if plans change.</p>
    </div>
  );
}
