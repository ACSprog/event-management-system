import Link from "next/link";
import { brand } from "@/lib/brand";

export function Logo({ href = "/", light }: { href?: string; light?: boolean }) {
  return (
    <Link href={href} className="flex items-center gap-2" aria-label={`${brand.name} home`}>
      <svg width="26" height="26" viewBox="0 0 26 26" aria-hidden>
        <path d="M3 5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a3 3 0 0 0 0 6v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-5a3 3 0 0 0 0-6Z" fill="var(--marigold)" />
        <path d="M9 8h8M9 13h6M9 18h8" stroke="#2a1a00" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className={`font-display text-xl font-bold tracking-tight ${light ? "text-white" : "text-ink"}`}>{brand.name}</span>
    </Link>
  );
}
