// DEMO DATA ONLY. Commercial model, plans, licences, settlements and partnerships.
// Follows claude/licensing-payments-settlement-spec.md. Prices are placeholders
// until the cost model sets them. Replaced by the billing, licensing,
// settlements and partnerships API modules.

import { addBusinessDays } from "@/lib/business-days";
import { events, gross, sold } from "./data";

/** The showcase's "today". Countdowns are worked out from this date. */
export const DEMO_TODAY = "2026-11-17";

/* ------------------------------------------------------------------ */
/* Commercial arrangements                                             */
/* ------------------------------------------------------------------ */

export type Arrangement = "FREE_EVENT" | "TICKET_FEE" | "EVENT_LICENCE" | "SUBSCRIPTION" | "ENTERPRISE" | "PARTNERSHIP";
export type Collection = "CENTRAL" | "DIRECT";
export type FeePayer = "ORGANISER_ABSORBS" | "BUYER_PAYS";

export const arrangementLabel: Record<Arrangement, string> = {
  FREE_EVENT: "Free event",
  TICKET_FEE: "Fee per ticket",
  EVENT_LICENCE: "One-off event licence",
  SUBSCRIPTION: "Covered by subscription",
  ENTERPRISE: "Enterprise contract",
  PARTNERSHIP: "Revenue-share partnership",
};
export const collectionLabel: Record<Collection, string> = {
  CENTRAL: "Collected by EMS, paid out after the event",
  DIRECT: "Paid straight into the organiser's own account",
};
export const feePayerLabel: Record<FeePayer, string> = {
  ORGANISER_ABSORBS: "Organiser absorbs the fee",
  BUYER_PAYS: "Buyer pays a booking fee",
};

/* ------------------------------------------------------------------ */
/* Plans, licences, add-ons                                            */
/* ------------------------------------------------------------------ */

export type PlanKey = "Free" | "Starter" | "Professional" | "Enterprise";

export interface Plan {
  key: PlanKey;
  monthly: number | null;
  annual: number | null;
  feePct: number | null;
  feeFixed: number | null;
  team: number | null;
  orgs: number;
  blurb: string;
}

export const planCatalog: Plan[] = [
  { key: "Free", monthly: 0, annual: 0, feePct: 5, feeFixed: 3, team: 2, orgs: 389, blurb: "Sell as many tickets as you like. Pay only when you sell." },
  { key: "Starter", monthly: 450, annual: 4_500, feePct: 4, feeFixed: 2, team: 5, orgs: 96, blurb: "For organisers running events most months." },
  { key: "Professional", monthly: 1_450, annual: 14_500, feePct: 3, feeFixed: 2, team: 15, orgs: 64, blurb: "All tools, lowest standard fees, bigger teams." },
  { key: "Enterprise", monthly: null, annual: null, feePct: null, feeFixed: null, team: null, orgs: 22, blurb: "Branches, contract pricing and dedicated support." },
];

export const feeText = (p: Plan) => (p.feePct === null ? "Negotiated" : `${p.feePct}% + K${p.feeFixed} per paid ticket`);
export const planFee = (key: PlanKey, price: number) => {
  const p = planCatalog.find((x) => x.key === key)!;
  if (!price || p.feePct === null) return 0;
  return Math.round((price * p.feePct) / 100 + p.feeFixed!);
};

/** Features by plan: Free, Starter, Professional, Enterprise. */
export const planFeatures: [string, boolean, boolean, boolean, boolean][] = [
  ["Unlimited events, ticket sales and attendees", true, true, true, true],
  ["Ticketing, QR tickets and gate scanner", true, true, true, true],
  ["Basic sales and attendance reports", true, true, true, true],
  ["Customers and CRM", false, true, true, true],
  ["Campaigns: SMS, email and WhatsApp", false, true, true, true],
  ["Invoices, budgets and expenses", false, true, true, true],
  ["Reserved seating and table plans", false, true, true, true],
  ["Classes, membership and fundraising", false, false, true, true],
  ["Advanced reports and integrations", false, false, true, true],
  ["API access", false, false, true, true],
  ["Branches with separate reports", false, false, false, true],
  ["Dedicated support and contract terms", false, false, false, true],
];

