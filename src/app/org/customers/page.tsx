"use client";

import { useState } from "react";
import { Download, Plus } from "lucide-react";
import { Avatar, Badge, Button, Card, cx, Input, Modal, PageHeader, Stat, Table } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

const segments = ["All customers", "VIP regulars", "Concert fans", "New this month", "Lapsed 6 months", "Corporate"];

export default function Customers() {
  const [seg, setSeg] = useState("All customers");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<ReturnType<typeof api.crm.customers>[number] | null>(null);
  const rows = api.crm.customers().filter((c) => (seg === "All customers" || c.segment === seg) && c.name.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Customers" sub="People who bought tickets, registered or donated with you. Other organisers can't see this list." actions={<><Button variant="secondary"><Download size={15} /> Export</Button><Button><Plus size={15} /> New segment</Button></>} />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Customers" value="48,210" delta="+3,140" hint="this month" />
        <Stat label="Can receive marketing" value="71%" hint="gave consent" />
        <Stat label="Bought twice or more" value="34%" />
        <Stat label="Average spend" value={kwacha(612)} />
      </div>
      <div className="mb-4 flex flex-wrap gap-2">
        {segments.map((s) => <button key={s} onClick={() => setSeg(s)} className={cx("rounded-full border px-3.5 py-1.5 text-sm font-medium", seg === s ? "border-ink bg-ink text-canvas" : "border-line bg-surface")}>{s}</button>)}
        <Input className="ml-auto max-w-xs" placeholder="Search customers" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Table rows={rows} onRow={setOpen} empty="No customers in this segment match your search." columns={[
        { key: "name", label: "Customer", render: (c) => <div className="flex items-center gap-2.5"><Avatar name={c.name} size={28} /><div><p className="font-semibold">{c.name}</p><p className="text-xs text-ink-3">{c.email}</p></div></div> },
        { key: "city", label: "Town" }, { key: "events", label: "Events", align: "right" },
        { key: "spent", label: "Total spent", align: "right", render: (c) => kwacha(c.spent) },
        { key: "segment", label: "Segment", render: (c) => <Badge tone="teal">{c.segment}</Badge> },
        { key: "consent", label: "Marketing", render: (c) => (c.consent ? <Badge tone="green">Opted in</Badge> : <Badge>No consent</Badge>) },
      ]} />
      <Modal open={!!open} onClose={() => setOpen(null)} title={open?.name ?? ""}>
        {open && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-3">
              <div><p className="text-ink-3">Email</p><p className="font-semibold">{open.email}</p></div>
              <div><p className="text-ink-3">Town</p><p className="font-semibold">{open.city}</p></div>
              <div><p className="text-ink-3">Loyalty</p><p className="font-semibold">{open.loyalty}</p></div>
              <div><p className="text-ink-3">Last activity</p><p className="font-semibold">{open.lastSeen}</p></div>
            </div>
            <div><p className="mb-1 font-semibold">History</p>
              <ul className="space-y-1.5"><li>Bought 2 × Standard, Lusaka Summer Jam, K528</li><li>Checked in, Zed Live Sessions: October, Gate A 19:12</li><li>Opened email &ldquo;VIP upgrade&rdquo;, 10 Nov</li><li>Left a 5-star review</li></ul>
            </div>
            <div><p className="mb-1 font-semibold">Notes</p><textarea className="w-full rounded-lg border border-line bg-surface p-2" rows={3} placeholder="Visible to your team only" /></div>
          </div>
        )}
      </Modal>
    </>
  );
}
