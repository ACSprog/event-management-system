"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Timer } from "lucide-react";
import { Button, cx } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

const rows = "ABCDEFGHIJKL".split("");
const blocks = [{ name: "Left", seats: 8 }, { name: "Centre", seats: 14 }, { name: "Right", seats: 8 }];

export function SeatPicker({ slug }: { slug: string }) {
  const router = useRouter();
  const e = api.events.bySlug(slug)!;
  const [want, setWant] = useState<Record<string, number>>({});
  const [picked, setPicked] = useState<string[]>([]);
  const [secs, setSecs] = useState(600);
  const seated = e.tickets.filter((t) => !/booth|pack|table|virtual|instal|pay per/i.test(t.name));
  const standard = seated[0] ?? e.tickets[0];
  const premium = [...seated].sort((a, b) => b.price - a.price)[0] ?? standard;
  const tiered = premium.id !== standard.id;
  const total = Object.values(want).reduce((a, b) => a + b, 0) || 2;

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const w: Record<string, number> = {};
    p.forEach((v, k) => (w[k] = Number(v)));
    setWant(w);
  }, []);
  useEffect(() => {
    if (!picked.length) return;
    const t = setInterval(() => setSecs((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, [picked.length]);

  const taken = useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r, ri) => blocks.forEach((b, bi) => { for (let i = 1; i <= b.seats; i++) if ((ri * 7 + bi * 13 + i * 5) % 9 < (ri < 4 ? 6 : 3)) s.add(`${b.name}-${r}${i}`); }));
    return s;
  }, []);

  const toggle = (id: string) => {
    if (picked.includes(id)) setPicked(picked.filter((x) => x !== id));
    else if (picked.length < total) setPicked([...picked, id]);
  };
  const priceOf = (id: string) => (tiered && /-[A-C]\d/.test(id) ? premium.price : standard.price);
  const sum = picked.reduce((a, id) => a + priceOf(id), 0);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-ink-3">{e.title}</p>
          <h1 className="text-3xl font-semibold">Choose your seats</h1>
          <p className="text-sm text-ink-3">Pick {total} seat{total > 1 ? "s" : ""}.{tiered && ` Rows A to C are ${premium.name} (${kwacha(premium.price)}).`}</p>
        </div>
        {picked.length > 0 && (
          <p className={cx("flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold", secs < 120 ? "bg-hibiscus-soft text-hibiscus" : "bg-marigold-soft text-[#7a4b00] dark:text-marigold")} role="timer">
            <Timer size={16} /> Seats held for {Math.floor(secs / 60)}:{String(secs % 60).padStart(2, "0")}
          </p>
        )}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_300px]">
        <div className="overflow-x-auto rounded-2xl border border-line bg-surface p-6">
          <div className="mx-auto mb-8 w-2/3 rounded-b-[40px] bg-ink py-2 text-center text-sm font-semibold text-canvas">{e.category === "Sports" ? "Pitch" : "Stage"}</div>
          <div className="flex min-w-[720px] justify-center gap-6">
            {blocks.map((b) => (
              <div key={b.name} className="space-y-1.5">
                <p className="text-center text-xs font-semibold text-ink-3">{b.name}</p>
                {rows.map((r) => (
                  <div key={r} className="flex items-center gap-1">
                    {b.name === "Left" && <span className="w-4 text-[11px] text-ink-3">{r}</span>}
                    {Array.from({ length: b.seats }, (_, i) => {
                      const id = `${b.name}-${r}${i + 1}`;
                      const isTaken = taken.has(id);
                      const sel = picked.includes(id);
                      const prem = tiered && "ABC".includes(r);
                      return (
                        <button
                          key={id}
                          disabled={isTaken}
                          onClick={() => toggle(id)}
                          aria-label={`${b.name} row ${r} seat ${i + 1}${isTaken ? ", taken" : sel ? ", selected" : ""}`}
                          aria-pressed={sel}
                          className={cx(
                            "h-5 w-5 rounded-t-md rounded-b-sm text-[9px] font-bold",
                            isTaken ? "cursor-not-allowed bg-line" : sel ? "bg-kafue text-white" : prem ? "border-2 border-marigold bg-marigold-soft hover:bg-marigold" : "border-2 border-kafue/40 bg-surface hover:bg-kafue-soft",
                          )}
                        >
                          {sel ? i + 1 : ""}
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            ))}
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-5 text-xs text-ink-3">
            <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded border-2 border-kafue/40" /> {standard.name}</span>
            {tiered && <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded border-2 border-marigold bg-marigold-soft" /> {premium.name}</span>}
            <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded bg-kafue" /> Your seats</span>
            <span className="flex items-center gap-1.5"><span className="h-4 w-4 rounded bg-line" /> Taken</span>
          </div>
        </div>

        <aside className="h-fit rounded-2xl border border-line bg-surface p-5">
          <h2 className="font-semibold">Your seats</h2>
          {picked.length === 0 ? (
            <p className="mt-2 text-sm text-ink-3">Tap a seat on the map. They are held for 10 minutes once you choose.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {picked.map((id) => (
                <li key={id} className="flex justify-between">
                  <span>{id.replace("-", ", row ").replace(/([A-L])(\d+)$/, "$1, seat $2")}</span>
                  <span className="font-semibold">{kwacha(priceOf(id))}</span>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-4 flex justify-between border-t border-line pt-4 font-semibold"><span>Total</span><span>{kwacha(sum)}</span></div>
          <Button className="mt-4 w-full" size="lg" variant="ticket" disabled={picked.length !== total} onClick={() => router.push(`/checkout/${slug}/?seats=${encodeURIComponent(picked.join(","))}&amount=${sum}`)}>
            {picked.length === total ? "Continue to payment" : `Choose ${total - picked.length} more`}
          </Button>
        </aside>
      </div>
    </div>
  );
}
