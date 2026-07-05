import Papa from "papaparse";

export async function parseCsvFile(file: File): Promise<(string | null)[][]> {
  const text = await file.text();
  const result = Papa.parse<string[]>(text, { skipEmptyLines: true });
  return result.data;
}
