// DEMO DATA ONLY. Event programmes (running order).
// Replaced by GET /v1/events/:id/programme.

export const programmeKinds = ["Session", "Performance", "Talk", "Panel", "Ceremony", "Break", "Meal", "Worship", "Match", "Networking", "Activity"] as const;

export interface ProgrammeItem {
  id: string;
  day: string;
  start: string;
  end?: string;
  title: string;
  kind: string;
  who?: string;
  where?: string;
  detail?: string;
}

let n = 0;
const i = (day: string, start: string, end: string | undefined, title: string, kind: string, who?: string, where?: string, detail?: string): ProgrammeItem => ({ id: `p${++n}`, day, start, end, title, kind, who, where, detail });

export const programmes: Record<string, ProgrammeItem[]> = {
  e1: [
    i("Sat 12 Dec", "16:00", "17:30", "Gates open", "Activity", undefined, "All gates", "Food court and bars open. Bring your ticket QR on your phone."),
    i("Sat 12 Dec", "17:30", "19:00", "Opening DJ set", "Performance", "DJ Sebastian", "Main stage"),
    i("Sat 12 Dec", "19:00", "20:30", "Rising stars", "Performance", "Wezi, Kantu and Bombshell", "Main stage"),
    i("Sat 12 Dec", "19:00", "23:00", "VIP lounge open", "Meal", undefined, "VIP lounge", "Table service for VIP and VVIP ticket holders."),
    i("Sat 12 Dec", "20:30", "21:00", "Changeover", "Break", undefined, "Main stage"),
    i("Sat 12 Dec", "21:00", "22:15", "Chef 187", "Performance", "Chef 187", "Main stage"),
    i("Sat 12 Dec", "22:15", "23:30", "Macky 2", "Performance", "Macky 2", "Main stage"),
    i("Sat 12 Dec", "23:30", "00:45", "Headline: Yo Maps", "Performance", "Yo Maps", "Main stage"),
    i("Sun 13 Dec", "00:45", "01:00", "Close and shuttles", "Activity", undefined, "Gate A", "Shuttles to Manda Hill and East Park until 02:00."),
  ],
  e2: [
    i("Day 1, Wed 17 Feb", "08:00", "09:00", "Registration and breakfast", "Meal", undefined, "Foyer"),
    i("Day 1, Wed 17 Feb", "09:00", "09:15", "Welcome", "Ceremony", "Forum chairperson", "Ballroom"),
    i("Day 1, Wed 17 Feb", "09:15", "10:15", "Keynote: Copper to 2030", "Talk", "Minister of Mines (invited)", "Ballroom"),
    i("Day 1, Wed 17 Feb", "10:15", "10:45", "Tea break and exhibition", "Break", undefined, "Exhibition hall"),
    i("Day 1, Wed 17 Feb", "10:45", "12:15", "Local content in the supply chain", "Panel", "Chamber of Mines, ZCCM-IH, two suppliers", "Ballroom"),
    i("Day 1, Wed 17 Feb", "12:15", "13:30", "Lunch", "Meal", undefined, "Terrace"),
    i("Day 1, Wed 17 Feb", "13:30", "15:00", "Track A: Financing small suppliers", "Session", "Three banks and a fund manager", "Nkana room"),
    i("Day 1, Wed 17 Feb", "13:30", "15:00", "Track B: Safety and automation", "Session", "Mine operators", "Ballroom"),
    i("Day 1, Wed 17 Feb", "19:00", "22:00", "Networking dinner", "Networking", undefined, "Ballroom", "Delegate and exhibitor badges only."),
    i("Day 2, Thu 18 Feb", "09:00", "10:30", "Energy and mining panel", "Panel", "ZESCO, IPPs, mines", "Ballroom"),
    i("Day 2, Thu 18 Feb", "10:30", "11:00", "Tea break", "Break", undefined, "Exhibition hall"),
    i("Day 2, Thu 18 Feb", "11:00", "12:30", "Investor matchmaking", "Networking", undefined, "Nkana room", "Book 15-minute meetings at the help desk."),
    i("Day 2, Thu 18 Feb", "12:30", "13:00", "Closing and resolutions", "Ceremony", "Forum chairperson", "Ballroom"),
  ],
  e3: [
    i("Sun 27 Dec", "09:00", "10:00", "Registration and seating", "Activity", undefined, "Main sanctuary"),
    i("Sun 27 Dec", "10:00", "11:00", "Praise and worship", "Worship", "Grace Chapel choir", "Main sanctuary"),
    i("Sun 27 Dec", "11:00", "12:30", "The Word", "Talk", "Guest speaker", "Main sanctuary"),
    i("Mon 28 Dec", "09:00", "12:00", "Youth and women's sessions", "Session", undefined, "Fellowship hall and sanctuary"),
    i("Mon 28 Dec", "12:00", "13:00", "Fellowship meal", "Meal", undefined, "Grounds", "Meal packs for registered delegates."),
    i("Wed 30 Dec", "18:00", "21:00", "Closing service", "Worship", undefined, "Main sanctuary"),
  ],
  e4: [
    i("Sun 29 Nov", "12:00", undefined, "Gates open", "Activity", undefined, "All gates"),
    i("Sun 29 Nov", "13:30", "14:15", "Curtain-raiser: under-17s", "Match", undefined, "Pitch"),
    i("Sun 29 Nov", "14:30", "14:45", "Team warm-ups", "Activity", undefined, "Pitch"),
    i("Sun 29 Nov", "15:00", "15:45", "Kick-off: first half", "Match", "Zesco United vs Power Dynamos", "Pitch"),
    i("Sun 29 Nov", "15:45", "16:00", "Half-time show", "Performance", "Drum troupe", "Pitch"),
    i("Sun 29 Nov", "16:00", "16:50", "Second half", "Match", undefined, "Pitch"),
  ],
  e6: [
    i("Sat 23 Jan", "18:30", "19:15", "Arrival and drinks", "Networking", undefined, "Riverside lawn"),
    i("Sat 23 Jan", "19:15", "19:35", "Welcome and our year", "Talk", "Foundation director", "Marquee"),
    i("Sat 23 Jan", "19:35", "20:45", "Dinner", "Meal", undefined, "Marquee"),
    i("Sat 23 Jan", "20:45", "21:30", "Charity auction", "Activity", "MC Kasonde", "Marquee"),
    i("Sat 23 Jan", "21:30", "21:45", "Pledges", "Ceremony", undefined, "Marquee"),
    i("Sat 23 Jan", "21:45", "23:30", "Live band and dancing", "Performance", "The Riverside Band", "Marquee"),
  ],
  e10: [
    i("Sat 17 Apr", "14:00", "14:30", "Guests arrive", "Activity", undefined, "Riverside lawn", "Ushers will show you to your table."),
    i("Sat 17 Apr", "18:30", "19:30", "Wedding ceremony", "Ceremony", "Pastor Mumba", "Garden"),
    i("Sat 17 Apr", "15:30", "17:00", "Photos and cocktails", "Networking", undefined, "Riverside lawn"),
    i("Sat 17 Apr", "17:00", "17:30", "Bridal party entrance", "Ceremony", undefined, "Marquee"),
    i("Sat 17 Apr", "17:30", "18:30", "Dinner", "Meal", undefined, "Marquee"),
    i("Sat 17 Apr", "14:30", "15:30", "Speeches and gifts", "Ceremony", "Families and friends", "Marquee"),
    i("Sat 17 Apr", "19:30", "20:00", "Cake cutting and first dance", "Ceremony", undefined, "Marquee"),
    i("Sat 17 Apr", "20:00", "23:00", "Dancing", "Performance", "DJ Kalaba", "Marquee"),
  ],
  e9: [
    i("Sat 5 Dec", "14:00", "14:15", "Arrival and set-up", "Activity", undefined, "Chambers A", "Bring your phone, fully charged."),
    i("Sat 5 Dec", "14:15", "15:15", "Light, framing and composition", "Session", "Natasha Mumba", "Chambers A"),
    i("Sat 5 Dec", "15:15", "15:30", "Tea break", "Break"),
    i("Sat 5 Dec", "15:30", "16:30", "Photo walk around the centre", "Activity", "Natasha Mumba", "Outside"),
    i("Sat 5 Dec", "16:30", "17:00", "Editing on your phone and certificates", "Session", "Natasha Mumba", "Chambers A"),
  ],
};

