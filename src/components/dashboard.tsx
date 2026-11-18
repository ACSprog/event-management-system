"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Badge, Card, cx, SectionTitle } from "@/components/ui";
import type { QueueItem } from "@/lib/queues";

/**
 * Building blocks shared by the three homes (super admin, organiser, attendee).
 * All three use the same order:
 *   key figures → needs your attention → right now → money and status →
 *   trends and lists → recent activity.
 */

export function DashRow({ children, wide = false }: { children: ReactNode; wide?: boolean }) {
  return <div className={cx("mt-6 grid gap-6", wide ? "" : "xl:grid-cols-[1.5fr_1fr]")}>{children}</div>;
}

const toneBg = { urgent: "bg-marigold-soft", problem: "bg-hibiscus-soft", normal: "bg-surface-2" } as const;

/** "Needs your attention": only items with a count, only for the roles that may act on them. */
export function AttentionQueue<P extends string>({ items, can, title = "Needs your attention" }: { items: QueueItem<P>[]; can: (p: P) => boolean; title?: string }) {
  const visible = items.filter((i) => i.count > 0 && i.need.some(can));
  const total = visible.reduce((a, i) => a + i.count, 0);
  return (
    <Card>
      <SectionTitle title={title} action={<span className="text-sm text-ink-3">{total} {total === 1 ? "item" : "items"}</span>} />
      {visible.length === 0 ? (
        <p className="flex items-center gap-2 text-sm text-ink-3"><CheckCircle2 size={16} className="text-leaf" /> Nothing waiting. You&rsquo;re up to date.</p>
      ) : (
        <ul className="space-y-2">
          {visible.map((i) => (
            <li key={i.key}>
              <Link href={i.href} className={cx("flex items-start gap-3 rounded-lg p-3 hover:ring-1 hover:ring-line", toneBg[i.tone])}>
                <span className="flex h-7 min-w-7 items-center justify-center rounded-md bg-surface px-1.5 text-sm font-bold tabular-nums">{i.count}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-semibold">{i.title}</span>
                  {i.detail && <span className="block text-xs text-ink-3">{i.detail}</span>}
                </span>
                <span className="flex shrink-0 items-center gap-1 self-center text-[13px] font-semibold text-kafue">{i.action} <ArrowRight size={13} /></span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

/** "Right now": a short list of live figures. Highlighted when something is live. */
export function LivePanel({ title = "Right now", rows, live = false, footer }: { title?: string; rows: readonly (readonly [string, ReactNode])[]; live?: boolean; footer?: ReactNode }) {
  return (
    <Card className={cx(live && "border-kafue ring-1 ring-kafue")}>
      <SectionTitle title={title} action={live ? <Badge tone="green"><span className="h-2 w-2 animate-pulse rounded-full bg-leaf motion-reduce:animate-none" /> Live</Badge> : undefined} />
      <KeyList rows={rows} />
      {footer && <div className="mt-4 flex flex-wrap gap-2">{footer}</div>}
    </Card>
  );
}

export function KeyList({ rows }: { rows: readonly (readonly [ReactNode, ReactNode])[] }) {
  return (
    <ul className="divide-y divide-line text-sm">
      {rows.map(([k, v], i) => (
        <li key={i} className="flex items-start justify-between gap-4 py-2.5">
          <span className="min-w-0">{k}</span>
          <span className="text-right font-semibold tabular-nums">{v}</span>
        </li>
      ))}
    </ul>
  );
}

/** Payment and messaging providers, with what a slowdown means for buyers. */
export function StatusStrip({ items, explain = false }: { items: { name: string; state: "ok" | "slow" | "down"; note: string; buyerImpact?: string }[]; explain?: boolean }) {
  const tone = { ok: "green", slow: "gold", down: "red" } as const;
  const problems = items.filter((i) => i.state !== "ok" && i.buyerImpact);
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {items.map((i) => <Badge key={i.name} tone={tone[i.state]}>{i.name}: {i.note}</Badge>)}
      </div>
      {explain && problems.map((p) => <p key={p.name} className="mt-3 text-sm text-ink-2">{p.buyerImpact}</p>)}
    </div>
  );
}

export function ActivityFeed({ title = "Recent activity", rows, href }: { title?: string; rows: { what: string; at: string }[]; href?: string }) {
  return (
    <Card>
      <SectionTitle title={title} action={href ? <Link href={href} className="text-sm font-semibold text-kafue">All activity</Link> : undefined} />
      <ol className="space-y-3 border-l-2 border-line pl-4 text-sm">
        {rows.map((r, i) => (
          <li key={i} className="relative">
            <span className="absolute -left-[21px] top-1.5 h-2.5 w-2.5 rounded-full bg-kafue" />
            <p>{r.what}</p>
            <p className="text-xs text-ink-3">{r.at}</p>
          </li>
        ))}
      </ol>
    </Card>
  );
}
