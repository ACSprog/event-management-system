"use client";

import { Fragment, useState } from "react";
import { Lock, Pencil, Plus, ShieldCheck, Trash2 } from "lucide-react";
import { Avatar, Badge, Button, Card, cx, Field, Input, Modal, PageHeader, Select, Tabs, useToast } from "@/components/ui";
import { useAdminRole } from "@/components/layout/admin-role";
import { RoleEditor } from "@/components/role-editor";
import { kwacha } from "@/lib/brand";
import { lockedCell, platformPermissions, platformStaffList, type PlatformPermission, type PlatformRole, type PlatformRoleInfo } from "@/lib/platform-roles";

const isFinance = (r: PlatformRole) => r === "finance_officer" || r === "finance_manager";

export default function StaffAndRoles() {
  const toast = useToast();
  const { roles, rolePerms, setRolePerms, addRole, updateRole, removeRole } = useAdminRole();
  const roleByLabel = (l: string) => roles.find((r) => r.label === l)?.key ?? "support";
  const label = (k: PlatformRole) => roles.find((r) => r.key === k)?.label ?? "Removed role";
  const [editor, setEditor] = useState<null | { editing: PlatformRoleInfo | null }>(null);
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
  const toggle = (r: PlatformRole, p: PlatformPermission) => setDraft({ ...draft, [r]: (draft[r] ?? []).includes(p) ? draft[r].filter((x) => x !== p) : [...(draft[r] ?? []), p] });
  const saveRole = (r: { label: string; summary: string; from: string }) => {
    if (editor?.editing) {
      updateRole(editor.editing.key, { label: r.label, summary: r.summary });
      toast("Role updated");
    } else {
      const fromKey = roles.find((x) => x.label === r.from)?.key;
      const perms = fromKey ? rolePerms[fromKey] ?? [] : [];
      const key = addRole({ label: r.label, summary: r.summary, perms });
      setDraft((d) => ({ ...d, [key]: perms.filter((p) => !lockedCell(key, p) ) }));
      setTab("What each role can do");
      toast(`${r.label} created. Tick what it can do, then save.`);
    }
    setEditor(null);
  };

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
                <div className="min-w-0 flex-1 basis-[calc(100%-52px)] sm:basis-auto">
                  <p className="font-semibold">{p.name} {p.status === "Invited" && <Badge tone="gold" className="ml-1">Invited</Badge>}</p>
                  <p className="text-xs text-ink-3">{p.email}{p.lastActive !== "—" ? `, active ${p.lastActive.toLowerCase()}` : ""}</p>
                </div>
                {/* Phones: the limit, 2-step badge and role picker wrap under the name. */}
                {p.role === "finance_officer" && <span className="basis-full text-sm text-ink-2 sm:basis-auto">Approves alone up to {kwacha(p.limit ?? 0)}</span>}
                {p.mfa ? <Badge tone="green"><ShieldCheck size={11} /> 2-step on</Badge> : <Badge tone="red">2-step off</Badge>}
                <div className="w-full shrink-0 sm:w-48"><Select
                  aria-label={`Role for ${p.name}`}
                  disabled={p.role === "owner" && owners === 1}
                  value={label(p.role)}
                  onChange={(e) => {
                    const r = roleByLabel(e.target.value);
                    setPeople(people.map((x, j) => (j === i ? { ...x, role: r, limit: r === "finance_officer" ? 50_000 : null } : x)));
                    toast(isFinance(r) ? `${p.name.split(" ")[0]} is now ${label(r).toLowerCase()}. A second person from finance must confirm this change.` : `${p.name.split(" ")[0]} is now ${label(r).toLowerCase()}`);
                  }}
                  options={roles.map((r) => r.label)}
                /></div>
              </li>
            ))}
          </ul>
          <p className="border-t border-line px-5 py-3 text-xs text-ink-3">There must always be at least one platform owner. Giving someone a finance role needs a second person from finance to confirm. Staff can&rsquo;t also be members of an organiser&rsquo;s team.</p>
        </Card>
      ) : (
        <>
          <div className="mb-4 grid gap-3 md:grid-cols-3 xl:grid-cols-4">
            {roles.map((r) => {
              const used = people.filter((p) => p.role === r.key).length;
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
                      {platformPermissions.filter((p) => p.group === g).map((p) => (
                        <tr key={p.key} className="border-b border-line last:border-0">
                          <td className="px-5 py-2.5">{p.label}</td>
                          {roles.map(({ key: r, label: rl }) => {
                            const lock = lockedCell(r, p.key);
                            const on = lock ? lock.on : (draft[r] ?? []).includes(p.key);
                            return (
                              <td key={r} className="text-center">
                                {lock ? (
                                  <span title={lock.why} aria-label={`${rl}: ${p.label}: ${lock.on ? "always" : "never"}. ${lock.why}`} className={cx("mx-auto flex h-5 w-5 items-center justify-center rounded", lock.on ? "bg-kafue/60 text-white" : "text-ink-3")}>
                                    <Lock size={12} />
                                  </span>
                                ) : (
                                  <button onClick={() => toggle(r, p.key)} role="checkbox" aria-checked={on} aria-label={`${rl}: ${p.label}`}
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
                <Button disabled={!dirty} onClick={() => { roles.forEach((r) => setRolePerms(r.key, draft[r.key] ?? [])); toast("Role permissions saved. Every change is in the audit log."); }}>Save changes</Button>
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
              {roles.map((r) => (
                <button key={r.key} onClick={() => setForm({ ...form, role: r.key })} className={cx("w-full rounded-lg border-2 px-3 py-2 text-left", form.role === r.key ? "border-kafue bg-kafue-soft" : "border-line")}>
                  <span className="block text-sm font-semibold">{r.label}{r.custom ? " (custom)" : ""}</span>
                  <span className="block text-xs text-ink-3">{r.summary}</span>
                </button>
              ))}
            </div>
          </div>
          {form.role === "finance_officer" && <Field label="Approves alone up to (K)" hint="Above the K50,000 threshold a finance manager gives the second approval anyway"><Input inputMode="numeric" value={form.limit} onChange={(e) => setForm({ ...form, limit: e.target.value.replace(/\D/g, "") })} /></Field>}
          <p className="text-xs text-ink-3">Every staff member must use 2-step sign-in. {isFinance(form.role) ? "Finance roles also need a second person from finance to confirm the invitation." : ""}</p>
        </div>
      </Modal>
      <RoleEditor open={!!editor} onClose={() => setEditor(null)} onSave={saveRole} roles={roles} editing={editor?.editing} note="Custom roles can't approve settlements, start payouts or manage staff. Those stay with the finance roles and the platform owner." />
    </>
  );
}
