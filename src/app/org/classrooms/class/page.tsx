"use client";

import { useState } from "react";
import { Award, Copy, FileText, Link2, Plus, Upload, Video } from "lucide-react";
import { Avatar, Badge, Button, Card, PageHeader, SectionTitle, Table, Tabs, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { fmtDate, fmtTime } from "@/lib/brand";

export default function Classroom() {
  const toast = useToast();
  const [tab, setTab] = useState("Lessons");
  const sessions = api.learning.sessions();
  const students = api.events.attendees().slice(0, 14);
  return (
    <>
      <PageHeader back={{ href: "/org/classrooms/", label: "Classes" }} title="Digital Marketing Bootcamp" sub={<span className="flex flex-wrap items-center gap-2">Classroom code <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-ink">EMS-CLS-2026-00482</span> <button aria-label="Copy code" onClick={() => toast("Code copied")}><Copy size={13} /></button> 61 of 80 students</span>}
        actions={<><Button variant="secondary" onClick={() => toast("Zoom meetings created for lessons 7 to 12")}><Video size={15} /> Create remaining Zoom meetings</Button><Button><Plus size={15} /> Add lesson</Button></>} />
      <Card className="mb-6 bg-surface-2 text-sm"><p>The classroom code identifies this class on receipts and certificates. It never lets anyone in by itself: each paid student gets a personal Zoom registration link, and a waiting room is on for every lesson.</p></Card>
      <Tabs tabs={["Lessons", "Students", "Materials", "Assessments", "Attendance", "Certificates"]} value={tab} onChange={setTab} />
      {tab === "Lessons" && <Table rows={sessions} columns={[
        { key: "n", label: "#" }, { key: "title", label: "Lesson", render: (s) => <span className="font-semibold">{s.title}</span> },
        { key: "date", label: "When", render: (s) => `${fmtDate(s.date)}, ${fmtTime(s.date)}` },
        { key: "zoom", label: "Zoom", render: (s) => <Badge tone={s.zoom === "Meeting created" ? "green" : "grey"}>{s.zoom}</Badge> },
        { key: "price", label: "Single-lesson price", align: "right", render: (s) => `K${s.price}` },
      ]} />}
      {tab === "Students" && <Table rows={students} columns={[
        { key: "name", label: "Student", render: (a) => <div className="flex items-center gap-2.5"><Avatar name={a.name} size={28} /><span className="font-semibold">{a.name}</span></div> },
        { key: "email", label: "Email" },
        { key: "plan", label: "Access", render: () => <Badge tone="teal">Full course</Badge> },
        { key: "z", label: "Zoom link", render: (a) => <Badge tone={a.id === "a3" ? "gold" : "green"}>{a.id === "a3" ? "Revoked" : "Issued"}</Badge> },
      ]} />}
      {tab === "Materials" && (
        <Card>
          <SectionTitle title="Materials" action={<Button size="sm"><Upload size={14} /> Upload</Button>} />
          <ul className="divide-y divide-line text-sm">
            {[["Course handbook.pdf", "2.4 MB", FileText], ["Lesson 1 slides.pdf", "5.1 MB", FileText], ["Meta Business Suite guide", "Link", Link2], ["Recording, info session 3 Dec", "48 min", Video]].map(([n, s, I]) => { const Icon = I as typeof FileText; return <li key={n as string} className="flex items-center gap-3 py-3"><Icon size={16} className="text-kafue" /><span className="flex-1 font-medium">{n as string}</span><span className="text-ink-3">{s as string}</span></li>; })}
          </ul>
        </Card>
      )}
      {tab === "Assessments" && <Table rows={api.learning.assignments()} columns={[{ key: "title", label: "Assignment", render: (a) => <span className="font-semibold">{a.title}</span> }, { key: "due", label: "Due" }, { key: "s", label: "Submitted", render: (a) => `${a.submitted} / ${a.total}` }, { key: "status", label: "Status", render: (a) => <Badge>{a.status}</Badge> }]} />}
      {tab === "Attendance" && <Card><p className="text-sm text-ink-3">Attendance is recorded automatically from Zoom when each lesson ends. Lessons start on 12 January.</p></Card>}
      {tab === "Certificates" && <Card className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-semibold">Completion rule</p><p className="text-sm text-ink-3">Attend 10 of 12 lessons and pass the final project (60% or more).</p></div><Button variant="secondary"><Award size={15} /> Preview certificate</Button></Card>}
    </>
  );
}
