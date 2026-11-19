"use client";

import { useState } from "react";
import { Copy, Download, ExternalLink, Mail, Plus, ScanLine, Send, Undo2 } from "lucide-react";
import { Avatar, Badge, Button, Textarea, Card, Checkbox, Input, Modal, PageHeader, Progress, SectionTitle, Stat, Table, Tabs, useToast, Field, Select } from "@/components/ui";
import { AreaTrend, Bars } from "@/components/ui/charts";
import { api, arrangementLabel, capacity, collectionLabel, feePayerLabel, gross, payable, sold, statusTone } from "@/lib/api";
import { SelectOther } from "@/components/select-other";
import { ProgrammeEditor, ProgrammeView, programmeIssues } from "@/components/programme";
import { Toggle } from "@/components/ui";
import { NoEarlyPayouts, SettlementBadge, SettlementTimeline } from "@/components/settlement";
import { useOrgRole } from "@/components/layout/org-role";
import { compact, fmtDate, fmtTime, kwacha } from "@/lib/brand";
import { pct, showCount } from "@/lib/gender";


export function EventManage({ slug }: { slug: string }) {
  const toast = useToast();
  const { can } = useOrgRole();
  const [status, setStatus] = useState(api.events.bySlug(slug)!.status);
  const tabsList = ["Overview", "Programme", "Tickets", "Attendees", ...(api.events.bySlug(slug)!.format !== "Physical" ? ["Online attendees"] : []), "Check-in and gates", "Tasks and logistics", ...(can("money.view") ? ["Budget", "Money and settlement"] : []), ...(can("events.edit") ? ["Staff and shifts"] : [])];
  const next: Record<string, { label: string; to: typeof status; need: "events.publish" | "events.edit"; msg: string } | undefined> = {
    "Pending approval": { label: "Approve", to: "Approved", need: "events.publish", msg: "Event approved. Publish it when you're ready." },
    Approved: { label: "Publish now", to: "Registration open", need: "events.publish", msg: "Published. Tickets are on sale." },
    "Registration open": { label: "Close registration", to: "Registration closed", need: "events.edit", msg: "Registration closed. Existing tickets still work." },
    "Registration closed": { label: "Reopen registration", to: "Registration open", need: "events.edit", msg: "Registration reopened" },
    Completed: { label: "Archive", to: "Archived", need: "events.edit", msg: "Archived. It's hidden from lists but kept for reports." },
    Archived: { label: "Restore", to: "Completed", need: "events.edit", msg: "Restored from the archive" },
  };
  const step = next[status];
  const e = api.events.bySlug(slug)!;
  const [tab, setTab] = useState("Overview");
  const [q, setQ] = useState("");
  const [refund, setRefund] = useState<string | null>(null);
  const [problem, setProblem] = useState(false);
  const [problemKind, setProblemKind] = useState("Cancelled");
  const terms = api.settlements.termsFor(e.id);
  const [programme, setProgramme] = useState(api.events.programme(e.id));
  const [savedProgramme, setSavedProgramme] = useState(programme);
  const [notify, setNotify] = useState(true);
  const programmeDirty = JSON.stringify(programme) !== JSON.stringify(savedProgramme);
  const settlement = terms.settlementRef ? api.settlements.get(terms.settlementRef) : undefined;
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
        sub={<span className="flex flex-wrap items-center gap-2"><Badge tone={statusTone[status]}>{status}</Badge> {fmtDate(e.start, { weekday: "long", day: "numeric", month: "long", year: "numeric" })}, {fmtTime(e.start)}, {venue.name}</span>}
        actions={<>
          <Button variant="secondary" href={`/events/${e.slug}/`}><ExternalLink size={15} /> View page</Button>
          {step && can(step.need) && <Button variant={step.to === "Archived" || step.to === "Registration closed" ? "secondary" : "primary"} onClick={() => { setStatus(step.to); toast(step.msg); }}>{step.label}</Button>}
          {["Registration open", "Sold out", "Registration closed", "In progress"].includes(status) && <>
            <Button variant="secondary" href="/org/checkin/">Live check-in</Button>
            {can("checkin.scan") && <Button href="/org/scan/"><ScanLine size={15} /> Open gate scanner</Button>}
          </>}
        </>}
      />
      <Tabs tabs={tabsList} value={tab} onChange={setTab} />

      {tab === "Overview" && (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Tickets sold" value={sold(e).toLocaleString()} hint={`of ${capacity(e).toLocaleString()} (${Math.round((sold(e) / capacity(e)) * 100)}%)`} />
            {can("money.view") ? <Stat label="Gross sales" value={kwacha(gross(e))} delta="+K412k" hint="this week" /> : <Stat label="Sold this week" value="1,648" />}
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

      {tab === "Programme" && (
        <Card>
          <SectionTitle title="Programme" sub="The running order shown on the event page and on every ticket." action={<Button size="sm" variant="secondary" href={`/events/${e.slug}/#programme`}><ExternalLink size={14} /> See it on the event page</Button>} />
          {can("events.edit") ? (<>
            <ProgrammeEditor items={programme} onChange={setProgramme} defaultDay={fmtDate(e.start, { weekday: "short", day: "numeric", month: "short" })} templates={api.events.programmeTemplates()} templateFor={{ Music: "Concert or festival", Conference: "Conference or seminar", Wedding: "Wedding or private party", Church: "Church gathering", Sports: "Sports match or tournament", Workshop: "Workshop or course", Education: "Workshop or course", Exhibition: "Exhibition or trade fair", Charity: "Fundraiser or gala" }[e.category as string]} />
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
              <Toggle checked={notify} onChange={setNotify} label="Tell ticket holders about changes by SMS and email" />
              <div className="flex gap-2">
                <Button variant="ghost" disabled={!programmeDirty} onClick={() => setProgramme(savedProgramme)}>Discard</Button>
                <Button disabled={!programmeDirty || programmeIssues(programme).length > 0} onClick={() => { setSavedProgramme(programme); toast(notify && ["Registration open", "Sold out", "Registration closed", "In progress"].includes(status) ? `Programme published. ${sold(e).toLocaleString()} ticket holders will get a short update.` : "Programme saved and shown on the event page."); }}>Publish programme</Button>
              </div>
            </div>
          </>) : <ProgrammeView items={programme} title="" />}
        </Card>
      )}

      {tab === "Tickets" && (
        <>
          {can("tickets.manage") && <div className="mb-4 flex justify-end gap-2"><Button variant="secondary" onClick={() => toast("50 complimentary tickets issued to the guest list")}>Issue complimentary</Button><Button><Plus size={15} /> Add ticket type</Button></div>}
          <Table
            rows={e.tickets as unknown as Record<string, unknown>[]}
            columns={[
              { key: "name", label: "Ticket type", render: (t) => <><p className="font-semibold">{String(t.name)}</p><p className="text-xs text-ink-3">{String(t.description || "Admission")}</p></> },
              { key: "price", label: "Price", align: "right", render: (t) => (t.price ? kwacha(t.price as number) : "Free") },
              { key: "sold", label: "Sold", align: "right", render: (t) => `${(t.sold as number).toLocaleString()} / ${(t.capacity as number).toLocaleString()}` },
              { key: "rev", label: "Revenue", align: "right", render: (t) => kwacha((t.sold as number) * (t.price as number)) },
              { key: "salesEnd", label: "On sale", render: (t) => `${fmtDate((t.salesStart as string) ?? t.salesEnd, { day: "numeric", month: "short" })} to ${fmtDate(t.salesEnd as string, { day: "numeric", month: "short" })}` },
              { key: "refund", label: "Refunds", render: (t) => <><p>{String(t.refund ?? "Event policy")}</p><p className="text-xs text-ink-3">{String(t.tax ?? "")}</p></> },
              { key: "who", label: "Who can buy" },
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
              { key: "x", label: "", render: (a) => (can("refunds.issue") ? <Button size="sm" variant="ghost" onClick={() => setRefund(a.name)}><Undo2 size={14} /> Refund</Button> : null) },
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
          <WhoCame />
          <div className="mt-6"><Table rows={api.events.gates()} columns={[{ key: "name", label: "Gate", render: (g) => <span className="font-semibold">{g.name}</span> }, { key: "allowed", label: "Accepts" }, { key: "scanners", label: "Scanners", align: "right" }, { key: "staff", label: "Staff", align: "right" }, { key: "scanned", label: "Scanned", align: "right", render: (g) => g.scanned.toLocaleString() }, { key: "rate", label: "Per minute", align: "right" }]} /></div>
        </>
      )}

      {tab === "Online attendees" && (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Stat label="Online passes" value={e.tickets.filter((t) => /virtual|course|session|instal/i.test(t.name)).reduce((a, t) => a + t.sold, 0).toLocaleString()} />
            <Stat label="Joined the last session" value="72%" />
            <Stat label="Average watch time" value="58 min" />
          </div>
          <div className="mt-6"><Table rows={api.events.onlineAttendees()} columns={[
            { key: "name", label: "Name", render: (a) => <span className="font-semibold">{a.name}</span> }, { key: "ticket", label: "Pass" },
            { key: "joined", label: "Joined", render: (a) => (a.joined ? a.joined : <Badge>Didn&rsquo;t join</Badge>) },
            { key: "watched", label: "Watched", align: "right", render: (a) => (a.watched ? `${a.watched} min` : "—") }, { key: "device", label: "Device" },
          ]} /></div>
          <p className="mt-3 text-xs text-ink-3">Zoom reports who joined and for how long. YouTube and Facebook only report total viewers, not names.</p>
        </>
      )}

      {tab === "Tasks and logistics" && (
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
          <div className="mt-6"><SectionTitle title="Equipment and logistics" action={<Button size="sm" variant="secondary"><Plus size={14} /> Add item</Button>} /></div>
          <Table rows={api.events.equipment()} columns={[
            { key: "item", label: "Item", render: (x) => <span className="font-medium">{x.item}</span> }, { key: "qty", label: "Qty" }, { key: "from", label: "From" }, { key: "arrives", label: "Arrives" },
            { key: "status", label: "Status", render: (x) => <Badge tone={x.status === "Ready" || x.status === "Booked" ? "green" : "gold"}>{x.status}</Badge> },
          ]} />
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

      {tab === "Money and settlement" && (
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <div className="space-y-6">
            <Card>
              <SectionTitle title="Settlement" sub="One payment to you after the event" action={settlement ? <Button size="sm" variant="secondary" href={`/org/finance/settlements/${settlement.ref}/`}>Open statement</Button> : undefined} />
              {settlement ? (<>
                <div className="mb-5 flex flex-wrap items-center gap-3"><SettlementBadge s={settlement} /><span className="text-sm text-ink-3">{settlement.status === "SETTLED" ? `Paid ${kwacha(payable(settlement))}` : `About ${kwacha(payable(settlement))} to you so far, after fees and charges`}</span></div>
                <SettlementTimeline s={settlement} />
              </>) : <p className="text-sm text-ink-3">Nothing to settle yet. Money from ticket sales is held until the event is over.</p>}
            </Card>
            <Card>
              <SectionTitle title="Did the event go ahead as planned?" sub="The event is marked finished automatically when its end time passes. Tell us if it didn't happen as planned." />
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => setProblem(true)}>Report a cancellation or postponement</Button>
              </div>
              <p className="mt-3 text-xs text-ink-3">You can&rsquo;t mark an event finished before its end time, and finishing an event never pays anything out on its own.</p>
            </Card>
          </div>
          <Card>
            <SectionTitle title="Terms for this event" />
            <dl className="space-y-3 text-sm">
              <div><dt className="text-ink-3">How EMS earns</dt><dd className="font-semibold">{arrangementLabel[terms.arrangement]}</dd></div>
              <div><dt className="text-ink-3">Fee</dt><dd className="font-semibold">{terms.fee}</dd></div>
              <div><dt className="text-ink-3">Fee paid by</dt><dd className="font-semibold">{feePayerLabel[terms.feePayer]}</dd></div>
              <div><dt className="text-ink-3">Ticket money</dt><dd className="font-semibold">{collectionLabel[terms.collection]}</dd></div>
              <div><dt className="text-ink-3">Listing</dt><dd className="font-semibold">{terms.listing === "Public" ? "Public, shown in discovery" : "Unlisted, invited people only"}</dd></div>
            </dl>
            <p className="mt-3 text-xs text-ink-3">{terms.frozen ? "Fixed when the event was published." : "Can still change until you publish."}</p>
            <NoEarlyPayouts className="mt-4 border-t border-line pt-4" />
          </Card>
        </div>
      )}

      <Modal open={problem} onClose={() => setProblem(false)} title="Report a problem with this event" footer={<><Button variant="ghost" onClick={() => setProblem(false)}>Cancel</Button><Button variant="danger" onClick={() => { setProblem(false); toast(problemKind === "Cancelled" ? "Cancellation reported. EMS will confirm it, then every buyer is refunded from the money held." : "Postponement reported. Money stays held and buyers can ask for refunds."); }}>Report</Button></>}>
        <div className="space-y-4 text-sm">
          <Field label="What happened?"><Select value={problemKind} onChange={(x) => setProblemKind(x.target.value)} options={["Cancelled", "Postponed to a new date", "Partly happened (cut short)", "Something else"]} /></Field>
          {problemKind === "Something else" && <Field label="What happened?"><Textarea rows={3} placeholder="e.g. Venue changed on the day, headline act didn't perform" /></Field>}
          <p className="text-ink-3">{problemKind === "Something else" ? "EMS finance reads your note and contacts you before the statement is prepared." : problemKind === "Cancelled" ? "All ticket buyers are refunded from the money EMS is holding. Nothing is paid out to you for this event." : problemKind.startsWith("Postponed") ? "Ticket money stays held. Buyers keep their tickets for the new date or can ask for a refund." : "EMS finance contacts you to agree partial refunds before the statement is prepared."}</p>
        </div>
      </Modal>

      {tab === "Staff and shifts" && (
        <Card>
          <SectionTitle title="Staff and scanner access" sub="Gate staff only see the scanner, and only for this event and the gates you assign." action={<Button size="sm"><Send size={14} /> Invite staff</Button>} />
          <ul className="divide-y divide-line">
            {api.orgs.team().map((m, i) => (
              <li key={m.email} className="flex flex-wrap items-center gap-3 py-3">
                <Avatar name={m.name} />
                <div className="flex-1"><p className="font-semibold">{m.name}</p><p className="text-xs text-ink-3">{m.role}</p></div>
                <Select aria-label={`Gate for ${m.name}`} className="w-40" options={["All gates", "Gate A", "Gate B", "VIP gate"]} defaultValue={["All gates", "All gates", "All gates", "All gates", "Gate A", "Gate B"][i]} />
              </li>
            ))}
          </ul>
          <div className="mt-6"><SectionTitle title="Shifts on the day" action={<Button size="sm" variant="secondary"><Plus size={14} /> Add shift</Button>} /></div>
          <Table rows={api.events.shifts()} columns={[{ key: "name", label: "Who", render: (x) => <span className="font-medium">{x.name}</span> }, { key: "role", label: "Role" }, { key: "where", label: "Where" }, { key: "time", label: "Shift" }]} />
          <div className="mt-4 flex items-center gap-3 rounded-lg bg-surface-2 p-4 text-sm">
            <span className="flex-1">Scanner sign-in code for this event: <span className="font-mono font-semibold">JAM-4417-GATE</span></span>
            <Button size="sm" variant="secondary"><Copy size={14} /> Copy</Button>
          </div>
        </Card>
      )}

      <Modal open={!!refund} onClose={() => setRefund(null)} title={`Refund ${refund}`} footer={<><Button variant="ghost" onClick={() => setRefund(null)}>Cancel</Button><Button variant="danger" onClick={() => { setRefund(null); toast("Refund started. The ticket is cancelled and can no longer be scanned."); }}>Refund and cancel ticket</Button></>}>
        <div className="space-y-4">
          <SelectOther label="Amount" options={["Full ticket price", "Ticket price minus booking fee"]} other="Custom amount" prompt="Amount to refund (K)" placeholder="e.g. 100" />
          <SelectOther label="Reason" options={["Customer request", "Event change", "Duplicate purchase"]} prompt="Reason for the refund" placeholder="Shown on the refund record and the buyer's receipt" />
          <p className="text-sm text-ink-3">The ticket is cancelled straight away and every scanner rejects it after its next sync (within 30 seconds when online).</p>
        </div>
      </Modal>
    </>
  );
}

/** Who came, by gender. Totals only, never a list of people; groups under 10 show as "fewer than 10". */
function WhoCame() {
  const r = api.dashboards.genderReport();
  const c = r.checkedIn;
  const total = c.female + c.male + c.notStated;
  const known = Math.round(((c.female + c.male) / total) * 100);
  const bar = [{ k: "Female", n: c.female, cls: "bg-kafue" }, { k: "Male", n: c.male, cls: "bg-marigold" }, { k: "Not stated", n: c.notStated, cls: "bg-line" }];
  return (
    <Card className="mt-6">
      <SectionTitle title="Who came" sub={`${total.toLocaleString()} checked in. Based on the ${known}% whose gender is known (from their account or the ticket).`} />
      <div className="flex h-4 overflow-hidden rounded-full" role="img" aria-label={`Female ${pct(c.female, total)}, male ${pct(c.male, total)}, not stated ${pct(c.notStated, total)}`}>
        {bar.map((b) => <span key={b.k} className={b.cls} style={{ width: `${(b.n / total) * 100}%` }} />)}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 text-sm">
        {bar.map((b) => <span key={b.k} className="flex items-center gap-2"><span className={`h-2.5 w-2.5 rounded-full ${b.cls}`} />{b.k}: <strong className="tabular-nums">{showCount(b.n)}</strong> ({pct(b.n, total)})</span>)}
      </div>
      <div className="mt-5 overflow-x-auto">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-ink-3"><th className="py-2 font-semibold">Ticket type</th><th className="py-2 text-right font-semibold">Female</th><th className="py-2 text-right font-semibold">Male</th><th className="py-2 text-right font-semibold">Not stated</th></tr></thead>
          <tbody className="divide-y divide-line">
            {r.byTicket.map((t) => <tr key={t.ticket}><td className="py-2">{t.ticket}</td><td className="py-2 text-right tabular-nums">{showCount(t.female)}</td><td className="py-2 text-right tabular-nums">{showCount(t.male)}</td><td className="py-2 text-right tabular-nums">{showCount(t.notStated)}</td></tr>)}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-xs text-ink-3">Tickets sold: female {r.sold.female.toLocaleString()}, male {r.sold.male.toLocaleString()}, not stated {r.sold.notStated.toLocaleString()}. Last event ({r.previous.event}): {r.previous.femalePct}% female, {r.previous.malePct}% male. Figures are totals only; no one&rsquo;s individual answer is shown.</p>
    </Card>
  );
}
