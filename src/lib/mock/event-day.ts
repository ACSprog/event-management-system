/**
 * Sample event-day data (see src/lib/event-day.ts for the rules):
 * - Lusaka Summer Jam (e1): tickets that include dinner and drinks, food and
 *   merchandise sold by the organiser, paid to attendants.
 * - Zambia Trade and Farm Expo (e30): week pass includes a daily lunch.
 * - Grace Chapel Midweek Service (e31): open entry, check-in QR, tithes and offerings.
 * - Funeral of the late Joseph Mwansa (e32): open entry, "I'm coming" for catering,
 *   meal pass, funeral contributions.
 */
import type { Allowance, Attendant, EntryMode, GivingPage, MenuItem, Order, SalesTracking, Station } from "@/lib/event-day";

export interface EventDaySetup {
  entry: EntryMode;
  /** "I'm coming" before the event (open entry and registration). */
  rsvp?: boolean;
  /** Check-in QR code on the day (open entry). */
  checkinQr?: boolean;
  /** Check-in screen doubles as a meal pass. */
  mealPass?: boolean;
  allowances?: Allowance[];
  /** Ticket type name → allowance key → how many per ticket. */
  includes?: Record<string, Record<string, number>>;
  menu?: boolean;
  salesTracking?: SalesTracking;
  /** Slug of the giving page. */
  giving?: string;
  stations: Station[];
  /** Let people back in after they leave (gate scans them out). */
  reentry?: boolean;
  /** Extras that people without them on their ticket can buy at the station, with the price. */
  sellExtras?: Record<string, number>;
  /** Day-before reminder for people who tapped "I'm coming". */
  reminder?: { at: string; people: number; sms: number; sent?: boolean };
}

const gate = (label = "Gate A", sub = "All tickets"): Station => ({ key: `gate-${label}`, kind: "GATE", label, sub });

export const setups: Record<string, EventDaySetup> = {
  e1: {
    entry: "TICKETS", menu: true, salesTracking: "COMMISSION", reentry: true, sellExtras: { dinner: 250 },
    allowances: [
      { key: "dinner", label: "Dinner", window: "19:00 to 22:00", afterEntry: true },
      { key: "drinks", label: "Drinks", afterEntry: true },
    ],
    includes: { VIP: { dinner: 1, drinks: 2 }, "VVIP table of 8": { dinner: 8, drinks: 16 } },
    stations: [
      gate("Gate A", "Standard and Early bird"), gate("VIP gate", "VIP and VVIP"),
      { key: "dinner", kind: "ALLOWANCE", label: "VIP dinner", sub: "Ticket meals, 19:00 to 22:00", allowance: "dinner" },
      { key: "drinks", kind: "ALLOWANCE", label: "VIP bar: included drinks", sub: "Ticket drinks", allowance: "drinks" },
      { key: "orders-a", kind: "ORDERS", label: "Food court A", sub: "Food orders and walk-up sales" },
      { key: "orders-merch", kind: "ORDERS", label: "Merchandise stand", sub: "T-shirts and caps" },
    ],
  },
  e30: {
    entry: "TICKETS", menu: true, salesTracking: "PACKAGE",
    allowances: [{ key: "lunch", label: "Lunch", window: "12:00 to 14:00, once a day", afterEntry: true }],
    includes: { "Week pass": { lunch: 6 } },
    stations: [gate("North gate", "All passes"), { key: "lunch", kind: "ALLOWANCE", label: "Lunch tent", sub: "Week pass lunches", allowance: "lunch" }, { key: "orders-food", kind: "ORDERS", label: "Food court", sub: "Orders and walk-up sales" }],
  },
  e31: {
    entry: "OPEN", rsvp: false, checkinQr: true, giving: "grace-chapel",
    stations: [{ key: "count", kind: "HEADCOUNT", label: "Usher count", sub: "Church: add people without a smartphone", eventId: "e31" }],
  },
  e32: {
    entry: "OPEN", rsvp: true, checkinQr: true, mealPass: true, giving: "mwansa-funeral",
    reminder: { at: "Friday 20 November, 18:00", people: 146, sms: 38 },
    allowances: [{ key: "meal", label: "Meal", window: "After the burial, 14:00 to 17:00" }],
    stations: [
      { key: "count", kind: "HEADCOUNT", label: "Usher count", sub: "Add people without a smartphone" },
      { key: "meal", kind: "ALLOWANCE", label: "Meal serving", sub: "Funeral: meal passes, and people without a phone", allowance: "meal", eventId: "e32" },
    ],
  },
};

export const setupFor = (eventId: string): EventDaySetup => setups[eventId] ?? { entry: "TICKETS", stations: [gate()] };

