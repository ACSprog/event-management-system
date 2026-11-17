"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { builtInRoleInfo, permissions, roleOrder, teamRoles, type Permission, type RoleInfo, type TeamRole } from "@/lib/roles";

interface Ctx {
  role: TeamRole;
  setRole: (r: TeamRole) => void;
  can: (p: Permission) => boolean;
  /** Built-in roles followed by the organisation's own roles. */
  roles: RoleInfo[];
  roleInfo: (r: TeamRole) => RoleInfo;
  rolePerms: Record<TeamRole, Permission[]>;
  setRolePerms: (r: TeamRole, perms: Permission[]) => void;
  addRole: (r: { label: string; summary: string; perms: Permission[] }) => TeamRole;
  updateRole: (key: TeamRole, r: { label: string; summary: string }) => void;
  removeRole: (key: TeamRole) => void;
}

const RoleCtx = createContext<Ctx | null>(null);
const defaults = () => Object.fromEntries(roleOrder.map((r) => [r, teamRoles[r].perms])) as Record<TeamRole, Permission[]>;
const valid = new Set(permissions.map((p) => p.key));

/**
 * Showcase only: lets you preview the workspace as each team role, and keeps
 * custom roles in the browser. In production roles and permissions live in the
 * API, and the signed-in user's role cannot be switched in the browser.
 */
export function OrgRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<TeamRole>("admin");
  const [custom, setCustom] = useState<RoleInfo[]>([]);
  const [rolePerms, setAll] = useState<Record<TeamRole, Permission[]>>(defaults);

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem("ems.customRoles.v1") ?? "[]") as RoleInfo[];
      setCustom(c);
      const saved = localStorage.getItem("ems.previewRole");
      if (saved && (roleOrder.includes(saved as never) || c.some((x) => x.key === saved))) setRoleState(saved);
      const perms = localStorage.getItem("ems.rolePerms.v2");
      if (perms) setAll((cur) => ({ ...cur, ...JSON.parse(perms), admin: teamRoles.admin.perms }));
    } catch {}
  }, []);

  const roles = useMemo(() => [...builtInRoleInfo, ...custom], [custom]);
  const roleInfo = useCallback((r: TeamRole) => roles.find((x) => x.key === r) ?? builtInRoleInfo[1], [roles]);

  const save = (next: Record<TeamRole, Permission[]>, c: RoleInfo[]) => {
    try {
      localStorage.setItem("ems.rolePerms.v2", JSON.stringify(next));
      localStorage.setItem("ems.customRoles.v1", JSON.stringify(c));
    } catch {}
  };

  const setRole = useCallback((r: TeamRole) => {
    setRoleState(r);
    try { localStorage.setItem("ems.previewRole", r); } catch {}
  }, []);

  const setRolePerms = useCallback((r: TeamRole, perms: Permission[]) => {
    setAll((cur) => {
      const next = { ...cur, [r]: r === "admin" ? teamRoles.admin.perms : perms.filter((p) => valid.has(p) && !(r.startsWith("custom_") && p === "team.manage")) };
      save(next, custom);
      return next;
    });
  }, [custom]);

  const addRole = useCallback((r: { label: string; summary: string; perms: Permission[] }) => {
    const key = `custom_${Date.now().toString(36)}`;
    const c = [...custom, { key, label: r.label, summary: r.summary, person: "Taonga Mwale", custom: true }];
    setCustom(c);
    setAll((cur) => { const next = { ...cur, [key]: r.perms.filter((p) => p !== "team.manage") }; save(next, c); return next; });
    return key;
  }, [custom]);

  const updateRole = useCallback((key: TeamRole, r: { label: string; summary: string }) => {
    const c = custom.map((x) => (x.key === key ? { ...x, ...r } : x));
    setCustom(c);
    save(rolePerms, c);
  }, [custom, rolePerms]);

  const removeRole = useCallback((key: TeamRole) => {
    const c = custom.filter((x) => x.key !== key);
    setCustom(c);
    setAll((cur) => { const next = { ...cur }; delete next[key]; save(next, c); return next; });
    if (role === key) setRole("admin");
  }, [custom, role, setRole]);

  const can = useCallback((p: Permission) => (rolePerms[role] ?? []).includes(p), [rolePerms, role]);

  return <RoleCtx.Provider value={{ role, setRole, can, roles, roleInfo, rolePerms, setRolePerms, addRole, updateRole, removeRole }}>{children}</RoleCtx.Provider>;
}

export function useOrgRole() {
  const c = useContext(RoleCtx);
  if (!c) throw new Error("useOrgRole must be used inside OrgRoleProvider");
  return c;
}
