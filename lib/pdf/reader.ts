import * as pdfjsLib from "pdfjs-dist";
import type { PDFReadResult } from "@/types/pdf";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

export async function readPDF(file: File): Promise<PDFReadResult> {
  const buffer = await file.arrayBuffer();

  const pdf = await pdfjsLib.getDocument({
    data: buffer,
  }).promise;

  let rawText = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {

    const page = await pdf.getPage(pageNumber);

    const textContent = await page.getTextContent();

    // Group text items by Y coordinate, but ALSO keep each item's
    // X coordinate and width, so we can sort within a row and
    // detect real column gaps instead of always joining with a
    // single space.
    type Item = { x: number; width: number; str: string };

    const rows = new Map<number, Item[]>();

    // Tolerance band for grouping rows: items whose Y differs by a
    // small amount (sub-pixel rendering jitter) still belong to the
    // same visual row. Adjust if rows are still splitting/merging
    // incorrectly for your specific PDFs.
    const Y_TOLERANCE = 2;

    const rowKeys: number[] = [];

    const findRowKey = (y: number): number => {
      for (const key of rowKeys) {
        if (Math.abs(key - y) <= Y_TOLERANCE) return key;
      }
      rowKeys.push(y);
      return y;
    };

    textContent.items.forEach((item) => {

      if (!("str" in item)) return;
      if (!item.str.trim()) return;

      const y = item.transform[5];
      const x = item.transform[4];

      // width isn't always present on TextItem in older pdfjs
      // typings; fall back to a rough estimate from font size if
      // missing, so gap detection still has something to compare.
      const width =
        "width" in item && typeof (item as any).width === "number"
          ? (item as any).width
          : item.str.length * Math.abs(item.transform[0] || 5);

      const key = findRowKey(y);

      if (!rows.has(key)) {
        rows.set(key, []);
      }

      rows.get(key)!.push({ x, width, str: item.str });

    });

    // PDF origin is bottom-left, so sort rows descending (top of
    // page first).
    const orderedRows = [...rows.entries()].sort(
      (a, b) => b[0] - a[0]
    );

    // Gap threshold: if the space between the end of one item and
    // the start of the next exceeds this many PDF units, treat it
    // as a column boundary and insert a stronger separator instead
    // of a single space. Tune this against your actual bill layout
    // if columns still bleed together or split too aggressively.
    const COLUMN_GAP_THRESHOLD = 8;

    let pageText = "";

    orderedRows.forEach(([, items]) => {

      // Sort left-to-right by X position -- item order from
      // pdf.js reflects content-stream order, NOT guaranteed
      // visual order.
      const sorted = [...items].sort((a, b) => a.x - b.x);

      let line = "";
      let prevEnd: number | null = null;

      sorted.forEach((item) => {

        if (prevEnd !== null) {
          const gap = item.x - prevEnd;

          if (gap > COLUMN_GAP_THRESHOLD) {
            // Real column boundary: use a distinct separator so
            // downstream parsers can tell "different column" apart
            // from "same column, just a space between words".
            line += " \t ";
          } else {
            line += " ";
          }
        }

        line += item.str;
        prevEnd = item.x + item.width;

      });

      pageText += line + "\n";

    });

    rawText += `\n\n========== PAGE ${pageNumber} ==========\n\n`;
    rawText += pageText;
    console.log(pageText);
  }

  return {
    pageCount: pdf.numPages,
    rawText,
  };
}