// DEMO DATA ONLY. Refunds, chargebacks, activity logs, message templates and
// support conversations. Organisers see their own; the super admin sees all.

import { organisations, people, transactions } from "./data";

export interface RefundRequest {
  id: string;
  orgId: string;
  event: string;
  buyer: string;
  phone: string;
  tickets: number;
  amount: number;
  method: string;
  reason: string;
  note?: string;
  requested: string;
  policy: "Within policy" | "Outside policy";
  status: "Waiting" | "Approved" | "Declined" | "Refunded";
  decidedBy?: string;
}

export const refundRequests: RefundRequest[] = [
  { id: "RR-2041", orgId: "org1", event: "Lusaka Summer Jam", buyer: "Natasha Mumba", phone: "0977 ••• 412", tickets: 2, amount: 500, method: "MTN MoMo", reason: "I can't attend anymore", note: "Family funeral in Chipata that weekend.", requested: "2026-11-16 18:42", policy: "Within policy", status: "Waiting" },
  { id: "RR-2040", orgId: "org1", event: "Lusaka Summer Jam", buyer: "Joseph Banda", phone: "0966 ••• 090", tickets: 1, amount: 600, method: "Visa card", reason: "I bought by mistake", note: "Bought VIP instead of Standard.", requested: "2026-11-16 11:05", policy: "Within policy", status: "Waiting" },
  { id: "RR-2038", orgId: "org1", event: "Laugh Out Loud Friday", buyer: "Mutale Chileshe", phone: "0955 ••• 231", tickets: 4, amount: 600, method: "Airtel Money", reason: "Other", note: "Friend got sick, can I move to next month's show instead?", requested: "2026-11-15 20:17", policy: "Outside policy", status: "Waiting" },
  { id: "RR-2031", orgId: "org1", event: "Lusaka Summer Jam", buyer: "Chipo Zulu", phone: "0977 ••• 845", tickets: 1, amount: 250, method: "MTN MoMo", reason: "The event changed", requested: "2026-11-12 09:30", policy: "Within policy", status: "Refunded", decidedBy: "Precious Nyirenda" },
  { id: "RR-2029", orgId: "org1", event: "Zed Live Sessions: November", buyer: "Kalaba Phiri", phone: "0966 ••• 377", tickets: 2, amount: 400, method: "Airtel Money", reason: "I can't attend anymore", requested: "2026-11-13 22:01", policy: "Outside policy", status: "Declined", decidedBy: "Precious Nyirenda" },
  { id: "RR-1102", orgId: "org2", event: "Copperbelt Mining & Investment Indaba", buyer: "Bupe Kunda", phone: "0977 ••• 119", tickets: 1, amount: 3_500, method: "Bank transfer", reason: "I can't attend anymore", requested: "2026-11-16 08:12", policy: "Within policy", status: "Waiting" },
  { id: "RR-0870", orgId: "org5", event: "Lusaka Derby: Zesco vs Power Dynamos", buyer: "Mwansa Tembo", phone: "0955 ••• 602", tickets: 3, amount: 450, method: "MTN MoMo", reason: "Duplicate purchase", requested: "2026-11-15 14:40", policy: "Within policy", status: "Approved", decidedBy: "Mwansa Kapata" },
];

export const chargebacks = [
  { id: "CB-0091", orgId: "org1", event: "Copperbelt Nights: Ndola", buyer: "Card ending 7731", amount: 1_200, received: "2026-11-11", reason: "Cardholder says they didn't make the purchase", due: "2026-11-21", status: "Send evidence", evidence: "Ticket scanned at Gate B on 10 Nov at 19:42" },
  { id: "CB-0084", orgId: "org1", event: "Zed Live Sessions: October", buyer: "Card ending 1180", amount: 900, received: "2026-10-30", reason: "Event not as described", due: "2026-11-09", status: "Won", evidence: "Programme and photos sent" },
  { id: "CB-0040", orgId: "org3", event: "Youth Camp 2026", buyer: "Card ending 5502", amount: 150, received: "2026-11-14", reason: "Duplicate charge", due: "2026-11-24", status: "Accepted", evidence: "Duplicate confirmed; refunded" },
];

export const refundRules = { autoApproveWithinPolicy: false, keepBookingFee: true, maxAutoAmount: 1_000 };

/** Every organiser's transactions, for the super admin. */
export const allTransactions = organisations.filter((o) => o.status !== "Pending").flatMap((o, oi) =>
  transactions.slice(0, oi === 0 ? 18 : 6).map((t, i) => ({ ...t, id: oi === 0 ? t.id : `${t.id.slice(0, 7)}${oi}${i}`, orgId: o.id, org: o.name, amount: Math.round(t.amount * (1 + oi * 0.35)), fee: Math.round(t.fee * (1 + oi * 0.35) * 100) / 100 })),
);

