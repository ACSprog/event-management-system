"use client";

import { useState } from "react";
import { BadgeCheck, Flag, Lock } from "lucide-react";
import { Badge, Button, Card, PageHeader, Progress, SectionTitle, Stars, Stat, Textarea, useToast, Select } from "@/components/ui";
import { api } from "@/lib/api";
import { useOrgRole } from "@/components/layout/org-role";

export default function OrgReviews() {
  const toast = useToast();
  const { can } = useOrgRole();
  const [reply, setReply] = useState<Record<string, string>>({});
  const reviews = api.reviews.forEvent();
  const themes = [{ t: "Parking and exit", n: 64, tone: "red" }, { t: "Sound quality", n: 211, tone: "green" }, { t: "Bar queues", n: 48, tone: "red" }, { t: "Quick entry", n: 173, tone: "green" }, { t: "Food ran out", n: 31, tone: "red" }, { t: "Friendly security", n: 92, tone: "green" }];
  const aspects = [["Overall", 4.4], ["Organisation", 4.3], ["Venue", 3.9], ["Sound and lighting", 4.7], ["Security", 4.2], ["Ticket buying", 4.8], ["Value for money", 4.3]] as const;
  return (
    <>
      <PageHeader title="Reviews and feedback" sub="Zed Live Sessions: October" actions={<Select className="w-64" options={["Zed Live Sessions: October", "All events"]} aria-label="Event" />} />
      <div className="grid gap-4 sm:grid-cols-4">
        <Stat label="Average rating" value="4.4" hint="233 reviews" />
        <Stat label="Would recommend" value="88%" />
        <Stat label="Verified attendees" value="96%" hint="checked in at the gate" />
        <Stat label="Waiting for a reply" value="2" />
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[1fr_1.4fr]">
        <div className="space-y-6">
          <Card>
            <SectionTitle title="Scores by area" />
            <ul className="space-y-3">{aspects.map(([a, v]) => <li key={a}><div className="flex justify-between text-sm"><span>{a}</span><span className="font-semibold">{v}</span></div><Progress value={(v / 5) * 100} tone={v < 4 ? "marigold" : "kafue"} className="mt-1" /></li>)}</ul>
          </Card>
          <Card>
            <SectionTitle title="What people mention" sub="Grouped automatically from review text" />
            <div className="flex flex-wrap gap-2">{themes.map((t) => <Badge key={t.t} tone={t.tone as "red" | "green"}>{t.t} ({t.n})</Badge>)}</div>
            <div className="mt-4 rounded-lg bg-surface-2 p-3 text-sm"><p className="font-semibold">Corrective action logged</p><p className="text-ink-2">Parking: hire 12 marshals until 01:00 and open the north exit for Summer Jam. Owner: Mwila B.</p></div>
          </Card>
        </div>
        <div className="space-y-4">
          {reviews.map((r) => (
            <Card key={r.id}>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2"><Stars value={r.rating} /><span className="font-semibold">{r.title}</span></div>
                {r.visibility !== "Public" ? <Badge tone="grey"><Lock size={11} /> Private feedback</Badge> : <span className="flex items-center gap-1 text-xs font-semibold text-leaf"><BadgeCheck size={13} /> {r.verified}</span>}
              </div>
              <p className="mt-2 text-ink-2">{r.body}</p>
              <p className="mt-1 text-xs text-ink-3">{r.name}, {r.date}</p>
              {r.reply ? (
                <div className="mt-3 rounded-lg bg-surface-2 p-3 text-sm"><p className="font-semibold">Your public reply</p><p className="text-ink-2">{r.reply}</p></div>
              ) : !can("reviews.reply") ? null : (
                <div className="mt-3 space-y-2">
                  <Textarea rows={2} placeholder={r.visibility === "Public" ? "Reply publicly…" : "Reply privately to this attendee…"} value={reply[r.id] ?? ""} onChange={(e) => setReply({ ...reply, [r.id]: e.target.value })} />
                  <div className="flex justify-between">
                    <Button size="sm" variant="ghost" onClick={() => toast("Report sent to platform moderators. The review stays up while they check it.", "info")}><Flag size={14} /> Report</Button>
                    <Button size="sm" disabled={!reply[r.id]} onClick={() => toast("Reply posted")}>Post reply</Button>
                  </div>
                </div>
              )}
            </Card>
          ))}
          <p className="text-xs text-ink-3">Reviews can&rsquo;t be deleted by organisers. You can report abuse or spam, and a platform moderator will decide.</p>
        </div>
      </div>
    </>
  );
}
