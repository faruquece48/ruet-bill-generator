"use client";
import { useEffect, useRef, useState } from "react";
import type { ExaminationBillData } from "../create/components/types";
import { defaultLayoutSettings } from "../create/components/types";
import { emptyBill } from "../create/components/emptyBill";
import { saveCurrentWork, loadCurrentWork } from "@/lib/storage/draft";
import { pdf } from "@react-pdf/renderer";
import BillPdfDocument from "../create/components/pdf/BillPdfDocument";
import SectionPanel from "./components/SectionPanel";
import ColumnWidthEditor from "./components/ColumnWidthEditor";
import PreviewDocument from "./components/PreviewDocument";

const committeeLabels = {
  sl: "Sl.",
  name: "Teacher Name",
  designation: "Designation",
  department: "Department",
  role: "Role",
};

const courseDutyLabels = {
  courseCode: "Code",
  courseTitle: "Title",
  part: "Part",
  name: "Teacher",
  designation: "Designation",
  department: "Dept.",
  paperSetter: "Paper Setter",
  examiner: "Examiner",
  classTest: "Class Test",
  assignment: "Assignment",
  courseFile: "Course File",
};

const sessionalLabels = {
  courseCode: "Code",
  courseTitle: "Title",
  name: "Teacher",
  designation: "Designation",
  department: "Dept.",
  sessional: "Sessional",
  sessionalStudents: "Students",
  courseFile: "Course File",
};

const questionWorkLabels = {
  sl: "Sl.",
  name: "Teacher Name",
  designation: "Designation",
  department: "Department",
  questionNumber: "No. of Questions",
};

const scrutinyLabels = {
  name: "Teacher Name",
  designation: "Designation",
  department: "Department",
  scriptCount: "No. of Scripts",
};

const studentDutyLabels = {
  sl: "Sl.",
  name: "Teacher Name",
  designation: "Designation",
  department: "Department",
  students: "No. of Students",
};

const thesisLabels = {
  sl: "Sl.",
  name: "Teacher Name",
  designation: "Designation",
  department: "Department",
  supervisorCount: "Supervisor",
  examinerCount: "Examiner",
  attendsViva: "Viva",
};

const verificationLabels = {
  sl: "Sl.",
  name: "Teacher Name",
  designation: "Designation",
  department: "Department",
};

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
            <SectionPanel title="2. Examination Committee">
              <ColumnWidthEditor
                widths={billData.layoutSettings.committee}
                setWidths={(v) => updateLayout("committee", v)}
                labels={committeeLabels}
              />
            </SectionPanel>

            <SectionPanel title="3. Paper Setter & Examiner — OBE">
              <ColumnWidthEditor
                widths={billData.layoutSettings.courseDutyObe}
                setWidths={(v) => updateLayout("courseDutyObe", v)}
                labels={courseDutyLabels}
              />
            </SectionPanel>

            <SectionPanel title="3. Paper Setter & Examiner — Non-OBE">
              <ColumnWidthEditor
                widths={billData.layoutSettings.courseDutyNonObe}
                setWidths={(v) => updateLayout("courseDutyNonObe", v)}
                labels={courseDutyLabels}
              />
            </SectionPanel>

            <SectionPanel title="4. Sessional Courses">
              <ColumnWidthEditor
                widths={billData.layoutSettings.sessionalDuty}
                setWidths={(v) => updateLayout("sessionalDuty", v)}
                labels={sessionalLabels}
              />
            </SectionPanel>

            <SectionPanel title="5. Question Typing / Sketching / Printing">
              <ColumnWidthEditor
                widths={billData.layoutSettings.questionWork}
                setWidths={(v) => updateLayout("questionWork", v)}
                labels={questionWorkLabels}
              />
            </SectionPanel>

            <SectionPanel title="6. Scrutiny — OBE">
              <ColumnWidthEditor
                widths={billData.layoutSettings.scrutinyObe}
                setWidths={(v) => updateLayout("scrutinyObe", v)}
                labels={scrutinyLabels}
              />
            </SectionPanel>

            <SectionPanel title="6. Scrutiny — Non-OBE">
              <ColumnWidthEditor
                widths={billData.layoutSettings.scrutinyNonObe}
                setWidths={(v) => updateLayout("scrutinyNonObe", v)}
                labels={scrutinyLabels}
              />
            </SectionPanel>

            <SectionPanel title="7. Tabulation">
              <ColumnWidthEditor
                widths={billData.layoutSettings.studentDuty}
                setWidths={(v) => updateLayout("studentDuty", v)}
                labels={studentDutyLabels}
              />
            </SectionPanel>

            <SectionPanel title="8. Course Advisers">
              <ColumnWidthEditor
                widths={billData.layoutSettings.courseAdviser}
                setWidths={(v) => updateLayout("courseAdviser", v)}
                labels={studentDutyLabels}
              />
            </SectionPanel>

            <SectionPanel title="Thesis / Project Examination">
              <ColumnWidthEditor
                widths={billData.layoutSettings.thesis}
                setWidths={(v) => updateLayout("thesis", v)}
                labels={thesisLabels}
              />
            </SectionPanel>

            <SectionPanel title="Verification of Final Result">
              <ColumnWidthEditor
                widths={billData.layoutSettings.verification}
                setWidths={(v) => updateLayout("verification", v)}
                labels={verificationLabels}
              />
            </SectionPanel>

            <SectionPanel title="Course Coordinator">
              <ColumnWidthEditor
                widths={billData.layoutSettings.courseCoordinator}
                setWidths={(v) => updateLayout("courseCoordinator", v)}
                labels={verificationLabels}
              />
            </SectionPanel>
          </div>

          {/* RIGHT: live full preview, sticky */}
          <div className="lg:sticky lg:top-20">
            <PreviewDocument bill={billData} />
          </div>
        </div>
      </div>
    </main>
  );
}