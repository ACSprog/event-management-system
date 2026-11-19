"use client";

import { useState } from "react";
import { Banknote, CheckCircle2, CreditCard, Minus, ShoppingBag, Smartphone, Trash2, X, XCircle } from "lucide-react";
import { cx } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";
import { left, payShort, type MenuItem, type PayMethod, type Station } from "@/lib/event-day";

/**
 * Scanner stations other than the gate (rules in src/lib/event-day.ts):
 * - allowanceSamples: results at a meal or drinks station. The same ticket QR
 *   is checked per allowance, so a ticket that entered at the gate can still
 *   collect its dinner once.
 * - OrderStation: scan an order QR, hand over the items, record how the buyer
 *   paid (cash, card receipt number, mobile money reference). Quick sale for
 *   walk-up buyers. Running totals show what this attendant must hand in.
 * - HeadcountStation: usher counter for people without a smartphone.
 */

export type AllowanceResult = { kind: "valid" | "used" | "gate" | "invalid" | "cancelled"; name?: string; ticket?: string; detail: string; number?: string };

export function allowanceSamples(s: Station): AllowanceResult[] {
  const setup = api.eventDay.setup(s.eventId ?? "e1");
  const label = setup.allowances?.find((a) => a.key === s.allowance)?.label ?? s.label;
  // Funeral meal serving: meal passes from the check-in screen, counted per person.
  if (s.eventId === "e32") return [
    { kind: "valid", name: "Ruth Chanda", ticket: "Meal pass · 3 people", number: "MEAL-CM-0412", detail: "Meal 1 of 3. Serve now." },
    { kind: "valid", name: "Moses Kabwe", ticket: "Meal pass · 1 person", number: "MEAL-MK-0388", detail: "Meal 1 of 1. Serve now." },
    { kind: "used", name: "Grace Tembo", ticket: "Meal pass · 2 people", number: "MEAL-GT-0201", detail: "Both meals already collected at 14:22." },
    { kind: "gate", name: "Peter Chileshe", ticket: "Not checked in", number: "—", detail: "This phone hasn't checked in yet. Ask them to scan the check-in code first, or count them as served without a phone." },
  ];
  return [
    { kind: "valid", name: "Grace Tembo", ticket: "VIP", number: "TKT-002210-A", detail: `${label}: 1 of 1 left. Serve now.` },
    { kind: "valid", name: "Bwalya Kunda", ticket: "VVIP table of 8", number: "TKT-000031-T", detail: `${label}: 3 of 8 left after this one.` },
    { kind: "used", name: "Peter Chileshe", ticket: "VIP", number: "TKT-002118-A", detail: `${label} already collected at 19:42 (Ruth M., ${s.label}).` },
    { kind: "gate", name: "Natasha Phiri", ticket: "Standard", number: "TKT-000512-A", detail: `No ${label.toLowerCase()} on a Standard ticket.${s.allowance && setup.sellExtras?.[s.allowance] ? "" : " They can order and pay from the menu."}` },
    { kind: "gate", name: "Victor Siame", ticket: "VIP", number: "TKT-002301-A", detail: "This ticket hasn't entered at the gate yet. Send them to the VIP gate first." },
    { kind: "invalid", detail: "Signature check failed. This QR code was not issued by Eventra." },
  ];
}

const payIcon = { CASH: Banknote, CARD: CreditCard, MOBILE_MONEY: Smartphone };
type Shown = { number: string; buyer: string; lines: { item: MenuItem; qty: number; given?: number }[]; method: PayMethod; already?: string; table?: string; paid?: PayMethod };

