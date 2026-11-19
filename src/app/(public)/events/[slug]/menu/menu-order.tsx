"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Banknote, CreditCard, Minus, Plus, ShoppingBag, Smartphone } from "lucide-react";
import { Badge, Button, Card, cx, Field, Input } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";
import { MenuPicture } from "@/components/menu-picture";
import { left, MAX_OPEN_UNPAID, payLabel, payShort, UNPAID_ORDER_MINUTES, type MenuItem, type PayMethod } from "@/lib/event-day";

type Placed = { number: string; lines: { item: MenuItem; qty: number }[]; method: PayMethod; total: number; table: string; step: number };
const steps = ["Sent", "Being prepared", "Ready to collect", "Collected"];
const payIcon = { CASH: Banknote, CARD: CreditCard, MOBILE_MONEY: Smartphone };

/**
 * Attendee menu for food, drinks and merchandise sold by the organiser.
 *
 * EMS does not take this money: the buyer chooses how they will pay the
 * attendant (cash, card on the organiser's machine, or mobile money to the
 * organiser's number) and gets an order QR code showing the amount to pay. The
 * attendant scans it, hands over the order and records the payment. Unpaid
 * orders are cancelled after UNPAID_ORDER_MINUTES and one phone can have at most
 * MAX_OPEN_UNPAID open. Items at zero stock show as sold out. Orders also appear
 * in the attendee's account (Orders and refunds › Food and merchandise).
 */
