"use client";

import { useEffect, useState } from "react";
import { Bell, MessageSquarePlus } from "lucide-react";
import { CaseThread } from "@/components/case-thread";
import { Badge, Button, Card, Field, Input, Modal, PageHeader, Tabs, Textarea, cx } from "@/components/ui";
import { api, type Case } from "@/lib/api";
import { CHAT_DAYS_AFTER_EVENT, caseTypes, isOpen, nextCaseNumber, type CaseType } from "@/lib/cases";

/**
 * The attendee's Messages: every conversation with an organiser's team, each
 * with a case number, kept after it closes (read-only) until messages are
 * deleted. Help requests at events appear here too. Announcements are a
 * separate, read-only tab.
 */
export default function Messages() {
  const [cases, setCases] = useState<Case[]>(api.cases.mine());
  const [tab, setTab] = useState("Conversations");
  const [sel, setSel] = useState<string>(cases[0].number);
  const [mobileThread, setMobileThread] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [f, setF] = useState({ eventSlug: "", type: "Question" as CaseType, subject: "", text: "" });
  const [err, setErr] = useState("");

  const ticketEvents = Array.from(new Set(api.me.tickets().map((t) => t.eventId))).map((id) => api.events.discover().find((e) => e.id === id)!).filter(Boolean);
  const cur = cases.find((c) => c.number === sel) ?? cases[0];
  const settings = api.assist.settings();

  // ?new=<event slug> opens a new message for that event; ?case=<number> opens a case.
  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const n = p.get("new");
    const c = p.get("case");
    /* eslint-disable react-hooks/set-state-in-effect */
    if (n) { setF((x) => ({ ...x, eventSlug: n })); setNewOpen(true); }
    if (c) { setSel(c); setMobileThread(true); }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

  const start = () => {
    const e = api.events.discover().find((x) => x.slug === f.eventSlug);
    if (!e) return setErr("Choose the event this is about.");
    if (!f.subject.trim() || !f.text.trim()) return setErr("Add a short subject and your message.");
    const closes = new Date(new Date(e.end).getTime() + CHAT_DAYS_AFTER_EVENT * 86_400_000).toISOString().slice(0, 10);
    const c: Case = {
      number: nextCaseNumber(), type: f.type, subject: f.subject.trim(), event: e.title, eventSlug: e.slug, org: api.orgs.list().find((o) => o.id === e.orgId)?.name ?? "Organiser",
      status: "Open", opened: "Now", closesOn: closes,
      messages: [{ from: "attendee", at: "Now", text: f.text.trim() }, { from: "system", at: "Now", text: "Sent to the organiser's team. You'll get a notification when they reply." }],
    };
    setCases([c, ...cases]); setSel(c.number); setMobileThread(true); setNewOpen(false); setErr("");
    setF({ eventSlug: "", type: "Question", subject: "", text: "" });
  };

  const unread = cases.reduce((a, c) => a + (c.unread ?? 0), 0);

  return (
    <>
      <PageHeader title="Messages" sub="Your conversations with organisers. Every conversation has a case number you can quote." actions={<Button onClick={() => setNewOpen(true)}><MessageSquarePlus size={16} /> Message an organiser</Button>} />
      <Tabs tabs={[`Conversations${unread ? ` (${unread})` : ""}`, "Announcements"]} value={tab === "Conversations" ? `Conversations${unread ? ` (${unread})` : ""}` : tab} onChange={(t) => setTab(t.startsWith("Conversations") ? "Conversations" : t)} />

      {tab === "Conversations" ? (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <Card pad={false} className={cx(mobileThread && "hidden lg:block")}>
            <ul className="divide-y divide-line">
              {cases.map((c) => (
                <li key={c.number}>
                  <button onClick={() => { setSel(c.number); setMobileThread(true); setCases(cases.map((x) => (x.number === c.number ? { ...x, unread: 0 } : x))); }} className={cx("w-full px-4 py-3 text-left", cur.number === c.number ? "bg-kafue-soft" : "hover:bg-surface-2")}>
                    <div className="flex items-center justify-between gap-2">
                      <p className={cx("truncate", c.unread ? "font-bold" : "font-semibold")}>{c.subject}</p>
                      {c.unread ? <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-kafue px-1.5 text-[11px] font-bold text-white">{c.unread}</span> : null}
                    </div>
                    <p className="truncate text-xs text-ink-3">{c.event}</p>
                    <p className="mt-1 flex items-center gap-2 text-[11px] text-ink-3"><span className="font-mono">{c.number}</span><Badge tone={isOpen(c) ? (c.status === "Waiting for you" ? "teal" : c.status === "Answered" ? "green" : "gold") : "grey"}>{c.status === "Waiting for you" ? "Replied" : c.status}</Badge></p>
                  </button>
                </li>
              ))}
            </ul>
          </Card>
          <Card pad={false} className={cx("min-h-[520px]", !mobileThread && "hidden lg:block")}>
            <button onClick={() => setMobileThread(false)} className="px-4 pt-3 text-sm text-kafue lg:hidden">‹ All conversations</button>
            <CaseThread c={cur} side="attendee" hotline={settings.hotline} onChange={(n) => setCases(cases.map((x) => (x.number === n.number ? n : x)))} />
          </Card>
        </div>
      ) : (
        <Card>
          <ul className="space-y-3">
            {api.assist.inbox().map((m) => (
              <li key={m.at} className={cx("rounded-xl border p-3 text-sm", m.urgent ? "border-marigold bg-marigold-soft" : "border-line")}>
                <p className="flex items-center gap-2 font-semibold"><Bell size={14} className="text-kafue" />{m.urgent && "Urgent: "}{m.title} <span className="font-normal text-ink-3">· Lusaka Summer Jam, {m.at}</span></p>
                <p className="mt-1 text-ink-2">{m.body}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-ink-3">Announcements can&rsquo;t be replied to. To ask something, message the organiser.</p>
        </Card>
      )}

      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Message an organiser" footer={<><Button variant="ghost" onClick={() => setNewOpen(false)}>Cancel</Button><Button onClick={start}>Send</Button></>}>
        <div className="space-y-4">
          <Field label="Which event is it about?">
            <select value={f.eventSlug} onChange={(e) => setF({ ...f, eventSlug: e.target.value })} className="w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm">
              <option value="">Choose an event</option>
              <optgroup label="Your tickets">{ticketEvents.map((e) => <option key={e.slug} value={e.slug}>{e.title}</option>)}</optgroup>
              <optgroup label="Other events">{api.events.discover().filter((e) => !ticketEvents.some((t) => t.slug === e.slug)).map((e) => <option key={e.slug} value={e.slug}>{e.title}</option>)}</optgroup>
            </select>
          </Field>
          <Field label="What is it?">
            <div className="flex flex-wrap gap-1.5">{caseTypes.map((t) => <button key={t} type="button" onClick={() => setF({ ...f, type: t })} aria-pressed={f.type === t} className={cx("rounded-full border px-3 py-1 text-sm", f.type === t ? "border-kafue bg-kafue-soft font-semibold text-kafue-ink" : "border-line")}>{t}</button>)}</div>
          </Field>
          <Field label="Subject"><Input value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} placeholder="e.g. Is there parking?" maxLength={80} /></Field>
          <Field label="Message"><Textarea rows={3} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} /></Field>
          {err && <p className="text-sm text-hibiscus">{err}</p>}
          <p className="text-xs text-ink-3">You&rsquo;ll get a case number. The chat stays open until {CHAT_DAYS_AFTER_EVENT} days after the event; messages are deleted 90 days after it closes.</p>
        </div>
      </Modal>
    </>
  );
}
