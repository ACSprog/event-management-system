"use client";

import { useState } from "react";
import { AlertTriangle, Printer, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Badge, Button, Card, Field, Input, Modal, SectionTitle, Stat, cx, useToast } from "@/components/ui";
import { api, type HelpRequest } from "@/lib/api";
import { churchDuties, defaultDuties, statusLabel, type AssignMode, type Duty } from "@/lib/assist";

const tone = { SUBMITTED: "gold", ASSIGNED: "teal", ACCEPTED: "teal", IN_PROGRESS: "teal", COMPLETED: "green", CANCELLED: "grey", ESCALATED: "red" } as const;
const avail = { available: "green", busy: "gold", off: "grey" } as const;
const waited = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} min ${s % 60 ? `${s % 60} s` : ""}` : `${s} s`);

/**
 * Organiser's live view of help requests. Each event chooses how requests
 * reach staff; the organiser can assign or reassign any request at any time.
 */
export function RequestsPanel({ slug }: { slug: string }) {
  const toast = useToast();
  const staff = api.assist.staff();
  const [mode, setMode] = useState<AssignMode>(api.assist.settings().mode);
  const [rows, setRows] = useState<HelpRequest[]>(api.assist.requests());
  const [duties, setDuties] = useState<Duty[]>(defaultDuties);
  const [pick, setPick] = useState<Record<string, string>>({});
  const [qrOpen, setQrOpen] = useState(false);
  const [spots, setSpots] = useState("Main entrance, Table 1, Table 2, Table 3, Table 4, Table 5, Table 6, VIP terrace, Toilets");
  const origin = typeof window === "undefined" ? "" : window.location.origin;
  const helpUrl = (spot: string) => `${origin}/events/${slug}/help/?spot=${encodeURIComponent(spot)}`;
  const open = rows.filter((r) => !["COMPLETED", "CANCELLED"].includes(r.status));
  const team = (k: string) => duties.find((d) => d.key === k)?.team ?? k;

  const assign = (r: HelpRequest) => {
    const id = pick[r.id] ?? suggested(r)?.id;
    const s = staff.find((x) => x.id === id);
    if (!s) return toast("Choose someone first");
    setRows(rows.map((x) => (x.id === r.id ? { ...x, status: "ASSIGNED", assignee: s.id, log: [...x.log, { at: "now", what: `Assigned to ${s.name}` }] } : x)));
    toast(`${r.id} sent to ${s.name}. They get it on their phone, and the attendee sees "${s.name.split(" ")[0]} has your request".`);
  };
  const suggested = (r: HelpRequest) => staff.filter((s) => s.duty === r.duty && s.status !== "off").sort((a, b) => (a.status === "available" ? -1 : 1) - (b.status === "available" ? -1 : 1))[0];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <Stat label="Open requests" value={open.length} />
        <Stat label="Waiting over 2 minutes" value={open.filter((r) => r.status === "ESCALATED" || (r.status === "SUBMITTED" && r.waitingSec > 120)).length} hint="SMS sent to the event manager" />
        <Stat label="Average wait today" value="2 min 40 s" hint="from request to staff accepting" />
        <Stat label="Staff on duty" value={`${staff.filter((s) => s.status !== "off").length} of ${staff.length}`} hint={`${staff.filter((s) => s.status === "available").length} available now`} />
      </div>

      <Card>
        <SectionTitle title="How requests reach your staff" sub="You can change this during the event" />
        <div className="grid gap-3 sm:grid-cols-2">
          {([["AUTOMATIC", "Automatic, I can reassign", "Requests go straight to available staff with the right duty and area. Best for big events."], ["ORGANISER_ASSIGNS", "I assign every request", "Requests wait for you or an event manager to choose someone. Good for church services and weddings."]] as [AssignMode, string, string][]).map(([k, t, d]) => (
            <button key={k} onClick={() => { setMode(k); toast(k === "AUTOMATIC" ? "New requests go to matching staff automatically" : "New requests wait for you to assign them"); }} aria-pressed={mode === k} className={cx("rounded-xl border-2 p-4 text-left", mode === k ? "border-kafue bg-kafue-soft" : "border-line hover:border-ink-3")}>
              <span className="block font-semibold">{t}</span><span className="block text-sm text-ink-3">{d}</span>
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-3">Either way, a request nobody accepts within 2 minutes goes to the event manager by SMS. If no staff are on duty, requests go to the organiser&rsquo;s phone by SMS.</p>
      </Card>

      <div className="grid gap-6 2xl:grid-cols-[1.6fr_1fr]">
        <Card pad={false}>
          <div className="p-5 pb-2"><SectionTitle title="Live requests" sub="Newest first. Security and first-aid details are visible only to those teams, you and event managers." /></div>
          <ul className="divide-y divide-line">
            {[...rows].sort((a, b) => (["COMPLETED", "CANCELLED"].includes(a.status) ? 1 : 0) - (["COMPLETED", "CANCELLED"].includes(b.status) ? 1 : 0) || b.at.localeCompare(a.at)).map((r) => {
              const closed = ["COMPLETED", "CANCELLED"].includes(r.status);
              const who = staff.find((s) => s.id === r.assignee);
              const choices = [...staff].sort((a, b) => Number(b.duty === r.duty) - Number(a.duty === r.duty));
              return (
                <li key={r.id} className={cx("p-5", r.status === "ESCALATED" && "bg-hibiscus-soft", closed && "opacity-70")}>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-semibold">{team(r.duty)}: {r.note}</p>
                      <p className="text-sm text-ink-3">{r.where} · {r.from}{r.ticket ? ` (${r.ticket})` : ""} · {r.at} · {r.id}</p>
                    </div>
                    <span className="flex items-center gap-2">
                      {!closed && r.waitingSec > 0 && <span className={cx("text-xs tabular-nums", r.waitingSec > 120 ? "font-semibold text-hibiscus" : "text-ink-3")}>waiting {waited(r.waitingSec)}</span>}
                      <Badge tone={tone[r.status]}>{r.status === "ESCALATED" && <AlertTriangle size={12} />}{statusLabel[r.status]}</Badge>
                    </span>
                  </div>
                  {who && <p className="mt-1 text-sm">Handling: <strong>{who.name}</strong> ({team(who.duty)}, {who.area})</p>}
                  {!closed && (
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <select aria-label={`Assign ${r.id}`} value={pick[r.id] ?? r.assignee ?? suggested(r)?.id ?? ""} onChange={(e) => setPick({ ...pick, [r.id]: e.target.value })} className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm">
                        {choices.map((s) => <option key={s.id} value={s.id} disabled={s.status === "off"}>{s.name}: {team(s.duty)}, {s.area} ({s.status === "off" ? "off duty" : s.status})</option>)}
                      </select>
                      <Button size="sm" onClick={() => assign(r)}>{r.assignee ? "Reassign" : "Assign"}</Button>
                      <Button size="sm" variant="ghost" onClick={() => { setRows(rows.map((x) => (x.id === r.id ? { ...x, status: "COMPLETED", log: [...x.log, { at: "now", what: "Closed by the organiser" }] } : x))); toast(`${r.id} closed`); }}>Close</Button>
                    </div>
                  )}
                  <details className="mt-2 text-xs text-ink-3"><summary className="cursor-pointer">History</summary><ul className="mt-1 space-y-0.5">{r.log.map((l, i) => <li key={i}>{l.at}: {l.what}</li>)}</ul></details>
                </li>
              );
            })}
          </ul>
        </Card>

        <div className="space-y-6">
          <Card>
            <SectionTitle title="Staff on duty" sub="Duties and areas are set in Staff and shifts" />
            <ul className="divide-y divide-line text-sm">
              {staff.map((s) => (
                <li key={s.id} className="flex items-center justify-between gap-2 py-2">
                  <span className="min-w-0"><span className="block font-semibold">{s.name}</span><span className="block text-xs text-ink-3">{team(s.duty)} · {s.area} · {open.filter((r) => r.assignee === s.id).length} open</span></span>
                  <Badge tone={avail[s.status]}>{s.status === "off" ? "Off duty" : s.status === "busy" ? "Busy" : "Available"}</Badge>
                </li>
              ))}
            </ul>
          </Card>

          <Card>
            <SectionTitle title="What attendees see" sub="Rename the options to match your team" action={<button className="text-sm font-semibold text-kafue" onClick={() => setDuties(duties === churchDuties ? defaultDuties : churchDuties)}>{duties === churchDuties ? "Use event names" : "Use church names"}</button>} />
            <ul className="space-y-2">
              {duties.map((d, i) => (
                <li key={d.key} className="grid grid-cols-2 gap-2">
                  <input aria-label="Button attendees see" value={d.ask} onChange={(e) => setDuties(duties.map((x, j) => (j === i ? { ...x, ask: e.target.value } : x)))} className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm" />
                  <input aria-label="Team name" value={d.team} onChange={(e) => setDuties(duties.map((x, j) => (j === i ? { ...x, team: e.target.value } : x)))} className="rounded-lg border border-line bg-surface px-2 py-1.5 text-sm" />
                </li>
              ))}
            </ul>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => toast("Saved for all your organisation's events")}>Save names</Button>
              <Button size="sm" variant="secondary" href="/events/lusaka-summer-jam-2026/help/">Preview the attendee page</Button>
            </div>
          </Card>

          <Card>
            <SectionTitle title="QR codes for tables, pews and posters" />
            <p className="text-sm text-ink-2">Each code opens the help page with the spot filled in, for example &ldquo;Table 12&rdquo; or &ldquo;Pew 4, left side&rdquo;. It works for people without a ticket too.</p>
            <div className="mt-3 flex flex-wrap gap-2">
              <Button size="sm" onClick={() => setQrOpen(true)}><QrCode size={14} /> Make QR codes</Button>
              <Button size="sm" variant="secondary" href="/events/grace-chapel-convention/help/?spot=Pew%204%2C%20left%20side">Try a church pew code</Button>
            </div>
          </Card>

          <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="QR codes for help requests" footer={<><Button variant="ghost" onClick={() => setQrOpen(false)}>Close</Button><Button onClick={() => window.print()}><Printer size={14} /> Print</Button></>}>
            <Field label="Spots, separated by commas" hint="One code per table, pew, section or poster. Each code fills in the spot for the attendee."><Input value={spots} onChange={(e) => setSpots(e.target.value)} /></Field>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 print:grid-cols-3">
              {spots.split(",").map((x) => x.trim()).filter(Boolean).slice(0, 60).map((spot) => (
                <div key={spot} className="rounded-xl border border-line bg-white p-3 text-center text-[#172033]">
                  <QRCodeSVG value={helpUrl(spot)} size={120} className="mx-auto" />
                  <p className="mt-2 text-sm font-semibold">{spot}</p>
                  <p className="text-[11px]">Scan for an usher, security or first aid</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-ink-3">Scan one with your phone&rsquo;s camera to try it: it opens the attendee&rsquo;s help page on this site.</p>
          </Modal>

          <Card>
            <SectionTitle title="Last event summary" sub="Zed Live Sessions: October" />
            <p className="text-sm">84 requests. Most were for attendants at Gate B (31). Average wait 3 minutes; 2 waited over 5 minutes. First aid: 6, all handled in under 2 minutes.</p>
            <p className="mt-2 text-xs text-ink-3">Tip: add one more attendant at Gate B for the next event.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
