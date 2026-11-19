/**
 * Sample data for attendee requests and event messages at Lusaka Summer Jam
 * (event day preview) and a Grace Chapel Sunday service.
 */
import type { AssignMode, DutyKey, RequestStatus } from "@/lib/assist";

export interface StaffOnDuty {
  id: string;
  name: string;
  duty: DutyKey;
  area: string;
  status: "available" | "busy" | "off";
  phone: string;
}

export const eventStaff: StaffOnDuty[] = [
  { id: "s1", name: "Joseph Banda", duty: "usher", area: "General area", status: "available", phone: "+260 97 1100 201" },
  { id: "s2", name: "Ruth Mwale", duty: "usher", area: "VIP terrace", status: "busy", phone: "+260 96 1100 202" },
  { id: "s3", name: "Brian Chanda", duty: "usher", area: "General area", status: "available", phone: "+260 97 1100 203" },
  { id: "s4", name: "Moses Phiri", duty: "security", area: "Gate B", status: "available", phone: "+260 96 1100 204" },
  { id: "s5", name: "Peter Tembo", duty: "security", area: "VIP terrace", status: "busy", phone: "+260 95 1100 205" },
  { id: "s6", name: "Nurse Agnes Lungu", duty: "first_aid", area: "First aid tent", status: "available", phone: "+260 97 1100 206" },
  { id: "s7", name: "Kelvin Sakala", duty: "access", area: "Gate A", status: "available", phone: "+260 96 1100 207" },
  { id: "s8", name: "Mercy Zulu", duty: "cleaning", area: "General area", status: "off", phone: "+260 97 1100 208" },
  { id: "s9", name: "Chileshe Mutale", duty: "lost_found", area: "Info desk", status: "available", phone: "+260 96 1100 209" },
];

export interface HelpRequest {
  id: string;
  duty: DutyKey;
  from: string;
  ticket?: string;
  where: string;
  note: string;
  at: string;
  waitingSec: number;
  status: RequestStatus;
  assignee?: string;
  log: { at: string; what: string }[];
}

export const eventRequests: HelpRequest[] = [
  { id: "CS-2611-0431", duty: "first_aid", from: "Natasha P.", ticket: "Standard", where: "General area, near the sound desk", note: "My friend fainted, she's sitting down now.", at: "20:14", waitingSec: 40, status: "ACCEPTED", assignee: "s6", log: [{ at: "20:14", what: "Sent" }, { at: "20:14", what: "Automatically sent to first aid" }, { at: "20:14", what: "Nurse Agnes Lungu: on the way" }] },
  { id: "CS-2611-0432", duty: "usher", from: "Bwalya K.", ticket: "VIP", where: "VIP terrace, table 6", note: "Someone is sitting at our reserved table.", at: "20:16", waitingSec: 150, status: "ESCALATED", log: [{ at: "20:16", what: "Sent" }, { at: "20:18", what: "Not accepted in 2 minutes: SMS sent to the event manager" }] },
  { id: "CS-2611-0433", duty: "security", from: "Anonymous", ticket: "Standard", where: "Gate B queue", note: "Pushing in the queue, people getting angry.", at: "20:17", waitingSec: 95, status: "ASSIGNED", assignee: "s4", log: [{ at: "20:17", what: "Sent" }, { at: "20:17", what: "Assigned to Moses Phiri by Chanda Mulenga" }] },
  { id: "CS-2611-0434", duty: "lost_found", from: "Grace T.", ticket: "Early bird", where: "General area", note: "Lost a black phone with a red cover.", at: "20:19", waitingSec: 20, status: "SUBMITTED", log: [{ at: "20:19", what: "Sent" }] },
  { id: "CS-2611-0429", duty: "access", from: "Kunda S.", ticket: "Standard", where: "Gate A", note: "Ticket shows already used.", at: "19:52", waitingSec: 0, status: "COMPLETED", assignee: "s7", log: [{ at: "19:52", what: "Sent" }, { at: "19:53", what: "Kelvin Sakala: on the way" }, { at: "19:58", what: "Done: ticket was transferred; new QR scanned" }] },
  { id: "CS-2611-0427", duty: "cleaning", from: "Mutinta H.", ticket: "VIP", where: "VIP toilets", note: "No water in the ladies' toilets.", at: "19:40", waitingSec: 0, status: "COMPLETED", assignee: "s3", log: [{ at: "19:40", what: "Sent" }, { at: "19:44", what: "Brian Chanda: on the way" }, { at: "19:55", what: "Done" }] },
];

