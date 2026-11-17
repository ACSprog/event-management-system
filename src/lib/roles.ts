/**
 * Who can use the system.
 *
 * There are three kinds of user:
 *   1. Super admin   – the owners of the platform (/admin)
 *   2. Event organiser – an organisation's workspace (/org). Organisers invite
 *      their own people and give each one a team role below.
 *   3. Attendee      – anyone on the public site (/, /events, /account)
 *
 * Team roles only exist inside an organiser's workspace. The organisation admin
 * can change what each role is allowed to do on the Team page.
 * The NestJS API enforces the same permissions; hiding a menu is never the only check.
 *
 * No organiser role can approve a settlement or a payout. Those approvals belong
 * to EMS's own finance staff (super admin staff roles, see platformStaff).
 */

export type BuiltInRole = "admin" | "event_manager" | "finance" | "marketing" | "gate";
/** A built-in role key, or the key of a custom role the organisation created ("custom_…"). */
export type TeamRole = string;

export interface RoleInfo { key: TeamRole; label: string; summary: string; person: string; custom?: boolean }

export type Permission =
  | "events.view"
  | "events.edit"
  | "events.publish"
  | "tickets.manage"
  | "checkin.scan"
  | "refunds.issue"
  | "money.view"
  | "expenses.approve"
  | "settlements.review"
  | "payouts.account"
  | "audience.view"
  | "campaigns.send"
  | "reviews.reply"
  | "classes.manage"
  | "team.manage";

export const permissions: { key: Permission; label: string; group: string }[] = [
  { key: "events.view", label: "See events and attendee lists", group: "Events" },
  { key: "events.edit", label: "Create and edit events", group: "Events" },
  { key: "events.publish", label: "Publish events", group: "Events" },
  { key: "tickets.manage", label: "Set ticket types and prices", group: "Events" },
  { key: "checkin.scan", label: "Scan tickets at the gate", group: "Events" },
  { key: "classes.manage", label: "Run classes and courses", group: "Events" },
  { key: "audience.view", label: "See customers and reviews", group: "Audience" },
  { key: "reviews.reply", label: "Reply to reviews", group: "Audience" },
  { key: "campaigns.send", label: "Send campaigns and discount codes", group: "Audience" },
  { key: "money.view", label: "See sales, costs and reports", group: "Money" },
  { key: "refunds.issue", label: "Issue refunds", group: "Money" },
  { key: "expenses.approve", label: "Approve expenses and vendor bills", group: "Money" },
  { key: "settlements.review", label: "Accept or dispute settlement statements", group: "Money" },
  { key: "payouts.account", label: "Change the payout account", group: "Money" },
  { key: "team.manage", label: "Manage team, roles and settings", group: "Settings" },
];

export const teamRoles: Record<BuiltInRole, { label: string; summary: string; person: string; perms: Permission[] }> = {
  admin: {
    label: "Organisation admin",
    summary: "Full control of the workspace, including the team and money.",
    person: "Mwila Banda",
    perms: permissions.map((p) => p.key),
  },
  event_manager: {
    label: "Event manager",
    summary: "Builds and runs events. Cannot see the organisation's money or settings.",
    person: "Chanda Mulenga",
    perms: ["events.view", "events.edit", "tickets.manage", "checkin.scan", "classes.manage", "audience.view", "reviews.reply"],
  },
  finance: {
    label: "Finance officer",
    summary: "Sales, costs, refunds and settlement statements. Cannot change events or the payout account.",
    person: "Precious Nyirenda",
    perms: ["events.view", "money.view", "refunds.issue", "expenses.approve", "settlements.review"],
  },
  marketing: {
    label: "Marketing officer",
    summary: "Promotes events and looks after customers and reviews.",
    person: "Daliso Mbewe",
    perms: ["events.view", "audience.view", "reviews.reply", "campaigns.send"],
  },
  gate: {
    label: "Gate staff",
    summary: "Only the gate scanner, for the events and gates they are assigned to.",
    person: "Kelvin Sakala",
    perms: ["checkin.scan"],
  },
};

export const roleOrder: BuiltInRole[] = ["admin", "event_manager", "finance", "marketing", "gate"];

export const builtInRoleInfo: RoleInfo[] = roleOrder.map((k) => ({ key: k, label: teamRoles[k].label, summary: teamRoles[k].summary, person: teamRoles[k].person }));
