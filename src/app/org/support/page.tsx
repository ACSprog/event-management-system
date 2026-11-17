"use client";

import { useState } from "react";
import { MessageSquarePlus, Send } from "lucide-react";
import { Avatar, Badge, Button, Card, cx, Field, Input, Modal, PageHeader, Tabs, Textarea, useToast } from "@/components/ui";
import { SelectOther } from "@/components/select-other";
import { api } from "@/lib/api";

export default function Support() {
  const toast = useToast();
  const [threads, setThreads] = useState(api.messages.threads());
  const [tab, setTab] = useState("Questions from buyers");
  const [sel, setSel] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [open, setOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const list = threads.filter((t) => (tab === "Questions from buyers" ? t.with !== "EMS support" : t.with === "EMS support"));
  const cur = threads.find((t) => t.id === (sel ?? list[0]?.id));

  const send = () => {
    if (!reply.trim() || !cur) return;
    setThreads(threads.map((t) => (t.id === cur.id ? { ...t, status: t.with === "EMS support" ? "Waiting for EMS" : "Answered", messages: [...t.messages, { from: "You", at: "Now", text: reply }] } : t)));
    setReply("");
    toast(cur.with === "EMS support" ? "Sent to EMS support" : `Reply sent to ${cur.with} by SMS and email`);
  };

  return (
    <>
      <PageHeader title="Help and support" sub="Answer questions from your buyers, and get help from EMS." actions={<Button onClick={() => setOpen(true)}><MessageSquarePlus size={15} /> Ask EMS for help</Button>} />
      <Tabs tabs={["Questions from buyers", "Your requests to EMS"]} value={tab} onChange={(t) => { setTab(t); setSel(null); }} />
      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        <Card pad={false}>
          <ul className="divide-y divide-line">
            {list.map((t) => (
              <li key={t.id}>
                <button onClick={() => setSel(t.id)} className={cx("w-full px-4 py-3 text-left", cur?.id === t.id ? "bg-kafue-soft" : "hover:bg-surface-2")}>
                  <div className="flex items-center justify-between gap-2"><p className="truncate font-semibold">{t.subject}</p><Badge tone={t.status === "New question" || t.status === "Waiting for EMS" ? "gold" : "green"}>{t.status}</Badge></div>
                  <p className="text-xs text-ink-3">{t.with}, {t.updated}</p>
                </button>
              </li>
            ))}
            {!list.length && <li className="p-4 text-sm text-ink-3">Nothing here yet.</li>}
          </ul>
        </Card>
        {cur && (
          <Card className="flex flex-col">
            <p className="font-semibold">{cur.subject}</p>
            <p className="text-xs text-ink-3">{cur.id}, with {cur.with}</p>
            <ul className="mt-4 flex-1 space-y-3">
              {cur.messages.map((m, i) => (
                <li key={i} className="flex gap-3">
                  <Avatar name={m.from} size={28} />
                  <div className="rounded-xl bg-surface-2 px-3 py-2 text-sm"><p className="font-semibold">{m.from} <span className="font-normal text-ink-3">{m.at}</span></p><p className="mt-0.5 text-ink-2">{m.text}</p></div>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2 border-t border-line pt-4">
              <div className="flex-1"><Textarea rows={2} placeholder={cur.with === "EMS support" ? "Write to EMS support" : `Reply to ${cur.with}`} value={reply} onChange={(e) => setReply(e.target.value)} /></div>
              <Button onClick={send} disabled={!reply.trim()}><Send size={15} /> Send</Button>
            </div>
          </Card>
        )}
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="Ask EMS for help" footer={<><Button variant="ghost" onClick={() => setOpen(false)}>Cancel</Button><Button onClick={() => { if (subject.trim().length < 5) return; setThreads([{ id: "SUP-3320", orgId: "org1", with: "EMS support", subject, status: "Waiting for EMS", updated: "Now", messages: [{ from: "You", at: "Now", text: subject }] }, ...threads]); setTab("Your requests to EMS"); setSel("SUP-3320"); setOpen(false); setSubject(""); toast("Request sent. EMS usually replies within 4 working hours."); }}>Send request</Button></>}>
        <div className="space-y-4">
          <SelectOther label="What's it about?" options={["Payments and settlements", "Tickets and check-in", "My plan and billing", "Account and team access"]} prompt="Tell us the topic" placeholder="e.g. Partnership idea" />
          <Field label="How can we help?"><Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Describe the problem or question" /></Field>
          <p className="text-xs text-ink-3">On event day, requests marked urgent go to the top of the queue.</p>
        </div>
      </Modal>
    </>
  );
}
