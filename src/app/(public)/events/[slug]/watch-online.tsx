"use client";

import { useState } from "react";
import { Lock, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui";
import { fmtDate, fmtTime } from "@/lib/brand";

/**
 * Online viewing. Ticket holders watch inside the event page (embedded YouTube
 * or Facebook player where the provider allows it), or get a personal Zoom link.
 * Public stream links can still be copied and shared; that is said plainly.
 */
export function WatchOnline({ format, start }: { format: "Virtual" | "Hybrid"; start: string }) {
  const [hasTicket, setHasTicket] = useState(false);
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">{format === "Virtual" ? "How to join" : "Watch online"}</h2>
      <div className="mt-4 overflow-hidden rounded-xl border border-line bg-surface">
        <div className="relative flex aspect-video items-center justify-center bg-ink text-canvas">
          {hasTicket ? (
            <div className="text-center">
              <PlayCircle size={48} className="mx-auto text-marigold" />
              <p className="mt-2 font-semibold">The stream starts {fmtDate(start, { weekday: "long", day: "numeric", month: "long" })} at {fmtTime(start)}</p>
              <p className="text-sm opacity-70">It plays here. Keep this page open.</p>
            </div>
          ) : (
            <div className="px-6 text-center">
              <Lock size={36} className="mx-auto opacity-70" />
              <p className="mt-2 font-semibold">For ticket holders</p>
              <p className="text-sm opacity-70">Buy an online pass and sign in to watch here.</p>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
          <p className="max-w-xl text-ink-3">
            {format === "Virtual"
              ? "Live lessons run on Zoom. Each person gets their own registration link, so please don't share yours."
              : "Streamed on YouTube for online pass holders. We control who can open it here, but a stream link copied elsewhere can't be stopped."}
          </p>
          <Button size="sm" variant="secondary" onClick={() => setHasTicket(!hasTicket)}>{hasTicket ? "Preview without a ticket" : "Preview as a ticket holder"}</Button>
        </div>
      </div>
    </section>
  );
}
