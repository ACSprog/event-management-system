"use client";

import { QRCodeSVG } from "qrcode.react";
import { Poster } from "@/components/poster";
import { Badge } from "@/components/ui";
import type { EventItem } from "@/lib/api";
import { fmtDate, fmtTime } from "@/lib/brand";

/** QR payload is a signed token in production: base64(ticketId.eventId.exp).signature, verifiable offline at the gate. */
export function TicketCard({ e, t, venueName }: { e: EventItem; t: { type: string; holder: string; ref: string; number: string; status: string; gate: string }; venueName: string }) {
  const payload = `EVT1.${t.number}.${e.id}.sig_${t.ref.toLowerCase()}`;
  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-surface">
      <Poster event={e} size="sm" className="h-16" bare />
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="font-display text-lg font-semibold leading-tight">{e.title}</p>
            <p className="text-sm text-ink-3">{fmtDate(e.start, { weekday: "short", day: "numeric", month: "short", year: "numeric" })}, {fmtTime(e.start)}</p>
            <p className="text-sm text-ink-3">{e.format === "Virtual" ? "Online on Zoom" : venueName}</p>
          </div>
          <Badge tone={t.status === "Valid" ? "green" : t.status === "Used" ? "grey" : "red"}>{t.status}</Badge>
        </div>
        <div className="my-4 border-t-2 border-dashed border-line" />
        <div className="flex items-center gap-5">
          <div className="rounded-lg bg-white p-2.5">
            <QRCodeSVG value={payload} size={132} level="M" fgColor="#172033" />
          </div>
          <dl className="grid flex-1 gap-2 text-sm">
            <div><dt className="text-ink-3">Ticket</dt><dd className="font-semibold">{t.type}</dd></div>
            <div><dt className="text-ink-3">Name</dt><dd className="font-semibold">{t.holder}</dd></div>
            <div><dt className="text-ink-3">Entrance</dt><dd className="font-semibold">{t.gate}</dd></div>
          </dl>
        </div>
        <p className="mt-4 font-mono text-xs text-ink-3">{t.number} | Booking {t.ref}</p>
      </div>
    </div>
  );
}