export const licencePackages = [
  { key: "Basic", guests: 100, price: 750, sold: 41, features: ["Event page and RSVP", "QR invitations", "Guest check-in"] },
  { key: "Standard", guests: 300, price: 1_800, sold: 67, features: ["Everything in Basic", "Seating plan", "SMS invitations (300 credits)", "Vendors"] },
  { key: "Premium", guests: 1_000, price: 4_500, sold: 23, features: ["Everything in Standard", "Several functions under one licence", "Custom branding", "Full reports"] },
];
export const licenceAccess = { fullDays: 90, readOnlyMonths: 12, cancelFeePct: 10, creditWindowDays: 60 };

export const addOns = [
  { name: "SMS credits", unit: "1,000 messages", price: 350 },
  { name: "Extra team member", unit: "per person a month", price: 60 },
];

export const discounts = [
  { code: "FOUNDING2027", what: "Founding Customer: 50% off the first year", used: 14, max: 20, ends: "2027-03-31" },
  { code: "ANNUAL", what: "Pay yearly: 2 months free", used: 58, max: null as number | null, ends: "—" },
];

export const trials = [
  { org: "Hope Children's Foundation", plan: "Professional", started: "2026-10-28", ends: "2026-11-11", status: "Ended, on Free plan", sales: 94_500 },
  { org: "Laugh Out Lusaka", plan: "Professional", started: "2026-11-12", ends: "2026-11-26", status: "Day 6 of 14", sales: 0 },
  { org: "Kabwe Gospel Choirs", plan: "Professional", started: "2026-11-03", ends: "2026-11-17", status: "Ends today", sales: 12_400 },
  { org: "Solwezi Business Expo", plan: "Professional", started: "2026-10-20", ends: "2026-11-03", status: "Converted to Starter", sales: 48_000 },
];
export const trialConversion = { last90Days: 31, started: 42, converted: 13 };

export const eventLicences = [
  { id: "LIC-0213", event: "Natasha & Brian's Wedding", holder: "Brian Chileshe", pkg: "Premium", guests: 812, limit: 1_000, date: "2026-12-05", status: "Active" },
  { id: "LIC-0219", event: "Mutale's Kitchen Party", holder: "Esther Mutale", pkg: "Basic", guests: 0, limit: 100, date: "2026-12-12", status: "Pending payment" },
  { id: "LIC-0188", event: "Mr & Mrs Phiri: 25 years", holder: "Joseph Phiri", pkg: "Standard", guests: 318, limit: 300, date: "2026-08-22", status: "Read-only", note: "18 guests over the limit, invoiced K108" },
  { id: "LIC-0204", event: "Kalaba Family Reunion", holder: "Grace Kalaba", pkg: "Standard", guests: 140, limit: 300, date: "2026-11-28", status: "Active" },
];

/* ------------------------------------------------------------------ */
/* The demo organisation's subscription                                */
/* ------------------------------------------------------------------ */

export const orgSubscription = {
  plan: "Professional" as PlanKey,
  period: "Annual",
  price: 14_500,
  renews: "2027-03-14",
  payBy: "Visa ending 4417, renews automatically",
  status: "Active",
  usage: [
    { label: "Team members", used: 6, limit: 15 },
    { label: "SMS credits left", used: 1_240, limit: 10_000, low: true },
    { label: "Events this year", used: 48, limit: null as number | null },
    { label: "Tickets sold this year", used: 61_870, limit: null as number | null },
  ],
  invoices: [
    { ref: "EMS-INV-2026-0314", date: "2026-03-14", what: "Professional plan, annual", amount: 14_500, status: "Paid" },
    { ref: "EMS-INV-2026-0611", date: "2026-06-11", what: "SMS credits, 10,000", amount: 3_500, status: "Paid" },
    { ref: "EMS-INV-2026-0902", date: "2026-09-02", what: "Extra team members (2), September to March", amount: 840, status: "Paid" },
  ],
};

/* ------------------------------------------------------------------ */
/* Commercial terms per event (frozen when the event is published)     */
/* ------------------------------------------------------------------ */

export interface EventTerms {
  arrangement: Arrangement;
  collection: Collection;
  feePayer: FeePayer;
  listing: "Public" | "Unlisted";
  fee: string;
  settlementRef?: string;
  frozen: boolean;
}

