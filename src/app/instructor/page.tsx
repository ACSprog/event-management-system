"use client";

import Link from "next/link";
import { Video } from "lucide-react";
import { Badge, Button, Card, PageHeader, Progress, SectionTitle, Stat } from "@/components/ui";
import { api } from "@/lib/api";
import { fmtDate, fmtTime, kwacha } from "@/lib/brand";

export default function InstructorHome() {
  const cls = api.learning.classrooms();
  return (
    <>
      <PageHeader title="Good afternoon, Natasha" sub="Your next live lesson is in 2 days." />
      <Card className="flex flex-wrap items-center justify-between gap-4 border-kafue bg-kafue-soft">
        <div><p className="text-sm text-kafue-ink">Next lesson</p><p className="text-xl font-semibold">Project Management Essentials, lesson 6: Risk registers</p><p className="text-sm text-ink-2">Thursday 19 November, 17:30. 24 students registered on Zoom.</p></div>
        <Button><Video size={16} /> Start Zoom meeting</Button>
      </Card>
      <div className="mt-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Students" value="175" />
        <Stat label="Attendance, last 4 weeks" value="84%" />
        <Stat label="Waiting to be graded" value="3" />
        <Stat label="Course revenue, year" value={kwacha(181_800)} />
      </div>
      <SectionTitle title="Your classrooms" />
      <div className="grid gap-4 md:grid-cols-2">
        {cls.map((c) => (
          <Link key={c.id} href="/instructor/classroom/"><Card className="h-full hover:border-kafue">
            <div className="flex items-start justify-between"><p className="font-semibold">{c.name}</p><Badge tone={c.status === "Completed" ? "grey" : c.status === "Enrolling" ? "teal" : "green"}>{c.status}</Badge></div>
            <p className="font-mono text-xs text-ink-3">{c.code}</p>
            <p className="mt-3 text-sm">{c.students} of {c.capacity} students, {c.sessions} lessons</p>
            <Progress value={c.completion} className="mt-2" /><p className="mt-1 text-xs text-ink-3">{c.completion}% complete{c.next !== "—" && `. Next: ${fmtDate(c.next)}, ${fmtTime(c.next)}`}</p>
          </Card></Link>
        ))}
      </div>
    </>
  );
}
