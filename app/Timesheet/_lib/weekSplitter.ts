import { getWeekStart } from "./dateUtils";

export type DayRow = {
  id: string;
  date: Date;
  hours: number;
  source: string;
};

export type WeekBucket = {
  weekStart: Date;
  weekEnd: Date;
  days: Array<DayRow & { inSelectedMonth: boolean }>;
  totalHours: number;
};

export type WeekSplitResult = {
  weeks: WeekBucket[];
  monthTotalHours: number;
};

function isSameMonth(date: Date, year: number, monthIndex: number): boolean {
  return date.getFullYear() === year && date.getMonth() === monthIndex;
}

/** Groups day rows into weeks starting on `weekAnchor` (0=Sun..6=Sat, default
 * Monday). Only days that fall inside `selectedYear`/`selectedMonthIndex` count
 * toward each week's/the month's total — other days still display (dimmed by the
 * caller) but are excluded from totals. */
export function splitIntoWeeks(
  rows: DayRow[],
  selectedYear: number,
  selectedMonthIndex: number,
  weekAnchor = 1
): WeekSplitResult {
  const weekMap = new Map<string, DayRow[]>();

  for (const row of rows) {
    const weekStart = getWeekStart(row.date, weekAnchor);
    const key = weekStart.toISOString();
    const bucket = weekMap.get(key);
    if (bucket) bucket.push(row);
    else weekMap.set(key, [row]);
  }

  const weeks: WeekBucket[] = Array.from(weekMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, days]) => {
      const weekStart = new Date(key);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const daysWithFlag = days
        .slice()
        .sort((a, b) => a.date.getTime() - b.date.getTime())
        .map((d) => ({
          ...d,
          inSelectedMonth: isSameMonth(d.date, selectedYear, selectedMonthIndex),
        }));

      const totalHours = daysWithFlag
        .filter((d) => d.inSelectedMonth)
        .reduce((sum, d) => sum + d.hours, 0);

      return { weekStart, weekEnd, days: daysWithFlag, totalHours };
    });

  const monthTotalHours = weeks.reduce((sum, w) => sum + w.totalHours, 0);

  return { weeks, monthTotalHours };
}
