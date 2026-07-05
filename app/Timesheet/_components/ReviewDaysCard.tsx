"use client";

import { X, CalendarPlus } from "lucide-react";
import type { DayRow } from "../_lib/weekSplitter";
import { toDateInputValue, parseDateInputValue, weekdayLabel, isWeekend } from "../_lib/dateUtils";
import { getHolidayNameForDate } from "../_lib/holidays";

type Props = {
  rows: DayRow[];
  onUpdateDate: (id: string, date: Date) => void;
  onUpdateHours: (id: string, hours: number) => void;
  onRemoveRow: (id: string) => void;
  onAddRow: () => void;
  onPrefillWeekdays: () => void;
  onTotal: () => void;
  selectedYear: number;
  selectedMonthIndex: number;
  monthLabel: string;
};

export default function ReviewDaysCard({
  rows,
  onUpdateDate,
  onUpdateHours,
  onRemoveRow,
  onAddRow,
  onPrefillWeekdays,
  onTotal,
  selectedYear,
  selectedMonthIndex,
  monthLabel,
}: Props) {
  const enteredTotal = rows.reduce((sum, r) => sum + (Number.isFinite(r.hours) ? r.hours : 0), 0);

  return (
    <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-baseline gap-2">
        <span style={{ fontFamily: "var(--font-playfair)" }} className="text-xl font-bold text-timesheetRust">
          3
        </span>
        <h2 style={{ fontFamily: "var(--font-playfair)" }} className="text-xl font-bold text-[#1a1a1a]">
          Review the days
        </h2>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        This is what was read from the file. Fix any wrong hours, add or delete days, then total it. Days{" "}
        <span className="italic">outside</span> the selected month are dimmed — they won&apos;t count toward this month.
      </p>

      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-600">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-sky-300 bg-sky-100" /> Weekend
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-amber-300 bg-amber-100" /> Federal holiday
        </span>
      </div>

      <div className="mt-3 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[560px] text-sm">
          <thead>
            <tr className="bg-[#1a1a1a] text-left text-xs font-semibold uppercase tracking-wide text-white">
              <th className="px-4 py-2.5">Date</th>
              <th className="px-4 py-2.5">Day</th>
              <th className="px-4 py-2.5">Hours</th>
              <th className="px-4 py-2.5">Source</th>
              <th className="px-4 py-2.5" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const inSelectedMonth = row.date.getFullYear() === selectedYear && row.date.getMonth() === selectedMonthIndex;
              const holidayName = getHolidayNameForDate(row.date);
              const weekend = isWeekend(row.date);
              // Holiday tint takes precedence over the weekend tint.
              const rowBg = holidayName ? "bg-amber-50" : weekend ? "bg-sky-50" : "";
              return (
                <tr key={row.id} className={`border-b border-gray-100 last:border-0 ${rowBg} ${inSelectedMonth ? "" : "opacity-45"}`}>
                  <td className="px-4 py-2">
                    <input
                      type="date"
                      value={toDateInputValue(row.date)}
                      onChange={(e) => e.target.value && onUpdateDate(row.id, parseDateInputValue(e.target.value))}
                      className="rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-timesheetRust focus:outline-none"
                    />
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-gray-600">
                    <span className={weekend ? "font-medium text-sky-700" : ""}>{weekdayLabel(row.date)}</span>
                    {weekend && !holidayName && (
                      <span className="ml-1.5 rounded-full bg-sky-100 px-1.5 py-0.5 text-[11px] font-medium text-sky-800">
                        Weekend
                      </span>
                    )}
                    {holidayName && (
                      <span className="ml-1.5 rounded-full bg-amber-100 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
                        {holidayName}
                      </span>
                    )}
                    {!inSelectedMonth && <span className="ml-1 text-xs text-gray-400">· other mo.</span>}
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="number"
                      min={0}
                      max={24}
                      step={0.25}
                      value={row.hours}
                      onChange={(e) => onUpdateHours(row.id, Number(e.target.value))}
                      className="w-20 rounded-md border border-gray-300 px-2 py-1 text-sm focus:border-timesheetRust focus:outline-none"
                    />
                  </td>
                  <td className="max-w-[240px] truncate px-4 py-2 text-xs text-gray-500" title={row.source}>
                    {row.source}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <button type="button" onClick={() => onRemoveRow(row.id)} aria-label="Remove day">
                      <X size={16} className="text-timesheetRust hover:text-timesheetRustDark" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {rows.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-6 text-center text-sm text-gray-400">
                  No days yet — read a file above or add one manually.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onAddRow}
            className="rounded-lg border border-timesheetRust px-4 py-2 text-sm font-semibold text-timesheetRust transition hover:bg-timesheetCream"
          >
            + Add day
          </button>
          <button
            type="button"
            onClick={onPrefillWeekdays}
            className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-timesheetRust hover:text-timesheetRust"
          >
            <CalendarPlus size={15} /> Prefill {monthLabel}
          </button>
          <button
            type="button"
            onClick={onTotal}
            disabled={rows.length === 0}
            className="rounded-lg bg-timesheetRust px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-timesheetRustDark disabled:cursor-not-allowed disabled:opacity-40"
          >
            Total into weeks ↓
          </button>
        </div>
        <span className="text-sm font-semibold text-[#1a1a1a]">Entered total: {enteredTotal.toFixed(2)} hrs</span>
      </div>
    </section>
  );
}
