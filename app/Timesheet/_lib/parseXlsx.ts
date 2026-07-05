import * as XLSX from "xlsx";

export async function parseXlsxFile(file: File): Promise<(string | number | null)[][]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const firstSheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[firstSheetName];
  return XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, {
    header: 1,
    raw: true,
    defval: null,
  });
}