const sub = (feePayer: FeePayer, settlementRef?: string, frozen = true): EventTerms => ({ arrangement: "SUBSCRIPTION", collection: "CENTRAL", feePayer, listing: "Public", fee: "3% + K2 per paid ticket (Professional plan)", settlementRef, frozen });

export const eventTerms: Record<string, EventTerms> = {
  e1: sub("ORGANISER_ABSORBS", "ST-ZL-0440"),
  e7: sub("BUYER_PAYS"),
  e11: sub("ORGANISER_ABSORBS", undefined, false),
  e12: sub("ORGANISER_ABSORBS", "ST-ZL-0418"),
  e13: sub("ORGANISER_ABSORBS", undefined, false),
  e14: sub("BUYER_PAYS"),
  e15: { ...sub("ORGANISER_ABSORBS", "ST-ZL-0207"), arrangement: "PARTNERSHIP", fee: "EMS 15% of ticket sales after refunds and charges (agreement PA-2025-004)" },
  e4: { arrangement: "PARTNERSHIP", collection: "CENTRAL", feePayer: "BUYER_PAYS", listing: "Public", fee: "EMS 20% (agreement PA-2026-011)", frozen: true },
  e10: { arrangement: "SUBSCRIPTION", collection: "CENTRAL", feePayer: "ORGANISER_ABSORBS", listing: "Unlisted", fee: "Starter plan", frozen: true },
};
export const termsFor = (id: string): EventTerms => eventTerms[id] ?? sub("ORGANISER_ABSORBS");

/** Booking fee added at checkout when the buyer pays it. */
export const bookingFee = (price: number) => (price ? Math.round(price * 0.03 + 2) : 0);

/* ------------------------------------------------------------------ */
/* Finance settings and calendar                                       */
/* ------------------------------------------------------------------ */

export const holidays = [
  { date: "2026-10-18", name: "National Day of Prayer" },
  { date: "2026-10-19", name: "National Day of Prayer (observed)" },
  { date: "2026-10-24", name: "Independence Day" },
  { date: "2026-12-25", name: "Christmas Day" },
  { date: "2027-01-01", name: "New Year's Day" },
  { date: "2027-03-08", name: "International Women's Day" },
  { date: "2027-03-12", name: "Youth Day" },
  { date: "2027-03-26", name: "Good Friday" },
  { date: "2027-03-27", name: "Holy Saturday" },
  { date: "2027-03-29", name: "Easter Monday" },
  { date: "2027-04-28", name: "Kenneth Kaunda Day" },
  { date: "2027-05-01", name: "Labour Day" },
  { date: "2027-05-25", name: "Africa Freedom Day" },
  { date: "2027-07-05", name: "Heroes' Day" },
  { date: "2027-07-06", name: "Unity Day" },
  { date: "2027-08-02", name: "Farmers' Day" },
];
export const holidayDates = holidays.map((h) => h.date);

export const financeSettings = {
  reconcileDays: 3,
  reviewDays: 2,
  payoutDays: 2,
  dualThreshold: 50_000,
  accountChangeWaitHours: 48,
  materialDiscrepancy: "Any unmatched amount over K100 or 0.5% of sales",
  chargebackRecovery: "Next settlement, then invoice",
  graceDays: 14,
};

export type StaffRole = "Platform owner" | "Platform finance officer" | "Platform finance manager" | "Support agent" | "Moderator";
export const platformStaff: { name: string; role: StaffRole; limit: number | null; mfa: boolean }[] = [
  { name: "Thandiwe Lungu", role: "Platform owner", limit: null, mfa: true },
  { name: "Natasha Zulu", role: "Platform finance manager", limit: null, mfa: true },
  { name: "Bwalya Phiri", role: "Platform finance officer", limit: 50_000, mfa: true },
  { name: "Joseph Tembo", role: "Platform finance officer", limit: 50_000, mfa: true },
  { name: "Ruth Mwanza", role: "Support agent", limit: 0, mfa: true },
  { name: "Kunda Siame", role: "Moderator", limit: 0, mfa: false },
];
export const staffRoleCan: Record<StaffRole, string[]> = {
  "Platform owner": ["Everything except approving settlements", "Change finance settings with a second person"],
  "Platform finance manager": ["Review and adjust settlements", "Approve any amount", "Give the second approval above the threshold", "Start payouts", "Correct settled statements as adjustments"],
  "Platform finance officer": ["Review settlements", "Approve alone up to their limit", "Give the first of two approvals above it", "Start payouts"],
  "Support agent": ["See statements to answer organisers", "No approvals"],
  Moderator: ["Reviews and photos only"],
};

