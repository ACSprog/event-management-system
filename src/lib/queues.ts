/**
 * Work queues for the dashboards.
 *
 * Every count on the super admin and organiser homes, and every sidebar badge,
 * comes from these functions, so the home page and the navigation can never
 * disagree. Each item lists the permission it needs; the home shows only the
 * items the signed-in role may act on. When the backend arrives this becomes
 * GET /v1/admin/queue and GET /v1/orgs/:orgId/queue.
 */
import { api, payable } from "@/lib/api";
import type { PlatformPermission } from "@/lib/platform-roles";
import type { Permission } from "@/lib/roles";
import { kwacha } from "@/lib/brand";

export type QueueTone = "urgent" | "problem" | "normal";

export interface QueueItem<P extends string> {
  key: string;
  count: number;
  title: string;
  detail?: string;
  href: string;
  action: string;
  tone: QueueTone;
  /** The role needs at least one of these. */
  need: P[];
}

/* Super admin ------------------------------------------------------------- */

export function adminQueue(): QueueItem<PlatformPermission>[] {
  const s = api.settlements.list();
  const by = (...st: string[]) => s.filter((x) => st.includes(x.status));
  const threshold = api.settlements.financeSettings().dualThreshold;
  const firstApproval = by("AWAITING_APPROVAL");
  const second = by("AWAITING_SECOND_APPROVAL");
  const broken = by("DISPUTED", "FAILED");
  const review = by("UNDER_FINANCE_REVIEW");
  const toPay = by("APPROVED");
  const cashouts = api.contributions.cashouts().filter((c) => c.status === "WAITING_FOR_FINANCE" || c.status === "AWAITING_SECOND_APPROVAL");
  const callbacks = api.dashboards.missingCallbacks();
  const changes = api.dashboards.pendingFinanceChanges();
  const orgs = api.orgs.list().filter((o) => o.status === "Pending");
  const support = api.platform.support().filter((t) => t.status !== "Resolved");
  const reviews = api.reviews.reported().filter((r) => r.status === "Needs decision");
  const photos = api.reviews.pendingPhotos();

  return [
    { key: "first", count: firstApproval.length, title: "Settlements waiting for approval", detail: firstApproval.map((x) => `${x.event} (${kwacha(payable(x))})`).join(", "), href: "/admin/settlements/", action: "Approve", tone: "urgent", need: ["settlements.approve"] },
    { key: "second", count: second.length, title: `Second approvals above ${kwacha(threshold)}`, detail: "Only a finance manager can give these, and not the first approver", href: "/admin/settlements/", action: "Review", tone: "urgent", need: ["settlements.second"] },
    { key: "review", count: review.length, title: "Settlements to check before approval", detail: "Organiser review is over; finance checks the statement", href: "/admin/settlements/", action: "Check", tone: "normal", need: ["settlements.review"] },
    { key: "pay", count: toPay.length, title: "Approved settlements waiting for payout", href: "/admin/settlements/", action: "Start payout", tone: "normal", need: ["payouts.start"] },
    { key: "broken", count: broken.length, title: "Disputes and failed payouts", detail: "A retry reuses the same settlement reference", href: "/admin/settlements/", action: "Resolve", tone: "problem", need: ["settlements.review"] },
    { key: "cashouts", count: cashouts.length, title: "Contribution cashouts above the automatic limit", detail: `${kwacha(cashouts.reduce((a, c) => a + c.amount, 0))} in total. Smaller ones were released automatically.`, href: "/admin/cashouts/", action: "Review", tone: "normal", need: ["settlements.approve"] },
    { key: "callbacks", count: callbacks.length, title: "Payments charged with no callback", detail: `${callbacks[0]?.provider ?? ""}. No tickets issued yet; checking the provider's status API.`, href: "/admin/payments/", action: "Check", tone: "problem", need: ["payments.manage", "settlements.review"] },
    { key: "changes", count: changes.length, title: "Finance setting changes to confirm", detail: changes.map((c) => `${c.what}, proposed by ${c.by}`).join("; "), href: "/admin/finance-settings/", action: "Confirm", tone: "normal", need: ["finance.settings"] },
    { key: "orgs", count: orgs.length, title: "Organisations waiting for approval", detail: orgs.map((o) => o.name).join(", "), href: "/admin/organisations/", action: "Verify", tone: "normal", need: ["orgs.approve"] },
    { key: "support", count: support.length, title: "Open support tickets", detail: `${support.filter((t) => t.priority === "High").length} high priority`, href: "/admin/support/", action: "Answer", tone: "normal", need: ["support.handle"] },
    { key: "moderation", count: reviews.length + photos.length, title: "Reviews and photos to moderate", detail: `${reviews.length} reported reviews, ${photos.length} photos`, href: "/admin/moderation/", action: "Moderate", tone: "normal", need: ["moderation.manage"] },
  ];
}

