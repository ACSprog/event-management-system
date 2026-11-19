"use client";

import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { BellRing, ChefHat, Copy, Download, Expand, HandHeart, ImagePlus, Minus, Pause, Play, Plus, Share2, X } from "lucide-react";
import { Badge, Button, Card, cx, Field, Input, Modal, SectionTitle, Select, Stat, Table, Tabs, Toggle, useToast } from "@/components/ui";
import { MenuPicture } from "@/components/menu-picture";
import { Bars } from "@/components/ui/charts";
import { api, type EventItem } from "@/lib/api";
import { kwacha } from "@/lib/brand";
import { left, orderTotal, payShort, salesTrackingOptions, toGive, UNPAID_ORDER_MINUTES, type Attendant, type MenuItem } from "@/lib/event-day";
import { showCount } from "@/lib/gender";

/**
 * Organiser panels for the event-day tools (rules in src/lib/event-day.ts):
 * AttendancePanel (open entry), AllowancesCard (what tickets include),
 * GivingPanel (link, QR and totals) and SalesPanel (food and merchandise:
 * orders, menu and stock, attendants' cash, end-of-event balance).
 * Every panel stacks to one column on phones.
 */

const origin = "https://event-management-system-test.web.app";

/* Attendance -------------------------------------------------------------- */

export function AttendancePanel({ e }: { e: EventItem }) {
  const toast = useToast();
  const setup = api.eventDay.setup(e.id);
  const a = api.eventDay.attendance(e.id);
  const [usher, setUsher] = useState(a?.usherCount ?? 0);
  const [projector, setProjector] = useState(false);
  const [tick, setTick] = useState(0);
  // The projector code refreshes every few minutes; the showcase uses 20 seconds.
  useEffect(() => { if (!projector) return; const t = setInterval(() => setTick((x) => x + 1), 20_000); return () => clearInterval(t); }, [projector]);
  if (!a) return <Card><p className="text-sm text-ink-3">Attendance appears here once people start checking in.</p></Card>;
  const total = a.checkedInApp + usher;
  const link = `${origin}/events/${e.slug}/checkin/`;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="Here now" value={total.toLocaleString()} hint={`${a.checkedInApp.toLocaleString()} by phone, ${usher.toLocaleString()} counted by ushers`} />
        {setup.rsvp ? <Stat label="Said they're coming" value={a.expected.toLocaleString()} hint={`${a.rsvpReplies} replies, with the people they bring`} /> : <Stat label="Last week" value={(a.previous?.at(-2)?.people ?? 0).toLocaleString()} hint="Same service" />}
        {a.mealsPlanned ? <Stat label="Meals served" value={`${a.mealsServed} / ${a.mealsPlanned}`} hint={`${(a.mealsPlanned - (a.mealsServed ?? 0)).toLocaleString()} meals left`} /> : <Stat label="Check-ins in the last 15 min" value="32" hint="Arrivals are slowing" />}
        <Stat label="Women / men" value={`${Math.round((a.gender.Female / total) * 100)}% / ${Math.round((a.gender.Male / total) * 100)}%`} hint="Of people who gave their gender" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="text-center">
          <SectionTitle title="Check-in code" sub="Put it at the entrance, on tables or on the projector" />
          <QRCodeSVG value={`${link}?k=${tick}`} size={180} className="mx-auto" />
          <p className="mt-2 break-all text-xs text-ink-3">{link}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={() => setProjector(true)}><Expand size={14} /> Projector</Button>
            <Button variant="secondary" size="sm" onClick={() => toast("Printable A4 poster downloaded")}><Download size={14} /> Print</Button>
          </div>
          <p className="mt-3 text-left text-xs text-ink-3">Works only during the event. The projector version changes every few minutes, so photos shared on WhatsApp stop working. Each phone counts once.</p>
        </Card>
        <Card>
          <SectionTitle title="Usher count" sub="Add people without a smartphone. Every usher's phone adds to the same total." />
          <div className="flex flex-wrap items-center gap-3">
            <button aria-label="Remove one" onClick={() => setUsher(Math.max(0, usher - 1))} className="flex h-14 w-14 items-center justify-center rounded-full border border-line"><Minus size={20} /></button>
            <span className="font-display w-24 text-center text-4xl font-semibold tabular-nums">{usher}</span>
            {[1, 5, 10].map((n) => <button key={n} onClick={() => setUsher(usher + n)} className="h-14 min-w-14 rounded-full bg-kafue px-4 text-lg font-bold text-white">+{n}</button>)}
          </div>
          <p className="mt-3 text-xs text-ink-3">Ushers use the same counter in the gate scanner app (station &ldquo;Usher count&rdquo;).</p>
          <div className="mt-5"><Bars data={a.arrivals} x="time" keys={["app", "usher"]} labels={["Checked in by phone", "Counted by ushers"]} stacked /></div>
        </Card>
      </div>

      {setup.reminder && <ReminderCard r={setup.reminder} />}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <SectionTitle title="Who came" sub="Totals only. Groups under 10 show as fewer than 10." />
          <ul className="space-y-2 text-sm">
            {(Object.entries(a.gender) as [string, number][]).map(([g, n]) => <li key={g} className="flex justify-between"><span>{g}</span><span className="font-semibold tabular-nums">{showCount(n)}</span></li>)}
          </ul>
        </Card>
        {a.previous && (
          <Card>
            <SectionTitle title="Compared with earlier services" />
            <Table rows={a.previous} columns={[{ key: "date", label: "Service" }, { key: "people", label: "People", align: "right", render: (r) => r.people.toLocaleString() }, { key: "giving", label: "Giving", align: "right", render: (r) => kwacha(r.giving) }]} />
          </Card>
        )}
      </div>

      {projector && (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-white p-6 text-center text-[#172033]">
          <button onClick={() => setProjector(false)} aria-label="Close" className="absolute right-4 top-4 flex h-12 w-12 items-center justify-center rounded-full bg-black/5"><X /></button>
          <p className="font-display text-3xl font-bold sm:text-5xl">Welcome to {e.title}</p>
          <p className="mt-2 text-lg sm:text-2xl">Scan to check in. Tap &ldquo;I&rsquo;m here&rdquo;.</p>
          <QRCodeSVG value={`${link}?k=${tick}`} size={320} className="mt-6 h-auto w-[min(70vw,60vh)]" />
          <p className="mt-4 text-base">No smartphone? An usher will count you.</p>
          <p className="mt-1 text-sm opacity-60">Code changes every few minutes</p>
        </div>
      )}
    </>
  );
}

