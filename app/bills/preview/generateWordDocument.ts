import type { ExaminationBillData } from "../create/components/types";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";

const LEGAL_WIDTH_PX = 816;
const LEGAL_HEIGHT_PX = 1344;
const PDF_TO_CSS_PIXEL_SCALE = 96 / 72;

function canvasToPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Unable to render a Word page image."));
    }, "image/png");
  });
}

/**
 * Builds the Word download from the same React-PDF document used by the
 * preview and PDF download. Embedding each rendered page prevents Word's
 * table and pagination engine from changing the layout.
 */
export async function generateWordDocument(bill: ExaminationBillData): Promise<Blob> {
  const [{ createElement }, { pdf }, pdfjs, { default: BillPdfDocument }, docx] = await Promise.all([
    import("react"),
    import("@react-pdf/renderer"),
    import("pdfjs-dist"),
    import("../create/components/pdf/BillPdfDocument"),
    import("docx"),
  ]);

  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url,
  ).toString();

  const pdfDocument = createElement(BillPdfDocument, { bill }) as unknown as ReactElement<DocumentProps>;
  const pdfBlob = await pdf(pdfDocument).toBlob();
  const loadedPdf = await pdfjs.getDocument(await pdfBlob.arrayBuffer()).promise;
  const pageImages: Uint8Array[] = [];

  for (let pageNumber = 1; pageNumber <= loadedPdf.numPages; pageNumber += 1) {
    const page = await loadedPdf.getPage(pageNumber);
    const viewport = page.getViewport({ scale: PDF_TO_CSS_PIXEL_SCALE });
    const canvas = window.document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas rendering is unavailable in this browser.");

    canvas.width = Math.round(viewport.width);
    canvas.height = Math.round(viewport.height);
    await page.render({ canvasContext: context, viewport }).promise;
    pageImages.push(new Uint8Array(await (await canvasToPng(canvas)).arrayBuffer()));
    page.cleanup();
  }

  await loadedPdf.destroy();

  const document = new docx.Document({
    sections: [{
      properties: {
        page: {
          size: { width: 12240, height: 20160 },
          margin: { top: 0, right: 0, bottom: 0, left: 0, header: 0, footer: 0, gutter: 0 },
        },
      },
      children: pageImages.map((data, index) => new docx.Paragraph({
        pageBreakBefore: index > 0,
        spacing: { before: 0, after: 0, line: 1 },
        children: [new docx.ImageRun({
          type: "png",
          data,
          transformation: { width: LEGAL_WIDTH_PX, height: LEGAL_HEIGHT_PX },
        })],
      })),
    }],
  });

  return docx.Packer.toBlob(document);
}
