/**
 * Event-day tools: how people get in, how attendance is counted, giving,
 * what each ticket includes, and food and merchandise sales.
 *
 * Rules agreed with the owner (19 Nov 2026):
 *
 * Entry. Each event chooses how people get in:
 * - TICKETS: paid or free tickets, scanned at the gate (as before).
 * - REGISTRATION: free sign-up for a headcount or guest list; a free pass is scanned.
 * - OPEN: no tickets at all (church services, funerals, memorials). Attendance is
 *   counted with "I'm coming" before the event and a check-in QR code on the day.
 *
 * Attendance for OPEN events.
 * - "I'm coming" (RSVP) with the number of people, for planning food.
 * - On the day the organiser shows a check-in QR code. Attendees scan it and tap
 *   "I'm here"; each phone counts once and can add family members. The code only
 *   works during the event and the projector version refreshes every few minutes.
 * - Ushers add people without smartphones with a counter (+1, +5).
 * - Optional meal pass: the check-in screen becomes a pass that the serving team
 *   marks once.
 *
 * What a ticket includes (allowances). A ticket type can include extras such as
 * "Dinner ×1" or "Drinks ×2". Each scanner is set to a station (gate, a meal, the
 * bar, food orders). The same QR code is checked separately at each station, so a
 * ticket can be scanned at the gate and again for its meal. Each use is final and
 * logged; meals can require entry first and have a serving window.
 *
 * Giving. Tithes, offerings and funeral contributions are paid through EMS (they
 * are contribution money: non-refundable except for an EMS system error, can be
 * cashed out at any time once cleared). The organiser shares a link and QR code.
 *
 * Food and merchandise. Only the organiser sells. EMS does NOT take the money: the
 * buyer pays the attendant in cash, by card on the organiser's machine, or by
 * mobile money to the organiser's own number. EMS takes the order, gives the buyer
 * an order QR code, lets the attendant confirm collection and payment, and keeps
 * stock and the amount each attendant must hand in. Refunds are between organiser
 * and buyer. EMS earns either a fixed sales-tracking package paid up front or a
 * commission on recorded sales invoiced after the event; the organiser chooses per
 * event, like choosing a licence or a revenue-share partnership for tickets.
 *
 * More rules (built 19 Nov, second round):
 * - Re-entry: off by default; when on, a second gate scan lets the person back in
 *   if they were scanned out, and logs it.
 * - Buying an extra at the station: the organiser can let people whose ticket
 *   doesn't include it (e.g. Standard at the VIP dinner) buy one there; the
 *   attendant records the payment like a quick sale.
 * - "I'm coming" reminder: sent the day before (push, SMS backup from the
 *   organiser's credits for people without the app).
 * - Orders can be collected in parts ("2 of 3 items given"); payment is recorded
 *   at the first handover. A kitchen or bar screen shows orders as they arrive.
 * - Stock can be issued to an attendant; at the end they return what's unsold
 *   and any difference shows against them.
 */

export type EntryMode = "TICKETS" | "REGISTRATION" | "OPEN";

export const entryModes: { key: EntryMode; label: string; sub: string; examples: string }[] = [
  { key: "TICKETS", label: "Tickets", sub: "Paid or free tickets with a QR code, scanned at the gate.", examples: "Concerts, matches, conferences" },
  { key: "REGISTRATION", label: "Free registration", sub: "People sign up for free so you know who is coming. Each gets a free pass.", examples: "Weddings with a guest list, workshops, conventions" },
  { key: "OPEN", label: "Open entry, no tickets", sub: "Anyone can come. Count people with \"I'm coming\" and a check-in QR code on the day.", examples: "Church services, funerals, memorials, community meetings" },
];

/* What a ticket includes ---------------------------------------------------- */

/** An extra that a ticket can include, used at a scanner station. */
export interface Allowance { key: string; label: string; window?: string; afterEntry?: boolean }

export type StationKind = "GATE" | "ALLOWANCE" | "ORDERS" | "HEADCOUNT";
export interface Station { key: string; kind: StationKind; label: string; sub: string; allowance?: string; eventId?: string }

/* Food and merchandise ------------------------------------------------------ */

