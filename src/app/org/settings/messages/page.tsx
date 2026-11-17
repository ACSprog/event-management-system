"use client";

import { useState } from "react";
import { Badge, Button, Card, cx, Field, Input, PageHeader, SectionTitle, Textarea, useToast } from "@/components/ui";
import { api } from "@/lib/api";

const sample: Record<string, string> = {
  "{first_name}": "Chanda", "{event}": "Lusaka Summer Jam", "{date}": "Sat 12 Dec", "{venue}": "Heroes National Stadium", "{gate}": "Gate A or B", "{gates_open}": "16:00",
  "{ticket_count}": "2", "{ticket_link}": "ems.zm/t/8K2Q9M", "{programme_link}": "ems.zm/p/jam", "{amount}": "K500", "{method}": "MTN MoMo wallet", "{refund_ref}": "RF-20411", "{organiser}": "Zed Live Entertainment",
  "{change_summary}": "Yo Maps now on stage at 23:30", "{decline_reason}": "it's outside the refund period",
};
const fill = (t: string) => t.replace(/\{[a-z_]+\}/g, (m) => sample[m] ?? m);

export default function Messages() {
  const toast = useToast();
  const [list, setList] = useState(api.messages.templates());
  const [sel, setSel] = useState(list[0].key);
  const t = list.find((x) => x.key === sel)!;
  const set = (patch: Partial<typeof t>) => setList(list.map((x) => (x.key === sel ? { ...x, ...patch } : x)));
  const sms = fill(t.body).length;

  return (
    <>
      <PageHeader title="Messages to buyers" sub="The emails, SMS and WhatsApp messages your buyers get automatically. Use your own words; EMS fills in the details for each person." />
      <div className="grid gap-6 xl:grid-cols-[280px_1fr_340px]">
        <Card pad={false}>
          <ul className="divide-y divide-line">
            {list.map((x) => (
              <li key={x.key}>
                <button onClick={() => setSel(x.key)} className={cx("w-full px-4 py-3 text-left", sel === x.key ? "bg-kafue-soft" : "hover:bg-surface-2")}>
                  <p className="font-semibold">{x.name}</p>
                  <p className="text-xs text-ink-3">{x.when}</p>
                </button>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="space-y-4">
          <SectionTitle title={t.name} sub={t.when} />
          <div className="flex flex-wrap gap-1.5">{t.channels.map((c) => <Badge key={c} tone="teal">{c}</Badge>)}</div>
          <Field label="Email subject"><Input value={t.subject} onChange={(e) => set({ subject: e.target.value })} /></Field>
          <Field label="Message" hint={`About ${Math.ceil(sms / 160)} SMS (${sms} characters with sample details)`}><Textarea rows={6} value={t.body} onChange={(e) => set({ body: e.target.value })} /></Field>
          <div>
            <p className="mb-1.5 text-sm font-medium">Insert a detail</p>
            <div className="flex flex-wrap gap-1.5">
              {api.messages.variables().map((v) => <button key={v} onClick={() => set({ body: `${t.body} ${v}` })} className="rounded-full border border-line px-2.5 py-1 font-mono text-xs hover:border-kafue">{v}</button>)}
            </div>
          </div>
          <div className="flex flex-wrap gap-2 border-t border-line pt-4">
            <Button onClick={() => toast(`${t.name} saved. New messages use it from now on.`)}>Save</Button>
            <Button variant="secondary" onClick={() => toast("Test sent to your phone and email")}>Send me a test</Button>
            <Button variant="ghost" onClick={() => { setList(list.map((x) => (x.key === sel ? api.messages.templates().find((y) => y.key === sel)! : x))); toast("Back to the standard wording"); }}>Use the standard wording</Button>
          </div>
          <p className="text-xs text-ink-3">Ticket and payment messages are always sent. Promotional messages only go to people who agreed to them, and every SMS includes how to opt out.</p>
        </Card>
        <Card>
          <SectionTitle title="Preview" sub="With sample details" />
          <div className="rounded-2xl bg-surface-2 p-4 text-sm">
            <p className="font-semibold">{fill(t.subject)}</p>
            <p className="mt-2 whitespace-pre-wrap text-ink-2">{fill(t.body)}</p>
          </div>
        </Card>
      </div>
    </>
  );
}
