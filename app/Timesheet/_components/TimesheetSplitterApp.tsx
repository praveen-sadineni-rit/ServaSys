"use client";

import { useEffect, useState } from "react";
import AppHeader from "./AppHeader";
import DefaultScheduleCard, { type MonthOverride } from "./DefaultScheduleCard";
import UploadTimesheetsCard from "./UploadTimesheetsCard";
import ReviewDaysCard from "./ReviewDaysCard";
import WeeklyTotalsCard from "./WeeklyTotalsCard";
import { parseTimesheetFile } from "../_lib/parseTimesheetFile";
import { splitIntoWeeks, type DayRow, type WeekSplitResult } from "../_lib/weekSplitter";
import { DEFAULT_BILLING_CONFIG, type BillingConfig } from "../_lib/billingPeriods";
import { getAllDaysOfMonth, isWeekend, MONTH_NAMES } from "../_lib/dateUtils";
import { isFederalHolidayOrObserved } from "../_lib/holidays";

let nextRowId = 0;
function makeRowId(): string {
  nextRowId += 1;
  return `row-${nextRowId}`;
}

const STORAGE_KEY = "timesheet-splitter-schedule-v1";
const DEFAULT_OVERRIDES: MonthOverride[] = Array(12).fill("default");

type PersistedSchedule = { config: BillingConfig; overrides: MonthOverride[] };

