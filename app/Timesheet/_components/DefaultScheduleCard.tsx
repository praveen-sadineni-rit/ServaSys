"use client";

import { useMemo } from "react";
import {
  Settings,
  CalendarDays,
  CalendarRange,
  Hourglass,
  CheckCircle2,
  SlidersHorizontal,
  Search,
  Hash,
  Lightbulb,
  Anchor,
  Info,
} from "lucide-react";
import {
  getBillingPeriodsForMonth,
  BILLING_CYCLES,
  BILLING_CYCLE_LABELS,
  BILLING_CYCLE_SELECT_LABELS,
  WEEK_ANCHOR_OPTIONS,
  weekRunsLabel,
  type BillingCycle,
  type BillingConfig,
} from "../_lib/billingPeriods";
import { getHolidaysInMonth } from "../_lib/holidays";
import { formatMMDDYYYY, getMonthOptions, MONTH_NAMES, MONTH_ABBR } from "../_lib/dateUtils";

export type MonthOverride = BillingCycle | "default";

type Props = {
  config: BillingConfig;
  onConfigChange: (patch: Partial<BillingConfig>) => void;
  overrides: MonthOverride[];
  onOverrideChange: (monthIndex: number, value: MonthOverride) => void;
  selectedYear: number;
  selectedMonthIndex: number;
  onMonthChange: (year: number, monthIndex: number) => void;
};

/** Tailwind chip palettes keyed loosely to the reference screenshots. */
const CYCLE_CHIP: Record<BillingCycle, string> = {
  monthly: "bg-indigo-50 text-indigo-700 border-indigo-200",
  semimonthly: "bg-violet-50 text-violet-700 border-violet-200",
  weekly: "bg-teal-50 text-teal-700 border-teal-200",
  biweekly: "bg-amber-50 text-amber-700 border-amber-200",
};

