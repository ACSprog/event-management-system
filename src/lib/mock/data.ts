// DEMO DATA ONLY. Clearly separated from production records.
// Every export here is replaced by a real API call in src/lib/api.

export type Category =
  | "Music"
  | "Conference"
  | "Wedding"
  | "Sports"
  | "Church"
  | "Workshop"
  | "Exhibition"
  | "Charity"
  | "Comedy"
  | "Education";

export type EventStatus =
  | "Draft"
  | "Pending approval"
  | "Published"
  | "Registration open"
  | "Sold out"
  | "In progress"
  | "Completed"
  | "Cancelled";

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  sold: number;
  salesEnd: string;
  perOrderLimit: number;
}

export interface EventItem {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: Category;
  status: EventStatus;
  format: "Physical" | "Virtual" | "Hybrid";
  orgId: string;
  venueId: string;
  start: string;
  end: string;
  city: string;
  distanceKm: number;
  description: string;
  tickets: TicketType[];
  rating?: number;
  reviews?: number;
  seating: "Reserved" | "General" | "Tables";
  lineup?: string[];
  schedule?: { time: string; title: string; detail?: string }[];
  faqs?: { q: string; a: string }[];
  palette: [string, string];
}

export interface Organisation {
  id: string;
  slug: string;
  name: string;
  type: string;
  city: string;
  plan: "Starter" | "Growth" | "Enterprise";
  status: "Active" | "Pending" | "Suspended" | "Trial";
  joined: string;
  events: number;
  revenue: number;
  followers: number;
  verified: boolean;
  about: string;
}

export interface Venue {
  id: string;
  name: string;
  city: string;
  address: string;
  capacity: number;
  lat: number;
  lng: number;
  facilities: string[];
  rooms: { name: string; capacity: number }[];
  dayRate: number;
  rating: number;
}

export const organisations: Organisation[] = [
  { id: "org1", slug: "zed-live", name: "Zed Live Entertainment", type: "Concert promoter", city: "Lusaka", plan: "Enterprise", status: "Active", joined: "2025-03-14", events: 48, revenue: 4_820_400, followers: 21_400, verified: true, about: "Lusaka's biggest live music promoter since 2011. We run Lusaka July Fest, Copperbelt Nights and the Zed Live Sessions series." },
  { id: "org2", slug: "copperbelt-business-forum", name: "Copperbelt Business Forum", type: "Business association", city: "Kitwe", plan: "Growth", status: "Active", joined: "2025-06-02", events: 17, revenue: 1_204_900, followers: 6_210, verified: true, about: "Connecting mining, manufacturing and services on the Copperbelt through conferences, trade fairs and executive breakfasts." },
  { id: "org3", slug: "grace-chapel", name: "Grace Chapel International", type: "Church", city: "Lusaka", plan: "Growth", status: "Active", joined: "2025-09-21", events: 31, revenue: 312_750, followers: 9_880, verified: true, about: "A Lusaka church family running conventions, youth camps and community outreach across Zambia." },
  { id: "org4", slug: "skillup-academy", name: "SkillUp Academy", type: "Training provider", city: "Ndola", plan: "Starter", status: "Active", joined: "2026-01-11", events: 22, revenue: 186_300, followers: 3_140, verified: false, about: "Short courses in digital skills, bookkeeping and project management, online and in Ndola." },
  { id: "org5", slug: "chipolopolo-sports", name: "Chipolopolo Sports Events", type: "Sports organiser", city: "Ndola", plan: "Growth", status: "Active", joined: "2025-11-08", events: 12, revenue: 2_018_000, followers: 14_700, verified: true, about: "Football tournaments, marathons and community sports days." },
  { id: "org6", slug: "hope-foundation", name: "Hope Children's Foundation", type: "Charity", city: "Livingstone", plan: "Starter", status: "Trial", joined: "2026-10-28", events: 3, revenue: 94_500, followers: 1_210, verified: false, about: "Raising funds for school feeding and bursaries in Southern Province." },
  { id: "org7", slug: "laugh-out-lusaka", name: "Laugh Out Lusaka", type: "Comedy collective", city: "Lusaka", plan: "Starter", status: "Pending", joined: "2026-11-12", events: 0, revenue: 0, followers: 0, verified: false, about: "Stand-up comedy nights." },
];

export const venues: Venue[] = [
  { id: "v1", name: "Heroes National Stadium", city: "Lusaka", address: "Great East Road, Lusaka", capacity: 60_000, lat: -15.3647, lng: 28.3667, facilities: ["Parking", "VIP boxes", "Stage power", "First aid", "Floodlights"], rooms: [{ name: "Main pitch", capacity: 60_000 }, { name: "VIP lounge", capacity: 400 }], dayRate: 185_000, rating: 4.2 },
  { id: "v2", name: "Mulungushi International Conference Centre", city: "Lusaka", address: "Great East Road, Lusaka", capacity: 3_200, lat: -15.3897, lng: 28.3301, facilities: ["Wi-Fi", "Simultaneous interpretation", "Breakout rooms", "Catering kitchen", "Parking"], rooms: [{ name: "Main hall", capacity: 2_000 }, { name: "Chambers A", capacity: 300 }, { name: "Chambers B", capacity: 300 }, { name: "Board room", capacity: 40 }], dayRate: 62_000, rating: 4.5 },
  { id: "v3", name: "Levy Park Amphitheatre", city: "Lusaka", address: "Church Road, Lusaka", capacity: 2_500, lat: -15.4093, lng: 28.2871, facilities: ["Stage", "Sound rig", "Bar", "Security"], rooms: [{ name: "Amphitheatre", capacity: 2_500 }], dayRate: 38_000, rating: 4.4 },
  { id: "v4", name: "Garden Court Kitwe Ballroom", city: "Kitwe", address: "Freedom Avenue, Kitwe", capacity: 800, lat: -12.8024, lng: 28.2132, facilities: ["Wi-Fi", "Projector", "Catering", "Parking"], rooms: [{ name: "Ballroom", capacity: 800 }, { name: "Nkana room", capacity: 120 }], dayRate: 24_000, rating: 4.3 },
  { id: "v5", name: "Levy Mwanawasa Stadium", city: "Ndola", address: "Ndola–Kitwe Road, Ndola", capacity: 49_800, lat: -12.9585, lng: 28.6366, facilities: ["Parking", "Floodlights", "Media centre", "First aid"], rooms: [{ name: "Main pitch", capacity: 49_800 }], dayRate: 140_000, rating: 4.1 },
  { id: "v6", name: "Victoria Falls Riverside Lawn", city: "Livingstone", address: "Mosi-oa-Tunya Road, Livingstone", capacity: 600, lat: -17.8591, lng: 25.8566, facilities: ["Marquee", "Garden", "Catering", "Accommodation"], rooms: [{ name: "Riverside lawn", capacity: 600 }], dayRate: 31_000, rating: 4.8 },
  { id: "v7", name: "Grace Chapel Main Sanctuary", city: "Lusaka", address: "Chalala, Lusaka", capacity: 4_000, lat: -15.4612, lng: 28.3304, facilities: ["Sound", "Parking", "Children's area"], rooms: [{ name: "Sanctuary", capacity: 4_000 }, { name: "Fellowship hall", capacity: 500 }], dayRate: 0, rating: 4.6 },
];

