"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cx } from "@/components/ui";

/**
 * The phone menu used by every view (public site, attendee account, organiser,
 * super admin): a hamburger button opens a panel that slides in from the left.
 *
 * Mobile first: the drawer is the default navigation; on large screens
 * (lg and up) each layout shows its sidebar instead and hides the button.
 * The drawer closes on a backdrop tap, the close button, Escape, or when the
 * route changes, and the page behind it does not scroll while it is open.
 * It is rendered into <body> (a portal) so a blurred or sticky header that
 * contains the button cannot trap it.
 */
export function MenuButton({ onClick, className }: { onClick: () => void; className?: string }) {
  return (
    <button onClick={onClick} aria-label="Open menu" className={cx("-ml-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg hover:bg-surface-2 lg:hidden", className)}>
      <Menu size={22} />
    </button>
  );
}

export function Drawer({ open, onClose, children, label = "Menu" }: { open: boolean; onClose: () => void; children: React.ReactNode; label?: string }) {
  const path = usePathname();
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []); // eslint-disable-line react-hooks/set-state-in-effect

  // Close when the page changes (a link inside the drawer was followed).
  useEffect(() => { onClose(); }, [path]); // eslint-disable-line react-hooks/exhaustive-deps

  // Escape closes; the page behind stays still while the drawer is open.
  useEffect(() => {
    if (!open) return;
    const key = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", key);
    return () => { document.body.style.overflow = prev; window.removeEventListener("keydown", key); };
  }, [open, onClose]);

  if (!open || !mounted) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 bg-black/40 lg:hidden" onClick={onClose}>
      <aside role="dialog" aria-modal="true" aria-label={label} className="relative flex h-full w-[min(18rem,85vw)] flex-col overflow-y-auto bg-surface pb-[env(safe-area-inset-bottom)] shadow-xl" onClick={(e) => e.stopPropagation()}>
        <button className="absolute right-2 top-3 z-10 flex h-10 w-10 items-center justify-center rounded-lg text-ink-2 hover:bg-surface-2" onClick={onClose} aria-label="Close menu"><X size={20} /></button>
        {children}
      </aside>
    </div>,
    document.body,
  );
}
