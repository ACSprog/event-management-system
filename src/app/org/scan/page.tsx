"use client";

import { useEffect, useRef, useState } from "react";
import { AlertOctagon, Camera, CheckCircle2, CloudOff, History, Keyboard, RefreshCw, ScanLine, ShieldAlert, Siren, Wifi, XCircle } from "lucide-react";
import Link from "next/link";
import { cx } from "@/components/ui";
import { useOrgRole } from "@/components/layout/org-role";
import { teamRoles } from "@/lib/roles";
import { api } from "@/lib/api";

type Result = { kind: "valid" | "used" | "invalid" | "gate" | "cancelled"; name?: string; ticket?: string; detail: string; number?: string };

const samples: Result[] = [
  { kind: "valid", name: "Natasha Phiri", ticket: "Standard", number: "TKT-000512-A", detail: "Admit 1" },
  { kind: "valid", name: "Joseph Zulu", ticket: "Early bird", number: "TKT-000513-A", detail: "Admit 1" },
  { kind: "used", name: "Brian Mwansa", ticket: "Standard", number: "TKT-000481-B", detail: "Already scanned at Gate A, 18:31 by Mapalo N." },
  { kind: "gate", name: "Grace Tembo", ticket: "VIP", number: "TKT-002210-A", detail: "VIP ticket. Send to the VIP gate on the left." },
  { kind: "cancelled", name: "Kelvin Sakala", ticket: "Standard", number: "TKT-000377-A", detail: "Refunded on 14 Nov. Not valid." },
  { kind: "invalid", detail: "Signature check failed. This QR code was not issued by Eventra." },
];

const style = {
  valid: { bg: "bg-[#1F9D55]", icon: CheckCircle2, title: "Valid. Let them in" },
  used: { bg: "bg-[#D62F45]", icon: XCircle, title: "Already used" },
  invalid: { bg: "bg-[#D62F45]", icon: ShieldAlert, title: "Fake or unknown ticket" },
  cancelled: { bg: "bg-[#D62F45]", icon: XCircle, title: "Cancelled ticket" },
  gate: { bg: "bg-[#F4A630] text-[#2a1a00]", icon: AlertOctagon, title: "Wrong gate" },
};

declare global {
  interface Window { BarcodeDetector?: new (o: { formats: string[] }) => { detect: (v: HTMLVideoElement) => Promise<{ rawValue: string }[]> } }
}