/** Day-before reminder for people who tapped "I'm coming". */
function ReminderCard({ r }: { r: { at: string; people: number; sms: number; sent?: boolean } }) {
  const toast = useToast();
  const [on, setOn] = useState(true);
  const [when, setWhen] = useState("The day before, 18:00");
  const [sent, setSent] = useState(!!r.sent);
  return (
    <Card className="mt-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold"><BellRing size={16} className="text-kafue" /> Reminder to people who said they&rsquo;re coming</p>
          <p className="mt-1 text-sm text-ink-2">{sent ? "Sent." : on ? `Scheduled: ${r.at}.` : "Off."} {r.people} people get a notification in the app; {r.sms} without the app get an SMS from your credits.</p>
        </div>
        <Toggle checked={on} onChange={setOn} label="Send reminder" />
      </div>
      {on && !sent && (
        <div className="mt-3 flex flex-wrap items-end gap-2">
          <Field label="When"><Select value={when} onChange={(e) => setWhen(e.target.value)} options={["The day before, 18:00", "The day before, 12:00", "On the day, 06:00"]} /></Field>
          <Button variant="secondary" onClick={() => { setSent(true); toast(`Reminder sent to ${r.people} people (${r.sms} by SMS)`); }}>Send now</Button>
        </div>
      )}
      <p className="mt-2 text-xs text-ink-3">Message: &ldquo;Reminder: the funeral of the late Joseph Mwansa is tomorrow. Church service at 08:00 at Grace Chapel. Scan the check-in code when you arrive.&rdquo;</p>
    </Card>
  );
}

/* What tickets include ------------------------------------------------------ */

