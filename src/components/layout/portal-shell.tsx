"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Bell, ChevronDown, Search, X, type LucideIcon } from "lucide-react";
import { Avatar, cx } from "@/components/ui";
import { Logo } from "./logo";
import { Drawer, MenuButton } from "./drawer";

export interface NavGroup {
  label?: string;
  items: { href: string; label: string; icon: LucideIcon; badge?: string }[];
}

/**
 * Shell for the organiser workspace and the super admin.
 *
 * Mobile first, three sizes:
 * - Phones (under 640px): hamburger menu, search behind an icon, full-width page.
 * - Tablets (640–1023px): hamburger menu, search box in the header.
 * - Laptops and larger (1024px+): fixed sidebar, no hamburger.
 * The same sidebar content is used in the drawer and the fixed sidebar.
 */
export function PortalShell({
  nav,
  workspace,
  workspaces,
  user,
  children,
  headerSlot,
  activeFor,
}: {
  nav: NavGroup[];
  workspace: { name: string; sub: string };
  workspaces?: string[];
  user: { name: string; role: string };
  children: React.ReactNode;
  headerSlot?: React.ReactNode;
  /** Optional: decide which nav item is active for the current path. */
  activeFor?: (path: string) => string | undefined;
}) {
  const path = usePathname() ?? "";
  const [open, setOpen] = useState(false);
  const [switcher, setSwitcher] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const all = nav.flatMap((g) => g.items);
  const active = activeFor?.(path) ?? all
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
      <Drawer open={open} onClose={() => setOpen(false)} label={workspace.name}>{sidebar}</Drawer>
      <div className="min-w-0 flex-1">
        <header className="sticky top-[37px] z-30 border-b border-line bg-surface/95 backdrop-blur">
          <div className="flex items-center gap-2 px-4 py-2 sm:gap-3 lg:px-8">
            <MenuButton onClick={() => setOpen(true)} />
            {/* Phones and tablets: logo in the bar (the sidebar has it on laptops). Phones: search behind an icon; tablets and up: search box. */}
            <div className="lg:hidden"><Logo href="/" /></div>
            <label className="relative hidden max-w-md flex-1 sm:block">
              <span className="sr-only">Search</span>
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input placeholder="Search events, people, bookings" className="w-full rounded-lg border border-line bg-canvas py-2 pl-9 pr-3 text-sm focus:border-kafue focus:outline-none" />
            </label>
            <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-2">
              <button onClick={() => setSearchOpen(!searchOpen)} className="flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-2 sm:hidden" aria-label="Search" aria-expanded={searchOpen}>{searchOpen ? <X size={18} /> : <Search size={18} />}</button>
              {headerSlot && <div className="min-w-0">{headerSlot}</div>}
              <button className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-surface-2" aria-label="Notifications, 3 unread">
                <Bell size={18} />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-hibiscus" />
              </button>
            </div>
          </div>
          {searchOpen && (
            <div className="px-4 pb-2.5 sm:hidden">
              <label className="relative block">
                <span className="sr-only">Search</span>
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
                <input autoFocus placeholder="Search events, people, bookings" className="w-full rounded-lg border border-line bg-canvas py-2.5 pl-9 pr-3 text-base focus:border-kafue focus:outline-none" />
              </label>
            </div>
          )}
        </header>
        <main className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}