export function MenuOrder({ slug }: { slug: string }) {
  const e = api.events.bySlug(slug)!;
  const menu = api.eventDay.menu(e.id);
  const kinds = Array.from(new Set(menu.map((m) => m.kind)));
  const [kind, setKind] = useState(kinds[0]);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [checkout, setCheckout] = useState(false);
  const [method, setMethod] = useState<PayMethod>("CASH");
  const [table, setTable] = useState("");
  const [placed, setPlaced] = useState<Placed[]>([]);
  const [showing, setShowing] = useState<string | null>(null);

  const lines = Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => ({ item: menu.find((m) => m.id === id)!, qty }));
  const total = lines.reduce((a, l) => a + l.item.price * l.qty, 0);
  const count = lines.reduce((a, l) => a + l.qty, 0);
  const add = (id: string, d: number) => setCart((c) => ({ ...c, [id]: Math.max(0, (c[id] ?? 0) + d) }));
  const open = placed.filter((p) => p.step < 3).length;
  const cur = placed.find((p) => p.number === showing);

  // Showcase: move the newest order along so the status updates are visible.
  useEffect(() => {
    if (!cur || cur.step >= 2) return;
    const t = setTimeout(() => setPlaced((ps) => ps.map((p) => (p.number === cur.number ? { ...p, step: p.step + 1 } : p))), 4000);
    return () => clearTimeout(t);
  }, [cur]);

  const place = () => {
    const number = `${lines[0].item.point === "Merchandise stand" ? "M" : "A"}-${String(232 + placed.length).padStart(4, "0")}`;
    setPlaced([{ number, lines, method, total, table, step: 0 }, ...placed]);
    setShowing(number); setCart({}); setCheckout(false); setTable("");
  };

  if (cur)
    return (
      <div className="mx-auto max-w-md px-4 py-6 sm:py-10">
        <button onClick={() => setShowing(null)} className="text-sm text-ink-3 hover:text-kafue">‹ Back to the menu</button>
        <Card className="mt-3 text-center">
          <p className="text-sm text-ink-3">{e.title}</p>
          <p className="font-display text-4xl font-bold tracking-wide">{cur.number}</p>
          <QRCodeSVG value={`EVT1.ORDER.${e.id}.${cur.number}`} size={200} className="mx-auto mt-3" />
          <p className={cx("mt-3 inline-block rounded-full px-4 py-1.5 text-sm font-semibold", cur.step === 3 ? "bg-leaf-soft text-leaf" : "bg-marigold-soft text-[#8a5a00]")}>
            {cur.step === 3 ? `Paid · ${payShort[cur.method]}` : `To pay: ${kwacha(cur.total)} · ${payShort[cur.method]}`}
          </p>
          <ol className="mt-5 grid grid-cols-4 gap-1 text-[11px]">
            {steps.map((s, i) => <li key={s}><div className={cx("h-1.5 rounded-full", i <= cur.step ? "bg-kafue" : "bg-line")} /><p className={cx("mt-1", i === cur.step ? "font-semibold text-ink" : "text-ink-3")}>{s}</p></li>)}
          </ol>
          <ul className="mt-5 divide-y divide-line text-left text-sm">
            {cur.lines.map((l) => <li key={l.item.id} className="flex items-center justify-between gap-2 py-2"><span className="flex items-center gap-2"><MenuPicture item={l.item} className="h-8 w-8" />{l.qty} × {l.item.name}</span><span className="tabular-nums">{kwacha(l.qty * l.item.price)}</span></li>)}
          </ul>
          <p className="mt-3 text-sm text-ink-2">{cur.step === 2 ? `Ready at ${cur.lines[0].item.point}${cur.table ? `, or an usher brings it to ${cur.table}` : ""}.` : `Collect at ${cur.lines[0].item.point}. We'll notify you when it's ready.`} Show this code and pay the attendant.</p>
          <p className="mt-2 text-xs text-ink-3">Unpaid orders are cancelled after {UNPAID_ORDER_MINUTES} minutes. Payment goes to the organiser, not EMS; ask them about refunds.</p>
        </Card>
      </div>
    );

  return (
    <div className="mx-auto max-w-3xl px-4 py-6 pb-28 sm:px-6 sm:py-8">
      <p className="text-sm text-ink-3">{e.title}</p>
      <h1 className="text-[24px] font-semibold leading-tight sm:text-[28px]">Food, drinks and merchandise</h1>
      <p className="mt-1 text-sm text-ink-3">Order here, then pay the attendant with cash, card or mobile money when you collect.</p>

      {placed.length > 0 && (
        <Card className="mt-4">
          <p className="mb-2 text-sm font-semibold">Your orders</p>
          <ul className="divide-y divide-line text-sm">
            {placed.map((p) => <li key={p.number}><button onClick={() => setShowing(p.number)} className="flex w-full items-center justify-between py-2 text-left"><span className="font-mono font-semibold">{p.number}</span><span className="text-ink-3">{steps[p.step]} · {kwacha(p.total)}</span></button></li>)}
          </ul>
        </Card>
      )}

      <div className="mt-5 flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {kinds.map((k) => <button key={k} onClick={() => setKind(k)} aria-pressed={kind === k} className={cx("shrink-0 rounded-full border px-4 py-2 text-sm", kind === k ? "border-ink bg-ink font-semibold text-canvas" : "border-line bg-surface")}>{k}</button>)}
      </div>

      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {menu.filter((m) => m.kind === kind).map((m) => {
          const out = left(m) <= 0 || m.paused;
          const q = cart[m.id] ?? 0;
          return (
            <li key={m.id} className={cx("flex items-center gap-3 rounded-xl border border-line bg-surface p-3", out && "opacity-60")}>
              <MenuPicture item={m} className="h-16 w-16" />
              <div className="min-w-0 flex-1">
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-ink-3">{kwacha(m.price)} · {m.point}</p>
                {m.note && <p className="text-xs text-ink-3">{m.note}</p>}
                {!out && left(m) < 30 && <p className="text-xs font-semibold text-hibiscus">Only {left(m)} left</p>}
              </div>
              {out ? <Badge tone="grey">Sold out</Badge> : q ? (
                <div className="flex shrink-0 items-center gap-2">
                  <button aria-label={`One fewer ${m.name}`} onClick={() => add(m.id, -1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-line"><Minus size={14} /></button>
                  <span className="w-5 text-center font-semibold tabular-nums">{q}</span>
                  <button aria-label={`One more ${m.name}`} onClick={() => add(m.id, 1)} className="flex h-9 w-9 items-center justify-center rounded-full border border-line"><Plus size={14} /></button>
                </div>
              ) : <Button size="sm" variant="secondary" onClick={() => add(m.id, 1)}>Add</Button>}
            </li>
          );
        })}
      </ul>

      {count > 0 && !checkout && (
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 px-4 md:bottom-4">
          <button onClick={() => setCheckout(true)} className="mx-auto flex w-full max-w-3xl items-center justify-between rounded-2xl bg-ink px-5 py-4 text-canvas shadow-xl">
            <span className="flex items-center gap-2 font-semibold"><ShoppingBag size={18} /> {count} {count === 1 ? "item" : "items"}</span>
            <span className="font-semibold">Review order · {kwacha(total)}</span>
          </button>
        </div>
      )}

      {checkout && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 sm:items-center sm:p-4" onClick={() => setCheckout(false)}>
          <div role="dialog" aria-modal aria-label="Your order" className="flex max-h-[92dvh] w-full max-w-lg flex-col rounded-t-2xl bg-surface pb-[env(safe-area-inset-bottom)] sm:rounded-2xl" onClick={(x) => x.stopPropagation()}>
            <div className="border-b border-line px-5 py-4"><p className="text-lg font-semibold">Your order</p></div>
            <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
              <ul className="divide-y divide-line text-sm">
                {lines.map((l) => <li key={l.item.id} className="flex justify-between py-2"><span>{l.qty} × {l.item.name}</span><span className="tabular-nums">{kwacha(l.qty * l.item.price)}</span></li>)}
                <li className="flex justify-between py-2 font-semibold"><span>Total to pay</span><span className="tabular-nums">{kwacha(total)}</span></li>
              </ul>
              <Field label="How will you pay the attendant?">
                <div className="space-y-2">
                  {(Object.keys(payLabel) as PayMethod[]).map((k) => {
                    const I = payIcon[k];
                    return <button key={k} type="button" onClick={() => setMethod(k)} aria-pressed={method === k} className={cx("flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left text-sm", method === k ? "border-kafue bg-kafue-soft font-semibold" : "border-line")}><I size={18} className="shrink-0" /> {payLabel[k]}</button>;
                  })}
                </div>
              </Field>
              <Field label="Table or seat (optional)" hint="For delivery by an usher where the organiser offers it"><Input value={table} onChange={(x) => setTable(x.target.value)} placeholder="e.g. VIP table 6" className="text-base" /></Field>
              <p className="text-xs text-ink-3">You pay when you collect. Unpaid orders are cancelled after {UNPAID_ORDER_MINUTES} minutes. You can have up to {MAX_OPEN_UNPAID} unpaid orders open.</p>
            </div>
            <div className="flex gap-2 border-t border-line px-5 py-3">
              <Button variant="ghost" onClick={() => setCheckout(false)}>Back</Button>
              <Button className="flex-1" disabled={open >= MAX_OPEN_UNPAID} onClick={place}>{open >= MAX_OPEN_UNPAID ? "Collect your open orders first" : "Place order and get my code"}</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
