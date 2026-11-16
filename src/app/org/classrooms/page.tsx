"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge, Button, PageHeader, Progress, Stat, Table } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function OrgClassrooms() {
  return (
    <>
      <PageHeader title="Classes" sub="Online courses run on your connected Zoom account. Give a team member the Event manager role to let them teach and grade." actions={<><Button variant="secondary" href="/org/classrooms/grading/">Grading (3)</Button><Button href="/org/classrooms/new/"><Plus size={15} /> New course</Button></>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Students enrolled" value="175" />
        <Stat label="Course revenue, year" value={kwacha(181_800)} />
        <Stat label="Attendance rate" value="84%" />
        <Stat label="Certificates issued" value="46" />
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
