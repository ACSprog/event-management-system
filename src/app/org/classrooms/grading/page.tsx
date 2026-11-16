"use client";

import { useState } from "react";
import { Badge, Button, Card, Input, PageHeader, Textarea, useToast } from "@/components/ui";
import { api } from "@/lib/api";

export default function Grading() {
  const toast = useToast();
  const [subs, setSubs] = useState(api.learning.submissions());
  const [sel, setSel] = useState(5);
  const [grade, setGrade] = useState("");
  const s = subs[sel];
  return (
    <>
      <PageHeader back={{ href: "/org/classrooms/", label: "Classes" }} title="Grading" sub="Bookkeeping for Small Business: Monthly cash book" />
      <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
        <Card pad={false}>
          <ul className="divide-y divide-line">
            {subs.map((x, i) => (
              <li key={x.student}><button onClick={() => { setSel(i); setGrade(""); }} className={`flex w-full items-center justify-between px-4 py-3 text-left text-sm ${i === sel ? "bg-kafue-soft" : "hover:bg-surface-2"}`}>
                <span><span className="block font-semibold">{x.student}</span><span className="text-xs text-ink-3">Submitted {x.submitted}{x.late && ", late"}</span></span>
                {x.grade !== null ? <Badge tone="green">{x.grade}%</Badge> : <Badge tone="gold">To grade</Badge>}
              </button></li>
            ))}
          </ul>
        </Card>
        <Card className="space-y-4">
          <div className="flex justify-between"><p className="text-lg font-semibold">{s.student}</p>{s.late && <Badge tone="red">Late by 1 day</Badge>}</div>
          <div className="rounded-lg border border-line bg-surface-2 p-6 text-sm text-ink-2">cash-book-november.xlsx, 3 sheets. Opening balance K4,200, 38 entries, closing balance K6,915.</div>
          <div className="grid gap-4 sm:grid-cols-[140px_1fr]">
            <label className="text-sm font-medium">Score (%)<Input className="mt-1.5" inputMode="numeric" value={grade} onChange={(e) => setGrade(e.target.value.replace(/\D/g, "").slice(0, 3))} /></label>
            <label className="text-sm font-medium">Feedback<Textarea className="mt-1.5" rows={3} placeholder="What did they do well? What should they fix?" /></label>
          </div>
          <div className="flex justify-end"><Button disabled={!grade || Number(grade) > 100} onClick={() => { setSubs(subs.map((x, i) => (i === sel ? { ...x, grade: Number(grade) } : x))); toast(`Grade saved and ${s.student.split(" ")[0]} notified`); }}>Save grade</Button></div>
        </Card>
      </div>
    </>
  );
}
