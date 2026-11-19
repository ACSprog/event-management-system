/**
 * Sample data for the dashboards (super admin, organiser, attendee) and for
 * contribution cashouts. "Today" is 18 Nov 2026, like the rest of the mock data.
 */

/* Contribution money ------------------------------------------------------ */

/**
 * Contribution money (paid pledges, donations, family contributions) is kept
 * apart from ticket money. It is non-refundable except for a system failure on
 * EMS's side, and the organiser may cash out cleared funds at any time.
 * Cashouts at or below the daily limit are released automatically once every
 * check passes; anything above goes to EMS finance.
 */
export interface CashoutSettings {
  /** Automatic below the limit is the agreed launch rule (18 Nov 2026). */
  mode: "AUTOMATIC_BELOW_LIMIT" | "FINANCE_APPROVES_ALL";
  /** Daily automatic limit per organisation, in kwacha. Placeholder until the owner sets it. */
  dailyLimit: number;
  /** Card contributions are held this many business days before they count as cleared. */
  cardClearingDays: number;
  /** First cashout of a new organisation is capped. */
  firstCashoutCap: number;
}

export const cashoutSettings: CashoutSettings = { mode: "AUTOMATIC_BELOW_LIMIT", dailyLimit: 5_000, cardClearingDays: 3, firstCashoutCap: 2_000 };

export type CashoutStatus = "RELEASED" | "WAITING_FOR_FINANCE" | "AWAITING_SECOND_APPROVAL" | "REJECTED";

export interface Cashout {
  id: string;
  orgId: string;
  orgName: string;
  occasion: string;
  amount: number;
  to: string;
  requestedBy: string;
  at: string;
  route: "AUTOMATIC" | "FINANCE";
  status: CashoutStatus;
  note?: string;
}

export const cashouts: Cashout[] = [
  { id: "CO-0071", orgId: "org9", orgName: "Mutale Family", occasion: "Mutale's Kitchen Party", amount: 4_000, to: "MTN MoMo ****4821", requestedBy: "Esther Mutale", at: "2026-11-17 16:10", route: "AUTOMATIC", status: "RELEASED" },
  { id: "CO-0070", orgId: "org10", orgName: "Banda Funeral Committee", occasion: "Funeral of the late Mr J. Banda", amount: 2_500, to: "Airtel Money ****1190", requestedBy: "Ruth Banda", at: "2026-11-17 09:02", route: "AUTOMATIC", status: "RELEASED" },
  { id: "CO-0072", orgId: "org3", orgName: "Grace Chapel International", occasion: "Building fund drive", amount: 18_000, to: "Zanaco ****7712", requestedBy: "Pastor Mwale", at: "2026-11-18 08:40", route: "FINANCE", status: "WAITING_FOR_FINANCE", note: "Above the K5,000 daily limit" },
  { id: "CO-0073", orgId: "org9", orgName: "Mutale Family", occasion: "Mutale's Kitchen Party", amount: 9_500, to: "MTN MoMo ****4821", requestedBy: "Esther Mutale", at: "2026-11-18 10:05", route: "FINANCE", status: "WAITING_FOR_FINANCE", note: "Above the K5,000 daily limit" },
];

/** The organiser's own contribution balance (Zed Live's "Summer Jam community fund"). */
export const orgContributions = {
  orgId: "org1",
  occasion: "Summer Jam community fund",
  pledged: 40_000,
  paid: 27_500,
  clearing: 3_000,
  available: 24_500,
  last: { amount: 4_000, at: "2026-11-17", route: "AUTOMATIC" as const },
};

/* Super admin ------------------------------------------------------------- */

export const missingCallbacks = [
  { provider: "Airtel Money", ref: "AM-7731902", amount: 450, at: "2026-11-18 09:12" },
  { provider: "Airtel Money", ref: "AM-7731988", amount: 300, at: "2026-11-18 09:14" },
];

/** Finance setting changes waiting for a second finance person to confirm. */
export const pendingFinanceChanges = [
  { id: "FC-014", what: "Organiser review window from 2 to 3 business days", by: "Bwalya Phiri", at: "2026-11-17 15:30" },
];

export const platformNow = [
  ["Events live today", "14"],
  ["Scanners online", "212"],
  ["Payments in the last hour", "3,804"],
  ["Payment success rate", "96.9%"],
  ["Notification queue", "1,204 waiting"],
] as const;

export const serviceStatus: { name: string; state: "ok" | "slow" | "down"; note: string; buyerImpact?: string }[] = [
  { name: "MTN MoMo", state: "ok", note: "Confirming in about 40 s" },
  { name: "Airtel Money", state: "slow", note: "Slow callbacks since 13:40", buyerImpact: "Airtel buyers may wait up to 2 minutes for confirmation. Their tickets stay held while they wait." },
  { name: "Zamtel Kwacha", state: "ok", note: "Normal" },
  { name: "Cards", state: "ok", note: "Normal" },
  { name: "SMS", state: "ok", note: "98.2% delivered" },
];