export function OrderStation({ station, onClose }: { station: Station; onClose: () => void }) {
  const menu = api.eventDay.menu("e1").filter((m) => m.point === station.label || (station.label === "Food court A" && m.point === "Bar"));
  const byId = (id: string) => api.eventDay.menu("e1").find((m) => m.id === id)!;
  const samples: Shown[] = [
    { number: "A-0229", buyer: "Grace T.", lines: [{ item: byId("f1"), qty: 1 }, { item: byId("d1"), qty: 1 }], method: "CARD", table: "VIP table 6" },
    { number: "A-0230", buyer: "Joseph Z.", lines: [{ item: byId("f2"), qty: 1 }], method: "CASH" },
    { number: "A-0231", buyer: "Natasha P.", lines: [{ item: byId("f1"), qty: 2 }, { item: byId("d2"), qty: 2 }], method: "MOBILE_MONEY" },
    { number: "A-0226", buyer: "Mapalo N.", lines: [{ item: byId("f1"), qty: 1, given: 1 }, { item: byId("d3"), qty: 2, given: 1 }], method: "MOBILE_MONEY", paid: "MOBILE_MONEY" },
    { number: "A-0228", buyer: "Brian M.", lines: [{ item: byId("f2"), qty: 2 }], method: "CASH", already: "Already collected and paid (cash) at 21:06 by Joseph B." },
  ];
  // How many of each line to hand over now (orders can be collected in parts).
  const [giveNow, setGiveNow] = useState<number[]>([]);
  const [i, setI] = useState(0);
  const [shown, setShown] = useState<Shown | null>(null);
  const [paid, setPaid] = useState<PayMethod>("CASH");
  const [ref, setRef] = useState("");
  const [err, setErr] = useState("");
  const [totals, setTotals] = useState({ orders: 1_402, CASH: 98_400, CARD: 61_300, MOBILE_MONEY: 50_420 });
  const [flash, setFlash] = useState("");
  const [quick, setQuick] = useState(false);
  const [cart, setCart] = useState<Record<string, number>>({});
  const [writeOff, setWriteOff] = useState(false);
  const total = (lines: { item: MenuItem; qty: number }[]) => lines.reduce((a, l) => a + l.item.price * l.qty, 0);

  const scan = () => { const s = samples[i % samples.length]; setI(i + 1); setShown(s); setPaid(s.method); setRef(""); setErr(""); setGiveNow(s.lines.map((l) => l.qty - (l.given ?? 0))); };
  const confirm = (lines: { item: MenuItem; qty: number }[], number: string) => {
    if (paid !== "CASH" && ref.trim().length < 4) return setErr(paid === "CARD" ? "Enter the receipt number from the card machine." : "Enter the mobile money transaction reference.");
    const amt = total(lines);
    setTotals((t) => ({ ...t, orders: t.orders + 1, [paid]: t[paid] + amt }));
    setShown(null); setQuick(false); setCart({}); setErr("");
    setFlash(`${number}: collected, ${kwacha(amt)} ${payShort[paid].toLowerCase()}`); setTimeout(() => setFlash(""), 3000);
  };
  const handOver = (o: Shown) => {
    if (!o.paid && paid !== "CASH" && ref.trim().length < 4) return setErr(paid === "CARD" ? "Enter the receipt number from the card machine." : "Enter the mobile money transaction reference.");
    const amt = total(o.lines);
    if (!o.paid) setTotals((t) => ({ ...t, orders: t.orders + 1, [paid]: t[paid] + amt }));
    const left = o.lines.reduce((a, l, n) => a + l.qty - (l.given ?? 0) - (giveNow[n] ?? 0), 0);
    setShown(null); setErr("");
    setFlash(left ? `${o.number}: part collected, ${left} item${left > 1 ? "s" : ""} still to give${o.paid ? "" : `. Paid ${kwacha(amt)} ${payShort[paid].toLowerCase()}`}` : `${o.number}: collected${o.paid ? "" : `, ${kwacha(amt)} ${payShort[paid].toLowerCase()}`}`);
    setTimeout(() => setFlash(""), 3500);
  };
  const quickLines = Object.entries(cart).filter(([, q]) => q > 0).map(([id, qty]) => ({ item: byId(id), qty }));

  // A render helper, not a component, so the reference input keeps focus while typing.
  const payChoice = () => (
    <div className="space-y-2">
      <div className="grid grid-cols-3 gap-2">
        {(Object.keys(payIcon) as PayMethod[]).map((k) => { const I = payIcon[k]; return <button key={k} onClick={() => { setPaid(k); setErr(""); }} aria-pressed={paid === k} className={cx("flex flex-col items-center gap-1 rounded-xl border-2 py-3 text-xs font-semibold", paid === k ? "border-marigold bg-marigold/10" : "border-white/15")}><I size={20} />{payShort[k]}</button>; })}
      </div>
      {paid !== "CASH" && <input value={ref} onChange={(e) => setRef(e.target.value)} placeholder={paid === "CARD" ? "Card machine receipt number" : "Mobile money reference"} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-mono focus:border-marigold focus:outline-none" />}
      {err && <p className="text-sm text-[#f0576b]">{err}</p>}
    </div>
  );

  return (
    <div className="relative flex min-h-[calc(100vh-37px)] flex-col bg-[#0f1522] text-white">
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <div><p className="font-semibold">{station.label}, Lusaka Summer Jam</p><p className="text-white/50">Joseph B. · orders and walk-up sales</p></div>
        <button onClick={onClose} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">Change station</button>
      </div>
      <div className="mx-auto w-full max-w-md flex-1 px-4">
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="rounded-2xl bg-white/5 py-3"><p className="font-display text-2xl font-bold tabular-nums">{kwacha(totals.CASH)}</p><p className="text-xs text-white/50">Cash to hand in</p></div>
          <div className="rounded-2xl bg-white/5 py-3"><p className="font-display text-2xl font-bold tabular-nums">{totals.orders.toLocaleString()}</p><p className="text-xs text-white/50">Orders served</p></div>
          <div className="rounded-2xl bg-white/5 py-2"><p className="font-semibold tabular-nums">{kwacha(totals.CARD)}</p><p className="text-xs text-white/50">Card</p></div>
          <div className="rounded-2xl bg-white/5 py-2"><p className="font-semibold tabular-nums">{kwacha(totals.MOBILE_MONEY)}</p><p className="text-xs text-white/50">Mobile money</p></div>
        </div>
        <button onClick={scan} className="mt-5 w-full rounded-2xl bg-marigold py-4 text-lg font-bold text-[#2a1a00]">Scan an order code</button>
        <p className="mt-2 text-center text-xs text-white/40">Test button: cycles through card, cash, mobile money and an already-collected order</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button onClick={() => { setQuick(true); setPaid("CASH"); setRef(""); }} className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-3 font-semibold"><ShoppingBag size={18} /> Quick sale</button>
          <button onClick={() => setWriteOff(true)} className="flex items-center justify-center gap-2 rounded-2xl bg-white/10 py-3 font-semibold"><Trash2 size={18} /> Damaged or given</button>
        </div>
        {flash && <p className="mt-4 rounded-xl bg-[#1F9D55]/20 px-4 py-2 text-center text-sm text-[#5fd394]" role="status">{flash}</p>}
      </div>

      {shown && (
        <div className="absolute inset-0 z-10 flex flex-col overflow-y-auto bg-[#171f2f] p-5">
          <button onClick={() => setShown(null)} aria-label="Close" className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-white/10"><X size={18} /></button>
          {shown.already ? (
            <div className="m-auto text-center"><XCircle size={80} className="mx-auto text-[#f0576b]" /><p className="font-display mt-3 text-3xl font-bold">Already collected</p><p className="mt-2 text-lg text-white/80">{shown.number}</p><p className="mt-2 text-white/70">{shown.already}</p></div>
          ) : (
            <div className="mx-auto w-full max-w-md">
              <p className="font-display text-4xl font-bold">{shown.number}</p>
              <p className="text-white/60">{shown.buyer}{shown.table ? ` · deliver to ${shown.table}` : ""}</p>
              <ul className="mt-4 divide-y divide-white/10 rounded-xl bg-white/5 px-4">
                {shown.lines.map((l, n) => {
                  const rest = l.qty - (l.given ?? 0);
                  return (
                    <li key={l.item.id} className="flex items-center justify-between gap-2 py-3">
                      <span className="min-w-0"><span className="block text-lg">{l.qty} × {l.item.name}</span>{(l.given ?? 0) > 0 && <span className="text-xs text-white/50">{l.given} already given</span>}</span>
                      {rest > 0 ? (
                        <span className="flex shrink-0 items-center gap-2">
                          <button aria-label="Give one fewer now" onClick={() => setGiveNow(giveNow.map((g, k) => (k === n ? Math.max(0, g - 1) : g)))} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10"><Minus size={14} /></button>
                          <span className="w-12 text-center text-sm"><b className="text-lg">{giveNow[n] ?? 0}</b>/{rest}</span>
                          <button aria-label="Give one more now" onClick={() => setGiveNow(giveNow.map((g, k) => (k === n ? Math.min(rest, g + 1) : g)))} className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10">+</button>
                        </span>
                      ) : <span className="text-sm text-[#5fd394]">Given</span>}
                    </li>
                  );
                })}
              </ul>
              <p className="mt-1 text-xs text-white/50">Out of something? Give what you have now; the rest stays on the order code.</p>
              {shown.paid ? (
                <p className="mt-4 rounded-xl bg-[#1F9D55]/20 py-2 text-center font-semibold text-[#5fd394]">Already paid · {payShort[shown.paid]}</p>
              ) : (<>
                <p className="mt-4 text-center text-2xl font-bold">Collect {kwacha(total(shown.lines))}</p>
                <p className="mb-3 text-center text-sm text-white/60">Buyer said: {payShort[shown.method].toLowerCase()}. Change it if they pay differently.</p>
                {payChoice()}
              </>)}
              <button onClick={() => handOver(shown)} disabled={giveNow.every((g) => !g)} className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl bg-[#1F9D55] py-4 text-lg font-bold disabled:opacity-40"><CheckCircle2 size={20} /> {shown.paid ? "Hand over" : "Handed over and paid"}</button>
            </div>
          )}
        </div>
      )}

      {quick && (
        <div className="absolute inset-0 z-10 flex flex-col overflow-y-auto bg-[#171f2f] p-5">
          <div className="flex items-center justify-between"><p className="text-lg font-semibold">Quick sale</p><button onClick={() => setQuick(false)} aria-label="Close" className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10"><X size={18} /></button></div>
          <p className="text-sm text-white/60">For buyers without the app. Counts against stock and your totals like any order.</p>
          <ul className="mt-3 grid grid-cols-2 gap-2">
            {menu.map((m) => (
              <li key={m.id}>
                <button onClick={() => setCart({ ...cart, [m.id]: (cart[m.id] ?? 0) + 1 })} disabled={left(m) <= 0} className="relative w-full rounded-xl border border-white/15 p-3 text-left disabled:opacity-40">
                  <span className="block font-semibold">{m.name}</span><span className="text-sm text-white/60">{kwacha(m.price)} · {left(m)} left</span>
                  {cart[m.id] ? <span className="absolute right-2 top-2 flex h-6 min-w-6 items-center justify-center rounded-full bg-marigold px-1.5 text-xs font-bold text-[#2a1a00]">{cart[m.id]}</span> : null}
                </button>
              </li>
            ))}
          </ul>
          {quickLines.length > 0 && (
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between"><p className="text-xl font-bold">Total {kwacha(total(quickLines))}</p><button onClick={() => setCart({})} className="flex items-center gap-1 text-sm text-white/60"><Minus size={14} /> Clear</button></div>
              {payChoice()}
              <button onClick={() => confirm(quickLines, `M-${String(89 + totals.orders % 100).padStart(4, "0")}`)} className="w-full rounded-2xl bg-[#1F9D55] py-4 text-lg font-bold">Paid: record sale</button>
            </div>
          )}
        </div>
      )}

      {writeOff && (
        <div className="absolute inset-x-0 bottom-0 z-10 rounded-t-3xl bg-[#171f2f] p-5 shadow-2xl">
          <p className="font-semibold">Record damaged, spoiled or given away</p>
          <div className="mt-3 grid grid-cols-2 gap-2">{menu.slice(0, 4).map((m) => <button key={m.id} className="rounded-xl border border-white/15 p-3 text-left text-sm">{m.name}</button>)}</div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-sm">{["Damaged", "Spoiled", "Given away"].map((r) => <button key={r} className="rounded-xl border border-white/15 py-2">{r}</button>)}</div>
          <button onClick={() => { setWriteOff(false); setFlash("Recorded. It won't count as missing stock."); setTimeout(() => setFlash(""), 3000); }} className="mt-4 w-full rounded-xl bg-marigold py-3 font-bold text-[#2a1a00]">Save</button>
        </div>
      )}
    </div>
  );
}

export function HeadcountStation({ onClose }: { onClose: () => void }) {
  const [n, setN] = useState(214);
  const [mine, setMine] = useState(0);
  const add = (d: number) => { setN(Math.max(0, n + d)); setMine(Math.max(0, mine + d)); try { navigator.vibrate?.(30); } catch {} };
  return (
    <div className="flex min-h-[calc(100vh-37px)] flex-col bg-[#0f1522] px-4 py-3 text-white">
      <div className="flex items-center justify-between text-sm">
        <div><p className="font-semibold">Usher count, Grace Chapel Midweek Service</p><p className="text-white/50">People without a smartphone</p></div>
        <button onClick={onClose} className="rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold">Change station</button>
      </div>
      <div className="m-auto w-full max-w-sm text-center">
        <p className="font-display text-7xl font-bold tabular-nums">{n}</p>
        <p className="text-white/60">counted by all ushers · {mine} by you</p>
        <p className="mt-1 text-sm text-white/40">+ 588 checked in by phone = {(588 + n).toLocaleString()} here</p>
        <div className="mt-8 grid grid-cols-3 gap-3">
          <button onClick={() => add(-1)} aria-label="Remove one" className="flex h-20 items-center justify-center rounded-2xl bg-white/10 text-2xl"><Minus /></button>
          <button onClick={() => add(1)} className="h-20 rounded-2xl bg-marigold text-3xl font-bold text-[#2a1a00]">+1</button>
          <button onClick={() => add(5)} className="h-20 rounded-2xl bg-marigold text-3xl font-bold text-[#2a1a00]">+5</button>
        </div>
      </div>
    </div>
  );
}
