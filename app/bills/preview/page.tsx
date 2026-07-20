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
<<<<<<< Updated upstream
  teacherLine: "Name of Teachers & Designation",
  role: "Role",
};

const groupedLabels = {
  course: "Course No. & Title",
  part: "Part",
  teacherLine: "Name of Teachers & Designation",
  paperSetCount: "No. of Paper Set",
  scriptExamined: "No. of Script Examined",
  classTestCount: "No. of Class Test",
  students: "No. of Students",
  assignmentValue: "No. of Class Assignment",
  count: "No. of Course File",
};

const courseDutyLabels = {
  courseCode: "Code",
  courseTitle: "Title",
=======
  name: "Name of Teachers",
  designationDept: "Designation & Department",
  role: "Role",
};

const paperSetterLabels = {
  course: "Course No. & Title",
>>>>>>> Stashed changes
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
};

const courseFileLabels = {
  course: "Course No. & Title",
  teacherLine: "Name of Teachers & Designation",
  count: "No. of Course File",
};

const sessionalLabels = {
<<<<<<< Updated upstream
  courseLine: "Course No. & Title",
  credit: "Credit",
=======
  sl: "Sl.",
  courseCode: "Course No. & Title",
>>>>>>> Stashed changes
  teacherLine: "Name of Teachers & Designation",
  students: "No. of Students",
};

const questionWorkLabels = {
  sl: "Sl.",
<<<<<<< Updated upstream
  teacherLine: "Name of Teachers & Designation",
  questionNumber: "No. of Questions",
=======
  teacherLine: "Name of The Teachers & Designation",
  questionNumber: "No. of Question",
>>>>>>> Stashed changes
};

