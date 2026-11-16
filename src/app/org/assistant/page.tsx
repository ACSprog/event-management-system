"use client";

import { useState } from "react";
import { Bot, Send, Sparkles } from "lucide-react";
import { Badge, Button, Card, cx, PageHeader, useToast } from "@/components/ui";
import { kwacha } from "@/lib/brand";

const prompts = ["I want to organise a 1,000-person music concert in Lusaka", "Summarise the reviews from October", "What should I charge for VIP at Copperbelt Nights?", "Forecast attendance for New Year's Eve"];

export default function Assistant() {
  const toast = useToast();
  const [msgs, setMsgs] = useState<{ me: boolean; text: string; plan?: boolean }[]>([]);
  const [input, setInput] = useState("");
  const send = (t: string) => {
    if (!t.trim()) return;
    setMsgs((m) => [...m, { me: true, text: t }]);
    setInput("");
    setTimeout(() => setMsgs((m) => [...m, { me: false, text: t.includes("1,000") ? "Here's a starting plan. All money figures are estimates based on similar Lusaka events, not commitments." : "Based on your last 4 events: parking and exit queues are the most common complaint (27% of negative reviews), while sound quality and quick entry are praised most. I'd prioritise marshals and a second exit.", plan: t.includes("1,000") }]), 700);
  };
  return (
    <>
      <PageHeader title="AI event planner" sub="Drafts plans, budgets and copy from your own data. Nothing is booked, sent or paid without you." />
      <div className="grid gap-6 xl:grid-cols-[1fr_300px]">
        <Card className="flex min-h-[560px] flex-col">
          <div className="flex-1 space-y-4">
            {msgs.length === 0 && (
              <div className="py-10 text-center">
                <Bot className="mx-auto text-kafue" size={36} />
                <p className="mt-3 font-semibold">What are you planning?</p>
                <div className="mx-auto mt-4 flex max-w-xl flex-wrap justify-center gap-2">{prompts.map((p) => <button key={p} onClick={() => send(p)} className="rounded-full border border-line px-3.5 py-1.5 text-sm hover:border-kafue">{p}</button>)}</div>
              </div>
            )}
            {msgs.map((m, i) => (
              <div key={i} className={cx("max-w-[85%] rounded-2xl px-4 py-3 text-sm", m.me ? "ml-auto bg-ink text-canvas" : "bg-surface-2")}>
                <p>{m.text}</p>
                {m.plan && (
                  <div className="mt-3 space-y-3">
                    <Badge tone="gold">Estimate</Badge>
                    <div className="grid gap-2 sm:grid-cols-2">
                      <div className="rounded-lg bg-surface p-3"><p className="font-semibold">Venue</p><p>Levy Park Amphitheatre (2,500) or Mulungushi Main Hall (2,000). Need 1,000 capacity plus 15% for staff and guests.</p></div>
                      <div className="rounded-lg bg-surface p-3"><p className="font-semibold">Tickets</p><p>Early bird K150 (200), Standard K250 (650), VIP K700 (150). Gross if sold out: {kwacha(267_500)}.</p></div>
                    </div>
                    <table className="w-full rounded-lg bg-surface text-left">
                      <tbody>{[["Venue hire", 38_000], ["Artists", 90_000], ["Sound and lighting", 35_000], ["Security (20 guards)", 14_000], ["Marketing", 15_000], ["Staff and scanners", 6_000], ["Contingency 10%", 19_800]].map(([k, v]) => <tr key={k as string} className="border-b border-line last:border-0"><td className="px-3 py-1.5">{k}</td><td className="px-3 py-1.5 text-right">{kwacha(v as number)}</td></tr>)}</tbody>
                    </table>
                    <p>Break-even at about 860 tickets. Start promotion 6 weeks out: teaser, early bird, line-up reveal, last-chance SMS.</p>
                    <div className="flex flex-wrap gap-2"><Button size="sm" onClick={() => toast("Draft event created with tickets and checklist")}><Sparkles size={14} /> Create draft event from this</Button><Button size="sm" variant="secondary">Save as budget</Button></div>
                  </div>
                )}
              </div>
            ))}
          </div>
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="mt-4 flex gap-2 border-t border-line pt-4">
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask about planning, pricing, budgets or feedback" className="flex-1 rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm focus:border-kafue focus:outline-none" />
            <Button type="submit" aria-label="Send"><Send size={16} /></Button>
          </form>
        </Card>
        <Card>
          <p className="font-semibold">What it can do</p>
          <ul className="mt-2 space-y-1.5 text-sm text-ink-2">{["Event descriptions and social posts", "Budget categories and estimates", "Venue and vendor suggestions", "Checklists and timelines", "Ticket pricing ideas", "Attendance forecasts", "Review summaries and themes"].map((x) => <li key={x}>{x}</li>)}</ul>
        </Card>
      </div>
    </>
  );
}
