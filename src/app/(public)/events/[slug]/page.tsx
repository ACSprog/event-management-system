import Link from "next/link";
import { BadgeCheck, Calendar, Clock, MapPin, Share2, Star, Video, Bus, Accessibility, Navigation, LifeBuoy } from "lucide-react";
import { LocationMap } from "@/components/location-map";
import { directionsLinks, plusCodeFor } from "@/lib/location";
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
  const landmarks = api.location.search(venue.name).find((p) => p.name === venue.name)?.directions;
  const dir = directionsLinks(venue);
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
              {e.format !== "Virtual" && <Link href={`/events/${e.slug}/help/`} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-2 text-sm font-medium hover:bg-surface-2"><LifeBuoy size={15} /> At the event? Request help</Link>}
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
                <LocationMap lat={venue.lat} lng={venue.lng} height={260} />
                <div className="space-y-3 text-sm">
                  <p className="font-semibold">{venue.name}</p>
                  <p className="text-ink-3">{venue.address}</p>
                  {landmarks && <p className="flex gap-2"><Navigation size={16} className="shrink-0 text-kafue" /> {landmarks}</p>}
                  <p className="flex gap-2"><Bus size={16} className="shrink-0 text-kafue" /> Free shuttles from Manda Hill and East Park every 20 minutes from 15:00.</p>
                  <p className="flex gap-2"><Accessibility size={16} className="shrink-0 text-kafue" /> Step-free entrance at Gate A. Tell us at checkout if you need help.</p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a href={dir.google} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold bg-kafue text-white hover:opacity-90"><Navigation size={14} /> Google Maps</a>
                    <a href={dir.apple} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border border-line bg-surface hover:border-kafue">Apple Maps</a>
                    <a href={dir.waze} target="_blank" rel="noopener" className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-semibold border border-line bg-surface hover:border-kafue">Waze</a>
                  </div>
                  <p className="text-xs text-ink-3">Plus code: {plusCodeFor(venue.lat, venue.lng)}</p>
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
