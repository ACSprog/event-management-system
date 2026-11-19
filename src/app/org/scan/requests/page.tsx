"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, Clock, MapPin, MessageCircle, ScanLine, Undo2 } from "lucide-react";
import { cx } from "@/components/ui";
import { api, type HelpRequest } from "@/lib/api";
import { defaultDuties, statusLabel, type RequestStatus } from "@/lib/assist";

const dutyName = (k: string) => defaultDuties.find((d) => d.key === k)?.team ?? k;
const sensitive = (k: string) => !!defaultDuties.find((d) => d.key === k)?.sensitive;

/**
 * Help requests for on-site staff (ushers, bouncers, first aiders...). Same
 * full-screen phone app as the gate scanner. Staff see requests for their own
 * duty; sensitive ones (security, first aid) only if they are on that team.
 */
export default function StaffRequests() {
  const staff = api.assist.staff();
  const [meId, setMeId] = useState("s1");
  const me = staff.find((s) => s.id === meId)!;
  const [availability, setAvailability] = useState(me.status);
  const [rows, setRows] = useState<HelpRequest[]>(api.assist.requests());
  const [view, setView] = useState<"mine" | "team">("mine");
  const [flash, setFlash] = useState("");

  const visible = rows.filter((r) => r.status !== "COMPLETED" && r.status !== "CANCELLED" && (view === "mine" ? r.assignee === meId : r.duty === me.duty || (!sensitive(r.duty) && r.status === "ESCALATED")));
  const done = rows.filter((r) => r.assignee === meId && r.status === "COMPLETED").length;

  const update = (id: string, status: RequestStatus, what: string, assignee?: string | null) => {
    setRows(rows.map((r) => (r.id === id ? { ...r, status, assignee: assignee === null ? undefined : assignee ?? r.assignee, log: [...r.log, { at: "now", what }] } : r)));
    setFlash(what);
    setTimeout(() => setFlash(""), 2500);
  };

  return (
    <div className="flex min-h-[calc(100vh-37px)] flex-col bg-[#0f1522] text-white">
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm">
        <div>
          <p className="font-semibold">Requests, Lusaka Summer Jam</p>
          <label className="text-white/60">Preview as{" "}
            <select value={meId} onChange={(e) => { setMeId(e.target.value); setAvailability(staff.find((s) => s.id === e.target.value)!.status); }} className="rounded bg-white/10 px-1 py-0.5 text-white">
              {staff.map((s) => <option key={s.id} value={s.id} className="text-ink">{s.name} ({dutyName(s.duty)}, {s.area})</option>)}
            </select>
          </label>
        </div>
        <div className="flex gap-2">
          <Link href="/org/scan/" className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold"><ScanLine size={13} /> Scanner</Link>
          <Link href="/org/events/lusaka-summer-jam-2026/" className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold"><ArrowLeft size={13} /> Workspace</Link>
        </div>
      </div>

      <div className="mx-auto w-full max-w-md flex-1 px-4">
        <div className="grid grid-cols-3 gap-1 rounded-2xl bg-white/5 p-1 text-sm" role="radiogroup" aria-label="Your availability">
          {(["available", "busy", "off"] as const).map((a) => (
            <button key={a} role="radio" aria-checked={availability === a} onClick={() => setAvailability(a)} className={cx("rounded-xl py-2 font-semibold capitalize", availability === a ? (a === "available" ? "bg-[#1F9D55]" : a === "busy" ? "bg-marigold text-[#2a1a00]" : "bg-white/20") : "text-white/60")}>{a === "off" ? "Off duty" : a}</button>
          ))}
        </div>
        <p className="mt-2 text-center text-xs text-white/50">{dutyName(me.duty)} · {me.area}. {availability === "available" ? "New requests for your duty and area come to you." : availability === "busy" ? "New requests go to someone else for now." : "You won't get requests."}</p>

        <div className="mt-4 grid grid-cols-2 gap-1 text-sm">
          {(["mine", "team"] as const).map((v) => (
            <button key={v} onClick={() => setView(v)} className={cx("rounded-xl py-2 font-semibold", view === v ? "bg-white text-[#0f1522]" : "bg-white/5 text-white/70")}>{v === "mine" ? `Mine (${rows.filter((r) => r.assignee === meId && !["COMPLETED", "CANCELLED"].includes(r.status)).length})` : `${dutyName(me.duty)} team`}</button>
          ))}
        </div>

        <ul className="mt-4 space-y-3">
          {visible.length === 0 && <li className="rounded-2xl bg-white/5 p-6 text-center text-sm text-white/60">{view === "mine" ? "Nothing assigned to you right now." : "No open requests for your team."}</li>}
          {visible.map((r) => (
            <li key={r.id} className={cx("rounded-2xl p-4", r.status === "ESCALATED" ? "bg-[#D62F45]/20 ring-1 ring-[#D62F45]" : "bg-white/5")}>
              <div className="flex items-start justify-between gap-2">
                <p className="font-semibold">{dutyName(r.duty)}: {r.note || "No details"}</p>
                <span className="shrink-0 rounded-full bg-white/10 px-2 py-0.5 text-[11px] font-semibold">{statusLabel[r.status]}</span>
              </div>
              <p className="mt-1 flex items-center gap-1.5 text-sm text-white/70"><MapPin size={14} /> {r.where}</p>
              <p className="mt-0.5 flex items-center gap-1.5 text-xs text-white/50"><Clock size={12} /> {r.at} · {r.from}{r.ticket ? `, ${r.ticket} ticket` : ""} · {r.id}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(r.status === "SUBMITTED" || r.status === "ESCALATED" || (r.status === "ASSIGNED" && r.assignee !== meId)) && (
                  <button onClick={() => update(r.id, "ACCEPTED", `${me.name}: on the way`, meId)} className="rounded-xl bg-marigold px-4 py-2 text-sm font-bold text-[#2a1a00]">I&rsquo;m on it</button>
                )}
                {r.status === "ASSIGNED" && r.assignee === meId && <button onClick={() => update(r.id, "ACCEPTED", `${me.name}: on the way`)} className="rounded-xl bg-marigold px-4 py-2 text-sm font-bold text-[#2a1a00]">Accept</button>}
                {r.status === "ACCEPTED" && r.assignee === meId && <button onClick={() => update(r.id, "IN_PROGRESS", `${me.name}: with them`)} className="rounded-xl bg-white/15 px-4 py-2 text-sm font-semibold">I&rsquo;m with them</button>}
                {(r.status === "ACCEPTED" || r.status === "IN_PROGRESS") && r.assignee === meId && <button onClick={() => update(r.id, "COMPLETED", `Done by ${me.name}`)} className="flex items-center gap-1 rounded-xl bg-[#1F9D55] px-4 py-2 text-sm font-semibold"><Check size={15} /> Done</button>}
                {r.assignee === meId && r.status !== "IN_PROGRESS" && <button onClick={() => update(r.id, "SUBMITTED", `${me.name} can't take it; back to the organiser`, null)} className="flex items-center gap-1 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/70"><Undo2 size={14} /> Can&rsquo;t take it</button>}
                {r.from !== "Anonymous" && <button onClick={() => setFlash(`Message sent to ${r.from}`)} className="flex items-center gap-1 rounded-xl bg-white/5 px-3 py-2 text-sm text-white/70"><MessageCircle size={14} /> Message</button>}
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-6 text-center text-xs text-white/40">{done} completed by you today. Security and first-aid requests are only shown to those teams.</p>
      </div>
      {flash && <p className="mx-auto mb-4 mt-4 max-w-md rounded-xl bg-[#1F9D55]/20 px-4 py-2 text-center text-sm text-[#5fd394]" role="status">{flash}</p>}
    </div>
  );
}
