"use client";

import { Activity, Building2, CreditCard, FileClock, Gauge, LifeBuoy, Mail, ShieldAlert, Layers, SlidersHorizontal } from "lucide-react";
import { PortalShell, type NavGroup } from "@/components/layout/portal-shell";

const nav: NavGroup[] = [
  { items: [{ href: "/admin/", label: "Platform overview", icon: Gauge }] },
  { label: "Customers", items: [
    { href: "/admin/organisations/", label: "Organisations", icon: Building2, badge: "1" },
    { href: "/admin/plans/", label: "Plans and subscriptions", icon: Layers },
    { href: "/admin/support/", label: "Support", icon: LifeBuoy, badge: "3" },
  ] },
  { label: "Platform", items: [
    { href: "/admin/payments/", label: "Payments and fees", icon: CreditCard },
    { href: "/admin/moderation/", label: "Review moderation", icon: ShieldAlert, badge: "2" },
    { href: "/admin/templates/", label: "Notification templates", icon: Mail },
    { href: "/admin/settings/", label: "Platform settings", icon: SlidersHorizontal },
  ] },
  { label: "Operations", items: [
    { href: "/admin/health/", label: "System health", icon: Activity },
    { href: "/admin/audit/", label: "Audit and security", icon: FileClock },
  ] },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell nav={nav} workspace={{ name: "Eventra platform", sub: "Super administrator" }} user={{ name: "Thandiwe Lungu", role: "Platform admin" }}>{children}</PortalShell>;
}
