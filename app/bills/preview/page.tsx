"use client";
import { useEffect, useRef, useState } from "react";
import BillPreview from "../create/components/BillPreview";
import PreviewCommitteeTable from "./components/PreviewCommitteeTable";
import type { ExaminationBillData } from "../create/components/types";
import { defaultLayoutSettings } from "../create/components/types";
import { saveCurrentWork, loadCurrentWork } from "@/lib/storage/draft";
import { pdf } from "@react-pdf/renderer";
import BillPdfDocument from "../create/components/pdf/BillPdfDocument";
import { emptyBill } from "../create/components/emptyBill";

// Sections still to be added here, in order:
const upcomingSections = [
  "3. List of Teachers Associated with Paper Setter & Examiner",
  "4. List of Teachers Associated with Sessional Courses",
  "5. List of Teachers Associated with Question Typing, Sketching, Comparing & Printing",
  "6. List of Teachers Associated with Scrutiny",
  "7. List of Teachers Associated with Tabulation",
  "8. List of Course Advisers",
  "9+. Thesis / Verification / Course Coordinator (conditional)",
];

export default function PreviewPage() {
  const [billData, setBillData] = useState<ExaminationBillData>(emptyBill);
  const hydrated = useRef(false);

  useEffect(() => {
    const saved = loadCurrentWork();
    if (saved) {
      setBillData({
        ...emptyBill,
        ...saved,
        layoutSettings: {
          ...defaultLayoutSettings,
          ...(saved.layoutSettings || {}),
        },
      });
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveCurrentWork(billData);
  }, [billData]);

  const handleGeneratePdf = async () => {
    try {
      const blob = await pdf(<BillPdfDocument bill={billData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Examination-Bill-${billData.billInfo.billNo || "draft"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to generate PDF: " + (err as Error).message);
    }
  };

  return (
    <main className="py-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Preview & Layout Customization</h2>
          <button
            type="button"
            onClick={handleGeneratePdf}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Generate PDF
          </button>
        </div>

        <BillPreview bill={billData.billInfo} />

        <PreviewCommitteeTable
          committees={billData.committees}
          widths={billData.layoutSettings.committee}
          setWidths={(data) =>
            setBillData((prev) => ({
              ...prev,
              layoutSettings: { ...prev.layoutSettings, committee: data },
            }))
          }
        />

        <div className="rounded-xl border border-dashed bg-white p-6 text-sm text-gray-500 space-y-2">
          <p className="font-medium text-gray-700">
            Remaining sections (to be added next):
          </p>
          <ul className="list-disc pl-5 space-y-1">
            {upcomingSections.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>
        </div>
      </div>
    </main>
  );
}