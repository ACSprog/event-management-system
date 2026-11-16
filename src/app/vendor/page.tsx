"use client";

import Link from "next/link";
import { Badge, Card, PageHeader, SectionTitle, Stat } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function VendorHome() {
  return (
    <>
      <PageHeader title="Levy Park Amphitheatre" sub="Venue and service provider workspace" />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Booked days, next 90" value="23" hint="of 90" />
        <Stat label="Open quote requests" value="2" />
        <Stat label="Invoiced this year" value={kwacha(1_812_400)} />
        <Stat label="Unpaid" value={kwacha(68_400)} hint="2 invoices" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle title="New quote requests" action={<Link href="/vendor/rfqs/" className="text-sm font-semibold text-kafue">All</Link>} />
          <ul className="space-y-3">{api.vendors.rfqs().filter((r) => r.status === "Open").map((r) => <li key={r.id} className="rounded-lg bg-surface-2 p-3 text-sm"><p className="font-semibold">{r.title}</p><p className="text-ink-3">{r.org}, due {r.due}, budget {kwacha(r.budget)}</p></li>)}</ul>
        </Card>
        <Card>
          <SectionTitle title="Upcoming bookings" />
          <ul className="space-y-3 text-sm">{api.venues.bookings().map((b) => <li key={b.event} className="flex items-center justify-between"><div><p className="font-semibold">{b.event}</p><p className="text-ink-3">{b.org}, {b.dates}</p></div><Badge tone={b.status === "Confirmed" ? "green" : b.status === "Requested" ? "gold" : "teal"}>{b.status}</Badge></li>)}</ul>
        </Card>
      </div>
    </>
  );
}