/** Sidebar badges: the sum of the visible queue items that point at each page. */
export function adminBadges(can: (p: PlatformPermission) => boolean): Record<string, string> {
  const out: Record<string, number> = {};
  for (const q of adminQueue()) if (q.count && q.need.some(can)) out[q.href] = (out[q.href] ?? 0) + q.count;
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, String(v)]));
}

/* Organiser --------------------------------------------------------------- */

export function orgQueue(orgId = "org1"): QueueItem<Permission>[] {
  const review = api.settlements.list(orgId).filter((s) => s.status === "ORGANISER_REVIEW");
  const refunds = api.refunds.requests(orgId).filter((r) => r.status === "Waiting");
  const expenses = api.finance.expenses().filter((e) => e.status === "Awaiting approval");
  const replies = api.reviews.forEvent().filter((r) => !r.reply);
  const questions = api.messages.threads(orgId).filter((t) => t.status === "New question");
  const disruption = api.dashboards.disruptionChoices();
  const acct = api.settlements.payoutAccount();
  const unverified = acct.checks.filter((c) => !c.ok);
  const tasks = api.dashboards.tasks().filter((t) => t.due === "Today");
  const chargebacks = api.refunds.chargebacks(orgId).filter((c) => c.status === "Send evidence");

  return [
    { key: "statement", count: review.length, title: "Settlement statement ready to review", detail: review.map((s) => `${s.event}: accept or dispute. No reply by the deadline counts as accepted.`).join(" "), href: review[0] ? `/org/finance/settlements/${review[0].ref}/` : "/org/finance/settlements/", action: "Review", tone: "urgent", need: ["settlements.review"] },
    { key: "chargebacks", count: chargebacks.length, title: "Card disputes needing evidence", detail: chargebacks.map((c) => `${c.event}, due ${c.due}`).join(", "), href: "/org/finance/refunds/", action: "Send evidence", tone: "problem", need: ["refunds.issue"] },
    { key: "refunds", count: refunds.length, title: "Refund requests waiting for an answer", href: "/org/finance/refunds/", action: "Answer", tone: "normal", need: ["refunds.issue"] },
    { key: "expenses", count: expenses.length, title: "Expenses awaiting approval", detail: expenses.map((e) => `${e.vendor} ${kwacha(e.amount)}`).join(", "), href: "/org/finance/expenses/", action: "Approve", tone: "normal", need: ["expenses.approve"] },
    { key: "payout", count: unverified.length, title: "Payout account checks incomplete", detail: unverified.map((c) => c.what).join(", "), href: "/org/finance/payouts/", action: "Fix", tone: "problem", need: ["payouts.account"] },
    { key: "disruption", count: disruption.waiting, title: `Buyers still choosing after the ${disruption.event} postponement`, detail: `Refund, keep the ticket for ${disruption.newDate}, or transfer. Deadline ${disruption.deadline}.`, href: "/org/events/", action: "Open", tone: "urgent", need: ["events.edit"] },
    { key: "help", count: api.assist.requests().filter((r) => r.status === "ESCALATED").length, title: "Help requests nobody has accepted", detail: "Waiting over 2 minutes at Lusaka Summer Jam. Assign someone.", href: "/org/events/lusaka-summer-jam-2026/", action: "Assign", tone: "problem", need: ["messages.send"] },
    { key: "tasks", count: tasks.length, title: "Event tasks due today", detail: tasks.map((t) => t.task).join(", "), href: "/org/events/", action: "Open", tone: "normal", need: ["events.edit"] },
    { key: "reviews", count: replies.length, title: "Reviews without a reply", href: "/org/reviews/", action: "Reply", tone: "normal", need: ["reviews.reply"] },
    { key: "questions", count: questions.length, title: "Buyer questions waiting", href: "/org/support/", action: "Answer", tone: "normal", need: ["audience.view"] },
  ];
}

/** Badges for the five organiser areas. */
export function orgBadges(can: (p: Permission) => boolean): Record<string, string> {
  const area = (href: string) => (href.startsWith("/org/finance") ? "/org/finance/" : href.startsWith("/org/events") ? "/org/events/" : href.startsWith("/org/reviews") || href.startsWith("/org/support") ? "/org/customers/" : href);
  const out: Record<string, number> = {};
  for (const q of orgQueue()) if (q.count && q.need.some(can)) out[area(q.href)] = (out[area(q.href)] ?? 0) + q.count;
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, String(v)]));
}

/** Badges for each organiser page in the grouped sidebar, keyed by the page's address. */
export function orgPageBadges(can: (p: Permission) => boolean, pages: string[]): Record<string, string> {
  const out: Record<string, number> = {};
  for (const q of orgQueue()) {
    if (!q.count || !q.need.some(can)) continue;
    // Attach each item to the most specific sidebar page its link sits under.
    const page = pages.filter((p) => q.href.startsWith(p)).sort((a, b) => b.length - a.length)[0];
    if (page) out[page] = (out[page] ?? 0) + q.count;
  }
  return Object.fromEntries(Object.entries(out).map(([k, v]) => [k, String(v)]));
}
