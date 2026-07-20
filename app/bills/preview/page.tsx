"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import type {
  ExaminationBillData,
  TableLayoutSettings,
} from "../create/components/types";
import { defaultLayoutSettings } from "../create/components/types";
import { emptyBill } from "../create/components/emptyBill";
import { saveCurrentWork, loadCurrentWork } from "@/lib/storage/draft";
import { pdf } from "@react-pdf/renderer";
import BillPdfDocument from "../create/components/pdf/BillPdfDocument";
import SectionPanel from "./components/SectionPanel";
import ColumnWidthEditor from "./components/ColumnWidthEditor";

const PdfPreviewViewer = dynamic(
  () => import("./components/PdfPreviewViewer"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full items-center justify-center text-sm text-slate-600">
        Preparing paginated PDF preview…
      </div>
    ),
  }
);

const committeeLabels = {
  sl: "Sl. No.",
  name: "Name",
  designationDept: "Designation & Department",
  role: "Role",
};

const paperSetterLabels = {
  course: "Course No. & Title",
  part: "Part",
  teacherLine: "Name of Teachers & Designation",
  paperSetCount: "No. of Paper Set",
  scriptExamined: "No. of Script Examined",
};

const classTestLabels = {
  course: "Course No. & Title",
  teacherLine: "Name of Teachers & Designation",
  classTestCount: "No. of Class Test",
  students: "No. of Students",
};

const assignmentLabels = {
  course: "Course No. & Title",
  teacherLine: "Name of Teachers & Designation",
  assignmentValue: "No. of Class Assignment",
};

const courseFileLabels = {
  course: "Course No. & Title",
  teacherLine: "Name of Teachers & Designation",
  count: "No. of Course File",
};

const sessionalLabels = {
  courseLine: "Course No. & Title",
  credit: "Credit",
  teacherLine: "Name of Teachers & Designation",
  students: "No. of Students",
};

const questionWorkLabels = {
  sl: "Sl.",
  teacherLine: "Name of Teachers & Designation",
  questionNumber: "No. of Questions",
};

const scrutinyLabels = {
  sl: "Sl.",
  teacherLine: "Name of Teachers & Designation",
  scriptCount: "No. of Scripts",
};

const studentDutyLabels = {
  sl: "Sl.",
  teacherLine: "Name of Teachers & Designation",
  students: "No. of Students",
};

const thesisLabels = {
  sl: "Sl.",
  teacherLine: "Name of Teachers & Designation",
  supervisorCount: "Supervisor",
  examinerCount: "Thesis Examiner",
  thesisViva: "Thesis Viva",
};

const verificationLabels = {
  sl: "Sl.",
  teacherLine: "Name of Teachers & Designation",
  students: "No. of Students",
};

const gradeSheetLabels = {
  sl: "Sl.",
  teacherLine: "Name of Teachers & Designation",
  studentsDisplay: "No. of Students",
};

const courseCoordinatorLabels = {
  sl: "Sl.",
  teacherLine: "Name of Teachers & Designation",
};

function mergeLayoutSettings(
  saved?: Partial<TableLayoutSettings>
): TableLayoutSettings {
  return Object.fromEntries(
    Object.entries(defaultLayoutSettings).map(([key, defaults]) => {
      const savedWidths = saved?.[key as keyof TableLayoutSettings];
      const hasCurrentColumns =
        savedWidths &&
        Object.keys(defaults).every((column) =>
          Object.prototype.hasOwnProperty.call(savedWidths, column)
        );

      const currentWidths = Object.fromEntries(
        Object.keys(defaults).map((column) => [
          column,
          hasCurrentColumns ? savedWidths[column] : defaults[column],
        ])
      );

      return [key, currentWidths];
    })
  ) as unknown as TableLayoutSettings;
}

