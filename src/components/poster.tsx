import cx from "clsx";
import type { EventItem } from "@/lib/api";
import { fmtDate } from "@/lib/brand";

/**
 * Generated typographic event poster. Each category gets its own composition so
 * listings look like a wall of gig posters rather than identical stock photos.
 * Organisers' uploaded cover images replace this once media upload is connected.
 */
export function Poster({ event, size = "md", className, bare }: { event: Pick<EventItem, "title" | "category" | "palette" | "start" | "city">; size?: "sm" | "md" | "lg"; className?: string; bare?: boolean }) {
  const [a, b] = event.palette;
  const shapes: Record<string, React.ReactNode> = {
    Music: (
      <>
        <circle cx="78%" cy="30%" r="34%" fill={b} />
        <circle cx="78%" cy="30%" r="20%" fill={a} />
        <circle cx="78%" cy="30%" r="4%" fill={b} />
      </>
    ),
    Conference: (
      <>
        <rect x="55%" y="-10%" width="60%" height="70%" fill={b} transform="rotate(8)" />
        <rect x="62%" y="8%" width="30%" height="4%" fill={a} />
        <rect x="62%" y="16%" width="22%" height="4%" fill={a} />
      </>
    ),
    Church: (
      <>
        <path d="M0 0 L100 0 L100 55 Q50 25 0 55 Z" fill={b} transform="scale(1 1)" opacity="0.9" vectorEffect="non-scaling-stroke" />
      </>
    ),
    Sports: (
      <>
        <rect x="0" y="38%" width="100%" height="8%" fill={b} />
        <rect x="0" y="50%" width="100%" height="3%" fill={b} opacity="0.6" />
        <circle cx="82%" cy="22%" r="13%" fill="none" stroke={b} strokeWidth="6" />
      </>
    ),
    Education: (
      <>
        {Array.from({ length: 6 }).map((_, i) => (
          <rect key={i} x={`${50 + i * 8}%`} y={`${8 + (i % 3) * 6}%`} width="6%" height={`${30 + (i % 3) * 8}%`} fill={b} opacity={0.5 + i * 0.08} />
        ))}
      </>
    ),
    Workshop: (
      <>
        <rect x="58%" y="10%" width="32%" height="32%" rx="6" fill="none" stroke={b} strokeWidth="6" />
        <circle cx="74%" cy="26%" r="8%" fill={b} />
      </>
    ),
    Charity: (
      <>
        <circle cx="70%" cy="28%" r="18%" fill={b} />
        <circle cx="86%" cy="28%" r="18%" fill={b} opacity="0.7" />
      </>
    ),
    Comedy: (
      <>
        {Array.from({ length: 5 }).map((_, i) => (
          <circle key={i} cx={`${55 + i * 9}%`} cy={`${15 + (i % 2) * 14}%`} r="5%" fill={b} />
        ))}
      </>
    ),
    Exhibition: (
      <>
        {Array.from({ length: 9 }).map((_, i) => (
          <rect key={i} x={`${56 + (i % 3) * 13}%`} y={`${6 + Math.floor(i / 3) * 13}%`} width="10%" height="10%" fill={b} opacity={i % 2 ? 0.6 : 1} />
        ))}
      </>
    ),
    Wedding: (
      <>
        <circle cx="70%" cy="30%" r="16%" fill="none" stroke={b} strokeWidth="5" />
        <circle cx="82%" cy="30%" r="16%" fill="none" stroke={b} strokeWidth="5" />
      </>
    ),
  };
  const titleSize = size === "lg" ? "text-4xl sm:text-5xl" : size === "md" ? "text-[22px]" : "text-base";
  return (
    <div className={cx("relative overflow-hidden text-white", className)} style={{ background: a }} aria-hidden>
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox={event.category === "Church" ? "0 0 100 100" : undefined}>
        {shapes[event.category] ?? shapes.Music}
      </svg>
      {!bare && <div className={cx("relative flex h-full flex-col justify-end", size === "lg" ? "p-8" : size === "md" ? "p-4" : "p-3")}>
        <span className={cx("font-display font-semibold opacity-85", size === "sm" ? "text-[11px]" : "text-xs")}>{event.category}</span>
        <span className={cx("font-display font-bold leading-[0.95] [text-wrap:balance]", titleSize)} style={{ textShadow: "0 1px 12px rgba(0,0,0,.18)" }}>
          {event.title}
        </span>
        {size !== "sm" && (
          <span className="mt-2 text-xs font-medium opacity-90">
            {fmtDate(event.start, { day: "numeric", month: "long" })}, {event.city}
          </span>
        )}
      </div>}
    </div>
  );
}
