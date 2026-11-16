"use client";

import { useState } from "react";
import { Badge, Button, Field, Input, Modal, PageHeader, Table, Textarea, useToast } from "@/components/ui";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function Rfqs() {
  const toast = useToast();
  const [open, setOpen] = useState<string | null>(null);
  const [amt, setAmt] = useState("");
  const [err, setErr] = useState("");
  return (
    <>
      <PageHeader title="Quote requests" sub="From organisers who listed your services" />
      <Table rows={api.vendors.rfqs()} columns={[
        { key: "id", label: "Request", render: (r) => <span className="font-mono text-xs">{r.id}</span> },
        { key: "title", label: "What they need", render: (r) => <><p className="font-semibold">{r.title}</p><p className="text-xs text-ink-3">{r.org}, {r.event}</p></> },
        { key: "due", label: "Due" }, { key: "budget", label: "Budget", align: "right", render: (r) => kwacha(r.budget) }, { key: "quotes", label: "Quotes so far", align: "right" },
        { key: "status", label: "", render: (r) => r.status === "Open" ? <Button size="sm" onClick={() => setOpen(r.id)}>Submit quote</Button> : <Badge tone={r.status === "Awarded" ? "green" : "gold"}>{r.status}</Badge> },
      ]} />
      <Modal open={!!open} onClose={() => setOpen(null)} title={`Quote for ${open}`} footer={<><Button variant="ghost" onClick={() => setOpen(null)}>Cancel</Button><Button onClick={() => { if (!Number(amt.replace(/\D/g, ""))) return setErr("Enter your total price."); setOpen(null); setAmt(""); setErr(""); toast("Quote sent. You'll be notified if it's shortlisted."); }}>Send quote</Button></>}>
        <div className="space-y-4">
          <Field label="Total price (K)" error={err}><Input value={amt} onChange={(e) => setAmt(e.target.value)} inputMode="numeric" /></Field>
          <Field label="What's included"><Textarea placeholder="Equipment, staff, set-up time, transport…" /></Field>
          <Field label="Valid until"><Input type="date" defaultValue="2026-12-01" /></Field>
          <Field label="Attachments"><div className="rounded-lg border-2 border-dashed border-line p-4 text-center text-sm text-ink-3">Add a PDF quotation or equipment list</div></Field>
        </div>
      </Modal>
    </>
  );
}
