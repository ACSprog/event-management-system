"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Moon, Sun } from "lucide-react";
import { useEffect, useState } from "react";
import { cx } from "@/components/ui";

export const portals = [
  // The public marketplace that anyone can browse without signing in.
  { href: "/", label: "Public site", match: (p: string) => !/^\/(org|admin|account)(\/|$)/.test(p) },
  // A signed-in attendee's own account: overview, profile, tickets, orders.
  { href: "/account/", label: "Attendee", match: (p: string) => p.startsWith("/account") },
  { href: "/org/", label: "Event organiser", match: (p: string) => p === "/org" || p.startsWith("/org/") },
  { href: "/admin/", label: "Super admin", match: (p: string) => p.startsWith("/admin") },
];

export function ThemeToggle({ className }: { className?: string }) {
  const [dark, setDark] = useState(false);
  useEffect(() => setDark(document.documentElement.classList.contains("dark")), []);
  const flip = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try { localStorage.setItem("theme", next ? "dark" : "light"); } catch {}
  };
  return (
    <button onClick={flip} aria-label={dark ? "Switch to light theme" : "Switch to dark theme"} className={cx("rounded-md p-1.5 hover:bg-white/10", className)}>
      {dark ? <Sun size={15} /> : <Moon size={15} />}
    </button>
  );
}

/** Showcase-only strip: lets partners jump between portals. Remove for production. */
export function DemoBar() {
  const path = usePathname() ?? "/";
  return (
    <div className="sticky top-0 z-40 bg-[#172033] text-[13px] text-white/85 print:hidden">
      <div className="flex items-center gap-3 overflow-x-auto px-3 py-1.5">
        <span className="hidden shrink-0 text-white/60 sm:inline">Switch view:</span>
        <nav className="flex shrink-0 gap-1">
          {portals.map((p) => (
            <Link key={p.href} href={p.href} className={cx("rounded-md px-2 py-1 whitespace-nowrap", p.match(path) ? "bg-white/15 font-semibold text-white" : "hover:bg-white/10")}>
              {p.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle className="ml-auto shrink-0" />
      </div>
    </div>
  );
}
