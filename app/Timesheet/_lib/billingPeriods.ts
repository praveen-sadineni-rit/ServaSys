import { addDays, diffDays, getWeekStart, DAY_NAMES_LONG } from "./dateUtils";

export type BillingCycle = "weekly" | "biweekly" | "semimonthly" | "monthly";

export const BILLING_CYCLES: BillingCycle[] = ["weekly", "biweekly", "semimonthly", "monthly"];

/** Short label used on chips/badges. */
export const BILLING_CYCLE_LABELS: Record<BillingCycle, string> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  semimonthly: "Semi-monthly",
  monthly: "Monthly",
};

/** Longer label used in the Billing cycle <select>. */
export const BILLING_CYCLE_SELECT_LABELS: Record<BillingCycle, string> = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  semimonthly: "Semi-monthly (1–15 / 16–EOM)",
  monthly: "Monthly",
};

export type BillingConfig = {
  cycle: BillingCycle;
  netTermsDays: number;
  /** Weekday a weekly/biweekly period starts on: 0=Sun..6=Sat. */
  weekAnchor: number;
  /** Optional MM/DD/YYYY anchor that fixes the biweekly fortnight cadence. */
  biweeklyReference: string;
};

export const DEFAULT_BILLING_CONFIG: BillingConfig = {
  cycle: "monthly",
  netTermsDays: 30,
  weekAnchor: 1,
  biweeklyReference: "",
};

export type BillingPeriod = { start: Date; end: Date; days: number };

/** "Week runs" dropdown options — every start weekday paired with the day before it. */
export const WEEK_ANCHOR_OPTIONS = DAY_NAMES_LONG.map((_, anchor) => ({
  value: anchor,
  label: `${DAY_NAMES_LONG[anchor]} → ${DAY_NAMES_LONG[(anchor + 6) % 7]}`,
}));

export function weekRunsLabel(anchor: number): string {
  return `${DAY_NAMES_LONG[anchor]} → ${DAY_NAMES_LONG[(anchor + 6) % 7]}`;
}

function daysBetweenInclusive(start: Date, end: Date): number {
  return diffDays(end, start) + 1;
}

function endsInMonth(end: Date, year: number, monthIndex: number): boolean {
  return end.getFullYear() === year && end.getMonth() === monthIndex;
}

function parseReference(value: string): Date | null {
  const m = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const month = Number(m[1]);
  const day = Number(m[2]);
  const year = Number(m[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return new Date(year, month - 1, day);
}

/** Anchor date that fixes the biweekly (14-day) cadence. If a reference is given
 * we snap it to the chosen start weekday; otherwise we use a fixed 2024 Monday
 * grid shifted to the chosen weekday (chosen so common cases land on clean
 * calendar boundaries). */
function biweeklyEpoch(anchor: number, reference: string): Date {
  const ref = parseReference(reference);
  if (ref) return getWeekStart(ref, anchor);
  // 2024-01-01 is a Monday; shift forward to the requested start weekday.
  const base = new Date(2024, 0, 1);
  return addDays(base, (anchor - 1 + 7) % 7);
}

/** Fixed-length (7 or 14 day) periods on a weekday grid, keeping only those that
 * END inside the target month — i.e. "billed in the month it ends". */
function fixedLengthPeriods(
  year: number,
  monthIndex: number,
  lengthDays: number,
  gridStart: Date
): BillingPeriod[] {
  const monthEnd = new Date(year, monthIndex + 1, 0);
  const periods: BillingPeriod[] = [];

  for (let i = 0; i < 8; i++) {
    const start = addDays(gridStart, i * lengthDays);
    const end = addDays(start, lengthDays - 1);
    if (endsInMonth(end, year, monthIndex)) {
      periods.push({ start, end, days: lengthDays });
    }
    // Stop once we've stepped past the month entirely.
    if (start > monthEnd) break;
  }

  return periods;
}

export function getBillingPeriodsForMonth(
  year: number,
  monthIndex: number,
  config: BillingConfig
): BillingPeriod[] {
  const monthStart = new Date(year, monthIndex, 1);
  const monthEnd = new Date(year, monthIndex + 1, 0);

  switch (config.cycle) {
    case "monthly":
      return [{ start: monthStart, end: monthEnd, days: daysBetweenInclusive(monthStart, monthEnd) }];

    case "semimonthly": {
      const firstHalfEnd = new Date(year, monthIndex, 15);
      const secondHalfStart = new Date(year, monthIndex, 16);
      return [
        { start: monthStart, end: firstHalfEnd, days: daysBetweenInclusive(monthStart, firstHalfEnd) },
        { start: secondHalfStart, end: monthEnd, days: daysBetweenInclusive(secondHalfStart, monthEnd) },
      ];
    }

    case "weekly": {
      // Start scanning a week before the month so periods ending early are caught.
      const gridStart = getWeekStart(addDays(monthStart, -7), config.weekAnchor);
      return fixedLengthPeriods(year, monthIndex, 7, gridStart);
    }

    case "biweekly": {
      const epoch = biweeklyEpoch(config.weekAnchor, config.biweeklyReference);
      const k = Math.floor(diffDays(monthStart, epoch) / 14);
      // Back up one fortnight so a period ending at the very start of the month is caught.
      const gridStart = addDays(epoch, (k - 1) * 14);
      return fixedLengthPeriods(year, monthIndex, 14, gridStart);
    }
  }
}
