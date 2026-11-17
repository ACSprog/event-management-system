"use client";

import { usePathname } from "next/navigation";
import { Activity, Building2, CreditCard, FileClock, Gauge, Handshake, Landmark, LifeBuoy, Lock, Mail, ShieldAlert, Layers, SlidersHorizontal, UserCog, Wallet } from "lucide-react";
import { PortalShell, type NavGroup } from "@/components/layout/portal-shell";
import { AdminRoleProvider, useAdminRole } from "@/components/layout/admin-role";
import { Button, Card } from "@/components/ui";
import { type PlatformPermission } from "@/lib/platform-roles";

type Item = NavGroup["items"][number] & { need: PlatformPermission };

const groups: { label?: string; items: Item[] }[] = [
  { items: [{ href: "/admin/", label: "Platform overview", icon: Gauge, need: "platform.view" }] },
  { label: "Customers", items: [
    { href: "/admin/organisations/", label: "Organisations", icon: Building2, badge: "1", need: "orgs.view" },
    { href: "/admin/plans/", label: "Plans and packages", icon: Layers, need: "plans.manage" },
    { href: "/admin/support/", label: "Support", icon: LifeBuoy, badge: "3", need: "support.handle" },
  ] },
  { label: "Money", items: [
    { href: "/admin/settlements/", label: "Settlements", icon: Wallet, badge: "5", need: "settlements.view" },
    { href: "/admin/partnerships/", label: "Partnerships", icon: Handshake, need: "partnerships.manage" },
    { href: "/admin/finance-settings/", label: "Finance settings", icon: Landmark, need: "finance.settings" },
  ] },
  { label: "Platform", items: [
    { href: "/admin/payments/", label: "Payments and fees", icon: CreditCard, need: "payments.manage" },
    { href: "/admin/moderation/", label: "Review moderation", icon: ShieldAlert, badge: "2", need: "moderation.manage" },
    { href: "/admin/templates/", label: "Notification templates", icon: Mail, need: "templates.manage" },
    { href: "/admin/settings/", label: "Platform settings", icon: SlidersHorizontal, need: "settings.manage" },
  ] },
  { label: "Operations", items: [
    { href: "/admin/health/", label: "System health", icon: Activity, need: "health.view" },
    { href: "/admin/audit/", label: "Audit and security", icon: FileClock, need: "audit.view" },
  ] },
  { label: "Settings", items: [
    { href: "/admin/team/", label: "Staff and roles", icon: UserCog, need: "staff.manage" },
  ] },
];

const allItems = groups.flatMap((g) => g.items);
const itemFor = (path: string) =>
  allItems.filter((i) => (i.href === "/admin/" ? path === "/admin/" || path === "/admin" : path.startsWith(i.href))).sort((a, b) => b.href.length - a.href.length)[0];

function RolePreview() {
  const { role, setRole, roles } = useAdminRole();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-ink-3 sm:inline">Preview as</span>
      <select value={role} onChange={(e) => setRole(e.target.value)} className="rounded-lg border border-line bg-canvas px-2 py-1.5 text-sm font-medium focus:border-kafue focus:outline-none" aria-label="Preview the super admin area as a staff role">
        {roles.map((r) => <option key={r.key} value={r.key}>{r.label}</option>)}
      </select>
    </label>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/admin/";
  const { role, can, roleInfo } = useAdminRole();
  const nav: NavGroup[] = groups
    .map((g) => ({ label: g.label, items: g.items.filter((i) => can(i.need)).map(({ href, label, icon, badge }) => ({ href, label, icon, badge })) }))
    .filter((g) => g.items.length);
  const item = itemFor(path);
  const blocked = item && !can(item.need);
  const home = allItems.find((i) => can(i.need));

  return (
    <PortalShell nav={nav} workspace={{ name: "Eventra platform", sub: "Super administrator" }} user={{ name: roleInfo(role).person, role: roleInfo(role).label }} headerSlot={<RolePreview />}>
      {blocked ? (
        <Card className="mx-auto mt-10 max-w-md text-center">
          <Lock className="mx-auto text-ink-3" size={32} />
          <h1 className="mt-3 text-xl font-semibold">Your role can&rsquo;t open this page</h1>
          <p className="mt-1 text-sm text-ink-3">{roleInfo(role).label}s can&rsquo;t open {item.label.toLowerCase()}. Ask the platform owner to change your role if you need it.</p>
          {home && <Button href={home.href} variant="secondary" className="mt-5">Go to {home.label.toLowerCase()}</Button>}
        </Card>
      ) : children}
    </PortalShell>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminRoleProvider>
      <AdminShell>{children}</AdminShell>
    </AdminRoleProvider>
  );
}
