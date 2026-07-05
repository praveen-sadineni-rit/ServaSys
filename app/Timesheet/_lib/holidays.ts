// US federal holiday dates, ported from RIT_Website's app/page.tsx holiday-banner
// logic, plus "observed date" weekend adjustment (added here — the original didn't
// need it since it only checks "is today a holiday").

export type FederalHoliday = {
  name: string;
  getDate: (year: number) => Date;
};

export type HolidayOccurrence = {
  name: string;
  date: Date;
  dayOfWeekLabel: string;
  observedDate: Date | null;
};

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/** Nth weekday of a month, e.g. 3rd Monday of January. weekday: 0=Sun..6=Sat, n: 1-based */
function nthWeekdayOfMonth(year: number, month: number, weekday: number, n: number): Date {
  const first = new Date(year, month, 1);
  const offset = (weekday - first.getDay() + 7) % 7;
  return new Date(year, month, 1 + offset + (n - 1) * 7);
}

/** Last weekday of a month, e.g. last Monday of May */
function lastWeekdayOfMonth(year: number, month: number, weekday: number): Date {
  const lastDay = new Date(year, month + 1, 0);
  const offset = (lastDay.getDay() - weekday + 7) % 7;
  return new Date(year, month, lastDay.getDate() - offset);
}

export const FEDERAL_HOLIDAYS: FederalHoliday[] = [
  { name: "New Year's Day", getDate: (y) => new Date(y, 0, 1) },
  { name: "Martin Luther King Jr. Day", getDate: (y) => nthWeekdayOfMonth(y, 0, 1, 3) },
  { name: "Presidents Day", getDate: (y) => nthWeekdayOfMonth(y, 1, 1, 3) },
  { name: "Memorial Day", getDate: (y) => lastWeekdayOfMonth(y, 4, 1) },
  { name: "Juneteenth", getDate: (y) => new Date(y, 5, 19) },
  { name: "Independence Day", getDate: (y) => new Date(y, 6, 4) },
  { name: "Labor Day", getDate: (y) => nthWeekdayOfMonth(y, 8, 1, 1) },
  { name: "Columbus Day", getDate: (y) => nthWeekdayOfMonth(y, 9, 1, 2) },
  { name: "Veterans Day", getDate: (y) => new Date(y, 10, 11) },
  { name: "Thanksgiving Day", getDate: (y) => nthWeekdayOfMonth(y, 10, 4, 4) },
  { name: "Christmas Day", getDate: (y) => new Date(y, 11, 25) },
];

/** Federal "in lieu of" rule: Saturday holidays are observed the preceding Friday,
 * Sunday holidays the following Monday. Weekday holidays are observed as-is. */
export function getObservedDate(date: Date): Date {
  const day = date.getDay();
  if (day === 6) {
    const d = new Date(date);
    d.setDate(d.getDate() - 1);
    return d;
  }
  if (day === 0) {
    const d = new Date(date);
    d.setDate(d.getDate() + 1);
    return d;
  }
  return date;
}

function isSameCalendarDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

/** Federal holidays whose statutory date falls in the given month/year (monthIndex 0-11). */
export function getHolidaysInMonth(year: number, monthIndex: number): HolidayOccurrence[] {
  return FEDERAL_HOLIDAYS.filter((h) => h.getDate(year).getMonth() === monthIndex).map((h) => {
    const date = h.getDate(year);
    const observed = getObservedDate(date);
    return {
      name: h.name,
      date,
      dayOfWeekLabel: DAY_LABELS[date.getDay()],
      observedDate: isSameCalendarDay(observed, date) ? null : observed,
    };
  });
}

/** True if `date` is the statutory or observed date of any US federal holiday that year. */
export function isFederalHolidayOrObserved(date: Date): boolean {
  return getHolidayNameForDate(date) !== null;
}

/** Federal holiday name if `date` is its statutory or observed date, else null. */
export function getHolidayNameForDate(date: Date): string | null {
  const year = date.getFullYear();
  for (const h of FEDERAL_HOLIDAYS) {
    const statutory = h.getDate(year);
    const observed = getObservedDate(statutory);
    if (isSameCalendarDay(date, statutory) || isSameCalendarDay(date, observed)) return h.name;
  }
  return null;
}