const t = (id: string, name: string, price: number, capacity: number, sold: number, description = "", perOrderLimit = 6, salesEnd = "2026-12-12T18:00:00+02:00"): TicketType => ({ id, name, price, capacity, sold, description, perOrderLimit, salesEnd });

export const events: EventItem[] = [
  {
    id: "e1", slug: "lusaka-summer-jam-2026", title: "Lusaka Summer Jam", subtitle: "Ten acts, one night, under the stars", category: "Music", status: "Registration open", format: "Physical", orgId: "org1", venueId: "v1",
    start: "2026-12-12T16:00:00+02:00", end: "2026-12-13T01:00:00+02:00", city: "Lusaka", distanceKm: 4.2, seating: "General", palette: ["#0B7A75", "#F4A630"], rating: 4.6, reviews: 812,
    description: "The biggest end-of-year concert in Lusaka returns to Heroes Stadium. Gates open at 16:00, music runs until 01:00. Food courts, a VIP terrace with its own bar, and free shuttle buses from Manda Hill and East Park.",
    lineup: ["Yo Maps", "Macky 2", "Chef 187", "Towela Kaira", "Xaven", "DJ Sebastian"],
    schedule: [{ time: "16:00", title: "Gates open" }, { time: "17:30", title: "Opening DJ set", detail: "DJ Sebastian" }, { time: "19:00", title: "Rising stars stage" }, { time: "21:00", title: "Headline acts" }, { time: "01:00", title: "Close" }],
    faqs: [{ q: "Can I bring food or drinks?", a: "No outside food or drinks. Food courts accept cash, MTN MoMo and Airtel Money." }, { q: "Is there an age limit?", a: "Under-16s must come with an adult. ID is checked for the VIP bar." }, { q: "Can I get a refund?", a: "Refunds are available until 5 December. After that, you can transfer your ticket to someone else." }],
    tickets: [t("t1", "Early bird", 150, 5000, 5000, "Standing, general area"), t("t2", "Standard", 250, 30000, 21_340, "Standing, general area"), t("t3", "VIP", 750, 3000, 2_410, "VIP terrace, own bar and toilets", 4), t("t4", "VVIP table of 8", 8000, 40, 31, "Reserved table, bottle service, host", 1)],
  },
  {
    id: "e2", slug: "copperbelt-mining-indaba", title: "Copperbelt Mining & Investment Indaba", subtitle: "Two days on the future of Zambian copper", category: "Conference", status: "Registration open", format: "Hybrid", orgId: "org2", venueId: "v4",
    start: "2027-02-17T08:00:00+02:00", end: "2027-02-18T17:00:00+02:00", city: "Kitwe", distanceKm: 312, seating: "Reserved", palette: ["#172033", "#C77C3A"], rating: 4.4, reviews: 96,
    description: "Mine operators, suppliers, financiers and government meet to discuss the copper production target, local content and green energy for mining. Includes an exhibition of 60 suppliers and a networking dinner.",
    lineup: ["Ministry of Mines representative", "Chamber of Mines CEO", "Bank of Zambia economist", "ZCCM-IH director"],
    schedule: [{ time: "Day 1, 08:00", title: "Registration and breakfast" }, { time: "Day 1, 09:00", title: "Keynote: Copper to 2030" }, { time: "Day 1, 14:00", title: "Track A: Local content · Track B: Financing" }, { time: "Day 1, 19:00", title: "Networking dinner" }, { time: "Day 2, 09:00", title: "Energy and mining panel" }],
    tickets: [t("t5", "Delegate", 3500, 500, 312, "Both days, lunch, materials"), t("t6", "Corporate pack of 5", 15000, 40, 18, "Five delegate passes", 2), t("t7", "Virtual pass", 800, 2000, 640, "Livestream and recordings"), t("t8", "Exhibitor booth", 12000, 60, 47, "3×3m booth, two passes", 1)],
  },
  {
    id: "e3", slug: "grace-chapel-convention", title: "Grace Chapel National Convention", subtitle: "Four days of worship, word and fellowship", category: "Church", status: "Registration open", format: "Hybrid", orgId: "org3", venueId: "v7",
    start: "2026-12-27T09:00:00+02:00", end: "2026-12-30T21:00:00+02:00", city: "Lusaka", distanceKm: 9.8, seating: "General", palette: ["#5B2A86", "#F4A630"], rating: 4.9, reviews: 1_240,
    description: "Our annual convention, with guest speakers, a youth track and a children's programme. Registration is free; meal packs are optional. Online attendees can join the livestream.",
    tickets: [t("t9", "Free registration", 0, 4000, 2_870, "All sessions"), t("t10", "Meal pack (4 days)", 200, 1500, 1_022, "Lunch each day"), t("t11", "Youth camp", 350, 400, 388, "Accommodation and meals, ages 13–19")],
  },
  {
    id: "e4", slug: "zambia-super-league-derby", title: "Lusaka Derby: Zesco vs Power Dynamos", subtitle: "Super League, matchday 14", category: "Sports", status: "Registration open", format: "Physical", orgId: "org5", venueId: "v5",
    start: "2026-11-29T15:00:00+02:00", end: "2026-11-29T17:00:00+02:00", city: "Ndola", distanceKm: 320, seating: "Reserved", palette: ["#1F9D55", "#172033"], rating: 4.1, reviews: 302,
    description: "Matchday 14 of the Super League. Reserved seating in all stands. Home and away sections are separated; please buy in your team's section.",
    tickets: [t("t12", "Open stand", 50, 30000, 18_420), t("t13", "Covered stand", 120, 12000, 9_870), t("t14", "VIP stand", 400, 1500, 1_204, "", 4)],
  },
  {
    id: "e5", slug: "digital-marketing-bootcamp", title: "Digital Marketing Bootcamp", subtitle: "Six weeks, twelve live lessons, one certificate", category: "Education", status: "Registration open", format: "Virtual", orgId: "org4", venueId: "v2",
    start: "2027-01-12T18:00:00+02:00", end: "2027-02-18T20:00:00+02:00", city: "Online", distanceKm: 0, seating: "General", palette: ["#0B7A75", "#D62F45"], rating: 4.7, reviews: 211,
    description: "Learn social media, paid ads, email and analytics for small businesses. Live on Zoom on Tuesdays and Thursdays at 18:00, with recordings, assignments and a certificate.",
    tickets: [t("t15", "Full course", 1200, 80, 61, "12 lessons, materials, certificate"), t("t16", "Pay per session", 150, 200, 74, "One live lesson"), t("t17", "Instalments (3 × K420)", 1260, 40, 22, "Pay over three months")],
  },
  {
    id: "e6", slug: "hope-charity-gala", title: "Hope Charity Gala Dinner", subtitle: "Feeding 2,000 learners in Southern Province", category: "Charity", status: "Registration open", format: "Physical", orgId: "org6", venueId: "v6",
    start: "2027-01-23T18:30:00+02:00", end: "2027-01-23T23:30:00+02:00", city: "Livingstone", distanceKm: 476, seating: "Tables", palette: ["#C77C3A", "#172033"], rating: 4.8, reviews: 38,
    description: "A three-course dinner by the Zambezi with a live auction and a performance by the Livingstone Youth Choir. All proceeds support school feeding.",
    tickets: [t("t18", "Single seat", 1500, 300, 164), t("t19", "Table of 10", 13500, 25, 14, "", 1)],
  },
  {
    id: "e7", slug: "laugh-out-loud-friday", title: "Laugh Out Loud Friday", subtitle: "Stand-up night with six comedians", category: "Comedy", status: "Sold out", format: "Physical", orgId: "org1", venueId: "v3",
    start: "2026-11-27T19:30:00+02:00", end: "2026-11-27T22:30:00+02:00", city: "Lusaka", distanceKm: 2.1, seating: "Reserved", palette: ["#D62F45", "#F4A630"], rating: 4.5, reviews: 154,
    description: "Six of Lusaka's funniest comedians, hosted by MC Kaluba. Recommended for ages 18 and over.",
    tickets: [t("t20", "Standard", 200, 1800, 1800), t("t21", "Front rows", 400, 300, 300)],
  },
  {
    id: "e8", slug: "zambia-agri-expo", title: "Zambia Agri & Food Expo", subtitle: "Three days of farming tech, produce and deals", category: "Exhibition", status: "Published", format: "Physical", orgId: "org2", venueId: "v2",
    start: "2027-03-10T09:00:00+02:00", end: "2027-03-12T17:00:00+02:00", city: "Lusaka", distanceKm: 7.5, seating: "General", palette: ["#1F9D55", "#F4A630"],
    description: "Over 200 exhibitors in irrigation, seed, machinery, finance and agro-processing. Free business matchmaking for registered visitors.",
    tickets: [t("t22", "Visitor day pass", 50, 15000, 2_140), t("t23", "Trade visitor (3 days)", 300, 3000, 410), t("t24", "Exhibitor booth", 9500, 200, 128, "", 2)],
  },
  {
    id: "e9", slug: "kabwata-photography-workshop", title: "Phone Photography Workshop", subtitle: "One afternoon, better photos for your business", category: "Workshop", status: "Registration open", format: "Physical", orgId: "org4", venueId: "v2",
    start: "2026-12-05T14:00:00+02:00", end: "2026-12-05T17:00:00+02:00", city: "Lusaka", distanceKm: 7.5, seating: "General", palette: ["#172033", "#0B7A75"], rating: 4.6, reviews: 44,
    description: "Lighting, composition and editing on the phone you already own. Bring a product to photograph.",
    tickets: [t("t25", "Workshop seat", 150, 40, 33)],
  },
  {
    id: "e10", slug: "mwila-and-chanda-wedding", title: "Mwila & Chanda's Wedding", subtitle: "Private event. Invited guests only", category: "Wedding", status: "Published", format: "Physical", orgId: "org3", venueId: "v6",
    start: "2027-04-17T14:00:00+02:00", end: "2027-04-17T23:00:00+02:00", city: "Livingstone", distanceKm: 476, seating: "Tables", palette: ["#5B2A86", "#E9C8D0"],
    description: "Ceremony at 14:00 followed by the reception on the riverside lawn. Please RSVP by 1 March and tell us your meal choice.",
    tickets: [t("t26", "Invited guest", 0, 250, 182)],
  },
];

