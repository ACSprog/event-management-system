"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Badge, Button, cx, PageHeader, Progress, Table } from "@/components/ui";
import { api, capacity, gross, sold, statusTone, type EventItem } from "@/lib/api";
import { useOrgRole } from "@/components/layout/org-role";
import { compact, fmtDate, kwacha } from "@/lib/brand";
import { isLive } from "@/lib/date-ranges";

export default function OrgEvents() {
  const router = useRouter();
  const { can } = useOrgRole();
  const [tab, setTab] = useState("All");
  const all = api.events.forOrg();
  const groups: Record<string, string[]> = {
    "Live and upcoming": ["Approved", "Published", "Registration open", "Sold out", "Registration closed", "In progress"],
    Drafts: ["Draft", "Pending approval"],
    Past: ["Completed", "Cancelled"],
    Archived: ["Archived"],
  };
  const live = all.filter((e) => isLive(e));
  const rows = tab === "Happening now" ? live : all.filter((e) => (tab === "All" ? e.status !== "Archived" : groups[tab].includes(e.status)));
  return (
    <>
      <PageHeader title="Events" sub={`${all.length} events in this workspace`} actions={can("events.edit") ? <Button href="/org/events/new/"><PlusCircle size={16} /> Create event</Button> : undefined} />
      <div className="mb-4 flex flex-wrap gap-2">
        {["All", "Happening now", "Live and upcoming", "Drafts", "Past", "Archived"].map((x) => (
          <button key={x} onClick={() => setTab(x)} aria-pressed={tab === x} className={cx("flex items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-sm font-medium", tab === x ? "border-ink bg-ink text-canvas" : x === "Happening now" ? "border-hibiscus/50 bg-hibiscus-soft text-hibiscus" : "border-line bg-surface")}>
            {x === "Happening now" && <span className="h-2 w-2 rounded-full bg-hibiscus motion-safe:animate-pulse" />}{x}{x === "Happening now" && <span className="tabular-nums">{live.length}</span>}
          </button>
        ))}
      </div>
      <Table<EventItem & Record<string, unknown>>
        rows={rows as (EventItem & Record<string, unknown>)[]}
        empty={tab === "Happening now" ? "None of your events are on right now." : "No events here yet."}
        onRow={(e) => router.push(`/org/events/${e.slug}/`)}
        columns={[
          { key: "title", label: "Event", render: (e) => <><p className="font-semibold">{e.title}</p><p className="text-xs text-ink-3">{e.category}, {e.format}</p></> },
          { key: "start", label: "Date", render: (e) => fmtDate(e.start, { day: "numeric", month: "short", year: "numeric" }) },
          { key: "status", label: "Status", render: (e) => (isLive(e) ? <Badge tone="red"><span className="h-1.5 w-1.5 rounded-full bg-hibiscus motion-safe:animate-pulse" /> Live now</Badge> : <Badge tone={statusTone[e.status]}>{e.status}</Badge>) },
          { key: "sold", label: "Sold", render: (e) => <div className="w-36"><Progress value={(sold(e) / capacity(e)) * 100} /><p className="mt-1 text-xs text-ink-3">{compact(sold(e))} / {compact(capacity(e))}</p></div> },
          ...(can("money.view") ? [{ key: "gross", label: "Gross sales", align: "right" as const, render: (e: EventItem) => kwacha(gross(e)) }] : []),
        ]}
      />
    </>
  );
}
