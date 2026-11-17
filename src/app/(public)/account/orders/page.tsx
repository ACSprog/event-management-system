"use client";

import { SelectOther } from "@/components/select-other";

import { useState } from "react";
import { Badge, Button, Modal, PageHeader, Table, useToast } from "@/components/ui";
import { kwacha } from "@/lib/brand";

const orders = [
  { ref: "EVT-8K2Q9M", event: "Lusaka Summer Jam", date: "2026-11-14", items: "2 × Standard", total: 528, method: "MTN MoMo", status: "Paid" },
  { ref: "EVT-3PZ7LA", event: "Grace Chapel National Convention", date: "2026-11-02", items: "1 × Meal pack", total: 209, method: "Airtel Money", status: "Paid" },
  { ref: "EVT-9QW1XE", event: "Digital Marketing Bootcamp", date: "2026-10-30", items: "Full course", total: 1229, method: "Visa card", status: "Paid" },
  { ref: "EVT-1LM4RT", event: "Laugh Out Loud Friday", date: "2026-10-20", items: "1 × Standard", total: 209, method: "MTN MoMo", status: "Refunded" },
];

export default function Orders() {
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <PageHeader title="Orders and refunds" sub="Receipts for everything you've bought." />
      <Table
        rows={orders}
        columns={[
          { key: "ref", label: "Booking", render: (r) => <span className="font-mono text-xs">{r.ref}</span> },
          { key: "event", label: "Event", render: (r) => <><p className="font-semibold">{r.event}</p><p className="text-xs text-ink-3">{r.items}</p></> },
          { key: "date", label: "Bought" },
          { key: "method", label: "Paid with" },
          { key: "total", label: "Total", align: "right", render: (r) => kwacha(r.total) },
          { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Paid" ? "green" : "grey"}>{r.status}</Badge> },
          { key: "a", label: "", render: (r) => r.status === "Paid" ? <Button size="sm" variant="ghost" onClick={() => setOpen(r.ref)}>Request refund</Button> : <Button size="sm" variant="ghost">Receipt</Button> },
        ]}
      />
      <Modal open={!!open} onClose={() => setOpen(null)} title="Request a refund" footer={<><Button variant="ghost" onClick={() => setOpen(null)}>Keep my tickets</Button><Button variant="danger" onClick={() => { setOpen(null); toast("Refund requested. We'll update you by SMS."); }}>Request refund</Button></>}>
        <p className="text-sm text-ink-2">This organiser allows refunds until 5 December. The money goes back to the wallet or card you paid with, minus the K5 booking fee per ticket.</p>
        <div className="mt-4 space-y-4">
          <SelectOther label="Reason" options={["I can't attend anymore", "The event changed", "I bought by mistake"]} prompt="Tell us why" multiline placeholder="The organiser sees this with your request" />
        </div>
      </Modal>
    </>
  );
}
