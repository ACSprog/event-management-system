"use client";

import Link from "next/link";
import { CalendarPlus, Copy, LifeBuoy, MessageCircle, Send } from "lucide-react";
import { ActivityFeed, KeyList } from "@/components/dashboard";
import { TicketCard } from "@/components/ticket-card";
import { Badge, Button, Card, PageHeader, SectionTitle, Stat, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { fmtDate, kwacha } from "@/lib/brand";

/**
 * Attendee overview. Arranged like the super admin and organiser homes:
 * key figures → needs your attention → right now (next ticket) →
 * money → lists → recent activity. Works in any browser; no app needed.
 */
export default function AccountOverview() {
  const toast = useToast();
  const tickets = api.me.tickets();
  const pending = api.me.pending();
  const saved = api.me.saved();
  const following = api.me.following();
  const referral = api.me.referral();
  const past = api.me.pastTickets().filter((p) => !p.reviewed);
  const refunds = api.refunds.requests("org1").filter((r) => r.buyer === "Chipo Zulu");
  const next = tickets[0];
  const nextEvent = api.events.bySlug(api.events.discover().find((x) => x.id === next.eventId)!.slug)!;
  const events = new Set(tickets.map((t) => t.eventId)).size;
  const daysToGo = Math.round((new Date(nextEvent.start).getTime() - new Date("2026-11-18T12:00:00+02:00").getTime()) / 86_400_000);

  const todo: { key: string; title: string; detail: string; action: string; href?: string; msg?: string; tone: string }[] = [
    ...pending.incomingTransfers.map((t) => ({ key: `tr-${t.event}`, title: "A ticket was sent to you", detail: `${t.from} sent you a ${t.type} ticket for ${t.event}. Accept ${t.expires}.`, action: "Accept", msg: "Ticket accepted. You have a fresh QR code; the sender's copy no longer works.", tone: "bg-marigold-soft" })),
    ...pending.postponements.map((p) => ({ key: `pp-${p.event}`, title: `${p.event} was postponed`, detail: `New date ${p.newDate}. Keep your ticket, ask for a refund, or transfer it by ${p.deadline}.`, action: "Choose", href: "/account/orders/", tone: "bg-hibiscus-soft" })),
    ...pending.waitlistOffers.map((w) => ({ key: `wl-${w.event}`, title: "Waitlist offer", detail: `${w.qty} ticket held for you for ${w.event}, ${w.window}.`, action: "Buy", href: "/events/", tone: "bg-marigold-soft" })),
    ...past.map((p) => ({ key: `rv-${p.event}`, title: "How was it?", detail: `Review ${p.event}.`, action: "Review", href: "/account/reviews/", tone: "bg-surface-2" })),
  ];

  return (
    <>
      <PageHeader title="Hello, Chanda" sub="Your tickets, orders and saved events in one place. Signed in with an SMS code on 0971 ••• 567." />

      {/* 1. Key figures */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Upcoming tickets" value={tickets.length} hint={`for ${events} events`} />
        <Stat label="Next event" value={`${daysToGo} days`} hint={nextEvent.title} />
        <Stat label="Saved events" value={saved.length} hint={`${saved.filter((s) => s.availability === "Limited").length} with limited tickets`} />
        <Stat label="Following" value={following.length} hint="organisers" />
      </div>

      {/* 2 and 3. Needs your attention, and your next ticket */}
      <div className="mt-6 grid gap-6 2xl:grid-cols-[1.2fr_1fr]">
        <Card>
          <SectionTitle title="Needs your attention" action={<span className="text-sm text-ink-3">{todo.length} items</span>} />
          {todo.length === 0 ? <p className="text-sm text-ink-3">Nothing waiting.</p> : (
            <ul className="space-y-2">
              {todo.map((t) => (
                <li key={t.key} className={`flex items-start gap-3 rounded-lg p-3 ${t.tone}`}>
                  <span className="min-w-0 flex-1"><span className="block text-sm font-semibold">{t.title}</span><span className="block text-xs text-ink-3">{t.detail}</span></span>
                  {t.href ? <Button size="sm" variant="secondary" href={t.href}>{t.action}</Button> : <Button size="sm" variant="secondary" onClick={() => toast(t.msg!)}>{t.action}</Button>}
                </li>
              ))}
            </ul>
          )}
        </Card>
        <div>
          <SectionTitle title="Your next event" action={<Link href="/account/tickets/" className="text-sm font-semibold text-kafue">All tickets</Link>} />
          <TicketCard e={nextEvent} t={next} venueName={api.venues.get(nextEvent.venueId).name} />
          <div className="mt-2 flex flex-wrap gap-2">
            <Badge tone="green">Saved for use without data</Badge>
            <Badge tone="teal">Also sent by SMS and WhatsApp</Badge>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" href="/account/tickets/"><Send size={14} /> Transfer or assign</Button>
            <Button size="sm" variant="ghost" href={`/events/${nextEvent.slug}/help/`}><LifeBuoy size={14} /> Request help at the event</Button>
            <Button size="sm" variant="ghost" onClick={() => toast("Choose Google, Outlook or Apple calendar")}><CalendarPlus size={14} /> Add to calendar</Button>
          </div>
        </div>
      </div>

      {/* 4. Money: orders, refunds, contributions; and invite friends */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle title="Orders, refunds and contributions" action={<Link href="/account/orders/" className="text-sm font-semibold text-kafue">All orders</Link>} />
          <KeyList rows={[
            [<span key="o">{nextEvent.title}<span className="block text-xs text-ink-3">{next.ref} · MTN MoMo</span></span>, kwacha(500)],
            ...refunds.map((r) => [<span key={r.id}>Refund for {r.event}<span className="block text-xs text-ink-3">{r.method}</span></span>, <Badge key="b" tone={r.status === "Refunded" ? "green" : "gold"}>{r.status} {kwacha(r.amount)}</Badge>] as const),
            ...api.me.contributions().map((c) => [<span key={c.receipt}>Contribution to {c.to}<span className="block text-xs text-ink-3">{fmtDate(c.at, { day: "numeric", month: "short" })} · receipt {c.receipt} · non-refundable</span></span>, kwacha(c.amount)] as const),
          ]} />
        </Card>
        <Card>
          <SectionTitle title="Invite friends" />
          <p className="text-sm text-ink-2">Your code gives a friend {referral.discount}. It&rsquo;s a discount at checkout, not points or a balance.</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-lg bg-kafue-soft px-3 py-1.5 font-mono text-sm font-semibold text-kafue-ink">{referral.code}</span>
            <Button size="sm" variant="secondary" onClick={() => toast(`Copied ${referral.link}`)}><Copy size={14} /> Copy link</Button>
            <Button size="sm" variant="secondary" onClick={() => toast("Opens WhatsApp with your invite")}><MessageCircle size={14} /> WhatsApp</Button>
          </div>
          <p className="mt-3 text-xs text-ink-3">Used by {referral.used} friends so far. Orders you made as a guest with this phone number are already in your account.</p>
        </Card>
      </div>

      {/* 5. Lists */}
      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card>
          <SectionTitle title="Saved events" />
          <KeyList rows={saved.map((s) => [<span key={s.title}>{s.title}<span className="block text-xs text-ink-3">{s.when} · {s.price}</span></span>, <Badge key="a" tone={s.availability === "Limited" ? "gold" : "green"}>{s.availability}</Badge>] as const)} />
        </Card>
        <Card>
          <SectionTitle title="Near you this weekend" sub="Within 25 km of your saved area" action={<Link href="/account/preferences/" className="text-sm font-semibold text-kafue">Change area</Link>} />
          <KeyList rows={api.me.nearby().map((n) => [n.title, `${n.when} · ${n.price}`] as const)} />
          <p className="mt-3 text-xs text-ink-3">Your device location is only used when you ask for it.</p>
        </Card>
      </div>

      {/* 6. Recent activity */}
      <div className="mt-6"><ActivityFeed rows={api.me.activity()} /></div>
    </>
  );
}
