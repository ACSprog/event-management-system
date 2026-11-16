"use client";

import {
  BarChart3, Bot, Building2, CalendarDays, CircleDollarSign, GraduationCap, HandHeart, LayoutDashboard, Megaphone, PlugZap,
  PlusCircle, ScanLine, Settings, Star, Trophy, Truck, Users, UsersRound, Receipt, Wallet, PiggyBank,
} from "lucide-react";
import { PortalShell, type NavGroup } from "@/components/layout/portal-shell";

const nav: NavGroup[] = [
  { items: [{ href: "/org/", label: "Dashboard", icon: LayoutDashboard }, { href: "/org/assistant/", label: "AI event planner", icon: Bot }] },
  { label: "Events", items: [
    { href: "/org/events/", label: "All events", icon: CalendarDays },
    { href: "/org/events/new/", label: "Create event", icon: PlusCircle },
    { href: "/org/checkin/", label: "Live check-in", icon: ScanLine, badge: "Live" },
    { href: "/org/venues/", label: "Venues and seating", icon: Building2 },
    { href: "/org/vendors/", label: "Vendors and quotes", icon: Truck },
  ] },
  { label: "Audience", items: [
    { href: "/org/customers/", label: "Customers", icon: Users },
    { href: "/org/reviews/", label: "Reviews and feedback", icon: Star, badge: "2" },
    { href: "/org/marketing/", label: "Marketing", icon: Megaphone },
    { href: "/org/membership/", label: "Membership and loyalty", icon: Trophy },
  ] },
  { label: "Money", items: [
    { href: "/org/finance/", label: "Finance overview", icon: CircleDollarSign },
    { href: "/org/finance/transactions/", label: "Transactions and refunds", icon: Receipt },
    { href: "/org/finance/expenses/", label: "Budgets and expenses", icon: Wallet },
    { href: "/org/finance/payouts/", label: "Payouts", icon: PiggyBank },
    { href: "/org/fundraising/", label: "Fundraising and sponsors", icon: HandHeart },
  ] },
  { label: "More", items: [
    { href: "/org/classrooms/", label: "Classrooms", icon: GraduationCap },
    { href: "/org/reports/", label: "Reports", icon: BarChart3 },
    { href: "/org/team/", label: "Team and roles", icon: UsersRound },
    { href: "/org/integrations/", label: "Integrations", icon: PlugZap },
    { href: "/org/settings/", label: "Settings", icon: Settings },
  ] },
];

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <PortalShell
      nav={nav}
      workspace={{ name: "Zed Live Entertainment", sub: "Enterprise plan, Lusaka" }}
      workspaces={["Zed Live Entertainment", "Grace Chapel International", "SkillUp Academy"]}
      user={{ name: "Mwila Banda", role: "Organisation admin" }}
    >
      {children}
    </PortalShell>
  );
}
