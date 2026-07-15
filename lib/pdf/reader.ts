import * as pdfjsLib from "pdfjs-dist";
import type { PDFReadResult } from "@/types/pdf";

// Configure PDF.js worker
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

    const pageText = textContent.items
      .map((item) => {
        if ("str" in item) {
          return item.str;
        }
        return "";
      })
      .join(" ");

    rawText += `\n\n========== PAGE ${pageNumber} ==========\n\n`;
    rawText += pageText;
  }

  return {
    pageCount: pdf.numPages,
    rawText,
  };
}