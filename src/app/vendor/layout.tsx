"use client";

import { CalendarRange, FileSignature, FileSearch, LayoutDashboard, Package } from "lucide-react";
import { PortalShell, type NavGroup } from "@/components/layout/portal-shell";

const nav: NavGroup[] = [
  { items: [
    { href: "/vendor/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/vendor/rfqs/", label: "Quote requests", icon: FileSearch, badge: "2" },
    { href: "/vendor/bookings/", label: "Venue calendar", icon: CalendarRange },
    { href: "/vendor/services/", label: "Services and prices", icon: Package },
    { href: "/vendor/contracts/", label: "Contracts and invoices", icon: FileSignature },
  ] },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  return <PortalShell nav={nav} workspace={{ name: "Levy Park Amphitheatre", sub: "Venue and sound hire" }} workspaces={["Levy Park Amphitheatre", "Sound Kings Zambia"]} user={{ name: "Mutale Sound", role: "Venue manager" }}>{children}</PortalShell>;
}
