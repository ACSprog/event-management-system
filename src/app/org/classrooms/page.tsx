"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge, Button, Card, PageHeader, Progress, SectionTitle, Stat, Table } from "@/components/ui";
import { Bars } from "@/components/ui/charts";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function OrgClassrooms() {
  return (
    <>
      <PageHeader title="Classes" sub="Online courses run on your connected Zoom account. Give a team member the Event manager role to let them teach and grade." actions={<><Button variant="secondary" href="/org/classrooms/grading/">Grading (3)</Button><Button href="/org/classrooms/new/"><Plus size={15} /> New course</Button></>} />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
        <Stat label="Students enrolled" value="175" />
        <Stat label="Course revenue, year" value={kwacha(181_800)} />
        <Stat label="Attendance rate" value="84%" />
        <Stat label="Certificates issued" value="46" />
      </div>
      <div className="mb-6 grid gap-6 xl:grid-cols-2">
        <Card><SectionTitle title="Attendance by lesson" sub="Bookkeeping for Small Business" /><Bars data={api.learning.dashboard().attendanceByLesson} x="lesson" keys={["present", "absent"]} labels={["Present", "Absent"]} stacked height={200} /></Card>
        <Card><SectionTitle title="Assessment results" sub="All classes, latest assignment" /><Bars data={api.learning.dashboard().scores} x="band" keys={["students"]} labels={["Students"]} height={200} /></Card>
      </div>
      <Table rows={api.learning.classrooms()} columns={[
        { key: "name", label: "Classroom", render: (c) => <Link href="/org/classrooms/class/" className="font-semibold hover:underline">{c.name}</Link> },
        { key: "code", label: "Classroom code", render: (c) => <span className="font-mono text-xs">{c.code}</span> },
        { key: "instructor", label: "Instructor" },
        { key: "students", label: "Students", render: (c) => `${c.students} / ${c.capacity}` },
        { key: "completion", label: "Completion", render: (c) => <div className="w-28"><Progress value={c.completion} /><p className="text-xs text-ink-3">{c.completion}%</p></div> },
        { key: "revenue", label: "Revenue", align: "right", render: (c) => kwacha(c.revenue) },
        { key: "status", label: "Status", render: (c) => <Badge tone={c.status === "Completed" ? "grey" : c.status === "Enrolling" ? "teal" : "green"}>{c.status}</Badge> },
      ]} />
    </>
  );
}
