"use client";

import { useState } from "react";
import { Award, Copy, FileText, Link2, Plus, Upload, Video } from "lucide-react";
import { Avatar, Badge, Button, Card, cx, Field, Input, Modal, PageHeader, SectionTitle, Select, Table, Tabs, Textarea, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { fmtDate, fmtTime } from "@/lib/brand";

export default function Classroom() {
  const toast = useToast();
  const [tab, setTab] = useState("Lessons");
  const sessions = api.learning.sessions();
  const students = api.events.attendees().slice(0, 14);
  const [quizzes, setQuizzes] = useState(api.learning.quizzes());
  const [newQuiz, setNewQuiz] = useState(false);
  const [quiz, setQuiz] = useState({ title: "", questions: [{ q: "", options: "", answer: 0 }] });
  const [quizErr, setQuizErr] = useState("");
  const [color, setColor] = useState("#0B7A75");
  const att = api.learning.attendance();
  return (
    <>
      <PageHeader back={{ href: "/org/classrooms/", label: "Classes" }} title="Digital Marketing Bootcamp" sub={<span className="flex flex-wrap items-center gap-2">Classroom code <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-ink">EMS-CLS-2026-00482</span> <button aria-label="Copy code" onClick={() => toast("Code copied")}><Copy size={13} /></button> 61 of 80 students</span>}
        actions={<><Button variant="secondary" onClick={() => toast("Zoom meetings created for lessons 7 to 12")}><Video size={15} /> Create remaining Zoom meetings</Button><Button><Plus size={15} /> Add lesson</Button></>} />
      <Card className="mb-6 bg-surface-2 text-sm"><p>The classroom code identifies this class on receipts and certificates. It never lets anyone in by itself: each paid student gets a personal Zoom registration link, and a waiting room is on for every lesson.</p></Card>
      <Tabs tabs={["Lessons", "Students", "Materials", "Assessments", "Attendance", "Certificates", "Branding"]} value={tab} onChange={setTab} />
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
      {tab === "Assessments" && (
        <div className="space-y-6">
          <div>
            <SectionTitle title="Assignments" sub="Students upload a file; you grade it by hand." action={<Button size="sm" variant="secondary"><Plus size={14} /> New assignment</Button>} />
            <Table rows={api.learning.assignments()} columns={[{ key: "title", label: "Assignment", render: (a) => <span className="font-semibold">{a.title}</span> }, { key: "due", label: "Due" }, { key: "s", label: "Submitted", render: (a) => `${a.submitted} / ${a.total}` }, { key: "status", label: "Status", render: (a) => <Badge>{a.status}</Badge> }]} />
          </div>
          <div>
            <SectionTitle title="Quizzes" sub="Multiple choice, marked automatically. Students see their score straight away." action={<Button size="sm" onClick={() => setNewQuiz(true)}><Plus size={14} /> New quiz</Button>} />
            <Table rows={quizzes} columns={[{ key: "title", label: "Quiz", render: (q) => <span className="font-semibold">{q.title}</span> }, { key: "questions", label: "Questions", align: "right" }, { key: "marking", label: "Marking" }, { key: "opens", label: "Opens" }, { key: "taken", label: "Taken", align: "right" }, { key: "average", label: "Average", align: "right", render: (q) => (q.average ? `${q.average}%` : "—") }]} />
          </div>
        </div>
      )}
      {tab === "Attendance" && (
        <div className="space-y-4">
          <Card className="text-sm text-ink-3">Attendance is recorded from Zoom when each lesson ends: present if someone stayed at least 30 minutes. This class starts on 12 January, so here is Bookkeeping for Small Business, which is under way.</Card>
          <Card pad={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b border-line text-ink-3"><th className="px-5 py-3 text-left font-medium">Student</th>{att.lessons.map((l) => <th key={l} className="px-2 py-3 text-center font-medium">{l}</th>)}<th className="px-5 py-3 text-right font-medium">Rate</th></tr></thead>
                <tbody>
                  {att.students.map((st) => {
                    const rate = Math.round((st.marks.filter((m) => m !== "A").length / st.marks.length) * 100);
                    return (
                      <tr key={st.name} className="border-b border-line last:border-0">
                        <td className="px-5 py-2.5 font-medium">{st.name}</td>
                        {st.marks.map((m, i) => <td key={i} className="text-center"><span className={cx("inline-flex h-6 w-6 items-center justify-center rounded text-xs font-bold", m === "P" ? "bg-leaf-soft text-leaf" : m === "L" ? "bg-marigold-soft text-[#7a4b00]" : "bg-hibiscus-soft text-hibiscus")} aria-label={m === "P" ? "Present" : m === "L" ? "Late" : "Absent"}>{m}</span></td>)}
                        <td className={cx("px-5 py-2.5 text-right font-semibold", rate < 80 && "text-hibiscus")}>{rate}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="border-t border-line px-5 py-3 text-xs text-ink-3">P present, L late, A absent. Students under 80% are below the certificate rule and get an automatic reminder.</p>
          </Card>
        </div>
      )}
      {tab === "Branding" && (
        <Card className="space-y-4">
          <SectionTitle title="How this class looks to students" />
          <div><p className="mb-2 text-sm font-medium">Colour</p><div className="flex gap-2">{["#0B7A75", "#172033", "#5B2A86", "#D62F45", "#C77C3A"].map((c) => <button key={c} onClick={() => setColor(c)} aria-label={`Use ${c}`} aria-pressed={color === c} className={cx("h-9 w-9 rounded-full ring-offset-2 ring-offset-surface", color === c && "ring-2 ring-kafue")} style={{ background: c }} />)}</div></div>
          <Field label="Welcome message"><Textarea defaultValue="Welcome! Lessons are live on Tuesdays and Thursdays at 18:00. Recordings appear here the next morning." /></Field>
          <Field label="Logo or cover image"><div className="rounded-lg border-2 border-dashed border-line p-5 text-center text-sm text-ink-3">Upload a PNG or JPG</div></Field>
          <div className="rounded-xl p-5 text-white" style={{ background: color }}><p className="text-xs opacity-80">Preview</p><p className="font-display text-xl font-bold">Digital Marketing Bootcamp</p><p className="text-sm opacity-90">SkillUp Academy, with Natasha Phiri</p></div>
          <div className="flex justify-end"><Button onClick={() => toast("Class branding saved")}>Save</Button></div>
        </Card>
      )}
      {tab === "Certificates" && <Card className="flex flex-wrap items-center justify-between gap-4"><div><p className="font-semibold">Completion rule</p><p className="text-sm text-ink-3">Attend 10 of 12 lessons and pass the final project (60% or more).</p></div><Button variant="secondary"><Award size={15} /> Preview certificate</Button></Card>}
      <Modal open={newQuiz} onClose={() => setNewQuiz(false)} title="New quiz" footer={<><Button variant="ghost" onClick={() => setNewQuiz(false)}>Cancel</Button><Button onClick={() => {
        if (quiz.title.trim().length < 3) return setQuizErr("Give the quiz a name.");
        if (quiz.questions.some((q) => !q.q.trim() || q.options.split(",").filter((o) => o.trim()).length < 2)) return setQuizErr("Each question needs text and at least two choices.");
        setQuizzes([...quizzes, { title: quiz.title, questions: quiz.questions.length, marking: "Automatic", opens: "2027-01-26", taken: 0, average: null }]);
        setQuiz({ title: "", questions: [{ q: "", options: "", answer: 0 }] }); setQuizErr(""); setNewQuiz(false); toast("Quiz saved");
      }}>Save quiz</Button></>}>
        <div className="space-y-4">
          <Field label="Quiz name" error={quizErr}><Input value={quiz.title} onChange={(e) => setQuiz({ ...quiz, title: e.target.value })} placeholder="e.g. Quiz 3: Paid ads" /></Field>
          {quiz.questions.map((q, i) => {
            const opts = q.options.split(",").map((o) => o.trim()).filter(Boolean);
            return (
              <div key={i} className="space-y-2 rounded-lg border border-line p-3">
                <Field label={`Question ${i + 1}`}><Input value={q.q} onChange={(e) => setQuiz({ ...quiz, questions: quiz.questions.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)) })} /></Field>
                <Field label="Choices, separated by commas"><Input value={q.options} onChange={(e) => setQuiz({ ...quiz, questions: quiz.questions.map((x, j) => (j === i ? { ...x, options: e.target.value } : x)) })} placeholder="Facebook, TikTok, Billboards" /></Field>
                {opts.length > 1 && <Field label="Correct answer"><Select value={opts[q.answer] ?? opts[0]} onChange={(e) => setQuiz({ ...quiz, questions: quiz.questions.map((x, j) => (j === i ? { ...x, answer: opts.indexOf(e.target.value) } : x)) })} options={opts} /></Field>}
              </div>
            );
          })}
          <Button size="sm" variant="secondary" onClick={() => setQuiz({ ...quiz, questions: [...quiz.questions, { q: "", options: "", answer: 0 }] })}><Plus size={14} /> Add question</Button>
        </div>
      </Modal>
    </>
  );
}
