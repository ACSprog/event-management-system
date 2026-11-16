"use client";

import { Badge, PageHeader, Table } from "@/components/ui";
import { api } from "@/lib/api";

export default function Support() {
  return (
    <>
      <PageHeader title="Support" sub="Requests from organisations" />
      <Table rows={api.platform.support()} columns={[
        { key: "id", label: "Ticket", render: (s) => <span className="font-mono text-xs">{s.id}</span> },
        { key: "subject", label: "Subject", render: (s) => <><p className="font-semibold">{s.subject}</p><p className="text-xs text-ink-3">{s.org}</p></> },
        { key: "priority", label: "Priority", render: (s) => <Badge tone={s.priority === "High" ? "red" : s.priority === "Normal" ? "grey" : "teal"}>{s.priority}</Badge> },
        { key: "status", label: "Status" }, { key: "assignee", label: "Assigned to" }, { key: "age", label: "Age", align: "right" },
      ]} />
    </>
  );
}