/* Attendance (open entry) --------------------------------------------------- */

export const attendance: Record<string, {
  expected: number; rsvpReplies: number; checkedInApp: number; usherCount: number; mealsPlanned?: number; mealsServed?: number;
  gender: { Female: number; Male: number; "Prefer not to say": number };
  arrivals: { time: string; app: number; usher: number }[];
  previous?: { date: string; people: number; giving: number }[];
}> = {
  e31: {
    expected: 0, rsvpReplies: 0, checkedInApp: 588, usherCount: 214,
    gender: { Female: 462, Male: 301, "Prefer not to say": 39 },
    arrivals: [{ time: "10:30", app: 96, usher: 30 }, { time: "10:45", app: 214, usher: 61 }, { time: "11:00", app: 182, usher: 88 }, { time: "11:15", app: 70, usher: 29 }, { time: "11:30", app: 26, usher: 6 }],
    previous: [{ date: "28 Oct", people: 742, giving: 51_200 }, { date: "4 Nov", people: 768, giving: 54_900 }, { date: "11 Nov", people: 731, giving: 49_300 }, { date: "18 Nov", people: 802, giving: 58_650 }],
  },
  e32: {
    expected: 412, rsvpReplies: 146, checkedInApp: 312, usherCount: 96, mealsPlanned: 430, mealsServed: 371,
    gender: { Female: 221, Male: 172, "Prefer not to say": 15 },
    arrivals: [{ time: "08:00", app: 40, usher: 12 }, { time: "09:00", app: 128, usher: 38 }, { time: "10:00", app: 104, usher: 31 }, { time: "11:00", app: 40, usher: 15 }],
  },
};

/** Allowance use at Summer Jam (event-day preview). */
export const allowanceUse: Record<string, { key: string; label: string; used: number; total: number }[]> = {
  e1: [{ key: "dinner", label: "VIP dinner", used: 1_920, total: 2_658 }, { key: "drinks", label: "Included drinks", used: 3_880, total: 5_316 }],
  e30: [{ key: "lunch", label: "Week pass lunches today", used: 1_412, total: 1_906 }],
  e32: [{ key: "meal", label: "Meals", used: 371, total: 430 }],
};

/* Giving -------------------------------------------------------------------- */

export const givingPages: GivingPage[] = [
  {
    slug: "grace-chapel", org: "Grace Chapel International", orgSlug: "grace-chapel", title: "Give to Grace Chapel", kind: "CHURCH", eventSlug: "grace-chapel-midweek-service", palette: ["#5B2A86", "#F4A630"],
    intro: "Tithes, offerings and special funds. Give from anywhere, during the service or at home.",
    funds: [{ key: "tithe", label: "Tithe" }, { key: "offering", label: "Offering" }, { key: "building", label: "Building fund", sub: "New sanctuary in Chalala" }, { key: "missions", label: "Missions" }, { key: "thanksgiving", label: "Thanksgiving" }],
  },
  {
    slug: "mwansa-funeral", org: "The Mwansa family", orgSlug: "mwansa-family", title: "Funeral of the late Joseph Mwansa", kind: "FUNERAL", eventSlug: "funeral-joseph-mwansa", palette: ["#172033", "#7B8496"],
    intro: "Joseph Mwansa (1952–2026), father, grandfather and teacher. The family thanks everyone for their support. Contributions go to the funeral costs and to the family.",
    funds: [{ key: "funeral", label: "Funeral costs" }, { key: "family", label: "Support for the family", sub: "School fees for the grandchildren" }],
  },
];

export const givingTotals: Record<string, { fund: string; amount: number; givers: number }[]> = {
  "grace-chapel": [{ fund: "Tithe", amount: 38_400, givers: 214 }, { fund: "Offering", amount: 12_950, givers: 402 }, { fund: "Building fund", amount: 6_200, givers: 41 }, { fund: "Missions", amount: 1_100, givers: 18 }],
  "mwansa-funeral": [{ fund: "Funeral costs", amount: 36_850, givers: 171 }, { fund: "Support for the family", amount: 11_500, givers: 41 }],
};

