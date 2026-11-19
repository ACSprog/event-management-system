import Link from "next/link";
import { Logo } from "@/components/layout/logo";
import { brand } from "@/lib/brand";
import { BottomNav } from "@/components/layout/bottom-nav";
import { PublicHeader } from "@/components/layout/public-header";

/**
 * Public site and attendee account. Mobile first: PublicHeader has the menu
 * (hamburger below 1024px), BottomNav is the phone tab bar (below 768px), and
 * the bottom padding keeps content clear of it. Footer columns stack on phones,
 * two across on tablets, four on laptops.
 */

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <footer className="mt-16 border-t border-line bg-surface">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
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
