"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Compass, Home, Ticket, UserRound } from "lucide-react";
import { cx } from "@/components/ui";

const items = [
  { href: "/", label: "Home", icon: Home, match: (p: string) => p === "/" },
  { href: "/events/", label: "Discover", icon: Compass, match: (p: string) => p.startsWith("/events") || p.startsWith("/organisers") },
  { href: "/account/tickets/", label: "Tickets", icon: Ticket, match: (p: string) => p.startsWith("/account/tickets") },
  { href: "/account/", label: "Account", icon: UserRound, match: (p: string) => p.startsWith("/account") && !p.startsWith("/account/tickets") },
];

/** Phone-only navigation for attendees: the four places they go most. */
export function BottomNav() {
  const path = usePathname() ?? "/";
  if (path.startsWith("/checkout")) return null;
  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden" aria-label="Main">
      {items.map(({ href, label, icon: I, match }) => {
        const on = match(path);
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined} className={cx("flex flex-col items-center gap-0.5 py-2 text-[11px] font-medium", on ? "text-kafue" : "text-ink-3")}>
            <I size={20} strokeWidth={on ? 2.4 : 1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
