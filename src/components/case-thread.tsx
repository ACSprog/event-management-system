"use client";

import { useEffect, useState } from "react";
import { Clock, Copy, Mic, MicOff, Phone, PhoneCall, PhoneMissed, PhoneOff, Send, Volume2 } from "lucide-react";
import { Badge, Button, cx, useToast } from "@/components/ui";
import { fmtCall, isOpen, type Case, type CaseMessage } from "@/lib/cases";
import { fmtDate } from "@/lib/brand";

const statusTone = { Open: "gold", "Waiting for you": "teal", Answered: "green", Closed: "grey", Expired: "grey" } as const;

/** Full-screen-ish call sheet. In-app voice over data: neither side sees the other's number. */
function CallSheet({ who, onEnd }: { who: string; onEnd: (seconds: number) => void }) {
  const [phase, setPhase] = useState<"ringing" | "connected">("ringing");
  const [secs, setSecs] = useState(0);
  const [muted, setMuted] = useState(false);
  const [speaker, setSpeaker] = useState(false);
  useEffect(() => {
    const ring = setTimeout(() => setPhase("connected"), 2500);
    return () => clearTimeout(ring);
  }, []);
  useEffect(() => {
    if (phase !== "connected") return;
    const t = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, [phase]);
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label={`Call with ${who}`}>
      <div className="w-full max-w-sm rounded-3xl bg-[#0f1522] p-8 text-center text-white">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/10"><PhoneCall size={32} className={cx(phase === "ringing" && "motion-safe:animate-pulse")} /></div>
        <p className="mt-4 text-lg font-semibold">{who}</p>
        <p className="text-sm text-white/60">{phase === "ringing" ? "Calling… (in-app call, uses data)" : `${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`}</p>
        <p className="mt-1 text-xs text-white/40">Your phone number isn&rsquo;t shared. Calls aren&rsquo;t recorded.</p>
        <div className="mt-8 flex items-center justify-center gap-5">
          <button onClick={() => setMuted(!muted)} aria-pressed={muted} aria-label={muted ? "Unmute" : "Mute"} className={cx("flex h-14 w-14 items-center justify-center rounded-full", muted ? "bg-white text-[#0f1522]" : "bg-white/10")}>{muted ? <MicOff size={22} /> : <Mic size={22} />}</button>
          <button onClick={() => onEnd(phase === "connected" ? secs : 0)} aria-label="End call" className="flex h-16 w-16 items-center justify-center rounded-full bg-[#D62F45]"><PhoneOff size={26} /></button>
          <button onClick={() => setSpeaker(!speaker)} aria-pressed={speaker} aria-label="Speaker" className={cx("flex h-14 w-14 items-center justify-center rounded-full", speaker ? "bg-white text-[#0f1522]" : "bg-white/10")}><Volume2 size={22} /></button>
        </div>
      </div>
    </div>
  );
}

/**
 * One case: number, status, expiry, messages and call logs, a reply box and a
 * call button. Used by the attendee's Messages and the organiser's Questions
 * and help.
 */
