"use client";

import { Badge, PageHeader, Stat, Table } from "@/components/ui";
import { api } from "@/lib/api";

export default function Audit() {
  return (
    <>
      <PageHeader title="Audit and security" sub="Every sign-in, permission change, refund and payout is recorded and cannot be edited." />
      <div className="mb-6 grid gap-4 sm:grid-cols-4">
        <Stat label="Privileged users with 2-step on" value="94%" />
        <Stat label="Blocked sign-in attempts, 24 h" value="38" />
        <Stat label="Rejected webhook signatures, 24 h" value="3" />
        <Stat label="Data requests open" value="2" hint="access and deletion, under the Data Protection Act" />
      </div>
      <Table rows={api.platform.audit()} columns={[
        { key: "time", label: "Time", className: "whitespace-nowrap" }, { key: "actor", label: "Who" }, { key: "org", label: "Organisation" },
        { key: "action", label: "Action", render: (a) => <span className="font-semibold">{a.action}</span> }, { key: "target", label: "Detail" },
        { key: "ip", label: "Source", render: (a) => <span className="font-mono text-xs">{a.ip}</span> },
        { key: "severity", label: "", render: (a) => <Badge tone={a.severity === "High" ? "red" : a.severity === "Warning" ? "gold" : "grey"}>{a.severity}</Badge> },
      ]} />
    </>
  );
}
