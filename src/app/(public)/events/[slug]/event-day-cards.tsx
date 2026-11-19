"use client";

import Link from "next/link";
import { useState } from "react";
import { Check, HandHeart, Minus, Plus, QrCode, UtensilsCrossed } from "lucide-react";
import { Button, cx } from "@/components/ui";
import { api, type EventItem } from "@/lib/api";
import { isLive } from "@/lib/date-ranges";

/**
 * Side cards on the public event page for the event-day tools
 * (rules in src/lib/event-day.ts):
 * - Open entry: "Free, no ticket needed", "I'm coming" with the number of people,
 *   and Check in while the event is on. Replaces the ticket picker.
 * - What tickets include (dinner, drinks), so buyers see it before paying.
 * - Food and drinks: order from the menu and pay the attendant.
 * - Giving: tithes, offerings or contributions through the shared giving page.
 */
export function EventDayCards({ e }: { e: EventItem }) {
  const setup = api.eventDay.setup(e.id);
  const live = isLive(e);
  const [people, setPeople] = useState(1);
  const [coming, setComing] = useState(false);
  const giving = setup.giving ? api.giving.page(setup.giving) : undefined;
  const included = Object.entries(setup.includes ?? {});

  return (
    <>
      {setup.entry === "OPEN" && (
        <div className="rounded-2xl border border-line bg-surface p-5">
          <p className="font-display text-2xl font-semibold">Free, no ticket needed</p>
          <p className="mt-1 text-sm text-ink-3">Anyone can come. {setup.checkinQr && "Scan the check-in code at the entrance so the organiser can count everyone."}</p>

          {setup.rsvp && !live && (
            coming ? (
              <div className="mt-4 rounded-xl bg-leaf-soft p-3 text-sm">
                <p className="flex items-center gap-1.5 font-semibold text-leaf"><Check size={16} /> You&rsquo;re coming, {people} {people === 1 ? "person" : "people"}</p>
                <p className="mt-1 text-ink-2">We&rsquo;ll remind you the day before. <button className="font-semibold text-kafue" onClick={() => setComing(false)}>Change</button></p>
              </div>
            ) : (
              <div className="mt-4">
                <p className="text-sm font-medium">How many people are coming, including you?</p>
                <div className="mt-2 flex items-center gap-3">
                  <button aria-label="One fewer" onClick={() => setPeople(Math.max(1, people - 1))} className="flex h-10 w-10 items-center justify-center rounded-full border border-line"><Minus size={16} /></button>
                  <span className="w-8 text-center text-lg font-semibold tabular-nums">{people}</span>
                  <button aria-label="One more" onClick={() => setPeople(Math.min(20, people + 1))} className="flex h-10 w-10 items-center justify-center rounded-full border border-line"><Plus size={16} /></button>
                </div>
                <Button className="mt-3 w-full" onClick={() => setComing(true)}>I&rsquo;m coming</Button>
                <p className="mt-2 text-xs text-ink-3">This helps the organiser plan seating{setup.mealPass ? " and food" : ""}. It isn&rsquo;t a ticket.</p>
              </div>
            )
          )}

          {setup.checkinQr && (
            <Button href={`/events/${e.slug}/checkin/`} variant={live ? "primary" : "secondary"} className="mt-3 w-full"><QrCode size={16} /> {live ? "I'm here: check in" : "Check in (opens when the event starts)"}</Button>
          )}
        </div>
      )}

      {included.length > 0 && (
        <div className="rounded-2xl border border-line bg-surface p-5 text-sm">
          <p className="font-semibold">Included with your ticket</p>
          <ul className="mt-2 space-y-1.5">
            {included.map(([ticket, inc]) => (
              <li key={ticket} className="flex justify-between gap-3">
                <span className="text-ink-2">{ticket}</span>
                <span className="text-right font-medium">{Object.entries(inc).map(([k, n]) => `${setup.allowances?.find((a) => a.key === k)?.label ?? k} ×${n}`).join(", ")}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-3">Show the same ticket QR code at the gate, then at the food or bar point. Each extra can be used once.</p>
        </div>
      )}

      {setup.menu && (
        <Link href={`/events/${e.slug}/menu/`} className="flex items-center gap-3 rounded-2xl border border-line bg-surface p-5 hover:border-kafue">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-marigold-soft text-[#8a5a00]"><UtensilsCrossed size={20} /></span>
          <span className="min-w-0">
            <span className="block font-semibold">Food, drinks and merchandise</span>
            <span className="block text-sm text-ink-3">Order on your phone, pay the attendant with cash, card or mobile money, and collect with your order code.</span>
          </span>
        </Link>
      )}

      {giving && (
        <Link href={`/give/${giving.slug}/`} className={cx("flex items-center gap-3 rounded-2xl border border-line bg-surface p-5 hover:border-kafue")}>
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-kafue-soft text-kafue"><HandHeart size={20} /></span>
          <span className="min-w-0">
            <span className="block font-semibold">{giving.kind === "FUNERAL" ? "Contribute to the family" : "Give: tithes and offerings"}</span>
            <span className="block text-sm text-ink-3">{giving.funds.map((f) => f.label).join(", ")}. MTN, Airtel, Zamtel or card.</span>
          </span>
        </Link>
      )}
    </>
  );
}
