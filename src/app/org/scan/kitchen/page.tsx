"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, ChefHat, Clock } from "lucide-react";
import { cx } from "@/components/ui";
import { MenuPicture } from "@/components/menu-picture";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";
import { orderTotal, payShort, type Order } from "@/lib/event-day";

const points = ["Food court A", "Food court B", "Bar", "Merchandise stand"];
const columns: { status: Order["status"]; label: string; next?: Order["status"]; action?: string }[] = [
  { status: "Waiting", label: "New", next: "Preparing", action: "Start" },
  { status: "Preparing", label: "Preparing", next: "Ready", action: "Ready: notify buyer" },
  { status: "Ready", label: "Ready to collect" },
];

/** Showcase orders arriving at the kitchen, on top of the event's sample orders. */
const extra: Order[] = [
  { number: "A-0232", at: "21:15", buyer: "Kondwani P.", lines: [{ item: "f2", qty: 3 }], method: "CASH", status: "Waiting", point: "Food court A" },
  { number: "A-0233", at: "21:16", buyer: "Faith M.", lines: [{ item: "f1", qty: 1 }, { item: "f2", qty: 1 }], method: "CARD", status: "Waiting", point: "Food court A", table: "VIP table 2" },
  { number: "A-0224", at: "21:02", buyer: "Agness M.", lines: [{ item: "f1", qty: 2 }], method: "MOBILE_MONEY", status: "Preparing", point: "Food court A" },
  { number: "B-0091", at: "21:11", buyer: "Lubinda S.", lines: [{ item: "f3", qty: 2 }], method: "CASH", status: "Preparing", point: "Food court B" },
  { number: "C-0412", at: "21:13", buyer: "Chipo D.", lines: [{ item: "d3", qty: 4 }, { item: "d1", qty: 2 }], method: "MOBILE_MONEY", status: "Waiting", point: "Bar" },
];

/**
 * Kitchen and bar screen: a tablet or phone at each collection point shows
 * orders as they arrive. Staff tap Start, then Ready, which notifies the buyer
 * ("Your order is ready at Food court A"). Handing over and payment happen on
 * the scanner's order station. Full screen, like the gate scanner.
 * Phones show one column at a time; tablets and larger show all three.
 */
export default function Kitchen() {
  const menu = api.eventDay.menu("e1");
  const [point, setPoint] = useState(points[0]);
  const [orders, setOrders] = useState<Order[]>([...extra, ...api.eventDay.orders("e1").filter((o) => ["Waiting", "Preparing", "Ready"].includes(o.status))]);
  const [col, setCol] = useState(0);
  const [flash, setFlash] = useState("");
  const here = orders.filter((o) => o.point === point);
  const move = (o: Order, to: Order["status"]) => {
    setOrders(orders.map((x) => (x.number === o.number ? { ...x, status: to } : x)));
    if (to === "Ready") { setFlash(`${o.buyer} notified: ${o.number} is ready at ${point}`); setTimeout(() => setFlash(""), 3000); }
  };

  return (
    <div className="flex min-h-[calc(100vh-37px)] flex-col bg-[#0f1522] text-white">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
        <div className="flex items-center gap-2"><ChefHat className="text-marigold" /><div><p className="font-semibold">Kitchen and bar screen</p><p className="text-sm text-white/50">Lusaka Summer Jam · <Link href="/org/scan/" className="underline">Scanner</Link></p></div></div>
        <select value={point} onChange={(e) => setPoint(e.target.value)} aria-label="Collection point" className="h-10 rounded-lg border border-white/15 bg-white/5 px-3 text-sm">
          {points.map((p) => <option key={p} className="text-ink">{p}</option>)}
        </select>
      </div>
      {flash && <p className="mx-4 mb-2 rounded-xl bg-[#1F9D55]/20 px-4 py-2 text-sm text-[#5fd394]" role="status"><Bell size={14} className="mr-1 inline" />{flash}</p>}

      {/* Phones: one column at a time */}
      <div className="grid grid-cols-3 gap-1 px-4 md:hidden">
        {columns.map((c, i) => <button key={c.status} onClick={() => setCol(i)} aria-pressed={col === i} className={cx("rounded-lg py-2 text-sm font-semibold", col === i ? "bg-marigold text-[#2a1a00]" : "bg-white/5")}>{c.label} ({here.filter((o) => o.status === c.status).length})</button>)}
      </div>

      <div className="grid flex-1 gap-3 p-4 md:grid-cols-3">
        {columns.map((c, i) => (
          <section key={c.status} className={cx("rounded-2xl bg-white/5 p-3", i !== col && "hidden md:block")}>
            <h2 className="mb-3 hidden text-sm font-semibold text-white/70 md:block">{c.label} ({here.filter((o) => o.status === c.status).length})</h2>
            <ul className="space-y-3">
              {here.filter((o) => o.status === c.status).map((o) => (
                <li key={o.number} className="rounded-xl bg-[#171f2f] p-3">
                  <div className="flex items-center justify-between"><p className="font-display text-2xl font-bold">{o.number}</p><p className="flex items-center gap-1 text-xs text-white/50"><Clock size={12} />{o.at}</p></div>
                  <p className="text-sm text-white/60">{o.buyer}{o.table ? ` · deliver to ${o.table}` : ""}</p>
                  <ul className="mt-2 space-y-1.5">
                    {o.lines.map((l) => { const m = menu.find((x) => x.id === l.item)!; return <li key={l.item} className="flex items-center gap-2 text-lg"><MenuPicture item={m} className="h-8 w-8" /><span className="font-bold">{l.qty}×</span> {m.name}</li>; })}
                  </ul>
                  <p className="mt-2 text-xs text-white/50">{kwacha(orderTotal(o, menu))} · pays {payShort[o.method].toLowerCase()} on collection</p>
                  {c.next && <button onClick={() => move(o, c.next!)} className="mt-3 w-full rounded-xl bg-marigold py-3 font-bold text-[#2a1a00]">{c.action}</button>}
                  {!c.next && <p className="mt-3 rounded-xl bg-white/5 py-2 text-center text-sm text-white/70">Waiting for the buyer. Hand over on the scanner.</p>}
                </li>
              ))}
              {here.filter((o) => o.status === c.status).length === 0 && <li className="py-6 text-center text-sm text-white/40">Nothing here</li>}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
