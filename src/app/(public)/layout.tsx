import Link from "next/link";
import { Search, Ticket, Bell } from "lucide-react";
import { Logo } from "@/components/layout/logo";
import { brand } from "@/lib/brand";
import { BottomNav } from "@/components/layout/bottom-nav";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pb-16 md:pb-0">
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3">
          <Logo />
          <form action="/events/" className="hidden flex-1 md:block">
            <label className="relative block max-w-md">
              <span className="sr-only">Search events</span>
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3" />
              <input name="q" placeholder="Search events, artists or venues" className="w-full rounded-full border border-line bg-canvas py-2 pl-9 pr-4 text-sm focus:border-kafue focus:outline-none" />
            </label>
          </form>
          <nav className="ml-auto flex items-center gap-1 text-sm font-medium">
            <Link href="/events/" className="hidden rounded-md px-3 py-2 hover:bg-surface-2 sm:block">Discover</Link>
            <Link href="/fundraising/school-feeding-2027/" className="hidden rounded-md px-3 py-2 hover:bg-surface-2 lg:block">Give</Link>
            <Link href="/for-organisers/" className="hidden rounded-md px-3 py-2 hover:bg-surface-2 lg:block">For organisers</Link>
            <Link href="/login/" className="hidden rounded-md px-3 py-2 hover:bg-surface-2 sm:block">Sign in</Link>
            <Link href="/account/notifications/" aria-label="Notifications" className="rounded-md p-2 hover:bg-surface-2"><Bell size={18} /></Link>
            <Link href="/account/" className="hidden items-center gap-2 rounded-full bg-ink px-4 py-2 text-canvas hover:opacity-90 md:flex"><Ticket size={16} /> My tickets</Link>
          </nav>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="mt-16 border-t border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm sm:grid-cols-4">
          <div>
            <Logo />
            <p className="mt-3 max-w-xs text-ink-3">{brand.tagline} Tickets for concerts, conferences, church conventions and more across {brand.country}.</p>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Go out</p>
            <Link href="/events/" className="block text-ink-3 hover:text-ink">Discover events</Link>
            <Link href="/events/?near=1" className="block text-ink-3 hover:text-ink">Events near me</Link>
            <Link href="/fundraising/school-feeding-2027/" className="block text-ink-3 hover:text-ink">Donate to a cause</Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Organise</p>
            <Link href="/for-organisers/" className="block text-ink-3 hover:text-ink">Pricing</Link>
            <Link href="/register/organisation/" className="block text-ink-3 hover:text-ink">Register your organisation</Link>
            <Link href="/org/" className="block text-ink-3 hover:text-ink">Organiser sign in</Link>
          </div>
          <div className="space-y-2">
            <p className="font-semibold">Help</p>
            <p className="text-ink-3">{brand.supportEmail}</p>
            <p className="text-ink-3">Pay with MTN MoMo, Airtel Money, Zamtel Kwacha, Visa or Mastercard.</p>
          </div>
        </div>
      </footer>
      <BottomNav />
    </div>
  );
}
