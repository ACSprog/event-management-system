"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Badge, Button, cx, Input, PageHeader, Table } from "@/components/ui";
import { api } from "@/lib/api";

const areas = ["All", "Money", "Events", "Team", "Audience", "Settings", "Security"];

export default function Activity() {
  const [area, setArea] = useState("All");
  const [q, setQ] = useState("");
  const rows = api.activity.forOrg().filter((r) => (area === "All" || r.area === area) && `${r.who} ${r.what}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Activity log" sub="Everything your team does that matters: refunds, payout changes, price changes, role changes, campaigns and sign-ins. Entries can't be edited or deleted." actions={<Button variant="secondary"><Download size={15} /> Export CSV</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        {areas.map((x) => <button key={x} onClick={() => setArea(x)} className={cx("rounded-full border px-3.5 py-1.5 text-sm font-medium", area === x ? "border-ink bg-ink text-canvas" : "border-line bg-surface")}>{x}</button>)}
        <div className="ml-auto w-full max-w-xs"><Input placeholder="Search people or actions" value={q} onChange={(e) => setQ(e.target.value)} /></div>
      </div>
      <Table rows={rows} columns={[
        { key: "at", label: "When", render: (r) => <span className="whitespace-nowrap text-sm">{r.at}</span> },
        { key: "who", label: "Who", render: (r) => <><p className="font-semibold">{r.who}</p><p className="text-xs text-ink-3">{r.role}</p></> },
        { key: "what", label: "What happened" },
        { key: "area", label: "Area", render: (r) => <Badge tone={r.area === "Security" ? "red" : r.area === "Money" ? "gold" : "grey"}>{r.area}</Badge> },
        { key: "ip", label: "From", render: (r) => <span className="font-mono text-xs text-ink-3">{r.ip}</span> },
      ]} />
    </>
  );
}