export const statusTone: Record<string, "teal" | "gold" | "red" | "green" | "grey"> = {
  Draft: "grey", "Pending approval": "gold", Published: "teal", "Registration open": "green", "Sold out": "red", "In progress": "teal", Completed: "grey", Cancelled: "red",
  Active: "green", Pending: "gold", Suspended: "red", Trial: "teal",
};

export const orgEventsExtra: EventItem[] = [
  { ...events[0], id: "e11", slug: "copperbelt-nights-kitwe", title: "Copperbelt Nights: Kitwe", status: "Draft", start: "2027-02-27T18:00:00+02:00", city: "Kitwe", tickets: events[0].tickets.map((x) => ({ ...x, sold: 0 })), rating: undefined, reviews: undefined },
  { ...events[0], id: "e12", slug: "zed-live-sessions-oct", title: "Zed Live Sessions: October", status: "Completed", start: "2026-10-24T19:00:00+02:00", venueId: "v3", tickets: events[0].tickets.slice(1, 3).map((x) => ({ ...x, capacity: 1200, sold: 1189 })), rating: 4.4, reviews: 233 },
  { ...events[0], id: "e13", slug: "new-year-countdown", title: "New Year's Eve Countdown", status: "Pending approval", start: "2026-12-31T20:00:00+02:00", venueId: "v3", tickets: events[0].tickets.slice(1, 3).map((x) => ({ ...x, sold: 0 })), rating: undefined, reviews: undefined },
];

