const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const DAY_NAMES_LONG = [
  "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday",
];

export const MONTH_ABBR = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function addDays(date: Date, n: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + n);
  return d;
}

/** Whole calendar days from `b` to `a` (a - b), ignoring time-of-day. */
export function diffDays(a: Date, b: Date): number {
  const ms =
    new Date(a.getFullYear(), a.getMonth(), a.getDate()).getTime() -
    new Date(b.getFullYear(), b.getMonth(), b.getDate()).getTime();
  return Math.round(ms / 86400000);
}

/** Start of the week containing `date`, where `anchor` (0=Sun..6=Sat) is the
 * weekday a week begins on. E.g. anchor=1 → Monday-of-week. */
export function getWeekStart(date: Date, anchor: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const diff = (d.getDay() - anchor + 7) % 7;
  d.setDate(d.getDate() - diff);
  return d;
}

export function formatMMDDYYYY(date: Date): string {
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${date.getFullYear()}`;
}

export function weekdayLabel(date: Date): string {
  return WEEKDAY_LABELS[date.getDay()];
}

/** Value for an <input type="date"> — local calendar date, not UTC-shifted. */
export function toDateInputValue(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

/** Parses an <input type="date"> value ("YYYY-MM-DD") as a local date. */
export function parseDateInputValue(value: string): Date {
  const [y, m, d] = value.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function getMondayOfWeek(date: Date): Date {
  return getWeekStart(date, 1);
}

/** Every date of the given month (0-indexed month). */
export function getAllDaysOfMonth(year: number, monthIndex: number): Date[] {
  const days: Date[] = [];
  const last = new Date(year, monthIndex + 1, 0).getDate();
  for (let d = 1; d <= last; d++) days.push(new Date(year, monthIndex, d));
  return days;
}

export function isWeekend(date: Date): boolean {
  const dow = date.getDay();
  return dow === 0 || dow === 6;
}

export const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export type MonthOption = { year: number; month: number; label: string; value: string };

/** Month picker options spanning `monthsBack` months before to `monthsForward` after `today`. */
export function getMonthOptions(today: Date, monthsBack = 12, monthsForward = 12): MonthOption[] {
  const options: MonthOption[] = [];
  const base = new Date(today.getFullYear(), today.getMonth(), 1);

  for (let offset = -monthsBack; offset <= monthsForward; offset++) {
    const d = new Date(base.getFullYear(), base.getMonth() + offset, 1);
    options.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: `${MONTH_ABBR[d.getMonth()]} ${d.getFullYear()}`,
      value: `${d.getFullYear()}-${d.getMonth()}`,
    });
  }

  return options;
}
