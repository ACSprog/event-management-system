/**
 * Attendee requests during an event, and event messages (agreed 19 Nov 2026).
 *
 * Requests: an attendee asks for help (usher, security, first aid ...) from
 * their ticket, the event page or a QR code on a pew, table or poster. Each
 * event chooses how requests reach staff: the organiser assigns every request,
 * or they go automatically to on-duty staff with the matching duty and area and
 * the organiser can reassign. Unaccepted requests escalate after 2 minutes.
 *
 * Messages: in-app and push by default (free). Urgent messages add an SMS
 * backup after 2 minutes, only to people who haven't opened the message. SMS
 * comes from the organiser's credits; urgent messages still go out when credits
 * run out and the shortfall is added to the next invoice at the normal rate.
 */

export type DutyKey = "security" | "usher" | "protocol" | "first_aid" | "lost_found" | "cleaning" | "access" | "other";

export interface Duty {
  key: DutyKey;
  /** What attendees see. Organisations rename these ("Request an usher", "Request protocol"). */
  ask: string;
  /** What the staff team is called. */
  team: string;
  hint: string;
  /** Visible only to the staff handling it, the organiser and event managers. */
  sensitive?: boolean;
  urgent?: boolean;
}

export const defaultDuties: Duty[] = [
  { key: "usher", ask: "Request an attendant", team: "Attendants", hint: "Directions, seats, tables, finding someone" },
  { key: "security", ask: "Request security", team: "Security", hint: "A bouncer or security officer", sensitive: true, urgent: true },
  { key: "first_aid", ask: "First aid", team: "First aid", hint: "Someone feels unwell or is hurt", sensitive: true, urgent: true },
  { key: "access", ask: "Ticket or entry problem", team: "Gate team", hint: "Ticket won't scan, wrong gate, seat taken" },
  { key: "lost_found", ask: "Lost and found", team: "Lost and found", hint: "Lost or found something" },
  { key: "cleaning", ask: "Cleaning or toilets", team: "Facilities", hint: "Spills, toilets, broken chairs" },
  { key: "other", ask: "Something else", team: "Organisers", hint: "Any other request" },
];

/** A church renames and adds duties: the attendee sees its own words. */
export const churchDuties: Duty[] = [
  { key: "usher", ask: "Request an usher", team: "Ushers", hint: "Seating, directions, the children's ministry" },
  { key: "protocol", ask: "Request protocol", team: "Protocol", hint: "Special guests, the pastor's office, programme" },
  { key: "first_aid", ask: "First aid", team: "First aid", hint: "Someone feels unwell or is hurt", sensitive: true, urgent: true },
  { key: "security", ask: "Request security", team: "Security", hint: "Parking, safety concerns", sensitive: true, urgent: true },
  { key: "lost_found", ask: "Lost and found", team: "Lost and found", hint: "Lost or found something" },
  { key: "other", ask: "Something else", team: "Church office", hint: "Any other request" },
];

export type AssignMode = "ORGANISER_ASSIGNS" | "AUTOMATIC";

export type RequestStatus = "SUBMITTED" | "ASSIGNED" | "ACCEPTED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED" | "ESCALATED";

export const statusLabel: Record<RequestStatus, string> = {
  SUBMITTED: "Sent",
  ASSIGNED: "Assigned",
  ACCEPTED: "On the way",
  IN_PROGRESS: "With you",
  COMPLETED: "Done",
  CANCELLED: "Cancelled",
  ESCALATED: "Escalated",
};

export const flow: RequestStatus[] = ["SUBMITTED", "ASSIGNED", "ACCEPTED", "IN_PROGRESS", "COMPLETED"];

export const ESCALATE_AFTER_SECONDS = 120;

/* Event messages ----------------------------------------------------------- */

export type Priority = "NORMAL" | "URGENT";

/** Share of an audience that usually has no app or notifications, used to estimate the SMS backup. */
export const smsBackupShare = 0.18;
export const smsPrice = 0.35;

export interface AudienceRule {
  who: "attendees" | "staff" | "everyone";
  ticketTypes: string[];
  genders: string[];
  checkIn: "any" | "in" | "not_in";
  areas: string[];
  duties: string[];
}

export const emptyRule: AudienceRule = { who: "attendees", ticketTypes: [], genders: [], checkIn: "any", areas: [], duties: [] };