export function orgEvents(orgId = "org1") {
  return [...events.filter((e) => e.orgId === orgId), ...orgEventsExtra];
}

export const people = [
  "Chanda Mulenga", "Mwila Banda", "Natasha Phiri", "Joseph Zulu", "Grace Tembo", "Brian Mwansa", "Thandiwe Lungu", "Kelvin Sakala", "Mutinta Hamoonga", "Peter Chileshe",
  "Bupe Kunda", "Mapalo Ngoma", "Daliso Mbewe", "Precious Nyirenda", "Musonda Kapwepwe", "Lubinda Simasiku", "Chipo Daka", "Emmanuel Musonda", "Ruth Chanda", "Moses Kabwe",
  "Agness Mutale", "Victor Siame", "Faith Mumba", "Kondwani Phiri",
];

export const attendees = people.map((name, i) => ({
  id: `a${i + 1}`,
  name,
  email: `${name.toLowerCase().replace(/ /g, ".")}@mail.example`,
  phone: `+260 9${(i % 3) + 5}${String(1000000 + i * 37511).slice(0, 7)}`,
  ticket: ["Standard", "VIP", "Standard", "Early bird", "Standard", "VVIP table of 8"][i % 6],
  ref: `EVT-${(482913 + i * 1371).toString(36).toUpperCase()}`,
  paid: [250, 750, 250, 150, 250, 8000][i % 6],
  method: ["MTN MoMo", "Airtel Money", "Visa card", "MTN MoMo", "Zamtel Kwacha", "Bank transfer"][i % 6],
  checkedIn: i % 3 !== 0 ? `2026-12-12T${16 + (i % 4)}:${String((i * 7) % 60).padStart(2, "0")}:00+02:00` : null,
  gate: ["Gate A", "Gate B", "VIP gate", "Gate A"][i % 4],
}));

export const customers = people.map((name, i) => ({
  id: `c${i + 1}`,
  name,
  email: `${name.toLowerCase().replace(/ /g, ".")}@mail.example`,
  city: ["Lusaka", "Kitwe", "Ndola", "Livingstone", "Lusaka", "Kabwe"][i % 6],
  events: (i * 3) % 11 + 1,
  spent: ((i * 977) % 6000) + 250,
  lastSeen: `2026-${String(11 - (i % 5)).padStart(2, "0")}-${String(((i * 5) % 27) + 1).padStart(2, "0")}`,
  segment: ["VIP regulars", "Concert fans", "New this month", "Lapsed 6 months", "Corporate", "Concert fans"][i % 6],
  consent: i % 4 !== 0,
  loyalty: ["Gold", "Silver", "Bronze", "Silver", "Bronze", "Gold"][i % 6],
}));

export const salesSeries = Array.from({ length: 30 }, (_, i) => {
  const d = new Date("2026-10-18T00:00:00+02:00");
  d.setDate(d.getDate() + i);
  const base = 420 + Math.round(260 * Math.sin(i / 3) + i * 38);
  return { date: d.toISOString().slice(5, 10), tickets: Math.max(120, base + (i === 22 ? 2100 : 0)), revenue: Math.max(30_000, base * 310 + (i === 22 ? 640_000 : 0)) };
});

export const checkinSeries = ["16:00", "16:30", "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00", "20:30", "21:00"].map((time, i) => ({
  time,
  gateA: [320, 1240, 2100, 2860, 3420, 2980, 2410, 1620, 920, 410, 160][i],
  gateB: [280, 1010, 1880, 2520, 3110, 2760, 2200, 1440, 870, 360, 120][i],
  vip: [20, 60, 140, 220, 310, 340, 290, 200, 110, 60, 20][i],
}));

export const transactions = Array.from({ length: 18 }, (_, i) => ({
  id: `TXN-${(912340 + i * 7919).toString(36).toUpperCase()}`,
  date: `2026-11-${String(16 - (i % 14)).padStart(2, "0")} ${String(8 + (i % 12)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`,
  customer: people[i % people.length],
  event: events[i % 5].title,
  type: ["Ticket sale", "Ticket sale", "Refund", "Ticket sale", "Donation", "Ticket sale", "Sponsorship"][i % 7],
  method: ["MTN MoMo", "Airtel Money", "Visa card", "MTN MoMo", "Mastercard", "Zamtel Kwacha"][i % 6],
  amount: [250, 1500, -250, 750, 500, 3500, 25000][i % 7],
  fee: [8.75, 52.5, 0, 26.25, 17.5, 122.5, 0][i % 7],
  status: i === 3 ? "Pending" : i === 9 ? "Failed" : "Completed",
}));