export const adminActivity = [
  { what: "Natasha Zulu approved ST-GC-0112 (K44,100)", at: "08:40" },
  { what: "System released 2 contribution cashouts under the daily limit", at: "08:15" },
  { what: "Chileshe Banda verified Kafue Events (PACRA, director ID, test payment)", at: "Yesterday" },
  { what: "Bwalya Phiri proposed a finance setting change", at: "Yesterday" },
  { what: "Kunda Siame removed personal data from a review", at: "16 Nov" },
];

/* Organiser --------------------------------------------------------------- */

export const orgNow = {
  normal: [
    ["Events live today", "None"],
    ["Next event", "Lusaka Summer Jam, in 25 days"],
    ["Scanners registered", "8 (ticket lists download the day before)"],
    ["Payment success, last hour", "97.4%"],
    ["Messages waiting to send", "1,180 reminder SMS"],
  ],
  eventDay: [
    ["Event live", "Lusaka Summer Jam"],
    ["Checked in", "3,912 of 6,000"],
    ["Check-ins, last 15 minutes", "412"],
    ["Scanners online", "8 of 8, last scan 4 s ago"],
    ["Gate B (VIP)", "Queue about 6 minutes"],
    ["Help requests open", "4 (1 waiting over 2 minutes)"],
  ],
} as const;

/** Buyers who still have to choose after an event was postponed. */
export const disruptionChoices = { event: "Copperbelt Nights: Kitwe", newDate: "24 Jan 2027", deadline: "30 Nov", waiting: 7 };

export const orgTasksToday = [
  { task: "Confirm medical cover with the Red Cross", owner: "Chanda Mulenga", due: "Today" },
  { task: "Gate staff briefing", owner: "Kelvin Sakala", due: "Fri" },
  { task: "Print wristbands", owner: "Chanda Mulenga", due: "Mon" },
];

/* Attendee ---------------------------------------------------------------- */

export const myPending = {
  incomingTransfers: [{ from: "Mwansa Kunda", event: "Lusaka Summer Jam", type: "Standard", expires: "in 2 days" }],
  postponements: [{ event: "Copperbelt Nights: Kitwe", newDate: "24 Jan 2027", deadline: "30 Nov" }],
  waitlistOffers: [{ event: "Grace Chapel National Convention", window: "until 20:00 today", qty: 1 }],
};

export const mySaved = [
  { title: "Copperbelt Mining & Investment Indaba", when: "Feb 2027", price: "From K1,500", availability: "Limited" },
  { title: "Livingstone Jazz Weekend", when: "Mar 2027", price: "From K350", availability: "On sale" },
  { title: "Lusaka Book Fair", when: "Jan 2027", price: "Free", availability: "Register" },
];

export const myFollowing = ["Zed Live Entertainment", "Grace Chapel International", "SkillUp Academy", "Kafue Events"];

export const myContributions = [{ to: "Mutale's Kitchen Party", amount: 500, at: "2026-11-10", receipt: "CN-55120" }];

export const myReferral = { code: "REF-CHANDA", link: "eventra.example/r/chanda", discount: "10% off a friend's first ticket", used: 3 };

export const myNearby = [
  { title: "Sunday Gospel Picnic", when: "Sat", price: "Free" },
  { title: "Lusaka Night Market", when: "Sat", price: "K50" },
  { title: "Comedy at the Arcades", when: "Sun", price: "K120" },
];

export const myActivity = [
  { what: "Bought 2 Standard tickets for Lusaka Summer Jam", at: "2 Nov" },
  { what: "Contributed K500 to Mutale's Kitchen Party", at: "10 Nov" },
  { what: "Followed Kafue Events", at: "9 Nov" },
  { what: "Refund of K250 paid to MTN MoMo ending 4471", at: "15 Nov" },
];

/* Who came: gender of checked-in attendees (from account and per-ticket answers). */
export const genderReport = {
  event: "Lusaka Summer Jam (sample figures)",
  checkedIn: { female: 14_820, male: 13_310, notStated: 910 },
  sold: { female: 15_960, male: 14_180, notStated: 1_020 },
  byTicket: [
    { ticket: "Standard", female: 11_204, male: 10_015, notStated: 702 },
    { ticket: "Early bird", female: 2_310, male: 2_188, notStated: 140 },
    { ticket: "VIP", female: 1_212, male: 1_049, notStated: 61 },
    { ticket: "VVIP table of 8", female: 94, male: 58, notStated: 7 },
  ],
  previous: { event: "Zed Live Sessions: October", femalePct: 49, malePct: 47 },
};
