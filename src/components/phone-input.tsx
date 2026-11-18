"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { ChevronDown, Search } from "lucide-react";
import { cx } from "@/components/ui";
import { countries, countryOf, flagSrc, matchesCountry, pinned, type Country, type Phone } from "@/lib/phone";

function Flag({ iso, className }: { iso: string; className?: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- static SVG from /flags, no optimisation needed
  return <img src={flagSrc(iso)} alt="" width={21} height={14} loading="lazy" className={cx("h-[14px] w-[21px] shrink-0 rounded-[2px] object-cover ring-1 ring-black/10", className)} />;
}

/**
 * Mobile number with a country code. The button shows the flag and dialling
 * code (Zambia +260 by default). It opens a searchable list of every country,
 * with Zambia and its neighbours first. Search by name, code (ZM) or dialling
 * code (260). Keyboard: arrows to move, Enter to choose, Escape to close.
 */
export function PhoneInput({ value, onChange, invalid, placeholder, id, autoFocus }: { value: Phone; onChange: (p: Phone) => void; invalid?: boolean; placeholder?: string; id?: string; autoFocus?: boolean }) {
  const c = countryOf(value.country);
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const [active, setActive] = useState(0);
  const wrap = useRef<HTMLSpanElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const search = useRef<HTMLInputElement>(null);
  const number = useRef<HTMLInputElement>(null);
  const listId = useId();

  const options = useMemo(() => {
    const hits = countries.filter((x) => matchesCountry(x, q));
    if (q.trim()) return hits;
    const top = pinned.map((iso) => countryOf(iso));
    return [...top, ...hits.filter((x) => !pinned.includes(x.iso))];
  }, [q]);

  useEffect(() => {
    if (!open) return;
    search.current?.focus();
    const close = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [open]);

  useEffect(() => {
    list.current?.querySelector<HTMLElement>(`[data-i="${active}"]`)?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const choose = (x: Country) => {
    onChange({ ...value, country: x.iso });
    setOpen(false);
    setQ("");
    number.current?.focus();
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, options.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (options[active]) choose(options[active]); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); }
  };

  const openList = () => {
    setActive(Math.max(0, options.findIndex((x) => x.iso === value.country)));
    setOpen((o) => !o);
  };

  return (
    <span ref={wrap} className="relative block">
      <span className={cx("flex w-full overflow-hidden rounded-lg border bg-surface focus-within:border-kafue focus-within:ring-2 focus-within:ring-kafue/20", invalid ? "border-hibiscus" : "border-line")}>
        <input
          ref={number}
          id={id}
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          autoFocus={autoFocus}
          aria-invalid={invalid || undefined}
          value={value.number}
          onChange={(e) => onChange({ ...value, number: e.target.value })}
          placeholder={placeholder ?? (c.iso === "ZM" ? "096 412 3456" : c.example)}
          className="order-2 min-w-0 flex-1 bg-transparent px-3 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:outline-none"
        />
        {/* The number box comes first in the page so tapping the field's label focuses it; CSS order puts the button on the left. */}
        <button
          type="button"
          onClick={(e) => { e.preventDefault(); openList(); }}
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={`Country code: ${c.name} +${c.dial}. Change`}
          className="order-1 flex shrink-0 items-center gap-1.5 border-r border-line bg-surface-2 pl-3 pr-2 text-sm font-medium text-ink hover:bg-line/40 focus:outline-none"
        >
          <Flag iso={c.iso} />
          <span className="tabular-nums">+{c.dial}</span>
          <ChevronDown size={14} className={cx("text-ink-3 transition-transform", open && "rotate-180")} />
        </button>
      </span>

      {open && (
        <span className="absolute left-0 z-50 mt-1 block w-full min-w-[280px] max-w-[380px] overflow-hidden rounded-lg border border-line bg-surface shadow-lg" onClick={(e) => e.preventDefault()}>
          <span className="flex items-center gap-2 border-b border-line px-3 py-2">
            <Search size={15} className="text-ink-3" />
            <input
              ref={search}
              value={q}
              onChange={(e) => { setQ(e.target.value); setActive(0); }}
              onKeyDown={onKey}
              placeholder="Search country or code"
              aria-label="Search countries"
              aria-controls={listId}
              aria-activedescendant={options[active] ? `${listId}-${options[active].iso}` : undefined}
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-3 focus:outline-none"
            />
          </span>
          <ul ref={list} id={listId} role="listbox" aria-label="Countries" className="max-h-72 overflow-y-auto py-1">
            {options.length === 0 && <li className="px-3 py-2 text-sm text-ink-3">No country matches &ldquo;{q}&rdquo;.</li>}
            {options.map((x, i) => (
              <li
                key={x.iso}
                id={`${listId}-${x.iso}`}
                data-i={i}
                role="option"
                aria-selected={x.iso === value.country}
                onMouseEnter={() => setActive(i)}
                onMouseDown={(e) => { e.preventDefault(); choose(x); }}
                className={cx(
                  "flex cursor-pointer items-center gap-2.5 px-3 py-2 text-sm",
                  i === active ? "bg-kafue-soft" : "",
                  x.iso === value.country && "font-semibold",
                  !q.trim() && i === pinned.length - 1 && "border-b border-line"
                )}
              >
                <Flag iso={x.iso} />
                <span className="min-w-0 flex-1 truncate">{x.name}</span>
                <span className="tabular-nums text-ink-3">+{x.dial}</span>
              </li>
            ))}
          </ul>
        </span>
      )}
    </span>
  );
}
