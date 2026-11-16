"use client";

import { useState } from "react";
import { Check, Minus, Plus, ShieldCheck } from "lucide-react";
import { Avatar, Badge, Button, Card, Field, Input, Modal, PageHeader, SectionTitle, Select, Tabs, useToast } from "@/components/ui";
import { api } from "@/lib/api";

export default function Team() {
  const toast = useToast();
  const [tab, setTab] = useState("People");
  const [invite, setInvite] = useState(false);
  const m = api.orgs.permissions();
  return (
    <>
      <PageHeader title="Team and roles" actions={<Button onClick={() => setInvite(true)}><Plus size={15} /> Invite</Button>} />
      <Tabs tabs={["People", "Roles and permissions"]} value={tab} onChange={setTab} />
      {tab === "People" ? (
        <Card pad={false}>
          <ul className="divide-y divide-line">
            {api.orgs.team().map((p) => (
              <li key={p.email} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <Avatar name={p.name} />
                <div className="min-w-0 flex-1"><p className="font-semibold">{p.name}</p><p className="text-xs text-ink-3">{p.email}</p></div>
                <Badge tone="teal">{p.role}</Badge>
                {p.mfa ? <Badge tone="green"><ShieldCheck size={11} /> 2-step on</Badge> : <Badge tone="gold">2-step off</Badge>}
                <span className="w-24 text-right text-xs text-ink-3">{p.status === "Invited" ? "Invited" : p.lastActive}</span>
              </li>
            ))}
          </ul>
        </Card>
      ) : (
        <Card>
          <SectionTitle title="What each role can do" sub="Custom roles are available on the Enterprise plan." action={<Button size="sm" variant="secondary"><Plus size={14} /> Custom role</Button>} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-line text-ink-3"><th className="py-2 text-left font-medium">Permission</th>{m.roles.map((r) => <th key={r} className="px-2 py-2 font-medium">{r}</th>)}</tr></thead>
              <tbody>{m.rows.map((r) => <tr key={r.area} className="border-b border-line last:border-0"><td className="py-2.5">{r.area}</td>{r.v.map((v, i) => <td key={i} className="text-center">{v ? <Check size={16} className="mx-auto text-leaf" aria-label="Allowed" /> : <Minus size={16} className="mx-auto text-line" aria-label="Not allowed" />}</td>)}</tr>)}</tbody>
            </table>
          </div>
        </Card>
      )}
      <Modal open={invite} onClose={() => setInvite(false)} title="Invite a team member" footer={<><Button variant="ghost" onClick={() => setInvite(false)}>Cancel</Button><Button onClick={() => { setInvite(false); toast("Invitation sent"); }}>Send invitation</Button></>}>
        <div className="space-y-4">
          <Field label="Email"><Input type="email" placeholder="name@company.example" /></Field>
          <Field label="Role"><Select options={["Event manager", "Finance officer", "Marketing officer", "Check-in officer", "Organisation admin"]} /></Field>
          <Field label="Limit to events" hint="Leave empty for all events"><Select options={["All events", "Lusaka Summer Jam only"]} /></Field>
          <p className="text-xs text-ink-3">Admins and finance officers must turn on 2-step sign-in.</p>
        </div>
      </Modal>
    </>
  );
}
