import { createWorker, PSM } from "tesseract.js";
import { preprocessForOcr } from "./preprocessImage";

/** A recognised word with its pixel bounding box — used to reconstruct 2D
 * layouts (e.g. calendar grids) that flat OCR text would scramble. */
export type OcrWord = {
  text: string;
  x0: number;
  y0: number;
  x1: number;
  y1: number;
  cx: number;
  cy: number;
  confidence: number;
};

export type OcrResult = { text: string; words: OcrWord[] };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function collectWords(data: any): OcrWord[] {
  const words: OcrWord[] = [];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const push = (w: any) => {
    const b = w?.bbox ?? w;
    if (!b || typeof b.x0 !== "number") return;
    words.push({
      text: typeof w.text === "string" ? w.text : "",
      x0: b.x0,
      y0: b.y0,
      x1: b.x1,
      y1: b.y1,
      cx: (b.x0 + b.x1) / 2,
      cy: (b.y0 + b.y1) / 2,
      confidence: typeof w.confidence === "number" ? w.confidence : 0,
    });
  };

  if (Array.isArray(data?.words)) {
    data.words.forEach(push);
    return words;
  }
  // Tesseract.js v5 nests words under blocks → paragraphs → lines.
  for (const block of data?.blocks ?? []) {
    for (const para of block?.paragraphs ?? []) {
      for (const line of para?.lines ?? []) {
        for (const w of line?.words ?? []) push(w);
      }
    }
  }
  return words;
}

/** Client-side OCR (Tesseract) — traditional pattern-based text recognition,
 * not an LLM. Accuracy on handwritten/photographed timesheets is imperfect;
 * Step 3 lets the user fix any misread rows by hand. Returns both the flat text
 * and positioned words so callers can reconstruct tables/grids. */
export async function recognizeImage(file: File): Promise<OcrResult> {
  // Clean up the image first (upscale/grayscale/contrast) — the single biggest
  // free accuracy win for traditional OCR.
  const prepared = await preprocessForOcr(file);

  const worker = await createWorker("eng");
  try {
    // "Assume a uniform block of text", which suits the row/grid layout of most
    // timesheets better than the default fully-automatic segmentation.
    await worker.setParameters({ tessedit_pageseg_mode: PSM.SINGLE_BLOCK });
    // Request block/word geometry (off by default in v5) so we get bounding boxes.
    const { data } = await worker.recognize(prepared, {}, { text: true, blocks: true });
    return { text: data.text ?? "", words: collectWords(data) };
  } finally {
    await worker.terminate();
  }
}

/** Back-compat text-only helper. */
export async function parseImageFile(file: File): Promise<string> {
  return (await recognizeImage(file)).text;
}
