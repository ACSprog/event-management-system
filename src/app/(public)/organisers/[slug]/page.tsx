import { BadgeCheck, MapPin, Star } from "lucide-react";
import { EventCard } from "@/components/event-card";
import { Button } from "@/components/ui";
import { api } from "@/lib/api";
import { organisations } from "@/lib/mock/data";

export function generateStaticParams() {
  return organisations.map((o) => ({ slug: o.slug }));
}

export default async function OrganiserPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const o = api.orgs.get(slug);
  const evs = api.events.discover().filter((e) => e.orgId === o.id);
  return (
    <div className="mx-auto max-w-7xl px-4 py-10">
      <div className="flex flex-wrap items-start justify-between gap-6 rounded-2xl border border-line bg-surface p-8">
        <div className="flex gap-5">
          <span className="font-display flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-ink text-3xl font-bold text-marigold">{o.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</span>
          <div>
            <h1 className="flex items-center gap-2 text-3xl font-semibold">{o.name} {o.verified && <BadgeCheck className="text-kafue" aria-label="Verified organiser" />}</h1>
            <p className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-3">
              <span>{o.type}</span><span className="flex items-center gap-1"><MapPin size={13} />{o.city}</span>
              <span className="flex items-center gap-1"><Star size={13} className="fill-marigold text-marigold" /> 4.6 average from attendees</span>
            </p>
            <p className="mt-3 max-w-2xl text-ink-2">{o.about}</p>
          </div>
        </div>
        <div className="text-right">
          <Button>Follow</Button>
          <p className="mt-2 text-sm text-ink-3">{o.followers.toLocaleString()} followers</p>
        </div>
      </div>
      <h2 className="mb-5 mt-10 text-2xl font-semibold">Upcoming events</h2>
      {evs.length ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">{evs.map((e) => <EventCard key={e.id} e={e} />)}</div>
      ) : (
        <p className="text-ink-3">No upcoming events. Follow to hear about the next one first.</p>
      )}
    </div>
  );
}