function Chip({
  icon,
  children,
  className,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
  className: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${className}`}>
      {icon}
      {children}
    </span>
  );
}

const FIELD_LABEL = "mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500";
const CONTROL =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-[#1a1a1a] focus:border-timesheetRust focus:outline-none focus:ring-2 focus:ring-timesheetRust/20";

export default function DefaultScheduleCard({
  config,
  onConfigChange,
  overrides,
  onOverrideChange,
  selectedYear,
  selectedMonthIndex,
  onMonthChange,
}: Props) {
  const monthOptions = useMemo(() => getMonthOptions(new Date()), []);
  const isWeekBased = config.cycle === "weekly" || config.cycle === "biweekly";

  const overrideCount = overrides.filter((o) => o !== "default").length;

  // The effective cycle for the previewed month respects a per-month override.
  const effectiveCycle: BillingCycle =
    overrides[selectedMonthIndex] !== "default" ? (overrides[selectedMonthIndex] as BillingCycle) : config.cycle;

  const periods = useMemo(
    () =>
      getBillingPeriodsForMonth(selectedYear, selectedMonthIndex, { ...config, cycle: effectiveCycle }),
    [selectedYear, selectedMonthIndex, config, effectiveCycle]
  );
  const holidays = useMemo(
    () => getHolidaysInMonth(selectedYear, selectedMonthIndex),
    [selectedYear, selectedMonthIndex]
  );

  return (
    <section className="rounded-2xl border border-black/10 bg-white p-6 shadow-sm">
      {/* Heading */}
      <div className="flex items-center gap-2 text-timesheetRust">
        <Settings size={16} />
        <h2 className="text-xs font-bold uppercase tracking-widest">Default schedule</h2>
      </div>

      {/* Status chips */}
      <div className="mt-3 flex flex-wrap gap-2">
        <Chip icon={<CalendarDays size={13} />} className={CYCLE_CHIP[config.cycle]}>
          {BILLING_CYCLE_LABELS[config.cycle]}
        </Chip>
        <Chip icon={<Hourglass size={13} />} className="bg-amber-50 text-amber-700 border-amber-200">
          Net {config.netTermsDays} days
        </Chip>
        {isWeekBased && (
          <Chip icon={<CalendarRange size={13} />} className="bg-sky-50 text-sky-700 border-sky-200">
            {weekRunsLabel(config.weekAnchor)}
          </Chip>
        )}
        {overrideCount === 0 ? (
          <Chip icon={<CheckCircle2 size={13} />} className="bg-emerald-50 text-emerald-700 border-emerald-200">
            No overrides
          </Chip>
        ) : (
          <Chip icon={<SlidersHorizontal size={13} />} className="bg-orange-50 text-orange-700 border-orange-200">
            {overrideCount} override{overrideCount === 1 ? "" : "s"}
          </Chip>
        )}
      </div>

      {/* Controls */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div>
          <label htmlFor="billing-cycle" className={FIELD_LABEL}>
            <CalendarDays size={13} /> Billing cycle
          </label>
          <select
            id="billing-cycle"
            value={config.cycle}
            onChange={(e) => onConfigChange({ cycle: e.target.value as BillingCycle })}
            className={CONTROL}
          >
            {BILLING_CYCLES.map((cycle) => (
              <option key={cycle} value={cycle}>
                {BILLING_CYCLE_SELECT_LABELS[cycle]}
              </option>
            ))}
          </select>
        </div>

        {isWeekBased && (
          <div>
            <label htmlFor="week-runs" className={FIELD_LABEL}>
              <CalendarRange size={13} /> Week runs
            </label>
            <select
              id="week-runs"
              value={config.weekAnchor}
              onChange={(e) => onConfigChange({ weekAnchor: Number(e.target.value) })}
              className={CONTROL}
            >
              {WEEK_ANCHOR_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {config.cycle === "biweekly" && (
          <div>
            <label htmlFor="biweekly-ref" className={FIELD_LABEL}>
              <Anchor size={13} /> Biweekly reference
            </label>
            <input
              id="biweekly-ref"
              type="text"
              inputMode="numeric"
              placeholder="MM/DD/YYYY"
              value={config.biweeklyReference}
              onChange={(e) => onConfigChange({ biweeklyReference: e.target.value })}
              className={CONTROL}
            />
          </div>
        )}

        <div>
          <label htmlFor="net-terms" className={FIELD_LABEL}>
            <Hourglass size={13} /> Net terms (days)
          </label>
          <input
            id="net-terms"
            type="number"
            min={0}
            max={365}
            value={config.netTermsDays}
            onChange={(e) => onConfigChange({ netTermsDays: Math.max(0, Number(e.target.value) || 0) })}
            className={CONTROL}
          />
        </div>
      </div>

      {/* Hint box for week-based cycles */}
      {isWeekBased && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-900">
          <Lightbulb size={16} className="mt-0.5 shrink-0 text-sky-500" />
          <p>
            Each {config.cycle === "weekly" ? "weekly period" : "two-week period"} runs{" "}
            <span className="font-semibold">
              {weekRunsLabel(config.weekAnchor).replace(" → ", " → ")}
            </span>{" "}
            and is billed in the month it ends.
          </p>
        </div>
      )}

      {/* Preview */}
      <div className="mt-5 overflow-hidden rounded-xl border border-emerald-200 bg-emerald-50/60">
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 pt-4">
          <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-800">
            <Search size={13} /> Preview — periods generated
          </span>
          <select
            aria-label="Preview month"
            value={`${selectedYear}-${selectedMonthIndex}`}
            onChange={(e) => {
              const [y, m] = e.target.value.split("-").map(Number);
              onMonthChange(y, m);
            }}
            className="rounded-md border border-emerald-300 bg-white px-3 py-1.5 text-sm font-medium text-[#1a1a1a] focus:border-timesheetRust focus:outline-none"
          >
            {monthOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mx-4 mt-3 flex flex-wrap items-center gap-2 rounded-lg bg-white/70 px-3 py-2 text-sm">
          <span className="font-semibold text-[#1a1a1a]">
            {MONTH_ABBR[selectedMonthIndex]} {selectedYear}
          </span>
          <Chip icon={<Hash size={12} />} className="bg-white text-gray-600 border-gray-200">
            {periods.length} period{periods.length === 1 ? "" : "s"}
          </Chip>
          <Chip icon={<CalendarDays size={12} />} className={CYCLE_CHIP[effectiveCycle]}>
            {BILLING_CYCLE_LABELS[effectiveCycle]}
          </Chip>
        </div>

        <ul className="m-4 mt-3 space-y-2">
          {periods.map((p, i) => (
            <li
              key={i}
              className="flex flex-wrap items-center gap-3 rounded-lg border border-emerald-100 bg-white px-3 py-2.5 text-sm"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                {i + 1}
              </span>
              <span className="font-medium tabular-nums text-[#1a1a1a]">
                {formatMMDDYYYY(p.start)} – {formatMMDDYYYY(p.end)}
              </span>
              <span className="ml-auto text-xs text-gray-500">{p.days} days</span>
              <Chip icon={<CalendarDays size={12} />} className={CYCLE_CHIP[effectiveCycle]}>
                {BILLING_CYCLE_LABELS[effectiveCycle]}
              </Chip>
            </li>
          ))}
        </ul>
      </div>

      {/* Holidays */}
      <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-amber-800">
          US public &amp; federal holidays this month
        </span>
        {holidays.length === 0 ? (
          <p className="mt-2 text-sm text-gray-600">No federal holidays this month.</p>
        ) : (
          <ul className="mt-2 space-y-1 text-sm text-[#1a1a1a]">
            {holidays.map((h) => (
              <li key={h.name} className="flex flex-wrap items-center gap-x-2">
                <span className="font-medium">{formatMMDDYYYY(h.date)}</span>
                <span>{h.name}</span>
                <span className="text-gray-500">· {h.dayOfWeekLabel}</span>
                {h.observedDate && (
                  <span className="text-gray-500">
                    · observed {h.dayOfWeekLabel === "Sat" ? "Fri" : "Mon"} {formatMMDDYYYY(h.observedDate)}
                  </span>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Per-month overrides */}
      <div className="mt-6">
        <div className="flex items-center gap-2 text-timesheetRust">
          <SlidersHorizontal size={15} />
          <h3 className="text-xs font-bold uppercase tracking-widest">Per-month overrides</h3>
          <span className="flex items-center gap-1 text-xs font-normal normal-case text-gray-500">
            <Info size={12} /> leave on &ldquo;Default&rdquo; unless a month differs
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
          {MONTH_ABBR.map((abbr, i) => {
            const value = overrides[i];
            const active = value !== "default";
            return (
              <div
                key={abbr}
                className={`rounded-lg border p-2.5 ${active ? "border-timesheetRust/40 bg-timesheetCream" : "border-gray-200 bg-white"}`}
              >
                <div className="mb-1 flex items-center gap-1 text-xs font-semibold text-gray-500">
                  <CalendarDays size={12} className={active ? "text-timesheetRust" : "text-gray-400"} />
                  {abbr}
                </div>
                <select
                  aria-label={`${MONTH_NAMES[i]} override`}
                  value={value}
                  onChange={(e) => onOverrideChange(i, e.target.value as MonthOverride)}
                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm focus:border-timesheetRust focus:outline-none"
                >
                  <option value="default">Default</option>
                  {BILLING_CYCLES.map((cycle) => (
                    <option key={cycle} value={cycle}>
                      {BILLING_CYCLE_LABELS[cycle]}
                    </option>
                  ))}
                </select>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
