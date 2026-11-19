"use client";

import Link from "next/link";
import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, HandHeart, Minus, Plus, UtensilsCrossed } from "lucide-react";
import { Button, Card } from "@/components/ui";
import { api } from "@/lib/api";
import { fmtDate, fmtTime } from "@/lib/brand";
import { isLive } from "@/lib/date-ranges";

/**
 * "I'm here" check-in for open-entry events, opened by scanning the check-in
 * QR code at the venue. Counts the attendee plus the people with them; each
 * phone counts once. When the event has a meal pass, the confirmation becomes a
 * pass that the serving team marks once per person.
 *
 * The real code only works during the event, and the projector version
 * refreshes every few minutes so a photo shared on WhatsApp stops working.
 * The showcase lets you check in at any time and says so.
 */
export function CheckIn({ slug }: { slug: string }) {
  const e = api.events.bySlug(slug)!;
  const setup = api.eventDay.setup(e.id);
  const venue = api.venues.get(e.venueId);
  const giving = setup.giving ? api.giving.page(setup.giving) : undefined;
  const [people, setPeople] = useState(1);
  const [done, setDone] = useState<string | null>(null);
  const live = isLive(e);

  return (
    <div className="mx-auto max-w-md px-4 py-6 sm:py-10">
      <p className="text-sm text-ink-3">Check in</p>
      <h1 className="text-[24px] font-semibold leading-tight sm:text-[28px]">{e.title}</h1>
      <p className="mt-1 text-sm text-ink-3">{fmtDate(e.start, { weekday: "long", day: "numeric", month: "long" })}, {fmtTime(e.start)} to {fmtTime(e.end)} · {venue.name}</p>

      {!done ? (
        <Card className="mt-5 space-y-4">
          {!live && <p className="rounded-lg bg-marigold-soft px-3 py-2 text-sm">This event hasn&rsquo;t started. In the live system this code only works during the event; the showcase lets you try it now.</p>}
          <div>
            <p className="font-medium">Checking in as Chanda Mulenga</p>
            <p className="text-sm text-ink-3">0971 ••• 567. Not you? <Link href="/login/" className="font-semibold text-kafue">Sign in</Link> or continue with your phone number.</p>
          </div>
          <div>
            <p className="text-sm font-medium">How many people are with you, including you?</p>
            <div className="mt-2 flex items-center gap-3">
              <button aria-label="One fewer" onClick={() => setPeople(Math.max(1, people - 1))} className="flex h-12 w-12 items-center justify-center rounded-full border border-line"><Minus size={18} /></button>
              <span className="w-10 text-center text-2xl font-semibold tabular-nums">{people}</span>
              <button aria-label="One more" onClick={() => setPeople(Math.min(15, people + 1))} className="flex h-12 w-12 items-center justify-center rounded-full border border-line"><Plus size={18} /></button>
            </div>
            <p className="mt-1 text-xs text-ink-3">Family members without phones are counted with you. This phone can check in once.</p>
          </div>
          <Button className="h-12 w-full text-base" onClick={() => setDone(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }))}>I&rsquo;m here</Button>
        </Card>
      ) : (
        <Card className="mt-5 text-center">
          <CheckCircle2 size={48} className="mx-auto text-leaf" />
          <p className="font-display mt-2 text-2xl font-semibold">You&rsquo;re checked in</p>
          <p className="text-ink-3">{people} {people === 1 ? "person" : "people"} at {done}. Welcome.</p>
          {setup.mealPass && (
            <div className="mt-5 rounded-2xl border-2 border-dashed border-line p-4">
              <p className="flex items-center justify-center gap-2 font-semibold"><UtensilsCrossed size={16} /> Meal pass: {people} {people === 1 ? "meal" : "meals"}</p>
              <QRCodeSVG value={`EVT1.MEAL.${e.id}.CM-0971.${people}`} size={168} className="mx-auto mt-3" />
              <p className="mt-2 text-sm text-ink-3">{setup.allowances?.find((a) => a.key === "meal")?.window}. Show this at the serving point. Each meal can be collected once.</p>
            </div>
          )}
          {giving && <Button href={`/give/${giving.slug}/`} variant="secondary" className="mt-4 w-full"><HandHeart size={16} /> {giving.kind === "FUNERAL" ? "Contribute to the family" : "Give tithe or offering"}</Button>}
          <Button href={`/events/${e.slug}/help/`} variant="ghost" className="mt-2 w-full">Need an usher or help?</Button>
        </Card>
      )}
    </div>
  );
}
