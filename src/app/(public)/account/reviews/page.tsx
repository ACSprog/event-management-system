"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Button, Card, cx, Field, Input, PageHeader, Stars, Textarea, useToast } from "@/components/ui";

const aspects = ["Organisation", "Venue", "Sound and lighting", "Security", "Customer service", "Ticket buying", "Value for money"];

export default function Reviews() {
  const toast = useToast();
  const [overall, setOverall] = useState(0);
  const [scores, setScores] = useState<Record<string, number>>({});
  const [vis, setVis] = useState("Public");
  const [body, setBody] = useState("");
  const [rec, setRec] = useState<boolean | null>(null);
  const [err, setErr] = useState("");
  const submit = () => {
    if (!overall) return setErr("Choose an overall star rating.");
    if (body.trim().length < 20) return setErr("Tell other people a little more (at least 20 characters).");
    setErr("");
    toast(vis === "Private" ? "Feedback sent privately to the organiser" : "Review published. You can edit it for 14 days.");
  };
  return (
    <>
      <PageHeader title="Review your night" sub="Zed Live Sessions: October, 24 October 2026" />
      <Card className="space-y-6">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-leaf"><BadgeCheck size={16} /> You checked in at Gate A at 19:12, so your review is marked as verified.</p>
        <div>
          <p className="mb-2 font-semibold">Overall</p>
          <Stars value={overall} onChange={setOverall} size={30} />
        </div>
        <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {aspects.map((a) => (
            <div key={a} className="flex items-center justify-between gap-3 text-sm">
              <span>{a}</span>
              <Stars value={scores[a] ?? 0} onChange={(v) => setScores({ ...scores, [a]: v })} size={18} />
            </div>
          ))}
        </div>
        <Field label="Headline"><Input placeholder="Sum it up in a few words" /></Field>
        <Field label="Your review" error={err}><Textarea value={body} onChange={(e) => setBody(e.target.value)} placeholder="What went well? What should they fix next time?" /></Field>
        <div>
          <p className="mb-2 text-sm font-medium">Would you recommend this organiser?</p>
          <div className="flex gap-2">
            {[true, false].map((v) => <button key={String(v)} onClick={() => setRec(v)} className={cx("rounded-lg border-2 px-4 py-2 text-sm font-semibold", rec === v ? "border-kafue bg-kafue-soft" : "border-line")}>{v ? "Yes" : "No"}</button>)}
          </div>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium">Who can see this?</p>
          <div className="grid gap-2 sm:grid-cols-3">
            {[
              { v: "Public", d: "Shown with your first name and last initial" },
              { v: "Anonymous", d: "Shown publicly without your name" },
              { v: "Private", d: "Only the organiser sees it" },
            ].map((o) => (
              <button key={o.v} onClick={() => setVis(o.v)} className={cx("rounded-xl border-2 p-3 text-left", vis === o.v ? "border-kafue bg-kafue-soft" : "border-line")}>
                <p className="font-semibold">{o.v}</p><p className="text-xs text-ink-3">{o.d}</p>
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-between border-t border-line pt-4">
          <Button variant="ghost">Add photos</Button>
          <Button onClick={submit}>{vis === "Private" ? "Send feedback" : "Publish review"}</Button>
        </div>
      </Card>
    </>
  );
}
