/**
 * Gender is asked when an attendee creates an account and for every ticket
 * bought (the buyer says who each ticket is for). "Prefer not to say" is always
 * an option. It is used only for event statistics and event messages, shown to
 * organisers as totals (never as a list of people), and never shown to other
 * attendees. Decided 19 Nov 2026.
 */
export const genders = ["Female", "Male", "Prefer not to say"] as const;
export type Gender = (typeof genders)[number];

export const genderPurpose = "Used for event statistics and event announcements. Never shown to other attendees.";

/** Groups smaller than this are shown as "fewer than 10" so nobody can be identified. */
export const minGroup = 10;

export function genderSplit(rows: { gender?: Gender | null }[]) {
  const total = rows.length;
  const count = (g: Gender) => rows.filter((r) => r.gender === g).length;
  const female = count("Female");
  const male = count("Male");
  const notStated = total - female - male;
  return { total, female, male, notStated };
}

export const showCount = (n: number) => (n > 0 && n < minGroup ? `fewer than ${minGroup}` : n.toLocaleString());
export const pct = (n: number, total: number) => (total ? `${Math.round((n / total) * 100)}%` : "0%");
