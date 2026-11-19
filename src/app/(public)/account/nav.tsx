"use client";

import { AccountLinks, AttendeeCard } from "@/components/layout/account-menu";

/**
 * Account sidebar for laptops and larger screens (1024px+). On phones and
 * tablets it is hidden and the same links live in the menu opened by the
 * hamburger in the header (see PublicHeader), like the organiser and super
 * admin views.
 */
export function AccountNav() {
  return (
    <aside className="hidden lg:block">
      <div className="sticky top-[124px]">
        <div className="mb-4"><AttendeeCard /></div>
        <AccountLinks />
      </div>
    </aside>
  );
}
