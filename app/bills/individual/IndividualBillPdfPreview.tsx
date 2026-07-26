"use client";

import { useEffect, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import type { DocumentProps } from "@react-pdf/renderer";
import type { ReactElement } from "react";
import type { PDFPageProxy } from "pdfjs-dist";

export default function IndividualBillPdfPreview({ document }: { document: ReactElement<DocumentProps> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const generation = useRef(0);
  const [page, setPage] = useState<PDFPageProxy | null>(null);

  useEffect(() => {
    const timeout = window.setTimeout(async () => {
      const id = ++generation.current;
      const blob = await pdf(document).toBlob();
      const pdfjs = await import("pdfjs-dist");
      pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
      const loaded = await pdfjs.getDocument(await blob.arrayBuffer()).promise;
      const nextPage = await loaded.getPage(1);
      if (id === generation.current) setPage(nextPage);
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [document]);

  useEffect(() => {
    if (!page || !canvasRef.current) return;
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");
    if (!context) return;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const task = page.render({ canvasContext: context, viewport });
    return () => task.cancel();
  }, [page]);

  return <div className="overflow-auto rounded-xl bg-slate-300 p-5"><div className="mx-auto max-w-[816px] bg-white shadow-xl"><canvas ref={canvasRef} className="block h-auto w-full" /></div></div>;
}
