"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShieldCheck } from "lucide-react";
import { Button, cx } from "@/components/ui";
import type { EventItem } from "@/lib/api";
import { fmtDate, kwacha } from "@/lib/brand";

export function TicketPicker({ e }: { e: EventItem }) {
  const router = useRouter();
  const [qty, setQty] = useState<Record<string, number>>({});
  const total = e.tickets.reduce((a, t) => a + (qty[t.id] ?? 0) * t.price, 0);
  const count = Object.values(qty).reduce((a, b) => a + b, 0);
  const isPrivate = e.category === "Wedding";
  const soldOut = e.status === "Sold out";

  const go = () => {
    const qs = new URLSearchParams(Object.entries(qty).filter(([, n]) => n > 0).map(([k, n]) => [k, String(n)]));
    router.push(e.seating === "Reserved" ? `/events/${e.slug}/seats/?${qs}` : `/checkout/${e.slug}/?${qs}`);
  };

  return (
    <div className="rounded-2xl border border-line bg-surface p-5">
      <h2 className="text-lg font-semibold">{isPrivate ? "RSVP" : e.format === "Virtual" ? "Enrol" : "Tickets"}</h2>
      {soldOut && <p className="mt-2 rounded-lg bg-hibiscus-soft px-3 py-2 text-sm text-hibiscus">Sold out. Join the waiting list and we&rsquo;ll text you if tickets are returned.</p>}
      <ul className="mt-3 divide-y divide-line">
        {e.tickets.map((t) => {
          const left = t.capacity - t.sold;
          const n = qty[t.id] ?? 0;
          const max = Math.min(t.perOrderLimit, left);
          return (
            <li key={t.id} className="flex items-center justify-between gap-3 py-3">
              <div className="min-w-0">
                <p className="font-semibold">{t.name}</p>
                <p className="text-sm text-ink-3">{t.description || "Admission"}</p>
                <p className={cx("mt-0.5 text-xs", left === 0 ? "text-hibiscus" : left < 100 ? "text-[#a35f00] dark:text-marigold" : "text-ink-3")}>
                  {left === 0 ? "Sold out" : left < 100 ? `Only ${left} left` : `Sales end ${fmtDate(t.salesEnd, { day: "numeric", month: "short" })}`}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1.5">
                <span className="font-semibold tabular-nums">{t.price === 0 ? "Free" : kwacha(t.price)}</span>
                {left > 0 && (
                  <div className="flex items-center gap-1">
                    <button aria-label={`Fewer ${t.name}`} disabled={n === 0} onClick={() => setQty({ ...qty, [t.id]: n - 1 })} className="flex h-8 w-8 items-center justify-center rounded-full border border-line disabled:opacity-40"><Minus size={14} /></button>
                    <span className="w-6 text-center font-semibold tabular-nums" aria-live="polite">{n}</span>
                    <button aria-label={`More ${t.name}`} disabled={n >= max} onClick={() => setQty({ ...qty, [t.id]: n + 1 })} className="flex h-8 w-8 items-center justify-center rounded-full border border-line disabled:opacity-40"><Plus size={14} /></button>
                  </div>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-4">
        <span className="text-sm text-ink-3">{count} selected</span>
        <span className="font-display text-xl font-bold">{kwacha(total)}</span>
      </div>
      {soldOut ? (
        <Button className="mt-4 w-full" size="lg" variant="secondary">Join waiting list</Button>
      ) : (
        <Button className="mt-4 w-full" size="lg" variant="ticket" disabled={count === 0} onClick={go}>
          {count === 0 ? "Choose tickets" : isPrivate ? "Continue to RSVP" : e.seating === "Reserved" ? "Choose seats" : "Continue to payment"}
        </Button>
      )}
      <p className="mt-3 flex items-start gap-1.5 text-xs text-ink-3">
        <ShieldCheck size={14} className="mt-px shrink-0 text-leaf" /> Tickets are held for 10 minutes while you pay. Mobile money approvals can take up to a minute.
      </p>
    </div>
  );
}
