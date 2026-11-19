"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell, GraduationCap, LayoutDashboard, LifeBuoy, MessageCircle, Receipt, Settings, Star, Ticket, Trophy, UserRound } from "lucide-react";
import { Avatar, cx } from "@/components/ui";

/**
 * The attendee account sections. One list feeds both places they appear:
 * the sidebar on laptops and larger (AccountNav) and the "Your account" group
 * in the phone and tablet menu (PublicHeader's drawer), so they never differ.
 */
export const accountItems = [
  { href: "/account/", label: "Overview", icon: LayoutDashboard },
  { href: "/account/messages/", label: "Messages", icon: MessageCircle },
  { href: "/account/tickets/", label: "My tickets", icon: Ticket },
  { href: "/account/help/", label: "Help at events", icon: LifeBuoy },
  { href: "/account/orders/", label: "Orders and refunds", icon: Receipt },
  { href: "/account/profile/", label: "Profile and privacy", icon: UserRound },
  { href: "/account/courses/", label: "My courses", icon: GraduationCap },
  { href: "/account/reviews/", label: "Reviews", icon: Star },
  { href: "/account/rewards/", label: "Rewards and membership", icon: Trophy },
  { href: "/account/notifications/", label: "Notifications", icon: Bell },
  { href: "/account/preferences/", label: "Location and alerts", icon: Settings },
];

/** Showcase attendee. Replaced by the signed-in user from the API. */
export const sampleAttendee = { name: "Chanda Mulenga", phone: "0971 ••• 567", signIn: "signed in by SMS code" };

export function AttendeeCard() {
  return (
    <div className="flex items-center gap-3">
      <Avatar name={sampleAttendee.name} size={40} />
      <div className="min-w-0">
        <Link href="/account/profile/" className="block truncate font-semibold hover:text-kafue">{sampleAttendee.name}</Link>
        <p className="truncate text-xs text-ink-3">{sampleAttendee.phone} · {sampleAttendee.signIn}</p>
      </div>
    </div>
  );
}

/** The account links as a vertical list, with the current page highlighted. */
export function AccountLinks({ variant = "sidebar" }: { variant?: "sidebar" | "drawer" }) {
  const path = usePathname();
  return (
    <nav aria-label="Your account" className="flex flex-col gap-0.5">
      {accountItems.map(({ href, label, icon: I }) => {
        const on = path === href;
        return (
          <Link key={href} href={href} aria-current={on ? "page" : undefined}
            className={cx(
              "flex items-center gap-2.5 rounded-lg px-3 text-sm font-medium",
              // Larger touch targets in the phone menu.
              variant === "drawer" ? "py-2.5" : "py-2",
              on ? (variant === "drawer" ? "bg-kafue-soft text-kafue-ink" : "bg-surface text-ink shadow-sm ring-1 ring-line") : "text-ink-2 hover:bg-surface-2 hover:text-ink",
            )}>
            <I size={17} className="shrink-0" /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
