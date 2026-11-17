"use client";

import { useEffect, useState } from "react";
import { Button, Field, Input, Modal, Select, Textarea } from "@/components/ui";

/**
 * Create or rename a custom role. Shared by the organiser's Team and roles page
 * and the super admin's Staff and roles page.
 */
export function RoleEditor({
  open, onClose, onSave, roles, editing, note,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (r: { label: string; summary: string; from: string }) => void;
  roles: { key: string; label: string }[];
  editing?: { label: string; summary: string } | null;
  note?: string;
}) {
  const [f, setF] = useState({ label: "", summary: "", from: "Start with nothing ticked" });
  const [err, setErr] = useState("");
  useEffect(() => {
    if (open) { setF({ label: editing?.label ?? "", summary: editing?.summary ?? "", from: "Start with nothing ticked" }); setErr(""); }
  }, [open, editing]);
  const save = () => {
    const label = f.label.trim();
    if (label.length < 3) return setErr("Give the role a name of at least 3 characters.");
    if (roles.some((r) => r.label.toLowerCase() === label.toLowerCase() && r.label !== editing?.label)) return setErr("There's already a role with that name.");
    onSave({ label, summary: f.summary.trim() || "Custom role", from: f.from });
  };
  return (
    <Modal open={open} onClose={onClose} title={editing ? `Edit ${editing.label}` : "Create a role"} footer={<><Button variant="ghost" onClick={onClose}>Cancel</Button><Button onClick={save}>{editing ? "Save" : "Create role"}</Button></>}>
      <div className="space-y-4">
        <Field label="Role name" error={err}><Input value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} placeholder="e.g. Ushers supervisor, Sponsorship lead" /></Field>
        <Field label="What this role is for" hint="Shown when you invite someone"><Textarea rows={2} value={f.summary} onChange={(e) => setF({ ...f, summary: e.target.value })} /></Field>
        {!editing && (
          <Field label="Start from" hint="Copies what that role can do. You can change every tick afterwards.">
            <Select value={f.from} onChange={(e) => setF({ ...f, from: e.target.value })} options={["Start with nothing ticked", ...roles.map((r) => r.label)]} />
          </Field>
        )}
        {note && <p className="text-xs text-ink-3">{note}</p>}
      </div>
    </Modal>
  );
}