export type PayMethod = "CASH" | "CARD" | "MOBILE_MONEY";
export const payLabel: Record<PayMethod, string> = { CASH: "Cash", CARD: "Card on the organiser's machine", MOBILE_MONEY: "Mobile money to the organiser" };
export const payShort: Record<PayMethod, string> = { CASH: "Cash", CARD: "Card", MOBILE_MONEY: "Mobile money" };

export interface MenuItem {
  id: string;
  name: string;
  kind: "Food" | "Drinks" | "Merchandise";
  price: number;
  point: string;
  /** Stock entered by the organiser before the event. */
  opening: number;
  restocked: number;
  sold: number;
  /** Damaged, spoiled or given away, with a reason in the log. */
  writtenOff: number;
  /** Physical count entered at the end; undefined until counted. */
  counted?: number;
  paused?: boolean;
  note?: string;
  /** Placeholder picture until the organiser uploads a photo: an icon and two colours. */
  art?: { icon: MenuArt; from: string; to: string };
  /** Photo uploaded by the organiser (object URL in the showcase). */
  photo?: string;
}

export type MenuArt = "chicken" | "burger" | "beef" | "water" | "soda" | "beer" | "shirt" | "cap" | "soup" | "snack";

export const left = (m: MenuItem) => m.opening + m.restocked - m.sold - m.writtenOff;

export type OrderStatus = "Waiting" | "Preparing" | "Ready" | "Part collected" | "Collected" | "Cancelled";
export interface Order {
  number: string;
  at: string;
  buyer: string;
  /** given: how many of this line have been handed over (orders can be collected in parts). */
  lines: { item: string; qty: number; given?: number }[];
  /** How the buyer said they would pay. */
  method: PayMethod;
  status: OrderStatus;
  point: string;
  attendant?: string;
  /** How it was actually paid, set by the attendant. */
  paidMethod?: PayMethod;
  /** Card receipt or mobile money transaction number. */
  ref?: string;
  /** Walk-up sale made on the attendant's phone. */
  quick?: boolean;
  table?: string;
}

export interface Attendant {
  id: string;
  name: string;
  point: string;
  orders: number;
  cash: number;
  card: number;
  cardReceipts: number;
  mobile: number;
  mobileRefs: number;
  /** Cash handed in at the end of the shift; undefined until handed in. */
  handedIn?: number;
  /**
   * Stock handed to this attendant to sell (e.g. 40 T-shirts). What they sold is
   * counted from their orders; unsold items are returned and counted back.
   */
  issued?: { item: string; issued: number; sold: number; returned?: number }[];
}

/** A pay-on-collection order is cancelled and its stock released after this. */
export const UNPAID_ORDER_MINUTES = 30;
/** How many unpaid orders one phone can have open at once. */
export const MAX_OPEN_UNPAID = 3;

export type SalesTracking = "PACKAGE" | "COMMISSION";
/** Prices are placeholders until the cost model sets them. */
export const salesTrackingOptions: { key: SalesTracking; label: string; price: string; sub: string }[] = [
  { key: "PACKAGE", label: "Sales tracking package", price: "K450 per event, paid up front", sub: "Unlimited orders and items. Included in the Professional plan." },
  { key: "COMMISSION", label: "Commission on recorded sales", price: "3% of recorded sales", sub: "Nothing up front. Added to your invoice after the event, from the sales recorded in EMS." },
];

/* Giving -------------------------------------------------------------------- */

export interface GivingPage {
  slug: string;
  org: string;
  orgSlug: string;
  title: string;
  kind: "CHURCH" | "FUNERAL";
  intro: string;
  funds: { key: string; label: string; sub?: string }[];
  /** Linked event, for per-service totals and the event page button. */
  eventSlug?: string;
  palette: [string, string];
}

/** Items still to hand over on an order collected in parts. */
export const toGive = (o: { lines: { qty: number; given?: number }[] }) => o.lines.reduce((a, l) => a + l.qty - (l.given ?? 0), 0);

export const orderTotal = (o: Order, menu: MenuItem[]) => o.lines.reduce((a, l) => a + (menu.find((m) => m.id === l.item)?.price ?? 0) * l.qty, 0);
