"use client";

import clsx from "clsx";
import Link from "next/link";
import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { Check, Star, X, AlertTriangle, Info, CheckCircle2 } from "lucide-react";

export const cx = clsx;

/* Buttons ---------------------------------------------------------------- */
type BtnVariant = "primary" | "secondary" | "ghost" | "danger" | "ticket";
const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap";
const btnVariants: Record<BtnVariant, string> = {
  primary: "bg-kafue text-white hover:bg-kafue-ink dark:text-[#0f1522]",
  secondary: "bg-surface text-ink border border-line hover:bg-surface-2",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
  danger: "bg-hibiscus text-white hover:opacity-90",
  ticket: "bg-marigold text-[#2a1a00] hover:brightness-95",
};
const btnSizes = { sm: "h-8 px-3 text-[13px]", md: "h-10 px-4 text-sm", lg: "h-12 px-6 text-base" };

export function Button({
  variant = "primary",
  size = "md",
  className,
  href,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: keyof typeof btnSizes; href?: string }) {
  const cls = cx(btnBase, btnVariants[variant], btnSizes[size], className);
  if (href) return <Link href={href} className={cls}>{props.children}</Link>;
  return <button type="button" className={cls} {...props} />;
}

/* Badge ------------------------------------------------------------------ */
const tones = {
  teal: "bg-kafue-soft text-kafue-ink",
  gold: "bg-marigold-soft text-[#7a4b00] dark:text-marigold",
  red: "bg-hibiscus-soft text-hibiscus",
  green: "bg-leaf-soft text-leaf",
  grey: "bg-surface-2 text-ink-2",
};
export type Tone = keyof typeof tones;
export function Badge({ tone = "grey", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return <span className={cx("inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-semibold", tones[tone], className)}>{children}</span>;
}

/* Surfaces --------------------------------------------------------------- */
export function Card({ children, className, pad = true }: { children: ReactNode; className?: string; pad?: boolean }) {
  return <div className={cx("rounded-xl border border-line bg-surface", pad && "p-5", className)}>{children}</div>;
}

export function SectionTitle({ title, action, sub }: { title: string; action?: ReactNode; sub?: string }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {sub && <p className="text-sm text-ink-3">{sub}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageHeader({ title, sub, actions, back }: { title: string; sub?: ReactNode; actions?: ReactNode; back?: { href: string; label: string } }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {back && (
          <Link href={back.href} className="mb-1 inline-block text-sm text-ink-3 hover:text-kafue">
            ‹ {back.label}
          </Link>
        )}
        <h1 className="text-[26px] font-semibold leading-tight">{title}</h1>
        {sub && <div className="mt-1 text-sm text-ink-3">{sub}</div>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Stat({ label, value, delta, hint, tone }: { label: string; value: ReactNode; delta?: string; hint?: string; tone?: "up" | "down" }) {
  return (
    <Card>
      <p className="text-sm text-ink-3">{label}</p>
      <p className="font-display mt-1 text-[28px] font-semibold leading-none tabular-nums">{value}</p>
      {(delta || hint) && (
        <p className="mt-2 text-xs text-ink-3">
          {delta && <span className={cx("mr-1 font-semibold", tone === "down" ? "text-hibiscus" : "text-leaf")}>{delta}</span>}
          {hint}
        </p>
      )}
    </Card>
  );
}

export function Progress({ value, tone = "kafue", className }: { value: number; tone?: "kafue" | "marigold" | "hibiscus" | "leaf"; className?: string }) {
  const color = { kafue: "bg-kafue", marigold: "bg-marigold", hibiscus: "bg-hibiscus", leaf: "bg-leaf" }[tone];
  return (
    <div className={cx("h-2 overflow-hidden rounded-full bg-surface-2", className)} role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
      <div className={cx("h-full rounded-full", color)} style={{ width: `${Math.min(100, value)}%` }} />
    </div>
  );
}

/* Table ------------------------------------------------------------------ */
export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  align?: "left" | "right";
  className?: string;
}
export function Table<T extends object>({ columns, rows, onRow, empty = "Nothing here yet." }: { columns: Column<T>[]; rows: T[]; onRow?: (r: T) => void; empty?: string }) {
  if (!rows.length) return <EmptyState title={empty} />;
  return (
    <div className="overflow-x-auto rounded-xl border border-line bg-surface">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-line text-ink-3">
            {columns.map((c) => (
              <th key={c.key} className={cx("px-4 py-3 font-medium", c.align === "right" && "text-right")}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr
              key={i}
              onClick={onRow ? () => onRow(r) : undefined}
              className={cx("border-b border-line last:border-0", onRow && "cursor-pointer hover:bg-surface-2")}
            >
              {columns.map((c) => (
                <td key={c.key} className={cx("px-4 py-3 align-middle", c.align === "right" && "text-right tabular-nums", c.className)}>
                  {c.render ? c.render(r) : String((r as Record<string, unknown>)[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function EmptyState({ title, body, action }: { title: string; body?: string; action?: ReactNode }) {
  return (
    <div className="rounded-xl border border-dashed border-line bg-surface p-10 text-center">
      <p className="font-semibold">{title}</p>
      {body && <p className="mx-auto mt-1 max-w-md text-sm text-ink-3">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

/* Tabs ------------------------------------------------------------------- */
export function Tabs({ tabs, value, onChange }: { tabs: string[]; value: string; onChange: (t: string) => void }) {
  return (
    <div className="mb-5 flex gap-1 overflow-x-auto border-b border-line" role="tablist">
      {tabs.map((t) => (
        <button
          key={t}
          role="tab"
          aria-selected={value === t}
          onClick={() => onChange(t)}
          className={cx(
            "-mb-px whitespace-nowrap border-b-2 px-3 py-2.5 text-sm font-medium",
            value === t ? "border-kafue text-ink" : "border-transparent text-ink-3 hover:text-ink",
          )}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

/* Forms ------------------------------------------------------------------ */
export function Field({ label, hint, error, children }: { label: string; hint?: string; error?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      {children}
      {error ? <span className="mt-1 block text-xs text-hibiscus">{error}</span> : hint && <span className="mt-1 block text-xs text-ink-3">{hint}</span>}
    </label>
  );
}
const inputCls =
  "w-full rounded-lg border border-line bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-ink-3 focus:border-kafue focus:outline-none focus:ring-2 focus:ring-kafue/20";
export function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={cx(inputCls, props.className)} />;
}
export function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea rows={4} {...props} className={cx(inputCls, props.className)} />;
}
export function Select({ options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: string[] }) {
  return (
    <select {...props} className={cx(inputCls, "pr-8", props.className)}>
      {options.map((o) => (
        <option key={o}>{o}</option>
      ))}
    </select>
  );
}
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between gap-4 py-2 text-left text-sm"
    >
      <span>{label}</span>
      <span className={cx("relative h-6 w-10 shrink-0 rounded-full transition-colors", checked ? "bg-kafue" : "bg-line")}>
        <span className={cx("absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform", checked ? "translate-x-[18px]" : "translate-x-0.5")} />
      </span>
    </button>
  );
}
export function Checkbox({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: ReactNode }) {
  return (
    <label className="flex cursor-pointer items-start gap-2.5 text-sm">
      <span
        className={cx("mt-0.5 flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded border", checked ? "border-kafue bg-kafue text-white" : "border-line bg-surface")}
      >
        {checked && <Check size={13} strokeWidth={3} />}
      </span>
      <input type="checkbox" className="sr-only" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

/* Stars ------------------------------------------------------------------ */
export function Stars({ value, size = 14, onChange }: { value: number; size?: number; onChange?: (v: number) => void }) {
  return (
    <span className="inline-flex gap-0.5" aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(i)}
          className={cx(!onChange && "cursor-default")}
          aria-label={onChange ? `${i} star${i > 1 ? "s" : ""}` : undefined}
        >
          <Star size={size} className={i <= Math.round(value) ? "fill-marigold text-marigold" : "text-line"} />
        </button>
      ))}
    </span>
  );
}

export function Avatar({ name, size = 32 }: { name: string; size?: number }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("");
  const hue = [...name].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full text-[11px] font-bold text-white"
      style={{ width: size, height: size, background: `hsl(${hue} 45% 42%)` }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

/* Modal ------------------------------------------------------------------ */
export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center" onClick={onClose}>
      <div role="dialog" aria-modal aria-label={title} className="w-full max-w-lg rounded-2xl bg-surface shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} aria-label="Close" className="rounded p-1 text-ink-3 hover:bg-surface-2">
            <X size={18} />
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </div>
  );
}

/* Toasts ----------------------------------------------------------------- */
type ToastKind = "success" | "error" | "info";
const ToastCtx = createContext<(msg: string, kind?: ToastKind) => void>(() => {});
export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string; kind: ToastKind }[]>([]);
  const push = useCallback((msg: string, kind: ToastKind = "success") => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, msg, kind }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3600);
  }, []);
  return (
    <ToastCtx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[60] flex flex-col gap-2" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="pointer-events-auto flex items-center gap-2 rounded-lg bg-ink px-4 py-3 text-sm text-canvas shadow-lg">
            {t.kind === "success" ? <CheckCircle2 size={16} className="text-leaf" /> : t.kind === "error" ? <AlertTriangle size={16} className="text-hibiscus" /> : <Info size={16} />}
            {t.msg}
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
export const useToast = () => useContext(ToastCtx);
