import { parseCsvFile } from "./parseCsv";
import { parseXlsxFile } from "./parseXlsx";
import { parsePdfFile } from "./parsePdf";
import { recognizeImage } from "./parseImage";
import {
  extractDayRowsFromTable,
  extractDayRowsFromText,
  extractDayRowsFromWords,
  type DateContext,
  type ExtractedDayRow,
} from "./extractDayRows";

function extensionOf(fileName: string): string {
  const parts = fileName.split(".");
  return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

export async function parseTimesheetFile(file: File, context: DateContext): Promise<ExtractedDayRow[]> {
  const ext = extensionOf(file.name);

  switch (ext) {
    case "csv": {
      const rows = await parseCsvFile(file);
      return extractDayRowsFromTable(rows, file.name, context);
    }
    case "xlsx":
    case "xls": {
      const rows = await parseXlsxFile(file);
      return extractDayRowsFromTable(rows, file.name, context);
    }
    case "pdf": {
      const text = await parsePdfFile(file);
      return extractDayRowsFromText(text, file.name, context);
    }
    case "jpg":
    case "jpeg":
    case "png": {
      const { text, words } = await recognizeImage(file);
      // Grid reconstruction (day-number paired with hours below) handles calendar
      // screenshots; fall back to line-based text parsing for list-style images.
      const gridRows = extractDayRowsFromWords(words, file.name, context);
      if (gridRows.length > 0) return gridRows;
      return extractDayRowsFromText(text, file.name, context);
    }
    default:
      throw new Error(`Unsupported file type: .${ext || "unknown"}`);
  }
}