const scrutinyLabels = {
  sl: "Sl.",
<<<<<<< Updated upstream
  teacherLine: "Name of Teachers & Designation",
  scriptCount: "No. of Scripts",
=======
  teacherLine: "Name of The Teachers & Designation",
  scriptCount: "No. of Script",
>>>>>>> Stashed changes
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

const courseCoordinatorLabels = {
  sl: "Sl.",
  teacherLine: "Name of Teachers & Designation",
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
          committee: { ...defaultLayoutSettings.committee, ...(saved.layoutSettings?.committee || {}) },
          questionWork: { ...defaultLayoutSettings.questionWork, ...(saved.layoutSettings?.questionWork || {}) },
          scrutinyObe: { ...defaultLayoutSettings.scrutinyObe, ...(saved.layoutSettings?.scrutinyObe || {}) },
          scrutinyNonObe: { ...defaultLayoutSettings.scrutinyNonObe, ...(saved.layoutSettings?.scrutinyNonObe || {}) },
          sessionalDuty: { ...defaultLayoutSettings.sessionalDuty, ...(saved.layoutSettings?.sessionalDuty || {}) },
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
            <SectionPanel title="1. Examination Committee">
              <ColumnWidthEditor
                widths={billData.layoutSettings.committee}
                setWidths={(v) => updateLayout("committee", v)}
                labels={committeeLabels}
              />
            </SectionPanel>

            <SectionPanel title="2. Paper Setter & Examiner">
              <ColumnWidthEditor
                widths={billData.layoutSettings.paperSetter}
                setWidths={(v) => updateLayout("paperSetter", v)}
<<<<<<< Updated upstream
                labels={groupedLabels}
=======
                labels={paperSetterLabels}
>>>>>>> Stashed changes
              />
            </SectionPanel>

            <SectionPanel title="3. Class Test">
              <ColumnWidthEditor
                widths={billData.layoutSettings.classTest}
                setWidths={(v) => updateLayout("classTest", v)}
<<<<<<< Updated upstream
                labels={groupedLabels}
              />
            </SectionPanel>

            <SectionPanel title="Assignment">
              <ColumnWidthEditor widths={billData.layoutSettings.assignment} setWidths={(v) => updateLayout("assignment", v)} labels={groupedLabels} />
            </SectionPanel>

            <SectionPanel title="Course File">
              <ColumnWidthEditor widths={billData.layoutSettings.courseFile} setWidths={(v) => updateLayout("courseFile", v)} labels={groupedLabels} />
            </SectionPanel>

            <SectionPanel title="4. Sessional Courses">
=======
                labels={classTestLabels}
              />
            </SectionPanel>

            <SectionPanel title="4. Assignment">
>>>>>>> Stashed changes
              <ColumnWidthEditor
                widths={billData.layoutSettings.assignment}
                setWidths={(v) => updateLayout("assignment", v)}
                labels={assignmentLabels}
              />
            </SectionPanel>

            <SectionPanel title="5. Course File">
              <ColumnWidthEditor
                widths={billData.layoutSettings.courseFile}
                setWidths={(v) => updateLayout("courseFile", v)}
                labels={courseFileLabels}
              />
            </SectionPanel>

            <SectionPanel title="6. Question Typing / Sketching / Printing">
              <ColumnWidthEditor
                widths={billData.layoutSettings.questionWork}
                setWidths={(v) => updateLayout("questionWork", v)}
                labels={questionWorkLabels}
              />
            </SectionPanel>

            <SectionPanel title="7. Scrutiny — OBE">
              <ColumnWidthEditor
                widths={billData.layoutSettings.scrutinyObe}
                setWidths={(v) => updateLayout("scrutinyObe", v)}
                labels={scrutinyLabels}
              />
            </SectionPanel>

            <SectionPanel title="7. Scrutiny — Non-OBE">
              <ColumnWidthEditor
                widths={billData.layoutSettings.scrutinyNonObe}
                setWidths={(v) => updateLayout("scrutinyNonObe", v)}
                labels={scrutinyLabels}
              />
            </SectionPanel>

<<<<<<< Updated upstream
            <SectionPanel title="Board Viva">
              <ColumnWidthEditor widths={billData.layoutSettings.boardViva} setWidths={(v) => updateLayout("boardViva", v)} labels={studentDutyLabels} />
            </SectionPanel>

            <SectionPanel title="7. Tabulation">
=======
            <SectionPanel title="8. Sessional Courses">
              <ColumnWidthEditor
                widths={billData.layoutSettings.sessionalDuty}
                setWidths={(v) => updateLayout("sessionalDuty", v)}
                labels={sessionalLabels}
              />
            </SectionPanel>

            <SectionPanel title="9. Board Viva / Tabulation / Grade Sheet">
>>>>>>> Stashed changes
              <ColumnWidthEditor
                widths={billData.layoutSettings.tabulation}
                setWidths={(v) => updateLayout("tabulation", v)}
                labels={studentDutyLabels}
              />
            </SectionPanel>

<<<<<<< Updated upstream
            <SectionPanel title="Grade Sheet Preparation">
              <ColumnWidthEditor widths={billData.layoutSettings.gradeSheetPreparation} setWidths={(v) => updateLayout("gradeSheetPreparation", v)} labels={{ ...studentDutyLabels, studentsDisplay: "No. of Students" }} />
            </SectionPanel>

            <SectionPanel title="Grade Sheet Verification">
              <ColumnWidthEditor widths={billData.layoutSettings.gradeSheetVerification} setWidths={(v) => updateLayout("gradeSheetVerification", v)} labels={{ ...studentDutyLabels, studentsDisplay: "No. of Students" }} />
            </SectionPanel>

            <SectionPanel title="8. Course Advisers">
=======
            <SectionPanel title="Course Advisers">
>>>>>>> Stashed changes
              <ColumnWidthEditor
                widths={billData.layoutSettings.courseAdviser}
                setWidths={(v) => updateLayout("courseAdviser", v)}
                labels={studentDutyLabels}
              />
            </SectionPanel>

            <SectionPanel title="Course Coordinator">
              <ColumnWidthEditor
                widths={billData.layoutSettings.courseCoordinator}
                setWidths={(v) => updateLayout("courseCoordinator", v)}
                labels={courseCoordinatorLabels}
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
