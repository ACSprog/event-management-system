"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bell, Camera, CheckCircle2, ChevronRight, MessageCircle, Phone, ShieldAlert } from "lucide-react";
import { PhoneInput } from "@/components/phone-input";
import { QrScanButton } from "@/components/qr-scan-button";
import { Badge, Button, Field, Textarea, cx } from "@/components/ui";
import { api } from "@/lib/api";
import { ESCALATE_AFTER_SECONDS, flow, statusLabel, type Duty, type RequestStatus } from "@/lib/assist";
import { emptyPhone, phoneError, type Phone as PhoneValue } from "@/lib/phone";

type Sent = { id: string; duty: Duty; where: string; note: string; status: RequestStatus; assignee?: string; chat: { me: boolean; text: string }[] };

/**
 * Request help while an event is on. Opened from the ticket, the event page or
 * a QR code on a pew, table or poster (?spot=Pew 12). Emergency numbers and the
 * organiser's on-site number are always shown first.
 */
export function HelpDesk({ slug }: { slug: string }) {
  const e = api.events.bySlug(slug)!;
  const church = e.category === "Church";
  const duties = api.assist.duties(church);
  const settings = api.assist.settings();
  const staff = api.assist.staff();
  const ticket = api.me.tickets().find((t) => t.eventId === e.id);
  const [spot, setSpot] = useState<string | null>(null);
  const [duty, setDuty] = useState<Duty | null>(null);
  const [where, setWhere] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState("");
  const [phone, setPhone] = useState<PhoneValue>(emptyPhone());
  const [err, setErr] = useState("");
  const [sent, setSent] = useState<Sent | null>(null);
  const [reply, setReply] = useState("");
  const [showInbox, setShowInbox] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const s = p.get("spot");
    // Read after hydration: the page is pre-rendered without the QR code's spot.
    /* eslint-disable react-hooks/set-state-in-effect */
    if (s) { setSpot(s); setWhere(s); }
    else if (ticket) setWhere(`${ticket.type} ticket, ${ticket.gate}`);
    /* eslint-enable react-hooks/set-state-in-effect */
    const t = timers.current;
    return () => t.forEach(clearTimeout);
  }, [ticket]);

  const anonymous = !ticket;
  const send = () => {
    if (!duty) return;
    if (!where.trim()) return setErr("Say where you are, for example \"Table 6\" or \"near the stage\".");
    if (anonymous && phone.number && phoneError(phone)) return setErr(phoneError(phone)!);
    setErr("");
    const id = `RQ-${1035 + Math.floor(note.length % 50)}`;
    const match = staff.find((s) => s.duty === duty.key && s.status === "available") ?? staff.find((s) => s.duty === duty.key);
    setSent({ id, duty, where, note, status: "SUBMITTED", chat: [] });
    const step = (ms: number, status: RequestStatus, assignee?: string) => timers.current.push(setTimeout(() => setSent((x) => (x && x.status !== "CANCELLED" && x.status !== "COMPLETED" ? { ...x, status, assignee: assignee ?? x.assignee } : x)), ms));
    const full = settings.staffed ? match?.name ?? "" : "";
    const name = full ? (full.startsWith("Nurse ") ? full.split(" ").slice(0, 2).join(" ") : full.split(" ")[0]) : "The organiser";
    step(1500, "ASSIGNED", name);
    step(3500, "ACCEPTED");
    timers.current.push(setTimeout(() => setSent((x) => (x && x.status === "ACCEPTED" ? { ...x, chat: [...x.chat, { me: false, text: `Hi, I'm ${name} from the ${duty.team.toLowerCase()} team. I'm on my way. What are you wearing, so I can find you?` }] } : x)), 4500));
  };

  const step = sent ? Math.max(0, flow.indexOf(sent.status)) : 0;

  return (
    <div className="mx-auto max-w-xl px-4 py-6">
      <Link href={`/events/${slug}/`} className="text-sm text-ink-3 hover:text-kafue">‹ {e.title}</Link>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
        <h1 className="text-2xl font-semibold">{church ? "Ask the ushers or protocol" : "Request help"}</h1>
        <Badge tone="green"><span className="h-2 w-2 animate-pulse rounded-full bg-leaf motion-reduce:animate-none" /> Event on now</Badge>
      </div>
      <p className="mt-1 text-xs text-ink-3">Preview: this page shows the event as if it&rsquo;s happening now.</p>

      {/* Emergency first, always */}
      <div className="mt-4 rounded-xl border border-hibiscus/40 bg-hibiscus-soft p-4">
        <p className="flex items-center gap-2 font-semibold text-hibiscus"><ShieldAlert size={18} /> Someone in danger? Call now</p>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-sm">
          {api.assist.emergency().map((x) => <span key={x.label} className="rounded-lg bg-surface px-2 py-2"><span className="block font-semibold">{x.label}</span><span className="text-xs text-ink-3">{x.number}</span></span>)}
        </div>
        <a href={`tel:${settings.hotline.replace(/\s/g, "")}`} className="mt-2 flex items-center justify-between rounded-lg bg-surface px-3 py-2.5 text-sm font-semibold">
          <span className="flex items-center gap-2"><Phone size={16} className="text-kafue" /> Organiser&rsquo;s on-site number</span><span className="tabular-nums">{settings.hotline}</span>
        </a>
        <p className="mt-2 text-xs text-ink-2">This number also works without data. It&rsquo;s printed on your ticket.</p>
      </div>

      {/* Messages from the organiser */}
      <button onClick={() => setShowInbox(!showInbox)} className="mt-4 flex w-full items-center justify-between rounded-xl border border-line bg-surface px-4 py-3 text-left text-sm">
        <span className="flex items-center gap-2 font-semibold"><Bell size={16} className="text-kafue" /> Messages from the organiser</span>
        <span className="flex items-center gap-1 text-ink-3">{api.assist.inbox().length} <ChevronRight size={14} className={cx("transition-transform", showInbox && "rotate-90")} /></span>
      </button>
      {showInbox && (
        <ul className="mt-2 space-y-2">
          {api.assist.inbox().map((m) => (
            <li key={m.at} className={cx("rounded-xl border p-3 text-sm", m.urgent ? "border-marigold bg-marigold-soft" : "border-line bg-surface")}>
              <p className="font-semibold">{m.urgent && "Urgent: "}{m.title} <span className="font-normal text-ink-3">· {m.at}</span></p>
              <p className="text-ink-2">{m.body}</p>
            </li>
          ))}
          <li className="text-xs text-ink-3">You can&rsquo;t reply to announcements. Use the options below to reach the team.</li>
        </ul>
      )}

      {!sent ? (
        <>
          {!settings.staffed && <p className="mt-4 rounded-lg bg-marigold-soft px-3 py-2 text-sm">No team is on duty at this event. Your request goes straight to the organiser by SMS.</p>}
          {!spot && (
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-line bg-surface px-4 py-3">
              <p className="text-sm text-ink-2">Is there a QR code on your table or pew? Scan it so the team knows exactly where you are.</p>
              <QrScanButton size="sm" label="Scan it" />
            </div>
          )}
          <h2 className="mt-6 font-semibold">What do you need?</h2>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {duties.map((d) => (
              <button key={d.key} onClick={() => setDuty(d)} aria-pressed={duty?.key === d.key} className={cx("rounded-xl border-2 p-3 text-left", duty?.key === d.key ? "border-kafue bg-kafue-soft" : "border-line bg-surface hover:border-ink-3")}>
                <span className="block font-semibold">{d.ask}</span>
                <span className="block text-xs text-ink-3">{d.hint}</span>
              </button>
            ))}
          </div>

          {duty && (
            <div className="mt-5 space-y-4 rounded-xl border border-line bg-surface p-4">
              <Field label="Where are you?" hint={spot ? "From the QR code you scanned. Add more if it helps." : ticket ? "From your ticket. Add a landmark if it helps." : "Table, seat, pew, or a landmark"}>
                <input value={where} onChange={(x) => setWhere(x.target.value)} className="w-full rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm focus:border-kafue focus:outline-none" placeholder="e.g. Table 6, near the stage" />
              </Field>
              <Field label="Anything else? (optional)"><Textarea rows={2} value={note} onChange={(x) => setNote(x.target.value)} placeholder={duty.key === "first_aid" ? "What happened? Is the person awake?" : "What do you need?"} /></Field>
              <label className="flex cursor-pointer items-center gap-2 text-sm text-kafue">
                <Camera size={16} /> {photo ? `Photo added: ${photo}` : "Add a photo (optional)"}
                <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={(x) => setPhoto(x.target.files?.[0]?.name ?? "")} />
              </label>
              {anonymous && (
                <Field label="Your mobile number, for updates (optional)" hint="Without it you can still send the request, but the team can't reply to you.">
                  <PhoneInput value={phone} onChange={setPhone} />
                </Field>
              )}
              {duty.sensitive && <p className="text-xs text-ink-3">Only the {duty.team.toLowerCase()} team and the organiser see this request.</p>}
              {err && <p className="text-sm text-hibiscus">{err}</p>}
              <Button className="w-full" size="lg" onClick={send}>Send request</Button>
            </div>
          )}
        </>
      ) : (
        <div className="mt-6 rounded-xl border border-line bg-surface p-4">
          <p className="text-xs text-ink-3">Request {sent.id} · {sent.duty.ask}</p>
          <p className="mt-1 text-lg font-semibold">
            {sent.status === "SUBMITTED" && "Sent. Finding someone for you…"}
            {sent.status === "ASSIGNED" && `${sent.assignee} has your request`}
            {sent.status === "ACCEPTED" && `${sent.assignee} is on the way`}
            {sent.status === "IN_PROGRESS" && `${sent.assignee} is with you`}
            {sent.status === "COMPLETED" && "Sorted. Thank you!"}
            {sent.status === "CANCELLED" && "Request cancelled"}
          </p>
          {sent.status !== "CANCELLED" && (
            <ol className="mt-4 flex items-center gap-1" aria-label="Progress">
              {flow.map((s, i) => (
                <li key={s} className="flex flex-1 flex-col items-center gap-1 text-center">
                  <span className={cx("h-1.5 w-full rounded-full", i <= step ? "bg-kafue" : "bg-line")} />
                  <span className={cx("text-[11px]", i <= step ? "font-semibold text-kafue" : "text-ink-3")}>{statusLabel[s]}</span>
                </li>
              ))}
            </ol>
          )}
          <p className="mt-3 text-sm text-ink-2">Where: {sent.where}</p>
          {sent.status === "SUBMITTED" && <p className="mt-1 text-xs text-ink-3">If nobody picks it up within {ESCALATE_AFTER_SECONDS / 60} minutes, the event manager gets an SMS.</p>}

          {sent.chat.length > 0 && (
            <ul className="mt-4 space-y-2">
              {sent.chat.map((c, i) => <li key={i} className={cx("max-w-[85%] rounded-xl px-3 py-2 text-sm", c.me ? "ml-auto bg-kafue text-white" : "bg-surface-2")}>{c.text}</li>)}
            </ul>
          )}
          {(anonymous ? !!phone.number : true) && sent.status !== "COMPLETED" && sent.status !== "CANCELLED" && (
            <div className="mt-3 flex gap-2">
              <input value={reply} onChange={(x) => setReply(x.target.value)} onKeyDown={(x) => { if (x.key === "Enter" && reply.trim()) { setSent({ ...sent, chat: [...sent.chat, { me: true, text: reply.trim() }] }); setReply(""); } }} placeholder="Message the team" aria-label="Message the team" className="min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3 py-2 text-sm focus:border-kafue focus:outline-none" />
              <Button onClick={() => { if (reply.trim()) { setSent({ ...sent, chat: [...sent.chat, { me: true, text: reply.trim() }] }); setReply(""); } }}><MessageCircle size={16} /> Send</Button>
            </div>
          )}
          <div className="mt-4 flex flex-wrap gap-2">
            {sent.status !== "COMPLETED" && sent.status !== "CANCELLED" && <>
              <Button variant="secondary" onClick={() => setSent({ ...sent, status: "COMPLETED" })}><CheckCircle2 size={16} /> It&rsquo;s sorted</Button>
              <Button variant="ghost" onClick={() => setSent({ ...sent, status: "CANCELLED" })}>Cancel request</Button>
            </>}
            {(sent.status === "COMPLETED" || sent.status === "CANCELLED") && <Button variant="secondary" onClick={() => { setSent(null); setDuty(null); setNote(""); setPhoto(""); }}>Make another request</Button>}
          </div>
        </div>
      )}
    </div>
  );
}
