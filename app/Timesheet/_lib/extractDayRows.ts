// Deterministic (non-AI) heuristics for pulling {date, hours} rows out of raw
// text (PDF/OCR output), a table of cells (CSV/XLSX), or positioned OCR words
// (calendar-grid screenshots). Imperfect by nature — Step 3 of the tool lets the
// user review and fix every row by hand.

import type { OcrWord } from "./parseImage";

export type ExtractedDayRow = {
  date: Date;
  hours: number;
  source: string;
};

export type DateContext = { year: number; month: number };

const WEEKDAY_NAMES = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
const WEEKDAY_ABBR = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];

const ISO_DATE_RE = /\b(\d{4})-(\d{1,2})-(\d{1,2})\b/;
const FULL_DATE_RE = /\b(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})\b/;
const WEEKDAY_DAY_RE = new RegExp(
  `\\b(${WEEKDAY_NAMES.join("|")}|${WEEKDAY_ABBR.join("|")})\\.?\\s+(\\d{1,2})\\b`,
  "i"
);
const HOURS_RE = /(?<![\d.])(\d{1,2}(?:\.\d{1,2})?)\s*(?:hrs?|hours?|h)?(?![\d.])/i;

function normalizeYear(y: number): number {
  return y < 100 ? y + 2000 : y;
}

function parseFullDate(match: RegExpMatchArray): Date | null {
  const a = Number(match[1]);
  const b = Number(match[2]);
  const c = normalizeYear(Number(match[3]));
  // Assumes US M/D/YYYY convention, matching the reference tool's date format.
  if (a >= 1 && a <= 12 && b >= 1 && b <= 31) return new Date(c, a - 1, b);
  return null;
}

function parseIsoDate(match: RegExpMatchArray): Date | null {
  const y = Number(match[1]);
  const m = Number(match[2]);
  const d = Number(match[3]);
  if (m >= 1 && m <= 12 && d >= 1 && d <= 31) return new Date(y, m - 1, d);
  return null;
}

/** A bare weekday + day-of-month (e.g. "Mon 4") is resolved against the month
 * currently selected in Step 1, since the source data has no year/month of its own. */
function resolveWeekdayDay(dayOfMonth: number, context: DateContext): Date {
  return new Date(context.year, context.month, dayOfMonth);
}

function matchDateInString(value: string, context: DateContext): { date: Date; matchedText: string } | null {
  const isoMatch = value.match(ISO_DATE_RE);
  if (isoMatch) {
    const date = parseIsoDate(isoMatch);
    if (date) return { date, matchedText: isoMatch[0] };
  }
  const fullMatch = value.match(FULL_DATE_RE);
  if (fullMatch) {
    const date = parseFullDate(fullMatch);
    if (date) return { date, matchedText: fullMatch[0] };
  }
  const weekdayMatch = value.match(WEEKDAY_DAY_RE);
  if (weekdayMatch) {
    return { date: resolveWeekdayDay(Number(weekdayMatch[2]), context), matchedText: weekdayMatch[0] };
  }
  return null;
}

function extractHoursNear(line: string, matchedDateText: string): number | null {
  const withoutDate = matchedDateText ? line.replace(matchedDateText, " ") : line;
  const match = withoutDate.match(HOURS_RE);
  if (!match) return null;
  const value = Number(match[1]);
  if (Number.isNaN(value) || value <= 0 || value > 24) return null;
  return value;
}

export function extractDayRowsFromText(text: string, source: string, context: DateContext): ExtractedDayRow[] {
  const rows: ExtractedDayRow[] = [];

  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const dateMatch = matchDateInString(line, context);
    if (!dateMatch) continue;
    const hours = extractHoursNear(line, dateMatch.matchedText);
    if (hours === null) continue;
    rows.push({ date: dateMatch.date, hours, source });
  }

  return rows;
}

type NumToken = OcrWord & { value: number; isInt: boolean };

function numericTokens(words: OcrWord[]): NumToken[] {
  const out: NumToken[] = [];
  for (const w of words) {
    // OCR often reads "8" as "8", "0" fine, but strips stray punctuation.
    const clean = w.text.replace(/[^0-9.]/g, "");
    if (!/^\d{1,2}(\.\d{1,2})?$/.test(clean)) continue;
    const value = Number(clean);
    if (Number.isNaN(value)) continue;
    out.push({ ...w, value, isInt: !clean.includes(".") });
  }
  return out;
}

