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
  | "Education"
  | "Arts and theatre"
  | "Film"
  | "Food and drink"
  | "Family and kids"
  | "Nightlife"
  | "Business"
  | "Technology"
  | "Fitness";

/** Who an event is suitable for. Shown on the card and used by the Audience filter. */
export type Audience = "All ages" | "Family-friendly" | "18+";

export type EventStatus =
  | "Draft"
  | "Pending approval"
  | "Approved"
  | "Published"
  | "Registration open"
  | "Sold out"
  | "Registration closed"
  | "In progress"
  | "Completed"
  | "Cancelled"
  | "Archived";

export interface TicketType {
  id: string;
  name: string;
  description: string;
  price: number;
  capacity: number;
  sold: number;
  salesEnd: string;
  perOrderLimit: number;
  salesStart?: string;
  tax?: string;
  refund?: string;
  who?: string;
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
  /** Defaults to "All ages" when not set. */
  audience?: Audience;
  /** Unlisted events (funerals, private functions) open by link only, never in discovery. */
  listing?: "Public" | "Unlisted";
}

export interface Organisation {
  id: string;
  slug: string;
  name: string;
  type: string;
  city: string;
  plan: "Free" | "Starter" | "Professional" | "Enterprise";
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
  { id: "org1", slug: "zed-live", name: "Zed Live Entertainment", type: "Concert promoter", city: "Lusaka", plan: "Professional", status: "Active", joined: "2025-03-14", events: 48, revenue: 4_820_400, followers: 21_400, verified: true, about: "Lusaka's biggest live music promoter since 2011. We run Lusaka July Fest, Copperbelt Nights and the Zed Live Sessions series." },
  { id: "org2", slug: "copperbelt-business-forum", name: "Copperbelt Business Forum", type: "Business association", city: "Kitwe", plan: "Starter", status: "Active", joined: "2025-06-02", events: 17, revenue: 1_204_900, followers: 6_210, verified: true, about: "Connecting mining, manufacturing and services on the Copperbelt through conferences, trade fairs and executive breakfasts." },
  { id: "org3", slug: "grace-chapel", name: "Grace Chapel International", type: "Church", city: "Lusaka", plan: "Starter", status: "Active", joined: "2025-09-21", events: 31, revenue: 312_750, followers: 9_880, verified: true, about: "A Lusaka church family running conventions, youth camps and community outreach across Zambia." },
  { id: "org4", slug: "skillup-academy", name: "SkillUp Academy", type: "Training provider", city: "Ndola", plan: "Starter", status: "Active", joined: "2026-01-11", events: 22, revenue: 186_300, followers: 3_140, verified: false, about: "Short courses in digital skills, bookkeeping and project management, online and in Ndola." },
  { id: "org5", slug: "chipolopolo-sports", name: "Chipolopolo Sports Events", type: "Sports organiser", city: "Ndola", plan: "Professional", status: "Active", joined: "2025-11-08", events: 12, revenue: 2_018_000, followers: 14_700, verified: true, about: "Football tournaments, marathons and community sports days." },
  { id: "org6", slug: "hope-foundation", name: "Hope Children's Foundation", type: "Charity", city: "Livingstone", plan: "Free", status: "Trial", joined: "2026-10-28", events: 3, revenue: 94_500, followers: 1_210, verified: false, about: "Raising funds for school feeding and bursaries in Southern Province." },
  { id: "org8", slug: "mwansa-family", name: "The Mwansa family", type: "Family", city: "Lusaka", plan: "Free", status: "Active", joined: "2026-11-15", events: 1, revenue: 0, followers: 0, verified: true, about: "Funeral arrangements for the late Joseph Mwansa. Verified by NRC and a test payment." },
  { id: "org7", slug: "laugh-out-lusaka", name: "Laugh Out Lusaka", type: "Comedy collective", city: "Lusaka", plan: "Free", status: "Pending", joined: "2026-11-12", events: 0, revenue: 0, followers: 0, verified: false, about: "Stand-up comedy nights." },
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

const t = (id: string, name: string, price: number, capacity: number, sold: number, description = "", perOrderLimit = 6, salesEnd = "2026-12-12T18:00:00+02:00"): TicketType => ({
  id, name, price, capacity, sold, description, perOrderLimit, salesEnd,
  salesStart: "2026-09-01T09:00:00+02:00",
  tax: price ? "VAT 16% included" : "None",
  refund: /comp|free|invited/i.test(name) ? "No refunds" : "Until 7 days before",
  who: /student/i.test(name) ? "Student ID at the gate" : /corporate|exhibitor/i.test(name) ? "Approval needed" : "Anyone",
});

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
    start: "2026-12-27T09:00:00+02:00", end: "2026-12-30T21:00:00+02:00", city: "Lusaka", distanceKm: 9.8, seating: "General", palette: ["#5B2A86", "#F4A630"], rating: 4.9, reviews: 1_240, audience: "Family-friendly",
    description: "Our annual convention, with guest speakers, a youth track and a children's programme. Registration is free; meal packs are optional. Online attendees can join the livestream.",
    tickets: [t("t9", "Free registration", 0, 4000, 2_870, "All sessions"), t("t10", "Meal pack (4 days)", 200, 1500, 1_022, "Lunch each day"), t("t11", "Youth camp", 350, 400, 388, "Accommodation and meals, ages 13–19")],
  },
  {
    id: "e4", slug: "zambia-super-league-derby", title: "Lusaka Derby: Zesco vs Power Dynamos", subtitle: "Super League, matchday 14", category: "Sports", status: "Registration open", format: "Physical", orgId: "org5", venueId: "v5",
    start: "2026-11-29T15:00:00+02:00", end: "2026-11-29T17:00:00+02:00", city: "Ndola", distanceKm: 320, seating: "Reserved", palette: ["#1F9D55", "#172033"], rating: 4.1, reviews: 302, audience: "Family-friendly",
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
    start: "2026-11-27T19:30:00+02:00", end: "2026-11-27T22:30:00+02:00", city: "Lusaka", distanceKm: 2.1, seating: "Reserved", palette: ["#D62F45", "#F4A630"], rating: 4.5, reviews: 154, audience: "18+",
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
  {
    id: "e21", slug: "lusaka-tech-meetup-ai", title: "Lusaka Tech Meetup: AI for Small Business", subtitle: "Talks, demos and networking", category: "Technology", status: "Registration open", format: "Hybrid", orgId: "org4", venueId: "v2",
    start: "2026-11-18T17:30:00+02:00", end: "2026-11-18T20:00:00+02:00", city: "Lusaka", distanceKm: 7.5, seating: "General", palette: ["#172033", "#2BB3AA"],
    description: "Three short talks on using AI tools for bookkeeping, marketing and customer service, then networking. Join in person or online.",
    tickets: [t("t27", "Free registration", 0, 200, 141, "In person or online")],
  },
  {
    id: "e22", slug: "food-truck-friday-lusaka", title: "Food Truck Friday", subtitle: "Twenty food trucks, live music, free entry", category: "Food and drink", status: "Registration open", format: "Physical", orgId: "org1", venueId: "v3",
    start: "2026-11-20T16:00:00+02:00", end: "2026-11-20T22:00:00+02:00", city: "Lusaka", distanceKm: 2.1, seating: "General", palette: ["#F4A630", "#D62F45"], audience: "Family-friendly",
    description: "Nshima to burgers to Ethiopian coffee: twenty local food trucks, a DJ and a kids' corner. Free entry; pay the trucks with cash or mobile money.",
    tickets: [t("t28", "Free entry", 0, 3000, 1_208)],
  },
  {
    id: "e23", slug: "kids-saturday-fun-day", title: "Kids' Saturday Fun Day", subtitle: "Bouncy castles, face painting and a magic show", category: "Family and kids", status: "Registration open", format: "Physical", orgId: "org6", venueId: "v3",
    start: "2026-11-21T10:00:00+02:00", end: "2026-11-21T15:00:00+02:00", city: "Lusaka", distanceKm: 2.1, seating: "General", palette: ["#2BB3AA", "#F4A630"], audience: "Family-friendly",
    description: "A morning for children aged 3 to 12. Every ticket includes a juice and a snack. Parents get in free with a child's ticket.",
    tickets: [t("t29", "Child (3 to 12)", 50, 400, 263, "Parents free")],
  },
  {
    id: "e24", slug: "afro-house-night", title: "Afro House Night", subtitle: "Three DJs till late", category: "Nightlife", status: "Registration open", format: "Physical", orgId: "org1", venueId: "v3",
    start: "2026-11-21T21:00:00+02:00", end: "2026-11-22T03:00:00+02:00", city: "Lusaka", distanceKm: 2.1, seating: "General", palette: ["#5B2A86", "#D62F45"], audience: "18+",
    description: "Afro house and amapiano with three resident DJs. ID checked at the door: 18 and over only.",
    tickets: [t("t30", "Early entry (before 22:00)", 100, 300, 300), t("t31", "General", 150, 700, 412)],
  },
  {
    id: "e28", slug: "sme-finance-breakfast", title: "SME Finance Breakfast", subtitle: "Banks and investors meet small business owners", category: "Business", status: "Registration open", format: "Physical", orgId: "org2", venueId: "v4",
    start: "2026-11-26T07:00:00+02:00", end: "2026-11-26T10:00:00+02:00", city: "Kitwe", distanceKm: 312, seating: "Tables", palette: ["#0B7A75", "#172033"], audience: "18+",
    description: "Breakfast, a panel on borrowing for growth, and one-to-one time with lenders. Bring your business registration.",
    tickets: [t("t38", "Breakfast seat", 350, 120, 64)],
  },
  {
    id: "e25", slug: "the-lion-and-the-jewel", title: "The Lion and the Jewel", subtitle: "Wole Soyinka's comedy, staged in Lusaka", category: "Arts and theatre", status: "Registration open", format: "Physical", orgId: "org1", venueId: "v3",
    start: "2026-12-04T19:00:00+02:00", end: "2026-12-04T21:30:00+02:00", city: "Lusaka", distanceKm: 2.1, seating: "Reserved", palette: ["#C77C3A", "#172033"], audience: "All ages",
    description: "A new production of the classic comedy by a Lusaka theatre company. Runs about two and a half hours with an interval.",
    tickets: [t("t32", "Standard", 120, 400, 188), t("t33", "Student", 60, 100, 71, "Student ID at the door")],
  },
  {
    id: "e26", slug: "lusaka-10k-fun-run", title: "Lusaka 10K Fun Run", subtitle: "5 km and 10 km routes for every level", category: "Fitness", status: "Registration open", format: "Physical", orgId: "org5", venueId: "v1",
    start: "2026-12-06T06:00:00+02:00", end: "2026-12-06T11:00:00+02:00", city: "Lusaka", distanceKm: 4.2, seating: "General", palette: ["#1F9D55", "#0B7A75"], audience: "Family-friendly",
    description: "Start and finish at Heroes Stadium. Every finisher gets a medal; the 5 km route is buggy-friendly.",
    tickets: [t("t34", "10 km", 200, 1500, 902), t("t35", "5 km", 150, 1500, 1_140), t("t36", "Child under 12 (5 km)", 0, 500, 233)],
  },
  {
    id: "e27", slug: "cinema-under-the-stars", title: "Cinema Under the Stars", subtitle: "A Zambian film night on the lawn", category: "Film", status: "Registration open", format: "Physical", orgId: "org6", venueId: "v6",
    start: "2026-12-11T19:00:00+02:00", end: "2026-12-11T22:00:00+02:00", city: "Livingstone", distanceKm: 476, seating: "General", palette: ["#172033", "#F4A630"], audience: "All ages",
    description: "An outdoor screening of new Zambian short films, with popcorn and blankets. Proceeds go to school feeding.",
    tickets: [t("t37", "Lawn ticket", 80, 300, 96)],
  },
  {
    id: "e29", slug: "lunchtime-jazz-arcades", title: "Lunchtime Jazz at Arcades", subtitle: "Live jazz on the piazza, free to walk in", category: "Music", status: "In progress", format: "Physical", orgId: "org1", venueId: "v3",
    start: "2026-11-18T11:30:00+02:00", end: "2026-11-18T14:30:00+02:00", city: "Lusaka", distanceKm: 3.4, seating: "General", palette: ["#0B7A75", "#F4A630"], audience: "All ages",
    description: "A three-hour jazz set over lunch. Free entry; reserve a table for K100 and get a drink included.",
    tickets: [t("t39", "Free entry", 0, 600, 412), t("t40", "Reserved table seat", 100, 80, 64, "Drink included")],
  },
  {
    id: "e30", slug: "zambia-trade-and-farm-expo", title: "Zambia Trade and Farm Expo", subtitle: "Six days of exhibitors, machinery and food", category: "Exhibition", status: "In progress", format: "Physical", orgId: "org2", venueId: "v2",
    start: "2026-11-16T09:00:00+02:00", end: "2026-11-21T17:00:00+02:00", city: "Lusaka", distanceKm: 7.5, seating: "General", palette: ["#1F9D55", "#F4A630"], audience: "Family-friendly",
    description: "Over 300 exhibitors from farming, mining and manufacturing. Day passes or a full-week pass.",
    tickets: [t("t41", "Day pass", 50, 20000, 14_380), t("t42", "Week pass", 200, 3000, 1_906)],
  },
  {
    id: "e31", slug: "grace-chapel-midweek-service", title: "Grace Chapel Midweek Service", subtitle: "Prayer and the Word, every Wednesday", category: "Church", status: "In progress", format: "Hybrid", orgId: "org3", venueId: "v7",
    start: "2026-11-18T11:00:00+02:00", end: "2026-11-18T13:00:00+02:00", city: "Lusaka", distanceKm: 5.1, seating: "General", palette: ["#5B2A86", "#F4A630"], audience: "All ages",
    description: "Midweek prayer and teaching. Open to everyone, in person or online, no ticket needed. Scan the check-in code at the entrance so we can count everyone. Ushers and protocol are on duty.",
    // Open entry: no tickets (see setups in src/lib/mock/event-day.ts).
    tickets: [],
  },
  {
    id: "e32", slug: "funeral-joseph-mwansa", title: "Funeral of the late Joseph Mwansa", subtitle: "Church service, burial and gathering", category: "Church", status: "Registration open", format: "Physical", orgId: "org8", venueId: "v7", listing: "Unlisted",
    start: "2026-11-21T08:00:00+02:00", end: "2026-11-21T17:00:00+02:00", city: "Lusaka", distanceKm: 5.1, seating: "General", palette: ["#172033", "#7B8496"], audience: "All ages",
    description: "Church service at 08:00 at Grace Chapel, burial at Leopards Hill Memorial Park at 11:30, then a meal at the Fellowship hall. Please tap \"I'm coming\" so the family can plan the meal, and scan the check-in code when you arrive.",
    tickets: [],
  },
];