export const expenses = [
  { id: "x1", date: "2026-11-02", vendor: "Sound Kings Zambia", category: "Sound and lighting", event: "Lusaka Summer Jam", amount: 185_000, status: "Approved" },
  { id: "x2", date: "2026-11-05", vendor: "SecureForce Ltd", category: "Security", event: "Lusaka Summer Jam", amount: 96_000, status: "Paid" },
  { id: "x3", date: "2026-11-08", vendor: "Heroes National Stadium", category: "Venue", event: "Lusaka Summer Jam", amount: 185_000, status: "Paid" },
  { id: "x4", date: "2026-11-10", vendor: "PrintHub Lusaka", category: "Printing", event: "Lusaka Summer Jam", amount: 18_400, status: "Awaiting approval" },
  { id: "x5", date: "2026-11-12", vendor: "Mosi Transport", category: "Transport", event: "Lusaka Summer Jam", amount: 42_000, status: "Approved" },
  { id: "x6", date: "2026-11-14", vendor: "Artist fees", category: "Entertainment", event: "Lusaka Summer Jam", amount: 640_000, status: "Paid" },
  { id: "x7", date: "2026-11-15", vendor: "Radio Phoenix", category: "Marketing", event: "Lusaka Summer Jam", amount: 35_000, status: "Paid" },
];

export const vendors = [
  { id: "vd1", name: "Sound Kings Zambia", category: "Sound and lighting", city: "Lusaka", rating: 4.7, jobs: 34, status: "Preferred", contact: "Mutale Sound" },
  { id: "vd2", name: "SecureForce Ltd", category: "Security", city: "Lusaka", rating: 4.4, jobs: 51, status: "Preferred", contact: "Capt. Banda" },
  { id: "vd3", name: "Mama Joyce Catering", category: "Catering", city: "Lusaka", rating: 4.8, jobs: 22, status: "Approved", contact: "Joyce Mwale" },
  { id: "vd4", name: "Frame & Flash Studios", category: "Photography", city: "Kitwe", rating: 4.6, jobs: 18, status: "Approved", contact: "Kelvin Sakala" },
  { id: "vd5", name: "Elegance Decor", category: "Decoration", city: "Lusaka", rating: 4.5, jobs: 27, status: "Approved", contact: "Ruth Chanda" },
  { id: "vd6", name: "Mosi Transport", category: "Transport", city: "Livingstone", rating: 4.2, jobs: 12, status: "Under review", contact: "Moses Kabwe" },
  { id: "vd7", name: "PrintHub Lusaka", category: "Printing", city: "Lusaka", rating: 4.3, jobs: 40, status: "Approved", contact: "Faith Mumba" },
  { id: "vd8", name: "CleanSweep Services", category: "Cleaning", city: "Ndola", rating: 3.9, jobs: 9, status: "Under review", contact: "Victor Siame" },
];

export const rfqs = [
  { id: "RFQ-1042", title: "Stage, sound and lighting for 35,000 people", event: "Lusaka Summer Jam", org: "Zed Live Entertainment", due: "2026-11-20", budget: 220_000, quotes: 4, status: "Open" },
  { id: "RFQ-1039", title: "Catering for 600 guests, three courses", event: "Hope Charity Gala Dinner", org: "Hope Children's Foundation", due: "2026-12-04", budget: 180_000, quotes: 3, status: "Open" },
  { id: "RFQ-1031", title: "Security for 4-day convention", event: "Grace Chapel National Convention", org: "Grace Chapel International", due: "2026-11-25", budget: 75_000, quotes: 6, status: "Shortlisting" },
  { id: "RFQ-1017", title: "Event photography and video", event: "Copperbelt Mining & Investment Indaba", org: "Copperbelt Business Forum", due: "2026-11-10", budget: 40_000, quotes: 5, status: "Awarded" },
];

export const quotes = [
  { vendor: "Sound Kings Zambia", amount: 205_000, delivery: "Set-up day before", rating: 4.7, notes: "Includes generator backup and two engineers" },
  { vendor: "Pro Audio Lusaka", amount: 189_500, delivery: "Set-up on the day", rating: 4.1, notes: "Generator not included" },
  { vendor: "StageCraft Africa", amount: 242_000, delivery: "Two days before", rating: 4.9, notes: "LED screens included" },
  { vendor: "BeatBox Hire", amount: 176_000, delivery: "Set-up on the day", rating: 3.8, notes: "No lighting operator" },
];

export const reviews = [
  { id: "r1", event: "Zed Live Sessions: October", name: "Natasha P.", verified: "Checked in", rating: 5, date: "2026-10-26", title: "Best live show this year", body: "Sound was crisp, and getting in took less than five minutes. The VIP bar queue was long, though.", scores: { Venue: 5, Sound: 5, Security: 4, Value: 5 }, helpful: 42, reply: "Thank you, Natasha! We're adding two more bar points for Summer Jam." , visibility: "Public" },
  { id: "r2", event: "Zed Live Sessions: October", name: "Anonymous attendee", verified: "Checked in", rating: 2, date: "2026-10-25", title: "Parking was chaos", body: "It took over an hour to leave the car park, and there were no marshals after 23:00.", scores: { Venue: 2, Sound: 4, Security: 2, Value: 3 }, helpful: 67, reply: null, visibility: "Public" },
  { id: "r3", event: "Zed Live Sessions: October", name: "Brian M.", verified: "Ticket holder", rating: 4, date: "2026-10-25", title: "Great music, fix the food", body: "Artists delivered. The food court ran out of nshima by 21:00.", scores: { Venue: 4, Sound: 5, Security: 4, Value: 4 }, helpful: 18, reply: null, visibility: "Public" },
  { id: "r4", event: "Zed Live Sessions: October", name: "Grace T.", verified: "Checked in", rating: 5, date: "2026-10-27", title: "Felt safe all night", body: "Security was friendly and the women's toilets were clean. Will come again.", scores: { Venue: 5, Sound: 4, Security: 5, Value: 5 }, helpful: 12, reply: null, visibility: "Public" },
  { id: "r5", event: "Zed Live Sessions: October", name: "Private feedback", verified: "Checked in", rating: 3, date: "2026-10-26", title: "Accessibility", body: "There was no ramp at Gate B. I use a wheelchair and had to go round to Gate A.", scores: { Venue: 2, Sound: 4, Security: 4, Value: 4 }, helpful: 0, reply: null, visibility: "Private to organiser" },
];

