"use client";

import { ChevronDown } from "lucide-react";
import { cx } from "@/components/ui";
import { countries, countryOf, type Phone } from "@/lib/phone";

/**
 * Mobile number with a country code. The country picker shows the flag and
 * dialling code (🇿🇲 +260 by default); the number box takes the local number,
 * with or without its leading 0. Use inside <Field>.
 */
export function PhoneInput({ value, onChange, invalid, placeholder, id, autoFocus }: { value: Phone; onChange: (p: Phone) => void; invalid?: boolean; placeholder?: string; id?: string; autoFocus?: boolean }) {
  const c = countryOf(value.country);
  return (
    <span className={cx("flex w-full overflow-hidden rounded-lg border bg-surface focus-within:border-kafue focus-within:ring-2 focus-within:ring-kafue/20", invalid ? "border-hibiscus" : "border-line")}>
      {/* The closed picker shows only flag and code; the open list adds country names. */}
      <span className="relative flex shrink-0 items-center gap-1 border-r border-line bg-surface-2 pl-3 pr-2 text-sm font-medium text-ink">
        <span aria-hidden>{c.flag}</span>
        <span aria-hidden className="tabular-nums">+{c.dial}</span>
        <ChevronDown size={14} aria-hidden className="text-ink-3" />
        <select
          aria-label={`Country code, ${c.name} +${c.dial}`}
          value={value.country}
          onChange={(e) => onChange({ ...value, country: e.target.value })}
          className="absolute inset-0 cursor-pointer opacity-0"
        >
          {countries.map((x) => (
            <option key={x.iso} value={x.iso}>
              {x.flag} {x.name} (+{x.dial})
            </option>
          ))}
        </select>
      </span>
      <input
        id={id}
        type="tel"
        inputMode="tel"
        autoComplete="tel-national"
        autoFocus={autoFocus}
        aria-invalid={invalid || undefined}
        value={value.number}
        onChange={(e) => onChange({ ...value, number: e.target.value })}
        placeholder={placeholder ?? (c.iso === "ZM" ? "096 412 3456" : c.example)}
        className="min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none"
      />
    </span>
  );
}
