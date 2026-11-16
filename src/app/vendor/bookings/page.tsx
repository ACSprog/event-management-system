"use client";

import { useState } from "react";
import { Badge, Button, Card, cx, PageHeader, SectionTitle, useToast } from "@/components/ui";
import { kwacha } from "@/lib/brand";

const booked: Record<number, { e: string; s: string }> = { 5: { e: "Phone Photography Workshop", s: "Confirmed" }, 12: { e: "Lusaka Summer Jam afterparty", s: "Confirmed" }, 13: { e: "Hold: Zed Live", s: "Provisional" }, 19: { e: "Corporate end-of-year", s: "Confirmed" }, 26: { e: "Church youth night", s: "Contract sent" }, 31: { e: "New Year's Eve Countdown", s: "Requested" } };

export default function Bookings() {
  const toast = useToast();
  const [sel, setSel] = useState(31);
  return (
    <>
      <PageHeader title="Venue calendar" sub="December 2026" actions={<Button variant="secondary">Block dates</Button>} />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <Card>
          <div className="grid grid-cols-7 gap-1 text-center text-xs text-ink-3">{["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => <div key={d} className="py-1">{d}</div>)}</div>
          <div className="grid grid-cols-7 gap-1">
            <div /> {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => {
              const b = booked[d];
              return (
                <button key={d} onClick={() => setSel(d)} className={cx("min-h-20 rounded-lg border p-1.5 text-left text-xs", sel === d ? "border-kafue ring-2 ring-kafue/30" : "border-line", b?.s === "Confirmed" ? "bg-kafue-soft" : b ? "bg-marigold-soft" : "bg-surface")}>
                  <span className="font-semibold">{d}</span>
                  {b && <span className="mt-1 block truncate">{b.e}</span>}
                </button>
              );
            })}
          </div>
        </Card>
        <Card>
          <SectionTitle title={`${sel} December`} />
          {booked[sel] ? (
            <div className="space-y-3 text-sm">
              <p className="font-semibold">{booked[sel].e}</p>
              <Badge tone={booked[sel].s === "Confirmed" ? "green" : "gold"}>{booked[sel].s}</Badge>
              <p className="text-ink-3">Amphitheatre, 2,500 capacity. Day rate {kwacha(38_000)}.</p>
              {booked[sel].s === "Requested" && <div className="flex gap-2"><Button size="sm" onClick={() => toast("Booking accepted and contract sent")}>Accept and send contract</Button><Button size="sm" variant="ghost">Decline</Button></div>}
            </div>
          ) : <p className="text-sm text-ink-3">Available. Organisers can request this date.</p>}
        </Card>
      </div>
    </>
  );
}
