/**
 * Cases: every conversation between an attendee and an organiser's team gets a
 * case number, whether it's a question, a complaint or a help request at the
 * event. Agreed 19 Nov 2026.
 *
 * Case numbers look like CS-2611-0405: "CS", the year and month it was opened,
 * and a running number. The attendee can quote it by phone or SMS, and staff
 * can search for it.
 *
 * Expiry:
 * - A chat closes (read-only) 14 days after the event ends, or 24 hours after a
 *   help request is marked done. After that the attendee starts a new case and
 *   can quote the old number.
 * - Messages and call logs are deleted 90 days after a case closes. The case
 *   number, type, dates and outcome are kept for reports and disputes.
 *
 * Calls: an in-app voice call over data, so neither side sees the other's phone
 * number. Only on an open case, and only while the organiser is answering
 * (event days or their support hours). Calls are not recorded; the case keeps a
 * log of each call (who, when, how long). A normal phone call to the
 * organiser's on-site number is always offered too, for when there's no data.
 */

export type CaseType = "Question" | "Complaint" | "Help request" | "Lost and found" | "Refund or ticket problem" | "Other";
export type CaseStatus = "Open" | "Waiting for you" | "Answered" | "Closed" | "Expired";

export interface CaseMessage {
  from: "attendee" | "team" | "system";
  name?: string;
  at: string;
  text: string;
  /** For calls: duration in seconds (0 = missed). */
  call?: { seconds: number; by: "attendee" | "team" };
}

export interface Case {
  number: string;
  type: CaseType;
  subject: string;
  event: string;
  eventSlug: string;
  org: string;
  status: CaseStatus;
  opened: string;
  /** When the chat becomes read-only. */
  closesOn: string;
  /** When messages and call logs are deleted. */
  deletesOn?: string;
  unread?: number;
  messages: CaseMessage[];
}

export const CHAT_DAYS_AFTER_EVENT = 14;
export const HELP_CHAT_HOURS_AFTER_DONE = 24;
export const KEEP_MESSAGES_DAYS = 90;

export const caseTypes: CaseType[] = ["Question", "Complaint", "Refund or ticket problem", "Lost and found", "Other"];

let seq = 412;
/** Next case number, e.g. CS-2611-0413. In the live system the server issues these. */
export function nextCaseNumber(now = new Date("2026-11-18T12:00:00+02:00")) {
  seq += 1;
  const yymm = `${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}`;
  return `CS-${yymm}-${String(seq).padStart(4, "0")}`;
}

export const isOpen = (c: Pick<Case, "status">) => c.status !== "Closed" && c.status !== "Expired";

export const fmtCall = (s: number) => (s === 0 ? "missed" : `${Math.floor(s / 60)} min ${String(s % 60).padStart(2, "0")} s`);
