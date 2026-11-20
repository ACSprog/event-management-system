import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Poster } from "@/components/poster";
import { Badge } from "@/components/ui";
import { api, capacity, fromPrice, sold, type EventItem } from "@/lib/api";
import { fmtDate, fmtTime, kwacha } from "@/lib/brand";
import { isLive } from "@/lib/date-ranges";
import { catColor } from "@/lib/category-colors";

export function EventCard({ e, showDistance = true }: { e: EventItem; showDistance?: boolean }) {
  const venue = api.venues.get(e.venueId);
  const left = capacity(e) - sold(e);
  const pct = sold(e) / capacity(e);
  const price = fromPrice(e);
  return (
    <Link href={`/events/${e.slug}/`} className="group block">
      <div className="relative overflow-hidden rounded-xl">
        <Poster event={e} className="aspect-[4/3] transition-transform duration-300 group-hover:scale-[1.02]" />
        <div className="absolute left-3 top-3 flex gap-1.5">
          {e.status === "Sold out" && <Badge tone="red" className="bg-white text-hibiscus">Sold out</Badge>}
          {e.status !== "Sold out" && pct > 0.8 && <Badge className="bg-white text-[#7a4b00]">Selling fast</Badge>}
          {e.format !== "Physical" && <Badge className="bg-white/90 text-ink">{e.format}</Badge>}
          {isLive(e) && <span className="inline-flex items-center gap-1.5 rounded-full bg-[#c42539] px-2.5 py-0.5 text-xs font-semibold text-white"><span className="h-1.5 w-1.5 rounded-full bg-white motion-safe:animate-pulse" /> Live now</span>}
          {e.audience === "18+" && <Badge className="bg-ink text-canvas">18+</Badge>}
          {e.audience === "Family-friendly" && <Badge className="bg-white/90 text-ink">Family</Badge>}
        </div>
      </div>
      <div className="mt-3">
        {/* Category in its own colour, so a page of events looks varied at a glance. */}
        <p className="flex items-center gap-1.5 text-[13px] font-semibold">
          <span className="uppercase tracking-wide" style={{ color: catColor(e.category).fg }}>{e.category}</span>
          <span className="text-ink-3">·</span>
          <span className="text-ink-2">{fmtDate(e.start)}, {fmtTime(e.start)}</span>
        </p>
        <h3 className="font-display mt-0.5 line-clamp-2 text-[18px] font-bold leading-snug group-hover:underline">{e.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-3">
          <MapPin size={13} className="shrink-0" /> <span className="truncate">{e.format === "Virtual" ? "Online on Zoom" : venue.name}</span>
          {showDistance && e.distanceKm > 0 && e.distanceKm < 50 && <span className="shrink-0">, {e.distanceKm} km</span>}
        </p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-bold">{price === 0 ? "Free" : `From ${kwacha(price)}`}</span>
          {e.rating ? (
            <span className="flex items-center gap-1 text-ink-3">
              <Star size={13} className="fill-marigold text-marigold" /> {e.rating} ({e.reviews})
            </span>
          ) : left > 0 && left < 200 ? (
            <span className="text-hibiscus">{left} left</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}
