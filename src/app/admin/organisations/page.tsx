"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import { Badge, Button, Card, cx, Input, Modal, PageHeader, Table, useToast } from "@/components/ui";
import { api, statusTone } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function AdminOrgs() {
  const toast = useToast();
  const [rows, setRows] = useState(api.orgs.list());
  const [f, setF] = useState("All");
  const [sel, setSel] = useState<(typeof rows)[number] | null>(null);
  const setStatus = (id: string, status: "Active" | "Suspended") => { setRows(rows.map((r) => (r.id === id ? { ...r, status } : r))); setSel(null); toast(status === "Active" ? "Organisation approved. They can now publish paid events." : "Organisation suspended. Their events are hidden and payouts paused."); };
  return (
    <>
      <PageHeader title="Organisations" sub={`${rows.length} shown of 571`} />
      <div className="mb-4 flex flex-wrap gap-2">
        {["All", "Pending", "Trial", "Active", "Suspended"].map((x) => <button key={x} onClick={() => setF(x)} className={cx("rounded-full border px-3.5 py-1.5 text-sm font-medium", f === x ? "border-ink bg-ink text-canvas" : "border-line bg-surface")}>{x}</button>)}
        <Input className="ml-auto max-w-xs" placeholder="Search organisations" />
      </div>
      <Table rows={rows.filter((r) => f === "All" || r.status === f)} onRow={setSel} columns={[
        { key: "name", label: "Organisation", render: (o) => <><p className="flex items-center gap-1 font-semibold">{o.name}{o.verified && <BadgeCheck size={14} className="text-kafue" />}</p><p className="text-xs text-ink-3">{o.type}, {o.city}</p></> },
        { key: "plan", label: "Plan" }, { key: "joined", label: "Joined" }, { key: "events", label: "Events", align: "right" },
        { key: "revenue", label: "Sales, year", align: "right", render: (o) => kwacha(o.revenue) },
        { key: "status", label: "Status", render: (o) => <Badge tone={statusTone[o.status]}>{o.status}</Badge> },
      ]} />
      <Modal open={!!sel} onClose={() => setSel(null)} title={sel?.name ?? ""} footer={sel && (sel.status === "Suspended" || sel.status === "Pending" ? <Button onClick={() => setStatus(sel.id, "Active")}>Approve organisation</Button> : <Button variant="danger" onClick={() => setStatus(sel.id, "Suspended")}>Suspend</Button>)}>
        {sel && (
          <div className="space-y-4 text-sm">
            <p className="text-ink-2">{sel.about}</p>
            <div className="grid grid-cols-2 gap-3">{[["Plan", sel.plan], ["Status", sel.status], ["Followers", sel.followers.toLocaleString()], ["Sales this year", kwacha(sel.revenue)]].map(([k, v]) => <div key={k}><p className="text-ink-3">{k}</p><p className="font-semibold">{v}</p></div>)}</div>
            <Card className="bg-surface-2"><p className="font-semibold">Verification checklist</p><ul className="mt-2 space-y-1"><li>{sel.verified ? "✓" : "○"} PACRA certificate checked</li><li>{sel.verified ? "✓" : "○"} Director ID matched</li><li>{sel.status === "Active" ? "✓" : "○"} Payout account verified with a K1 test</li></ul></Card>
            <p className="text-xs text-ink-3">Platform admins can see organisation settings and totals, but not individual customer records, unless the organisation grants support access.</p>
          </div>
        )}
      </Modal>
    </>
  );
}
