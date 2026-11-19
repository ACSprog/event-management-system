"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, Send, Users } from "lucide-react";
import { Badge, Button, Card, Field, Input, Modal, SectionTitle, Table, Textarea, cx, useToast } from "@/components/ui";
import { api, type SentMessage } from "@/lib/api";
import { defaultDuties, emptyRule, smsPrice, type AudienceRule, type Priority } from "@/lib/assist";
import { kwacha } from "@/lib/brand";
import { genders } from "@/lib/gender";

function Chips({ label, options, value, onChange, hint }: { label: string; options: string[]; value: string[]; onChange: (v: string[]) => void; hint?: string }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium">{label} <span className="font-normal text-ink-3">{value.length ? "" : "(any)"}</span></legend>
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => {
          const on = value.includes(o);
          return <button key={o} type="button" aria-pressed={on} onClick={() => onChange(on ? value.filter((x) => x !== o) : [...value, o])} className={cx("rounded-full border px-3 py-1 text-sm", on ? "border-kafue bg-kafue-soft font-semibold text-kafue-ink" : "border-line hover:border-ink-3")}>{o}</button>;
        })}
      </div>
      {hint && <p className="mt-1 text-xs text-ink-3">{hint}</p>}
    </fieldset>
  );
}

/**
 * Event messages: to everyone, to groups (any mix of conditions), or to one
 * person. In-app and push by default (free); urgent adds an SMS backup after
 * 2 minutes only for people who haven't opened it. Separate from Campaigns,
 * which are marketing and need opt-in.
 */
