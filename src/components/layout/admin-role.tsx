"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { lockedCell, platformPermissions, platformRoleOrder, platformRoles, type PlatformPermission, type PlatformRole } from "@/lib/platform-roles";

interface Ctx {
  role: PlatformRole;
  setRole: (r: PlatformRole) => void;
  can: (p: PlatformPermission) => boolean;
  rolePerms: Record<PlatformRole, PlatformPermission[]>;
  setRolePerms: (r: PlatformRole, perms: PlatformPermission[]) => void;
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
 * Showcase only: preview the super admin area as each staff role.
 * In production the role comes from the signed-in staff member and the API
 * checks every permission.
 */
export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<PlatformRole>("owner");
  const [rolePerms, setAll] = useState(defaults);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ems.adminRole") as PlatformRole | null;
      if (saved && platformRoleOrder.includes(saved)) setRoleState(saved);
      const perms = localStorage.getItem("ems.adminRolePerms.v1");
      if (perms) {
        const parsed = JSON.parse(perms) as Record<PlatformRole, PlatformPermission[]>;
        setAll(Object.fromEntries(platformRoleOrder.map((r) => [r, enforce(r, parsed[r] ?? platformRoles[r].perms)])) as Record<PlatformRole, PlatformPermission[]>);
      }
    } catch {}
  }, []);

  const setRole = useCallback((r: PlatformRole) => {
    setRoleState(r);
    try { localStorage.setItem("ems.adminRole", r); } catch {}
  }, []);

  const setRolePerms = useCallback((r: PlatformRole, perms: PlatformPermission[]) => {
    setAll((cur) => {
      const next = { ...cur, [r]: enforce(r, perms) };
      try { localStorage.setItem("ems.adminRolePerms.v1", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const can = useCallback((p: PlatformPermission) => rolePerms[role].includes(p), [rolePerms, role]);

  return <AdminRoleCtx.Provider value={{ role, setRole, can, rolePerms, setRolePerms }}>{children}</AdminRoleCtx.Provider>;
}

export function useAdminRole() {
  const c = useContext(AdminRoleCtx);
  if (!c) throw new Error("useAdminRole must be used inside AdminRoleProvider");
  return c;
}