export default function TimesheetSplitterApp({ userEmail, demoMode }: { userEmail: string; demoMode: boolean }) {
  const today = new Date();
  const [config, setConfig] = useState<BillingConfig>(DEFAULT_BILLING_CONFIG);
  const [overrides, setOverrides] = useState<MonthOverride[]>(DEFAULT_OVERRIDES);
  const [selectedYear, setSelectedYear] = useState(today.getFullYear());
  const [selectedMonthIndex, setSelectedMonthIndex] = useState(today.getMonth());

  // Load saved schedule preferences (client-only; nothing is stored server-side).
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<PersistedSchedule>;
      if (parsed.config) setConfig({ ...DEFAULT_BILLING_CONFIG, ...parsed.config });
      if (Array.isArray(parsed.overrides) && parsed.overrides.length === 12) {
        setOverrides(parsed.overrides);
      }
    } catch {
      // Ignore malformed/blocked storage — fall back to defaults.
    }
  }, []);

  // Persist whenever the schedule changes.
  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ config, overrides }));
    } catch {
      // Storage may be unavailable (private mode) — non-fatal.
    }
  }, [config, overrides]);

  function handleConfigChange(patch: Partial<BillingConfig>) {
    setConfig((prev) => ({ ...prev, ...patch }));
  }

  function handleOverrideChange(monthIndex: number, value: MonthOverride) {
    setOverrides((prev) => prev.map((o, i) => (i === monthIndex ? value : o)));
  }

  const [files, setFiles] = useState<File[]>([]);
  const [reading, setReading] = useState(false);
  const [readSummary, setReadSummary] = useState<{ dayCount: number; fileCount: number } | null>(null);
  const [parseErrors, setParseErrors] = useState<string[]>([]);

  const [dayRows, setDayRows] = useState<DayRow[]>([]);
  const [weekSplitResult, setWeekSplitResult] = useState<WeekSplitResult | null>(null);

  function handleMonthChange(year: number, monthIndex: number) {
    setSelectedYear(year);
    setSelectedMonthIndex(monthIndex);
  }

  function handleFilesAdd(newFiles: File[]) {
    setFiles((prev) => [...prev, ...newFiles]);
    setReadSummary(null);
  }

  function handleFileRemove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleRead() {
    setReading(true);
    setParseErrors([]);
    const errors: string[] = [];
    const collected: DayRow[] = [];

    for (const file of files) {
      try {
        const extracted = await parseTimesheetFile(file, { year: selectedYear, month: selectedMonthIndex });
        if (extracted.length === 0) {
          errors.push(
            `${file.name}: no day/hours rows could be read automatically. Add them below, or use “Prefill ${MONTH_NAMES[selectedMonthIndex]}” and adjust.`
          );
        }
        for (const row of extracted) {
          collected.push({ id: makeRowId(), date: row.date, hours: row.hours, source: row.source });
        }
      } catch (err) {
        errors.push(`${file.name}: ${err instanceof Error ? err.message : "couldn't be read"}`);
      }
    }

    setDayRows((prev) => [...prev, ...collected]);
    setReadSummary({ dayCount: collected.length, fileCount: files.length });
    setParseErrors(errors);
    setWeekSplitResult(null);
    setReading(false);
  }

  function handleAddRow() {
    setDayRows((prev) => [...prev, { id: makeRowId(), date: new Date(selectedYear, selectedMonthIndex, 1), hours: 8, source: "Manual entry" }]);
  }

  function handlePrefillWeekdays() {
    const allDays = getAllDaysOfMonth(selectedYear, selectedMonthIndex);
    setDayRows((prev) => {
      const existing = new Set(prev.map((r) => r.date.getTime()));
      const additions = allDays
        .filter((d) => !existing.has(d.getTime()))
        .map((d) => {
          // Weekends and federal holidays are added but left at 0h to fill in.
          const off = isWeekend(d) || isFederalHolidayOrObserved(d);
          return { id: makeRowId(), date: d, hours: off ? 0 : 8, source: "Prefilled" };
        });
      return [...prev, ...additions];
    });
    setWeekSplitResult(null);
  }

  function handleUpdateDate(id: string, date: Date) {
    setDayRows((prev) => prev.map((r) => (r.id === id ? { ...r, date } : r)));
  }

  function handleUpdateHours(id: string, hours: number) {
    setDayRows((prev) => prev.map((r) => (r.id === id ? { ...r, hours: Number.isFinite(hours) ? hours : 0 } : r)));
  }

  function handleRemoveRow(id: string) {
    setDayRows((prev) => prev.filter((r) => r.id !== id));
  }

  function handleTotal() {
    setWeekSplitResult(splitIntoWeeks(dayRows, selectedYear, selectedMonthIndex, config.weekAnchor));
  }

  return (
    <div>
      <AppHeader userEmail={userEmail} demoMode={demoMode} />

      <DefaultScheduleCard
        config={config}
        onConfigChange={handleConfigChange}
        overrides={overrides}
        onOverrideChange={handleOverrideChange}
        selectedYear={selectedYear}
        selectedMonthIndex={selectedMonthIndex}
        onMonthChange={handleMonthChange}
      />

      <UploadTimesheetsCard
        files={files}
        onFilesAdd={handleFilesAdd}
        onFileRemove={handleFileRemove}
        onRead={handleRead}
        reading={reading}
        readSummary={readSummary}
      />

      {parseErrors.length > 0 && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Some files couldn&apos;t be read automatically — add their days manually below:</p>
          <ul className="mt-1 list-inside list-disc">
            {parseErrors.map((e) => (
              <li key={e}>{e}</li>
            ))}
          </ul>
        </div>
      )}

      <ReviewDaysCard
        rows={dayRows}
        onUpdateDate={handleUpdateDate}
        onUpdateHours={handleUpdateHours}
        onRemoveRow={handleRemoveRow}
        onAddRow={handleAddRow}
        onPrefillWeekdays={handlePrefillWeekdays}
        onTotal={handleTotal}
        selectedYear={selectedYear}
        selectedMonthIndex={selectedMonthIndex}
        monthLabel={MONTH_NAMES[selectedMonthIndex]}
      />

      {weekSplitResult && <WeeklyTotalsCard result={weekSplitResult} weekAnchor={config.weekAnchor} />}

      <p className="mt-6 text-center text-xs text-gray-500">
        Reads the document in your browser, then does the week math locally. Always check Step 3 against the original
        before trusting the totals.
      </p>
    </div>
  );
}