export default function PreviewPage() {
  const [billData, setBillData] = useState<ExaminationBillData>(emptyBill);
  const hydrated = useRef(false);

  useEffect(() => {
    const saved = loadCurrentWork();
    if (saved) {
      // Hydrate once from browser storage after the client mounts.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBillData({
        ...emptyBill,
        ...saved,
        layoutSettings: mergeLayoutSettings(saved.layoutSettings),
      });
    }
    hydrated.current = true;
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    saveCurrentWork(billData);
  }, [billData]);

  const updateLayout = (
    key: keyof ExaminationBillData["layoutSettings"],
    value: Record<string, number>
  ) => {
    setBillData((prev) => ({
      ...prev,
      layoutSettings: { ...prev.layoutSettings, [key]: value },
    }));
  };

  const handleGeneratePdf = async () => {
    try {
      const blob = await pdf(<BillPdfDocument bill={billData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Examination-Bill-${
        billData.billInfo.billNo || "draft"
      }.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to generate PDF: " + (err as Error).message);
    }
  };

  return (
    <main className="py-10">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Preview & Layout Customization</h2>
          <button
            type="button"
            onClick={handleGeneratePdf}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Generate PDF
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[420px_1fr] gap-6 items-start">
          {/* LEFT: customization accordion */}
          <div className="space-y-3">
            <SectionPanel title="1. Examination Committee">
              <ColumnWidthEditor
                widths={billData.layoutSettings.committee}
                setWidths={(v) => updateLayout("committee", v)}
                labels={committeeLabels}
              />
            </SectionPanel>

            <SectionPanel
              title={
                billData.billInfo.evaluationSystem === "mixed"
                  ? "2.1 OBE (New Syllabus) — Paper Setter & Examiner"
                  : "2. List of Teachers Associated with Paper Setter & Examiner"
              }
            >
              <ColumnWidthEditor
                widths={billData.layoutSettings.paperSetter}
                setWidths={(v) => updateLayout("paperSetter", v)}
                labels={paperSetterLabels}
              />
            </SectionPanel>

            {billData.billInfo.evaluationSystem === "mixed" && (
              <SectionPanel title="2.2 Non-OBE (Old Syllabus) — Paper Setter & Examiner">
                <ColumnWidthEditor
                  widths={billData.layoutSettings.paperSetterNonObe}
                  setWidths={(v) => updateLayout("paperSetterNonObe", v)}
                  labels={paperSetterLabels}
                />
              </SectionPanel>
            )}

            <SectionPanel title="3. List of Teachers Associated with Class Test">
              <ColumnWidthEditor
                widths={billData.layoutSettings.classTest}
                setWidths={(v) => updateLayout("classTest", v)}
                labels={classTestLabels}
              />
            </SectionPanel>

            <SectionPanel title="4. List of Teachers Associated with Assignment">
              <ColumnWidthEditor widths={billData.layoutSettings.assignment} setWidths={(v) => updateLayout("assignment", v)} labels={assignmentLabels} />
            </SectionPanel>

            <SectionPanel title="5. List of Teachers Associated with Course File">
              <ColumnWidthEditor widths={billData.layoutSettings.courseFile} setWidths={(v) => updateLayout("courseFile", v)} labels={courseFileLabels} />
            </SectionPanel>

            <SectionPanel title="6. List of Teachers Associated with Question Typing / Sketching / Printing">
              <ColumnWidthEditor
                widths={billData.layoutSettings.questionWork}
                setWidths={(v) => updateLayout("questionWork", v)}
                labels={questionWorkLabels}
              />
            </SectionPanel>

            <SectionPanel
              title={
                billData.billInfo.evaluationSystem === "mixed"
                  ? "7.1 OBE (New Syllabus) — Scrutiny"
                  : "7. List of Teachers Associated with Scrutiny"
              }
            >
              <ColumnWidthEditor
                widths={billData.layoutSettings.scrutinyObe}
                setWidths={(v) => updateLayout("scrutinyObe", v)}
                labels={scrutinyLabels}
              />
            </SectionPanel>

            {billData.billInfo.evaluationSystem === "mixed" && (
              <SectionPanel title="7.2 Non-OBE (Old Syllabus) — Scrutiny">
                <ColumnWidthEditor
                  widths={billData.layoutSettings.scrutinyNonObe}
                  setWidths={(v) => updateLayout("scrutinyNonObe", v)}
                  labels={scrutinyLabels}
                />
              </SectionPanel>
            )}

            <SectionPanel title="8. List of Teachers Associated with Sessional">
              <ColumnWidthEditor
                widths={billData.layoutSettings.sessionalDuty}
                setWidths={(v) => updateLayout("sessionalDuty", v)}
                labels={sessionalLabels}
              />
            </SectionPanel>

            <SectionPanel title="9. List of Teachers Associated with Board Viva">
              <ColumnWidthEditor widths={billData.layoutSettings.boardViva} setWidths={(v) => updateLayout("boardViva", v)} labels={studentDutyLabels} />
            </SectionPanel>

            <SectionPanel title="10. List of Teachers Associated with Tabulation">
              <ColumnWidthEditor
                widths={billData.layoutSettings.tabulation}
                setWidths={(v) => updateLayout("tabulation", v)}
                labels={studentDutyLabels}
              />
            </SectionPanel>

            <SectionPanel title="11. List of Teachers Associated with Grade Sheet Preparation">
              <ColumnWidthEditor widths={billData.layoutSettings.gradeSheetPreparation} setWidths={(v) => updateLayout("gradeSheetPreparation", v)} labels={gradeSheetLabels} />
            </SectionPanel>

            <SectionPanel title="12. List of Teachers Associated with Grade Sheet Verification">
              <ColumnWidthEditor widths={billData.layoutSettings.gradeSheetVerification} setWidths={(v) => updateLayout("gradeSheetVerification", v)} labels={gradeSheetLabels} />
            </SectionPanel>

            <SectionPanel title="13. List of Course Advisers">
              <ColumnWidthEditor
                widths={billData.layoutSettings.courseAdviser}
                setWidths={(v) => updateLayout("courseAdviser", v)}
                labels={studentDutyLabels}
              />
            </SectionPanel>

            <SectionPanel title="14. List of Teachers Associated with Course Coordinator">
              <ColumnWidthEditor
                widths={billData.layoutSettings.courseCoordinator}
                setWidths={(v) => updateLayout("courseCoordinator", v)}
                labels={courseCoordinatorLabels}
              />
            </SectionPanel>

            <SectionPanel title="15. List of Teachers Associated with Thesis/Project Examination">
              <ColumnWidthEditor
                widths={billData.layoutSettings.thesis}
                setWidths={(v) => updateLayout("thesis", v)}
                labels={thesisLabels}
              />
            </SectionPanel>

            <SectionPanel title="16. List of Teachers Associated with Verification of Final Result">
              <ColumnWidthEditor
                widths={billData.layoutSettings.verification}
                setWidths={(v) => updateLayout("verification", v)}
                labels={verificationLabels}
              />
            </SectionPanel>
          </div>

          {/* RIGHT: paginated preview rendered by the same PDF document */}
          <div className="lg:sticky lg:top-20">
            <div className="h-[calc(100vh-7rem)] min-h-[720px] overflow-hidden rounded-xl border bg-slate-200 shadow-sm">
              <PdfPreviewViewer
                key={JSON.stringify(billData)}
                bill={billData}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
