"use client";

import { useState } from "react";
import { BadgeCheck, CircleHelp, ThumbsUp } from "lucide-react";
import { cx, Progress, Stars } from "@/components/ui";
import { api } from "@/lib/api";

export function ReviewsBlock({ rating, count }: { rating: number; count: number }) {
  const all = api.reviews.forEvent().filter((r) => r.visibility === "Public");
  const [helped, setHelped] = useState<string[]>([]);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const shown = all.filter((r) => !verifiedOnly || r.verified !== "Not verified");
  const dist = api.reviews.breakdown();
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">What attendees said</h2>
      <p className="text-sm text-ink-3">From this organiser&rsquo;s past events. Reviews marked verified come from people whose ticket was scanned or registration confirmed.</p>
      <div className="mt-4 grid gap-6 rounded-xl border border-line bg-surface p-5 sm:grid-cols-[180px_1fr]">
        <div>
          <p className="font-display text-5xl font-bold">{rating}</p>
          <Stars value={rating} size={16} />
          <p className="mt-1 text-sm text-ink-3">{count.toLocaleString()} reviews</p>
          <p className="mt-2 text-sm"><span className="font-semibold">88%</span> would recommend</p>
        </div>
        <div className="space-y-1.5">
          {dist.map((d) => (
            <div key={d.stars} className="flex items-center gap-3 text-sm">
              <span className="w-10 text-ink-3">{d.stars} star</span>
              <Progress value={d.pct} tone="marigold" className="flex-1" />
              <span className="w-9 text-right text-ink-3">{d.pct}%</span>
            </div>
          ))}
        </div>
      </div>
      <label className="mt-4 flex items-center gap-2 text-sm">
        <input type="checkbox" checked={verifiedOnly} onChange={(e) => setVerifiedOnly(e.target.checked)} className="h-4 w-4 accent-[var(--kafue)]" /> Show verified reviews only
      </label>
      <ul className="mt-3 space-y-3">
        {shown.map((r) => {
          const unverified = r.verified === "Not verified";
          const photos = api.reviews.photos(r.id);
          return (
            <li key={r.id} className={cx("rounded-xl border bg-surface p-5", unverified ? "border-dashed border-line" : "border-line")}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Stars value={r.rating} />
                  <span className="font-semibold">{r.title}</span>
                </div>
                {unverified ? (
                  <span className="flex items-center gap-1 text-xs font-semibold text-ink-3"><CircleHelp size={14} /> Not verified: no ticket found</span>
                ) : (
                  <span className="flex items-center gap-1 text-xs font-semibold text-leaf"><BadgeCheck size={14} /> Verified: {r.verified.toLowerCase()}</span>
                )}
              </div>
              <p className="mt-2 text-ink-2">{r.body}</p>
              {photos.length > 0 && (
                <div className="mt-3 flex gap-2">
                  {photos.map((p) => (
                    <div key={p.label} className="flex h-20 w-28 items-end rounded-lg p-2 text-[11px] font-medium text-white" style={{ background: p.tint }} role="img" aria-label={p.label}>{p.label}</div>
                  ))}
                </div>
              )}
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
          );
        })}
      </ul>
    </section>
  );
}