/* ------------------------------------------------------------------ */
/* Settlements                                                         */
/* ------------------------------------------------------------------ */

export type SettlementStatus =
  | "AWAITING_EVENT_COMPLETION"
  | "RECONCILIATION_PENDING"
  | "ORGANISER_REVIEW"
  | "UNDER_FINANCE_REVIEW"
  | "DISPUTED"
  | "AWAITING_APPROVAL"
  | "AWAITING_SECOND_APPROVAL"
  | "APPROVED"
  | "PAYOUT_PROCESSING"
  | "SETTLED"
  | "FAILED"
  | "CANCELLED";

export const settlementStatus: Record<SettlementStatus, { label: string; tone: "teal" | "gold" | "red" | "green" | "grey"; who: string }> = {
  AWAITING_EVENT_COMPLETION: { label: "Event not finished", tone: "grey", who: "Money is held until the event ends" },
  RECONCILIATION_PENDING: { label: "Reconciling", tone: "teal", who: "EMS is checking every payment, refund and charge" },
  ORGANISER_REVIEW: { label: "Check your statement", tone: "gold", who: "Organiser accepts or raises a dispute" },
  UNDER_FINANCE_REVIEW: { label: "Finance review", tone: "teal", who: "EMS finance is checking the statement" },
  DISPUTED: { label: "Disputed", tone: "red", who: "EMS finance is resolving a dispute" },
  AWAITING_APPROVAL: { label: "Awaiting approval", tone: "gold", who: "An EMS finance officer approves" },
  AWAITING_SECOND_APPROVAL: { label: "Second approval", tone: "gold", who: "A second EMS approver is needed" },
  APPROVED: { label: "Approved", tone: "teal", who: "Payout is about to start" },
  PAYOUT_PROCESSING: { label: "Paying out", tone: "teal", who: "Waiting for the provider to confirm" },
  SETTLED: { label: "Paid", tone: "green", who: "Paid and confirmed" },
  FAILED: { label: "Payout failed", tone: "red", who: "EMS finance is investigating" },
  CANCELLED: { label: "Cancelled", tone: "grey", who: "Event cancelled, buyers refunded" },
};

/** Steps shown on the settlement timeline. */
export const settlementSteps: { key: SettlementStatus[]; label: string }[] = [
  { key: ["AWAITING_EVENT_COMPLETION"], label: "Event ends" },
  { key: ["RECONCILIATION_PENDING"], label: "Reconciliation" },
  { key: ["ORGANISER_REVIEW", "DISPUTED"], label: "Organiser checks" },
  { key: ["UNDER_FINANCE_REVIEW", "AWAITING_APPROVAL", "AWAITING_SECOND_APPROVAL"], label: "EMS approval" },
  { key: ["APPROVED", "PAYOUT_PROCESSING", "FAILED"], label: "Payout" },
  { key: ["SETTLED"], label: "Paid" },
];

export interface Settlement {
  ref: string;
  orgId: string;
  orgName: string;
  event: string;
  eventSlug?: string;
  ended: string;
  arrangement: Arrangement;
  feeLabel: string;
  sharePct?: number;
  agreement?: string;
  status: SettlementStatus;
  tickets: number;
  gross: number;
  refunds: number;
  chargebacks: number;
  providerCharges: number;
  bookingFees: number;
  deductions: { label: string; amount: number }[];
  downPayment?: number;
  emsFee: number;
  payTo: string;
  approvals: { by: string; role: StaffRole; at: string }[];
  hold?: string;
  dispute?: { line: string; amount: number; reason: string; by: string; at: string; status: "Open" | "Resolved" };
  adjustments?: { amount: number; reason: string; by: string; at: string }[];
  payout?: { ref: string; at?: string; providerRef?: string; error?: string };
  history: { at: string; what: string; who: string }[];
}