export default function Scanner() {
  const { role } = useOrgRole();
  const who = teamRoles[role].person.split(" ");
  const [stage, setStage] = useState<"setup" | "loading" | "scan">("setup");
  const [code, setCode] = useState("JAM-4417-GATE");
  const [gate, setGate] = useState("Gate A");
  const [progress, setProgress] = useState(0);
  const [online, setOnline] = useState(true);
  const [pending, setPending] = useState(0);
  const [count, setCount] = useState(1_412);
  const [result, setResult] = useState<Result | null>(null);
  const [log, setLog] = useState<(Result & { time: string })[]>([]);
  const [panel, setPanel] = useState<"none" | "lookup" | "history" | "incident">("none");
  const [incident, setIncident] = useState({ type: "Duplicate or fake ticket", note: "" });
  const [incidents, setIncidents] = useState<{ type: string; note: string; time: string }[]>([]);
  const [incErr, setIncErr] = useState("");
  const [flash, setFlash] = useState("");
  const [q, setQ] = useState("");
  const [cam, setCam] = useState<"off" | "on" | "unsupported">("off");
  const video = useRef<HTMLVideoElement>(null);
  const i = useRef(0);

  useEffect(() => {
    if (stage !== "loading") return;
    const t = setInterval(() => setProgress((p) => { if (p >= 100) { clearInterval(t); setStage("scan"); return 100; } return p + 7; }), 90);
    return () => clearInterval(t);
  }, [stage]);

  const show = (r: Result) => {
    setResult(r);
    setLog((l) => [{ ...r, time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) }, ...l].slice(0, 30));
    if (r.kind === "valid") { setCount((c) => c + 1); if (!online) setPending((p) => p + 1); }
    try { navigator.vibrate?.(r.kind === "valid" ? 60 : [80, 60, 80]); } catch {}
    setTimeout(() => setResult(null), r.kind === "valid" ? 1100 : 2600);
  };
  const simulate = () => { show(samples[i.current % samples.length]); i.current++; };

  const startCamera = async () => {
    if (!navigator.mediaDevices?.getUserMedia) return setCam("unsupported");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (video.current) { video.current.srcObject = stream; await video.current.play(); }
      setCam("on");
      if (window.BarcodeDetector) {
        const det = new window.BarcodeDetector({ formats: ["qr_code"] });
        let last = "";
        const loop = async () => {
          if (!video.current?.srcObject) return;
          try {
            const codes = await det.detect(video.current);
            const v = codes[0]?.rawValue;
            if (v && v !== last) {
              last = v;
              show(v.startsWith("EVT1.") ? { kind: "valid", name: "Ticket holder", ticket: "Standard", number: v.split(".")[1], detail: "Signature verified on this device" } : { kind: "invalid", detail: "This QR code is not an Eventra ticket." });
              setTimeout(() => (last = ""), 3000);
            }
          } catch {}
          requestAnimationFrame(loop);
        };
        loop();
      }
    } catch { setCam("unsupported"); }
  };

  if (stage !== "scan")
    return (
      <div className="flex min-h-[calc(100vh-37px)] items-center justify-center bg-[#0f1522] p-4 text-white">
        <div className="w-full max-w-sm">
          {role !== "gate" && <Link href="/org/events/" className="mb-6 inline-block text-sm text-white/60 hover:text-white">‹ Back to the workspace</Link>}
          <ScanLine size={36} className="text-marigold" />
          <p className="mt-4 text-sm text-white/60">Zed Live Entertainment</p>
          <h1 className="font-display text-3xl font-bold">Gate scanner</h1>
          <p className="mt-1 text-white/60">Works offline once the ticket list has downloaded.</p>
          {stage === "setup" ? (
            <div className="mt-8 space-y-5">
              <label className="block"><span className="mb-1.5 block text-sm text-white/70">Event code from your supervisor</span>
                <input value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 font-mono text-lg tracking-wider focus:border-marigold focus:outline-none" />
              </label>
              <div>
                <p className="mb-2 text-sm text-white/70">Your gate</p>
                <div className="grid grid-cols-2 gap-2">{api.events.gates().map((g) => <button key={g.name} onClick={() => setGate(g.name)} className={cx("rounded-xl border-2 px-3 py-3 text-left", gate === g.name ? "border-marigold bg-marigold/10" : "border-white/15")}><span className="block font-semibold">{g.name}</span><span className="block text-xs text-white/50">{g.allowed}</span></button>)}</div>
              </div>
              <button onClick={() => setStage("loading")} className="w-full rounded-xl bg-marigold py-4 text-lg font-bold text-[#2a1a00]">Start shift</button>
            </div>
          ) : (
            <div className="mt-10">
              <p className="font-semibold">Downloading ticket list for Lusaka Summer Jam</p>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full bg-marigold transition-all" style={{ width: `${progress}%` }} /></div>
              <p className="mt-2 text-sm text-white/60">{Math.round(31_160 * Math.min(progress, 100) / 100).toLocaleString()} of 31,160 tickets, plus signing keys</p>
            </div>
          )}
        </div>
      </div>
    );

  const S = result ? style[result.kind] : null;
  const lookup = api.events.attendees().filter((a) => q.length > 1 && (a.name.toLowerCase().includes(q.toLowerCase()) || a.ref.toLowerCase().includes(q.toLowerCase())));

  return (
    <div className="relative flex min-h-[calc(100vh-37px)] flex-col bg-[#0f1522] text-white">
      <div className="flex items-center justify-between px-4 py-3 text-sm">
        <div>
          <p className="font-semibold">{gate}, Lusaka Summer Jam</p>
          <p className="text-white/50">{who[0]} {who[1]?.[0]}., scanner #4{role !== "gate" && <>. <Link href="/org/events/lusaka-summer-jam-2026/" className="underline">Back to the workspace</Link></>}</p>
        </div>
        <button onClick={() => { setOnline(!online); if (!online) setPending(0); }} className={cx("flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold", online ? "bg-[#1F9D55]/20 text-[#5fd394]" : "bg-[#F4A630]/20 text-marigold")}>
          {online ? <><Wifi size={13} /> Synced</> : <><CloudOff size={13} /> Offline, {pending} to sync</>}
        </button>
      </div>

      <div className="mx-auto w-full max-w-md flex-1 px-4">
        <div className="relative mx-auto aspect-square w-full overflow-hidden rounded-3xl bg-black">
          <video ref={video} className={cx("absolute inset-0 h-full w-full object-cover", cam !== "on" && "hidden")} muted playsInline />
          {cam !== "on" && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-white/60">
              <Camera size={32} />
              <button onClick={startCamera} className="rounded-lg bg-white/10 px-4 py-2 text-sm font-semibold text-white">Turn on camera</button>
              {cam === "unsupported" && <p className="px-6 text-xs">Camera not available here. Use the test button below.</p>}
            </div>
          )}
          <div className="pointer-events-none absolute inset-10 rounded-2xl border-2 border-white/70">
            <div className="scan-line h-0.5 w-full bg-marigold shadow-[0_0_12px_#F4A630]" />
          </div>
        </div>

        <div className="mt-5 grid grid-cols-3 gap-3 text-center">
          <div className="rounded-2xl bg-white/5 py-3"><p className="font-display text-2xl font-bold tabular-nums">{count.toLocaleString()}</p><p className="text-xs text-white/50">Admitted here</p></div>
          <div className="rounded-2xl bg-white/5 py-3"><p className="font-display text-2xl font-bold">0.4s</p><p className="text-xs text-white/50">Avg check</p></div>
          <div className="rounded-2xl bg-white/5 py-3"><p className="font-display text-2xl font-bold">{log.filter((l) => l.kind !== "valid").length}</p><p className="text-xs text-white/50">Rejected</p></div>
        </div>

        <button onClick={simulate} className="mt-5 w-full rounded-2xl bg-marigold py-4 text-lg font-bold text-[#2a1a00]">Scan a test ticket</button>
        <p className="mt-2 text-center text-xs text-white/40">Cycles through valid, used, wrong gate, cancelled and fake tickets</p>
      </div>

      {flash && <p className="mx-auto mt-4 max-w-md rounded-xl bg-[#1F9D55]/20 px-4 py-2 text-center text-sm text-[#5fd394]" role="status">{flash}</p>}
      <nav className="mt-6 grid grid-cols-4 border-t border-white/10 text-xs">
        {[{ k: "lookup", I: Keyboard, l: "Find by name" }, { k: "history", I: History, l: "Recent scans" }, { k: "incident", I: Siren, l: "Report incident" }, { k: "sync", I: RefreshCw, l: "Sync now" }].map(({ k, I, l }) => (
          <button key={k} onClick={() => (k === "sync" ? (setOnline(true), setPending(0)) : setPanel(panel === k ? "none" : (k as "lookup" | "history" | "incident")))} className={cx("flex flex-col items-center gap-1 py-3 hover:text-white", panel === k ? "text-marigold" : "text-white/70")}><I size={20} />{l}</button>
        ))}
      </nav>

      {panel !== "none" && (
        <div className="absolute inset-x-0 bottom-[60px] max-h-[60%] overflow-y-auto rounded-t-3xl bg-[#171f2f] p-5 shadow-2xl">
          {panel === "incident" ? (
            <div className="space-y-3">
              <p className="font-semibold">Report an incident at {gate}</p>
              <div className="grid grid-cols-2 gap-2">
                {["Duplicate or fake ticket", "Medical", "Fight or threat", "Lost child", "Crowd crush risk", "Other"].map((t) => (
                  <button key={t} onClick={() => setIncident({ ...incident, type: t })} className={cx("rounded-xl border-2 px-3 py-2 text-left text-sm", incident.type === t ? "border-marigold bg-marigold/10" : "border-white/15")}>{t}</button>
                ))}
              </div>
              <textarea value={incident.note} onChange={(e) => setIncident({ ...incident, note: e.target.value })} rows={3} placeholder="What happened? Who was involved?" className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm focus:border-marigold focus:outline-none" />
              {incErr && <p className="text-xs text-[#f0576b]">{incErr}</p>}
              <button onClick={() => {
                if (incident.note.trim().length < 5) return setIncErr("Add a short description.");
                setIncidents([{ ...incident, time: new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) }, ...incidents]);
                setIncident({ type: "Duplicate or fake ticket", note: "" }); setIncErr(""); setPanel("none");
                setFlash(online ? "Incident sent to the control room" : "Incident saved. It will be sent when the scanner is back online");
                setTimeout(() => setFlash(""), 3500);
              }} className="w-full rounded-xl bg-marigold py-3 font-bold text-[#2a1a00]">Send to control room</button>
              {["Medical", "Fight or threat", "Lost child", "Crowd crush risk"].includes(incident.type) && <p className="text-xs text-white/60">For emergencies, also radio your supervisor straight away.</p>}
              {incidents.length > 0 && <ul className="divide-y divide-white/10 text-sm">{incidents.map((x, n) => <li key={n} className="py-2"><span className="text-white/50">{x.time}</span> {x.type}: {x.note}</li>)}</ul>}
            </div>
          ) : panel === "lookup" ? (
            <>
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, phone or booking reference" className="w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 focus:border-marigold focus:outline-none" />
              <ul className="mt-3 divide-y divide-white/10">
                {lookup.map((a) => (
                  <li key={a.id} className="flex items-center justify-between py-3">
                    <div><p className="font-semibold">{a.name}</p><p className="text-xs text-white/50">{a.ticket}, {a.ref}</p></div>
                    {a.checkedIn ? <span className="text-xs text-[#f0576b]">Already in</span> : <button onClick={() => { show({ kind: "valid", name: a.name, ticket: a.ticket, detail: "Checked in by name lookup", number: a.ref }); setPanel("none"); }} className="rounded-lg bg-[#1F9D55] px-3 py-1.5 text-sm font-semibold">Check in</button>}
                  </li>
                ))}
                {q.length > 1 && lookup.length === 0 && <li className="py-3 text-sm text-white/50">No ticket holder matches. Check the spelling or ask for the booking reference.</li>}
              </ul>
            </>
          ) : (
            <ul className="divide-y divide-white/10">
              {log.length === 0 && <li className="text-sm text-white/50">No scans yet this shift.</li>}
              {log.map((l, n) => <li key={n} className="flex items-center justify-between py-2.5 text-sm"><span>{l.name ?? "Unknown QR"}</span><span className={l.kind === "valid" ? "text-[#5fd394]" : "text-[#f0576b]"}>{style[l.kind].title.split(".")[0]}, {l.time}</span></li>)}
            </ul>
          )}
        </div>
      )}

      {result && S && (
        <div className={cx("absolute inset-0 z-10 flex flex-col items-center justify-center p-8 text-center text-white", S.bg)} role="alert" onClick={() => setResult(null)}>
          <S.icon size={96} strokeWidth={1.5} />
          <p className="font-display mt-4 text-4xl font-bold">{S.title}</p>
          {result.name && <p className="mt-4 text-2xl font-semibold">{result.name}</p>}
          {result.ticket && <p className="text-lg opacity-90">{result.ticket}</p>}
          <p className="mt-3 max-w-xs text-lg opacity-90">{result.detail}</p>
          {result.number && <p className="mt-4 font-mono text-sm opacity-70">{result.number}</p>}
          {result.kind !== "valid" && <p className="mt-8 rounded-full bg-black/20 px-4 py-2 text-sm">Tap to dismiss. Call a supervisor if the guest disputes this.</p>}
        </div>
      )}
    </div>
  );
}
