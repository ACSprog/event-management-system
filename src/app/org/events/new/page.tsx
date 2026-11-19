"use client";

import { useRef, useState } from "react";
import { Check, ChevronDown, ImagePlus, Lock, Plus, Sparkles, Trash2, X } from "lucide-react";
import { Poster } from "@/components/poster";
import { NoEarlyPayouts } from "@/components/settlement";
import { SelectOther } from "@/components/select-other";
import { ProgrammeEditor, programmeIssues } from "@/components/programme";
import { Badge, Button, Card, Checkbox, cx, Field, Input, PageHeader, Select, Textarea, useToast } from "@/components/ui";
import { api, type ProgrammeItem, bookingFee, feePayerLabel, planFee, type FeePayer } from "@/lib/api";
import { kwacha } from "@/lib/brand";
import { PhoneInput } from "@/components/phone-input";
import { countryOf, formatPhone, parsePhone } from "@/lib/phone";
import { LocationPicker } from "@/components/location-picker";
import type { EventLocation } from "@/lib/location";

const profiles: Record<string, { cat: string; modules: string[] }> = {
  "Concert or festival": { cat: "Music", modules: ["Performers and line-up", "Stages", "Gates and zones", "VIP areas"] },
  "Conference or seminar": { cat: "Conference", modules: ["Speakers", "Sessions and tracks", "Delegate badges", "Exhibitor booths"] },
  "Wedding or private party": { cat: "Wedding", modules: ["Invitations and RSVP", "Guest categories", "Table plan", "Meal choices"] },
  "Church gathering": { cat: "Church", modules: ["Programme", "Free registration", "Meal packs", "Livestream"] },
  "Sports match or tournament": { cat: "Sports", modules: ["Teams and fixtures", "Stands and seating", "Home and away sections"] },
  "Workshop or course": { cat: "Workshop", modules: ["Sessions", "Materials", "Attendance", "Certificates"] },
  "Exhibition or trade fair": { cat: "Exhibition", modules: ["Exhibitors", "Booths and floor plan", "Visitor registration"] },
  "Fundraiser or gala": { cat: "Charity", modules: ["Donations", "Tables", "Auction lots", "Sponsors"] },
  "Something else": { cat: "Other", modules: [] },
};
const allModules = [...new Set(Object.values(profiles).flatMap((p) => p.modules))].sort();
const listUnder = ["Music", "Conference", "Wedding", "Sports", "Church", "Workshop", "Exhibition", "Charity", "Comedy", "Education"];
const steps = ["Basics", "Date and place", "Programme", "Tickets", "Fees and payouts", "Policies", "Review"];

