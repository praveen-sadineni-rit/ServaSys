"use client";

import type { WeekSplitResult } from "../_lib/weekSplitter";
import { formatMMDDYYYY, weekdayLabel, DAY_NAMES_LONG } from "../_lib/dateUtils";

export default function WeeklyTotalsCard({ result, weekAnchor = 1 }: { result: WeekSplitResult; weekAnchor?: number }) {
  const startDay = DAY_NAMES_LONG[weekAnchor];
  const endDay = DAY_NAMES_LONG[(weekAnchor + 6) % 7];
  return (
    <section className="mt-6 rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      <div className="flex items-baseline gap-2">
        <span style={{ fontFamily: "var(--font-playfair)" }} className="text-xl font-bold text-timesheetRust">
          4
        </span>
        <h2 style={{ fontFamily: "var(--font-playfair)" }} className="text-xl font-bold text-[#1a1a1a]">
          {startDay}–{endDay} weeks
        </h2>
      </div>
      <p className="mt-1 text-sm text-gray-600">
        Days outside the selected month are dimmed and excluded from every subtotal below.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        {result.weeks.map((week) => (
          <div key={week.weekStart.toISOString()} className="rounded-lg border border-gray-200 p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm font-semibold text-[#1a1a1a]">
                Week of {formatMMDDYYYY(week.weekStart)} – {formatMMDDYYYY(week.weekEnd)}
              </span>
              <span className="text-sm font-semibold text-timesheetRust">{week.totalHours.toFixed(2)} hrs</span>
            </div>
            <ul className="mt-2 space-y-1 text-sm">
              {week.days.map((day) => (
                <li
                  key={day.id}
                  className={`flex items-center justify-between gap-3 ${day.inSelectedMonth ? "text-[#1a1a1a]" : "text-gray-400"}`}
                >
                  <span>
                    {formatMMDDYYYY(day.date)} · {weekdayLabel(day.date)}
                  </span>
                  <span>
                    {day.hours.toFixed(2)} hrs
                    {!day.inSelectedMonth && <span className="ml-2 text-xs italic">excluded — outside selected month</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end border-t border-black/10 pt-4">
        <span className="text-base font-semibold text-[#1a1a1a]">
          Month total: <span className="text-timesheetRust">{result.monthTotalHours.toFixed(2)} hrs</span>
        </span>
      </div>
    </section>
  );
}