export function AllowancesCard({ e }: { e: EventItem }) {
  const setup = api.eventDay.setup(e.id);
  const use = api.eventDay.allowanceUse(e.id);
  const [reentry, setReentry] = useState(!!setup.reentry);
  const [sell, setSell] = useState<Record<string, number>>(setup.sellExtras ?? {});
  if (!setup.allowances?.length) return null;
  return (
    <Card className="mt-6">
      <SectionTitle title="What tickets include" sub="Scanned at their own stations with the same ticket QR code. Each use is final and logged." />
      <div className="grid gap-4 md:grid-cols-2">
        <ul className="space-y-2 text-sm">
          {setup.allowances.map((al) => (
            <li key={al.key} className="rounded-lg border border-line p-3">
              <p className="font-semibold">{al.label}</p>
              <p className="text-ink-3">{[al.window, al.afterEntry && "only after entry at the gate"].filter(Boolean).join(", ") || "Any time during the event"}</p>
              <p className="mt-1 text-ink-2">{Object.entries(setup.includes ?? {}).filter(([, inc]) => inc[al.key]).map(([t, inc]) => `${t} ×${inc[al.key]}`).join(" · ") || "Not on any ticket yet"}</p>
            </li>
          ))}
        </ul>
        <ul className="space-y-3">
          {use.map((u) => (
            <li key={u.key}>
              <div className="flex justify-between text-sm"><span className="font-medium">{u.label}</span><span className="tabular-nums">{u.used.toLocaleString()} of {u.total.toLocaleString()} used</span></div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2"><div className="h-full bg-kafue" style={{ width: `${Math.round((u.used / u.total) * 100)}%` }} /></div>
              <p className="mt-0.5 text-xs text-ink-3">{(u.total - u.used).toLocaleString()} still to collect. Tell the caterer.</p>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-5 space-y-3 border-t border-line pt-4">
        <p className="text-sm font-medium">Gate and station rules</p>
        <Toggle checked={reentry} onChange={setReentry} label="Allow re-entry: people scanned out at the gate can come back in" />
        {setup.allowances.map((al) => (
          <div key={al.key} className="flex flex-wrap items-center gap-3">
            <Toggle checked={sell[al.key] !== undefined} onChange={(v) => setSell(v ? { ...sell, [al.key]: 250 } : Object.fromEntries(Object.entries(sell).filter(([k]) => k !== al.key)))} label={`Let people without ${al.label.toLowerCase()} on their ticket buy it at the station`} />
            {sell[al.key] !== undefined && <label className="flex items-center gap-2 text-sm">Price K<Input className="w-24" inputMode="numeric" value={sell[al.key]} onChange={(x) => setSell({ ...sell, [al.key]: Number(x.target.value.replace(/\D/g, "")) })} /></label>}
          </div>
        ))}
        <p className="text-xs text-ink-3">Money for extras sold at the station goes to your attendant, like food sales, and is counted in their cash.</p>
      </div>
    </Card>
  );
}

/* Giving -------------------------------------------------------------------- */

export function GivingPanel({ e }: { e: EventItem }) {
  const toast = useToast();
  const slug = api.eventDay.setup(e.id).giving!;
  const g = api.giving.page(slug)!;
  const totals = api.giving.totals(slug);
  const sum = totals.reduce((x, t) => x + t.amount, 0);
  const link = `${origin}/give/${slug}/`;
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label={g.kind === "FUNERAL" ? "Contributions so far" : "Given at this service"} value={kwacha(sum)} hint={`${totals.reduce((x, t) => x + t.givers, 0).toLocaleString()} gifts`} />
        {totals.slice(0, 3).map((t) => <Stat key={t.fund} label={t.fund} value={kwacha(t.amount)} hint={`${t.givers} gifts`} />)}
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[320px_1fr]">
        <Card className="text-center">
          <SectionTitle title="Giving link and QR code" sub="Share it on WhatsApp and print it on the bulletin or programme" />
          <QRCodeSVG value={link} size={170} className="mx-auto" />
          <p className="mt-2 break-all text-xs text-ink-3">{link}</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <Button size="sm" variant="secondary" onClick={() => { navigator.clipboard?.writeText(link).catch(() => {}); toast("Link copied"); }}><Copy size={14} /> Copy link</Button>
            <Button size="sm" variant="secondary" href={`https://wa.me/?text=${encodeURIComponent(`${g.title}: ${link}`)}`}><Share2 size={14} /> WhatsApp</Button>
            <Button size="sm" variant="secondary" className="col-span-2" onClick={() => toast("QR code downloaded as PNG")}><Download size={14} /> Download QR code</Button>
          </div>
          <p className="mt-3 text-left text-xs text-ink-3">{g.kind === "CHURCH" ? "One link for the church. Gifts made during a service are also counted for that service." : "Contributors don't need an account. They get an SMS receipt."}</p>
        </Card>
        <Card>
          <SectionTitle title="Latest gifts" action={<Button size="sm" href="/org/finance/contributions/"><HandHeart size={14} /> Cash out</Button>} />
          <ul className="divide-y divide-line text-sm">
            {api.giving.recent(slug).map((r, i) => <li key={i} className="flex items-center justify-between gap-3 py-2.5"><span className="min-w-0"><span className="block truncate font-medium">{r.name}</span><span className="text-xs text-ink-3">{r.at} · {r.fund} · {r.method}</span></span><span className="shrink-0 font-semibold tabular-nums">{kwacha(r.amount)}</span></li>)}
          </ul>
          <p className="mt-3 text-xs text-ink-3">Contribution money: you can cash it out at any time once it clears (mobile money straight away, cards after about 3 business days). Non-refundable except for an EMS system error.</p>
        </Card>
      </div>
    </>
  );
}

/* Food and merchandise ------------------------------------------------------ */

export function SalesPanel({ e }: { e: EventItem }) {
  const toast = useToast();
  const setup = api.eventDay.setup(e.id);
  const [menu, setMenu] = useState<MenuItem[]>(api.eventDay.menu(e.id));
  const orders = api.eventDay.orders(e.id);
  const [staff, setStaff] = useState(api.eventDay.attendants(e.id));
  const [view, setView] = useState("Orders");
  const [restock, setRestock] = useState<MenuItem | null>(null);
  const [issue, setIssue] = useState<Attendant | null>(null);
  const [issueForm, setIssueForm] = useState({ item: "", qty: "" });
  const [qty, setQty] = useState("");
  const sales = menu.reduce((a, m) => a + m.sold * m.price, 0);
  const cash = staff.reduce((a, s) => a + s.cash, 0);
  const plan = salesTrackingOptions.find((o) => o.key === setup.salesTracking)!;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="Sales recorded" value={kwacha(sales)} hint={`${menu.reduce((a, m) => a + m.sold, 0).toLocaleString()} items`} />
        <Stat label="Cash to hand in" value={kwacha(cash)} hint={(() => { const n = staff.filter((s) => s.handedIn === undefined).length; return n ? `${n} attendant${n > 1 ? "s" : ""} still to hand in` : "All handed in"; })()} />
        <Stat label="Orders waiting" value={orders.filter((o) => ["Waiting", "Preparing", "Ready"].includes(o.status)).length} hint={`Unpaid orders cancel after ${UNPAID_ORDER_MINUTES} min`} />
        <Stat label="Running low" value={menu.filter((m) => left(m) < 30).length} hint="Items with under 30 left" />
      </div>
      <p className="mt-3 rounded-lg bg-surface-2 px-3 py-2 text-xs text-ink-2">Buyers pay your attendants directly (cash, card on your machine or mobile money to your number). EMS records the sales but doesn&rsquo;t hold this money. Pricing for this event: <strong>{plan.label}</strong>, {plan.price.toLowerCase()}.</p>

      <div className="mt-3 flex flex-wrap gap-2"><Button size="sm" variant="secondary" href="/org/scan/kitchen/"><ChefHat size={14} /> Kitchen and bar screen</Button><Button size="sm" variant="secondary" href="/org/scan/"><Plus size={14} /> Scanner: orders and quick sales</Button></div>
      <div className="mt-5"><Tabs tabs={["Orders", "Menu and stock", "Attendants and cash", "End-of-event balance"]} value={view} onChange={setView} /></div>

      {view === "Orders" && (
        <Table rows={orders} columns={[
          { key: "number", label: "Order", render: (o) => <><p className="font-mono font-semibold">{o.number}</p><p className="text-xs text-ink-3">{o.at}{o.quick ? " · walk-up sale" : ""}</p></> },
          { key: "lines", label: "Items", render: (o) => <>{o.lines.map((l) => `${l.qty} × ${menu.find((m) => m.id === l.item)?.name}`).join(", ")}{o.status === "Part collected" && <p className="text-xs font-semibold text-[#8a5a00]">{toGive(o)} still to give</p>}</> },
          { key: "point", label: "Collect at", render: (o) => <>{o.point}{o.table && <p className="text-xs text-ink-3">Deliver to {o.table}</p>}</> },
          { key: "pay", label: "Payment", render: (o) => o.paidMethod ? <>{payShort[o.paidMethod]}{o.paidMethod !== o.method && <p className="text-xs text-ink-3">Said {payShort[o.method].toLowerCase()}</p>}{o.ref && <p className="font-mono text-[11px] text-ink-3">{o.ref}</p>}</> : <span className="text-ink-3">{payShort[o.method]} on collection</span> },
          { key: "total", label: "Amount", align: "right", render: (o) => kwacha(orderTotal(o, menu)) },
          { key: "status", label: "Status", render: (o) => <Badge tone={o.status === "Collected" ? "green" : o.status === "Cancelled" ? "grey" : o.status === "Ready" ? "teal" : o.status === "Part collected" ? "gold" : "gold"}>{o.status}{o.attendant ? ` · ${o.attendant.split(" ")[0]}` : ""}</Badge> },
        ]} />
      )}

      {view === "Menu and stock" && (
        <>
          <div className="mb-3 flex flex-wrap justify-end gap-2"><Button variant="secondary" onClick={() => toast("Menu QR code downloaded. Put it on tables and posters.")}><Download size={15} /> Menu QR code</Button><Button onClick={() => toast("New item form opened")}><Plus size={15} /> Add item</Button></div>
          <Table rows={menu} columns={[
            { key: "name", label: "Item", render: (m) => (
              <div className="flex items-center gap-3">
                <label className="group relative cursor-pointer" title="Upload a photo">
                  <MenuPicture item={m} className="h-12 w-12" />
                  <span className="absolute inset-0 hidden items-center justify-center rounded-xl bg-black/50 text-white group-hover:flex"><ImagePlus size={16} /></span>
                  <input type="file" accept="image/*" className="sr-only" onChange={(x) => { const f = x.target.files?.[0]; if (f) { setMenu(menu.map((y) => (y.id === m.id ? { ...y, photo: URL.createObjectURL(f) } : y))); toast(`Photo added to ${m.name}`); } }} />
                </label>
                <div><p className="font-semibold">{m.name}</p><p className="text-xs text-ink-3">{m.kind} · {m.point}</p></div>
              </div>
            ) },
            { key: "price", label: "Price", align: "right", render: (m) => kwacha(m.price) },
            { key: "opening", label: "Starting stock", align: "right", render: (m) => <>{m.opening.toLocaleString()}{m.restocked > 0 && <p className="text-xs text-ink-3">+{m.restocked.toLocaleString()} restocked</p>}</> },
            { key: "sold", label: "Sold", align: "right", render: (m) => m.sold.toLocaleString() },
            { key: "left", label: "Left", align: "right", render: (m) => <span className={cx("font-semibold", left(m) < 30 && "text-hibiscus")}>{left(m).toLocaleString()}</span> },
            { key: "x", label: "", render: (m) => <div className="flex justify-end gap-1"><Button size="sm" variant="ghost" onClick={() => { setRestock(m); setQty(""); }}>Restock</Button><Button size="sm" variant="ghost" aria-label={m.paused ? `Resume ${m.name}` : `Pause ${m.name}`} onClick={() => setMenu(menu.map((x) => (x.id === m.id ? { ...x, paused: !x.paused } : x)))}>{m.paused ? <Play size={14} /> : <Pause size={14} />}</Button></div> },
          ]} />
          <p className="mt-2 text-xs text-ink-3">Tap a picture to upload a photo (shown to buyers). Until then a placeholder is shown. Damaged, spoiled or given-away items are recorded in the scanner app with a reason, so they aren&rsquo;t counted as missing.</p>
        </>
      )}

      {view === "Attendants and cash" && (
        <Table rows={staff} columns={[
          { key: "name", label: "Attendant", render: (s) => <><p className="font-semibold">{s.name}</p><p className="text-xs text-ink-3">{s.point} · {s.orders.toLocaleString()} orders</p></> },
          { key: "cash", label: "Cash to hand in", align: "right", render: (s) => <span className="font-semibold">{kwacha(s.cash)}</span> },
          { key: "card", label: "Card", align: "right", render: (s) => <>{kwacha(s.card)}<p className="text-xs text-ink-3">{s.cardReceipts} receipts</p></> },
          { key: "mobile", label: "Mobile money", align: "right", render: (s) => <>{kwacha(s.mobile)}<p className="text-xs text-ink-3">{s.mobileRefs} references</p></> },
          { key: "handed", label: "Handed in", render: (s) => s.handedIn === undefined
            ? <Button size="sm" onClick={() => { setStaff(staff.map((x) => (x.id === s.id ? { ...x, handedIn: x.cash } : x))); toast(`${s.name}: ${kwacha(s.cash)} cash received`); }}>Mark cash received</Button>
            : <Badge tone={s.handedIn === s.cash ? "green" : "red"}>{kwacha(s.handedIn)}{s.handedIn !== s.cash ? ` · ${s.handedIn < s.cash ? "short" : "over"} ${kwacha(Math.abs(s.cash - s.handedIn))}` : ""}</Badge> },
          { key: "issue", label: "", render: (s) => <Button size="sm" variant="ghost" onClick={() => { setIssue(s); setIssueForm({ item: menu.find((m) => m.point === s.point)?.id ?? menu[0].id, qty: "" }); }}>Give stock</Button> },
        ]} />
      )}

      {view === "Attendants and cash" && (
        <Card className="mt-4">
          <SectionTitle title="Stock handed to attendants" sub="What each attendant took to sell, what they sold, and what they must return" />
          <Table rows={staff.flatMap((s) => (s.issued ?? []).map((x) => ({ ...x, who: s.name, id: s.id })))} empty="No stock handed to attendants yet. Use Give stock above." columns={[
            { key: "who", label: "Attendant", render: (r) => <span className="font-semibold">{r.who}</span> },
            { key: "item", label: "Item", render: (r) => { const m = menu.find((x) => x.id === r.item)!; return <span className="flex items-center gap-2"><MenuPicture item={m} className="h-8 w-8" />{m.name}</span>; } },
            { key: "issued", label: "Given", align: "right" },
            { key: "sold", label: "Sold", align: "right" },
            { key: "should", label: "Should return", align: "right", render: (r) => <span className="font-semibold">{r.issued - r.sold}</span> },
            { key: "returned", label: "Returned", render: (r) => r.returned === undefined
              ? <span className="flex items-center gap-1"><span className="w-20"><Input aria-label={`Returned ${r.item}`} inputMode="numeric" placeholder="Count" onKeyDown={(x) => { if (x.key === "Enter") { const n = Number((x.target as HTMLInputElement).value); setStaff(staff.map((st) => (st.id === r.id ? { ...st, issued: st.issued?.map((it) => (it.item === r.item ? { ...it, returned: n } : it)) } : st))); } }} /></span><span className="text-xs text-ink-3">Enter</span></span>
              : <Badge tone={r.returned === r.issued - r.sold ? "green" : "red"}>{r.returned} returned{r.returned !== r.issued - r.sold ? ` · ${Math.abs(r.issued - r.sold - r.returned)} ${r.returned < r.issued - r.sold ? "missing" : "extra"}` : " · balanced"}</Badge> },
          ]} />
        </Card>
      )}

      {view === "End-of-event balance" && (
        <>
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><p className="text-sm text-ink-3">Count what&rsquo;s left of each item and type it in. Differences show straight away.</p><Button variant="secondary" onClick={() => toast("Sales, stock and attendant balances downloaded as Excel")}><Download size={15} /> Download Excel</Button></div>
          <Table rows={menu} columns={[
            { key: "name", label: "Item", render: (m) => <span className="font-semibold">{m.name}</span> },
            { key: "start", label: "Start + restock", align: "right", render: (m) => (m.opening + m.restocked).toLocaleString() },
            { key: "sold", label: "Sold", align: "right", render: (m) => m.sold.toLocaleString() },
            { key: "off", label: "Written off", align: "right", render: (m) => m.writtenOff.toLocaleString() },
            { key: "should", label: "Should be left", align: "right", render: (m) => <span className="font-semibold">{left(m).toLocaleString()}</span> },
            { key: "counted", label: "Counted", align: "right", render: (m) => <div className="ml-auto w-24"><Input aria-label={`Counted ${m.name}`} className="text-right" inputMode="numeric" placeholder="Count" value={m.counted ?? ""} onChange={(x) => { const v = x.target.value.replace(/\D/g, ""); setMenu(menu.map((y) => (y.id === m.id ? { ...y, counted: v === "" ? undefined : Number(v) } : y))); }} /></div> },
            { key: "diff", label: "Difference", render: (m) => m.counted === undefined ? null : <Badge tone={m.counted === left(m) ? "green" : "red"}>{m.counted === left(m) ? "Balanced" : `${Math.abs(left(m) - m.counted)} ${m.counted < left(m) ? "missing" : "extra"}`}</Badge> },
            { key: "money", label: "Sales", align: "right", render: (m) => kwacha(m.sold * m.price) },
          ]} />
          <Card className="mt-4">
            <SectionTitle title="Money" sub="Recorded sales compared with what attendants handed in or recorded" />
            <dl className="grid gap-3 text-sm sm:grid-cols-4">
              {[["Recorded sales", kwacha(sales)], ["Cash", kwacha(cash)], ["Card", kwacha(staff.reduce((a, s) => a + s.card, 0))], ["Mobile money", kwacha(staff.reduce((a, s) => a + s.mobile, 0))]].map(([k, v]) => <div key={k}><dt className="text-ink-3">{k}</dt><dd className="font-semibold tabular-nums">{v}</dd></div>)}
            </dl>
            <p className="mt-3 text-sm">{(() => { const d = staff.reduce((a, s) => a + (s.handedIn === undefined ? 0 : s.handedIn - s.cash), 0); const open = staff.filter((s) => s.handedIn === undefined).length; return `${open ? `${open} attendant${open > 1 ? "s" : ""} still to hand in cash. ` : ""}Cash difference so far: ${d === 0 ? "none" : `${d < 0 ? "short" : "over"} ${kwacha(Math.abs(d))}`}.`; })()}</p>
          </Card>
        </>
      )}

      <Modal open={!!issue} onClose={() => setIssue(null)} title={`Give stock to ${issue?.name ?? ""}`} footer={<><Button variant="ghost" onClick={() => setIssue(null)}>Cancel</Button><Button onClick={() => { const n = Number(issueForm.qty); if (!n || !issue) return; setStaff(staff.map((st) => (st.id === issue.id ? { ...st, issued: [...(st.issued ?? []).filter((x) => x.item !== issueForm.item), { item: issueForm.item, issued: n + (st.issued?.find((x) => x.item === issueForm.item)?.issued ?? 0), sold: st.issued?.find((x) => x.item === issueForm.item)?.sold ?? 0 }] } : st))); toast(`${n} handed to ${issue.name}`); setIssue(null); }}>Record</Button></>}>
        <div className="space-y-3">
          <Field label="Item"><select value={issueForm.item} onChange={(x) => setIssueForm({ ...issueForm, item: x.target.value })} className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm">{menu.map((m) => <option key={m.id} value={m.id}>{m.name} ({left(m)} in stock)</option>)}</select></Field>
          <Field label="How many?"><Input inputMode="numeric" value={issueForm.qty} onChange={(x) => setIssueForm({ ...issueForm, qty: x.target.value.replace(/\D/g, "") })} /></Field>
          <p className="text-sm text-ink-3">Their sales count down from this. At the end, they return what&rsquo;s unsold and any difference shows against them.</p>
        </div>
      </Modal>

      <Modal open={!!restock} onClose={() => setRestock(null)} title={`Restock ${restock?.name ?? ""}`} footer={<><Button variant="ghost" onClick={() => setRestock(null)}>Cancel</Button><Button onClick={() => { const n = Number(qty); if (!n) return; setMenu(menu.map((x) => (x.id === restock!.id ? { ...x, restocked: x.restocked + n } : x))); toast(`+${n} ${restock!.name} added`); setRestock(null); }}>Add to stock</Button></>}>
        <Field label="How many are you adding?"><Input inputMode="numeric" autoFocus value={qty} onChange={(x) => setQty(x.target.value.replace(/\D/g, ""))} /></Field>
        {restock && <p className="mt-2 text-sm text-ink-3">{left(restock)} left now at {restock.point}.</p>}
      </Modal>
    </>
  );
}
