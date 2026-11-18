/**
 * Data layer.
 *
 * Every screen reads data through this module, never from mock files directly.
 * Each function names the NestJS endpoint that will replace it. To connect a
 * service, change the body of its functions to call `http()` and leave the
 * screens untouched.
 */
import * as mock from "@/lib/mock/data";
import * as commerce from "@/lib/mock/commerce";
import * as programme from "@/lib/mock/programme";
import * as ops from "@/lib/mock/operations";
import * as dash from "@/lib/mock/dashboards";

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

export async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText} on ${path}`);
  return res.json() as Promise<T>;
}

export const api = {
  events: {
    /** GET /v1/discovery/events?lat&lng&radiusKm&category */
    discover: () => mock.events.filter((e) => e.category !== "Wedding"),
    /** GET /v1/me/recommendations (events plus the reason each was picked) */
    recommended: () => ["e7", "e1", "e9", "e3"].map((id) => ({ event: mock.events.find((e) => e.id === id)!, reason: mock.recommendationReasons[id] })),
    /** GET /v1/events/:slug */
    bySlug: (slug: string) => mock.getEvent(slug),
    /** GET /v1/orgs/:orgId/events */
    forOrg: (orgId = "org1") => mock.orgEvents(orgId),
    /** GET /v1/events/:id/attendees */
    attendees: () => mock.attendees,
    /** GET /v1/events/:id/checkins/stats */
    checkinSeries: () => mock.checkinSeries,
    /** GET /v1/events/:id/gates */
    gates: () => mock.gates,
    /** GET /v1/events/:id/incidents */
    incidents: () => mock.incidents,
    /** GET /v1/events/:id/checklist */
    checklist: () => mock.checklist,
    /** GET /v1/events/:id/equipment */
    equipment: () => mock.equipment,
    /** GET /v1/events/:id/shifts */
    shifts: () => mock.shifts,
    /** GET /v1/events/:id/programme (running order, published with the event) */
    programme: (eventId: string) => programme.programmes[eventId] ?? [],
    /** GET /v1/programme-templates */
    programmeTemplates: () => programme.programmeTemplates,
    /** GET /v1/events/:id/online-attendees */
    onlineAttendees: () => mock.onlineAttendees,
  },
  orgs: {
    /** GET /v1/admin/organisations */
    list: () => mock.organisations,
    /** GET /v1/organisations/:slug */
    get: (id: string) => mock.getOrg(id),
    /** GET /v1/orgs/:orgId/team */
    team: () => mock.team,
  },
  venues: {
    /** GET /v1/venues */
    list: () => mock.venues,
    /** GET /v1/venues/:id */
    get: (id: string) => mock.getVenue(id),
    /** GET /v1/vendor/venues/:id/bookings */
    bookings: () => mock.venueBookings,
  },
  finance: {
    /** GET /v1/orgs/:orgId/finance/transactions */
    transactions: () => mock.transactions,
    /** GET /v1/orgs/:orgId/finance/invoices */
    invoices: () => mock.orgInvoices,
    /** GET /v1/orgs/:orgId/finance/expenses */
    expenses: () => mock.expenses,
    /** GET /v1/orgs/:orgId/reports/sales?days=30 */
    salesSeries: () => mock.salesSeries,
  },
  crm: {
    /** GET /v1/orgs/:orgId/customers */
    customers: () => mock.customers,
    /** GET /v1/orgs/:orgId/memberships/plans */
    memberships: () => mock.memberships,
    /** GET /v1/orgs/:orgId/events?visibility=members */
    memberEvents: () => mock.memberOnlyEvents,
    /** GET /v1/orgs/:orgId/loyalty/tiers */
    loyaltyTiers: () => mock.loyaltyTiers,
  },
  marketing: {
    /** GET /v1/orgs/:orgId/campaigns */
    campaigns: () => mock.campaigns,
    /** GET /v1/orgs/:orgId/discount-codes */
    discountCodes: () => mock.discountCodes,
  },
  vendors: {
    /** GET /v1/orgs/:orgId/vendors */
    list: () => mock.vendors,
    /** GET /v1/rfqs */
    rfqs: () => mock.rfqs,
    /** GET /v1/rfqs/:id/quotes */
    quotes: () => mock.quotes,
    /** GET /v1/vendors/:id/services */
    services: (name: string) => mock.vendorServices[name] ?? [],
    /** GET /v1/orgs/:orgId/vendor-contracts */
    contracts: () => mock.vendorContracts,
    /** GET /v1/orgs/:orgId/vendor-invoices */
    invoices: () => mock.vendorInvoices,
  },
  reviews: {
    /** GET /v1/events/:id/reviews */
    forEvent: () => mock.reviews,
    /** GET /v1/admin/moderation/reviews */
    reported: () => mock.reportedReviews,
    /** GET /v1/admin/moderation/photos */
    pendingPhotos: () => mock.pendingPhotos,
    /** GET /v1/reviews/:id/photos (approved only) */
    photos: (id: string) => mock.reviewPhotos[id] ?? [],
    /** GET /v1/events/:id/reviews/summary */
    breakdown: () => mock.ratingBreakdown,
    /** GET /v1/orgs/:orgId/feedback/trend */
    trend: () => mock.ratingTrend,
    /** GET /v1/orgs/:orgId/feedback/compare?events=… */
    compare: () => mock.eventComparison,
    /** GET /v1/orgs/:orgId/feedback/suggestions */
    suggestions: () => mock.suggestions,
    /** GET /v1/orgs/:orgId/feedback/actions */
    followUps: () => mock.followUps,
    /** GET /v1/orgs/:orgId/surveys */
    surveys: () => mock.surveys,
    /** GET /v1/me/reviews */
    mine: () => mock.myReviews,
  },
  fundraising: {
    /** GET /v1/fundraising/campaigns */
    campaigns: () => mock.fundraising,
    /** GET /v1/fundraising/campaigns/:id/donations */
    donations: () => mock.donations,
    /** GET /v1/orgs/:orgId/pledges */
    pledges: () => mock.pledges,
    /** GET /v1/orgs/:orgId/donors */
    donors: () => mock.donors,
    /** GET /v1/orgs/:orgId/beneficiaries */
    beneficiaries: () => mock.beneficiaries,
    /** GET /v1/orgs/:orgId/sponsorships */
    sponsors: () => mock.sponsors,
  },
  learning: {
    /** GET /v1/classrooms */
    classrooms: () => mock.classrooms,
    /** GET /v1/courses/:id/sessions */
    sessions: () => mock.courseSessions,
    /** GET /v1/courses/:id/assessments */
    assignments: () => mock.assignments,
    /** GET /v1/courses/:id/quizzes */
    quizzes: () => mock.quizzes,
    /** GET /v1/courses/:id/attendance */
    attendance: () => mock.bookkeepingAttendance,
    /** GET /v1/orgs/:orgId/classes/dashboard */
    dashboard: () => mock.classDashboard,
    /** GET /v1/assessments/:id/submissions */
    submissions: () => mock.submissions,
  },
  me: {
    /** GET /v1/me/tickets */
    tickets: () => mock.myTickets,
    /** GET /v1/me/tickets/:number/history */
    ticketHistory: (n: string) => mock.transferHistory[n] ?? [],
    /** GET /v1/me/tickets?past=true */
    pastTickets: () => mock.pastTickets,
    /** GET /v1/me/notifications */
    notifications: () => mock.notifications,
    /** GET /v1/me/pending (transfers to accept, postponement choices, waitlist offers) */
    pending: () => dash.myPending,
    /** GET /v1/me/saved-events */
    saved: () => dash.mySaved,
    /** GET /v1/me/following */
    following: () => dash.myFollowing,
    /** GET /v1/me/contributions */
    contributions: () => dash.myContributions,
    /** GET /v1/me/referral (a discount code, not points) */
    referral: () => dash.myReferral,
    /** GET /v1/discovery/events?near=me&weekend=true */
    nearby: () => dash.myNearby,
    /** GET /v1/me/activity */
    activity: () => dash.myActivity,
  },
  platform: {
    /** GET /v1/admin/transactions (every organiser) */
    transactions: () => ops.allTransactions,
    /** GET /v1/admin/payment-gateways */
    gateways: () => mock.gateways,
    /** GET /v1/admin/audit-logs */
    audit: () => mock.auditLogs,
    /** GET /v1/admin/support-tickets */
    support: () => mock.supportTickets,
    /** GET /v1/admin/metrics/monthly */
    series: () => mock.platformSeries,
  },
  refunds: {
    /** GET /v1/orgs/:orgId/refund-requests, or GET /v1/admin/refund-requests when no org is given */
    requests: (orgId?: string) => (orgId ? ops.refundRequests.filter((r) => r.orgId === orgId) : ops.refundRequests),
    /** GET /v1/orgs/:orgId/chargebacks, or GET /v1/admin/chargebacks */
    chargebacks: (orgId?: string) => (orgId ? ops.chargebacks.filter((r) => r.orgId === orgId) : ops.chargebacks),
    /** GET /v1/orgs/:orgId/refund-rules */
    rules: () => ops.refundRules,
  },
  activity: {
    /** GET /v1/orgs/:orgId/activity (the organisation's own audit log) */
    forOrg: () => ops.orgActivity,
  },
  messages: {
    /** GET /v1/orgs/:orgId/message-templates */
    templates: () => ops.orgTemplates,
    variables: () => ops.templateVariables,
    /** GET /v1/orgs/:orgId/support (questions from buyers and tickets with EMS support) */
    threads: (orgId = "org1") => ops.supportThreads.filter((t) => t.orgId === orgId),
  },
  billing: {
    /** GET /v1/plans (public price list, current plan versions) */
    plans: () => commerce.planCatalog,
    /** GET /v1/plans/features */
    features: () => commerce.planFeatures,
    /** GET /v1/licence-packages */
    licencePackages: () => commerce.licencePackages,
    /** GET /v1/addons */
    addOns: () => commerce.addOns,
    /** GET /v1/orgs/:orgId/subscription (plan, usage against entitlements, invoices) */
    subscription: () => commerce.orgSubscription,
    /** GET /v1/admin/discounts */
    discounts: () => commerce.discounts,
    /** GET /v1/admin/trials */
    trials: () => commerce.trials,
    /** GET /v1/admin/licences */
    licences: () => commerce.eventLicences,
  },
  contributions: {
    /** GET /v1/admin/contribution-cashouts, or GET /v1/orgs/:orgId/contribution-cashouts */
    cashouts: (orgId?: string) => (orgId ? dash.cashouts.filter((c) => c.orgId === orgId) : dash.cashouts),
    /** GET /v1/admin/finance-settings/cashouts */
    settings: () => dash.cashoutSettings,
    /** GET /v1/orgs/:orgId/contributions/balance (pledged is a record only; available = cleared minus cashouts) */
    balance: () => dash.orgContributions,
  },
  dashboards: {
    /** GET /v1/admin/payments/unmatched (charged, no callback) */
    missingCallbacks: () => dash.missingCallbacks,
    /** GET /v1/admin/finance-settings/pending */
    pendingFinanceChanges: () => dash.pendingFinanceChanges,
    /** GET /v1/admin/live */
    platformNow: () => dash.platformNow,
    /** GET /v1/status/providers (public, also shown to organisers) */
    serviceStatus: () => dash.serviceStatus,
    /** GET /v1/admin/audit-logs?limit=5 */
    adminActivity: () => dash.adminActivity,
    /** GET /v1/orgs/:orgId/live */
    orgNow: (eventDay: boolean) => (eventDay ? dash.orgNow.eventDay : dash.orgNow.normal),
    /** GET /v1/orgs/:orgId/disruptions/open */
    disruptionChoices: () => dash.disruptionChoices,
    /** GET /v1/orgs/:orgId/tasks?due=week */
    tasks: () => dash.orgTasksToday,
  },
  settlements: {
    /** GET /v1/events/:id/commercial (frozen terms) */
    termsFor: (eventId: string) => commerce.termsFor(eventId),
    /** GET /v1/orgs/:orgId/settlements, or GET /v1/admin/settlements when no org is given */
    list: (orgId?: string) => (orgId ? commerce.settlements.filter((s) => s.orgId === orgId) : commerce.settlements),
    /** GET /v1/settlements/:ref (statement lines come from the ledger) */
    get: (ref: string) => commerce.settlementByRef(ref),
    /** GET /v1/orgs/:orgId/payout-account */
    payoutAccount: () => commerce.payoutAccount,
    /** GET /v1/admin/partnerships */
    partnerships: () => commerce.partnerships,
    /** GET /v1/admin/finance-settings */
    financeSettings: () => commerce.financeSettings,
    /** GET /v1/admin/holidays */
    holidays: () => commerce.holidays,
    /** GET /v1/admin/staff */
    staff: () => commerce.platformStaff,
  },
};

export { sold, capacity, gross, fromPrice, statusTone, people } from "@/lib/mock/data";
export type { EventItem, TicketType, Organisation, Venue, Category } from "@/lib/mock/data";
export {
  DEMO_TODAY, arrangementLabel, collectionLabel, feePayerLabel, feeText, planFee, bookingFee, licenceAccess,
  settlementStatus, settlementSteps, statementLines, payable, heldAmount, deadlines, holidayDates,
} from "@/lib/mock/commerce";
export type { Arrangement, Collection, FeePayer, Settlement, SettlementStatus, PlanKey, StaffRole, EventTerms } from "@/lib/mock/commerce";
export { programmeKinds } from "@/lib/mock/programme";
export type { ProgrammeItem } from "@/lib/mock/programme";
export type { RefundRequest } from "@/lib/mock/operations";
export type { Cashout, CashoutStatus, CashoutSettings } from "@/lib/mock/dashboards";
