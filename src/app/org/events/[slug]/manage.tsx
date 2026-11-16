"use client";

import { useState } from "react";
import { Copy, Download, ExternalLink, Mail, Plus, ScanLine, Send, Undo2 } from "lucide-react";
import { Avatar, Badge, Button, Card, Checkbox, Input, Modal, PageHeader, Progress, SectionTitle, Stat, Table, Tabs, useToast, Field, Select } from "@/components/ui";
import { AreaTrend, Bars } from "@/components/ui/charts";
import { api, capacity, gross, sold, statusTone } from "@/lib/api";
import { compact, fmtDate, fmtTime, kwacha } from "@/lib/brand";

const tabsList = ["Overview", "Tickets", "Attendees", "Check-in and gates", "Tasks", "Budget", "Staff"];

export function EventManage({ slug }: { slug: string }) {
  const toast = useToast();
  const e = api.events.bySlug(slug)!;
  const [tab, setTab] = useState("Overview");
  const [q, setQ] = useState("");
  const [refund, setRefund] = useState<string | null>(null);
  const [tasks, setTasks] = useState(api.events.checklist());
  const venue = api.venues.get(e.venueId);
  const attendees = api.events.attendees().filter((a) => a.name.toLowerCase().includes(q.toLowerCase()) || a.ref.toLowerCase().includes(q.toLowerCase()));
  const expenses = api.finance.expenses();
  const spent = expenses.reduce((a, x) => a + x.amount, 0);
  const fees = gross(e) * 0.03;

  return (
    <>
      <PageHeader
        back={{ href: "/org/events/", label: "Events" }}
        title={e.title}
        sub={<span className="flex flex-wrap items-center gap-2"><Badge tone={statusTone[e.status]}>{e.status}</Badge> {fmtDate(e.start, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}, {fmtTime(e.start)}, {venue.name}</span>}
        actions={<>
          <Button variant="secondary" href={`/events/${e.slug}/`}><ExternalLink size={15} /> View page</Button>
          {e.status === "Pending approval" ? <Button onClick={() => toast("Event approved and published")}>Approve and publish</Button> : <Button href="/org/checkin/"><ScanLine size={15} /> Open check-in</Button>}
        </>}
      />
      <Tabs tabs={tabsList} value={tab} onChange={setTab} />

      {tab === "Overview" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Tickets sold" value={sold(e).toLocaleString()} hint={`of ${capacity(e).toLocaleString()} (${Math.round((sold(e) / capacity(e)) * 100)}%)`} />
            <Stat label="Gross sales" value={kwacha(gross(e))} delta="+K412k" hint="this week" />
            <Stat label="Page views to buyers" value="6.8%" hint="41,200 views" />
            <Stat label="Refunds" value="38" hint={`${kwacha(9_500)} returned`} />
          </div>
          <div className="mt-6 grid gap-6 xl:grid-cols-2">
            <Card><SectionTitle title="Daily sales" /><AreaTrend data={api.finance.salesSeries()} x="date" y="tickets" /></Card>
            <Card>
              <SectionTitle title="By ticket type" />
              <ul className="space-y-4">
                {e.tickets.map((t) => (
                  <li key={t.id}>
                    <div className="flex justify-between text-sm"><span className="font-medium">{t.name}</span><span className="text-ink-3">{t.sold.toLocaleString()} / {t.capacity.toLocaleString()}, <span className="font-semibold text-ink">{kwacha(t.sold * t.price)}</span></span></div>
                    <Progress value={(t.sold / t.capacity) * 100} tone={t.sold === t.capacity ? "hibiscus" : "kafue"} className="mt-1.5" />
                  </li>
                ))}
              </ul>
              <div className="mt-6"><SectionTitle title="Where buyers came from" /></div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                {[["Eventra discovery", "38%"], ["SMS campaign", "21%"], ["Instagram", "17%"], ["WhatsApp shares", "14%"], ["Push alerts", "7%"], ["Direct link", "3%"]].map(([k, v]) => <div key={k} className="flex justify-between rounded-lg bg-surface-2 px-3 py-2"><span>{k}</span><span className="font-semibold">{v}</span></div>)}
              </div>
            </Card>
          </div>
        </>
      )}

      {tab === "Tickets" && (
        <>
          <div className="mb-4 flex justify-end gap-2"><Button variant="secondary" onClick={() => toast("50 complimentary tickets issued to the guest list")}>Issue complimentary</Button><Button><Plus size={15} /> Add ticket type</Button></div>
          <Table
            rows={e.tickets as unknown as Record<string, unknown>[]}
            columns={[
              { key: "name", label: "Ticket type", render: (t) => <><p className="font-semibold">{String(t.name)}</p><p className="text-xs text-ink-3">{String(t.description || "Admission")}</p></> },
              { key: "price", label: "Price", align: "right", render: (t) => (t.price ? kwacha(t.price as number) : "Free") },
              { key: "sold", label: "Sold", align: "right", render: (t) => `${(t.sold as number).toLocaleString()} / ${(t.capacity as number).toLocaleString()}` },
              { key: "rev", label: "Revenue", align: "right", render: (t) => kwacha((t.sold as number) * (t.price as number)) },
              { key: "salesEnd", label: "Sales end", render: (t) => fmtDate(t.salesEnd as string, { day: "numeric", month: "short" }) },
              { key: "st", label: "", render: (t) => <Badge tone={t.sold === t.capacity ? "red" : "green"}>{t.sold === t.capacity ? "Sold out" : "On sale"}</Badge> },
            ]}
          />
        </>
      )}

      {tab === "Attendees" && (
        <>
          <div className="mb-4 flex flex-wrap gap-2">
            <Input className="max-w-sm" placeholder="Search name or booking reference" value={q} onChange={(x) => setQ(x.target.value)} />
            <Button variant="secondary" className="ml-auto"><Mail size={15} /> Message attendees</Button>
            <Button variant="secondary"><Download size={15} /> Export CSV</Button>
          </div>
          <Table
            rows={attendees}
            empty="No attendee matches that search."
            columns={[
              { key: "name", label: "Attendee", render: (a) => <div className="flex items-center gap-2.5"><Avatar name={a.name} size={28} /><div><p className="font-semibold">{a.name}</p><p className="text-xs text-ink-3">{a.phone}</p></div></div> },
              { key: "ticket", label: "Ticket" },
              { key: "ref", label: "Booking", render: (a) => <span className="font-mono text-xs">{a.ref}</span> },
              { key: "method", label: "Paid with" },
              { key: "paid", label: "Paid", align: "right", render: (a) => kwacha(a.paid) },
              { key: "checkedIn", label: "Checked in", render: (a) => (a.checkedIn ? <Badge tone="green">{fmtTime(a.checkedIn)}, {a.gate}</Badge> : <Badge>Not yet</Badge>) },
              { key: "x", label: "", render: (a) => <Button size="sm" variant="ghost" onClick={() => setRefund(a.name)}><Undo2 size={14} /> Refund</Button> },
            ]}
          />
        </>
      )}

      {tab === "Check-in and gates" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Checked in" value="29,040" hint="of 31,160 sold (93%)" />
            <Stat label="Scans per minute" value="89" hint="across 24 scanners" />
            <Stat label="Duplicate attempts blocked" value="47" tone="down" delta="47" hint="screenshots or forwarded tickets" />
            <Stat label="Scanners offline" value="1" hint="Gate B #6, last sync 2 min ago" />
          </div>
          <Card className="mt-6"><SectionTitle title="Arrivals by gate" sub="Every 30 minutes" /><Bars data={api.events.checkinSeries()} x="time" keys={["gateA", "gateB", "vip"]} labels={["Gate A", "Gate B", "VIP gate"]} stacked /></Card>
          <div className="mt-6"><Table rows={api.events.gates()} columns={[{ key: "name", label: "Gate", render: (g) => <span className="font-semibold">{g.name}</span> }, { key: "allowed", label: "Accepts" }, { key: "scanners", label: "Scanners", align: "right" }, { key: "staff", label: "Staff", align: "right" }, { key: "scanned", label: "Scanned", align: "right", render: (g) => g.scanned.toLocaleString() }, { key: "rate", label: "Per minute", align: "right" }]} /></div>
        </>
      )}

      {tab === "Tasks" && (
        <Card>
          <SectionTitle title="Event checklist" sub={`${tasks.filter((t) => t.done).length} of ${tasks.length} done`} action={<Button size="sm"><Plus size={14} /> Add task</Button>} />
          <ul className="divide-y divide-line">
            {tasks.map((t, i) => (
              <li key={t.task} className="flex items-center gap-3 py-3">
                <Checkbox checked={t.done} onChange={(v) => setTasks(tasks.map((x, j) => (j === i ? { ...x, done: v } : x)))} label={<span className={t.done ? "text-ink-3 line-through" : "font-medium"}>{t.task}</span>} />
                <span className="ml-auto text-sm text-ink-3">{t.owner}</span>
                <span className="w-24 text-right text-sm text-ink-3">{fmtDate(t.due, { day: "numeric", month: "short" })}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {tab === "Budget" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Ticket income" value={kwacha(gross(e))} />
            <Stat label="Sponsorship" value={kwacha(940_000)} />
            <Stat label="Costs so far" value={kwacha(spent)} hint={`of ${kwacha(1_450_000)} budget`} />
            <Stat label="Projected profit" value={kwacha(gross(e) + 940_000 - spent - fees)} hint="after platform fees" />
          </div>
          <div className="mt-6"><Table rows={expenses} columns={[{ key: "vendor", label: "Vendor", render: (x) => <span className="font-semibold">{x.vendor}</span> }, { key: "category", label: "Category" }, { key: "date", label: "Date" }, { key: "amount", label: "Amount", align: "right", render: (x) => kwacha(x.amount) }, { key: "status", label: "Status", render: (x) => <Badge tone={x.status === "Paid" ? "green" : x.status === "Approved" ? "teal" : "gold"}>{x.status}</Badge> }]} /></div>
        </>
      )}

      {tab === "Staff" && (
        <Card>
          <SectionTitle title="Staff and scanner access" sub="Check-in officers only see this event, and only the gates you assign." action={<Button size="sm"><Send size={14} /> Invite staff</Button>} />
          <ul className="divide-y divide-line">
            {api.orgs.team().map((m, i) => (
              <li key={m.email} className="flex flex-wrap items-center gap-3 py-3">
                <Avatar name={m.name} />
                <div className="flex-1"><p className="font-semibold">{m.name}</p><p className="text-xs text-ink-3">{m.role}</p></div>
                <Select aria-label={`Gate for ${m.name}`} className="w-40" options={["All gates", "Gate A", "Gate B", "VIP gate"]} defaultValue={["All gates", "All gates", "All gates", "All gates", "Gate A", "Gate B"][i]} />
              </li>
            ))}
          </ul>
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-surface-2 p-4 text-sm">
            <span className="flex-1">Scanner sign-in code for this event: <span className="font-mono font-semibold">JAM-4417-GATE</span></span>
            <Button size="sm" variant="secondary"><Copy size={14} /> Copy</Button>
          </div>
        </Card>
      )}

      <Modal open={!!refund} onClose={() => setRefund(null)} title={`Refund ${refund}`} footer={<><Button variant="ghost" onClick={() => setRefund(null)}>Cancel</Button><Button variant="danger" onClick={() => { setRefund(null); toast("Refund started. The ticket is cancelled and can no longer be scanned."); }}>Refund and cancel ticket</Button></>}>
        <div className="space-y-4">
          <Field label="Amount"><Select options={["Full ticket price", "Ticket price minus booking fee", "Custom amount"]} /></Field>
          <Field label="Reason"><Select options={["Customer request", "Event change", "Duplicate purchase", "Other"]} /></Field>
          <p className="text-sm text-ink-3">The ticket is cancelled straight away and every scanner rejects it after its next sync (within 30 seconds when online).</p>
        </div>
      </Modal>
    </>
  );
}
