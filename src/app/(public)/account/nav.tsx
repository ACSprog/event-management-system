"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, GraduationCap, LayoutDashboard, UserRound, Receipt, Settings, Star, Ticket, Trophy } from "lucide-react";
import { Avatar, cx } from "@/components/ui";

const items = [
  { href: "/account/", label: "Overview", icon: LayoutDashboard },
  { href: "/account/tickets/", label: "My tickets", icon: Ticket },
  { href: "/account/orders/", label: "Orders and refunds", icon: Receipt },
  { href: "/account/courses/", label: "My courses", icon: GraduationCap },
  { href: "/account/reviews/", label: "Reviews", icon: Star },
  { href: "/account/rewards/", label: "Rewards and membership", icon: Trophy },
  { href: "/account/notifications/", label: "Notifications", icon: Bell },
  { href: "/account/preferences/", label: "Location and alerts", icon: Settings },
  { href: "/account/profile/", label: "Profile and privacy", icon: UserRound },
];

export function AccountNav() {
  const path = usePathname();
  return (
    <aside>
      <div className="mb-4 flex items-center gap-3">
        <Avatar name="Chanda Mulenga" size={40} />
        <div>
          <Link href="/account/profile/" className="font-semibold hover:text-kafue">Chanda Mulenga</Link>
          <p className="text-xs text-ink-3">0971 ••• 567 · signed in by SMS code</p>
        </div>
      </div>
      <nav className="flex gap-1 overflow-x-auto lg:flex-col">
        {items.map(({ href, label, icon: I }) => (
          <Link key={href} href={href} className={cx("flex shrink-0 items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium", path === href ? "bg-surface text-ink shadow-sm ring-1 ring-line" : "text-ink-2 hover:bg-surface")}>
            <I size={16} /> {label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
