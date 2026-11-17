/**
 * Business-day arithmetic for settlement deadlines.
 * Business days exclude Saturdays, Sundays and the public holidays the super
 * admin keeps in the holiday calendar. The API uses the same rules
 * (calendar module); this copy only drives countdowns on screen.
 */

const iso = (d: Date) => d.toISOString().slice(0, 10);

export function isBusinessDay(date: Date, holidays: string[]) {
  const day = date.getUTCDay();
  return day !== 0 && day !== 6 && !holidays.includes(iso(date));
}

/** The date `n` business days after `start` (the start day itself is not counted). */
export function addBusinessDays(start: string, n: number, holidays: string[]) {
  const d = new Date(`${start.slice(0, 10)}T12:00:00Z`);
  let left = n;
  while (left > 0) {
    d.setUTCDate(d.getUTCDate() + 1);
    if (isBusinessDay(d, holidays)) left--;
  }
  return iso(d);
}

/** Business days from `from` until `to` (0 if `to` is today, negative if past). */
export function businessDaysUntil(from: string, to: string, holidays: string[]) {
  const a = new Date(`${from.slice(0, 10)}T12:00:00Z`);
  const b = new Date(`${to.slice(0, 10)}T12:00:00Z`);
  const sign = b >= a ? 1 : -1;
  let count = 0;
  const d = new Date(a);
  while (iso(d) !== iso(b)) {
    d.setUTCDate(d.getUTCDate() + sign);
    if (isBusinessDay(d, holidays)) count += sign;
  }
  return count;
}
