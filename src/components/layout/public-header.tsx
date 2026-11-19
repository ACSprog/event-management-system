"use client";

import Link from "next/link";
import { useState } from "react";
import { Bell, Compass, HandHeart, Briefcase, LogIn, Search, Ticket, UserRound } from "lucide-react";
import { Logo } from "./logo";
import { Drawer, MenuButton } from "./drawer";
import { AccountLinks, AttendeeCard } from "./account-menu";

const explore = [
  { href: "/events/", label: "Discover events", icon: Compass },
  { href: "/fundraising/school-feeding-2027/", label: "Give", icon: HandHeart },
  { href: "/for-organisers/", label: "For organisers", icon: Briefcase },
  { href: "/login/", label: "Sign in", icon: LogIn },
];

/**
 * Header for the public site and the attendee account. Mobile first:
 * - Phones (under 768px): hamburger, logo, notifications, account. Search,
 *   site links and account sections are in the menu; the bottom bar
 *   (BottomNav) covers Home, Discover, Tickets and Account.
 * - Tablets (768–1023px): adds the search box and My tickets; links stay in the menu.
 * - Laptops and larger (1024px+): no hamburger; Discover, Give, For organisers
 *   and Sign in show in the bar, and account pages show their own sidebar.
 */
export function PublicHeader() {
  const [open, setOpen] = useState(false);
  return (
    <header className="sticky top-[37px] z-30 border-b border-line bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2 sm:px-6 md:gap-4 lg:gap-6 lg:py-3">
        <MenuButton onClick={() => setOpen(true)} />
        <Logo />
        <form action="/events/" className="hidden flex-1 md:block">
          <label className="relative block max-w-md">
            <span className="sr-only">Search events</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input name="q" placeholder="Search events, artists or venues" className="w-full rounded-full border border-line bg-canvas py-2 pl-9 pr-4 text-sm focus:border-kafue focus:outline-none" />
          </label>
        </form>
        <nav className="ml-auto flex items-center gap-1 text-sm font-medium sm:gap-2">
          <Link href="/events/" className="hidden rounded-md px-3 py-2 hover:bg-surface-2 lg:block">Discover</Link>
          <Link href="/fundraising/school-feeding-2027/" className="hidden rounded-md px-3 py-2 hover:bg-surface-2 lg:block">Give</Link>
          <Link href="/for-organisers/" className="hidden rounded-md px-3 py-2 hover:bg-surface-2 lg:block">For organisers</Link>
          <Link href="/login/" className="hidden rounded-md px-3 py-2 hover:bg-surface-2 lg:block">Sign in</Link>
          <Link href="/account/notifications/" aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-surface-2"><Bell size={18} /></Link>
          <Link href="/account/tickets/" className="hidden h-10 items-center gap-2 rounded-full bg-ink px-4 text-canvas hover:opacity-90 md:flex"><Ticket size={16} /> My tickets</Link>
          <Link href="/account/" aria-label="My account" title="My account" className="flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface hover:border-ink-3"><UserRound size={18} /></Link>
        </nav>
      </div>

      <Drawer open={open} onClose={() => setOpen(false)}>
        <div className="px-4 pb-3 pt-4"><Logo /></div>
        <form action="/events/" className="px-4 pb-4 md:hidden">
          <label className="relative block">
            <span className="sr-only">Search events</span>
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
            <input name="q" placeholder="Search events" className="w-full rounded-full border border-line bg-canvas py-2.5 pl-9 pr-4 text-base focus:border-kafue focus:outline-none" />
          </label>
        </form>
        <div className="border-t border-line px-4 py-4"><AttendeeCard /></div>
        <div className="px-3 pb-4">
          <p className="mb-1 px-3 text-xs font-semibold text-ink-3">Your account</p>
          <AccountLinks variant="drawer" />
        </div>
        <div className="border-t border-line px-3 py-4">
          <p className="mb-1 px-3 text-xs font-semibold text-ink-3">Explore</p>
          {explore.map(({ href, label, icon: I }) => (
            <Link key={href} href={href} className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium text-ink-2 hover:bg-surface-2 hover:text-ink"><I size={17} /> {label}</Link>
          ))}
        </div>
      </Drawer>
    </header>
  );
}
