import * as pdfjsLib from "pdfjs-dist";
import type { PDFReadResult } from "@/types/pdf";

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.mjs",
  import.meta.url
).toString();

export async function readPDF(file: File): Promise<PDFReadResult> {
  const arrayBuffer = await file.arrayBuffer();

  const loadingTask = pdfjsLib.getDocument({
    data: arrayBuffer,
  });

  const pdf = await loadingTask.promise;

  let rawText = "";

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
    const page = await pdf.getPage(pageNumber);

    const textContent = await page.getTextContent();

    const pageText = textContent.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");

    rawText += `\n\n========== PAGE ${pageNumber} ==========\n\n`;
    rawText += pageText;
  }

  return {
    pageCount: pdf.numPages,
    rawText,
  };
}