"use client";

import { useState } from "react";
import { History, Send, UserPen, ListOrdered } from "lucide-react";
import { TicketCard } from "@/components/ticket-card";
import { Button, Field, Input, Modal, PageHeader, Tabs, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { fmtDate } from "@/lib/brand";
import { PhoneInput } from "@/components/phone-input";
import { emptyPhone, phoneError, type Phone } from "@/lib/phone";

export default function MyTickets() {
  const toast = useToast();
  const [tab, setTab] = useState("Upcoming");
  const [transfer, setTransfer] = useState<string | null>(null);
  const [history, setHistory] = useState<string | null>(null);
  const [to, setTo] = useState<Phone>(emptyPhone());
  const [err, setErr] = useState("");
  const tickets = api.me.tickets();
  const past = api.me.pastTickets();
  return (
    <>
      <PageHeader title="My tickets" sub="Show the QR code at the gate. It works without data once this page has loaded." />
      <Tabs tabs={["Upcoming", "Past"]} value={tab} onChange={setTab} />
      {tab === "Upcoming" ? (
        <div className="grid gap-6 xl:grid-cols-2">
          {tickets.map((t) => {
            const e = api.events.bySlug(api.events.discover().find((x) => x.id === t.eventId)!.slug)!;
            return (
              <div key={t.id}>
                <TicketCard e={e} t={t} venueName={api.venues.get(e.venueId).name} />
                <div className="mt-2 flex flex-wrap gap-2">
                  {api.events.programme(e.id).length > 0 && <Button size="sm" variant="ghost" href={`/events/${e.slug}/#programme`}><ListOrdered size={14} /> Programme</Button>}
                  <Button size="sm" variant="ghost" onClick={() => setTransfer(t.number)}><Send size={14} /> Transfer</Button>
                  <Button size="sm" variant="ghost" onClick={() => toast("Name change request sent to the organiser")}><UserPen size={14} /> Change name</Button>
                  <Button size="sm" variant="ghost" onClick={() => setHistory(t.number)}><History size={14} /> History</Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
          {past.map((p) => (
            <li key={p.event} className="flex items-center justify-between gap-4 px-5 py-4">
              <div><p className="font-semibold">{p.event}</p><p className="text-sm text-ink-3">{fmtDate(p.date, { day: "numeric", month: "long", year: "numeric" })}, {p.type}</p></div>
              {p.reviewed ? <span className="text-sm text-ink-3">Reviewed</span> : <Button size="sm" href="/account/reviews/">Write a review</Button>}
            </li>
          ))}
        </ul>
      )}
      <Modal open={!!history} onClose={() => setHistory(null)} title={`Ticket ${history ?? ""}`}>
        <ol className="space-y-3 border-l-2 border-line pl-4 text-sm">
          {(history ? api.me.ticketHistory(history) : []).map((h) => (
            <li key={h.when} className="relative">
              <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-kafue" />
              <p className="text-xs text-ink-3">{h.when}</p>
              <p>{h.what}</p>
            </li>
          ))}
          {history && api.me.ticketHistory(history).length === 0 && <li className="text-ink-3">Bought in your name. No transfers or changes.</li>}
        </ol>
      </Modal>
      <Modal open={!!transfer} onClose={() => setTransfer(null)} title="Transfer ticket" footer={<><Button variant="ghost" onClick={() => setTransfer(null)}>Cancel</Button><Button onClick={() => { const e = phoneError(to); if (e) { setErr(e); return; } setTransfer(null); setTo(emptyPhone()); setErr(""); toast("Ticket transferred. Your old QR code no longer works."); }}>Transfer ticket</Button></>}>
        <p className="text-sm text-ink-2">The new holder gets a fresh QR code by SMS. Your copy of <strong>{transfer}</strong> stops working immediately, so screenshots can&rsquo;t be reused.</p>
        <div className="mt-4"><Field label="Their mobile number" error={err}><PhoneInput value={to} onChange={setTo} invalid={!!err} /></Field></div>
      </Modal>
    </>
  );
}
