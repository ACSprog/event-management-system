"use client";

import { Plus } from "lucide-react";
import { Button, PageHeader, Table } from "@/components/ui";
import { kwacha } from "@/lib/brand";

export default function Services() {
  return (
    <>
      <PageHeader title="Services and prices" sub="Shown to organisers in the vendor directory" actions={<Button><Plus size={15} /> Add service</Button>} />
      <Table rows={[
        { s: "Amphitheatre hire, full day", unit: "per day", price: 38_000, notes: "Includes security for the venue, not the event" },
        { s: "Amphitheatre hire, evening", unit: "17:00 to 01:00", price: 26_000, notes: "" },
        { s: "Sound package, 2,500 people", unit: "per event", price: 22_000, notes: "Engineer included" },
        { s: "Lighting rig", unit: "per event", price: 14_500, notes: "" },
        { s: "Backup generator", unit: "per day", price: 6_800, notes: "Fuel charged at cost" },
      ]} columns={[{ key: "s", label: "Service", render: (r) => <span className="font-semibold">{r.s}</span> }, { key: "unit", label: "Unit" }, { key: "price", label: "Price", align: "right", render: (r) => kwacha(r.price) }, { key: "notes", label: "Notes" }]} />
    </>
  );
}
