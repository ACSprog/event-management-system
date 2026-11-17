"use client";

import { Fragment, useState } from "react";
import { Lock, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Avatar, Badge, Button, Card, cx, Field, Input, Modal, PageHeader, Select, Tabs, useToast } from "@/components/ui";
import { RoleEditor } from "@/components/role-editor";
import { useOrgRole } from "@/components/layout/org-role";
import { api } from "@/lib/api";
import { permissions, type Permission, type RoleInfo, type TeamRole } from "@/lib/roles";

export default function Team() {
  const toast = useToast();
  const { roles, rolePerms, setRolePerms, addRole, updateRole, removeRole } = useOrgRole();
  const byLabel = (label: string) => roles.find((r) => r.label === label)?.key ?? "event_manager";
  const [tab, setTab] = useState("People");
  const [people, setPeople] = useState(api.orgs.team().map((p) => ({ ...p, roleKey: byLabel(p.role) })));
  const [invite, setInvite] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "event_manager" as TeamRole, events: "All events" });
  const [err, setErr] = useState("");
  const [draft, setDraft] = useState(rolePerms);
  const [editor, setEditor] = useState<null | { editing: RoleInfo | null }>(null);
  const dirty = JSON.stringify(draft) !== JSON.stringify(rolePerms);
  const groups = [...new Set(permissions.map((p) => p.group))];
  const label = (k: TeamRole) => roles.find((r) => r.key === k)?.label ?? "Removed role";

  const sendInvite = () => {
    if (form.name.trim().length < 3) return setErr("Enter their full name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setErr("Enter a valid email address.");
    setPeople([...people, { name: form.name, email: form.email, role: label(form.role), roleKey: form.role, status: "Invited", mfa: false, lastActive: "—" }]);
    setInvite(false);
    setForm({ name: "", email: "", role: "event_manager", events: "All events" });
    setErr("");
    toast(`Invitation sent to ${form.email}`);
  };
  const toggle = (r: TeamRole, p: Permission) => setDraft({ ...draft, [r]: (draft[r] ?? []).includes(p) ? draft[r].filter((x) => x !== p) : [...(draft[r] ?? []), p] });
  const saveRole = (r: { label: string; summary: string; from: string }) => {
    if (editor?.editing) {
      updateRole(editor.editing.key, { label: r.label, summary: r.summary });
      setPeople(people.map((p) => (p.roleKey === editor.editing!.key ? { ...p, role: r.label } : p)));
      toast("Role updated");
    } else {
      const fromKey = roles.find((x) => x.label === r.from)?.key;
      const perms = fromKey ? (rolePerms[fromKey] ?? []).filter((p) => p !== "team.manage") : [];
      const key = addRole({ label: r.label, summary: r.summary, perms });
      setDraft((d) => ({ ...d, [key]: perms }));
      setTab("What each role can do");
      toast(`${r.label} created. Tick what it can do, then save.`);
    }
    setEditor(null);
  };

  return (
    <>
      <PageHeader
        title="Team and roles"
        sub="Invite your people, give each a role and choose what each role can do. Create your own roles if the standard ones don't fit."
        actions={<Button onClick={() => setInvite(true)}><Plus size={15} /> Invite someone</Button>}
      />
      <Tabs tabs={["People", "What each role can do"]} value={tab} onChange={setTab} />

      {tab === "People" ? (
        <Card pad={false}>
          <ul className="divide-y divide-line">
            {people.map((p, i) => (
              <li key={p.email} className="flex flex-wrap items-center gap-3 px-5 py-3">
                <Avatar name={p.name} />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">{p.name} {p.status === "Invited" && <Badge tone="gold" className="ml-1">Invited</Badge>}</p>
                  <p className="text-xs text-ink-3">{p.email}{p.lastActive !== "—" ? `, active ${p.lastActive.toLowerCase()}` : ""}</p>
                </div>
                {p.mfa ? <Badge tone="green"><ShieldCheck size={11} /> 2-step on</Badge> : <Badge tone="grey">2-step off</Badge>}
                <div className="w-48 shrink-0"><Select
                  aria-label={`Role for ${p.name}`}
                  disabled={i === 0}
                  value={label(p.roleKey)}
                  onChange={(e) => {
                    const r = byLabel(e.target.value);
                    setPeople(people.map((x, j) => (j === i ? { ...x, roleKey: r, role: label(r) } : x)));
                    toast(`${p.name.split(" ")[0]} is now ${label(r).toLowerCase()}`);
                  }}
                  options={roles.map((r) => r.label)}
                /></div>
              </li>
            ))}
          </ul>
          <p className="border-t border-line px-5 py-3 text-xs text-ink-3">{people.length} of 15 team members on your Professional plan. You are the organisation admin; there must always be at least one admin, so your own role can&rsquo;t be changed here.</p>
        </Card>
      ) : (
        <>
          <div className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {roles.map((r) => {
              const used = people.filter((p) => p.roleKey === r.key).length;
              return (
                <Card key={r.key} className="flex flex-col p-4">
                  <p className="font-semibold">{r.label} {r.custom && <Badge tone="teal" className="ml-1">Custom</Badge>}</p>
                  <p className="mt-1 flex-1 text-xs text-ink-3">{r.summary}</p>
                  {r.custom && (
                    <div className="mt-3 flex flex-wrap gap-1">
                      <Button size="sm" variant="ghost" onClick={() => setEditor({ editing: r })}><Pencil size={13} /> Edit</Button>
                      <Button size="sm" variant="ghost" disabled={used > 0} title={used ? "Move people to another role first" : undefined} onClick={() => { removeRole(r.key); setDraft((d) => { const n = { ...d }; delete n[r.key]; return n; }); toast(`${r.label} deleted`); }}><Trash2 size={13} /> Delete</Button>
                    </div>
                  )}
                </Card>
              );
            })}
            <button onClick={() => setEditor({ editing: null })} className="flex min-h-28 flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-line p-4 text-sm font-semibold text-kafue hover:border-kafue">
              <Plus size={18} /> Create a role
            </button>
          </div>
          <Card pad={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-ink-3">
                    <th className="px-5 py-3 text-left font-medium">Allowed to</th>
                    {roles.map((r) => <th key={r.key} className="px-2 py-3 text-center font-medium">{r.label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <Fragment key={g}>
                      <tr className="bg-surface-2"><td colSpan={roles.length + 1} className="px-5 py-1.5 text-xs font-semibold text-ink-3">{g}</td></tr>
                      {permissions.filter((p) => p.group === g).map((p) => (
                        <tr key={p.key} className="border-b border-line last:border-0">
                          <td className="px-5 py-2.5">{p.label}</td>
                          {roles.map((r) => {
                            const on = (draft[r.key] ?? []).includes(p.key);
                            return (
                              <td key={r.key} className="text-center">
                                {r.key === "admin" ? (
                                  <Lock size={14} className="mx-auto text-ink-3" aria-label="Admins can always do this" />
                                ) : r.custom && p.key === "team.manage" ? (
                                  <span title="Only organisation admins manage the team"><Lock size={14} className="mx-auto text-ink-3" aria-label="Custom roles can't manage the team" /></span>
                                ) : (
                                  <button onClick={() => toggle(r.key, p.key)} role="checkbox" aria-checked={on} aria-label={`${r.label}: ${p.label}`}
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
            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-5 py-3">
              <p className="text-xs text-ink-3">Gate staff are also limited to the events and gates you assign on each event&rsquo;s Staff tab. Settlements are approved by EMS finance, never by anyone in your team.</p>
              <div className="flex gap-2">
                <Button variant="ghost" disabled={!dirty} onClick={() => setDraft(rolePerms)}>Discard</Button>
                <Button disabled={!dirty} onClick={() => { roles.forEach((r) => setRolePerms(r.key, draft[r.key] ?? [])); toast("Role permissions saved"); }}>Save changes</Button>
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
              {roles.map((r) => (
                <button key={r.key} onClick={() => setForm({ ...form, role: r.key })} className={cx("w-full rounded-lg border-2 px-3 py-2 text-left", form.role === r.key ? "border-kafue bg-kafue-soft" : "border-line")}>
                  <span className="block text-sm font-semibold">{r.label}{r.custom ? " (custom)" : ""}</span>
                  <span className="block text-xs text-ink-3">{r.summary}</span>
                </button>
              ))}
            </div>
            <button className="mt-2 text-sm font-semibold text-kafue" onClick={() => { setInvite(false); setEditor({ editing: null }); }}>None of these fit? Create a role</button>
          </div>
          <Field label="Which events?" hint="Leave as all events unless they should only work on one."><Select value={form.events} onChange={(e) => setForm({ ...form, events: e.target.value })} options={["All events", "Lusaka Summer Jam only", "New Year's Eve Countdown only"]} /></Field>
          <p className="text-xs text-ink-3">Admins and anyone who can see money must turn on 2-step sign-in before they can open the workspace.</p>
        </div>
      </Modal>

      <RoleEditor open={!!editor} onClose={() => setEditor(null)} onSave={saveRole} roles={roles} editing={editor?.editing} note="Custom roles can't manage the team; only organisation admins can." />
    </>
  );
}
