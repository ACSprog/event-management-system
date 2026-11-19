"use client";

import Link from "next/link";
import { Bell, LifeBuoy, Phone } from "lucide-react";
import { QrScanButton } from "@/components/qr-scan-button";
import { Badge, Button, Card, PageHeader, SectionTitle } from "@/components/ui";
import { api } from "@/lib/api";
import { fmtDate } from "@/lib/brand";
import { isLive } from "@/lib/date-ranges";

/**
 * Help at events: where an attendee starts a request from their account, or
 * scans the QR code on a table, pew or poster. Requests open when gates open.
 */
export default function HelpAtEvents() {
  const tickets = api.me.tickets();
  const eventIds = Array.from(new Set(tickets.map((t) => t.eventId)));
  const events = eventIds.map((id) => api.events.discover().find((e) => e.id === id) ?? null).filter((e): e is NonNullable<typeof e> => !!e && e.format !== "Virtual");
  const now = events.find((e) => isLive(e));
  const later = events.filter((e) => e !== now);
  const settings = api.assist.settings();

  return (
    <>
      <PageHeader title="Help at events" sub="Ask the organiser's team for an usher, security, first aid and more while you're at an event." />

      {now && (
        <Card className="border-kafue ring-1 ring-kafue">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <Badge tone="red"><span className="h-2 w-2 rounded-full bg-hibiscus motion-safe:animate-pulse" /> On now</Badge>
              <p className="mt-2 text-lg font-semibold">{now.title}</p>
              <p className="text-sm text-ink-3">{api.venues.get(now.venueId).name}</p>
            </div>
            <a href={`tel:${settings.hotline.replace(/\s/g, "")}`} className="flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm font-semibold"><Phone size={15} className="text-kafue" /> {settings.hotline}</a>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button href={`/events/${now.slug}/help/`} size="lg"><LifeBuoy size={18} /> Request help</Button>
            <QrScanButton size="lg" />
          </div>
          <p className="mt-3 text-xs text-ink-3">Scanning the code on your table or pew tells the team exactly where you are.</p>
        </Card>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle title="Your requests" />
          <ul className="divide-y divide-line text-sm">
            {api.cases.mine().filter((c) => c.type === "Help request" || c.type === "Lost and found").map((c) => (
              <li key={c.number}>
                <Link href={`/account/messages/?case=${c.number}`} className="flex items-start justify-between gap-3 py-3 hover:text-kafue">
                  <span><span className="block font-semibold">{c.subject}</span><span className="block text-xs text-ink-3"><span className="font-mono">{c.number}</span> · {c.event}</span></span>
                  <Badge tone={c.status === "Closed" ? "grey" : "green"}>{c.status === "Answered" ? "Done" : c.status}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <SectionTitle title="Messages from organisers" action={<Bell size={16} className="text-ink-3" />} />
          <ul className="space-y-2 text-sm">
            {api.assist.inbox().map((m) => (
              <li key={m.at} className={m.urgent ? "rounded-lg bg-marigold-soft p-3" : "rounded-lg bg-surface-2 p-3"}>
                <p className="font-semibold">{m.urgent && "Urgent: "}{m.title} <span className="font-normal text-ink-3">· {m.at}</span></p>
                <p className="text-ink-2">{m.body}</p>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      {later.length > 0 && (
        <Card className="mt-6">
          <SectionTitle title="Your other events" sub="Request help opens when the gates open" />
          <ul className="divide-y divide-line text-sm">
            {later.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-3 py-3">
                <span><span className="block font-semibold">{e.title}</span><span className="block text-xs text-ink-3">{fmtDate(e.start)}</span></span>
                <Link href={`/events/${e.slug}/help/`} className="text-sm font-semibold text-kafue">Preview</Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  );
}
