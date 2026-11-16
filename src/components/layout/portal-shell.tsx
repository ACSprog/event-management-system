"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, ChevronDown, Menu, Search, X, type LucideIcon } from "lucide-react";
import { Avatar, cx } from "@/components/ui";
import { Logo } from "./logo";

export interface NavGroup {
  label?: string;
  items: { href: string; label: string; icon: LucideIcon; badge?: string }[];
}

export function PortalShell({
  nav,
  workspace,
  workspaces,
  user,
  children,
}: {
  nav: NavGroup[];
  workspace: { name: string; sub: string };
  workspaces?: string[];
  user: { name: string; role: string };
  children: React.ReactNode;
}) {
  const path = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const all = nav.flatMap((g) => g.items);
  const active = all
    .filter((i) => path === i.href || (i.href.split("/").length > 3 && path.startsWith(i.href)))
    .sort((a, b) => b.href.length - a.href.length)[0]?.href;

  const sidebar = (
    <div className="flex h-full flex-col">
      <div className="px-4 py-4">
        <Logo href="/" />
      </div>
      <div className="relative px-3">
        <button onClick={() => setSwitcher(!switcher)} className="flex w-full items-center justify-between gap-2 rounded-lg border border-line bg-canvas px-3 py-2 text-left" aria-expanded={switcher}>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">{workspace.name}</span>
            <span className="block truncate text-xs text-ink-3">{workspace.sub}</span>
          </span>
          {workspaces && <ChevronDown size={16} className="shrink-0 text-ink-3" />}
        </button>
        {switcher && workspaces && (
          <div className="absolute left-3 right-3 z-20 mt-1 rounded-lg border border-line bg-surface p-1 shadow-lg">
            <p className="px-3 py-1.5 text-xs text-ink-3">Switch workspace</p>
            {workspaces.map((w) => (
              <button key={w} onClick={() => setSwitcher(false)} className={cx("block w-full rounded-md px-3 py-2 text-left text-sm hover:bg-surface-2", w === workspace.name && "font-semibold")}>
                {w}
              </button>
            ))}
          </div>
        )}
      </div>
      <nav className="mt-4 flex-1 space-y-5 overflow-y-auto px-3 pb-6">
        {nav.map((g, gi) => (
          <div key={gi}>
            {g.label && <p className="mb-1 px-3 text-xs font-semibold text-ink-3">{g.label}</p>}
            {g.items.map(({ href, label, icon: I, badge }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={cx(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium",
                  active === href ? "bg-kafue-soft text-kafue-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
                )}
              >
                <I size={17} className="shrink-0" />
                <span className="flex-1">{label}</span>
                {badge && <span className="rounded-full bg-hibiscus px-1.5 text-[11px] font-bold text-white">{badge}</span>}
              </Link>
            ))}
          </div>
        ))}
      </nav>
      <div className="flex items-center gap-3 border-t border-line px-4 py-3">
        <Avatar name={user.name} />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{user.name}</p>
          <p className="truncate text-xs text-ink-3">{user.role}</p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex min-h-[calc(100vh-37px)]">
      <aside className="sticky top-[37px] hidden h-[calc(100vh-37px)] w-64 shrink-0 border-r border-line bg-surface lg:block">{sidebar}</aside>
      {open && (
        <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={() => setOpen(false)}>
          <aside className="h-full w-72 bg-surface" onClick={(e) => e.stopPropagation()}>
            <button className="absolute right-3 top-3 rounded p-2 text-white" onClick={() => setOpen(false)} aria-label="Close menu"><X /></button>
            {sidebar}
          </aside>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <header className="sticky top-[37px] z-30 flex items-center gap-3 border-b border-line bg-surface/95 px-4 py-2.5 backdrop-blur lg:px-8">
          <button className="rounded p-1.5 lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu"><Menu size={20} /></button>
          <label className="relative max-w-md flex-1">
            <span className="sr-only">Search</span>
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input placeholder="Search events, people, bookings" className="w-full rounded-lg border border-line bg-canvas py-1.5 pl-9 pr-3 text-sm focus:border-kafue focus:outline-none" />
          </label>
          <button className="relative ml-auto rounded-lg p-2 hover:bg-surface-2" aria-label="Notifications, 3 unread">
            <Bell size={18} />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-hibiscus" />
          </button>
        </header>
        <main className="px-4 py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