export default function NewEvent() {
  const toast = useToast();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState("Concert or festival");
  const [f, setF] = useState({ title: "Copperbelt Nights: Kitwe", subtitle: "", description: "", format: "Physical", start: "2027-02-27T18:00", end: "2027-02-28T01:00", venue: "Garden Court Kitwe Ballroom", stream: "YouTube", recurring: "Does not repeat", visibility: "Public", approval: true, refund: "Refunds until 7 days before", terms: "" });
  const [tickets, setTickets] = useState([{ name: "Standard", price: 200, qty: 600 }, { name: "VIP", price: 600, qty: 150 }]);
  const [moreFor, setMoreFor] = useState<number | null>(null);
  const [gallery, setGallery] = useState<{ url: string; name: string }[]>([]);
  const galleryInput = useRef<HTMLInputElement>(null);
  const [location, setLocation] = useState<EventLocation | null>({ lat: -12.8024, lng: 28.2132, name: "Garden Court Kitwe Ballroom", area: "Kitwe", source: "SEARCH", directions: "Freedom Avenue, next to the Kitwe Civic Centre. Parking at the back.", privateHome: false });
  const [sessions, setSessions] = useState<{ title: string; start: string; venue: string }[]>([]);
  const [contact, setContact] = useState({ name: "Chanda Mulenga", phone: "0966 120 448", email: "events@zedlive.example", whatsapp: "0966 120 448" });
  const [accent, setAccent] = useState("#172033");
  const [err, setErr] = useState("");
  const [other, setOther] = useState({ name: "", listUnder: "Conference", modules: ["Programme", "Sessions"] as string[] });
  const [programme, setProgramme] = useState<ProgrammeItem[]>([]);
  const [feePayer, setFeePayer] = useState<FeePayer>("ORGANISER_ABSORBS");
  const plan = api.billing.subscription().plan;
  const paid = tickets.filter((t) => t.price > 0);
  const sample = paid[0];
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const p = profiles[profile];
  const next = () => {
    if (step === 0 && profile === "Something else" && other.name.trim().length < 3) return setErr("Say what kind of event it is, e.g. Graduation ceremony or Car show.");
    if (step === 0 && f.title.trim().length < 4) return setErr("Give the event a name of at least 4 characters.");
    if (step === 1 && f.end <= f.start) return setErr("The end time must be after the start time.");
    if (step === 1 && f.format !== "Virtual" && !location) return setErr("Confirm where the event is: choose \"Yes, use this place\" under the map.");
    if (step === 2 && programmeIssues(programme).length) return setErr("Fix the programme items marked above, or remove them. You can also leave the programme empty and add it later.");
    if (step === 3 && tickets.some((t) => !t.name || t.qty < 1)) return setErr("Every ticket type needs a name and a quantity.");
    setErr("");
    setStep(step + 1);
  };
  return (
    <>
      <PageHeader title="Create an event" back={{ href: "/org/events/", label: "Events" }} actions={<Button variant="secondary" onClick={() => toast("Draft saved")}>Save draft</Button>} />
      <ol className="mb-6 flex gap-2">
        {steps.map((s, i) => (
          <li key={s} className="min-w-0 flex-1">
            <button onClick={() => i < step && setStep(i)} className="w-full text-left">
              <div className={cx("h-1.5 rounded-full", i <= step ? "bg-kafue" : "bg-line")} />
              {/* Phones show only the current step name under the bars; tablets and up show all. */}
              <p className={cx("mt-2 truncate text-xs font-medium", i === step ? "text-ink" : "hidden text-ink-3 sm:block")}>{s}</p>
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
            {profile === "Something else" ? (
              <div className="space-y-4 rounded-lg border border-line p-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="What kind of event is it?" error={err && !other.name.trim() ? err : undefined}><Input value={other.name} onChange={(e) => { setOther({ ...other, name: e.target.value }); setErr(""); }} placeholder="e.g. Graduation ceremony, Car show" /></Field>
                  <Field label="Show it under" hint="The category buyers browse in discovery"><Select value={other.listUnder} onChange={(e) => setOther({ ...other, listUnder: e.target.value })} options={listUnder} /></Field>
                </div>
                <div>
                  <p className="text-sm font-medium">Which tools do you need?</p>
                  <p className="mb-2 text-xs text-ink-3">Pick any. Ticketing, check-in and payouts are always included.</p>
                  <div className="grid gap-x-4 gap-y-2 sm:grid-cols-3">
                    {allModules.map((m) => <Checkbox key={m} checked={other.modules.includes(m)} onChange={(v) => setOther({ ...other, modules: v ? [...other.modules, m] : other.modules.filter((x) => x !== m) })} label={m} />)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="rounded-lg bg-surface-2 p-3 text-sm"><span className="font-semibold">Included for this type: </span>{p.modules.join(", ")}</div>
            )}
            <Field label="Event name"><Input value={f.title} onChange={set("title")} /></Field>
            <Field label="Short tagline" hint="One line under the title"><Input value={f.subtitle} onChange={set("subtitle")} placeholder="e.g. The Copperbelt's biggest night out" /></Field>
            <Field label="Description">
              <Textarea rows={5} value={f.description} onChange={set("description")} placeholder="What will people experience? What's included?" />
            </Field>
            <Button variant="secondary" size="sm" onClick={() => setF({ ...f, description: "Copperbelt Nights brings Zambia's top acts to Kitwe for one night only. Doors open at 18:00 with a DJ warm-up, live sets from 20:00 and a VIP lounge with table service. Secure parking on site and free shuttles from Kitwe CBD." })}><Sparkles size={14} /> Write it for me</Button>
            <Field label="Cover image" hint="JPG or PNG, at least 1600 × 800. We create a poster automatically if you skip this.">
              <div className="rounded-lg border-2 border-dashed border-line p-6 text-center text-sm text-ink-3">Drag an image here or <span className="font-semibold text-kafue">browse</span></div>
            </Field>
            <div>
              <p className="text-sm font-medium">Photo gallery <span className="font-normal text-ink-3">(optional, up to 12)</span></p>
              <p className="mb-2 text-xs text-ink-3">Shown on the event page: past editions, the venue, performers.</p>
              <div className="flex flex-wrap gap-2">
                {gallery.map((g, i) => (
                  <div key={g.url} className="relative h-20 w-28 overflow-hidden rounded-lg border border-line">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.url} alt={g.name} className="h-full w-full object-cover" />
                    <button aria-label={`Remove ${g.name}`} onClick={() => { URL.revokeObjectURL(g.url); setGallery(gallery.filter((_, j) => j !== i)); }} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"><X size={12} /></button>
                  </div>
                ))}
                {gallery.length < 12 && <button onClick={() => galleryInput.current?.click()} className="flex h-20 w-28 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line text-xs text-ink-3 hover:border-kafue"><ImagePlus size={18} /> Add photos</button>}
                <input ref={galleryInput} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { const fs = [...(e.target.files ?? [])].filter((f) => f.type.startsWith("image/")); setGallery([...gallery, ...fs.map((f) => ({ url: URL.createObjectURL(f), name: f.name }))].slice(0, 12)); e.target.value = ""; }} />
              </div>
            </div>
          </>)}
          {step === 1 && (<>
            <Field label="Format">
              <div className="flex gap-2">{["Physical", "Virtual", "Hybrid"].map((x) => <button key={x} onClick={() => setF({ ...f, format: x })} className={cx("flex-1 rounded-lg border-2 py-2 text-sm font-semibold", f.format === x ? "border-kafue bg-kafue-soft" : "border-line")}>{x}</button>)}</div>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Starts"><Input type="datetime-local" value={f.start} onChange={set("start")} /></Field>
              <Field label="Ends" error={err && step === 1 && f.end <= f.start ? err : undefined}><Input type="datetime-local" value={f.end} onChange={set("end")} /></Field>
              <Field label="Time zone"><Select options={["Africa/Lusaka (CAT, UTC+2)", "Africa/Johannesburg (SAST)", "Europe/London"]} /></Field>
              <Field label="Repeats"><Select value={f.recurring} onChange={set("recurring")} options={["Does not repeat", "Every week", "Every month", "Custom dates"]} /></Field>
            </div>
            {f.format !== "Virtual" && (
              <div>
                <p className="mb-1 text-sm font-medium">Where is it?</p>
                <p className="mb-3 text-xs text-ink-3">Paste a map link, drop a pin, search places used on Eventra, use where you are, or type a plus code. You contact and book the venue yourself.</p>
                <LocationPicker value={location} onChange={(l) => { setLocation(l); setF({ ...f, venue: l?.name ?? "" }); if (l) setErr(""); }} />
                {err && step === 1 && f.end > f.start && <p className="mt-2 text-sm text-hibiscus">{err}</p>}
              </div>
            )}
            {f.format !== "Physical" && (
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Streaming"><Select value={f.stream} onChange={set("stream")} options={["YouTube", "Facebook Live", "Zoom (registered attendees)", "Other link"]} /></Field>
                <Field label="Stream link"><Input placeholder="https://" /></Field>
                <p className="text-xs text-ink-3 sm:col-span-2">Public stream links can be copied and shared. Use Zoom with registration if you need each viewer to have their own link.</p>
              </div>
            )}
            <div className="rounded-lg border border-line p-4">
              <p className="text-sm font-medium">More sessions or venues</p>
              <p className="text-xs text-ink-3">For multi-day events, separate activities (a workshop, an after-party) or a second venue.</p>
              {sessions.map((x, i) => (
                <div key={i} className="mt-3 grid items-end gap-3 sm:grid-cols-[1.3fr_1fr_1.3fr_auto]">
                  <Field label="Session"><Input value={x.title} onChange={(e) => setSessions(sessions.map((y, j) => (j === i ? { ...y, title: e.target.value } : y)))} /></Field>
                  <Field label="Starts"><Input type="datetime-local" value={x.start} onChange={(e) => setSessions(sessions.map((y, j) => (j === i ? { ...y, start: e.target.value } : y)))} /></Field>
                  <Field label="Venue"><Select value={x.venue} onChange={(e) => setSessions(sessions.map((y, j) => (j === i ? { ...y, venue: e.target.value } : y)))} options={["Same as main event", ...api.venues.list().map((v) => v.name), "Another venue"]} /></Field>
                  {x.venue === "Another venue" && <div className="sm:col-span-4"><Field label="Venue name and address"><Input placeholder="e.g. Kalingalinga Grounds, Lusaka" /></Field></div>}
                  <Button variant="ghost" aria-label="Remove session" onClick={() => setSessions(sessions.filter((_, j) => j !== i))}><Trash2 size={16} /></Button>
                </div>
              ))}
              <Button size="sm" variant="secondary" className="mt-3" onClick={() => setSessions([...sessions, { title: sessions.length ? `Session ${sessions.length + 2}` : "After-party", start: f.end, venue: "Same as main event" }])}><Plus size={14} /> Add a session</Button>
            </div>
          </>)}
          {step === 2 && (<>
            <div>
              <p className="font-semibold">Programme</p>
              <p className="text-sm text-ink-3">The running order guests see on the event page: times, what happens, who and where. Optional now; you can add or change it any time, and ticket holders can be told about changes.</p>
            </div>
            <ProgrammeEditor items={programme} onChange={(x) => { setProgramme(x); setErr(""); }} defaultDay={new Date(f.start).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })} templates={api.events.programmeTemplates()} templateFor={profile} />
            {err && <p className="text-sm text-hibiscus">{err}</p>}
          </>)}
          {step === 3 && (<>
            <div className="space-y-3">
              {tickets.map((t, i) => (
                <div key={i} className="grid items-end gap-3 rounded-lg border border-line p-3 sm:grid-cols-[1.5fr_1fr_1fr_auto]">
                  <Field label="Ticket name"><Input value={t.name} onChange={(e) => setTickets(tickets.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} /></Field>
                  <Field label="Price (K)"><Input inputMode="numeric" value={t.price} onChange={(e) => setTickets(tickets.map((x, j) => (j === i ? { ...x, price: Number(e.target.value.replace(/\D/g, "")) } : x)))} /></Field>
                  <Field label="Quantity"><Input inputMode="numeric" value={t.qty} onChange={(e) => setTickets(tickets.map((x, j) => (j === i ? { ...x, qty: Number(e.target.value.replace(/\D/g, "")) } : x)))} /></Field>
                  <div className="flex">
                    <Button variant="ghost" aria-label={`More options for ${t.name}`} aria-expanded={moreFor === i} onClick={() => setMoreFor(moreFor === i ? null : i)}><ChevronDown size={16} className={cx("transition-transform", moreFor === i && "rotate-180")} /></Button>
                    <Button variant="ghost" aria-label="Remove ticket type" onClick={() => setTickets(tickets.filter((_, j) => j !== i))}><Trash2 size={16} /></Button>
                  </div>
                  {moreFor === i && (
                    <div className="grid gap-3 border-t border-line pt-3 sm:col-span-4 sm:grid-cols-3">
                      <Field label="Description"><Input placeholder="What's included" /></Field>
                      <Field label="Sales start"><Input type="datetime-local" defaultValue="2026-12-01T09:00" /></Field>
                      <Field label="Sales end"><Input type="datetime-local" defaultValue="2027-02-27T12:00" /></Field>
                      <Field label="Tax"><Select options={["VAT 16% included in price", "VAT 16% added at checkout", "No tax"]} /></Field>
                      <SelectOther label="Refunds" options={["Use the event's policy", "Until 7 days before", "Until 48 hours before", "No refunds, transfers allowed", "No refunds or transfers"]} other="Write my own" prompt="Refund rule for this ticket" placeholder="e.g. Refunds until 14 days before, 50% after that" />
                      <SelectOther label="Who can buy" options={["Anyone", "Members only", "With an invite code", "Students (ID at the gate)", "Approval needed"]} other="Other condition" prompt="Who can buy this ticket?" placeholder="e.g. Staff of sponsor companies, ID checked at the gate" />
                      <Field label="Max per order"><Input defaultValue="6" inputMode="numeric" /></Field>
                      <Field label="Currency"><Select options={["ZMW (K)", "USD ($)"]} /></Field>
                    </div>
                  )}
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              {["Early bird", "Student", "Group of 5", "VVIP table", "Complimentary"].map((n) => <Button key={n} size="sm" variant="secondary" onClick={() => setTickets([...tickets, { name: n, price: 0, qty: 50 }])}><Plus size={14} /> {n}</Button>)}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectOther label="Seating" options={["General admission", "Reserved seats", "Tables"]} other="Mixed or other layout" prompt="Describe the layout" placeholder="e.g. Standing at the front, tables at the back" />
              <Field label="Max per order"><Input defaultValue="6" /></Field>
            </div>
            {err && <p className="text-sm text-hibiscus">{err}</p>}
          </>)}
          {step === 4 && (<>
            <div>
              <p className="text-sm font-medium">How EMS earns on this event</p>
              <div className="mt-2 rounded-lg border border-line p-4">
                {paid.length ? (<>
                  <p className="font-semibold">Covered by your {plan} plan: {kwacha(planFee(plan, sample.price))} on a {kwacha(sample.price)} ticket</p>
                  <p className="text-sm text-ink-3">3% + K2 on each paid ticket. Free tickets and complimentary tickets are never charged.{profile === "Wedding or private party" ? " Your subscription also covers private events, so you never need a one-off event licence." : ""}</p>
                </>) : (<>
                  <p className="font-semibold">Free event: no charge</p>
                  <p className="text-sm text-ink-3">All tickets are free, so EMS charges nothing.</p>
                </>)}
              </div>
              <p className="mt-2 text-xs text-ink-3">Want EMS to co-promote or co-fund this event for a share of sales? Partnerships are agreed with EMS first. <button className="font-semibold text-kafue" onClick={() => toast("Partnership request sent. EMS will contact you within 2 business days.")}>Ask about a partnership</button></p>
            </div>
            <div>
              <p className="text-sm font-medium">Where ticket money goes</p>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <div className="rounded-lg border-2 border-kafue bg-kafue-soft p-3 text-sm">
                  <p className="font-semibold">Collected by EMS, paid to you after the event</p>
                  <p className="text-ink-2">Buyers pay EMS through a licensed payment partner. You get one payment after the event.</p>
                </div>
                <div className="rounded-lg border-2 border-line p-3 text-sm text-ink-3" aria-disabled="true">
                  <p className="flex items-center gap-1.5 font-semibold"><Lock size={13} /> Straight into your own merchant account</p>
                  <p>Available by contract only (Enterprise). <button className="font-semibold text-kafue" onClick={() => toast("EMS sales will contact you about a contract")}>Ask EMS</button></p>
                </div>
              </div>
            </div>
            {paid.length > 0 && (
              <div>
                <p className="text-sm font-medium">Who pays the EMS fee?</p>
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  {(["ORGANISER_ABSORBS", "BUYER_PAYS"] as FeePayer[]).map((k) => {
                    const fee = k === "BUYER_PAYS" ? bookingFee(sample.price) : planFee(plan, sample.price);
                    return (
                      <button key={k} onClick={() => setFeePayer(k)} aria-pressed={feePayer === k} className={cx("rounded-lg border-2 p-3 text-left text-sm", feePayer === k ? "border-kafue bg-kafue-soft" : "border-line hover:border-ink-3")}>
                        <p className="font-semibold">{k === "ORGANISER_ABSORBS" ? "We absorb it" : "Buyer pays a booking fee"}</p>
                        <p className="mt-1 text-ink-2">{sample.name}: buyer pays <strong>{kwacha(sample.price + (k === "BUYER_PAYS" ? fee : 0))}</strong>, you receive <strong>{kwacha(sample.price - (k === "ORGANISER_ABSORBS" ? fee : 0))}</strong></p>
                      </button>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-ink-3">Buyers always see the full price, including any booking fee, before they pay. Payment provider charges are passed on at cost and shown on your statement.</p>
              </div>
            )}
            <NoEarlyPayouts className="rounded-lg bg-surface-2 p-3" />
            <p className="text-xs text-ink-3">These terms are fixed when you publish. Later price changes don&rsquo;t affect this event.</p>
          </>)}
          {step === 5 && (<>
            <Field label="Who can see it?"><Select value={f.visibility} onChange={set("visibility")} options={["Public, listed in discovery", "Members only (Insider and Gold)", "Unlisted, link only", "Private, invited guests only"]} /></Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Contact name"><Input value={contact.name} onChange={(e) => setContact({ ...contact, name: e.target.value })} /></Field>
              <Field label="Contact email"><Input type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} /></Field>
              <Field label="Phone"><PhoneInput value={parsePhone(contact.phone)} onChange={(p) => setContact({ ...contact, phone: p.country === "ZM" ? p.number : `+${countryOf(p.country).dial} ${p.number}` })} /></Field>
              <Field label="WhatsApp"><PhoneInput value={parsePhone(contact.whatsapp)} onChange={(p) => setContact({ ...contact, whatsapp: p.country === "ZM" ? p.number : `+${countryOf(p.country).dial} ${p.number}` })} /></Field>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Event page colour</p>
              <div className="flex gap-2">{["#172033", "#0B7A75", "#5B2A86", "#D62F45", "#1F9D55", "#C77C3A"].map((c) => <button key={c} onClick={() => setAccent(c)} aria-label={`Use ${c}`} aria-pressed={accent === c} className={cx("h-9 w-9 rounded-full ring-offset-2 ring-offset-surface", accent === c && "ring-2 ring-kafue")} style={{ background: c }} />)}</div>
              <p className="mt-1 text-xs text-ink-3">Used for the poster, buttons and headings on this event&rsquo;s page. Text contrast is checked automatically.</p>
            </div>
            <SelectOther label="Refund policy" options={["Refunds until 7 days before", "Refunds until 48 hours before", "No refunds, transfers allowed", "No refunds or transfers"]} other="Write my own policy" prompt="Your refund policy" multiline placeholder="Shown to buyers before they pay" onChange={(c, t) => setF({ ...f, refund: c === "Write my own policy" ? t || "Own policy" : c })} />
            <Field label="Terms shown at checkout"><Textarea value={f.terms} onChange={set("terms")} placeholder="Age limits, prohibited items, recording policy…" /></Field>
            <Checkbox checked={f.approval} onChange={(v) => setF({ ...f, approval: v })} label="Send to a manager for approval before it goes live" />
          </>)}
          {step === 6 && (
            <div className="space-y-4 text-sm">
              <dl className="grid gap-3 sm:grid-cols-2">
                {[["Type", profile === "Something else" ? `${other.name || "Other"} (listed under ${other.listUnder})` : profile], ...(profile === "Something else" ? [["Tools", other.modules.join(", ") || "Ticketing and check-in only"]] : []), ["Name", f.title], ["Format", f.format], ["Extra sessions", sessions.length ? sessions.map((x) => x.title).join(", ") : "None"], ["Programme", programme.length ? `${programme.length} items over ${new Set(programme.map((x) => x.day)).size} day${new Set(programme.map((x) => x.day)).size > 1 ? "s" : ""}` : "None yet, add it later"], ["Contact", `${contact.name}, ${formatPhone(parsePhone(contact.phone))}`], ["Gallery", `${gallery.length} photo${gallery.length === 1 ? "" : "s"}`], ["When", `${f.start.replace("T", " ")} to ${f.end.replace("T", " ")}`], ["Venue", f.format === "Virtual" ? f.stream : location ? `${location.name}, ${location.area}${location.privateHome ? " (private home: exact pin for guests only)" : ""}` : "Not set"], ...(f.format !== "Virtual" && location?.directions ? [["Directions", location.directions]] : []), ["Visibility", f.visibility], ["Refunds", f.refund], ["EMS fee", paid.length ? `Covered by ${plan} plan, 3% + K2 per paid ticket` : "None, free event"], ["Fee paid by", paid.length ? feePayerLabel[feePayer] : "—"], ["Ticket money", "Collected by EMS, paid out once after the event"], ["Approval", f.approval ? "Manager approves before publishing" : "Publish immediately"]].map(([k, v]) => <div key={k}><dt className="text-ink-3">{k}</dt><dd className="font-semibold">{v}</dd></div>)}
              </dl>
              <ul className="divide-y divide-line rounded-lg border border-line">{tickets.map((t) => <li key={t.name} className="flex justify-between px-4 py-2"><span>{t.name}, {t.qty}</span><span className="font-semibold">{t.price ? kwacha(t.price) : "Free"}</span></li>)}</ul>
              <p className="text-ink-3">Potential gross if all tickets sell: <strong className="text-ink">{kwacha(tickets.reduce((a, t) => a + t.price * t.qty, 0))}</strong></p>
            </div>
          )}
          {err && step !== 1 && step !== 2 && step !== 3 && !(step === 0 && profile === "Something else" && !other.name.trim()) && <p className="text-sm text-hibiscus">{err}</p>}
          <div className="flex justify-between border-t border-line pt-4">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>Back</Button>
            {step < 6 ? <Button onClick={next}>Continue</Button> : <Button onClick={() => toast(f.approval ? "Sent for approval. Your manager has been notified." : "Event published")}><Check size={16} /> {f.approval ? "Submit for approval" : "Publish event"}</Button>}
          </div>
        </Card>
        <div className="space-y-3">
          <p className="text-sm font-semibold text-ink-3">Preview</p>
          <div className="overflow-hidden rounded-xl border border-line bg-surface">
            <Poster event={{ title: f.title || "Your event", category: (profile === "Something else" ? other.name || "Other" : p.cat) as never, palette: [accent, "#F4A630"], start: f.start + ":00+02:00", city: f.format === "Virtual" ? "Online" : "Kitwe" }} className="aspect-[4/3]" />
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
