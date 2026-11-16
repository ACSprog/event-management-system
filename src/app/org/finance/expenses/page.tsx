"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge, Button, Card, PageHeader, Progress, SectionTitle, Table, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

const budget = [["Entertainment", 700_000, 640_000], ["Venue", 185_000, 185_000], ["Sound and lighting", 220_000, 185_000], ["Security", 110_000, 96_000], ["Marketing", 90_000, 35_000], ["Transport", 50_000, 42_000], ["Printing", 25_000, 18_400]] as const;

export default function Expenses() {
  const toast = useToast();
  const [rows, setRows] = useState(api.finance.expenses());
  return (
    <>
      <PageHeader title="Budgets and expenses" sub="Lusaka Summer Jam" actions={<Button><Plus size={15} /> Record expense</Button>} />
      <Card>
        <SectionTitle title="Budget vs spent" sub={`${kwacha(1_201_400)} spent of ${kwacha(1_450_000)}`} />
        <div className="grid gap-x-8 gap-y-3 md:grid-cols-2">
          {budget.map(([c, b, s]) => <div key={c}><div className="flex justify-between text-sm"><span>{c}</span><span className="text-ink-3">{kwacha(s)} of {kwacha(b)}</span></div><Progress value={(s / b) * 100} tone={s / b > 0.95 ? "marigold" : "kafue"} className="mt-1" /></div>)}
        </div>
      </Card>
      <SectionTitle title="Expenses" />
      <Table rows={rows} columns={[
        { key: "date", label: "Date" }, { key: "vendor", label: "Vendor", render: (x) => <span className="font-semibold">{x.vendor}</span> }, { key: "category", label: "Category" },
        { key: "amount", label: "Amount", align: "right", render: (x) => kwacha(x.amount) },
        { key: "status", label: "Status", render: (x) => <Badge tone={x.status === "Paid" ? "green" : x.status === "Approved" ? "teal" : "gold"}>{x.status}</Badge> },
        { key: "a", label: "", render: (x) => x.status === "Awaiting approval" ? <Button size="sm" onClick={() => { setRows(rows.map((r) => (r.id === x.id ? { ...r, status: "Approved" } : r))); toast("Expense approved"); }}>Approve</Button> : null },
      ]} />
    </>
  );
}
