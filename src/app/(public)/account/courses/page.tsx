import { CalendarClock, FileText, PlayCircle, Video } from "lucide-react";
import { Badge, Button, Card, PageHeader, Progress } from "@/components/ui";
import { api } from "@/lib/api";
import { fmtDate, fmtTime } from "@/lib/brand";

export default function Courses() {
  const sessions = api.learning.sessions();
  return (
    <>
      <PageHeader title="My courses" />
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Badge tone="teal">Starts 12 January</Badge>
            <h2 className="mt-2 text-xl font-semibold">Digital Marketing Bootcamp</h2>
            <p className="text-sm text-ink-3">SkillUp Academy, with Natasha Phiri. Classroom code EMS-CLS-2026-00482</p>
          </div>
          <Button disabled><Video size={16} /> Join lesson (opens 15 min before)</Button>
        </div>
        <div className="mt-5 flex items-center gap-3 text-sm"><Progress value={0} className="flex-1" /><span className="text-ink-3">0 of 12 lessons</span></div>
        <p className="mt-3 text-xs text-ink-3">Your personal Zoom link is created for you. Please don&rsquo;t share it: it only lets one person in.</p>
      </Card>
      <h2 className="mb-3 mt-8 text-lg font-semibold">Lessons</h2>
      <ul className="divide-y divide-line rounded-xl border border-line bg-surface">
        {sessions.map((s) => (
          <li key={s.n} className="flex items-center gap-4 px-5 py-3">
            <span className="w-7 text-sm font-semibold text-ink-3">{s.n}</span>
            <div className="flex-1"><p className="font-medium">{s.title}</p><p className="flex items-center gap-1 text-xs text-ink-3"><CalendarClock size={12} /> {fmtDate(s.date)}, {fmtTime(s.date)}</p></div>
            <span className="flex gap-3 text-ink-3"><FileText size={16} aria-label="Materials" /><PlayCircle size={16} aria-label="Recording after the lesson" /></span>
          </li>
        ))}
      </ul>
    </>
  );
}
