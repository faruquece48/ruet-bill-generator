"use client";

import { useMemo, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { ArrowDown, ArrowUp, FilePlus2, Trash2 } from "lucide-react";
import CombinedBillPdfPreview from "../combined/CombinedBillPdfPreview";
import type { ExaminationBillData } from "../create/components/types";
import SummaryPdfDocument from "./SummaryPdfDocument";
import {
  examinationSummaryTitle,
  normalizeImportedBill,
  teachersForBill,
  type ImportedSummaryBill,
} from "./summaryData";

export default function SummaryPage() {
  const [bills, setBills] = useState<ImportedSummaryBill[]>([]);
  const [message, setMessage] = useState("");
  const [downloading, setDownloading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const document = useMemo(() => <SummaryPdfDocument bills={bills} />, [bills]);

  const importFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const imported: ImportedSummaryBill[] = [];
    const rejected: string[] = [];

    await Promise.all(Array.from(files).map(async (file, index) => {
      try {
        const parsed = JSON.parse(await file.text()) as Partial<ExaminationBillData>;
        if (!parsed.billInfo || typeof parsed.billInfo !== "object") {
          throw new Error("Missing bill information");
        }
        imported[index] = {
          id: `${Date.now()}-${index}-${file.name}`,
          fileName: file.name,
          bill: normalizeImportedBill(parsed),
        };
      } catch {
        rejected.push(file.name);
      }
    }));

    const valid = imported.filter(Boolean);
    if (valid.length) setBills((current) => [...current, ...valid]);
    setMessage(
      rejected.length
        ? `${valid.length} file(s) added. Could not read: ${rejected.join(", ")}`
        : `${valid.length} bill file(s) added.`
    );
    if (inputRef.current) inputRef.current.value = "";
  };

  const removeBill = (id: string) => {
    setBills((current) => current.filter((item) => item.id !== id));
  };

  const moveBill = (index: number, direction: -1 | 1) => {
    setBills((current) => {
      const target = index + direction;
      if (target < 0 || target >= current.length) return current;
      const next = [...current];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const download = async () => {
    if (!bills.length) return;
    setDownloading(true);
    try {
      const blob = await pdf(document).toBlob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = "Examination_Bill_Summary.pdf";
      link.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return <main className="mx-auto max-w-[1600px] p-6">
    <input
      ref={inputRef}
      type="file"
      accept="application/json,.json"
      multiple
      className="hidden"
      onChange={(event) => void importFiles(event.target.files)}
    />

    <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold">Summary</h1>
        <p className="text-sm text-slate-500">
          Import exported bill files to create one teacher list per bill and a consolidated final summary.
        </p>
      </div>
      <button
        type="button"
        onClick={download}
        disabled={!bills.length || downloading}
        className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-400"
      >
        {downloading ? "Generating…" : "Download Summary PDF"}
      </button>
    </div>

    <div className="grid items-start gap-5 lg:grid-cols-[330px_minmax(0,1fr)]">
      <aside className="rounded-xl border bg-white p-4 shadow-sm lg:sticky lg:top-20">
        <div className="mb-3">
          <h2 className="font-semibold">Imported bill files</h2>
          <p className="text-xs text-slate-500">{bills.length} file(s) selected</p>
        </div>

        <div className="max-h-[calc(100vh-17rem)] space-y-2 overflow-y-auto pr-1">
          {bills.map((item, index) => <div key={item.id} className="rounded-lg border bg-slate-50 p-3">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {index + 1}. Bill No. {item.bill.billInfo.billNo || "—"}
                </p>
                <p className="mt-0.5 truncate text-xs text-slate-500">{item.fileName}</p>
                <p className="mt-1 text-xs text-slate-600">
                  {teachersForBill(item.bill).length} engaged teacher(s)
                </p>
              </div>
              <button
                type="button"
                onClick={() => removeBill(item.id)}
                className="rounded p-1.5 text-red-600 hover:bg-red-50"
                aria-label={`Remove ${item.fileName}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
            <p className="mt-2 line-clamp-2 text-[11px] leading-4 text-slate-500">
              {examinationSummaryTitle(item.bill)}
            </p>
            <div className="mt-2 flex gap-1">
              <button
                type="button"
                onClick={() => moveBill(index, -1)}
                disabled={index === 0}
                className="rounded border bg-white p-1.5 disabled:opacity-35"
                aria-label="Move bill up"
              ><ArrowUp className="h-3.5 w-3.5" /></button>
              <button
                type="button"
                onClick={() => moveBill(index, 1)}
                disabled={index === bills.length - 1}
                className="rounded border bg-white p-1.5 disabled:opacity-35"
                aria-label="Move bill down"
              ><ArrowDown className="h-3.5 w-3.5" /></button>
            </div>
          </div>)}
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-3 py-2.5 text-sm font-semibold text-white"
        >
          <FilePlus2 className="h-4 w-4" />
          Add bill files
        </button>
        {message && <p className="mt-2 text-xs text-slate-600">{message}</p>}
      </aside>

      <section className="min-w-0 rounded-xl bg-slate-300 p-5">
        {bills.length
          ? <CombinedBillPdfPreview document={document} />
          : <div className="rounded-xl bg-white p-12 text-center text-slate-500">
              Add one or more exported bill JSON files to generate the summary preview.
            </div>}
      </section>
    </div>
  </main>;
}