/** EMS's share or fee, worked out from the terms. */
function emsFeeFor(s: Omit<Settlement, "emsFee">) {
  if (s.arrangement === "PARTNERSHIP") return Math.round(((s.gross - s.refunds - s.providerCharges) * (s.sharePct ?? 0)) / 100);
  const pct = s.feeLabel.startsWith("4%") ? 4 : s.feeLabel.startsWith("5%") ? 5 : 3;
  const fixed = s.feeLabel.includes("K3") ? 3 : 2;
  return Math.round((s.gross - s.refunds) * (pct / 100) + s.tickets * fixed);
}

const S = (s: Omit<Settlement, "emsFee">): Settlement => ({ ...s, emsFee: emsFeeFor(s) });

export const deadlines = (ended: string) => {
  const reconcile = addBusinessDays(ended, financeSettings.reconcileDays, holidayDates);
  const review = addBusinessDays(reconcile, financeSettings.reviewDays, holidayDates);
  const payout = addBusinessDays(review, financeSettings.payoutDays, holidayDates);
  return { reconcile, review, payout };
};

export const payable = (s: Settlement) =>
  s.gross - s.refunds - s.chargebacks - s.providerCharges - s.emsFee - s.deductions.reduce((a, d) => a + d.amount, 0) + (s.downPayment ?? 0) + (s.adjustments ?? []).reduce((a, d) => a + d.amount, 0);

export const heldAmount = (s: Settlement) => (s.dispute?.status === "Open" ? s.dispute.amount : 0);

/** Statement lines in the order they are shown. Negative amounts are deductions. */
export function statementLines(s: Settlement) {
  const lines: { label: string; amount: number; note?: string; key: string }[] = [
    { key: "gross", label: `Ticket sales (${s.tickets.toLocaleString()} paid tickets)`, amount: s.gross },
    { key: "refunds", label: "Refunds to buyers", amount: -s.refunds },
  ];
  if (s.chargebacks) lines.push({ key: "chargebacks", label: "Card chargebacks", amount: -s.chargebacks });
  lines.push({ key: "charges", label: "Payment provider charges", amount: -s.providerCharges, note: "MTN, Airtel, Zamtel and card fees, passed on at cost" });
  s.deductions.forEach((d, i) => lines.push({ key: `ded${i}`, label: d.label, amount: -d.amount, note: "Listed in the agreement and approved" }));
  lines.push({
    key: "ems",
    label: s.arrangement === "PARTNERSHIP" ? `EMS share (${s.sharePct}% of sales after refunds and charges)` : `EMS fee (${s.feeLabel})`,
    amount: -s.emsFee,
  });
  if (s.downPayment) lines.push({ key: "down", label: "Down payment already paid to EMS", amount: s.downPayment, note: "Counted towards EMS's share" });
  (s.adjustments ?? []).forEach((a, i) => lines.push({ key: `adj${i}`, label: `Adjustment: ${a.reason}`, amount: a.amount, note: `${a.by}, ${a.at}` }));
  return lines;
}

const e1 = events.find((e) => e.id === "e1")!;