export function CaseThread({ c, side, onChange, hotline }: { c: Case; side: "attendee" | "team"; onChange: (c: Case) => void; hotline?: string }) {
  const toast = useToast();
  const [text, setText] = useState("");
  const [calling, setCalling] = useState(false);
  const open = isOpen(c);
  const me = side === "attendee" ? "attendee" : "team";
  const other = side === "attendee" ? `${c.org} team` : (c as Case & { buyer?: string }).buyer ?? "the attendee";

  const add = (m: CaseMessage, status?: Case["status"]) => onChange({ ...c, status: status ?? c.status, unread: 0, messages: [...c.messages, m] });
  const send = () => {
    if (!text.trim()) return;
    add({ from: me, name: side === "team" ? "You" : undefined, at: "Now", text: text.trim() }, side === "attendee" ? "Open" : "Waiting for you");
    setText("");
    toast(side === "attendee" ? `Sent. Quote ${c.number} if you call.` : "Reply sent in the app. If they don't open it, they get an SMS.");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-line p-4">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="font-semibold">{c.subject}</p>
            <p className="text-sm text-ink-3">{c.event} · {c.type}{side === "team" ? ` · ${other}` : ` · ${c.org}`}</p>
          </div>
          <Badge tone={statusTone[c.status]}>{c.status}</Badge>
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-3">
          <button onClick={() => { void navigator.clipboard?.writeText(c.number).catch(() => {}); toast(`Case number ${c.number} copied`); }} className="flex items-center gap-1 rounded-md bg-surface-2 px-2 py-1 font-mono font-semibold text-ink"><Copy size={12} /> Case {c.number}</button>
          <span className="flex items-center gap-1"><Clock size={12} /> {open ? `Chat open until ${fmtDate(c.closesOn, { day: "numeric", month: "short" })}` : `Closed. Messages deleted ${c.deletesOn ? fmtDate(c.deletesOn, { day: "numeric", month: "short", year: "numeric" }) : "90 days after closing"}`}</span>
        </div>
      </div>

      <ul className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
        {c.messages.map((m, i) => {
          if (m.from === "system") return <li key={i} className="text-center text-xs text-ink-3">{m.text} · {m.at}</li>;
          if (m.call) {
            const missed = m.call.seconds === 0;
            return (
              <li key={i} className="flex justify-center">
                <span className={cx("flex items-center gap-2 rounded-full px-3 py-1.5 text-xs", missed ? "bg-hibiscus-soft text-hibiscus" : "bg-surface-2 text-ink-2")}>
                  {missed ? <PhoneMissed size={13} /> : <Phone size={13} />} {m.call.by === "team" ? (side === "team" ? "You called" : `${m.name} called`) : side === "attendee" ? "You called" : "They called"}: {fmtCall(m.call.seconds)} · {m.at}
                </span>
              </li>
            );
          }
          const mine = m.from === me;
          return (
            <li key={i} className={cx("max-w-[85%]", mine ? "ml-auto text-right" : "")}>
              <span className={cx("inline-block rounded-2xl px-3 py-2 text-left text-sm", mine ? "bg-kafue text-white" : "bg-surface-2")}>{m.text}</span>
              <span className="mt-0.5 block text-[11px] text-ink-3">{m.name ? `${m.name} · ` : ""}{m.at}</span>
            </li>
          );
        })}
      </ul>

      {open ? (
        <div className="border-t border-line p-3">
          <div className="flex gap-2">
            <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} placeholder={side === "attendee" ? "Write a message" : "Reply"} aria-label="Message" className="min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3 py-2 text-sm focus:border-kafue focus:outline-none" />
            <Button onClick={send} aria-label="Send"><Send size={16} /></Button>
            <Button variant="secondary" onClick={() => setCalling(true)} aria-label={`Call ${other} in the app`}><PhoneCall size={16} /> Call</Button>
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs text-ink-3">
            {side === "attendee" && hotline ? <a href={`tel:${hotline.replace(/\s/g, "")}`} className="font-semibold text-kafue">No data? Phone {hotline} and quote {c.number}</a> : <span>Calls are in-app; numbers stay private.</span>}
            <span className="flex gap-3">
              <button className="hover:text-ink" onClick={() => { add({ from: "system", at: "Now", text: `Closed by ${side === "attendee" ? "you" : "the team"}. Messages will be deleted after 90 days; the case number is kept.` }, "Closed"); toast(`Case ${c.number} closed`); }}>Close case</button>
              <button className="hover:text-ink" onClick={() => toast("Reported. EMS support will review this conversation.")}>Report</button>
            </span>
          </div>
        </div>
      ) : (
        <div className="border-t border-line p-4 text-sm text-ink-3">This chat is closed and read-only. Need more help? Start a new message and quote {c.number}.</div>
      )}

      {calling && <CallSheet who={other} onEnd={(s) => { setCalling(false); add({ from: me, name: side === "team" ? "You" : undefined, at: "Now", text: "", call: { seconds: s, by: me } }); toast(s ? `Call ended after ${fmtCall(s)}. It's logged in case ${c.number}.` : "Call cancelled"); }} />}
    </div>
  );
}
