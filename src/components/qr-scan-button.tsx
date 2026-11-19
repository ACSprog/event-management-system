"use client";

import { useEffect, useRef, useState } from "react";
import { QrCode } from "lucide-react";
import { Button, Modal } from "@/components/ui";

type Detector = { detect: (src: HTMLVideoElement) => Promise<{ rawValue: string }[]> };

/** Turns a scanned code into a help-page address on this site, or null. */
export function helpPathFrom(text: string): string | null {
  try {
    const u = new URL(text.trim(), window.location.origin);
    const m = u.pathname.match(/\/events\/([^/]+)\/help\/?$/);
    return m ? `/events/${m[1]}/help/${u.search}` : null;
  } catch {
    return null;
  }
}

/**
 * Scan the QR code on a table, pew or poster to ask for help. Uses the phone's
 * camera where the browser can read QR codes (Chrome on Android); elsewhere the
 * phone's own camera app opens the same page, and a code can be typed in.
 */
export function QrScanButton({ label = "Scan a QR code", variant = "secondary", size }: { label?: string; variant?: "primary" | "secondary" | "ghost"; size?: "sm" | "md" | "lg" }) {
  const [open, setOpen] = useState(false);
  const [state, setState] = useState<"starting" | "scanning" | "unsupported" | "denied">("starting");
  const [typed, setTyped] = useState("");
  const [err, setErr] = useState("");
  const video = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!open) return;
    let stream: MediaStream | null = null;
    let stop = false;
    const Ctor = (window as unknown as { BarcodeDetector?: new (o: { formats: string[] }) => Detector }).BarcodeDetector;
    (async () => {
      if (!Ctor || !navigator.mediaDevices?.getUserMedia) return setState("unsupported");
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      } catch {
        return setState("denied");
      }
      if (!video.current) return;
      video.current.srcObject = stream;
      await video.current.play().catch(() => {});
      setState("scanning");
      const detector = new Ctor({ formats: ["qr_code"] });
      while (!stop) {
        const codes = await detector.detect(video.current).catch(() => []);
        const hit = codes.map((c) => helpPathFrom(c.rawValue)).find(Boolean);
        if (hit) { stop = true; setOpen(false); window.location.assign(hit); break; }
        if (codes.length) setErr("That QR code isn't an Eventra help code. Look for the one on your table, pew or the posters.");
        await new Promise((r) => setTimeout(r, 300));
      }
    })();
    return () => { stop = true; stream?.getTracks().forEach((t) => t.stop()); };
  }, [open]);

  const go = () => {
    const path = helpPathFrom(typed) ?? (typed.trim() ? helpPathFrom(`/events/${typed.trim().toLowerCase().replace(/\s+/g, "-")}/help/`) : null);
    if (!path) return setErr("Paste the link under the QR code, or the event code printed beside it.");
    setOpen(false);
    // A full page load, so the help page always picks up the new spot.
    window.location.assign(path);
  };

  return (
    <>
      <Button variant={variant} size={size} onClick={() => { setErr(""); setState("starting"); setOpen(true); }}><QrCode size={16} /> {label}</Button>
      <Modal open={open} onClose={() => setOpen(false)} title="Scan the help QR code">
        <p className="text-sm text-ink-2">Point your camera at the QR code on your table, pew or a poster at the event. It opens the help page with your spot filled in.</p>
        {(state === "starting" || state === "scanning") && (
          <div className="relative mt-3 overflow-hidden rounded-xl bg-black">
            <video ref={video} playsInline muted className="aspect-square w-full object-cover" />
            <span className="pointer-events-none absolute inset-10 rounded-2xl border-4 border-white/80" />
            {state === "starting" && <p className="absolute inset-0 flex items-center justify-center text-sm text-white/80">Starting camera…</p>}
          </div>
        )}
        {state === "unsupported" && <p className="mt-3 rounded-lg bg-surface-2 p-3 text-sm">This browser can&rsquo;t scan here. Open your phone&rsquo;s <strong>camera app</strong> and point it at the code: it opens the help page directly.</p>}
        {state === "denied" && <p className="mt-3 rounded-lg bg-marigold-soft p-3 text-sm">Camera access was refused. Allow it in your browser settings, or use your phone&rsquo;s camera app instead.</p>}
        {err && <p className="mt-3 text-sm text-hibiscus">{err}</p>}
        <div className="mt-4 flex gap-2">
          <input value={typed} onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => e.key === "Enter" && go()} placeholder="Or paste the link under the code" aria-label="Help link or event code" className="min-w-0 flex-1 rounded-lg border border-line bg-canvas px-3 py-2 text-sm focus:border-kafue focus:outline-none" />
          <Button onClick={go}>Open</Button>
        </div>
      </Modal>
    </>
  );
}
