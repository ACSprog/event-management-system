"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { builtInPlatformRoleInfo, lockedCell, platformPermissions, platformRoleOrder, platformRoles, type PlatformPermission, type PlatformRole, type PlatformRoleInfo } from "@/lib/platform-roles";

interface Ctx {
  role: PlatformRole;
  setRole: (r: PlatformRole) => void;
  can: (p: PlatformPermission) => boolean;
  roles: PlatformRoleInfo[];
  roleInfo: (r: PlatformRole) => PlatformRoleInfo;
  rolePerms: Record<PlatformRole, PlatformPermission[]>;
  setRolePerms: (r: PlatformRole, perms: PlatformPermission[]) => void;
  addRole: (r: { label: string; summary: string; perms: PlatformPermission[] }) => PlatformRole;
  updateRole: (key: PlatformRole, r: { label: string; summary: string }) => void;
  removeRole: (key: PlatformRole) => void;
}

const AdminRoleCtx = createContext<Ctx | null>(null);

/** Applies the locked cells, so a saved setting can never switch off a settlement control. */
function enforce(r: PlatformRole, perms: PlatformPermission[]) {
  return platformPermissions
    .map((p) => p.key)
    .filter((k) => {
      const lock = lockedCell(r, k);
      return lock ? lock.on : perms.includes(k);
    });
}

const defaults = () => Object.fromEntries(platformRoleOrder.map((r) => [r, platformRoles[r].perms])) as Record<PlatformRole, PlatformPermission[]>;

/**
 * Showcase only: preview the super admin area as each staff role, and keep
 * custom roles in the browser. In production the role comes from the
 * signed-in staff member and the API checks every permission.
 */
export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<PlatformRole>("owner");
  const [custom, setCustom] = useState<PlatformRoleInfo[]>([]);
  const [rolePerms, setAll] = useState(defaults);

  useEffect(() => {
    try {
      const c = JSON.parse(localStorage.getItem("ems.adminCustomRoles.v1") ?? "[]") as PlatformRoleInfo[];
      setCustom(c);
      const keys = [...platformRoleOrder, ...c.map((x) => x.key)] as PlatformRole[];
      const saved = localStorage.getItem("ems.adminRole");
      if (saved && keys.includes(saved)) setRoleState(saved);
      const perms = localStorage.getItem("ems.adminRolePerms.v1");
      if (perms) {
        const parsed = JSON.parse(perms) as Record<PlatformRole, PlatformPermission[]>;
        setAll(Object.fromEntries(keys.map((r) => [r, enforce(r, parsed[r] ?? (platformRoles as Record<string, { perms: PlatformPermission[] }>)[r]?.perms ?? [])])));
      }
    } catch {}
  }, []);

  const roles = useMemo(() => [...builtInPlatformRoleInfo, ...custom], [custom]);
  const roleInfo = useCallback((r: PlatformRole) => roles.find((x) => x.key === r) ?? builtInPlatformRoleInfo[0], [roles]);
  const save = (next: Record<PlatformRole, PlatformPermission[]>, c: PlatformRoleInfo[]) => {
    try {
      localStorage.setItem("ems.adminRolePerms.v1", JSON.stringify(next));
      localStorage.setItem("ems.adminCustomRoles.v1", JSON.stringify(c));
    } catch {}
  };

  const setRole = useCallback((r: PlatformRole) => {
    setRoleState(r);
    try { localStorage.setItem("ems.adminRole", r); } catch {}
  }, []);

  const setRolePerms = useCallback((r: PlatformRole, perms: PlatformPermission[]) => {
    setAll((cur) => { const next = { ...cur, [r]: enforce(r, perms) }; save(next, custom); return next; });
  }, [custom]);

  const addRole = useCallback((r: { label: string; summary: string; perms: PlatformPermission[] }) => {
    const key = `custom_${Date.now().toString(36)}`;
    const c = [...custom, { key, label: r.label, summary: r.summary, person: "Mapalo Zimba", custom: true }];
    setCustom(c);
    setAll((cur) => { const next = { ...cur, [key]: enforce(key, r.perms) }; save(next, c); return next; });
    return key;
  }, [custom]);

  const updateRole = useCallback((key: PlatformRole, r: { label: string; summary: string }) => {
    const c = custom.map((x) => (x.key === key ? { ...x, ...r } : x));
    setCustom(c);
    save(rolePerms, c);
  }, [custom, rolePerms]);

  const removeRole = useCallback((key: PlatformRole) => {
    const c = custom.filter((x) => x.key !== key);
    setCustom(c);
    setAll((cur) => { const next = { ...cur }; delete next[key]; save(next, c); return next; });
    if (role === key) setRole("owner");
  }, [custom, role, setRole]);

  const can = useCallback((p: PlatformPermission) => (rolePerms[role] ?? []).includes(p), [rolePerms, role]);

  return <AdminRoleCtx.Provider value={{ role, setRole, can, roles, roleInfo, rolePerms, setRolePerms, addRole, updateRole, removeRole }}>{children}</AdminRoleCtx.Provider>;
}

export function useAdminRole() {
  const c = useContext(AdminRoleCtx);
  if (!c) throw new Error("useAdminRole must be used inside AdminRoleProvider");
  return c;
}
