"use client";

import { useState } from "react";
import { Navigation } from "lucide-react";
import { Button, Card, cx, Field, Input, PageHeader, Select, Toggle, useToast } from "@/components/ui";

const cats = ["Music", "Comedy", "Conference", "Church", "Sports", "Education", "Workshop", "Exhibition", "Charity"];

export default function Preferences() {
  const toast = useToast();
  const [radius, setRadius] = useState(25);
  const [chosen, setChosen] = useState(["Music", "Comedy", "Sports"]);
  const [p, setP] = useState({ nearby: true, push: true, sms: true, email: true, whatsapp: false, marketing: false, platform: true, quiet: true });
  const t = (k: keyof typeof p) => (v: boolean) => setP({ ...p, [k]: v });
  return (
    <>
      <PageHeader title="Location and alerts" sub="We only use your location when you open the app or website. We never track you in the background." />
      <div className="space-y-6">
        <Card>
          <h2 className="font-semibold">Where should we look?</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Home area"><Input defaultValue="Rhodes Park, Lusaka" /></Field>
            <Field label="Also show events near"><Input defaultValue="Kitwe" /></Field>
          </div>
          <Button variant="secondary" size="sm" className="mt-3"><Navigation size={14} /> Use my current location once</Button>
          <p className="mb-2 mt-5 text-sm font-medium">Distance</p>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 25, 50, 100].map((r) => <button key={r} onClick={() => setRadius(r)} className={cx("rounded-full border-2 px-4 py-1.5 text-sm font-semibold", radius === r ? "border-kafue bg-kafue-soft" : "border-line")}>{r} km</button>)}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">What do you enjoy?</h2>
          <p className="text-sm text-ink-3">Recommendations also learn from events you buy tickets for.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            {cats.map((c) => <button key={c} onClick={() => setChosen(chosen.includes(c) ? chosen.filter((x) => x !== c) : [...chosen, c])} aria-pressed={chosen.includes(c)} className={cx("rounded-full border-2 px-4 py-1.5 text-sm font-semibold", chosen.includes(c) ? "border-kafue bg-kafue text-white" : "border-line")}>{c}</button>)}
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Alerts</h2>
          <div className="mt-2 divide-y divide-line">
            <Toggle checked={p.nearby} onChange={t("nearby")} label="Tell me about events near me" />
            <div className="py-2"><Field label="How often"><Select options={["As soon as they're announced", "Daily digest", "Weekly digest (Thursdays)"]} defaultValue="Weekly digest (Thursdays)" /></Field></div>
            <Toggle checked={p.quiet} onChange={t("quiet")} label="Quiet hours: no alerts 21:00 to 07:00" />
            <Toggle checked={p.platform} onChange={t("platform")} label="Include events from organisers I don't follow" />
          </div>
        </Card>
        <Card>
          <h2 className="font-semibold">Channels</h2>
          <p className="text-sm text-ink-3">Tickets, payment receipts and event changes always come through, whatever you choose here.</p>
          <div className="mt-2 divide-y divide-line">
            <Toggle checked={p.push} onChange={t("push")} label="Push notifications" />
            <Toggle checked={p.sms} onChange={t("sms")} label="SMS" />
            <Toggle checked={p.email} onChange={t("email")} label="Email" />
            <Toggle checked={p.whatsapp} onChange={t("whatsapp")} label="WhatsApp" />
            <Toggle checked={p.marketing} onChange={t("marketing")} label="Offers and promotions from organisers" />
          </div>
        </Card>
        {/* Phones: Save on top, full width; tablets and up: side by side. */}
        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-between">
          <Button variant="ghost" className="text-hibiscus">Download or delete my data</Button>
          <Button onClick={() => toast("Preferences saved")}>Save preferences</Button>
        </div>
      </div>
    </>
  );
}
