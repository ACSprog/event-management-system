"use client";

import { SelectOther } from "@/components/select-other";

import { useState } from "react";
import { Badge, Button, Modal, PageHeader, Table, useToast } from "@/components/ui";
import { kwacha } from "@/lib/brand";
import { QRCodeSVG } from "qrcode.react";
import { api } from "@/lib/api";
import { MenuPicture } from "@/components/menu-picture";
import { orderTotal, payShort, toGive } from "@/lib/event-day";

const orders = [
  { ref: "EVT-8K2Q9M", event: "Lusaka Summer Jam", date: "2026-11-14", items: "2 × Standard", total: 528, method: "MTN MoMo", status: "Paid" },
  { ref: "EVT-3PZ7LA", event: "Grace Chapel National Convention", date: "2026-11-02", items: "1 × Meal pack", total: 209, method: "Airtel Money", status: "Paid" },
  { ref: "EVT-9QW1XE", event: "Digital Marketing Bootcamp", date: "2026-10-30", items: "Full course", total: 1229, method: "Visa card", status: "Paid" },
  { ref: "EVT-1LM4RT", event: "Laugh Out Loud Friday", date: "2026-10-20", items: "1 × Standard", total: 209, method: "MTN MoMo", status: "Refunded" },
];

export default function Orders() {
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [code, setCode] = useState<string | null>(null);
  const food = api.eventDay.myOrders();
  const menu = api.eventDay.menu("e1");
  const shown = food.find((o) => o.number === code);
  return (
    <>
      <PageHeader title="Orders and refunds" sub="Receipts for everything you've bought." />
      <Table
        rows={orders}
        columns={[
          { key: "ref", label: "Booking", render: (r) => <span className="font-mono text-xs">{r.ref}</span> },
          { key: "event", label: "Event", render: (r) => <><p className="font-semibold">{r.event}</p><p className="text-xs text-ink-3">{r.items}</p></> },
          { key: "date", label: "Bought" },
          { key: "method", label: "Paid with" },
          { key: "total", label: "Total", align: "right", render: (r) => kwacha(r.total) },
          { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Paid" ? "green" : "grey"}>{r.status}</Badge> },
          { key: "a", label: "", render: (r) => r.status === "Paid" ? <Button size="sm" variant="ghost" onClick={() => setOpen(r.ref)}>Request refund</Button> : <Button size="sm" variant="ghost">Receipt</Button> },
        ]}
      />
      {/* Food and merchandise orders: paid to the organiser's attendants, not through EMS. */}
      <section id="food" className="mt-8 scroll-mt-32">
        <h2 className="text-lg font-semibold">Food and merchandise</h2>
        <p className="mb-3 text-sm text-ink-3">Orders from event menus. You pay the organiser&rsquo;s attendant when you collect, so refunds are with the organiser.</p>
        <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
          {food.map((o) => (
            <li key={o.number}>
              <button onClick={() => setCode(o.number)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface-2">
                <MenuPicture item={menu.find((m) => m.id === o.lines[0].item)!} className="h-11 w-11" />
                <span className="min-w-0 flex-1">
                  <span className="block font-semibold"><span className="font-mono">{o.number}</span> · {o.event}</span>
                  <span className="block truncate text-sm text-ink-3">{o.lines.map((l) => `${l.qty} × ${menu.find((m) => m.id === l.item)?.name}`).join(", ")}</span>
                </span>
                <span className="shrink-0 text-right">
                  <Badge tone={o.status === "Collected" ? "green" : o.status === "Ready" ? "teal" : "gold"}>{o.status}</Badge>
                  <span className="mt-0.5 block text-xs text-ink-3">{kwacha(orderTotal(o, menu))}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <Modal open={!!shown} onClose={() => setCode(null)} title={shown ? `Order ${shown.number}` : ""}>
        {shown && (
          <div className="text-center">
            <QRCodeSVG value={`EVT1.ORDER.e1.${shown.number}`} size={180} className="mx-auto" />
            <p className="mt-2 text-sm font-semibold">{shown.paidMethod ? `Paid · ${payShort[shown.paidMethod]}` : `To pay: ${kwacha(orderTotal(shown, menu))} · ${payShort[shown.method]}`}</p>
            <p className="text-sm text-ink-3">{shown.status === "Part collected" ? `${toGive(shown)} item${toGive(shown) > 1 ? "s" : ""} still to collect at ${shown.point}` : shown.status === "Collected" ? `Collected at ${shown.point}` : `Collect at ${shown.point}${shown.table ? ` or at ${shown.table}` : ""}`}</p>
            <ul className="mt-4 divide-y divide-line text-left text-sm">
              {shown.lines.map((l) => { const m = menu.find((x) => x.id === l.item)!; return <li key={l.item} className="flex items-center justify-between gap-2 py-2"><span className="flex items-center gap-2"><MenuPicture item={m} className="h-8 w-8" />{l.qty} × {m.name}</span><span className="text-ink-3">{(l.given ?? (shown.status === "Collected" ? l.qty : 0))} of {l.qty} given</span></li>; })}
            </ul>
          </div>
        )}
      </Modal>

      <Modal open={!!open} onClose={() => setOpen(null)} title="Request a refund" footer={<><Button variant="ghost" onClick={() => setOpen(null)}>Keep my tickets</Button><Button variant="danger" onClick={() => { setOpen(null); toast("Refund requested. We'll update you by SMS."); }}>Request refund</Button></>}>
        <p className="text-sm text-ink-2">This organiser allows refunds until 5 December. The money goes back to the wallet or card you paid with, minus the K5 booking fee per ticket.</p>
        <div className="mt-4 space-y-4">
          <SelectOther label="Reason" options={["I can't attend anymore", "The event changed", "I bought by mistake"]} prompt="Tell us why" multiline placeholder="The organiser sees this with your request" />
        </div>
      </Modal>
    </>
  );
}