export function MessagesPanel() {
  const toast = useToast();
  const cells = api.assist.audience();
  const staff = api.assist.staff();
  const sub = api.billing.subscription();
  const smsUsage = sub.usage.find((u) => /sms/i.test(u.label));
  const creditsLeft = smsUsage && smsUsage.limit !== null ? smsUsage.limit - smsUsage.used : 0;

  const [rule, setRule] = useState<AudienceRule>(emptyRule);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [priority, setPriority] = useState<Priority>("NORMAL");
  const [confirm, setConfirm] = useState(false);
  const [history, setHistory] = useState<SentMessage[]>(api.assist.sent());
  const [err, setErr] = useState("");

  const counts = useMemo(() => {
    const att = rule.who === "staff" ? [] : cells.filter((c) =>
      (!rule.ticketTypes.length || rule.ticketTypes.includes(c.ticketType)) &&
      (!rule.genders.length || rule.genders.includes(c.gender)) &&
      (rule.checkIn === "any" || (rule.checkIn === "in") === c.checkedIn) &&
      (!rule.areas.length || rule.areas.includes(c.area)));
    const people = att.reduce((a, c) => a + c.people, 0);
    const app = att.reduce((a, c) => a + c.hasApp, 0);
    const st = rule.who === "attendees" ? [] : staff.filter((s) => !rule.duties.length || rule.duties.includes(defaultDuties.find((d) => d.key === s.duty)?.team ?? ""));
    // SMS backup: people with no app or notifications, plus about 1 in 10 who don't open it in 2 minutes.
    const sms = priority === "URGENT" ? Math.round(people - app + app * 0.1) : 0;
    return { people, staff: st.length, total: people + st.length, sms };
  }, [cells, rule, staff, priority]);

  const describe = () => {
    const parts: string[] = [];
    if (rule.who !== "staff") parts.push([rule.checkIn === "in" ? "checked-in" : rule.checkIn === "not_in" ? "not yet checked in" : "", rule.genders.join(" or ").toLowerCase(), "attendees", rule.ticketTypes.length ? `with ${rule.ticketTypes.join(" or ")} tickets` : "", rule.areas.length ? `in ${rule.areas.join(" or ")}` : ""].filter(Boolean).join(" "));
    if (rule.who !== "attendees") parts.push(rule.duties.length ? rule.duties.join(" and ") : "all staff");
    return parts.join(" + ").replace(/^./, (c) => c.toUpperCase());
  };
  const everyone = rule.who !== "staff" && !rule.ticketTypes.length && !rule.genders.length && rule.checkIn === "any" && !rule.areas.length;
  const shortfall = Math.max(0, counts.sms - creditsLeft);

  const trySend = () => {
    if (!title.trim() || !body.trim()) return setErr("Add a title and a message.");
    if (!counts.total) return setErr("Nobody matches this audience. Remove a condition.");
    setErr("");
    if (everyone || priority === "URGENT") setConfirm(true);
    else send();
  };
  const send = () => {
    setHistory([{ id: `MSG-${209 + history.length - 4}`, at: "now", by: "You", title, audience: describe(), priority, recipients: counts.total, opened: 0, sms: 0 }, ...history]);
    setConfirm(false); setTitle(""); setBody(""); setPriority("NORMAL");
    toast(`Sent to ${counts.total.toLocaleString()} people in the app${priority === "URGENT" ? `. SMS backup goes in 2 minutes to those who haven't opened it (about ${counts.sms.toLocaleString()}).` : "."}`);
  };

  return (
    <div className="grid gap-6 2xl:grid-cols-[1.4fr_1fr]">
      <Card className="space-y-5">
        <SectionTitle title="New event message" sub="For this event only. Marketing goes in Audience › Campaigns." />
        <div className="grid grid-cols-3 gap-1 rounded-lg border border-line bg-canvas p-1 text-sm">
          {([["attendees", "Attendees"], ["staff", "Staff"], ["everyone", "Attendees and staff"]] as const).map(([k, t]) => (
            <button key={k} type="button" onClick={() => setRule({ ...rule, who: k })} aria-pressed={rule.who === k} className={cx("rounded-md px-2 py-1.5 font-medium", rule.who === k ? "bg-ink text-canvas" : "text-ink-2")}>{t}</button>
          ))}
        </div>

        {rule.who !== "staff" && (
          <div className="space-y-4">
            <Chips label="Ticket type" options={api.assist.ticketTypes()} value={rule.ticketTypes} onChange={(v) => setRule({ ...rule, ticketTypes: v })} />
            <Chips label="Gender" options={[...genders]} value={rule.genders} onChange={(v) => setRule({ ...rule, genders: v })} hint="From accounts and tickets. Recipients never see who else got the message." />
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium">Check-in</legend>
              <div className="flex flex-wrap gap-1.5">
                {([["any", "Everyone"], ["in", "Checked in"], ["not_in", "Not yet checked in"]] as const).map(([k, t]) => <button key={k} type="button" onClick={() => setRule({ ...rule, checkIn: k })} aria-pressed={rule.checkIn === k} className={cx("rounded-full border px-3 py-1 text-sm", rule.checkIn === k ? "border-kafue bg-kafue-soft font-semibold text-kafue-ink" : "border-line")}>{t}</button>)}
              </div>
            </fieldset>
            <Chips label="Area (from the ticket)" options={["General area", "VIP terrace", "VVIP tables"]} value={rule.areas} onChange={(v) => setRule({ ...rule, areas: v })} />
          </div>
        )}
        {rule.who !== "attendees" && (
          <Chips label="Staff teams" options={Array.from(new Set(staff.map((s) => defaultDuties.find((d) => d.key === s.duty)?.team ?? s.duty)))} value={rule.duties} onChange={(v) => setRule({ ...rule, duties: v })} />
        )}

        <div className="flex items-center gap-3 rounded-xl bg-surface-2 p-3 text-sm">
          <Users size={18} className="shrink-0 text-kafue" />
          <span><strong className="tabular-nums">{counts.total.toLocaleString()}</strong> {counts.total === 1 ? "person" : "people"}: {describe() || "nobody yet"}</span>
        </div>

        <Field label="Title"><Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. VIP lounge is now open" maxLength={80} /></Field>
        <Field label="Message" hint={`${body.length}/300. Attendees can't reply; they're pointed to Request help.`}><Textarea rows={3} value={body} onChange={(e) => setBody(e.target.value.slice(0, 300))} placeholder="Short and clear. Say what to do and where." /></Field>

        <fieldset>
          <legend className="mb-1.5 text-sm font-medium">How urgent?</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <button type="button" onClick={() => setPriority("NORMAL")} aria-pressed={priority === "NORMAL"} className={cx("rounded-xl border-2 p-3 text-left", priority === "NORMAL" ? "border-kafue bg-kafue-soft" : "border-line")}><span className="block font-semibold">Normal</span><span className="block text-xs text-ink-3">In the app and as a notification. Free.</span></button>
            <button type="button" onClick={() => setPriority("URGENT")} aria-pressed={priority === "URGENT"} className={cx("rounded-xl border-2 p-3 text-left", priority === "URGENT" ? "border-hibiscus bg-hibiscus-soft" : "border-line")}><span className="block font-semibold">Urgent</span><span className="block text-xs text-ink-3">Same, plus an SMS after 2 minutes to anyone who hasn&rsquo;t opened it.</span></button>
          </div>
        </fieldset>

        {priority === "URGENT" && counts.people > 0 && (
          <div className="rounded-xl border border-marigold bg-marigold-soft p-3 text-sm">
            <p>SMS backup: about <strong>{counts.sms.toLocaleString()}</strong> SMS (≈ {kwacha(counts.sms * smsPrice)}), from your SMS credits ({creditsLeft.toLocaleString()} left).</p>
            {shortfall > 0 && <p className="mt-1">Urgent messages still go out when credits run out. The extra {shortfall.toLocaleString()} SMS (≈ {kwacha(shortfall * smsPrice)}) will be added to your next invoice at the normal SMS rate.</p>}
          </div>
        )}
        {err && <p className="text-sm text-hibiscus">{err}</p>}
        <Button onClick={trySend}><Send size={16} /> Send to {counts.total.toLocaleString()}</Button>
      </Card>

      <Card pad={false}>
        <div className="p-5 pb-2"><SectionTitle title="Sent today" /></div>
        <Table<SentMessage>
          rows={history}
          columns={[
            { key: "title", label: "Message", render: (m) => <><p className="font-semibold">{m.priority === "URGENT" && <AlertTriangle size={13} className="mr-1 inline text-hibiscus" />}{m.title}</p><p className="text-xs text-ink-3">{m.at} · {m.by} · {m.audience}</p></> },
            { key: "recipients", label: "Sent", align: "right", render: (m) => m.recipients.toLocaleString() },
            { key: "opened", label: "Opened", align: "right", render: (m) => (m.at === "now" ? <Badge>Sending</Badge> : `${Math.round((m.opened / m.recipients) * 100)}%`) },
            { key: "sms", label: "SMS", align: "right", render: (m) => (m.sms ? m.sms.toLocaleString() : "None") },
          ]}
        />
      </Card>

      <Modal open={confirm} onClose={() => setConfirm(false)} title={priority === "URGENT" ? "Send an urgent message?" : "Send to everyone?"} footer={<><Button variant="ghost" onClick={() => setConfirm(false)}>Go back</Button><Button variant={priority === "URGENT" ? "danger" : "primary"} onClick={send}>Send now</Button></>}>
        <p className="text-sm text-ink-2"><strong>{title}</strong> goes to <strong>{counts.total.toLocaleString()}</strong> people ({describe()}).</p>
        {priority === "URGENT" && <p className="mt-2 text-sm text-ink-2">About {counts.sms.toLocaleString()} SMS will follow for people who don&rsquo;t open it within 2 minutes.</p>}
        <p className="mt-2 text-xs text-ink-3">This is recorded in the activity log with your name.</p>
      </Modal>
    </div>
  );
}