export const recentGifts: Record<string, { at: string; name: string; fund: string; amount: number; method: string }[]> = {
  "grace-chapel": [
    { at: "11:42", name: "Anonymous", fund: "Offering", amount: 100, method: "MTN MoMo" },
    { at: "11:41", name: "Bupe Kunda", fund: "Tithe", amount: 850, method: "Airtel Money" },
    { at: "11:39", name: "Anonymous", fund: "Building fund", amount: 500, method: "Visa" },
    { at: "11:37", name: "Daliso Mbewe", fund: "Offering", amount: 50, method: "MTN MoMo" },
    { at: "11:36", name: "Anonymous", fund: "Tithe", amount: 1_200, method: "Zamtel Kwacha" },
  ],
  "mwansa-funeral": [
    { at: "Today 10:12", name: "Kalulushi Teachers' Union", fund: "Funeral costs", amount: 2_500, method: "Bank card" },
    { at: "Today 09:58", name: "Ruth Chanda", fund: "Support for the family", amount: 300, method: "MTN MoMo" },
    { at: "Today 09:40", name: "Anonymous", fund: "Funeral costs", amount: 200, method: "Airtel Money" },
    { at: "Yesterday 21:15", name: "Moses Kabwe", fund: "Funeral costs", amount: 500, method: "MTN MoMo" },
  ],
};

/* Food and merchandise (Summer Jam, event-day preview) ----------------------
 * Attendant totals add up to sold × price for the items at their point, so the
 * balance screen reconciles: Food court A = f1 + f2, Food court B = f3,
 * Bar = d1 + d2 + d3, Merchandise stand = m1 + m2 + m3. */

export const menus: Record<string, MenuItem[]> = {
  e1: [
    { id: "f1", name: "Chicken and chips", kind: "Food", price: 120, point: "Food court A", opening: 1_200, restocked: 200, sold: 1_166, writtenOff: 14, art: { icon: "chicken", from: "#F4A630", to: "#C77C3A" } },
    { id: "f2", name: "Beef burger", kind: "Food", price: 100, point: "Food court A", opening: 900, restocked: 0, sold: 702, writtenOff: 6, art: { icon: "burger", from: "#C77C3A", to: "#7A3E12" } },
    { id: "f3", name: "Nshima with T-bone", kind: "Food", price: 150, point: "Food court B", opening: 600, restocked: 0, sold: 598, writtenOff: 2, art: { icon: "beef", from: "#8A5A00", to: "#3A2C14" } },
    { id: "d1", name: "Water 500 ml", kind: "Drinks", price: 15, point: "Bar", opening: 3_000, restocked: 600, sold: 2_890, writtenOff: 10, art: { icon: "water", from: "#5BC0EB", to: "#0B7A75" } },
    { id: "d2", name: "Soft drink", kind: "Drinks", price: 25, point: "Bar", opening: 2_400, restocked: 0, sold: 1_970, writtenOff: 12, art: { icon: "soda", from: "#D62F45", to: "#7A1020" } },
    { id: "d3", name: "Mosi lager", kind: "Drinks", price: 35, point: "Bar", opening: 4_000, restocked: 1_000, sold: 3_812, writtenOff: 40, note: "18+ only. ID checked at the bar", art: { icon: "beer", from: "#F4C430", to: "#B07A00" } },
    { id: "m1", name: "Summer Jam T-shirt (M)", kind: "Merchandise", price: 250, point: "Merchandise stand", opening: 120, restocked: 20, sold: 112, writtenOff: 3, counted: 23, art: { icon: "shirt", from: "#0B7A75", to: "#172033" } },
    { id: "m2", name: "Summer Jam T-shirt (L)", kind: "Merchandise", price: 250, point: "Merchandise stand", opening: 150, restocked: 0, sold: 131, writtenOff: 1, counted: 18, art: { icon: "shirt", from: "#172033", to: "#0B7A75" } },
    { id: "m3", name: "Summer Jam cap", kind: "Merchandise", price: 150, point: "Merchandise stand", opening: 200, restocked: 0, sold: 87, writtenOff: 0, counted: 113, art: { icon: "cap", from: "#5B2A86", to: "#172033" } },
  ],
  e30: [
    { id: "x1", name: "Village chicken and nshima", kind: "Food", price: 90, point: "Food court", opening: 800, restocked: 0, sold: 512, writtenOff: 4, art: { icon: "chicken", from: "#1F9D55", to: "#0B5A32" } },
    { id: "x2", name: "Samosas (3)", kind: "Food", price: 30, point: "Food court", opening: 1_500, restocked: 0, sold: 1_120, writtenOff: 10, art: { icon: "snack", from: "#F4A630", to: "#8A5A00" } },
    { id: "x3", name: "Water 500 ml", kind: "Drinks", price: 15, point: "Food court", opening: 2_000, restocked: 0, sold: 1_640, writtenOff: 0, art: { icon: "water", from: "#5BC0EB", to: "#0B7A75" } },
  ],
};