export const settlements: Settlement[] = [
  S({
    ref: "ST-ZL-0440", orgId: "org1", orgName: "Zed Live Entertainment", event: "Lusaka Summer Jam", eventSlug: "lusaka-summer-jam-2026", ended: "2026-12-13",
    arrangement: "SUBSCRIPTION", feeLabel: "3% + K2 per paid ticket", status: "AWAITING_EVENT_COMPLETION",
    tickets: sold(e1), gross: gross(e1), refunds: 9_500, chargebacks: 0, providerCharges: Math.round(gross(e1) * 0.018), bookingFees: 0, deductions: [],
    payTo: "MTN MoMo business wallet ****0081", approvals: [],
    history: [{ at: "2026-09-01", what: "Ticket sales opened", who: "Chanda Mulenga" }],
  }),
  S({
    ref: "ST-ZL-0433", orgId: "org1", orgName: "Zed Live Entertainment", event: "Zed Live Sessions: November", ended: "2026-11-14",
    arrangement: "SUBSCRIPTION", feeLabel: "3% + K2 per paid ticket", status: "RECONCILIATION_PENDING",
    tickets: 1_164, gross: 1_018_200, refunds: 6_000, chargebacks: 0, providerCharges: 18_330, bookingFees: 0, deductions: [],
    payTo: "MTN MoMo business wallet ****0081", approvals: [],
    history: [{ at: "2026-11-14", what: "Event completed automatically at 23:30", who: "System" }, { at: "2026-11-16", what: "Reconciliation started: 1,164 payments, 4 refunds", who: "System" }],
  }),
  S({
    ref: "ST-ZL-0431", orgId: "org1", orgName: "Zed Live Entertainment", event: "Copperbelt Nights: Ndola", ended: "2026-11-10",
    arrangement: "SUBSCRIPTION", feeLabel: "3% + K2 per paid ticket", status: "ORGANISER_REVIEW",
    tickets: 2_310, gross: 1_386_000, refunds: 14_400, chargebacks: 1_200, providerCharges: 24_950, bookingFees: 0, deductions: [],
    payTo: "MTN MoMo business wallet ****0081", approvals: [],
    history: [
      { at: "2026-11-10", what: "Event completed automatically at 23:59", who: "System" },
      { at: "2026-11-11", what: "Event completion confirmed", who: "Chanda Mulenga" },
      { at: "2026-11-13", what: "Reconciliation finished, statement issued", who: "System" },
    ],
  }),
  S({
    ref: "ST-ZL-0426", orgId: "org1", orgName: "Zed Live Entertainment", event: "Livingstone Jazz Weekend", ended: "2026-10-31",
    arrangement: "SUBSCRIPTION", feeLabel: "3% + K2 per paid ticket", status: "DISPUTED",
    tickets: 640, gross: 512_000, refunds: 22_400, chargebacks: 0, providerCharges: 9_220, bookingFees: 0, deductions: [],
    payTo: "MTN MoMo business wallet ****0081", approvals: [],
    dispute: { line: "Refunds to buyers", amount: 8_400, reason: "14 refunds were for the cancelled VIP shuttle, which we refunded ourselves in cash at the venue. They should not be deducted twice.", by: "Precious Nyirenda", at: "2026-11-06", status: "Open" },
    history: [
      { at: "2026-10-31", what: "Event completed automatically", who: "System" },
      { at: "2026-11-04", what: "Statement issued", who: "System" },
      { at: "2026-11-06", what: "Dispute raised on refunds (K8,400)", who: "Precious Nyirenda" },
      { at: "2026-11-09", what: "Asked for the cash refund receipts", who: "Bwalya Phiri (EMS finance)" },
    ],
  }),
  S({
    ref: "ST-ZL-0418", orgId: "org1", orgName: "Zed Live Entertainment", event: "Zed Live Sessions: October", eventSlug: "zed-live-sessions-oct", ended: "2026-10-24",
    arrangement: "SUBSCRIPTION", feeLabel: "3% + K2 per paid ticket", status: "SETTLED",
    tickets: 1_189, gross: 1_041_000, refunds: 12_500, chargebacks: 0, providerCharges: 18_740, bookingFees: 0, deductions: [],
    payTo: "MTN MoMo business wallet ****0081", approvals: [{ by: "Natasha Zulu", role: "Platform finance manager", at: "2026-10-30" }, { by: "Bwalya Phiri", role: "Platform finance officer", at: "2026-10-30" }],
    payout: { ref: "PO-ZL-0412", at: "2026-11-02", providerRef: "MTN-7731-0029-4471" },
    history: [
      { at: "2026-10-24", what: "Event completed automatically", who: "System" },
      { at: "2026-10-28", what: "Statement issued", who: "System" },
      { at: "2026-10-29", what: "Statement accepted", who: "Precious Nyirenda" },
      { at: "2026-10-30", what: "Approved (1 of 2)", who: "Bwalya Phiri" },
      { at: "2026-10-30", what: "Approved (2 of 2)", who: "Natasha Zulu" },
      { at: "2026-11-02", what: "Paid and confirmed by MTN", who: "System" },
    ],
  }),
  S({
    ref: "ST-ZL-0207", orgId: "org1", orgName: "Zed Live Entertainment", event: "Lusaka July Fest 2025", eventSlug: "lusaka-july-fest-2025", ended: "2025-07-20",
    arrangement: "PARTNERSHIP", feeLabel: "", sharePct: 15, agreement: "PA-2025-004", status: "SETTLED",
    tickets: 9_870, gross: 4_610_300 + 980_000, refunds: 61_500, chargebacks: 3_000, providerCharges: 98_400, bookingFees: 0, deductions: [{ label: "Stage and sound hire (agreed)", amount: 180_000 }], downPayment: 100_000,
    payTo: "Zanaco ****2290", approvals: [{ by: "Bwalya Phiri", role: "Platform finance officer", at: "2025-07-28" }, { by: "Natasha Zulu", role: "Platform finance manager", at: "2025-07-28" }],
    payout: { ref: "PO-ZL-0388", at: "2025-07-30", providerRef: "ZANACO-RTGS-552190" },
    history: [{ at: "2025-07-30", what: "Paid and confirmed by Zanaco", who: "System" }],
  }),
  S({
    ref: "ST-CB-0112", orgId: "org2", orgName: "Copperbelt Business Forum", event: "Executive Breakfast: November", ended: "2026-11-06",
    arrangement: "SUBSCRIPTION", feeLabel: "4% + K2 per paid ticket", status: "AWAITING_APPROVAL",
    tickets: 118, gross: 41_300, refunds: 700, chargebacks: 0, providerCharges: 740, bookingFees: 0, deductions: [],
    payTo: "Stanbic ****8820", approvals: [],
    history: [{ at: "2026-11-11", what: "Statement issued", who: "System" }, { at: "2026-11-12", what: "Statement accepted", who: "Mutinta Hamoonga" }, { at: "2026-11-13", what: "Finance review finished, no discrepancies", who: "Joseph Tembo" }],
  }),
  S({
    ref: "ST-CS-0057", orgId: "org5", orgName: "Chipolopolo Sports Events", event: "Ndola Half Marathon", ended: "2026-11-07",
    arrangement: "PARTNERSHIP", feeLabel: "", sharePct: 20, agreement: "PA-2026-011", status: "AWAITING_SECOND_APPROVAL",
    tickets: 3_420, gross: 684_000, refunds: 9_000, chargebacks: 0, providerCharges: 12_310, bookingFees: 15_380, deductions: [{ label: "Medals and race bibs (agreed)", amount: 41_000 }], downPayment: 25_000,
    payTo: "Airtel Money business wallet ****5512", approvals: [{ by: "Bwalya Phiri", role: "Platform finance officer", at: "2026-11-16" }],
    history: [{ at: "2026-11-12", what: "Statement issued", who: "System" }, { at: "2026-11-13", what: "Statement accepted", who: "Mwansa Kapata" }, { at: "2026-11-16", what: "Approved (1 of 2). Over K50,000, second approval needed", who: "Bwalya Phiri" }],
  }),
  S({
    ref: "ST-GC-0204", orgId: "org3", orgName: "Grace Chapel International", event: "Youth Camp 2026", ended: "2026-11-12",
    arrangement: "SUBSCRIPTION", feeLabel: "4% + K2 per paid ticket", status: "UNDER_FINANCE_REVIEW",
    tickets: 860, gross: 129_000, refunds: 1_500, chargebacks: 0, providerCharges: 2_320, bookingFees: 0, deductions: [],
    payTo: "Zanaco ****0417", approvals: [],
    history: [{ at: "2026-11-17", what: "Statement issued", who: "System" }, { at: "2026-11-17", what: "Statement accepted", who: "Pastor Mumba" }],
  }),
  S({
    ref: "ST-HF-0009", orgId: "org6", orgName: "Hope Children's Foundation", event: "Hope Fun Run", ended: "2026-11-01",
    arrangement: "TICKET_FEE", feeLabel: "5% + K3 per paid ticket", status: "APPROVED",
    tickets: 420, gross: 63_000, refunds: 0, chargebacks: 0, providerCharges: 1_130, bookingFees: 0, deductions: [],
    payTo: "Airtel Money ****2209 (not yet verified)", approvals: [{ by: "Natasha Zulu", role: "Platform finance manager", at: "2026-11-10" }],
    hold: "Organisation not verified: PACRA certificate and director's ID still missing. Payout starts once both are checked.",
    history: [{ at: "2026-11-10", what: "Approved, payout held until verification", who: "Natasha Zulu" }],
  }),
  S({
    ref: "ST-SU-0031", orgId: "org4", orgName: "SkillUp Academy", event: "Excel for Business: October", ended: "2026-10-30",
    arrangement: "SUBSCRIPTION", feeLabel: "4% + K2 per paid ticket", status: "FAILED",
    tickets: 64, gross: 57_600, refunds: 0, chargebacks: 0, providerCharges: 1_040, bookingFees: 0, deductions: [],
    payTo: "Airtel Money ****7731", approvals: [{ by: "Joseph Tembo", role: "Platform finance officer", at: "2026-11-09" }],
    payout: { ref: "PO-SU-0029", error: "Airtel Money rejected the transfer: the wallet is registered to a different name than SkillUp Academy." },
    history: [{ at: "2026-11-09", what: "Approved", who: "Joseph Tembo" }, { at: "2026-11-09", what: "Payout rejected by Airtel: account name mismatch", who: "System" }],
  }),
  S({
    ref: "ST-CB-0108", orgId: "org2", orgName: "Copperbelt Business Forum", event: "Kitwe Trade Mixer", ended: "2026-11-05",
    arrangement: "SUBSCRIPTION", feeLabel: "4% + K2 per paid ticket", status: "PAYOUT_PROCESSING",
    tickets: 212, gross: 63_600, refunds: 0, chargebacks: 0, providerCharges: 1_150, bookingFees: 0, deductions: [],
    payTo: "Stanbic ****8820", approvals: [{ by: "Joseph Tembo", role: "Platform finance officer", at: "2026-11-13" }, { by: "Natasha Zulu", role: "Platform finance manager", at: "2026-11-16" }],
    payout: { ref: "PO-CB-0101" },
    history: [{ at: "2026-11-16", what: "Payout sent to Stanbic, waiting for confirmation", who: "Natasha Zulu" }],
  }),
];

