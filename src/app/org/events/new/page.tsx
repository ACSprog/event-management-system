"use client";

import { useState } from "react";
import { Check, Plus, Sparkles, Trash2 } from "lucide-react";
import { Poster } from "@/components/poster";
import { Badge, Button, Card, Checkbox, cx, Field, Input, PageHeader, Select, Textarea, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

const profiles: Record<string, { cat: string; modules: string[] }> = {
  "Concert or festival": { cat: "Music", modules: ["Performers and line-up", "Stages", "Gates and zones", "VIP areas"] },
  "Conference or seminar": { cat: "Conference", modules: ["Speakers", "Sessions and tracks", "Delegate badges", "Exhibitor booths"] },
  "Wedding or private party": { cat: "Wedding", modules: ["Invitations and RSVP", "Guest categories", "Table plan", "Meal choices"] },
  "Church gathering": { cat: "Church", modules: ["Programme", "Free registration", "Meal packs", "Livestream"] },
  "Sports match or tournament": { cat: "Sports", modules: ["Teams and fixtures", "Stands and seating", "Home and away sections"] },
  "Workshop or course": { cat: "Workshop", modules: ["Sessions", "Materials", "Attendance", "Certificates"] },
  "Exhibition or trade fair": { cat: "Exhibition", modules: ["Exhibitors", "Booths and floor plan", "Visitor registration"] },
  "Fundraiser or gala": { cat: "Charity", modules: ["Donations", "Tables", "Auction lots", "Sponsors"] },
};
const steps = ["Basics", "Date and place", "Tickets", "Policies", "Review"];

export default function NewEvent() {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState("Concert or festival");
  const [f, setF] = useState({ title: "Copperbelt Nights: Kitwe", subtitle: "", description: "", format: "Physical", start: "2027-02-27T18:00", end: "2027-02-28T01:00", venue: "Garden Court Kitwe Ballroom", stream: "YouTube", recurring: "Does not repeat", visibility: "Public", approval: true, refund: "Refunds until 7 days before", terms: "" });
  const [tickets, setTickets] = useState([{ name: "Standard", price: 200, qty: 600 }, { name: "VIP", price: 600, qty: 150 }]);
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const p = profiles[profile];
  const next = () => {
    if (step === 0 && f.title.trim().length < 4) return setErr("Give the event a name of at least 4 characters.");
    if (step === 1 && f.end <= f.start) return setErr("The end time must be after the start time.");
    if (step === 2 && tickets.some((t) => !t.name || t.qty < 1)) return setErr("Every ticket type needs a name and a quantity.");
    setErr("");
    setStep(step + 1);
  };
  return (
    <>
      <PageHeader title="Create an event" back={{ href: "/org/events/", label: "Events" }} actions={<Button variant="secondary" onClick={() => toast("Draft saved")}>Save draft</Button>} />
      <ol className="mb-6 flex gap-2">
        {steps.map((s, i) => (
          <li key={s} className="flex-1">
            <button onClick={() => i < step && setStep(i)} className="w-full text-left">
              <div className={cx("h-1.5 rounded-full", i <= step ? "bg-kafue" : "bg-line")} />
              <p className={cx("mt-2 text-xs font-medium", i === step ? "text-ink" : "text-ink-3")}>{s}</p>
            </button>
          </li>
        ))}
      </ol>
      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <Card className="space-y-5">
          {step === 0 && (<>
            <Field label="What kind of event is it?" hint="This switches on the right tools. You can add more later.">
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.keys(profiles).map((k) => (
                  <button key={k} onClick={() => setProfile(k)} className={cx("rounded-lg border-2 px-3 py-2.5 text-left text-sm font-medium", profile === k ? "border-kafue bg-kafue-soft" : "border-line hover:border-ink-3")}>{k}</button>
                ))}
              </div>
            </Field>
            <div className="rounded-lg bg-surface-2 p-3 text-sm"><span className="font-semibold">Included for this type: </span>{p.modules.join(", ")}</div>
            <Field label="Event name"><Input value={f.title} onChange={set("title")} /></Field>
            <Field label="Short tagline" hint="One line under the title"><Input value={f.subtitle} onChange={set("subtitle")} placeholder="e.g. The Copperbelt's biggest night out" /></Field>
            <Field label="Description">
              <Textarea rows={5} value={f.description} onChange={set("description")} placeholder="What will people experience? What's included?" />
            </Field>
            <Button variant="secondary" size="sm" onClick={() => setF({ ...f, description: "Copperbelt Nights brings Zambia's top acts to Kitwe for one night only. Doors open at 18:00 with a DJ warm-up, live sets from 20:00 and a VIP lounge with table service. Secure parking on site and free shuttles from Kitwe CBD." })}><Sparkles size={14} /> Write it for me</Button>
            <Field label="Cover image" hint="JPG or PNG, at least 1600 × 800. We create a poster automatically if you skip this.">
              <div className="rounded-lg border-2 border-dashed border-line p-6 text-center text-sm text-ink-3">Drag an image here or <span className="font-semibold text-kafue">browse</span></div>
            </Field>
          </>)}
          {step === 1 && (<>
            <Field label="Format">
              <div className="flex gap-2">{["Physical", "Virtual", "Hybrid"].map((x) => <button key={x} onClick={() => setF({ ...f, format: x })} className={cx("flex-1 rounded-lg border-2 py-2 text-sm font-semibold", f.format === x ? "border-kafue bg-kafue-soft" : "border-line")}>{x}</button>)}</div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Starts"><Input type="datetime-local" value={f.start} onChange={set("start")} /></Field>
              <Field label="Ends" error={err && step === 1 ? err : undefined}><Input type="datetime-local" value={f.end} onChange={set("end")} /></Field>
              <Field label="Time zone"><Select options={["Africa/Lusaka (CAT, UTC+2)", "Africa/Johannesburg (SAST)", "Europe/London"]} /></Field>
              <Field label="Repeats"><Select value={f.recurring} onChange={set("recurring")} options={["Does not repeat", "Every week", "Every month", "Custom dates"]} /></Field>
            </div>
            {f.format !== "Virtual" && <Field label="Venue" hint="From your venues, or request a booking from the venue directory"><Select value={f.venue} onChange={set("venue")} options={api.venues.list().map((v) => v.name)} /></Field>}
            {f.format !== "Physical" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Streaming"><Select value={f.stream} onChange={set("stream")} options={["YouTube", "Facebook Live", "Zoom (registered attendees)", "Other link"]} /></Field>
                <Field label="Stream link"><Input placeholder="https://" /></Field>
                <p className="text-xs text-ink-3 sm:col-span-2">Public stream links can be copied and shared. Use Zoom with registration if you need each viewer to have their own link.</p>
              </div>
            )}
          </>)}
          {step === 2 && (<>
            <div className="space-y-3">
              {tickets.map((t, i) => (
                <div key={i} className="grid items-end gap-3 rounded-lg border border-line p-3 sm:grid-cols-[1.5fr_1fr_1fr_auto]">
                  <Field label="Ticket name"><Input value={t.name} onChange={(e) => setTickets(tickets.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} /></Field>
                  <Field label="Price (K)"><Input inputMode="numeric" value={t.price} onChange={(e) => setTickets(tickets.map((x, j) => (j === i ? { ...x, price: Number(e.target.value.replace(/\D/g, "")) } : x)))} /></Field>
                  <Field label="Quantity"><Input inputMode="numeric" value={t.qty} onChange={(e) => setTickets(tickets.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value.replace(/\D/g, "")) } : x)))} /></Field>
                  <Button variant="ghost" aria-label="Remove ticket type" onClick={() => setTickets(tickets.filter((_, j) => j !== i))}><Trash2 size={16} /></Button>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {["Early bird", "Student", "Group of 5", "VVIP table", "Complimentary"].map((n) => <Button key={n} size="sm" variant="secondary" onClick={() => setTickets([...tickets, { name: n, price: 0, qty: 50 }])}><Plus size={14} /> {n}</Button>)}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Seating"><Select options={["General admission", "Reserved seats", "Tables"]} /></Field>
              <Field label="Max per order"><Input defaultValue="6" /></Field>
              <Field label="Who pays the booking fee?"><Select options={["Buyer pays", "We absorb it"]} /></Field>
            </div>
            {err && <p className="text-sm text-hibiscus">{err}</p>}
          </>)}
          {step === 3 && (<>
            <Field label="Who can see it?"><Select value={f.visibility} onChange={set("visibility")} options={["Public, listed in discovery", "Unlisted, link only", "Private, invited guests only"]} /></Field>
            <Field label="Refund policy"><Select value={f.refund} onChange={set("refund")} options={["Refunds until 7 days before", "Refunds until 48 hours before", "No refunds, transfers allowed", "No refunds or transfers"]} /></Field>
            <Field label="Terms shown at checkout"><Textarea value={f.terms} onChange={set("terms")} placeholder="Age limits, prohibited items, recording policy…" /></Field>
            <Checkbox checked={f.approval} onChange={(v) => setF({ ...f, approval: v })} label="Send to a manager for approval before it goes live" />
          </>)}
          {step === 4 && (
            <div className="space-y-4 text-sm">
              <dl className="grid gap-3 sm:grid-cols-2">
                {[["Type", profile], ["Name", f.title], ["Format", f.format], ["When", `${f.start.replace("T", " ")} to ${f.end.replace("T", " ")}`], ["Venue", f.format === "Virtual" ? f.stream : f.venue], ["Visibility", f.visibility], ["Refunds", f.refund], ["Approval", f.approval ? "Manager approves before publishing" : "Publish immediately"]].map(([k, v]) => <div key={k}><dt className="text-ink-3">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
              </dl>
              <ul className="divide-y divide-line rounded-lg border border-line">{tickets.map((t) => <li key={t.name} className="flex justify-between px-4 py-2"><span>{t.name}, {t.qty}</span><span className="font-semibold">{t.price ? kwacha(t.price) : "Free"}</span></li>)}</ul>
              <p className="text-ink-3">Potential gross if all tickets sell: <strong className="text-ink">{kwacha(tickets.reduce((a, t) => a + t.price * t.qty, 0))}</strong></p>
            </div>
          )}
          {err && step !== 1 && step !== 2 && <p className="text-sm text-hibiscus">{err}</p>}
          <div className="flex justify-between border-t border-line pt-4">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
            {step < 4 ? <Button onClick={next}>Continue</Button> : <Button onClick={() => toast(f.approval ? "Sent for approval. Your manager has been notified." : "Event published")}><Check size={16} /> {f.approval ? "Submit for approval" : "Publish event"}</Button>}
          </div>
        </Card>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-ink-3">Preview</p>
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            <Poster event={{ title: f.title || "Your event", category: p.cat as never, palette: ["#172033", "#F4A630"], start: f.start + ":00+02:00", city: f.format === "Virtual" ? "Online" : "Kitwe" }} className="aspect-[4/3]" />
            <div className="p-4 text-sm">
              <p className="font-semibold">{f.title}</p>
              <p className="text-ink-3">{f.format === "Virtual" ? "Online" : f.venue}</p>
              <p className="mt-2 font-semibold">From {kwacha(Math.min(...tickets.map((t) => t.price)))}</p>
            </div>
          </div>
          <Badge tone="grey">Draft, not visible to the public</Badge>
        </div>
      </div>
    </>
  );
}
