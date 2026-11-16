"use client";

import Link from "next/link";
import { AlertTriangle, ArrowUpRight, Bot, PlusCircle } from "lucide-react";
import { useOrgRole } from "@/components/layout/org-role";
import { teamRoles } from "@/lib/roles";
import { Badge, Button, Card, PageHeader, Progress, SectionTitle, Stat, Stars } from "@/components/ui";
import { AreaTrend } from "@/components/ui/charts";
import { api, capacity, gross, sold, statusTone } from "@/lib/api";
import { compact, fmtDate, kwacha } from "@/lib/brand";

export default function OrgDashboard() {
  const { can, role } = useOrgRole();
  const first = teamRoles[role].person.split(" ")[0];
  const evs = api.events.forOrg();
  const upcoming = evs.filter((e) => !["Completed", "Draft"].includes(e.status));
  const series = api.finance.salesSeries();
  const jam = evs[0];
  const checklist = api.events.checklist();
  return (
    <>
      <PageHeader
        title={`Good afternoon, ${first}`}
        sub={`Signed in as ${teamRoles[role].label.toLowerCase()}. Here's what's happening across your events.`}
        actions={<>
          {can("events.edit") && <Button variant="secondary" href="/org/assistant/"><Bot size={16} /> Plan with AI</Button>}
          {can("money.view") && <Button variant="secondary" href="/org/reports/">Reports</Button>}
          {can("events.edit") && <Button href="/org/events/new/"><PlusCircle size={16} /> Create event</Button>}
        </>}
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {can("money.view") ? <Stat label="Ticket revenue, last 30 days" value={kwacha(4_212_800)} delta="+18%" hint="vs previous 30 days" /> : <Stat label="Checked in, last event" value="1,189" hint="Zed Live Sessions: October" />}
        <Stat label="Tickets sold, last 30 days" value="27,480" delta="+22%" hint="vs previous 30 days" />
        <Stat label="Upcoming events" value={upcoming.length} hint="2 need attention" />
        <Stat label="Average rating" value="4.5" hint="from 1,045 verified reviews" />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card>
          <SectionTitle title="Ticket sales" sub={can("money.view") ? "Daily revenue across all events" : "Tickets sold per day across all events"} action={<Badge tone="green">Spike on 9 Nov: VIP upgrade email</Badge>} />
          {can("money.view") ? <AreaTrend data={series} x="date" y="revenue" money height={260} /> : <AreaTrend data={series} x="date" y="tickets" height={260} />}
        </Card>
        <Card>
          <SectionTitle title="Needs your attention" />
          <ul className="space-y-3 text-sm">
            {can("events.publish") && <li className="flex gap-3 rounded-lg bg-marigold-soft p-3"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-[#a35f00]" /><div><p className="font-semibold">New Year&rsquo;s Eve Countdown is waiting for approval</p><Link href="/org/events/new-year-countdown/" className="text-kafue">Review and approve</Link></div></li>}
            {can("audience.view") && <li className="flex gap-3 rounded-lg bg-hibiscus-soft p-3"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-hibiscus" /><div><p className="font-semibold">2 reviews mention parking problems</p><Link href="/org/reviews/" className="text-kafue">Read and respond</Link></div></li>}
            {can("payouts.approve") && <li className="flex gap-3 rounded-lg bg-surface-2 p-3"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-ink-3" /><div><p className="font-semibold">PrintHub invoice K18,400 awaiting approval</p><Link href="/org/finance/expenses/" className="text-kafue">Approve expense</Link></div></li>}
          </ul>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Card pad={false}>
          <div className="p-5 pb-2"><SectionTitle title="Upcoming events" action={<Link href="/org/events/" className="text-sm font-semibold text-kafue">All events</Link>} /></div>
          <ul className="divide-y divide-line">
            {upcoming.map((e) => {
              const pct = (sold(e) / capacity(e)) * 100;
              return (
                <li key={e.id}>
                  <Link href={`/org/events/${e.slug}/`} className="grid items-center gap-3 px-5 py-4 hover:bg-surface-2 sm:grid-cols-[1fr_160px_110px_20px]">
                    <div className="min-w-0"><p className="truncate font-semibold">{e.title}</p><p className="text-sm text-ink-3">{fmtDate(e.start)}, {e.city}</p></div>
                    <div><Progress value={pct} tone={pct > 85 ? "marigold" : "kafue"} /><p className="mt-1 text-xs text-ink-3">{compact(sold(e))} of {compact(capacity(e))} sold</p></div>
                    <div className="text-right">{can("money.view") && <p className="font-semibold tabular-nums">{kwacha(gross(e))}</p>}<Badge tone={statusTone[e.status]}>{e.status}</Badge></div>
                    <ArrowUpRight size={16} className="hidden text-ink-3 sm:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
        <div className="space-y-6">
          <Card>
            <SectionTitle title={`${jam.title} checklist`} sub="26 days to go" />
            <ul className="space-y-2 text-sm">
              {checklist.slice(0, 5).map((c) => (
                <li key={c.task} className="flex items-center gap-2.5">
                  <span className={c.done ? "flex h-4 w-4 items-center justify-center rounded-full bg-leaf text-[10px] text-white" : "h-4 w-4 rounded-full border-2 border-line"}>{c.done ? "✓" : ""}</span>
                  <span className={c.done ? "text-ink-3 line-through" : ""}>{c.task}</span>
                  <span className="ml-auto text-xs text-ink-3">{c.owner}</span>
                </li>
              ))}
            </ul>
          </Card>
          {can("audience.view") && <Card>
            <SectionTitle title="Latest review" />
            <Stars value={2} />
            <p className="mt-1 font-semibold">Parking was chaos</p>
            <p className="text-sm text-ink-2">It took over an hour to leave the car park, and there were no marshals after 23:00.</p>
            <Button size="sm" variant="secondary" href="/org/reviews/" className="mt-3">Respond</Button>
          </Card>}
        </div>
      </div>
    </>
  );
}
