/**
 * Date ranges for the event filters ("Today", "This weekend", "Next month"...).
 * Weeks run Monday to Sunday; the weekend is Friday 17:00 to Sunday night,
 * which is when most Zambian weekend events happen. Times are Zambia time.
 */

/** The showcase's fixed "now", matching the rest of the sample data. The live system uses the real clock. */
export const demoNow = new Date("2026-11-18T12:00:00+02:00");

export type DateRangeKey = "any" | "today" | "tomorrow" | "weekend" | "this-week" | "next-week" | "this-month" | "next-month" | "custom";

export const dateRangeLabels: Record<DateRangeKey, string> = {
  any: "Any date",
  today: "Today",
  tomorrow: "Tomorrow",
  weekend: "This weekend",
  "this-week": "This week",
  "next-week": "Next week",
  "this-month": "This month",
  "next-month": "Next month",
  custom: "Pick dates",
};

const DAY = 86_400_000;
/** Midnight in Zambia (UTC+2) for the day containing t. */
const startOfDay = (t: number) => {
  const local = t + 2 * 3_600_000;
  return local - (local % DAY) - 2 * 3_600_000;
};
/** 0 = Monday ... 6 = Sunday, in Zambia time. */
const weekday = (t: number) => (new Date(t + 2 * 3_600_000).getUTCDay() + 6) % 7;

/** [from, to) in milliseconds. */
export function rangeFor(key: DateRangeKey, now = demoNow.getTime(), custom?: { from?: string; to?: string }): [number, number] {
  const today = startOfDay(now);
  const mondayThisWeek = today - weekday(now) * DAY;
  const local = new Date(now + 2 * 3_600_000);
  const firstOfMonth = (y: number, m: number) => Date.UTC(y, m, 1) - 2 * 3_600_000;
  switch (key) {
    case "today": return [now, today + DAY];
    case "tomorrow": return [today + DAY, today + 2 * DAY];
    case "weekend": {
      const fri5pm = mondayThisWeek + 4 * DAY + 17 * 3_600_000;
      return [Math.max(now, fri5pm), mondayThisWeek + 7 * DAY];
    }
    case "this-week": return [now, mondayThisWeek + 7 * DAY];
    case "next-week": return [mondayThisWeek + 7 * DAY, mondayThisWeek + 14 * DAY];
    case "this-month": return [now, firstOfMonth(local.getUTCFullYear(), local.getUTCMonth() + 1)];
    case "next-month": return [firstOfMonth(local.getUTCFullYear(), local.getUTCMonth() + 1), firstOfMonth(local.getUTCFullYear(), local.getUTCMonth() + 2)];
    case "custom": {
      const from = custom?.from ? new Date(`${custom.from}T00:00:00+02:00`).getTime() : now;
      const to = custom?.to ? new Date(`${custom.to}T00:00:00+02:00`).getTime() + DAY : Infinity;
      return [Math.max(from, now), to];
    }
    default: return [now, Infinity];
  }
}

/** An event matches a range if any part of it falls inside the range. */
export const overlaps = (start: string, end: string, [from, to]: [number, number]) => new Date(start).getTime() < to && new Date(end).getTime() >= from;
