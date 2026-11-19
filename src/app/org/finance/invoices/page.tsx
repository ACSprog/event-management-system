"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Badge, Button, Field, Input, Modal, PageHeader, Select, Stat, Table, useToast } from "@/components/ui";
import { useOrgRole } from "@/components/layout/org-role";
import { api } from "@/lib/api";
import { kwacha } from "@/lib/brand";

export default function Invoices() {
  const toast = useToast();
  const { can } = useOrgRole();
  const [rows, setRows] = useState(api.finance.invoices());
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ to: "", for: "", amount: "", due: "2026-12-16", vat: "VAT 16% included" });
  const [err, setErr] = useState("");
  const outstanding = rows.filter((r) => r.status !== "Paid" && r.status !== "Draft").reduce((a, r) => a + r.amount, 0);
  const create = (send: boolean) => {
    if (f.to.trim().length < 2) return setErr("Who is the invoice for?");
    if (!Number(f.amount.replace(/\D/g, ""))) return setErr("Enter the amount.");
    const id = `INV-ZL-${String(426 + rows.length).padStart(4, "0")}`;
    setRows([{ id, to: f.to, for: f.for || "Services", amount: Number(f.amount.replace(/\D/g, "")), issued: "2026-11-17", due: f.due, status: send ? "Sent" : "Draft" }, ...rows]);
    setOpen(false); setErr(""); setF({ to: "", for: "", amount: "", due: "2026-12-16", vat: "VAT 16% included" });
    toast(send ? `${id} emailed with a payment link` : `${id} saved as a draft`);
  };
  return (
    <>
      <PageHeader title="Invoices" sub="Bills you send to sponsors and corporate buyers. Each has a payment link for mobile money, card or bank transfer." actions={can("expenses.approve") ? <Button onClick={() => setOpen(true)}><Plus size={15} /> New invoice</Button> : undefined} />
      <div className="mb-6 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        <Stat label="Outstanding" value={kwacha(outstanding)} />
        <Stat label="Overdue" value={kwacha(rows.filter((r) => r.status === "Overdue").reduce((a, r) => a + r.amount, 0))} tone="down" />
        <Stat label="Paid this year" value={kwacha(rows.filter((r) => r.status === "Paid").reduce((a, r) => a + r.amount, 0))} />
      </div>
      <Table rows={rows} columns={[
        { key: "id", label: "Invoice", render: (r) => <span className="font-mono text-xs">{r.id}</span> },
        { key: "to", label: "To", render: (r) => <><p className="font-semibold">{r.to}</p><p className="text-xs text-ink-3">{r.for}</p></> },
        { key: "issued", label: "Issued" }, { key: "due", label: "Due" },
        { key: "amount", label: "Amount", align: "right", render: (r) => kwacha(r.amount) },
        { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Paid" ? "green" : r.status === "Overdue" ? "red" : r.status === "Sent" ? "teal" : "grey"}>{r.status}</Badge> },
        { key: "a", label: "", render: (r) => (r.status === "Overdue" ? <Button size="sm" variant="ghost" onClick={() => toast(`Reminder sent to ${r.to}`)}>Send reminder</Button> : r.status === "Draft" && can("expenses.approve") ? <Button size="sm" variant="ghost" onClick={() => { setRows(rows.map((x) => (x.id === r.id ? { ...x, status: "Sent" } : x))); toast("Invoice sent"); }}>Send</Button> : null) },
      ]} />
      <Modal open={open} onClose={() => setOpen(false)} title="New invoice" footer={<><Button variant="ghost" onClick={() => create(false)}>Save draft</Button><Button onClick={() => create(true)}>Send invoice</Button></>}>
        <div className="space-y-4">
          <Field label="Bill to" error={err}><Input value={f.to} onChange={(e) => setF({ ...f, to: e.target.value })} placeholder="Company or person" /></Field>
          <Field label="For"><Input value={f.for} onChange={(e) => setF({ ...f, for: e.target.value })} placeholder="e.g. Silver sponsorship, Summer Jam" /></Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Amount (K)"><Input inputMode="numeric" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></Field>
            <Field label="Due"><Input type="date" value={f.due} onChange={(e) => setF({ ...f, due: e.target.value })} /></Field>
          </div>
          <Field label="Tax"><Select value={f.vat} onChange={(e) => setF({ ...f, vat: e.target.value })} options={["VAT 16% included", "VAT 16% added", "No VAT"]} /></Field>
          <p className="text-xs text-ink-3">Invoices show your TPIN and are numbered in order. They can&rsquo;t be deleted once sent; cancel them with a credit note.</p>
        </div>
      </Modal>
    </>
  );
}
