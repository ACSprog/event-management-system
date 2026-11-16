"use client";

import { useState } from "react";
import { BadgeCheck, ThumbsUp } from "lucide-react";
import { Progress, Stars } from "@/components/ui";
import { api } from "@/lib/api";

export function ReviewsBlock({ rating, count }: { rating: number; count: number }) {
  const all = api.reviews.forEvent().filter((r) => r.visibility === "Public");
  const [helped, setHelped] = useState<string[]>([]);
  const dist = [62, 21, 9, 4, 4];
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">What attendees said</h2>
      <p className="text-sm text-ink-3">From this organiser&rsquo;s past events. Only people who held a ticket can review.</p>
      <div className="mt-4 grid gap-6 rounded-xl border border-line bg-surface p-5 sm:grid-cols-[180px_1fr]">
        <div>
          <p className="font-display text-5xl font-bold">{rating}</p>
          <Stars value={rating} size={16} />
          <p className="mt-1 text-sm text-ink-3">{count.toLocaleString()} reviews</p>
          <p className="mt-2 text-sm"><span className="font-semibold">91%</span> would recommend</p>
        </div>
        <div className="space-y-1.5">
          {dist.map((d, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="w-10 text-ink-3">{5 - i} star</span>
              <Progress value={d} tone="marigold" className="flex-1" />
              <span className="w-9 text-right text-ink-3">{d}%</span>
            </div>
          ))}
        </div>
      </div>
      <ul className="mt-4 space-y-3">
        {all.map((r) => (
          <li key={r.id} className="rounded-xl border border-line bg-surface p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Stars value={r.rating} />
                <span className="font-semibold">{r.title}</span>
              </div>
              <span className="flex items-center gap-1 text-xs font-semibold text-leaf"><BadgeCheck size={14} /> Verified: {r.verified.toLowerCase()}</span>
            </div>
            <p className="mt-2 text-ink-2">{r.body}</p>
            <p className="mt-2 text-xs text-ink-3">{r.name}, {r.event}</p>
            {r.reply && (
              <div className="mt-3 rounded-lg bg-surface-2 px-4 py-3 text-sm">
                <p className="font-semibold">Reply from the organiser</p>
                <p className="text-ink-2">{r.reply}</p>
              </div>
            )}
            <button onClick={() => setHelped((h) => (h.includes(r.id) ? h.filter((x) => x !== r.id) : [...h, r.id]))} className="mt-3 flex items-center gap-1.5 text-sm text-ink-3 hover:text-ink">
              <ThumbsUp size={14} className={helped.includes(r.id) ? "fill-kafue text-kafue" : ""} /> Helpful ({r.helpful + (helped.includes(r.id) ? 1 : 0)})
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