/** Reconstructs day→hours pairs from a calendar-grid screenshot using OCR word
 * positions: each day-of-month number is paired with the hours value sitting
 * directly beneath it in the same cell. Handles layouts like the Ultimatix/TCS
 * monthly timesheet where flat OCR text loses the day↔hours association. */
export function extractDayRowsFromWords(
  words: OcrWord[],
  source: string,
  context: DateContext
): ExtractedDayRow[] {
  const nums = numericTokens(words);
  if (nums.length < 2) return [];

  // Median glyph height → a scale for "same cell" vertical/horizontal tolerance.
  const heights = nums.map((n) => n.y1 - n.y0).sort((a, b) => a - b);
  const cellH = heights[Math.floor(heights.length / 2)] || 12;

  const dayTokens = nums.filter((n) => n.isInt && n.value >= 1 && n.value <= 31);
  const hourTokens = nums.filter((n) => n.value >= 0 && n.value <= 24);

  const usedHour = new Set<NumToken>();
  const pairs: { day: number; hours: number }[] = [];

  // Process days top-to-bottom, left-to-right so nearer cells claim their hours first.
  for (const day of [...dayTokens].sort((a, b) => a.cy - b.cy || a.cx - b.cx)) {
    let best: NumToken | null = null;
    let bestDist = Infinity;
    for (const h of hourTokens) {
      if (h === day || usedHour.has(h)) continue;
      const dx = Math.abs(h.cx - day.cx);
      const dy = h.cy - day.cy;
      if (dy <= 0) continue; // hours sit below the day number
      if (dx > cellH * 2.2) continue; // roughly same column
      if (dy > cellH * 3) continue; // within one cell's height
      const dist = dy + dx * 0.5;
      if (dist < bestDist) {
        bestDist = dist;
        best = h;
      }
    }
    if (!best) continue;
    usedHour.add(best);
    pairs.push({ day: day.value, hours: best.value });
  }

  // One row per calendar day (keep the first pairing for a given day-of-month).
  const seenDay = new Set<number>();
  const rows: ExtractedDayRow[] = [];
  for (const p of pairs) {
    if (seenDay.has(p.day)) continue;
    seenDay.add(p.day);
    rows.push({ date: new Date(context.year, context.month, p.day), hours: p.hours, source });
  }
  rows.sort((a, b) => a.date.getTime() - b.date.getTime());
  return rows;
}

type Cell = string | number | null | undefined;

function parseCellAsDate(cell: Cell, context: DateContext): Date | null {
  if (cell === null || cell === undefined) return null;
  if (typeof cell === "number") {
    // Excel serial date (days since 1899-12-30).
    const excelEpoch = new Date(1899, 11, 30);
    const d = new Date(excelEpoch);
    d.setDate(d.getDate() + cell);
    return d;
  }
  return matchDateInString(cell, context)?.date ?? null;
}

function parseCellAsHours(cell: Cell): number | null {
  if (cell === null || cell === undefined || cell === "") return null;
  const value = typeof cell === "number" ? cell : Number(String(cell).replace(/[^\d.]/g, ""));
  if (Number.isNaN(value) || value <= 0 || value > 24) return null;
  return value;
}

/** Table-shaped input (CSV/XLSX rows). Tries to find Date/Hours header columns
 * first; falls back to scanning each row as a line of text. */
export function extractDayRowsFromTable(rows: Cell[][], source: string, context: DateContext): ExtractedDayRow[] {
  if (rows.length === 0) return [];

  const headerRowIndex = rows.findIndex(
    (row) =>
      row.some((cell) => typeof cell === "string" && /date/i.test(cell)) &&
      row.some((cell) => typeof cell === "string" && /hours?/i.test(cell))
  );

  if (headerRowIndex !== -1) {
    const header = rows[headerRowIndex].map((c) => (typeof c === "string" ? c.toLowerCase() : ""));
    const dateCol = header.findIndex((h) => h.includes("date"));
    const hoursCol = header.findIndex((h) => h.includes("hour"));

    if (dateCol !== -1 && hoursCol !== -1) {
      const extracted: ExtractedDayRow[] = [];
      for (const row of rows.slice(headerRowIndex + 1)) {
        const date = parseCellAsDate(row[dateCol], context);
        const hours = parseCellAsHours(row[hoursCol]);
        if (date && hours !== null) extracted.push({ date, hours, source });
      }
      if (extracted.length > 0) return extracted;
    }
  }

  const joinedText = rows
    .map((row) => row.filter((c) => c !== null && c !== undefined && c !== "").join(" "))
    .join("\n");
  return extractDayRowsFromText(joinedText, source, context);
}
