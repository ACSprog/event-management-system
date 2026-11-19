import Link from "next/link";
import { MapPin, Star } from "lucide-react";
import { Poster } from "@/components/poster";
import { Badge } from "@/components/ui";
import { api, capacity, fromPrice, sold, type EventItem } from "@/lib/api";
import { fmtDate, fmtTime, kwacha } from "@/lib/brand";

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
          {e.audience === "18+" && <Badge className="bg-ink text-canvas">18+</Badge>}
          {e.audience === "Family-friendly" && <Badge className="bg-white/90 text-ink">Family</Badge>}
        </div>
      </div>
      <div className="mt-3">
        <p className="text-[13px] font-semibold text-kafue">
          {fmtDate(e.start)}, {fmtTime(e.start)}
        </p>
        <h3 className="mt-0.5 line-clamp-2 text-[17px] font-semibold leading-snug group-hover:underline">{e.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-ink-3">
          <MapPin size={13} className="shrink-0" /> <span className="truncate">{e.format === "Virtual" ? "Online on Zoom" : venue.name}</span>
          {showDistance && e.distanceKm > 0 && e.distanceKm < 50 && <span className="shrink-0">, {e.distanceKm} km</span>}
        </p>
        <div className="mt-2 flex items-center justify-between text-sm">
          <span className="font-semibold">{price === 0 ? "Free" : `From ${kwacha(price)}`}</span>
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