/** Starter programmes by event type, offered in the create-event wizard. */
export const programmeTemplates: Record<string, Omit<ProgrammeItem, "id" | "day">[]> = {
  "Concert or festival": [
    { start: "16:00", title: "Gates open", kind: "Activity" },
    { start: "17:30", end: "19:00", title: "Opening DJ set", kind: "Performance" },
    { start: "19:00", end: "21:00", title: "Support acts", kind: "Performance" },
    { start: "21:00", end: "23:00", title: "Headline act", kind: "Performance" },
    { start: "23:00", title: "Close", kind: "Activity" },
  ],
  "Conference or seminar": [
    { start: "08:00", end: "09:00", title: "Registration and breakfast", kind: "Meal" },
    { start: "09:00", end: "09:15", title: "Welcome", kind: "Ceremony" },
    { start: "09:15", end: "10:15", title: "Keynote", kind: "Talk" },
    { start: "10:15", end: "10:45", title: "Tea break", kind: "Break" },
    { start: "10:45", end: "12:15", title: "Panel discussion", kind: "Panel" },
    { start: "12:15", end: "13:30", title: "Lunch", kind: "Meal" },
    { start: "13:30", end: "15:00", title: "Breakout sessions", kind: "Session" },
    { start: "15:00", end: "15:30", title: "Closing remarks", kind: "Ceremony" },
  ],
  "Wedding or private party": [
    { start: "10:00", end: "10:30", title: "Guests arrive", kind: "Activity" },
    { start: "10:30", end: "11:30", title: "Ceremony", kind: "Ceremony" },
    { start: "11:30", end: "13:00", title: "Photos", kind: "Activity" },
    { start: "13:00", end: "14:30", title: "Reception and lunch", kind: "Meal" },
    { start: "14:30", end: "15:30", title: "Speeches and gifts", kind: "Ceremony" },
    { start: "15:30", end: "19:00", title: "Dancing", kind: "Performance" },
  ],
  "Church gathering": [
    { start: "17:00", end: "18:00", title: "Praise and worship", kind: "Worship" },
    { start: "18:00", end: "19:30", title: "The Word", kind: "Talk" },
    { start: "19:30", end: "19:45", title: "Offering", kind: "Worship" },
    { start: "19:45", end: "20:30", title: "Prayer and altar call", kind: "Worship" },
  ],
  "Sports match or tournament": [
    { start: "12:00", title: "Gates open", kind: "Activity" },
    { start: "14:30", end: "14:45", title: "Warm-ups", kind: "Activity" },
    { start: "15:00", end: "15:45", title: "First half", kind: "Match" },
    { start: "15:45", end: "16:00", title: "Half-time", kind: "Break" },
    { start: "16:00", end: "16:45", title: "Second half", kind: "Match" },
  ],
  "Workshop or course": [
    { start: "09:00", end: "09:30", title: "Arrival", kind: "Activity" },
    { start: "09:30", end: "11:00", title: "Session 1", kind: "Session" },
    { start: "11:00", end: "11:15", title: "Break", kind: "Break" },
    { start: "11:15", end: "12:45", title: "Session 2", kind: "Session" },
    { start: "12:45", end: "13:00", title: "Questions and certificates", kind: "Session" },
  ],
  "Exhibition or trade fair": [
    { start: "09:00", title: "Doors open", kind: "Activity" },
    { start: "10:00", end: "10:30", title: "Official opening", kind: "Ceremony" },
    { start: "11:00", end: "15:00", title: "Exhibitor demonstrations", kind: "Session" },
    { start: "16:00", end: "17:00", title: "Networking", kind: "Networking" },
  ],
  "Fundraiser or gala": [
    { start: "18:00", end: "19:00", title: "Arrival and drinks", kind: "Networking" },
    { start: "19:00", end: "19:20", title: "Welcome", kind: "Talk" },
    { start: "19:20", end: "20:30", title: "Dinner", kind: "Meal" },
    { start: "20:30", end: "21:15", title: "Auction", kind: "Activity" },
    { start: "21:15", end: "21:30", title: "Pledges", kind: "Ceremony" },
  ],
};
