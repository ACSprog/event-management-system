"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle } from "lucide-react";
import { Badge, Button, PageHeader, Progress, Table, Tabs } from "@/components/ui";
import { api, capacity, gross, sold, statusTone, type EventItem } from "@/lib/api";
import { compact, fmtDate, kwacha } from "@/lib/brand";

export default function OrgEvents() {
  const router = useRouter();
  const [tab, setTab] = useState("All");
  const all = api.events.forOrg();
  const rows = all.filter((e) => tab === "All" || (tab === "Live and upcoming" ? !["Draft", "Completed", "Cancelled", "Pending approval"].includes(e.status) : tab === "Drafts" ? ["Draft", "Pending approval"].includes(e.status) : e.status === "Completed"));
  return (
    <>
      <PageHeader title="Events" sub={`${all.length} events in this workspace`} actions={<Button href="/org/events/new/"><PlusCircle size={16} /> Create event</Button>} />
      <Tabs tabs={["All", "Live and upcoming", "Drafts", "Past"]} value={tab} onChange={setTab} />
      <Table<EventItem & Record<string, unknown>>
        rows={rows as (EventItem & Record<string, unknown>)[]}
        onRow={(e) => router.push(`/org/events/${e.slug}/`)}
        columns={[
          { key: "title", label: "Event", render: (e) => <><p className="font-semibold">{e.title}</p><p className="text-xs text-ink-3">{e.category}, {e.format}</p></> },
          { key: "start", label: "Date", render: (e) => fmtDate(e.start, { day: "numeric", month: "short", year: "numeric" }) },
          { key: "status", label: "Status", render: (e) => <Badge tone={statusTone[e.status]}>{e.status}</Badge> },
          { key: "sold", label: "Sold", render: (e) => <div className="w-36"><Progress value={(sold(e) / capacity(e)) * 100} /><p className="mt-1 text-xs text-ink-3">{compact(sold(e))} / {compact(capacity(e))}</p></div> },
          { key: "gross", label: "Gross sales", align: "right", render: (e) => kwacha(gross(e)) },
        ]}
      />
    </>
  );
}
