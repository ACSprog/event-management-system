"use client";

import { SelectOther } from "@/components/select-other";

import { useState } from "react";
import { Button, Card, cx, Field, Input, PageHeader, Select, Textarea, Toggle, useToast } from "@/components/ui";

const models = ["Free", "Pay per lesson", "One payment for the course", "Monthly subscription", "Instalments", "Members get a discount"];

export default function NewCourse() {
  const toast = useToast();
  const [chosen, setChosen] = useState(["One payment for the course", "Pay per lesson"]);
  const [zoom, setZoom] = useState(true);
  const [waiting, setWaiting] = useState(true);
  return (
    <>
      <PageHeader title="New course" back={{ href: "/org/classrooms/", label: "Classes" }} />
      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="space-y-4">
          <Field label="Course name"><Input placeholder="e.g. Excel for Beginners" /></Field>
          <Field label="Description"><Textarea /></Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectOther label="Format" options={["Multi-lesson course", "Single workshop", "Recurring class", "Training programme"]} prompt="What kind of class is it?" placeholder="e.g. Bootcamp, Mentorship programme" />
            <Field label="Lessons"><Input defaultValue="8" /></Field>
            <Field label="Schedule"><Select options={["Tuesdays and Thursdays", "Weekly", "Custom dates"]} /></Field>
            <Field label="Start time"><Input type="time" defaultValue="18:00" /></Field>
            <Field label="Capacity"><Input defaultValue="40" /></Field>
            <SelectOther label="Assistant instructor" options={["None", "Joseph Zulu"]} other="Someone else (invite them)" prompt="Their email address" placeholder="name@example.com" />
          </div>
          <p className="rounded-lg bg-surface-2 p-3 text-sm">A permanent classroom code (like EMS-CLS-2026-00513) is created when you save. It&rsquo;s never reused, even if the class is deleted.</p>
        </Card>
        <div className="space-y-6">
          <Card className="space-y-4">
            <p className="font-semibold">How students pay</p>
            <div className="flex flex-wrap gap-2">{models.map((m) => <button key={m} onClick={() => setChosen(chosen.includes(m) ? chosen.filter((x) => x !== m) : [...chosen, m])} className={cx("rounded-full border-2 px-3.5 py-1.5 text-sm font-medium", chosen.includes(m) ? "border-kafue bg-kafue text-white" : "border-line")}>{m}</button>)}</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full course price (K)"><Input defaultValue="1,200" /></Field>
              <Field label="Single lesson price (K)"><Input defaultValue="150" /></Field>
            </div>
          </Card>
          <Card className="space-y-1">
            <p className="font-semibold">Zoom</p>
            <Toggle checked={zoom} onChange={setZoom} label="Create a Zoom meeting for each lesson automatically" />
            <Toggle checked={waiting} onChange={setWaiting} label="Waiting room and registration required" />
            <p className="text-xs text-ink-3">Connected account: training@skillup.example</p>
          </Card>
          <div className="flex justify-end gap-2"><Button variant="secondary" onClick={() => toast("Draft saved")}>Save draft</Button><Button onClick={() => toast("Course created. Classroom code EMS-CLS-2026-00513 assigned.")}>Create course</Button></div>
        </div>
      </div>
    </>
  );
}
