"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Download, MessageCircle, Wallet } from "lucide-react";
import { Button } from "@/components/ui";
import { TicketCard } from "@/components/ticket-card";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function Success() {
  const [slug, setSlug] = useState("lusaka-summer-jam-2026");
  const [paid, setPaid] = useState<number | null>(null);
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    if (p.get("event")) setSlug(p.get("event")!);
    if (p.get("paid")) setPaid(Number(p.get("paid")));
  }, []);
  const e = api.events.bySlug(slug)!;
  const venue = api.venues.get(e.venueId);
  const type = (e.tickets.find((t) => t.sold < t.capacity) ?? e.tickets[0]).name;
  const tickets = [
    { type, holder: "Chanda Mulenga", ref: "EVT-8K2Q9M", number: "TKT-000481-A", status: "Valid", gate: e.id === "e1" ? "Gate A or B" : e.format === "Virtual" ? "Online" : "Main entrance" },
    { type, holder: "Guest 2 (add a name)", ref: "EVT-8K2Q9M", number: "TKT-000481-B", status: "Valid", gate: e.id === "e1" ? "Gate A or B" : e.format === "Virtual" ? "Online" : "Main entrance" },
  ];
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="flex items-start gap-4">
        <CheckCircle2 size={40} className="shrink-0 text-leaf" />
        <div>
          <h1 className="text-3xl font-semibold">You&rsquo;re going!</h1>
          <p className="mt-1 text-ink-2">
            {paid ? <>Payment of {kwacha(paid)} confirmed by MTN MoMo. </> : "Registration confirmed. "}
            Booking <strong>EVT-8K2Q9M</strong>. We sent your tickets by SMS, WhatsApp and to chanda.mulenga@mail.example.
          </p>
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <Button variant="secondary"><Wallet size={16} /> Add to Google Wallet</Button>
        <Button variant="secondary"><Wallet size={16} /> Add to Apple Wallet</Button>
        <Button variant="secondary"><Download size={16} /> Download PDF</Button>
        <Button variant="secondary"><MessageCircle size={16} /> Send to WhatsApp</Button>
      </div>
      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        {tickets.map((t) => <TicketCard key={t.number} e={e} t={t} venueName={venue.name} />)}
      </div>
      <p className="mt-6 text-sm text-ink-3">Each ticket has its own QR code. Forward the second ticket to your guest from <a href="/account/" className="font-semibold text-kafue">My tickets</a>, so you don&rsquo;t need to arrive together.</p>
    </div>
  );
}
