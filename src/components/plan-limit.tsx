import { Gauge } from "lucide-react";
import { Button, cx } from "@/components/ui";

/**
 * Shown when an organisation reaches something its plan, licence or add-ons
 * limit. The entitlement service in the API makes the actual decision; this
 * only explains it. Never shown on the gate scanner: check-in is never blocked.
 */
export function PlanLimit({ title, body, action = "See plans and add-ons", href = "/org/settings/billing/", className }: { title: string; body: string; action?: string; href?: string; className?: string }) {
  return (
    <div className={cx("flex flex-wrap items-center gap-3 rounded-xl border border-marigold/50 bg-marigold-soft px-4 py-3", className)} role="status">
      <Gauge size={18} className="shrink-0 text-[#a35f00] dark:text-marigold" />
      <div className="min-w-0 flex-1 text-sm">
        <p className="font-semibold">{title}</p>
        <p className="text-ink-2">{body}</p>
      </div>
      <Button size="sm" variant="secondary" href={href}>{action}</Button>
    </div>
  );
}
