"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, CircleDollarSign, Home, Lock, ScanLine, Settings, Users } from "lucide-react";
import { PortalShell, type NavGroup } from "@/components/layout/portal-shell";
import { OrgRoleProvider, useOrgRole } from "@/components/layout/org-role";
import { Button, Card, cx } from "@/components/ui";
import { roleOrder, teamRoles, type Permission, type TeamRole } from "@/lib/roles";

interface Section {
  href: string;
  label: string;
  icon: typeof Home;
  need?: Permission[];
  tabs?: { href: string; label: string; need?: Permission[]; also?: string[] }[];
  also?: string[];
}

/** Five areas. Everything else lives as a tab inside one of them. */
const sections: Section[] = [
  { href: "/org/", label: "Home", icon: Home, also: ["/org/assistant/"] },
  {
    href: "/org/events/", label: "Events", icon: CalendarDays, need: ["events.view"],
    tabs: [
      { href: "/org/events/", label: "Events", also: ["/org/checkin/"] },
      { href: "/org/classrooms/", label: "Classes", need: ["classes.manage"] },
      { href: "/org/venues/", label: "Venues" },
      { href: "/org/vendors/", label: "Vendors" },
      { href: "/org/scan/", label: "Gate scanner", need: ["checkin.scan"] },
    ],
  },
  {
    href: "/org/customers/", label: "Audience", icon: Users, need: ["audience.view", "campaigns.send"],
    tabs: [
      { href: "/org/customers/", label: "Customers", need: ["audience.view"] },
      { href: "/org/marketing/", label: "Campaigns", need: ["campaigns.send"] },
      { href: "/org/reviews/", label: "Reviews", need: ["audience.view"] },
      { href: "/org/membership/", label: "Membership", need: ["audience.view"] },
    ],
  },
  {
    href: "/org/finance/", label: "Money", icon: CircleDollarSign, need: ["money.view"],
    tabs: [
      { href: "/org/finance/", label: "Overview" },
      { href: "/org/finance/transactions/", label: "Sales and refunds" },
      { href: "/org/finance/invoices/", label: "Invoices" },
      { href: "/org/finance/expenses/", label: "Budgets and expenses" },
      { href: "/org/finance/settlements/", label: "Settlements" },
      { href: "/org/finance/payouts/", label: "Payouts" },
      { href: "/org/fundraising/", label: "Donations and sponsors" },
      { href: "/org/reports/", label: "Reports" },
    ],
  },
  {
    href: "/org/team/", label: "Settings", icon: Settings, need: ["team.manage"],
    tabs: [
      { href: "/org/team/", label: "Team and roles" },
      { href: "/org/settings/", label: "Organisation" },
      { href: "/org/settings/billing/", label: "Plan and billing" },
      { href: "/org/integrations/", label: "Integrations" },
    ],
  },
];

/** Pages inside a section that need more than the section itself. */
const pageNeeds: [string, Permission[]][] = [
  ["/org/events/new/", ["events.edit"]],
  ["/org/assistant/", ["events.edit"]],
  ["/org/checkin/", ["checkin.scan", "events.view"]],
  ["/org/scan/", ["checkin.scan"]],
  ["/org/marketing/new/", ["campaigns.send"]],
  ["/org/classrooms/new/", ["classes.manage"]],
];

const prefixes = (s: { href: string; also?: string[] }) => [s.href, ...(s.also ?? [])];
const matches = (path: string, p: string) => (p === "/org/" ? path === "/org/" || path === "/org" : path.startsWith(p));

function findSection(path: string) {
  return sections.find((s) => (s.tabs ?? [s]).some((t) => prefixes(t).some((p) => matches(path, p))) || prefixes(s).some((p) => matches(path, p)));
}
function findTab(path: string, s?: Section) {
  return s?.tabs
    ?.flatMap((t) => prefixes(t).map((p) => ({ t, p })))
    .filter(({ p }) => matches(path, p))
    .sort((a, b) => b.p.length - a.p.length)[0]?.t;
}

function RolePreview() {
  const { role, setRole } = useOrgRole();
  return (
    <label className="flex items-center gap-2 text-sm">
      <span className="hidden text-ink-3 sm:inline">Preview as</span>
      <select value={role} onChange={(e) => setRole(e.target.value as TeamRole)} className="rounded-lg border border-line bg-canvas px-2 py-1.5 text-sm font-medium focus:border-kafue focus:outline-none" aria-label="Preview the workspace as a team role">
        {roleOrder.map((r) => <option key={r} value={r}>{teamRoles[r].label}</option>)}
      </select>
    </label>
  );
}

function OrgShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() ?? "/org/";
  const { role, can } = useOrgRole();
  const allowed = (need?: Permission[]) => !need || need.some(can);
  const section = findSection(path);
  const tab = findTab(path, section);
  const nav: NavGroup[] = [{ items: sections.filter((s) => allowed(s.need)).map(({ href, label, icon }) => ({ href, label, icon })) }];
  const page = pageNeeds.find(([p]) => path.startsWith(p));
  const blocked = (section && !allowed(section.need)) || (tab && !allowed(tab.need)) || (page && !allowed(page[1]));
  const visibleTabs = section?.tabs?.filter((t) => allowed(t.need)) ?? [];

  // The scanner is part of the organiser workspace but runs full screen, like an app on the gate phone.
  if (path.startsWith("/org/scan")) {
    if (!can("checkin.scan")) {
      return (
        <div className="flex min-h-[calc(100vh-37px)] items-center justify-center p-4">
          <Card className="max-w-md text-center">
            <Lock className="mx-auto text-ink-3" size={32} />
            <h1 className="mt-3 text-xl font-semibold">Your role can&rsquo;t scan tickets</h1>
            <p className="mt-1 text-sm text-ink-3">Ask your organisation admin to give you the Gate staff role, or the &ldquo;Scan tickets at the gate&rdquo; permission.</p>
            <Button href="/org/" variant="secondary" className="mt-5">Back to the workspace</Button>
          </Card>
        </div>
      );
    }
    return <>{children}</>;
  }

  let body: React.ReactNode = children;
  if (role === "gate") {
    body = (
      <Card className="mx-auto mt-10 max-w-md text-center">
        <ScanLine className="mx-auto text-kafue" size={36} />
        <h1 className="mt-3 text-xl font-semibold">Gate staff use the scanner</h1>
        <p className="mt-1 text-sm text-ink-3">Your role only lets you check tickets at the gates you&rsquo;re assigned to. Everything else in the workspace is hidden.</p>
        <Button href="/org/scan/" className="mt-5">Open the scanner</Button>
      </Card>
    );
  } else if (blocked) {
    body = (
      <Card className="mx-auto mt-10 max-w-md text-center">
        <Lock className="mx-auto text-ink-3" size={32} />
        <h1 className="mt-3 text-xl font-semibold">Your role can&rsquo;t open this page</h1>
        <p className="mt-1 text-sm text-ink-3">{teamRoles[role].label}s can&rsquo;t open {page ? "this page" : (tab?.label ?? section?.label ?? "this page").toLowerCase()}. Ask your organisation admin to change your role if you need it.</p>
        <Button href="/org/" variant="secondary" className="mt-5">Go to Home</Button>
      </Card>
    );
  }

  return (
    <PortalShell
      nav={role === "gate" ? [{ items: [{ href: "/org/scan/", label: "Gate scanner", icon: ScanLine }] }] : nav}
      activeFor={() => section?.href}
      workspace={{ name: "Zed Live Entertainment", sub: "Event organiser" }}
      workspaces={["Zed Live Entertainment", "Grace Chapel International", "SkillUp Academy"]}
      user={{ name: teamRoles[role].person, role: teamRoles[role].label }}
      headerSlot={<RolePreview />}
    >
      {role !== "gate" && !blocked && visibleTabs.length > 1 && (
        <nav className="-mt-2 mb-6 flex gap-1 overflow-x-auto border-b border-line" aria-label={`${section?.label} sections`}>
          {visibleTabs.map((t) => (
            <Link key={t.href} href={t.href} className={cx("-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium", tab === t ? "border-kafue text-ink" : "border-transparent text-ink-3 hover:text-ink")} aria-current={tab === t ? "page" : undefined}>
              {t.label}
            </Link>
          ))}
        </nav>
      )}
      {body}
    </PortalShell>
  );
}

export default function OrgLayout({ children }: { children: React.ReactNode }) {
  return (
    <OrgRoleProvider>
      <OrgShell>{children}</OrgShell>
    </OrgRoleProvider>
  );
}