export const orgActivity = [
  { at: "2026-11-17 14:02", who: "Precious Nyirenda", role: "Finance officer", what: "Approved refund RR-2031 (K250) for Chipo Zulu", area: "Money", ip: "41.216.80.14" },
  { at: "2026-11-17 11:40", who: "Chanda Mulenga", role: "Event manager", what: "Published programme changes for Lusaka Summer Jam (8,612 ticket holders told)", area: "Events", ip: "41.216.80.22" },
  { at: "2026-11-17 09:15", who: "Mwila Banda", role: "Organisation admin", what: "Gave Kelvin Sakala the Gate staff role", area: "Team", ip: "102.68.12.7" },
  { at: "2026-11-16 18:03", who: "Daliso Mbewe", role: "Marketing officer", what: "Sent SMS campaign “Summer Jam: 26 days to go” to 18,420 people", area: "Audience", ip: "41.216.80.30" },
  { at: "2026-11-16 16:44", who: "Mwila Banda", role: "Organisation admin", what: "Changed the default refund policy to “Refunds until 7 days before”", area: "Settings", ip: "102.68.12.7" },
  { at: "2026-11-16 08:01", who: "Precious Nyirenda", role: "Finance officer", what: "Signed in with 2-step sign-in from a new device (Chrome on Android)", area: "Security", ip: "41.216.80.14" },
  { at: "2026-11-15 21:12", who: "Unknown", role: "—", what: "3 failed sign-in attempts for mwila@zedlive.example. Account locked for 15 minutes", area: "Security", ip: "197.212.9.88" },
  { at: "2026-11-15 13:20", who: "Chanda Mulenga", role: "Event manager", what: "Raised Standard ticket price for Copperbelt Nights: Kitwe from K180 to K200 (draft)", area: "Events", ip: "41.216.80.22" },
  { at: "2026-11-13 10:05", who: "Precious Nyirenda", role: "Finance officer", what: "Accepted settlement statement ST-ZL-0418", area: "Money", ip: "41.216.80.14" },
];

export const orgTemplates = [
  { key: "ticket", name: "Ticket confirmation", channels: ["Email", "SMS", "WhatsApp"], when: "Right after payment is confirmed", subject: "Your tickets for {event}", body: "Hi {first_name}, you're going to {event} on {date} at {venue}. Your {ticket_count} ticket(s) are attached and in My tickets: {ticket_link}. Show the QR code at {gate}. See you there! {organiser}" },
  { key: "reminder", name: "Event reminder", channels: ["SMS", "WhatsApp", "Push"], when: "1 day before the event", subject: "Tomorrow: {event}", body: "{event} is tomorrow, {date}. Gates open {gates_open} at {venue}. Programme: {programme_link}. Your tickets: {ticket_link}" },
  { key: "programme", name: "Programme change", channels: ["SMS", "Email"], when: "When you publish programme changes and choose to tell ticket holders", subject: "Programme update for {event}", body: "Update for {event}: {change_summary}. Full programme: {programme_link}" },
  { key: "refund", name: "Refund approved", channels: ["SMS", "Email"], when: "When a refund is approved", subject: "Your refund for {event}", body: "Hi {first_name}, your refund of {amount} for {event} has been approved and is on its way to your {method}. Ref {refund_ref}." },
  { key: "declined", name: "Refund declined", channels: ["SMS", "Email"], when: "When a refund request is declined", subject: "About your refund request for {event}", body: "Hi {first_name}, we can't refund your tickets for {event}: {decline_reason}. You can still transfer them to someone else in My tickets: {ticket_link}" },
  { key: "cancelled", name: "Event cancelled", channels: ["SMS", "Email", "WhatsApp"], when: "When an event is cancelled", subject: "{event} is cancelled", body: "We're sorry: {event} on {date} is cancelled. You'll get a full refund to your {method} within 5 business days. {organiser}" },
];
export const templateVariables = ["{first_name}", "{event}", "{date}", "{venue}", "{gate}", "{gates_open}", "{ticket_count}", "{ticket_link}", "{programme_link}", "{amount}", "{method}", "{refund_ref}", "{organiser}"];

export const supportThreads = [
  { id: "SUP-3311", orgId: "org1", with: "EMS support", subject: "Can we add a second payout account for the Kitwe office?", status: "Waiting for EMS", updated: "2026-11-17 10:20", messages: [
    { from: "Mwila Banda", at: "2026-11-17 10:20", text: "Our Kitwe branch wants its own payout account for Copperbelt Nights. Is that possible on our plan?" },
  ] },
  { id: "SUP-3290", orgId: "org1", with: "EMS support", subject: "Statement for Livingstone Jazz Weekend", status: "Answered", updated: "2026-11-09 15:02", messages: [
    { from: "Precious Nyirenda", at: "2026-11-06 12:00", text: "We disputed the refunds line. How long does it take?" },
    { from: "Ruth Mwanza (EMS)", at: "2026-11-09 15:02", text: "Finance asked for the cash refund receipts. Once they're uploaded on the statement, they usually decide within 1 business day." },
  ] },
  { id: "Q-8812", orgId: "org1", with: people[4], subject: "Is there parking at Heroes for Summer Jam?", status: "New question", updated: "2026-11-17 08:41", messages: [
    { from: people[4], at: "2026-11-17 08:41", text: "Hi, is there secure parking at Heroes Stadium and do I need to pay?" },
  ] },
  { id: "Q-8790", orgId: "org1", with: people[7], subject: "Can my 12-year-old come with a Standard ticket?", status: "Answered", updated: "2026-11-15 19:30", messages: [
    { from: people[7], at: "2026-11-15 17:02", text: "Can children attend?" },
    { from: "Daliso Mbewe", at: "2026-11-15 19:30", text: "Yes, under-16s must come with an adult and need their own Standard ticket." },
  ] },
];
