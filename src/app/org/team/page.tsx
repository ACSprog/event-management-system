"use client";

import { Fragment, useState } from "react";
import { Lock, Plus, ShieldCheck } from "lucide-react";
import { Avatar, Badge, Button, Card, cx, Field, Input, Modal, PageHeader, Select, Tabs, useToast } from "@/components/ui";
import { useOrgRole } from "@/components/layout/org-role";
import { api } from "@/lib/api";
import { permissions, roleByLabel, roleOrder, teamRoles, type Permission, type TeamRole } from "@/lib/roles";

export default function Team() {
  const toast = useToast();
  const { rolePerms, setRolePerms } = useOrgRole();
  const [tab, setTab] = useState("People");
  const [people, setPeople] = useState(api.orgs.team().map((p) => ({ ...p, roleKey: roleByLabel(p.role) })));
  const [invite, setInvite] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "event_manager" as TeamRole, events: "All events" });
  const [err, setErr] = useState("");
  const [draft, setDraft] = useState(rolePerms);
  const dirty = JSON.stringify(draft) !== JSON.stringify(rolePerms);
  const groups = [...new Set(permissions.map((p) => p.group))];

  const sendInvite = () => {
    if (form.name.trim().length < 3) return setErr("Enter their full name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setErr("Enter a valid email address.");
    setPeople([...people, { name: form.name, email: form.email, role: teamRoles[form.role].label, roleKey: form.role, status: "Invited", mfa: false, lastActive: "—" }]);
    setInvite(false);
    setForm({ name: "", email: "", role: "event_manager", events: "All events" });
    setErr("");
    toast(`Invitation sent to ${form.email}`);
  };
  const toggle = (r: TeamRole, p: Permission) => setDraft({ ...draft, [r]: draft[r].includes(p) ? draft[r].filter((x) => x !== p) : [...draft[r], p] });

  return (
    <>
      <PageHeader title="Team and roles" sub={<>Invite your people and choose what each one can do. You decide the roles; changes apply the next time they open a page. <span className="font-semibold text-ink-2">{people.length} of 15 team members on your Professional plan.</span></>} actions={<Button onClick={() => setInvite(true)}><Plus size={15} /> Invite someone</Button>} />
      <Tabs tabs={["People", "What each role can do"]} value={tab} onChange={setTab} />

      {tab === "People" ? (
        <Card pad={false}>
          <ul className="divide-y divide-line">
            {people.map((p, i) => (
              <li key={p.email} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <Avatar name={p.name} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.name} {p.status === "Invited" && <Badge tone="gold" className="ml-1">Invited</Badge>}</p>
                  <p className="text-xs text-ink-3">{p.email}</p>
                </div>
                {p.mfa ? <Badge tone="green"><ShieldCheck size={11} /> 2-step on</Badge> : <Badge tone="grey">2-step off</Badge>}
                <div className="w-48 shrink-0"><Select
                  aria-label={`Role for ${p.name}`}
                  disabled={i === 0}
                  value={teamRoles[p.roleKey].label}
                  onChange={(e) => {
                    const r = roleByLabel(e.target.value);
                    setPeople(people.map((x, j) => (j === i ? { ...x, roleKey: r, role: teamRoles[r].label } : x)));
                    toast(`${p.name.split(" ")[0]} is now ${teamRoles[r].label.toLowerCase()}`);
                  }}
                  options={roleOrder.map((r) => teamRoles[r].label)}
                /></div>
              </li>
            ))}
          </ul>
          <p className="border-t border-line px-5 py-3 text-xs text-ink-3">You are the organisation admin. There must always be at least one admin, so your own role can&rsquo;t be changed here.</p>
        </Card>
      ) : (
        <>
          <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {roleOrder.map((r) => (
              <Card key={r} className="p-4">
                <p className="font-semibold">{teamRoles[r].label}</p>
                <p className="mt-1 text-xs text-ink-3">{teamRoles[r].summary}</p>
              </Card>
            ))}
          </div>
          <Card pad={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-ink-3">
                    <th className="px-5 py-3 text-left font-medium">Allowed to</th>
                    {roleOrder.map((r) => <th key={r} className="px-2 py-3 text-center font-medium">{teamRoles[r].label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <Fragment key={g}>
                      <tr className="bg-surface-2"><td colSpan={roleOrder.length + 1} className="px-5 py-1.5 text-xs font-semibold text-ink-3">{g}</td></tr>
                      {permissions.filter((p) => p.group === g).map((p) => (
                        <tr key={p.key} className="border-b border-line last:border-0">
                          <td className="px-5 py-2.5">{p.label}</td>
                          {roleOrder.map((r) => {
                            const on = draft[r].includes(p.key);
                            return (
                              <td key={r} className="text-center">
                                {r === "admin" ? (
                                  <Lock size={14} className="mx-auto text-ink-3" aria-label="Admins can always do this" />
                                ) : (
                                  <button onClick={() => toggle(r, p.key)} role="checkbox" aria-checked={on} aria-label={`${teamRoles[r].label}: ${p.label}`}
                                    className={cx("mx-auto flex h-5 w-5 items-center justify-center rounded border text-[11px] font-bold", on ? "border-kafue bg-kafue text-white" : "border-line bg-surface")}>
                                    {on ? "✓" : ""}
                                  </button>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="flex items-center justify-between gap-3 border-t border-line px-5 py-3">
              <p className="text-xs text-ink-3">Gate staff are also limited to the events and gates you assign on each event&rsquo;s Staff tab. Settlements are approved by EMS finance, never by anyone in your team.</p>
              <div className="flex gap-2">
                <Button variant="ghost" disabled={!dirty} onClick={() => setDraft(rolePerms)}>Discard</Button>
                <Button disabled={!dirty} onClick={() => { roleOrder.forEach((r) => setRolePerms(r, draft[r])); toast("Role permissions saved"); }}>Save changes</Button>
              </div>
            </div>
          </Card>
        </>
      )}

      <Modal open={invite} onClose={() => setInvite(false)} title="Invite someone to your team" footer={<><Button variant="ghost" onClick={() => setInvite(false)}>Cancel</Button><Button onClick={sendInvite}>Send invitation</Button></>}>
        <div className="space-y-4">
          <Field label="Full name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Email" error={err}><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@company.example" /></Field>
          <div>
            <p className="mb-1.5 text-sm font-medium">Role</p>
            <div className="space-y-2">
              {roleOrder.map((r) => (
                <button key={r} onClick={() => setForm({ ...form, role: r })} className={cx("w-full rounded-lg border-2 px-3 py-2 text-left", form.role === r ? "border-kafue bg-kafue-soft" : "border-line")}>
                  <span className="block text-sm font-semibold">{teamRoles[r].label}</span>
                  <span className="block text-xs text-ink-3">{teamRoles[r].summary}</span>
                </button>
              ))}
            </div>
          </div>
          <Field label="Which events?" hint="Leave as all events unless they should only work on one."><Select value={form.events} onChange={(e) => setForm({ ...form, events: e.target.value })} options={["All events", "Lusaka Summer Jam only", "New Year's Eve Countdown only"]} /></Field>
          <p className="text-xs text-ink-3">Admins and finance officers must turn on 2-step sign-in before they can open the workspace.</p>
        </div>
      </Modal>
    </>
  );
}