export const settlementByRef = (ref: string) => settlements.find((s) => s.ref === ref);

/* ------------------------------------------------------------------ */
/* Payout accounts                                                     */
/* ------------------------------------------------------------------ */

export const payoutAccount = {
  method: "MTN MoMo business wallet",
  number: "****0081",
  holder: "Zed Live Entertainment Ltd",
  verified: "2025-03-20",
  checks: [
    { what: "Account name matches the organisation", ok: true },
    { what: "Test payment of K1 received and confirmed", ok: true },
    { what: "PACRA certificate checked", ok: true },
    { what: "Director's ID checked", ok: true },
  ],
};

/* ------------------------------------------------------------------ */
/* Partnerships                                                        */
/* ------------------------------------------------------------------ */

export const partnerships = [
  {
    id: "PA-2026-011", org: "Chipolopolo Sports Events", events: ["Ndola Half Marathon"], status: "Active", share: 20,
    base: "Ticket sales minus refunds and payment charges", deductions: ["Medals and race bibs, up to K45,000"],
    downPayment: 25_000, downTreatment: "Advance against EMS's share", contributions: [{ kind: "Marketing", amount: 40_000 }, { kind: "Equipment (timing mats)", amount: 12_000 }], maxExposure: 60_000,
    cancellation: "Buyers refunded from held funds; EMS's marketing spend shared 50/50", accepted: { org: "2026-08-14", ems: "2026-08-15" },
    live: { gross: 684_000, refunds: 9_000, charges: 12_310 },
  },
  {
    id: "PA-2027-002", org: "Zed Live Entertainment", events: ["Lusaka July Fest 2027"], status: "Waiting for organiser", share: 15,
    base: "Ticket sales minus refunds and payment charges", deductions: ["Stage and sound hire, up to K200,000"],
    downPayment: 100_000, downTreatment: "Advance against EMS's share", contributions: [{ kind: "Cash", amount: 150_000 }, { kind: "Marketing", amount: 80_000 }], maxExposure: 250_000,
    cancellation: "Cash contribution repaid by the organiser within 60 days", accepted: { org: null as string | null, ems: "2026-11-15" },
    live: null as null | { gross: number; refunds: number; charges: number },
  },
  {
    id: "APP-0031", org: "Laugh Out Lusaka", events: ["Comedy Central Tour (proposed)"], status: "Application", share: 25,
    base: "To be agreed", deductions: [], downPayment: 0, downTreatment: "—", contributions: [{ kind: "Marketing (requested)", amount: 30_000 }], maxExposure: 0,
    cancellation: "To be agreed", accepted: { org: null, ems: null }, live: null,
  },
];
