import * as pdfjsLib from "pdfjs-dist";

// Served as a plain static file (public/pdf.worker.min.mjs, copied from
// pdfjs-dist at the same installed version) rather than a webpack asset —
// letting webpack/Terser process this pre-built worker breaks the production
// build (it chokes on the worker's own top-level import/export syntax).
// pdfjs-dist requires the worker's version to exactly match this package's
// version, so package.json pins pdfjs-dist to an exact version (no ^) — if
// you bump it, re-copy node_modules/pdfjs-dist/build/pdf.worker.min.mjs into
// public/ at the same time. This module only ever runs from a browser
// event handler, so pdfjs-dist's Node-environment warning during Next.js's
// SSR pass of this "use client" tree is cosmetic, not functional.
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

export async function parsePdfFile(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
  const pageTexts: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const text = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pageTexts.push(text);
  }

  return pageTexts.join("\n");
}
