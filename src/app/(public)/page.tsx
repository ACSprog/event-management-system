import Link from "next/link";
import { BadgeCheck, MapPin, Navigation, ShieldCheck, Smartphone, Zap } from "lucide-react";
import { Poster } from "@/components/poster";
import { EventCard } from "@/components/event-card";
import { Button, Progress } from "@/components/ui";
import { api, capacity, fromPrice, sold } from "@/lib/api";
import { fmtDate, fmtTime, kwacha } from "@/lib/brand";
import { catColor } from "@/lib/category-colors";

const categories = ["Music", "Conference", "Church", "Sports", "Education", "Workshop", "Exhibition", "Charity", "Comedy"];

export default function Home() {
  const all = api.events.discover();
  const featured = all[0];
  const venue = api.venues.get(featured.venueId);
  const nearby = all.filter((e) => e.distanceKm > 0 && e.distanceKm < 25);
  const fast = all.filter((e) => sold(e) / capacity(e) > 0.6 && e.status !== "Sold out");
  const orgs = api.orgs.list().filter((o) => o.verified).slice(0, 4);
  const cause = api.fundraising.campaigns()[0];

  return (
    <>
      {/*
        Hero: dark, with a glow, so the public site feels like a night out rather
        than a dashboard. Fixed colours (not theme tokens) so it looks the same in
        light and dark mode. The next big event is presented as a ticket.
      */}
      <section className="relative overflow-hidden bg-[#0f1522] text-white">
        <div aria-hidden className="pointer-events-none absolute -left-32 -top-40 h-[28rem] w-[28rem] rounded-full bg-[#F4A630]/25 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-48 right-0 h-[30rem] w-[30rem] rounded-full bg-[#C026D3]/20 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.15fr] lg:gap-10 lg:py-16">
          <div className="flex flex-col justify-center">
            <p className="flex items-center gap-1.5 text-sm font-medium text-white/80">
              <Navigation size={14} className="text-[#F4A630]" /> Lusaka, within 25 km
              <Link href="/account/preferences/" className="ml-1 text-[#F4A630] underline-offset-2 hover:underline">Change</Link>
            </p>
            <h1 className="font-display mt-3 text-[40px] font-bold leading-[0.98] tracking-tight sm:text-6xl">
              What&rsquo;s on near you, and the <span className="text-[#F4A630]">fastest way in.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-white/75 sm:text-lg">Buy with mobile money in under a minute. Your QR ticket arrives by SMS, WhatsApp and email.</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {categories.slice(0, 6).map((c) => (
                <Link key={c} href={`/events/?category=${c}`} className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-4 py-2 text-sm font-medium hover:border-white/60">
                  <span className="h-2 w-2 rounded-full" style={{ background: catColor(c).palette[0] }} />{c}
                </Link>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button href="/events/" variant="ticket" size="lg">Find events</Button>
              <Button href="/events/?when=today" size="lg" className="border border-white/25 bg-transparent text-white hover:bg-white/10">What&rsquo;s on today</Button>
            </div>
          </div>

          <Link href={`/events/${featured.slug}/`} className="group block" aria-label={`${featured.title}, get tickets`}>
            <div className="ticket flex overflow-hidden rounded-2xl bg-[#172033] shadow-[0_30px_80px_-20px_rgba(244,166,48,.35)] ring-1 ring-white/10" style={{ ["--stub" as string]: "70%" }}>
              <Poster event={featured} size="lg" className="min-h-[300px] w-[70%] sm:min-h-[340px]" />
              <div className="ticket-perf flex w-[30%] flex-col justify-between border-white/25 p-4 text-white sm:p-5">
                <div>
                  <p className="text-xs text-white/60">Admit one from</p>
                  <p className="font-display text-2xl font-bold sm:text-3xl">{kwacha(fromPrice(featured))}</p>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-semibold">{fmtDate(featured.start, { weekday: "long", day: "numeric", month: "long" })}</p>
                  <p className="text-white/70">Gates {fmtTime(featured.start)}</p>
                  <p className="text-white/70">{venue.name}</p>
                </div>
                <span className="rounded-lg bg-marigold py-2.5 text-center text-sm font-bold text-[#2a1a00] group-hover:brightness-95">Get tickets</span>
              </div>
            </div>
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-7xl space-y-14 px-4 pt-12">
        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Recommended for you</h2>
              <p className="text-sm text-ink-3">Based on events you&rsquo;ve been to, organisers you follow and what you told us you enjoy.</p>
            </div>
            <Link href="/account/preferences/" className="text-sm font-semibold text-kafue hover:underline">Change interests</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {api.events.recommended().map(({ event, reason }) => (
              <div key={event.id}>
                <p className="mb-2 text-xs font-medium text-ink-3">{reason}</p>
                <EventCard e={event} />
              </div>
            ))}
          </div>
        </section>

        <section>
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-bold">Near you this month</h2>
              <p className="flex items-center gap-1 text-sm text-ink-3"><MapPin size={13} /> Sorted by distance from Lusaka CBD</p>
            </div>
            <Link href="/events/?near=1" className="text-sm font-semibold text-kafue hover:underline">See map and all</Link>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {nearby.sort((a, b) => a.distanceKm - b.distanceKm).slice(0, 4).map((e) => <EventCard key={e.id} e={e} />)}
          </div>
        </section>

        <section className="grid gap-4 rounded-2xl bg-kafue px-6 py-7 text-white sm:grid-cols-3 dark:bg-kafue-soft">
          {[
            { icon: Smartphone, t: "Pay the way you already pay", b: "MTN MoMo, Airtel Money, Zamtel Kwacha or card. Approve on your phone and you're done." },
            { icon: Zap, t: "Tickets that scan in a second", b: "Each QR code is signed, so gates check it instantly, even without signal." },
            { icon: ShieldCheck, t: "Real tickets only", b: "Buy from verified organisers. Transfers go through the app, never through screenshots." },
          ].map(({ icon: Icon, t, b }) => (
            <div key={t} className="flex gap-3">
              <Icon className="mt-0.5 shrink-0 text-marigold" size={22} />
              <div>
                <p className="font-semibold">{t}</p>
                <p className="mt-1 text-sm text-white/80 dark:text-ink-2">{b}</p>
              </div>
            </div>
          ))}
        </section>

        <section>
          <h2 className="font-display mb-5 text-2xl font-bold">Selling fast</h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {fast.slice(0, 4).map((e) => <EventCard key={e.id} e={e} />)}
          </div>
        </section>

        <section>
          <h2 className="font-display mb-5 text-2xl font-bold">Browse by type</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {categories.slice(0, 10).map((c) => (
              <Link key={c} href={`/events/?category=${c}`} className="overflow-hidden rounded-xl">
                <Poster event={{ title: c, category: c as never, palette: catColor(c).palette, start: all[0].start, city: "" }} size="sm" className="aspect-[3/2]" />
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display mb-5 text-2xl font-bold">Organisers to follow</h2>
            <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
              {orgs.map((o) => (
                <li key={o.id}>
                  <Link href={`/organisers/${o.slug}/`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-surface-2">
                    <div>
                      <p className="flex items-center gap-1.5 font-semibold">{o.name} {o.verified && <BadgeCheck size={16} className="text-kafue" aria-label="Verified" />}</p>
                      <p className="text-sm text-ink-3">{o.type}, {o.city}</p>
                    </div>
                    <span className="text-sm text-ink-3">{o.followers.toLocaleString()} followers</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-display mb-5 text-2xl font-bold">Give to a cause</h2>
            <Link href={`/fundraising/${cause.slug}/`} className="block overflow-hidden rounded-xl border border-line bg-surface">
              <Poster event={{ title: cause.title, category: "Charity", palette: cause.palette, start: "2027-01-01", city: "Southern Province" }} className="aspect-[2/1]" />
              <div className="p-5">
                <p className="text-sm text-ink-3">{cause.org}</p>
                <div className="mt-3 flex items-baseline justify-between">
                  <p className="font-display text-2xl font-bold">{kwacha(cause.raised)}</p>
                  <p className="text-sm text-ink-3">of {kwacha(cause.target)}</p>
                </div>
                <Progress value={(cause.raised / cause.target) * 100} tone="marigold" className="mt-2" />
                <p className="mt-2 text-sm text-ink-3">{cause.donors} donors, {cause.daysLeft} days left</p>
              </div>
            </Link>
          </div>
        </section>

        <section className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-line bg-surface p-8 sm:flex-row sm:items-center">
          <div>
            <h2 className="font-display text-2xl font-bold">Running an event?</h2>
            <p className="mt-1 max-w-xl text-ink-2">Sell tickets, scan at the gate, pay vendors and see your profit in one place. Free events cost nothing.</p>
          </div>
          <div className="flex gap-2">
            <Button href="/for-organisers/" variant="secondary">See pricing</Button>
            <Button href="/register/organisation/">Start selling</Button>
          </div>
        </section>
      </div>
    </>
  );
}