export const campaigns = [
  { id: "cm1", name: "Summer Jam: last 5,000 tickets", channel: "SMS", audience: "Concert fans, Lusaka 25 km", sent: 18_420, opened: 0, clicked: 2_310, revenue: 412_000, status: "Sent", date: "2026-11-14" },
  { id: "cm2", name: "Summer Jam VIP upgrade", channel: "Email", audience: "Standard ticket holders", sent: 21_000, opened: 9_870, clicked: 1_640, revenue: 286_500, status: "Sent", date: "2026-11-10" },
  { id: "cm3", name: "Near you this weekend", channel: "Push", audience: "Opted in, within 10 km", sent: 32_100, opened: 7_220, clicked: 2_890, revenue: 198_250, status: "Sent", date: "2026-11-13" },
  { id: "cm4", name: "New Year's Eve early bird", channel: "WhatsApp", audience: "VIP regulars", sent: 0, opened: 0, clicked: 0, revenue: 0, status: "Scheduled", date: "2026-11-20" },
  { id: "cm5", name: "Review your October night", channel: "Email", audience: "Checked-in attendees", sent: 1_189, opened: 702, clicked: 233, revenue: 0, status: "Sent", date: "2026-10-26" },
  { id: "cm6", name: "Copperbelt Nights teaser", channel: "Email", audience: "Concert fans, Copperbelt", sent: 0, opened: 0, clicked: 0, revenue: 0, status: "Draft", date: "—" },
];

export const discountCodes = [
  { code: "JAM2026", type: "10% off", uses: 1_284, limit: 2_000, expires: "2026-12-01", status: "Active" },
  { code: "STUDENT50", type: "K50 off Standard", uses: 611, limit: 1_000, expires: "2026-12-10", status: "Active" },
  { code: "MTNFANS", type: "15% off, MoMo only", uses: 2_000, limit: 2_000, expires: "2026-11-30", status: "Used up" },
  { code: "VIPCREW", type: "Free VIP upgrade", uses: 12, limit: 25, expires: "2026-12-12", status: "Active" },
];

export const fundraising = [
  { id: "f1", slug: "school-feeding-2027", title: "Feed 2,000 learners in 2027", org: "Hope Children's Foundation", raised: 284_600, target: 450_000, donors: 612, daysLeft: 46, restricted: true, palette: ["#C77C3A", "#172033"] as [string, string] },
  { id: "f2", slug: "grace-chapel-building", title: "Grace Chapel building fund", org: "Grace Chapel International", raised: 1_820_000, target: 3_000_000, donors: 2_140, daysLeft: 120, restricted: true, palette: ["#5B2A86", "#F4A630"] as [string, string] },
  { id: "f3", slug: "youth-football-kits", title: "Kits for 40 youth football teams", org: "Chipolopolo Sports Events", raised: 61_200, target: 80_000, donors: 230, daysLeft: 12, restricted: false, palette: ["#1F9D55", "#172033"] as [string, string] },
];

export const donations = people.slice(0, 12).map((name, i) => ({
  id: `d${i}`, donor: i % 4 === 1 ? "Anonymous" : name, amount: [100, 500, 250, 1000, 50, 2500, 200, 5000, 150, 300, 750, 100][i], type: i % 3 === 0 ? "Monthly" : "One-time", method: ["MTN MoMo", "Airtel Money", "Visa card"][i % 3], date: `2026-11-${String(16 - i).padStart(2, "0")}`, campaign: "Feed 2,000 learners in 2027",
}));

export const sponsors = [
  { name: "MTN Zambia", tier: "Headline", amount: 450_000, status: "Paid", deliverables: "Stage branding, SMS blast, 40 VIP passes" },
  { name: "Zambeef", tier: "Gold", amount: 180_000, status: "Invoiced", deliverables: "Food court naming, 20 VIP passes" },
  { name: "Mosi Lager", tier: "Gold", amount: 220_000, status: "Paid", deliverables: "Bar exclusivity, banners" },
  { name: "Stanbic Bank", tier: "Silver", amount: 90_000, status: "Pledged", deliverables: "Logo on tickets and website" },
];

export const memberships = [
  { name: "Zed Live Insider", price: 300, period: "year", members: 2_410, perks: ["48-hour presale", "10% off all tickets", "Members' entry lane"] },
  { name: "Zed Live Gold", price: 1200, period: "year", members: 312, perks: ["Everything in Insider", "Free VIP upgrade twice a year", "Meet-and-greet ballot"] },
];

export const loyaltyTiers = [
  { name: "Bronze", from: 0, earn: "1 point per K10", perks: "Birthday voucher" },
  { name: "Silver", from: 2_000, earn: "1.25 points per K10", perks: "Presale access" },
  { name: "Gold", from: 6_000, earn: "1.5 points per K10", perks: "Free VIP upgrade yearly" },
];

export const team = [
  { name: "Mwila Banda", email: "mwila@zedlive.example", role: "Organisation admin", status: "Active", mfa: true, lastActive: "Now" },
  { name: "Chanda Mulenga", email: "chanda@zedlive.example", role: "Event manager", status: "Active", mfa: true, lastActive: "12 min ago" },
  { name: "Precious Nyirenda", email: "precious@zedlive.example", role: "Finance officer", status: "Active", mfa: true, lastActive: "1 h ago" },
  { name: "Daliso Mbewe", email: "daliso@zedlive.example", role: "Marketing officer", status: "Active", mfa: false, lastActive: "Yesterday" },
  { name: "Kelvin Sakala", email: "kelvin@zedlive.example", role: "Gate staff", status: "Active", mfa: false, lastActive: "3 days ago" },
  { name: "Mapalo Ngoma", email: "mapalo@zedlive.example", role: "Gate staff", status: "Invited", mfa: false, lastActive: "—" },
];