export const statusTone: Record<string, "teal" | "gold" | "red" | "green" | "grey"> = {
  Draft: "grey", "Pending approval": "gold", Approved: "teal", "Registration closed": "gold", Archived: "grey", Published: "teal", "Registration open": "green", "Sold out": "red", "In progress": "teal", Completed: "grey", Cancelled: "red",
  Active: "green", Pending: "gold", Suspended: "red", Trial: "teal",
};

export const orgEventsExtra: EventItem[] = [
  { ...events[0], id: "e11", slug: "copperbelt-nights-kitwe", title: "Copperbelt Nights: Kitwe", status: "Draft", start: "2027-02-27T18:00:00+02:00", end: "2027-02-28T01:00:00+02:00", city: "Kitwe", tickets: events[0].tickets.map((x) => ({ ...x, sold: 0 })), rating: undefined, reviews: undefined },
  { ...events[0], id: "e12", slug: "zed-live-sessions-oct", title: "Zed Live Sessions: October", status: "Completed", start: "2026-10-24T19:00:00+02:00", venueId: "v3", tickets: events[0].tickets.slice(1, 3).map((x) => ({ ...x, capacity: 1200, sold: 1189 })), rating: 4.4, reviews: 233 },
  { ...events[0], id: "e14", slug: "zed-live-sessions-december", title: "Zed Live Sessions: December", status: "Approved", start: "2026-12-19T19:00:00+02:00", end: "2026-12-20T01:00:00+02:00", venueId: "v3", tickets: events[0].tickets.slice(1, 3).map((x) => ({ ...x, capacity: 1200, sold: 0 })), rating: undefined, reviews: undefined },
  { ...events[0], id: "e15", slug: "lusaka-july-fest-2025", title: "Lusaka July Fest 2025", status: "Archived", start: "2025-07-19T14:00:00+02:00", tickets: events[0].tickets.map((x) => ({ ...x, sold: Math.round(x.capacity * 0.9) })), rating: 4.1, reviews: 1011 },
  { ...events[0], id: "e13", slug: "new-year-countdown", title: "New Year's Eve Countdown", status: "Pending approval", start: "2026-12-31T20:00:00+02:00", end: "2027-01-01T02:00:00+02:00", venueId: "v3", tickets: events[0].tickets.slice(1, 3).map((x) => ({ ...x, sold: 0 })), rating: undefined, reviews: undefined },
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

// Shown to the public with a "Not verified" label: no ticket matched this person.
reviews.push({ id: "r6", event: "Zed Live Sessions: October", name: "Joseph K.", verified: "Not verified", rating: 3, date: "2026-10-28", title: "Heard it was good", body: "My friends went and enjoyed it. I watched clips online; the sound seemed loud near the front.", scores: { Venue: 3, Sound: 3, Security: 3, Value: 3 }, helpful: 1, reply: null, visibility: "Public" });

export const reviewPhotos: Record<string, { label: string; tint: string }[]> = {
  r1: [{ label: "Crowd at sunset", tint: "#F4A630" }, { label: "Main stage", tint: "#0B7A75" }],
  r4: [{ label: "Friends at the VIP bar", tint: "#5B2A86" }],
};

export const ratingBreakdown = [{ stars: 5, pct: 68 }, { stars: 4, pct: 20 }, { stars: 3, pct: 8 }, { stars: 2, pct: 3 }, { stars: 1, pct: 1 }];

/** Average rating per event over time, for the trend chart. */
export const ratingTrend = [
  { event: "Copperbelt Nights: Ndola (Mar)", short: "Mar", rating: 3.9, reviews: 141, recommend: 78 },
  { event: "Easter Gospel Night (Apr)", short: "Apr", rating: 4.1, reviews: 96, recommend: 82 },
  { event: "Lusaka July Fest (Jul)", short: "Jul", rating: 4.2, reviews: 1204, recommend: 84 },
  { event: "Zed Live Sessions: August", short: "Aug", rating: 4.3, reviews: 188, recommend: 86 },
  { event: "Zed Live Sessions: October", short: "Oct", rating: 4.4, reviews: 286, recommend: 88 },
];

export const eventComparison = [
  { event: "Zed Live Sessions: October", date: "24 Oct 2026", reviews: 286, overall: 4.4, Organisation: 4.3, Venue: 3.9, "Sound and lighting": 4.7, Security: 4.2, "Customer service": 4.4, "Ticket buying": 4.8, "Programme quality": 4.5, "Value for money": 4.3, recommend: 88 },
  { event: "Zed Live Sessions: August", date: "22 Aug 2026", reviews: 188, overall: 4.3, Organisation: 4.2, Venue: 4.0, "Sound and lighting": 4.5, Security: 4.3, "Customer service": 4.2, "Ticket buying": 4.7, "Programme quality": 4.4, "Value for money": 4.2, recommend: 86 },
  { event: "Lusaka July Fest", date: "18 Jul 2026", reviews: 1204, overall: 4.2, Organisation: 4.0, Venue: 4.1, "Sound and lighting": 4.6, Security: 3.8, "Customer service": 4.0, "Ticket buying": 4.5, "Programme quality": 4.2, "Value for money": 4.1, recommend: 84 },
  { event: "Copperbelt Nights: Ndola", date: "14 Mar 2026", reviews: 141, overall: 3.9, Organisation: 3.7, Venue: 3.6, "Sound and lighting": 4.3, Security: 3.9, "Customer service": 3.8, "Ticket buying": 4.4, "Programme quality": 3.9, "Value for money": 3.8, recommend: 78 },
];

/** Suggestions pulled out of review text and survey answers, grouped. */
export const suggestions = [
  { text: "More parking marshals and a second exit", mentions: 64, area: "Venue" },
  { text: "Open more bar points, especially in VIP", mentions: 48, area: "Customer service" },
  { text: "Keep food stalls stocked until the end", mentions: 31, area: "Customer service" },
  { text: "Add a ramp at Gate B for wheelchair users", mentions: 9, area: "Venue" },
  { text: "Start headline acts earlier on a weeknight", mentions: 22, area: "Organisation" },
  { text: "Sell water at the gates", mentions: 17, area: "Customer service" },
];

export const followUps = [
  { id: "fu1", action: "Hire 12 parking marshals until 01:00 and open the north exit", from: "Parking and exit (64 mentions)", owner: "Mwila B.", due: "2026-12-10", done: false },
  { id: "fu2", action: "Two extra bar points on the VIP terrace", from: "Bar queues (48 mentions)", owner: "Chanda M.", due: "2026-12-05", done: true },
  { id: "fu3", action: "Hire a temporary ramp for Gate B", from: "Private feedback from a wheelchair user", owner: "Mwila B.", due: "2026-12-01", done: false },
];

export type SurveyQuestion = { id: string; type: "Rating" | "Choice" | "Yes or no" | "Short answer"; text: string; options?: string[] };
export const surveys = [
  {
    id: "sv1", title: "Zed Live Sessions: October, after the show", event: "Zed Live Sessions: October", status: "Closed", sent: 1189, responses: 412,
    questions: [
      { id: "q1", type: "Rating", text: "How easy was it to get in?" },
      { id: "q2", type: "Choice", text: "How did you get to the venue?", options: ["Own car", "Taxi or ride-hailing", "Bus or shuttle", "Walked"] },
      { id: "q3", type: "Yes or no", text: "Would you come to a weeknight show?" },
      { id: "q4", type: "Short answer", text: "One thing we should change next time" },
    ] as SurveyQuestion[],
    results: {
      q1: { average: 4.6, spread: [71, 19, 6, 3, 1] },
      q2: { counts: [46, 31, 18, 5] },
      q3: { yes: 63 },
      q4: { samples: ["More parking marshals", "Water at the gates", "Earlier start", "Bigger screens at the back"] },
    },
  },
  {
    id: "sv2", title: "Lusaka Summer Jam, morning after", event: "Lusaka Summer Jam", status: "Scheduled for 13 Dec, 09:00", sent: 0, responses: 0,
    questions: [
      { id: "q1", type: "Rating", text: "How was the sound?" },
      { id: "q2", type: "Yes or no", text: "Did you use the free shuttle?" },
      { id: "q3", type: "Short answer", text: "Anything else?" },
    ] as SurveyQuestion[],
    results: null,
  },
];

export const myReviews = [
  { event: "Copperbelt Mining Indaba 2026", date: "2026-02-19", rating: 4, title: "Useful sessions, long lunch queue", body: "The financing track was excellent. Lunch took 40 minutes to get through.", visibility: "Public", editUntil: "2026-03-05", reply: "Thanks! We're doubling the serving points for 2027." },
];

export const pendingPhotos = [
  { id: "ph1", event: "Zed Live Sessions: October", by: "Grace T.", label: "Friends at the VIP bar", tint: "#5B2A86", note: "Faces of other guests visible" },
  { id: "ph2", event: "Zed Live Sessions: October", by: "Anonymous attendee", label: "Car park queue at 23:40", tint: "#172033", note: "Number plates visible" },
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
  { id: "n5", title: "Order A-0229 is ready", body: "Collect at Food court A, or an usher brings it to VIP table 6. Pay K135 by card.", time: "Just now", kind: "order" },
  { id: "n4", title: "Reminder: funeral of the late Joseph Mwansa is tomorrow", body: "Church service at 08:00 at Grace Chapel. You said 1 person is coming. Scan the check-in code when you arrive.", time: "Yesterday 18:00", kind: "reminder" },
  { id: "n1", title: "Lusaka Summer Jam is 26 days away", body: "Your 2 Standard tickets are in your wallet.", time: "2 h ago", kind: "ticket" },
  { id: "n2", title: "Near you on Friday", body: "Laugh Out Loud Friday at Levy Park, 2.1 km away.", time: "Yesterday", kind: "nearby" },
  { id: "n3", title: "Refund processed", body: "K250 was returned to your MTN MoMo number ending 4471.", time: "3 days ago", kind: "money" },
];

export const myTickets = [
  { id: "mt1", eventId: "e1", type: "Standard", holder: "Chanda Mulenga", ref: "EVT-8K2Q9M", number: "TKT-000481-A", status: "Valid", gate: "Gate A or B" },
  { id: "mt2", eventId: "e1", type: "Standard", holder: "Mwila Banda", ref: "EVT-8K2Q9M", number: "TKT-000481-B", status: "Valid", gate: "Gate A or B" },
  { id: "mt3", eventId: "e3", type: "Meal pack (4 days)", holder: "Chanda Mulenga", ref: "EVT-3PZ7LA", number: "TKT-120044-A", status: "Valid", gate: "Main entrance" },
  { id: "mt4", eventId: "e5", type: "Full course", holder: "Chanda Mulenga", ref: "EVT-9QW1XE", number: "TKT-550010-A", status: "Valid", gate: "Online" },
  { id: "mt5", eventId: "e30", type: "Week pass", holder: "Chanda Mulenga", ref: "EVT-7XP026", number: "TKT-883102-A", status: "Valid", gate: "North gate" },
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
  if (!e.tickets.length) return 0; // open entry: no tickets, free to attend
  const open = e.tickets.filter((t) => t.sold < t.capacity);
  return Math.min(...(open.length ? open : e.tickets).map((t) => t.price));
}

export const transferHistory: Record<string, { when: string; what: string }[]> = {
  "TKT-000481-A": [{ when: "2026-11-14 10:42", what: "Bought by Chanda Mulenga (MTN MoMo, booking EVT-8K2Q9M)" }],
  "TKT-000481-B": [
    { when: "2026-11-14 10:42", what: "Bought by Chanda Mulenga (MTN MoMo, booking EVT-8K2Q9M)" },
    { when: "2026-11-15 08:10", what: "Name changed from Guest 2 to Mwila Banda" },
    { when: "2026-11-15 08:11", what: "Sent to Mwila Banda (0977 ••• 812). New QR code issued, old one cancelled" },
  ],
};

export const equipment = [
  { item: "Barrier fencing, 400 m", from: "Sound Kings Zambia", qty: "1 lot", status: "Booked", arrives: "11 Dec, 08:00" },
  { item: "Generators, 250 kVA", from: "Sound Kings Zambia", qty: "2", status: "Booked", arrives: "11 Dec, 10:00" },
  { item: "Scanner phones (charged) + power banks", from: "Own stock", qty: "24 + 24", status: "Ready", arrives: "12 Dec, 12:00" },
  { item: "First aid tents", from: "Zambia Red Cross", qty: "3", status: "Requested", arrives: "12 Dec, 13:00" },
  { item: "Portable toilets", from: "CleanSweep Services", qty: "60", status: "Quote accepted", arrives: "11 Dec, 14:00" },
  { item: "Shuttle buses, 65 seats", from: "Mosi Transport", qty: "6", status: "Booked", arrives: "12 Dec, 14:30" },
];

export const shifts = [
  { name: "Kelvin Sakala", role: "Gate staff", where: "Gate A", time: "15:00 to 21:00" },
  { name: "Mapalo Ngoma", role: "Gate staff", where: "Gate B", time: "15:00 to 21:00" },
  { name: "SecureForce team (60)", role: "Security", where: "All gates and arena", time: "13:00 to 02:00" },
  { name: "Chanda Mulenga", role: "Event manager", where: "Control room", time: "10:00 to 02:00" },
  { name: "Daliso Mbewe", role: "Marketing", where: "Media desk", time: "16:00 to 23:00" },
  { name: "Precious Nyirenda", role: "Finance", where: "Cash office", time: "14:00 to 00:00" },
];

export const onlineAttendees = people.slice(0, 10).map((name, i) => ({
  name, ticket: ["Virtual pass", "Delegate (hybrid)", "Virtual pass"][i % 3], joined: i % 4 === 3 ? null : `09:${String(2 + i * 3).padStart(2, "0")}`, watched: i % 4 === 3 ? 0 : 40 + ((i * 17) % 60), device: ["Phone", "Laptop", "Phone", "Tablet"][i % 4],
}));

export const vendorServices: Record<string, { s: string; price: number; unit: string }[]> = {
  "Sound Kings Zambia": [{ s: "Sound package, up to 5,000 people", price: 45_000, unit: "per event" }, { s: "Stadium sound and lighting, 35,000 people", price: 205_000, unit: "per event" }, { s: "Generator 250 kVA", price: 6_800, unit: "per day" }],
  "SecureForce Ltd": [{ s: "Guard, 12-hour shift", price: 800, unit: "per guard" }, { s: "Supervisor, 12-hour shift", price: 1_400, unit: "per person" }],
  "Mama Joyce Catering": [{ s: "Three-course dinner", price: 350, unit: "per guest" }, { s: "Buffet lunch", price: 180, unit: "per guest" }],
};

export const vendorContracts = [
  { id: "CT-ZL-118", vendor: "Sound Kings Zambia", event: "Lusaka Summer Jam", value: 205_000, signed: "2026-11-12", status: "Signed by both" },
  { id: "CT-ZL-114", vendor: "SecureForce Ltd", event: "Lusaka Summer Jam", value: 96_000, signed: "2026-11-03", status: "Signed by both" },
  { id: "CT-ZL-121", vendor: "Mosi Transport", event: "Lusaka Summer Jam", value: 42_000, signed: "—", status: "Waiting for vendor" },
];

export const vendorInvoices = [
  { id: "SK-2290", vendor: "Sound Kings Zambia", amount: 102_500, due: "2026-11-30", status: "Approved", note: "50% deposit" },
  { id: "SF-0871", vendor: "SecureForce Ltd", amount: 96_000, due: "2026-11-20", status: "Paid", note: "" },
  { id: "PH-1182", vendor: "PrintHub Lusaka", amount: 18_400, due: "2026-11-25", status: "Awaiting approval", note: "Wristbands and posters" },
];

export const quizzes = [
  { title: "Quiz 1: Know your customer", questions: 8, marking: "Automatic", opens: "2027-01-12", taken: 0, average: null as number | null },
  { title: "Quiz 2: Social media basics", questions: 10, marking: "Automatic", opens: "2027-01-19", taken: 0, average: null as number | null },
];

/** Attendance for the in-progress Bookkeeping class: P present, L late, A absent. */
export const bookkeepingAttendance = {
  lessons: ["L1 (28 Oct)", "L2 (30 Oct)", "L3 (4 Nov)", "L4 (6 Nov)", "L5 (11 Nov)", "L6 (13 Nov)"],
  students: people.slice(0, 10).map((name, i) => ({ name, marks: Array.from({ length: 6 }, (_, j) => ((i * 7 + j * 3) % 11 === 0 ? "A" : (i + j) % 9 === 0 ? "L" : "P")) })),
};

export const classDashboard = {
  attendanceByLesson: ["L1", "L2", "L3", "L4", "L5", "L6"].map((l, i) => ({ lesson: l, present: [36, 35, 33, 34, 31, 32][i], absent: [2, 3, 5, 4, 7, 6][i] })),
  scores: [{ band: "Under 50%", students: 3 }, { band: "50–64%", students: 7 }, { band: "65–79%", students: 15 }, { band: "80%+", students: 11 }],
};

export const orgInvoices = [
  { id: "INV-ZL-0412", to: "MTN Zambia", for: "Headline sponsorship, Lusaka Summer Jam", amount: 450_000, issued: "2026-10-01", due: "2026-10-31", status: "Paid" },
  { id: "INV-ZL-0419", to: "Zambeef", for: "Gold sponsorship, Lusaka Summer Jam", amount: 180_000, issued: "2026-10-15", due: "2026-11-15", status: "Overdue" },
  { id: "INV-ZL-0423", to: "Stanbic Bank", for: "20 corporate tickets (VIP)", amount: 15_000, issued: "2026-11-10", due: "2026-12-10", status: "Sent" },
  { id: "INV-ZL-0425", to: "Copperbelt Energy", for: "VVIP table of 8", amount: 8_000, issued: "2026-11-14", due: "2026-12-01", status: "Draft" },
];

export const pledges = [
  { donor: "Stanbic Bank", amount: 90_000, paid: 0, due: "2026-12-15", campaign: "Lusaka Summer Jam sponsorship", status: "Pledged" },
  { donor: "Grace Tembo", amount: 12_000, paid: 6_000, due: "Monthly to March", campaign: "Feed 2,000 learners in 2027", status: "On track" },
  { donor: "Copperbelt Rotary Club", amount: 25_000, paid: 0, due: "2026-11-30", campaign: "Feed 2,000 learners in 2027", status: "Reminder sent" },
];

export const donors = [
  { name: "Grace Tembo", gifts: 9, total: 14_500, since: "2025", last: "2026-11-16", type: "Monthly" },
  { name: "Copperbelt Rotary Club", gifts: 2, total: 40_000, since: "2026", last: "2026-06-02", type: "Organisation" },
  { name: "Brian Mwansa", gifts: 4, total: 2_200, since: "2026", last: "2026-11-09", type: "One-time" },
  { name: "Anonymous donors", gifts: 188, total: 41_300, since: "—", last: "2026-11-15", type: "Hidden by choice" },
];

export const beneficiaries = [
  { name: "Mukuni Primary School", place: "Kazungula", learners: 420, received: 61_200, lastReport: "Term 3 report received" },
  { name: "Simoonga Community School", place: "Livingstone", learners: 310, received: 44_800, lastReport: "Term 3 report received" },
  { name: "Katapazi Primary School", place: "Kazungula", learners: 280, received: 38_900, lastReport: "Report due 5 Dec" },
];

export const memberOnlyEvents = [
  { title: "Zed Live Sessions: December", when: "19 Dec 2026", access: "Members-only presale until 1 Dec, then public", plans: "Insider, Gold" },
  { title: "Gold members' listening party", when: "7 Jan 2027", access: "Members only", plans: "Gold" },
];

export const recommendationReasons: Record<string, string> = {
  e7: "You went to Zed Live Sessions: October",
  e1: "Music fan, 4.2 km from you",
  e9: "You follow SkillUp Academy",
  e3: "Popular near you this month",
};
