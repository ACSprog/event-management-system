"use client";

import { Fragment, useState } from "react";
import { Lock, Plus, ShieldCheck } from "lucide-react";
import { Avatar, Badge, Button, Card, cx, Field, Input, Modal, PageHeader, Select, Tabs, useToast } from "@/components/ui";
import { useAdminRole } from "@/components/layout/admin-role";
import { kwacha } from "@/lib/brand";
import { lockedCell, platformPermissions, platformRoleOrder, platformRoles, platformStaffList, type PlatformPermission, type PlatformRole } from "@/lib/platform-roles";

const roleByLabel = (label: string) => platformRoleOrder.find((r) => platformRoles[r].label === label) ?? "support";
const isFinance = (r: PlatformRole) => r === "finance_officer" || r === "finance_manager";

export default function StaffAndRoles() {
  const toast = useToast();
  const { rolePerms, setRolePerms } = useAdminRole();
  const [tab, setTab] = useState("People");
  const [people, setPeople] = useState(platformStaffList);
  const [invite, setInvite] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", role: "support" as PlatformRole, limit: "50000" });
  const [err, setErr] = useState("");
  const [draft, setDraft] = useState(rolePerms);
  const dirty = JSON.stringify(draft) !== JSON.stringify(rolePerms);
  const groups = [...new Set(platformPermissions.map((p) => p.group))];
  const owners = people.filter((p) => p.role === "owner").length;

  const sendInvite = () => {
    if (form.name.trim().length < 3) return setErr("Enter their full name.");
    if (!/^\S+@\S+\.\S+$/.test(form.email)) return setErr("Enter a valid email address.");
    setPeople([...people, { name: form.name, email: form.email, role: form.role, limit: form.role === "finance_officer" ? Number(form.limit) || 0 : null, mfa: false, status: "Invited", lastActive: "—" }]);
    setInvite(false);
    setForm({ name: "", email: "", role: "support", limit: "50000" });
    setErr("");
    toast(`Invitation sent to ${form.email}. They must turn on 2-step sign-in before they can open anything.`);
  };
  const toggle = (r: PlatformRole, p: PlatformPermission) => setDraft({ ...draft, [r]: draft[r].includes(p) ? draft[r].filter((x) => x !== p) : [...draft[r], p] });

  return (
    <>
      <PageHeader
        title="Staff and roles"
        sub="EMS's own people. Invite staff, give each a role and choose what each role can do. Settlement controls are fixed and can't be switched off."
        actions={<Button onClick={() => setInvite(true)}><Plus size={15} /> Invite staff</Button>}
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
                {p.role === "finance_officer" && <span className="text-sm text-ink-2">Approves alone up to {kwacha(p.limit ?? 0)}</span>}
                {p.mfa ? <Badge tone="green"><ShieldCheck size={11} /> 2-step on</Badge> : <Badge tone="red">2-step off</Badge>}
                <div className="w-48 shrink-0"><Select
                  aria-label={`Role for ${p.name}`}
                  disabled={p.role === "owner" && owners === 1}
                  value={platformRoles[p.role].label}
                  onChange={(e) => {
                    const r = roleByLabel(e.target.value);
                    setPeople(people.map((x, j) => (j === i ? { ...x, role: r, limit: r === "finance_officer" ? 50_000 : null } : x)));
                    toast(isFinance(r) ? `${p.name.split(" ")[0]} is now ${platformRoles[r].label.toLowerCase()}. A second person from finance must confirm this change.` : `${p.name.split(" ")[0]} is now ${platformRoles[r].label.toLowerCase()}`);
                  }}
                  options={platformRoleOrder.map((r) => platformRoles[r].label)}
                /></div>
              </li>
            ))}
          </ul>
          <p className="border-t border-line px-5 py-3 text-xs text-ink-3">There must always be at least one platform owner. Giving someone a finance role needs a second person from finance to confirm. Staff can&rsquo;t also be members of an organiser&rsquo;s team.</p>
        </Card>
      ) : (
        <>
          <div className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-6">
            {platformRoleOrder.map((r) => (
              <Card key={r} className="p-4">
                <p className="font-semibold">{platformRoles[r].label}</p>
                <p className="mt-1 text-xs text-ink-3">{platformRoles[r].summary}</p>
              </Card>
            ))}
          </div>
          <Card pad={false}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line text-ink-3">
                    <th className="px-5 py-3 text-left font-medium">Allowed to</th>
                    {platformRoleOrder.map((r) => <th key={r} className="px-2 py-3 text-center font-medium">{platformRoles[r].label}</th>)}
                  </tr>
                </thead>
                <tbody>
                  {groups.map((g) => (
                    <Fragment key={g}>
                      <tr className="bg-surface-2"><td colSpan={platformRoleOrder.length + 1} className="px-5 py-1.5 text-xs font-semibold text-ink-3">{g}</td></tr>
                      {platformPermissions.filter((p) => p.group === g).map((p) => (
                        <tr key={p.key} className="border-b border-line last:border-0">
                          <td className="px-5 py-2.5">{p.label}</td>
                          {platformRoleOrder.map((r) => {
                            const lock = lockedCell(r, p.key);
                            const on = lock ? lock.on : draft[r].includes(p.key);
                            return (
                              <td key={r} className="text-center">
                                {lock ? (
                                  <span title={lock.why} aria-label={`${platformRoles[r].label}: ${p.label}: ${lock.on ? "always" : "never"}. ${lock.why}`} className={cx("mx-auto flex h-5 w-5 items-center justify-center rounded", lock.on ? "bg-kafue/60 text-white" : "text-ink-3")}>
                                    <Lock size={12} />
                                  </span>
                                ) : (
                                  <button onClick={() => toggle(r, p.key)} role="checkbox" aria-checked={on} aria-label={`${platformRoles[r].label}: ${p.label}`}
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
              <p className="flex items-center gap-1.5 text-xs text-ink-3"><Lock size={12} /> Fixed by the settlement rules: only finance roles approve or pay, the finance manager gives second approvals, and the owner can&rsquo;t approve money. Hover a lock to see why.</p>
              <div className="flex gap-2">
                <Button variant="ghost" disabled={!dirty} onClick={() => setDraft(rolePerms)}>Discard</Button>
                <Button disabled={!dirty} onClick={() => { platformRoleOrder.forEach((r) => setRolePerms(r, draft[r])); toast("Role permissions saved. Every change is in the audit log."); }}>Save changes</Button>
              </div>
            </div>
          </Card>
        </>
      )}

      <Modal open={invite} onClose={() => setInvite(false)} title="Invite a staff member" footer={<><Button variant="ghost" onClick={() => setInvite(false)}>Cancel</Button><Button onClick={sendInvite}>Send invitation</Button></>}>
        <div className="space-y-4">
          <Field label="Full name"><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></Field>
          <Field label="Work email" error={err}><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="name@ems.example" /></Field>
          <div>
            <p className="mb-1.5 text-sm font-medium">Role</p>
            <div className="space-y-2">
              {platformRoleOrder.map((r) => (
                <button key={r} onClick={() => setForm({ ...form, role: r })} className={cx("w-full rounded-lg border-2 px-3 py-2 text-left", form.role === r ? "border-kafue bg-kafue-soft" : "border-line")}>
                  <span className="block text-sm font-semibold">{platformRoles[r].label}</span>
                  <span className="block text-xs text-ink-3">{platformRoles[r].summary}</span>
                </button>
              ))}
            </div>
          </div>
          {form.role === "finance_officer" && <Field label="Approves alone up to (K)" hint="Above the K50,000 threshold a finance manager gives the second approval anyway"><Input inputMode="numeric" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value.replace(/\D/g, "") })} /></Field>}
          <p className="text-xs text-ink-3">Every staff member must use 2-step sign-in. {isFinance(form.role) ? "Finance roles also need a second person from finance to confirm the invitation." : ""}</p>
        </div>
      </Modal>
    </>
  );
}