export const plans = [
  { name: "Starter", price: 0, fee: "5% + K2 per paid ticket", orgs: 412, features: ["Unlimited free events", "Ticketing and QR check-in", "Email notifications", "1 team member"] },
  { name: "Growth", price: 1_450, fee: "3% + K2 per paid ticket", orgs: 138, features: ["Everything in Starter", "Reserved seating", "SMS and push campaigns", "Reviews and CRM", "10 team members"] },
  { name: "Enterprise", price: 6_900, fee: "Custom", orgs: 21, features: ["Everything in Growth", "Custom roles", "Finance and accounting", "Virtual classrooms", "Dedicated support", "API access"] },
];

export const gateways = [
  { name: "MTN MoMo", type: "Mobile money", status: "Connected", successRate: 97.8, volume: 6_420_100, avgConfirm: "38 s" },
  { name: "Airtel Money", type: "Mobile money", status: "Connected", successRate: 96.1, volume: 3_918_400, avgConfirm: "44 s" },
  { name: "Zamtel Kwacha", type: "Mobile money", status: "Sandbox", successRate: 92.4, volume: 210_300, avgConfirm: "51 s" },
  { name: "Card acquirer", type: "Visa and Mastercard", status: "Connected", successRate: 94.7, volume: 2_740_900, avgConfirm: "6 s" },
  { name: "Bank transfer", type: "Manual reconciliation", status: "Connected", successRate: 100, volume: 860_000, avgConfirm: "1–2 days" },
];

export const auditLogs = [
  { time: "2026-11-16 14:12", actor: "Precious Nyirenda", org: "Zed Live Entertainment", action: "Refund approved", target: "TXN-K4M2Q1 · K250", ip: "41.72.104.18", severity: "Info" },
  { time: "2026-11-16 13:58", actor: "System", org: "—", action: "Webhook signature rejected", target: "Airtel Money callback", ip: "102.68.12.4", severity: "Warning" },
  { time: "2026-11-16 13:40", actor: "Mwila Banda", org: "Zed Live Entertainment", action: "Role changed", target: "Daliso Mbewe → Marketing officer", ip: "41.72.104.18", severity: "Info" },
  { time: "2026-11-16 12:05", actor: "Platform admin", org: "Laugh Out Lusaka", action: "Organisation application received", target: "Pending review", ip: "—", severity: "Info" },
  { time: "2026-11-16 11:47", actor: "Kelvin Sakala", org: "Zed Live Entertainment", action: "Duplicate scan blocked", target: "Ticket EVT-AB12CD at Gate B", ip: "Scanner #4", severity: "Warning" },
  { time: "2026-11-16 10:30", actor: "Unknown", org: "—", action: "5 failed sign-ins, account locked", target: "admin@gracechapel.example", ip: "197.212.8.90", severity: "High" },
  { time: "2026-11-16 09:15", actor: "Chanda Mulenga", org: "Zed Live Entertainment", action: "Event submitted for approval", target: "New Year's Eve Countdown", ip: "41.72.104.22", severity: "Info" },
];

export const supportTickets = [
  { id: "SUP-2291", org: "Grace Chapel International", subject: "Payout not received for convention meal packs", priority: "High", status: "Open", age: "2 h", assignee: "Thandiwe L." },
  { id: "SUP-2288", org: "SkillUp Academy", subject: "How do I connect our Zoom account?", priority: "Normal", status: "Waiting on customer", age: "1 d", assignee: "Peter C." },
  { id: "SUP-2284", org: "Zed Live Entertainment", subject: "Need 20 more scanner logins for Summer Jam", priority: "Normal", status: "Open", age: "1 d", assignee: "—" },
  { id: "SUP-2279", org: "Chipolopolo Sports Events", subject: "Seat map for Levy Mwanawasa north stand is wrong", priority: "High", status: "In progress", age: "3 d", assignee: "Thandiwe L." },
  { id: "SUP-2270", org: "Hope Children's Foundation", subject: "Upgrade from trial to Starter", priority: "Low", status: "Resolved", age: "5 d", assignee: "Peter C." },
];

export const reportedReviews = [
  { id: "rr1", event: "Lusaka Derby: Zesco vs Power Dynamos", excerpt: "This club is run by thieves and the referee was paid…", reason: "Abuse", reports: 14, by: "Organiser and 13 users", status: "Needs decision" },
  { id: "rr2", event: "Laugh Out Loud Friday", excerpt: "Visit cheap-tickets-zm dot com for half price…", reason: "Spam", reports: 6, by: "Auto-detected", status: "Hidden automatically" },
  { id: "rr3", event: "Zed Live Sessions: October", excerpt: "Parking was chaos. It took over an hour to leave…", reason: "Organiser disputes", reports: 1, by: "Organiser", status: "Needs decision" },
];

export const classrooms = [
  { id: "cl1", code: "EMS-CLS-2026-00482", name: "Digital Marketing Bootcamp", instructor: "Natasha Phiri", students: 61, capacity: 80, sessions: 12, next: "2027-01-12T18:00:00+02:00", status: "Enrolling", revenue: 73_200, completion: 0 },
  { id: "cl2", code: "EMS-CLS-2026-00417", name: "Bookkeeping for Small Business", instructor: "Joseph Zulu", students: 38, capacity: 40, sessions: 8, next: "2026-11-18T18:00:00+02:00", status: "In progress", revenue: 34_200, completion: 62 },
  { id: "cl3", code: "EMS-CLS-2026-00391", name: "Project Management Essentials", instructor: "Natasha Phiri", students: 24, capacity: 30, sessions: 10, next: "2026-11-19T17:30:00+02:00", status: "In progress", revenue: 43_200, completion: 48 },
  { id: "cl4", code: "EMS-CLS-2026-00203", name: "Excel for Beginners", instructor: "Joseph Zulu", students: 52, capacity: 60, sessions: 6, next: "—", status: "Completed", revenue: 31_200, completion: 88 },
];

export const courseSessions = Array.from({ length: 12 }, (_, i) => {
  const d = new Date("2027-01-12T18:00:00+02:00");
  d.setDate(d.getDate() + Math.floor(i / 2) * 7 + (i % 2) * 2);
  return {
    n: i + 1,
    title: ["Know your customer", "Facebook and Instagram pages", "Content that sells", "WhatsApp Business", "Paid ads basics", "Running your first ad", "Email lists", "Writing emails people open", "Google Business Profile", "Measuring results", "Budgeting your marketing", "Final project presentations"][i],
    date: d.toISOString(),
    zoom: i < 6 ? "Meeting created" : "Not created yet",
    price: 150,
  };
});

