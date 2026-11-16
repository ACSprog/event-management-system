"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { roleOrder, teamRoles, type Permission, type TeamRole } from "@/lib/roles";

interface Ctx {
  role: TeamRole;
  setRole: (r: TeamRole) => void;
  can: (p: Permission) => boolean;
  rolePerms: Record<TeamRole, Permission[]>;
  setRolePerms: (r: TeamRole, perms: Permission[]) => void;
}

const RoleCtx = createContext<Ctx | null>(null);

/**
 * Showcase only: lets you preview the workspace as each team role.
 * In production the role comes from the signed-in user's membership,
 * resolved by the API, and cannot be switched in the browser.
 */
export function OrgRoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<TeamRole>("admin");
  const [rolePerms, setAll] = useState<Record<TeamRole, Permission[]>>(
    () => Object.fromEntries(roleOrder.map((r) => [r, teamRoles[r].perms])) as Record<TeamRole, Permission[]>,
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem("ems.previewRole") as TeamRole | null;
      if (saved && roleOrder.includes(saved)) setRoleState(saved);
      const perms = localStorage.getItem("ems.rolePerms");
      if (perms) setAll((cur) => ({ ...cur, ...JSON.parse(perms), admin: teamRoles.admin.perms }));
    } catch {}
  }, []);

  const setRole = useCallback((r: TeamRole) => {
    setRoleState(r);
    try { localStorage.setItem("ems.previewRole", r); } catch {}
  }, []);

  const setRolePerms = useCallback((r: TeamRole, perms: Permission[]) => {
    setAll((cur) => {
      const next = { ...cur, [r]: r === "admin" ? teamRoles.admin.perms : perms };
      try { localStorage.setItem("ems.rolePerms", JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const can = useCallback((p: Permission) => rolePerms[role].includes(p), [rolePerms, role]);

  return <RoleCtx.Provider value={{ role, setRole, can, rolePerms, setRolePerms }}>{children}</RoleCtx.Provider>;
}

export function useOrgRole() {
  const c = useContext(RoleCtx);
  if (!c) throw new Error("useOrgRole must be used inside OrgRoleProvider");
  return c;
}
