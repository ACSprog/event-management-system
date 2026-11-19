"use client";

import Link from "next/link";
import { useAdminRole } from "@/components/layout/admin-role";
import { ActivityFeed, AttentionQueue, DashRow, LivePanel, StatusStrip } from "@/components/dashboard";
import { Badge, Card, PageHeader, SectionTitle, Stat, Table } from "@/components/ui";
import { AreaTrend, Bars } from "@/components/ui/charts";
import { SettlementBadge, Countdown } from "@/components/settlement";
import { api, heldAmount, payable, sold, statusTone, type EventItem, type Settlement } from "@/lib/api";
import { fmtDate, kwacha } from "@/lib/brand";
import { isLive } from "@/lib/date-ranges";
import { adminQueue } from "@/lib/queues";

/**
 * Super admin home. Same order as the organiser and attendee homes:
 * key figures → needs your attention → right now → money and status →
 * trends and lists → recent activity. What each block shows depends on the
 * staff role.
 */
export default function AdminHome() {
  const { can, role, roleInfo } = useAdminRole();
  const series = api.platform.series();
  const orgs = api.orgs.list();
  const all = api.settlements.list();
  const open = all.filter((s) => s.status !== "SETTLED" && s.status !== "CANCELLED");
  const held = open.reduce((a, s) => a + payable(s), 0);
  const cashouts = api.contributions.cashouts();
  const finance = can("settlements.review") || can("settlements.approve");
  const seesMoney = can("platform.view");
  const live = api.events.discover().filter((e) => isLive(e));

  return (
    <>
      <PageHeader title="Platform overview" sub={`Signed in as ${roleInfo(role).label.toLowerCase()}. The queue and figures change with your role.`} />

      {/* 1. Key figures */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {finance ? (
          <>
            <Stat label="Held for organisers" value={kwacha(held)} hint="Owed to organisers, not EMS income" />
            <Stat label="EMS revenue, November" value={kwacha(series[11].fees + 412_000)} hint="Fees, subscriptions and licences" />
            <Stat label="Settlements in progress" value={open.length} hint={`${open.filter((s) => s.status === "DISPUTED" || s.status === "FAILED").length} need fixing`} />
            <Stat label="Contribution cashouts" value={cashouts.length} hint={`${cashouts.filter((c) => c.route === "AUTOMATIC").length} released automatically`} />
          </>
        ) : (
          <>
            <Stat label="Organisations" value={orgs.length} hint={`${orgs.filter((o) => o.status === "Pending").length} waiting for approval`} />
            {seesMoney ? <Stat label="Ticket volume, November" value={kwacha(series[11].gmv)} delta="+19%" /> : <Stat label="Open support tickets" value={api.platform.support().filter((t) => t.status !== "Resolved").length} />}
            <Stat label="Reviews to moderate" value={api.reviews.reported().filter((r) => r.status === "Needs decision").length + api.reviews.pendingPhotos().length} />
            <Stat label="Active customers, 30 days" value="186,400" />
          </>
        )}
      </div>

      {/* 2 and 3. Needs your attention, right now */}
      <DashRow>
        <AttentionQueue items={adminQueue()} can={can} />
        <LivePanel live rows={api.dashboards.platformNow()} />
      </DashRow>

      {/* Events happening now across the platform */}
      <DashRow wide>
        <Card pad={false}>
          <div className="p-5 pb-2"><SectionTitle title="Happening now" sub={`${live.length} events on across Zambia right now (sample)`} action={<Link href="/events/?when=now" className="text-sm font-semibold text-kafue">See on the public site</Link>} /></div>
          <Table<EventItem & Record<string, unknown>>
            rows={live as (EventItem & Record<string, unknown>)[]}
            empty="No events are on right now."
            columns={[
              { key: "title", label: "Event", render: (e) => <><p className="flex items-center gap-2 font-semibold"><span className="h-2 w-2 rounded-full bg-hibiscus motion-safe:animate-pulse" />{e.title}</p><p className="text-xs text-ink-3">{api.orgs.list().find((o) => o.id === e.orgId)?.name} · {e.category}</p></> },
              { key: "where", label: "Where", render: (e) => <span className="text-sm">{e.format === "Virtual" ? "Online" : `${api.venues.get(e.venueId).name}, ${e.city}`}</span> },
              { key: "until", label: "Ends", render: (e) => <span className="text-sm">{fmtDate(e.end, { weekday: "short", hour: "2-digit", minute: "2-digit" })}</span> },
              { key: "in", label: "Checked in", align: "right", render: (e) => <span className="tabular-nums">{Math.round(sold(e) * 0.81).toLocaleString()} of {sold(e).toLocaleString()}</span> },
            ]}
          />
        </Card>
      </DashRow>

      {/* 4. Money and status */}
      <DashRow>
        {finance ? (
          <Card pad={false}>
            <div className="p-5 pb-2"><SectionTitle title="Settlement pipeline" action={<Link href="/admin/settlements/" className="text-sm font-semibold text-kafue">All settlements</Link>} /></div>
            <Table<Settlement>
              rows={open}
              columns={[
                { key: "event", label: "Event", render: (s) => <><p className="font-semibold">{s.event}</p><p className="text-xs text-ink-3">{s.orgName}</p></> },
                { key: "status", label: "Status", render: (s) => <SettlementBadge s={s} /> },
                { key: "next", label: "Deadline", render: (s) => <Countdown s={s} /> },
                { key: "amount", label: "Payable", align: "right", render: (s) => <span className="tabular-nums">{kwacha(payable(s) - heldAmount(s))}</span> },
              ]}
            />
          </Card>
        ) : (
          <div>
            <SectionTitle title="Organisations" action={<Link href="/admin/organisations/" className="text-sm font-semibold text-kafue">All</Link>} />
            <Table rows={orgs.slice(0, 5)} columns={[{ key: "name", label: "Organisation", render: (o) => <span className="font-semibold">{o.name}</span> }, { key: "plan", label: "Plan" }, { key: "status", label: "Status", render: (o) => <Badge tone={statusTone[o.status]}>{o.status}</Badge> }]} />
          </div>
        )}
        <Card>
          <SectionTitle title="Service status" action={can("health.view") ? <Link href="/admin/health/" className="text-sm font-semibold text-kafue">System health</Link> : undefined} />
          <StatusStrip items={api.dashboards.serviceStatus()} explain />
        </Card>
      </DashRow>

      {/* 5. Trends and lists */}
      {seesMoney && (
        <DashRow>
          <Card><SectionTitle title="Ticket volume through the platform" sub="Last 12 months" /><AreaTrend data={series} x="month" y="gmv" money /></Card>
          <Card><SectionTitle title="Organisations on the platform" /><Bars data={series} x="month" keys={["orgs"]} labels={["Organisations"]} /></Card>
        </DashRow>
      )}

      {/* 6. Recent activity */}
      <DashRow wide>
        <ActivityFeed title="Recent activity (audit log)" rows={api.dashboards.adminActivity()} href={can("audit.view") ? "/admin/audit/" : undefined} />
      </DashRow>
    </>
  );
}
