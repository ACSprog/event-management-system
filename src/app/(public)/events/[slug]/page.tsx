import Link from "next/link";
import { BadgeCheck, Calendar, Clock, MapPin, Share2, Star, Video, Bus, Accessibility } from "lucide-react";
import { Poster } from "@/components/poster";
import { TicketPicker } from "@/components/ticket-picker";
import { api } from "@/lib/api";
import { events, orgEventsExtra } from "@/lib/mock/data";
import { fmtDate, fmtTime } from "@/lib/brand";
import { ReviewsBlock } from "./reviews-block";
import { AddToCalendar } from "@/components/add-to-calendar";
import { WatchOnline } from "./watch-online";
import { ProgrammeView } from "@/components/programme";

export function generateStaticParams() {
  return [...events, ...orgEventsExtra].map((e) => ({ slug: e.slug }));
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const e = api.events.bySlug(slug)!;
  const venue = api.venues.get(e.venueId);
  const org = api.orgs.get(e.orgId);
  const programme = api.events.programme(e.id).length
    ? api.events.programme(e.id)
    : (e.schedule ?? []).map((x, i) => ({ id: `s${i}`, day: fmtDate(e.start, { weekday: "short", day: "numeric", month: "short" }), start: x.time, title: x.title, kind: "Activity", who: x.detail }));
  const sameDay = new Date(e.start).toDateString() === new Date(e.end).toDateString();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <Link href="/events/" className="text-sm text-ink-3 hover:text-kafue">‹ All events</Link>
      <div className="mt-3 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="min-w-0">
          <Poster event={e} size="lg" className="aspect-[16/8] rounded-2xl" />
          <div className="mt-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="text-[34px] font-semibold leading-tight">{e.title}</h1>
              <p className="mt-1 text-lg text-ink-2">{e.subtitle}</p>
            </div>
            <div className="flex gap-2">
              <AddToCalendar title={e.title} start={e.start} end={e.end} location={e.format === "Virtual" ? "Online" : `${venue.name}, ${venue.address}`} details={e.subtitle} />
              <button className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium hover:bg-surface-2"><Share2 size={15} /> Share</button>
            </div>
          </div>

          <dl className="mt-6 grid gap-4 rounded-xl border border-line bg-surface p-5 sm:grid-cols-3">
            <div className="flex gap-3">
              <Calendar className="mt-0.5 shrink-0 text-kafue" size={18} />
              <div><dt className="text-sm text-ink-3">Date</dt><dd className="font-semibold">{fmtDate(e.start, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}{!sameDay && ` to ${fmtDate(e.end, { day: "numeric", month: "long" })}`}</dd></div>
            </div>
            <div className="flex gap-3">
              <Clock className="mt-0.5 shrink-0 text-kafue" size={18} />
              <div><dt className="text-sm text-ink-3">Time (Lusaka)</dt><dd className="font-semibold">{fmtTime(e.start)} to {fmtTime(e.end)}</dd></div>
            </div>
            <div className="flex gap-3">
              {e.format === "Virtual" ? <Video className="mt-0.5 shrink-0 text-kafue" size={18} /> : <MapPin className="mt-0.5 shrink-0 text-kafue" size={18} />}
              <div><dt className="text-sm text-ink-3">{e.format === "Virtual" ? "Where" : "Venue"}</dt><dd className="font-semibold">{e.format === "Virtual" ? "Online, live on Zoom" : venue.name}</dd>{e.format === "Hybrid" && <dd className="text-sm text-ink-3">Also streamed online</dd>}</div>
            </div>
          </dl>

          <section className="mt-10">
            <h2 className="text-xl font-semibold">About this event</h2>
            <p className="mt-3 max-w-[68ch] text-[16px] leading-relaxed text-ink-2">{e.description}</p>
          </section>

          {e.format !== "Physical" && <WatchOnline format={e.format} start={e.start} />}

          {e.lineup && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold">{e.category === "Conference" ? "Speakers" : "Line-up"}</h2>
              <ul className="mt-4 flex flex-wrap gap-2">
                {e.lineup.map((n) => <li key={n} className="rounded-full border border-line bg-surface px-4 py-2 font-medium">{n}</li>)}
              </ul>
            </section>
          )}

          <ProgrammeView items={programme} />

          {e.format !== "Virtual" && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold">Getting there</h2>
              <div className="mt-4 grid gap-4 sm:grid-cols-[1.2fr_1fr]">
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-[#e7efe9] dark:bg-[#18262a]">
                  <svg viewBox="0 0 320 200" className="absolute inset-0 h-full w-full" aria-hidden>
                    <path d="M0 120 L320 110 M150 0 L170 200 M0 30 L320 190" stroke="#fff" strokeOpacity=".8" strokeWidth="6" />
                    <g transform="translate(162 112)"><path d="M0 0 C-10 -12 -10 -26 0 -28 C10 -26 10 -12 0 0Z" fill="var(--hibiscus)" /><circle cy="-18" r="4" fill="#fff" /></g>
                  </svg>
                  <span className="absolute bottom-2 left-2 rounded bg-surface px-2 py-1 text-xs">{venue.lat.toFixed(4)}, {venue.lng.toFixed(4)}</span>
                </div>
                <div className="space-y-3 text-sm">
                  <p className="font-semibold">{venue.name}</p>
                  <p className="text-ink-3">{venue.address}</p>
                  <p className="flex gap-2"><Bus size={16} className="shrink-0 text-kafue" /> Free shuttles from Manda Hill and East Park every 20 minutes from 15:00.</p>
                  <p className="flex gap-2"><Accessibility size={16} className="shrink-0 text-kafue" /> Step-free entrance at Gate A. Tell us at checkout if you need help.</p>
                  <a href={`https://www.google.com/maps?q=${venue.lat},${venue.lng}`} className="inline-block font-semibold text-kafue hover:underline">Open in Google Maps</a>
                </div>
              </div>
            </section>
          )}

          {e.faqs && (
            <section className="mt-10">
              <h2 className="text-xl font-semibold">Questions</h2>
              <div className="mt-4 divide-y divide-line rounded-xl border border-line bg-surface">
                {e.faqs.map((f) => (
                  <details key={f.q} className="group px-5 py-4">
                    <summary className="cursor-pointer list-none font-medium">{f.q}</summary>
                    <p className="mt-2 text-sm text-ink-2">{f.a}</p>
                  </details>
                ))}
              </div>
            </section>
          )}

          {e.rating && <ReviewsBlock rating={e.rating} count={e.reviews ?? 0} />}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-14 lg:self-start">
          <TicketPicker e={e} />
          <Link href={`/organisers/${org.slug}/`} className="flex items-center justify-between rounded-2xl border border-line bg-surface p-5 hover:border-kafue">
            <div>
              <p className="text-sm text-ink-3">Organised by</p>
              <p className="flex items-center gap-1.5 font-semibold">{org.name} {org.verified && <BadgeCheck size={16} className="text-kafue" aria-label="Verified" />}</p>
              <p className="mt-1 flex items-center gap-1 text-sm text-ink-3"><Star size={13} className="fill-marigold text-marigold" /> 4.6 across {org.events} events</p>
            </div>
            <span className="rounded-full border border-line px-3 py-1.5 text-sm font-semibold">Follow</span>
          </Link>
        </aside>
      </div>
    </div>
  );
}