export const assistSettings: { mode: AssignMode; hotline: string; staffed: boolean } = { mode: "AUTOMATIC", hotline: "+260 97 7000 123", staffed: true };

/**
 * Emergency numbers shown above every help screen. Placeholders until the
 * official Zambian numbers are confirmed with the authorities before launch.
 */
export const emergencyNumbers = [
  { label: "Police", number: "Number to be confirmed" },
  { label: "Ambulance", number: "Number to be confirmed" },
  { label: "Fire", number: "Number to be confirmed" },
];

/* Audience for event messages ---------------------------------------------- */

/** One row per group of attendees with the same ticket, gender, area and check-in status. */
export interface AudienceCell { ticketType: string; gender: "Female" | "Male" | "Prefer not to say"; area: string; checkedIn: boolean; people: number; hasApp: number }

const split = (ticketType: string, area: string, f: number, m: number, n: number): AudienceCell[] =>
  ([["Female", f], ["Male", m], ["Prefer not to say", n]] as const).flatMap(([gender, total]) => {
    const inside = Math.round(total * 0.93);
    return [
      { ticketType, gender, area, checkedIn: true, people: inside, hasApp: Math.round(inside * 0.82) },
      { ticketType, gender, area, checkedIn: false, people: total - inside, hasApp: Math.round((total - inside) * 0.74) },
    ];
  });

export const audienceCells: AudienceCell[] = [
  ...split("Standard", "General area", 11_960, 10_690, 750),
  ...split("Early bird", "General area", 2_420, 2_270, 150),
  ...split("VIP", "VIP terrace", 1_330, 1_120, 70),
  ...split("VVIP table of 8", "VVIP tables", 250, 100, 50),
];

export const ticketTypes = ["Standard", "Early bird", "VIP", "VVIP table of 8"];
export const areas = ["General area", "VIP terrace", "VVIP tables", "Gate A", "Gate B", "First aid tent", "Info desk"];

export interface SentMessage { id: string; at: string; by: string; title: string; audience: string; priority: "NORMAL" | "URGENT"; recipients: number; opened: number; sms: number }

export const sentMessages: SentMessage[] = [
  { id: "MSG-208", at: "19:30", by: "Chanda Mulenga", title: "Headline acts start at 21:00", audience: "All attendees", priority: "NORMAL", recipients: 31_160, opened: 22_310, sms: 0 },
  { id: "MSG-207", at: "18:45", by: "Chanda Mulenga", title: "Gate B is closed, please use Gate A", audience: "Attendees not yet checked in", priority: "URGENT", recipients: 4_120, opened: 3_190, sms: 930 },
  { id: "MSG-206", at: "18:10", by: "Mwila Banda", title: "VIP lounge is now open", audience: "VIP and VVIP ticket holders", priority: "NORMAL", recipients: 2_920, opened: 2_402, sms: 0 },
  { id: "MSG-205", at: "15:30", by: "Chanda Mulenga", title: "Staff briefing at the stage in 15 minutes", audience: "All staff", priority: "NORMAL", recipients: 64, opened: 61, sms: 0 },
];

/** What an attendee sees from the organiser in the app. */
export const inbox = [
  { at: "19:30", title: "Headline acts start at 21:00", body: "Grab your spot early. Food courts stay open until midnight.", urgent: false },
  { at: "18:45", title: "Gate B is closed, please use Gate A", body: "Gate B is closed for safety. Follow the stewards to Gate A. Your ticket works at either gate.", urgent: true },
];

/** The signed-in attendee's own requests (Chanda Mulenga). */
export const myRequests = [
  { id: "CS-2611-0429", event: "Lusaka Summer Jam", eventSlug: "lusaka-summer-jam-2026", what: "Ticket or entry problem", where: "Gate A", at: "Today 19:52", status: "COMPLETED" as const, by: "Kelvin (gate team)" },
  { id: "CS-2610-0371", event: "Zed Live Sessions: October", eventSlug: "lusaka-summer-jam-2026", what: "Lost and found", where: "General area", at: "18 Oct, 21:40", status: "COMPLETED" as const, by: "Chileshe (lost and found)" },
];
