import { AccountNav } from "./nav";

/**
 * Attendee account layout, mobile first:
 * - Phones and tablets: one column, full width; sections are in the header menu.
 * - Laptops and larger (lg, 1024px+): sidebar on the left, page on the right.
 * `grid-cols-1` and `min-w-0` stop wide content (tables, tab rows) from
 * stretching the page sideways on small screens.
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 py-5 sm:px-6 sm:py-8 lg:grid-cols-[240px_minmax(0,1fr)]">
      <AccountNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
