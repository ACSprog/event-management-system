/**
 * EMS's own staff (the super admin side).
 *
 * Mirrors the organiser's team roles in src/lib/roles.ts: the platform owner
 * invites staff, gives each a role and can change what each role may do.
 * One difference: the settlement controls are fixed. Some permissions can only
 * belong to finance roles, and the second approval above the threshold always
 * belongs to the finance manager. Those cells are locked on the Staff and roles
 * page and enforced again by the API and the database.
 */

export type BuiltInPlatformRole = "owner" | "finance_manager" | "finance_officer" | "customer_success" | "support" | "moderator";
/** A built-in role key, or the key of a custom role ("custom_…"). */
export type PlatformRole = string;
export interface PlatformRoleInfo { key: PlatformRole; label: string; summary: string; person: string; custom?: boolean }

export type PlatformPermission =
  | "platform.view"
  | "orgs.view"
  | "orgs.approve"
  | "plans.manage"
  | "support.handle"
  | "settlements.view"
  | "settlements.review"
  | "settlements.approve"
  | "settlements.second"
  | "payouts.start"
  | "partnerships.manage"
  | "finance.settings"
  | "payments.manage"
  | "moderation.manage"
  | "templates.manage"
  | "settings.manage"
  | "health.view"
  | "audit.view"
  | "staff.manage";

export const platformPermissions: { key: PlatformPermission; label: string; group: string }[] = [
  { key: "platform.view", label: "See the platform overview and figures", group: "Overview" },
  { key: "orgs.view", label: "See organisations", group: "Customers" },
  { key: "orgs.approve", label: "Approve, verify and suspend organisations", group: "Customers" },
  { key: "plans.manage", label: "Change plans, packages, discounts and trials", group: "Customers" },
  { key: "support.handle", label: "Answer support tickets", group: "Customers" },
  { key: "settlements.view", label: "See settlements and statements", group: "Money" },
  { key: "settlements.review", label: "Review settlements, resolve disputes, add adjustments", group: "Money" },
  { key: "settlements.approve", label: "Approve settlements (within their limit)", group: "Money" },
  { key: "settlements.second", label: "Give the second approval above K50,000", group: "Money" },
  { key: "payouts.start", label: "Start payouts", group: "Money" },
  { key: "partnerships.manage", label: "Set up partnerships", group: "Money" },
  { key: "finance.settings", label: "Change finance settings (a second person confirms)", group: "Money" },
  { key: "payments.manage", label: "Payment providers and fees", group: "Platform" },
  { key: "moderation.manage", label: "Moderate reviews and photos", group: "Platform" },
  { key: "templates.manage", label: "Edit notification templates", group: "Platform" },
  { key: "settings.manage", label: "Change platform settings", group: "Platform" },
  { key: "health.view", label: "See system health", group: "Operations" },
  { key: "audit.view", label: "See the audit log and security", group: "Operations" },
  { key: "staff.manage", label: "Manage staff and roles", group: "Settings" },
];

const all = platformPermissions.map((p) => p.key);

export const platformRoles: Record<BuiltInPlatformRole, { label: string; summary: string; person: string; perms: PlatformPermission[] }> = {
  owner: {
    label: "Platform owner",
    summary: "Runs the platform and the staff. Can't approve settlements, so money always needs finance.",
    person: "Thandiwe Lungu",
    perms: all.filter((p) => !["settlements.approve", "settlements.second", "payouts.start"].includes(p)),
  },
  finance_manager: {
    label: "Finance manager",
    summary: "Approves any amount, gives second approvals, runs payouts and finance settings.",
    person: "Natasha Zulu",
    perms: ["platform.view", "orgs.view", "settlements.view", "settlements.review", "settlements.approve", "settlements.second", "payouts.start", "partnerships.manage", "finance.settings", "payments.manage", "audit.view"],
  },
  finance_officer: {
    label: "Finance officer",
    summary: "Reviews settlements, approves alone up to their limit and starts payouts.",
    person: "Bwalya Phiri",
    perms: ["platform.view", "orgs.view", "settlements.view", "settlements.review", "settlements.approve", "payouts.start"],
  },
  customer_success: {
    label: "Customer success",
    summary: "Brings organisers on board: approvals, verification, plans and trials.",
    person: "Chileshe Banda",
    perms: ["platform.view", "orgs.view", "orgs.approve", "plans.manage", "support.handle", "settlements.view"],
  },
  support: {
    label: "Support agent",
    summary: "Answers organisers and attendees. Can read statements to explain them.",
    person: "Ruth Mwanza",
    perms: ["orgs.view", "support.handle", "settlements.view"],
  },
  moderator: {
    label: "Moderator",
    summary: "Reviews and photos only.",
    person: "Kunda Siame",
    perms: ["moderation.manage"],
  },
};

export const platformRoleOrder: BuiltInPlatformRole[] = ["owner", "finance_manager", "finance_officer", "customer_success", "support", "moderator"];

const financeOnly: PlatformPermission[] = ["settlements.approve", "payouts.start"];

/**
 * Cells nobody can change. Returns the fixed value and why, or null if the
 * cell is editable.
 */
export const builtInPlatformRoleInfo: PlatformRoleInfo[] = platformRoleOrder.map((k) => ({ key: k, label: platformRoles[k].label, summary: platformRoles[k].summary, person: platformRoles[k].person }));

export function lockedCell(role: PlatformRole, perm: PlatformPermission): { on: boolean; why: string } | null {
  if (role.startsWith("custom_") && perm === "staff.manage") return { on: false, why: "Only the platform owner manages staff." };
  if (role === "owner" && perm === "staff.manage") return { on: true, why: "The platform owner always manages staff." };
  if (perm === "settlements.second") return { on: role === "finance_manager", why: "Second approvals above the threshold always come from the finance manager." };
  if (financeOnly.includes(perm) && role !== "finance_manager" && role !== "finance_officer") return { on: false, why: "Only finance roles can approve settlements or start payouts." };
  if (financeOnly.includes(perm) && role === "finance_manager") return { on: true, why: "The finance manager must always be able to approve and pay." };
  return null;
}

export const platformStaffList: { name: string; email: string; role: PlatformRole; limit: number | null; mfa: boolean; status: "Active" | "Invited"; lastActive: string }[] = [
  { name: "Thandiwe Lungu", email: "thandiwe@ems.example", role: "owner", limit: null, mfa: true, status: "Active", lastActive: "Now" },
  { name: "Natasha Zulu", email: "natasha@ems.example", role: "finance_manager", limit: null, mfa: true, status: "Active", lastActive: "8 min ago" },
  { name: "Bwalya Phiri", email: "bwalya@ems.example", role: "finance_officer", limit: 50_000, mfa: true, status: "Active", lastActive: "20 min ago" },
  { name: "Joseph Tembo", email: "joseph@ems.example", role: "finance_officer", limit: 50_000, mfa: true, status: "Active", lastActive: "1 h ago" },
  { name: "Chileshe Banda", email: "chileshe@ems.example", role: "customer_success", limit: null, mfa: true, status: "Active", lastActive: "Yesterday" },
  { name: "Ruth Mwanza", email: "ruth@ems.example", role: "support", limit: null, mfa: true, status: "Active", lastActive: "3 min ago" },
  { name: "Kunda Siame", email: "kunda@ems.example", role: "moderator", limit: null, mfa: false, status: "Active", lastActive: "2 days ago" },
  { name: "Mulenga Chanda", email: "mulenga@ems.example", role: "support", limit: null, mfa: false, status: "Invited", lastActive: "—" },
];
