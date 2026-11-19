"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bot, PlusCircle, ScanLine } from "lucide-react";
import { useOrgRole } from "@/components/layout/org-role";
import { ActivityFeed, AttentionQueue, DashRow, KeyList, LivePanel, StatusStrip } from "@/components/dashboard";
import { Badge, Button, Card, PageHeader, Progress, SectionTitle, Stat, Stars, Toggle } from "@/components/ui";
import { AreaTrend } from "@/components/ui/charts";
import { api, capacity, gross, payable, sold, statusTone } from "@/lib/api";
import { compact, fmtDate, kwacha } from "@/lib/brand";
import { orgQueue } from "@/lib/queues";

/**
 * Organiser home. Arranged like the super admin home:
 * key figures → needs your attention → right now → money and status →
 * trends and lists → recent activity. On event day the live panel leads.
 * Settlements are shown as waiting for EMS finance, never with an approve button.
 */
export default function OrgDashboard() {
  const { can, role, roleInfo } = useOrgRole();
  const [eventDay, setEventDay] = useState(false);
  const first = roleInfo(role).person.split(" ")[0];
  const evs = api.events.forOrg();
  const upcoming = evs.filter((e) => !["Completed", "Draft"].includes(e.status));
  const series = api.finance.salesSeries();
  const jam = evs[0];
  const checklist = api.events.checklist();
  const money = can("money.view");
  const settlements = api.settlements.list("org1").filter((s) => s.status !== "SETTLED" && s.status !== "CANCELLED");
  const held = settlements.reduce((a, s) => a + payable(s), 0);
  const contrib = api.contributions.balance();
  const sub = api.billing.subscription();
  const latest = api.reviews.forEvent().find((r) => !r.reply && r.visibility === "Public");

  const queue = <AttentionQueue items={orgQueue()} can={can} />;
  const live = (
    <LivePanel
      title={eventDay ? "Event day" : "Right now"}
      live={eventDay}
      rows={api.dashboards.orgNow(eventDay)}
      footer={eventDay && can("checkin.scan") ? <><Button size="sm" href="/org/scan/"><ScanLine size={14} /> Open scanner</Button><Button size="sm" variant="secondary" href="/org/checkin/">Live check-in board</Button></> : undefined}
    />
  );

  return (
    <>
      <PageHeader
        title={`Good afternoon, ${first}`}
        sub={`Signed in as ${roleInfo(role).label.toLowerCase()}. The queue and figures change with your role.`}
        actions={<>
          <div className="w-48"><Toggle checked={eventDay} onChange={setEventDay} label="Preview event day" /></div>
          {can("events.edit") && <Button variant="secondary" href="/org/assistant/"><Bot size={16} /> Plan with AI</Button>}
          {can("events.edit") && <Button href="/org/events/new/"><PlusCircle size={16} /> Create event</Button>}
        </>}
      />

      {/* 1. Key figures */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {money ? <Stat label="Ticket revenue, last 30 days" value={kwacha(4_212_800)} delta="+18%" hint="vs previous 30 days" /> : <Stat label="Checked in, last event" value="1,189" hint="Zed Live Sessions: October" />}
        {money ? <Stat label="Held for you" value={kwacha(held)} hint="Paid after each event by EMS finance" /> : <Stat label="Upcoming events" value={upcoming.length} />}
        <Stat label="Tickets sold, last 30 days" value="27,480" delta="+22%" hint="vs previous 30 days" />
        <Stat label="Average rating" value="4.5" hint="from 1,045 verified reviews" />
      </div>

      {/* 2 and 3. Needs your attention and right now (live view leads on event day) */}
      <DashRow>{eventDay ? <>{live}{queue}</> : <>{queue}{live}</>}</DashRow>

      {/* 4. Money and status */}
      <DashRow>
        {money ? (
          <Card>
            <SectionTitle title="Money summary" action={<Link href="/org/finance/settlements/" className="text-sm font-semibold text-kafue">Settlements</Link>} />
            <KeyList rows={[
              ...settlements.slice(0, 3).map((s) => [<span key={s.ref}>{s.event}<span className="block text-xs text-ink-3">{s.status === "ORGANISER_REVIEW" ? "Statement ready for your review" : s.status === "AWAITING_EVENT_COMPLETION" ? "Paid after the event" : "With EMS finance"}</span></span>, kwacha(payable(s))] as const),
              [<span key="c">Contributions available now<span className="block text-xs text-ink-3">{kwacha(contrib.clearing)} card money still clearing. Last cashout {kwacha(contrib.last.amount)}, released automatically.</span></span>, kwacha(contrib.available)] as const,
            ]} />
            <div className="mt-4 flex flex-wrap gap-2">
              {can("contributions.cashout") && <Button size="sm" variant="secondary" href="/org/finance/contributions/">Cash out contributions</Button>}
            </div>
            <p className="mt-3 text-xs text-ink-3">Ticket money is paid once, after the event. EMS finance approves settlements; your team accepts or disputes the statement.</p>
          </Card>
        ) : (
          <Card>
            <SectionTitle title={can("campaigns.send") ? "Campaigns" : "Tasks this week"} />
            {can("campaigns.send")
              ? <KeyList rows={[["Summer Jam: last 500 tickets (SMS and WhatsApp)", "186 sales"], ["VIP upgrade email", "142 sales"]]} />
              : <KeyList rows={api.dashboards.tasks().map((t) => [<span key={t.task}>{t.task}<span className="block text-xs text-ink-3">{t.owner}</span></span>, t.due] as const)} />}
          </Card>
        )}
        <Card>
          <SectionTitle title="Status and plan" action={can("team.manage") ? <Link href="/org/settings/billing/" className="text-sm font-semibold text-kafue">Plan and billing</Link> : undefined} />
          <StatusStrip items={api.dashboards.serviceStatus()} explain />
          <div className="mt-4">
            <KeyList rows={[["Plan", sub.plan], ...sub.usage.slice(0, 2).map((u) => [u.label, `${u.used.toLocaleString()} of ${u.limit === null ? "unlimited" : u.limit.toLocaleString()}`] as const)]} />
          </div>
        </Card>
      </DashRow>

      {/* 5. Trends and lists */}
      <DashRow>
        <Card>
          <SectionTitle title="Ticket sales" sub={money ? "Daily revenue across all events" : "Tickets sold per day across all events"} action={<Badge tone="green">Spike on 9 Nov: VIP upgrade email</Badge>} />
          {money ? <AreaTrend data={series} x="date" y="revenue" money height={240} /> : <AreaTrend data={series} x="date" y="tickets" height={240} />}
        </Card>
        <Card pad={false}>
          <div className="p-5 pb-2"><SectionTitle title="Upcoming events" action={<Link href="/org/events/" className="text-sm font-semibold text-kafue">All events</Link>} /></div>
          <ul className="divide-y divide-line">
            {upcoming.map((e) => {
              const pct = (sold(e) / capacity(e)) * 100;
              return (
                <li key={e.id}>
                  <Link href={`/org/events/${e.slug}/`} className="grid items-center gap-3 px-5 py-3 hover:bg-surface-2 sm:grid-cols-[1fr_120px_20px]">
                    <div className="min-w-0"><p className="truncate font-semibold">{e.title}</p><p className="text-sm text-ink-3">{fmtDate(e.start)}, {e.city}{money && ` · ${kwacha(gross(e))}`}</p></div>
                    <div><Progress value={pct} tone={pct > 85 ? "marigold" : "kafue"} /><p className="mt-1 text-xs text-ink-3">{compact(sold(e))} of {compact(capacity(e))} <Badge tone={statusTone[e.status]} className="ml-1">{e.status}</Badge></p></div>
                    <ArrowUpRight size={16} className="hidden text-ink-3 sm:block" />
                  </Link>
                </li>
              );
            })}
          </ul>
        </Card>
      </DashRow>

      {/* 6. Checklist, latest review and recent activity */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card>
          <SectionTitle title={`${jam.title} checklist`} sub="25 days to go" />
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
        {can("audience.view") && latest ? (
          <Card>
            <SectionTitle title="Latest review without a reply" />
            <Stars value={latest.rating} />
            <p className="mt-1 font-semibold">{latest.title}</p>
            <p className="text-sm text-ink-2">{latest.body}</p>
            {can("reviews.reply") && <Button size="sm" variant="secondary" href="/org/reviews/" className="mt-3">Reply</Button>}
          </Card>
        ) : <div />}
        <ActivityFeed rows={api.activity.forOrg().slice(0, 5).map((a) => ({ what: `${a.who}: ${a.what}`, at: a.at }))} href={can("team.manage") ? "/org/settings/activity/" : undefined} />
      </div>
    </>
  );
}
