"use client";

import { useState } from "react";
import { Heart, ShieldCheck } from "lucide-react";
import { Poster } from "@/components/poster";
import { Button, Checkbox, cx, Field, Input, Progress, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export function Donate({ slug }: { slug: string }) {
  const toast = useToast();
  const c = api.fundraising.campaigns().find((f) => f.slug === slug)!;
  const recent = api.fundraising.donations().slice(0, 6);
  const [amount, setAmount] = useState(250);
  const [custom, setCustom] = useState("");
  const [monthly, setMonthly] = useState(false);
  const [anon, setAnon] = useState(false);
  const value = custom ? Number(custom) : amount;
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <Poster event={{ title: c.title, category: "Charity", palette: c.palette, start: "2027-01-01", city: c.org }} size="lg" className="aspect-[16/8] rounded-2xl" />
          <h1 className="mt-6 text-3xl font-semibold">{c.title}</h1>
          <p className="text-ink-3">Organised by {c.org}</p>
          <div className="mt-6 rounded-xl border border-line bg-surface p-5">
            <div className="flex items-baseline justify-between">
              <p className="font-display text-3xl font-bold">{kwacha(c.raised)}</p>
              <p className="text-ink-3">raised of {kwacha(c.target)}</p>
            </div>
            <Progress value={(c.raised / c.target) * 100} tone="marigold" className="mt-3 h-3" />
            <p className="mt-2 text-sm text-ink-3">{c.donors} donors, {c.daysLeft} days left</p>
          </div>
          <section className="mt-8 max-w-[68ch] space-y-3 text-ink-2">
            <h2 className="text-xl font-semibold text-ink">Where the money goes</h2>
            <p>K225 feeds one learner a hot lunch every school day for a year. Funds are restricted to school feeding, and the foundation publishes a spending report every term.</p>
            <ul className="space-y-2">
              <li className="flex justify-between border-b border-line pb-2"><span>Food purchases</span><span className="font-semibold">78%</span></li>
              <li className="flex justify-between border-b border-line pb-2"><span>Cooks and transport</span><span className="font-semibold">17%</span></li>
              <li className="flex justify-between"><span>Administration</span><span className="font-semibold">5%</span></li>
            </ul>
          </section>
          <section className="mt-8">
            <h2 className="text-xl font-semibold">Recent donors</h2>
            <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-surface">
              {recent.map((d) => <li key={d.id} className="flex justify-between px-5 py-3 text-sm"><span>{d.donor}{d.type === "Monthly" && <span className="ml-2 text-ink-3">monthly</span>}</span><span className="font-semibold">{kwacha(d.amount)}</span></li>)}
            </ul>
          </section>
        </div>
        <aside className="h-fit rounded-2xl border border-line bg-surface p-6 lg:sticky lg:top-14">
          <h2 className="text-lg font-semibold">Make a donation</h2>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {[100, 250, 500, 1000, 2500, 5000].map((a) => (
              <button key={a} onClick={() => { setAmount(a); setCustom(""); }} className={cx("rounded-lg border-2 py-2.5 font-semibold", !custom && amount === a ? "border-kafue bg-kafue-soft" : "border-line")}>{kwacha(a)}</button>
            ))}
          </div>
          <div className="mt-3"><Field label="Other amount (K)"><Input inputMode="numeric" value={custom} onChange={(e) => setCustom(e.target.value.replace(/\D/g, ""))} placeholder="e.g. 750" /></Field></div>
          <div className="mt-4 space-y-3">
            <Checkbox checked={monthly} onChange={setMonthly} label="Make it monthly" />
            <Checkbox checked={anon} onChange={setAnon} label="Hide my name from the public donor list" />
          </div>
          <Button className="mt-5 w-full" size="lg" variant="ticket" disabled={!value} onClick={() => toast(`Thank you! A ${kwacha(value)} MoMo prompt was sent to your phone.`)}>
            <Heart size={16} /> Donate {value ? kwacha(value) : ""}{monthly ? " a month" : ""}
          </Button>
          <p className="mt-3 flex gap-1.5 text-xs text-ink-3"><ShieldCheck size={14} className="shrink-0 text-leaf" /> You&rsquo;ll get a receipt by email. Donations are kept separate from ticket sales.</p>
        </aside>
      </div>
    </div>
  );
}