export const orders: Record<string, Order[]> = {
  e1: [
    { number: "A-0231", at: "21:14", buyer: "Natasha P.", lines: [{ item: "f1", qty: 2 }, { item: "d2", qty: 2 }], method: "MOBILE_MONEY", status: "Waiting", point: "Food court A" },
    { number: "A-0230", at: "21:12", buyer: "Joseph Z.", lines: [{ item: "f2", qty: 1 }], method: "CASH", status: "Preparing", point: "Food court A" },
    { number: "A-0229", at: "21:10", buyer: "Grace T.", lines: [{ item: "f1", qty: 1 }, { item: "d1", qty: 1 }], method: "CARD", status: "Ready", point: "Food court A", table: "VIP table 6" },
    { number: "A-0226", at: "20:58", buyer: "Mapalo N.", lines: [{ item: "f1", qty: 1, given: 1 }, { item: "d3", qty: 2, given: 1 }], method: "MOBILE_MONEY", status: "Part collected", point: "Food court A", attendant: "Joseph Banda", paidMethod: "MOBILE_MONEY", ref: "MP261218.2058.K11870" },
    { number: "A-0228", at: "21:06", buyer: "Brian M.", lines: [{ item: "f2", qty: 2 }, { item: "d3", qty: 2 }], method: "CASH", status: "Collected", point: "Food court A", attendant: "Joseph Banda", paidMethod: "CASH" },
    { number: "M-0088", at: "21:03", buyer: "Walk-up", lines: [{ item: "m1", qty: 1 }, { item: "m3", qty: 1 }], method: "MOBILE_MONEY", status: "Collected", point: "Merchandise stand", attendant: "Brian Chanda", paidMethod: "MOBILE_MONEY", ref: "MP261218.2103.K44120", quick: true },
    { number: "A-0227", at: "21:01", buyer: "Thandiwe L.", lines: [{ item: "f1", qty: 1 }], method: "CASH", status: "Collected", point: "Food court A", attendant: "Joseph Banda", paidMethod: "CARD", ref: "004417" },
    { number: "A-0219", at: "20:22", buyer: "Kelvin S.", lines: [{ item: "f3", qty: 2 }], method: "CASH", status: "Cancelled", point: "Food court B" },
  ],
};

export const attendants: Record<string, Attendant[]> = {
  e1: [
    { id: "s1", name: "Joseph Banda", point: "Food court A", orders: 1_402, cash: 98_400, card: 61_300, cardReceipts: 488, mobile: 50_420, mobileRefs: 391, handedIn: 98_200 },
    { id: "s9", name: "Mercy Zulu", point: "Food court B", orders: 301, cash: 31_200, card: 8_400, cardReceipts: 38, mobile: 50_100, mobileRefs: 211 },
    { id: "s2", name: "Ruth Mwale", point: "Bar", orders: 2_180, cash: 98_350, card: 41_200, cardReceipts: 402, mobile: 86_470, mobileRefs: 790, handedIn: 98_400 },
    { id: "s3", name: "Brian Chanda", point: "Merchandise stand", orders: 196, cash: 32_750, card: 21_500, cardReceipts: 58, mobile: 19_550, mobileRefs: 52, handedIn: 32_750,
      issued: [{ item: "m1", issued: 60, sold: 52, returned: 6 }, { item: "m2", issued: 60, sold: 57, returned: 3 }, { item: "m3", issued: 40, sold: 31 }] },
  ],
};

/* The signed-in attendee's food and merchandise orders (account › Orders) --- */

export const myFoodOrders: (import("@/lib/event-day").Order & { event: string; eventSlug: string })[] = [
  { number: "A-0229", at: "Today 21:10", event: "Lusaka Summer Jam", eventSlug: "lusaka-summer-jam-2026", buyer: "Chanda M.", lines: [{ item: "f1", qty: 1 }, { item: "d1", qty: 1 }], method: "CARD", status: "Ready", point: "Food court A", table: "VIP table 6" },
  { number: "M-0071", at: "Today 19:40", event: "Lusaka Summer Jam", eventSlug: "lusaka-summer-jam-2026", buyer: "Chanda M.", lines: [{ item: "m1", qty: 2 }], method: "CASH", status: "Collected", point: "Merchandise stand", attendant: "Brian Chanda", paidMethod: "CASH" },
  { number: "A-0198", at: "Today 19:02", event: "Lusaka Summer Jam", eventSlug: "lusaka-summer-jam-2026", buyer: "Chanda M.", lines: [{ item: "f2", qty: 2, given: 2 }, { item: "d2", qty: 2, given: 1 }], method: "MOBILE_MONEY", status: "Part collected", point: "Food court A", attendant: "Joseph Banda", paidMethod: "MOBILE_MONEY", ref: "MP261218.1902.K09213" },
];
