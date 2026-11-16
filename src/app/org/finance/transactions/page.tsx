"use client";

import { useState } from "react";
import { Download } from "lucide-react";
import { Badge, Button, cx, Input, PageHeader, Table } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function Transactions() {
  const [f, setF] = useState("All");
  const [q, setQ] = useState("");
  const rows = api.finance.transactions().filter((t) => (f === "All" || t.type === f || t.status === f) && `${t.id} ${t.customer}`.toLowerCase().includes(q.toLowerCase()));
  return (
    <>
      <PageHeader title="Transactions and refunds" sub="Every payment is matched to a confirmed callback from the payment provider before tickets are issued." actions={<Button variant="secondary"><Download size={15} /> Export CSV</Button>} />
      <div className="mb-4 flex flex-wrap gap-2">
        {["All", "Ticket sale", "Refund", "Donation", "Sponsorship", "Pending", "Failed"].map((x) => <button key={x} onClick={() => setF(x)} className={cx("rounded-full border px-3.5 py-1.5 text-sm font-medium", f === x ? "border-ink bg-ink text-canvas" : "border-line bg-surface")}>{x}</button>)}
        <Input className="ml-auto max-w-xs" placeholder="Search reference or name" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <Table rows={rows} columns={[
        { key: "id", label: "Reference", render: (t) => <span className="font-mono text-xs">{t.id}</span> },
        { key: "date", label: "Date" }, { key: "customer", label: "Customer" },
        { key: "type", label: "Type", render: (t) => <Badge tone={t.type === "Refund" ? "gold" : t.type === "Ticket sale" ? "grey" : "teal"}>{t.type}</Badge> },
        { key: "method", label: "Method" },
        { key: "amount", label: "Amount", align: "right", render: (t) => <span className={t.amount < 0 ? "text-hibiscus" : ""}>{t.amount < 0 ? `−${kwacha(-t.amount)}` : kwacha(t.amount)}</span> },
        { key: "fee", label: "Fee", align: "right", render: (t) => kwacha(t.fee, { decimals: true }) },
        { key: "status", label: "Status", render: (t) => <Badge tone={t.status === "Completed" ? "green" : t.status === "Pending" ? "gold" : "red"}>{t.status === "Pending" ? "Awaiting MoMo" : t.status}</Badge> },
      ]} />
    </>
  );
}
