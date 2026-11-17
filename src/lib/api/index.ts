/**
 * Data layer.
 *
 * Every screen reads data through this module, never from mock files directly.
 * Each function names the NestJS endpoint that will replace it. To connect a
 * service, change the body of its functions to call `http()` and leave the
 * screens untouched.
 */
import * as mock from "@/lib/mock/data";

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
    /** GET /v1/assessments/:id/submissions */
    submissions: () => mock.submissions,
  },
  me: {
    /** GET /v1/me/tickets */
    tickets: () => mock.myTickets,
    /** GET /v1/me/tickets?past=true */
    pastTickets: () => mock.pastTickets,
    /** GET /v1/me/notifications */
    notifications: () => mock.notifications,
  },
  platform: {
    /** GET /v1/admin/plans */
    plans: () => mock.plans,
    /** GET /v1/admin/payment-gateways */
    gateways: () => mock.gateways,
    /** GET /v1/admin/audit-logs */
    audit: () => mock.auditLogs,
    /** GET /v1/admin/support-tickets */
    support: () => mock.supportTickets,
    /** GET /v1/admin/metrics/monthly */
    series: () => mock.platformSeries,
  },
};

export { sold, capacity, gross, fromPrice, statusTone, people } from "@/lib/mock/data";
export type { EventItem, TicketType, Organisation, Venue, Category } from "@/lib/mock/data";