export const assignments = [
  { title: "Customer persona", due: "2027-01-19", submitted: 0, total: 61, status: "Not open yet" },
  { title: "One-week content calendar", due: "2027-01-26", submitted: 0, total: 61, status: "Not open yet" },
];

export const submissions = people.slice(0, 8).map((name, i) => ({ student: name, title: "Monthly cash book", submitted: `2026-11-${String(10 + i).padStart(2, "0")}`, grade: i < 5 ? [78, 91, 64, 85, 72][i] : null, late: i === 6 }));

export const notifications = [
  { id: "n1", title: "Lusaka Summer Jam is 26 days away", body: "Your 2 Standard tickets are in your wallet.", time: "2 h ago", kind: "ticket" },
  { id: "n2", title: "Near you on Friday", body: "Laugh Out Loud Friday at Levy Park, 2.1 km away.", time: "Yesterday", kind: "nearby" },
  { id: "n3", title: "Refund processed", body: "K250 was returned to your MTN MoMo number ending 4471.", time: "3 days ago", kind: "money" },
];

export const myTickets = [
  { id: "mt1", eventId: "e1", type: "Standard", holder: "Chanda Mulenga", ref: "EVT-8K2Q9M", number: "TKT-000481-A", status: "Valid", gate: "Gate A or B" },
  { id: "mt2", eventId: "e1", type: "Standard", holder: "Mwila Banda", ref: "EVT-8K2Q9M", number: "TKT-000481-B", status: "Valid", gate: "Gate A or B" },
  { id: "mt3", eventId: "e3", type: "Meal pack (4 days)", holder: "Chanda Mulenga", ref: "EVT-3PZ7LA", number: "TKT-120044-A", status: "Valid", gate: "Main entrance" },
  { id: "mt4", eventId: "e5", type: "Full course", holder: "Chanda Mulenga", ref: "EVT-9QW1XE", number: "TKT-550010-A", status: "Valid", gate: "Online" },
];

export const pastTickets = [
  { event: "Zed Live Sessions: October", date: "2026-10-24", type: "VIP", reviewed: false },
  { event: "Copperbelt Mining Indaba 2026", date: "2026-02-18", type: "Delegate", reviewed: true },
];

export const platformSeries = Array.from({ length: 12 }, (_, i) => ({
  month: ["Dec", "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov"][i],
  gmv: Math.round(1_200_000 * Math.pow(1.19, i) + (i === 7 ? 2_800_000 : 0)),
  fees: Math.round(46_000 * Math.pow(1.19, i) + (i === 7 ? 98_000 : 0)),
  orgs: 120 + i * 38,
}));

export const venueBookings = [
  { venue: "Levy Park Amphitheatre", org: "Zed Live Entertainment", event: "New Year's Eve Countdown", dates: "31 Dec 2026", amount: 38_000, status: "Requested" },
  { venue: "Levy Park Amphitheatre", org: "Laugh Out Lusaka", event: "Comedy night", dates: "15 Jan 2027", amount: 38_000, status: "Confirmed" },
  { venue: "Levy Park Amphitheatre", org: "Grace Chapel International", event: "Youth worship night", dates: "6 Feb 2027", amount: 30_400, status: "Contract sent" },
];

export const checklist = [
  { task: "Confirm headline artist riders", owner: "Chanda M.", due: "2026-11-20", done: true },
  { task: "Police and council event permit", owner: "Mwila B.", due: "2026-11-22", done: true },
  { task: "Stage build sign-off", owner: "Sound Kings", due: "2026-12-11", done: false },
  { task: "Brief 120 security staff", owner: "SecureForce", due: "2026-12-12", done: false },
  { task: "Load ticket lists onto 24 scanners", owner: "Kelvin S.", due: "2026-12-12", done: false },
  { task: "Shuttle schedule published", owner: "Daliso M.", due: "2026-12-05", done: false },
  { task: "First aid tents and ambulance", owner: "Mwila B.", due: "2026-12-10", done: false },
];

export const gates = [
  { name: "Gate A", scanners: 10, staff: 18, allowed: "Early bird, Standard", scanned: 14_210, rate: 41 },
  { name: "Gate B", scanners: 8, staff: 14, allowed: "Early bird, Standard", scanned: 12_040, rate: 37 },
  { name: "VIP gate", scanners: 4, staff: 6, allowed: "VIP, VVIP", scanned: 2_380, rate: 9 },
  { name: "Staff and artists", scanners: 2, staff: 3, allowed: "Accreditation", scanned: 410, rate: 2 },
];

export const incidents = [
  { time: "18:42", gate: "Gate B", type: "Duplicate ticket", note: "Screenshot of a ticket already used at Gate A at 18:31. Referred to supervisor.", by: "Kelvin S." },
  { time: "19:05", gate: "Gate A", type: "Medical", note: "Fainting in queue, first aid attended.", by: "Mapalo N." },
];

export function getEvent(slug: string) {
  return [...events, ...orgEventsExtra].find((e) => e.slug === slug);
}
export function getOrg(id: string) {
  return organisations.find((o) => o.id === id || o.slug === id)!;
}
export function getVenue(id: string) {
  return venues.find((v) => v.id === id)!;
}
export function sold(e: EventItem) {
  return e.tickets.reduce((a, t) => a + t.sold, 0);
}
export function capacity(e: EventItem) {
  return e.tickets.reduce((a, t) => a + t.capacity, 0);
}
export function gross(e: EventItem) {
  return e.tickets.reduce((a, t) => a + t.sold * t.price, 0);
}
export function fromPrice(e: EventItem) {
  const open = e.tickets.filter((t) => t.sold < t.capacity);
  return Math.min(...(open.length ? open : e.tickets).map((t) => t.price));
}
