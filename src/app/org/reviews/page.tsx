"use client";

import { useState } from "react";
import { ArrowDown, ArrowUp, BadgeCheck, CircleHelp, Flag, Lock, Plus, Send, Trash2 } from "lucide-react";
import { Badge, Button, Card, Checkbox, cx, Field, Input, PageHeader, Progress, SectionTitle, Select, Stars, Stat, Tabs, Textarea, useToast } from "@/components/ui";
import { Lines } from "@/components/ui/charts";
import { api } from "@/lib/api";
import { useOrgRole } from "@/components/layout/org-role";
import { fmtDate } from "@/lib/brand";
import type { SurveyQuestion } from "@/lib/mock/data";

const areas = ["Organisation", "Venue", "Sound and lighting", "Security", "Customer service", "Ticket buying", "Programme quality", "Value for money"] as const;
const themes = [
  { t: "Good performances", n: 211, tone: "green" }, { t: "Great atmosphere", n: 173, tone: "green" }, { t: "Quick entry", n: 152, tone: "green" },
  { t: "Parking problems", n: 64, tone: "red" }, { t: "Long bar queues", n: 48, tone: "red" }, { t: "Food ran out", n: 31, tone: "red" },
] as const;

export default function OrgReviews() {
  const toast = useToast();
  const { can } = useOrgRole();
  const [tab, setTab] = useState("Reviews");
  const [filter, setFilter] = useState("All");
  const [reply, setReply] = useState<Record<string, string>>({});
  const [followUps, setFollowUps] = useState(api.reviews.followUps());
  const [fu, setFu] = useState({ action: "", from: "", owner: "Mwila B.", due: "2026-12-10" });
  const [fuErr, setFuErr] = useState("");
  const [surveys, setSurveys] = useState(api.reviews.surveys());
  const [building, setBuilding] = useState(false);
  const [sTitle, setSTitle] = useState("Lusaka Summer Jam: quick feedback");
  const [qs, setQs] = useState<SurveyQuestion[]>([{ id: "n1", type: "Rating", text: "How was getting in at the gate?" }]);
  const reviews = api.reviews.forEvent();
  const shown = reviews.filter((r) => filter === "All" || (filter === "Verified" ? r.verified !== "Not verified" && r.visibility === "Public" : filter === "Not verified" ? r.verified === "Not verified" : filter === "Private" ? r.visibility !== "Public" : !r.reply && r.visibility === "Public"));
  const compare = api.reviews.compare();
  const now = compare[0];
  const prev = compare[1];

  const addFollowUp = (preset?: { action: string; from: string }) => {
    const item = preset ? { ...fu, ...preset } : fu;
    if (item.action.trim().length < 5) return setFuErr("Describe the action in a few words.");
    setFollowUps([{ id: `fu${Date.now()}`, action: item.action, from: item.from || "Added by hand", owner: item.owner, due: item.due, done: false }, ...followUps]);
    setFu({ ...fu, action: "", from: "" });
    setFuErr("");
    toast("Follow-up action added");
  };

  return (
    <>
      <PageHeader title="Reviews and feedback" sub="Zed Live Sessions: October" actions={<Select className="w-64" options={compare.map((c) => c.event)} aria-label="Event" />} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Average rating" value={now.overall} delta={`+${(now.overall - prev.overall).toFixed(1)}`} hint="vs previous event" />
        <Stat label="Reviews received" value={now.reviews} hint="from 1,189 checked in" />
        <Stat label="Would recommend" value={`${now.recommend}%`} hint="7% not sure, 5% no" />
        <Stat label="Waiting for a reply" value={reviews.filter((r) => !r.reply && r.visibility === "Public").length} />
      </div>

      <div className="mt-6">
        <Tabs tabs={["Reviews", "Insights", "Compare events", "Follow-up actions", "Surveys"]} value={tab} onChange={setTab} />
      </div>

      {tab === "Reviews" && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            {["All", "Needs reply", "Verified", "Not verified", "Private"].map((x) => (
              <button key={x} onClick={() => setFilter(x)} aria-pressed={filter === x} className={cx("rounded-full border px-3.5 py-1.5 text-sm font-medium", filter === x ? "border-ink bg-ink text-canvas" : "border-line bg-surface")}>{x}</button>
            ))}
          </div>
          <div className="space-y-4">
            {shown.map((r) => {
              const photos = api.reviews.photos(r.id);
              return (
                <Card key={r.id}>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2"><Stars value={r.rating} /><span className="font-semibold">{r.title}</span></div>
                    {r.visibility !== "Public" ? <Badge tone="grey"><Lock size={11} /> Private feedback</Badge>
                      : r.verified === "Not verified" ? <span className="flex items-center gap-1 text-xs font-semibold text-ink-3"><CircleHelp size={13} /> Not verified</span>
                      : <span className="flex items-center gap-1 text-xs font-semibold text-leaf"><BadgeCheck size={13} /> {r.verified}</span>}
                  </div>
                  <p className="mt-2 text-ink-2">{r.body}</p>
                  {photos.length > 0 && <p className="mt-1 text-xs text-ink-3">{photos.length} approved photo{photos.length > 1 ? "s" : ""}</p>}
                  <p className="mt-1 text-xs text-ink-3">{r.name}, {r.date}</p>
                  {r.reply ? (
                    <div className="mt-3 rounded-lg bg-surface-2 p-3 text-sm"><p className="font-semibold">Your public reply</p><p className="text-ink-2">{r.reply}</p></div>
                  ) : !can("reviews.reply") ? null : (
                    <div className="mt-3 space-y-2">
                      <Textarea rows={2} placeholder={r.visibility === "Public" ? "Reply publicly…" : "Reply privately to this attendee…"} value={reply[r.id] ?? ""} onChange={(e) => setReply({ ...reply, [r.id]: e.target.value })} />
                      <div className="flex flex-wrap justify-between gap-2">
                        <div className="flex gap-1">
                          <Button size="sm" variant="ghost" onClick={() => toast("Report sent to platform moderators. The review stays up while they check it.", "info")}><Flag size={14} /> Report</Button>
                          <Button size="sm" variant="ghost" onClick={() => addFollowUp({ action: `Fix: ${r.title}`, from: `Review by ${r.name}` })}><Plus size={14} /> Add follow-up</Button>
                        </div>
                        <Button size="sm" disabled={!reply[r.id]} onClick={() => toast(r.visibility === "Public" ? "Reply posted publicly" : "Private reply sent")}>{r.visibility === "Public" ? "Post reply" : "Send private reply"}</Button>
                      </div>
                    </div>
                  )}
                </Card>
              );
            })}
            {shown.length === 0 && <Card className="text-center text-ink-3">No reviews match this filter.</Card>}
            <p className="text-xs text-ink-3">Organisers can&rsquo;t delete reviews. You can report abuse, spam or personal details, and a platform moderator decides.</p>
          </div>
        </>
      )}

      {tab === "Insights" && (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <SectionTitle title="Star ratings" sub={`${now.reviews} reviews`} />
            <div className="space-y-2">
              {api.reviews.breakdown().map((d) => (
                <div key={d.stars} className="flex items-center gap-3 text-sm">
                  <span className="w-10 text-ink-3">{d.stars} ★</span>
                  <Progress value={d.pct} tone="marigold" className="flex-1" />
                  <span className="w-10 text-right font-semibold">{d.pct}%</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <SectionTitle title="Rating over time" sub="Average rating at each of your recent events" />
            <Lines data={api.reviews.trend()} x="short" keys={["rating"]} labels={["Average rating"]} height={200} />
          </Card>
          <Card>
            <SectionTitle title="Satisfaction by area" sub="Change against your previous event" />
            <ul className="space-y-3">
              {areas.map((a) => {
                const v = now[a]; const diff = +(v - prev[a]).toFixed(1);
                return (
                  <li key={a}>
                    <div className="flex justify-between text-sm"><span>{a}</span><span className="font-semibold">{v} <span className={cx("ml-1 text-xs", diff > 0 ? "text-leaf" : diff < 0 ? "text-hibiscus" : "text-ink-3")}>{diff > 0 ? `+${diff}` : diff === 0 ? "no change" : diff}</span></span></div>
                    <Progress value={(v / 5) * 100} tone={v < 4 ? "marigold" : "kafue"} className="mt-1" />
                  </li>
                );
              })}
            </ul>
          </Card>
          <div className="space-y-6">
            <Card>
              <SectionTitle title="What people mention" sub="Grouped automatically from reviews and survey answers" />
              <p className="mb-2 text-xs font-semibold text-leaf">Praised</p>
              <div className="flex flex-wrap gap-2">{themes.filter((t) => t.tone === "green").map((t) => <Badge key={t.t} tone="green">{t.t} ({t.n})</Badge>)}</div>
              <p className="mb-2 mt-4 text-xs font-semibold text-hibiscus">Complaints</p>
              <div className="flex flex-wrap gap-2">{themes.filter((t) => t.tone === "red").map((t) => <Badge key={t.t} tone="red">{t.t} ({t.n})</Badge>)}</div>
              <p className="mt-4 text-sm text-ink-2">Overall mood: <span className="font-semibold text-leaf">mostly positive</span>. Complaints are about getting out and food and drink, not the show itself.</p>
            </Card>
            <Card>
              <SectionTitle title="Suggestions for next time" />
              <ul className="divide-y divide-line">
                {api.reviews.suggestions().map((s) => (
                  <li key={s.text} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                    <div><p className="font-medium">{s.text}</p><p className="text-xs text-ink-3">{s.area}, {s.mentions} mentions</p></div>
                    <Button size="sm" variant="ghost" onClick={() => addFollowUp({ action: s.text, from: `Suggestion (${s.mentions} mentions)` })}><Plus size={14} /> Act on it</Button>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}

      {tab === "Compare events" && (
        <Card pad={false}>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-ink-3">
                  <th className="px-5 py-3 text-left font-medium">Score</th>
                  {compare.map((c) => <th key={c.event} className="px-3 py-3 text-right font-medium"><span className="block text-ink">{c.event}</span><span className="text-xs">{c.date}</span></th>)}
                </tr>
              </thead>
              <tbody>
                {(["overall", ...areas, "recommend", "reviews"] as const).map((k) => {
                  const vals = compare.map((c) => c[k] as number);
                  const best = Math.max(...vals); const worst = Math.min(...vals);
                  return (
                    <tr key={k} className="border-b border-line last:border-0">
                      <td className="px-5 py-2.5 font-medium">{k === "overall" ? "Overall" : k === "recommend" ? "Would recommend" : k === "reviews" ? "Number of reviews" : k}</td>
                      {vals.map((v, i) => (
                        <td key={i} className={cx("px-3 py-2.5 text-right tabular-nums", k !== "reviews" && v === best && "font-semibold text-leaf", k !== "reviews" && v === worst && "text-hibiscus")}>
                          {k === "recommend" ? `${v}%` : k === "reviews" ? v.toLocaleString() : v.toFixed(1)}
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="border-t border-line px-5 py-3 text-xs text-ink-3">Green is the best event for that score, red the weakest. Venue is your lowest score at three of four events.</p>
        </Card>
      )}

      {tab === "Follow-up actions" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
          <Card pad={false}>
            <ul className="divide-y divide-line">
              {followUps.map((f, i) => (
                <li key={f.id} className="flex flex-wrap items-start gap-3 px-5 py-4">
                  <Checkbox checked={f.done} onChange={(v) => { setFollowUps(followUps.map((x, j) => (j === i ? { ...x, done: v } : x))); if (v) toast("Marked as done"); }} label={<span className={f.done ? "text-ink-3 line-through" : "font-medium"}>{f.action}</span>} />
                  <div className="ml-auto text-right text-xs text-ink-3"><p>{f.owner}, due {fmtDate(f.due, { day: "numeric", month: "short" })}</p><p>From: {f.from}</p></div>
                </li>
              ))}
            </ul>
          </Card>
          <Card className="h-fit space-y-3">
            <SectionTitle title="Add an action" sub="Only your team sees these." />
            <Field label="What will you do?" error={fuErr}><Textarea rows={3} value={fu.action} onChange={(e) => setFu({ ...fu, action: e.target.value })} /></Field>
            <Field label="Because of"><Input value={fu.from} onChange={(e) => setFu({ ...fu, from: e.target.value })} placeholder="e.g. Parking complaints" /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Owner"><Select value={fu.owner} onChange={(e) => setFu({ ...fu, owner: e.target.value })} options={["Mwila B.", "Chanda M.", "Daliso M.", "Precious N."]} /></Field>
              <Field label="Due"><Input type="date" value={fu.due} onChange={(e) => setFu({ ...fu, due: e.target.value })} /></Field>
            </div>
            <Button className="w-full" onClick={() => addFollowUp()}>Add action</Button>
          </Card>
        </div>
      )}

      {tab === "Surveys" && (
        <div className="space-y-6">
          {!building && <div className="flex justify-end"><Button onClick={() => setBuilding(true)}><Plus size={15} /> New survey</Button></div>}
          {building && (
            <Card className="space-y-4">
              <SectionTitle title="New post-event survey" sub="Sent the morning after the event to people who checked in. Answers are private to your team." />
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Survey name"><Input value={sTitle} onChange={(e) => setSTitle(e.target.value)} /></Field>
                <Field label="Event"><Select options={["Lusaka Summer Jam", "New Year's Eve Countdown", "Copperbelt Nights: Kitwe"]} /></Field>
              </div>
              <ol className="space-y-3">
                {qs.map((q, i) => (
                  <li key={q.id} className="rounded-lg border border-line p-3">
                    <div className="flex flex-wrap items-end gap-3">
                      <span className="pb-2.5 text-sm font-semibold text-ink-3">{i + 1}</span>
                      <div className="min-w-48 flex-1"><Field label="Question"><Input value={q.text} onChange={(e) => setQs(qs.map((x, j) => (j === i ? { ...x, text: e.target.value } : x)))} /></Field></div>
                      <div className="w-40"><Field label="Answer type"><Select value={q.type} onChange={(e) => setQs(qs.map((x, j) => (j === i ? { ...x, type: e.target.value as SurveyQuestion["type"], options: e.target.value === "Choice" ? ["Option 1", "Option 2"] : undefined } : x)))} options={["Rating", "Choice", "Yes or no", "Short answer"]} /></Field></div>
                      <div className="flex gap-1 pb-1">
                        <Button size="sm" variant="ghost" aria-label="Move up" disabled={i === 0} onClick={() => { const n = [...qs]; [n[i - 1], n[i]] = [n[i], n[i - 1]]; setQs(n); }}><ArrowUp size={14} /></Button>
                        <Button size="sm" variant="ghost" aria-label="Move down" disabled={i === qs.length - 1} onClick={() => { const n = [...qs]; [n[i + 1], n[i]] = [n[i], n[i + 1]]; setQs(n); }}><ArrowDown size={14} /></Button>
                        <Button size="sm" variant="ghost" aria-label="Remove question" onClick={() => setQs(qs.filter((_, j) => j !== i))}><Trash2 size={14} /></Button>
                      </div>
                    </div>
                    {q.type === "Choice" && (
                      <div className="mt-2 pl-6"><Field label="Choices, separated by commas"><Input value={(q.options ?? []).join(", ")} onChange={(e) => setQs(qs.map((x, j) => (j === i ? { ...x, options: e.target.value.split(",").map((o) => o.trim()).filter(Boolean) } : x)))} /></Field></div>
                    )}
                  </li>
                ))}
              </ol>
              <Button size="sm" variant="secondary" onClick={() => setQs([...qs, { id: `n${Date.now()}`, type: "Short answer", text: "" }])}><Plus size={14} /> Add question</Button>
              <div className="flex justify-end gap-2 border-t border-line pt-4">
                <Button variant="ghost" onClick={() => setBuilding(false)}>Cancel</Button>
                <Button disabled={!qs.length || qs.some((q) => !q.text.trim())} onClick={() => {
                  setSurveys([{ id: `sv${Date.now()}`, title: sTitle, event: "Lusaka Summer Jam", status: "Scheduled for 13 Dec, 09:00", sent: 0, responses: 0, questions: qs, results: null }, ...surveys]);
                  setBuilding(false); toast("Survey scheduled for the morning after the event");
                }}><Send size={15} /> Schedule survey</Button>
              </div>
            </Card>
          )}
          {surveys.map((s) => (
            <Card key={s.id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><p className="font-semibold">{s.title}</p><p className="text-sm text-ink-3">{s.questions.length} questions</p></div>
                <div className="text-right">
                  <Badge tone={s.status === "Closed" ? "grey" : "teal"}>{s.status}</Badge>
                  {s.sent > 0 && <p className="mt-1 text-sm text-ink-3">{s.responses} of {s.sent.toLocaleString()} answered ({Math.round((s.responses / s.sent) * 100)}%)</p>}
                </div>
              </div>
              {s.results ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {s.questions.map((q) => (
                    <div key={q.id} className="rounded-lg bg-surface-2 p-4 text-sm">
                      <p className="mb-2 font-medium">{q.text}</p>
                      {q.id === "q1" && <><p className="font-display text-2xl font-bold">{s.results.q1.average} / 5</p><p className="text-xs text-ink-3">{s.results.q1.spread[0]}% gave 5 stars</p></>}
                      {q.id === "q2" && q.options?.map((o, i) => <div key={o} className="mb-1.5"><div className="flex justify-between text-xs"><span>{o}</span><span>{s.results!.q2.counts[i]}%</span></div><Progress value={s.results!.q2.counts[i]} className="mt-0.5" /></div>)}
                      {q.id === "q3" && <><p className="font-display text-2xl font-bold">{s.results.q3.yes}% yes</p><Progress value={s.results.q3.yes} className="mt-1" /></>}
                      {q.id === "q4" && <ul className="space-y-1 text-ink-2">{s.results.q4.samples.map((a) => <li key={a}>&ldquo;{a}&rdquo;</li>)}</ul>}
                    </div>
                  ))}
                </div>
              ) : (
                <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink-2">{s.questions.map((q) => <li key={q.id}>{q.text} <span className="text-ink-3">({q.type.toLowerCase()})</span></li>)}</ol>
              )}
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
