"use client";

import { useEffect, useRef, useState } from "react";
import { BadgeCheck, Camera, Clock, Pencil, X } from "lucide-react";
import { Badge, Button, Card, cx, Field, Input, PageHeader, Stars, Tabs, Textarea, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { fmtDate } from "@/lib/brand";

const aspects = ["Organisation", "Venue", "Sound and lighting", "Security", "Customer service", "Ticket buying", "Programme quality", "Value for money"];
const EDIT_DAYS = 14;
const MAX_PHOTOS = 5;
const visibility = [
  { v: "Public", d: "Everyone sees it, with your first name and last initial (for example Chanda M.)." },
  { v: "Anonymous", d: "Everyone sees it, without your name. The organiser still can't see who wrote it." },
  { v: "Private", d: "Only the organiser sees it, with your name, so they can follow up with you." },
];

type Draft = { overall: number; scores: Record<string, number>; title: string; body: string; rec: string | null; vis: string; photos: { url: string; name: string }[]; survey: Record<string, string> };
const empty: Draft = { overall: 0, scores: {}, title: "", body: "", rec: null, vis: "Public", photos: [], survey: {} };

export default function Reviews() {
  const toast = useToast();
  const survey = api.reviews.surveys()[0];
  const [tab, setTab] = useState("Write a review");
  const [d, setD] = useState<Draft>(empty);
  const [saved, setSaved] = useState<(Draft & { at: string }) | null>(null);
  const [editing, setEditing] = useState(true);
  const [err, setErr] = useState("");
  const file = useRef<HTMLInputElement>(null);
  useEffect(() => () => d.photos.forEach((p) => URL.revokeObjectURL(p.url)), []); // eslint-disable-line react-hooks/exhaustive-deps

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const imgs = [...files].filter((f) => f.type.startsWith("image/") && f.size < 10 * 1024 * 1024);
    if (imgs.length < files.length) toast("Only images under 10 MB can be added", "error");
    setD({ ...d, photos: [...d.photos, ...imgs.map((f) => ({ url: URL.createObjectURL(f), name: f.name }))].slice(0, MAX_PHOTOS) });
  };
  const submit = () => {
    if (!d.overall) return setErr("Choose an overall star rating.");
    if (d.body.trim().length < 20) return setErr("Tell people a little more: at least 20 characters.");
    if (!d.rec) return setErr("Say whether you'd recommend it.");
    setErr("");
    const first = !saved;
    setSaved({ ...d, at: saved?.at ?? new Date().toISOString() });
    setEditing(false);
    toast(d.vis === "Private" ? "Feedback sent privately to the organiser" : first ? `Review published. You can edit it for ${EDIT_DAYS} days.` : "Review updated");
  };
  const editUntil = saved ? new Date(new Date(saved.at).getTime() + EDIT_DAYS * 864e5).toISOString() : "";

  return (
    <>
      <PageHeader title="Reviews" sub="One review per event. You can change it for 14 days after you post it." />
      <Tabs tabs={["Write a review", "Your reviews"]} value={tab} onChange={setTab} />

      {tab === "Write a review" && (
        <>
          <Card className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Zed Live Sessions: October</p>
              <p className="text-sm text-ink-3">Levy Park Amphitheatre, 24 October 2026. VIP ticket.</p>
            </div>
            <p className="flex items-center gap-1.5 text-sm font-semibold text-leaf"><BadgeCheck size={16} /> Verified: you checked in at Gate A at 19:12</p>
          </Card>

          {saved && !editing ? (
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><Stars value={saved.overall} size={20} /><p className="mt-1 text-lg font-semibold">{saved.title || "Your review"}</p></div>
                <div className="flex items-center gap-2">
                  <Badge tone={saved.vis === "Private" ? "grey" : "green"}>{saved.vis === "Private" ? "Private to organiser" : saved.vis === "Anonymous" ? "Public, anonymous" : "Public"}</Badge>
                  {saved.photos.length > 0 && <Badge tone="gold">{saved.photos.length} photo{saved.photos.length > 1 ? "s" : ""} waiting for approval</Badge>}
                </div>
              </div>
              <p className="mt-2 text-ink-2">{saved.body}</p>
              <p className="mt-2 text-sm text-ink-3">Recommend: {saved.rec}</p>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                <p className="flex items-center gap-1.5 text-sm text-ink-3"><Clock size={14} /> You can edit until {fmtDate(editUntil, { day: "numeric", month: "long" })}</p>
                <Button variant="secondary" onClick={() => { setD(saved); setEditing(true); }}><Pencil size={15} /> Edit review</Button>
              </div>
            </Card>
          ) : (
            <Card className="space-y-6">
              <div>
                <p className="mb-2 font-semibold">Overall experience</p>
                <Stars value={d.overall} onChange={(v) => setD({ ...d, overall: v })} size={30} />
              </div>
              <div>
                <p className="mb-2 text-sm font-medium">Rate each part <span className="font-normal text-ink-3">(optional)</span></p>
                <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
                  {aspects.map((a) => (
                    <div key={a} className="flex items-center justify-between gap-3 text-sm">
                      <span>{a}</span>
                      <Stars value={d.scores[a] ?? 0} onChange={(v) => setD({ ...d, scores: { ...d.scores, [a]: v } })} size={18} />
                    </div>
                  ))}
                </div>
              </div>
              <Field label="Headline"><Input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="Sum it up in a few words" /></Field>
              <Field label="Your review" error={err} hint="What did you enjoy? What went wrong? What should they change next time?">
                <Textarea value={d.body} onChange={(e) => setD({ ...d, body: e.target.value })} />
              </Field>
              <div>
                <p className="mb-2 text-sm font-medium">Would you recommend this event?</p>
                <div className="flex flex-wrap gap-2">
                  {["Yes", "No", "Not sure"].map((v) => (
                    <button key={v} onClick={() => setD({ ...d, rec: v })} aria-pressed={d.rec === v} className={cx("rounded-lg border-2 px-4 py-2 text-sm font-semibold", d.rec === v ? "border-kafue bg-kafue-soft" : "border-line")}>{v}</button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm font-medium">Photos <span className="font-normal text-ink-3">(optional, up to {MAX_PHOTOS})</span></p>
                <p className="mb-2 text-xs text-ink-3">Photos are checked by a moderator before anyone else sees them. Avoid close-ups of other people&rsquo;s faces, children, or number plates.</p>
                <div className="flex flex-wrap gap-2">
                  {d.photos.map((p, i) => (
                    <div key={p.url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-line">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                      <button onClick={() => { URL.revokeObjectURL(p.url); setD({ ...d, photos: d.photos.filter((_, j) => j !== i) }); }} aria-label={`Remove ${p.name}`} className="absolute right-1 top-1 rounded-full bg-black/60 p-0.5 text-white"><X size={12} /></button>
                    </div>
                  ))}
                  {d.photos.length < MAX_PHOTOS && (
                    <button onClick={() => file.current?.click()} className="flex h-20 w-20 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-line text-xs text-ink-3 hover:border-kafue">
                      <Camera size={18} /> Add
                    </button>
                  )}
                  <input ref={file} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
                </div>
              </div>

              <div>
                <p className="mb-2 text-sm font-medium">Who can see this?</p>
                <div className="grid gap-2 sm:grid-cols-3">
                  {visibility.map((o) => (
                    <button key={o.v} onClick={() => setD({ ...d, vis: o.v })} aria-pressed={d.vis === o.v} className={cx("rounded-xl border-2 p-3 text-left", d.vis === o.v ? "border-kafue bg-kafue-soft" : "border-line")}>
                      <p className="font-semibold">{o.v}</p><p className="text-xs text-ink-3">{o.d}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl bg-surface-2 p-4">
                <p className="font-semibold">A few questions from Zed Live <span className="text-sm font-normal text-ink-3">(optional, never shown publicly)</span></p>
                <div className="mt-3 space-y-4">
                  {survey.questions.map((q) => (
                    <div key={q.id}>
                      <p className="mb-1.5 text-sm font-medium">{q.text}</p>
                      {q.type === "Rating" && <Stars value={Number(d.survey[q.id] ?? 0)} onChange={(v) => setD({ ...d, survey: { ...d.survey, [q.id]: String(v) } })} size={20} />}
                      {(q.type === "Choice" || q.type === "Yes or no") && (
                        <div className="flex flex-wrap gap-2">
                          {(q.options ?? ["Yes", "No"]).map((o) => (
                            <button key={o} onClick={() => setD({ ...d, survey: { ...d.survey, [q.id]: o } })} aria-pressed={d.survey[q.id] === o} className={cx("rounded-full border px-3 py-1.5 text-sm", d.survey[q.id] === o ? "border-kafue bg-kafue text-white" : "border-line bg-surface")}>{o}</button>
                          ))}
                        </div>
                      )}
                      {q.type === "Short answer" && <Input value={d.survey[q.id] ?? ""} onChange={(e) => setD({ ...d, survey: { ...d.survey, [q.id]: e.target.value } })} />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 border-t border-line pt-4">
                {saved && <Button variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>}
                <Button onClick={submit}>{saved ? "Save changes" : d.vis === "Private" ? "Send feedback" : "Publish review"}</Button>
              </div>
            </Card>
          )}
        </>
      )}

      {tab === "Your reviews" && (
        <div className="space-y-4">
          {saved && (
            <Card>
              <div className="flex justify-between gap-3"><p className="font-semibold">Zed Live Sessions: October</p><Stars value={saved.overall} /></div>
              <p className="mt-1 text-ink-2">{saved.body}</p>
              <p className="mt-2 text-sm text-ink-3">Editable until {fmtDate(editUntil, { day: "numeric", month: "long" })}. <button className="font-semibold text-kafue" onClick={() => { setTab("Write a review"); setD(saved); setEditing(true); }}>Edit</button></p>
            </Card>
          )}
          {api.reviews.mine().map((r) => (
            <Card key={r.event}>
              <div className="flex justify-between gap-3"><p className="font-semibold">{r.event}</p><Stars value={r.rating} /></div>
              <p className="mt-1 font-medium">{r.title}</p>
              <p className="text-ink-2">{r.body}</p>
              {r.reply && <div className="mt-3 rounded-lg bg-surface-2 px-4 py-3 text-sm"><p className="font-semibold">Reply from the organiser</p><p className="text-ink-2">{r.reply}</p></div>}
              <p className="mt-2 text-sm text-ink-3">Posted {fmtDate(r.date, { day: "numeric", month: "long", year: "numeric" })}. Editing closed on {fmtDate(r.editUntil, { day: "numeric", month: "long" })}.</p>
            </Card>
          ))}
          {!saved && api.reviews.mine().length === 0 && <Card className="text-center text-ink-3">You haven&rsquo;t reviewed anything yet.</Card>}
        </div>
      )}
    </>
  );
}
