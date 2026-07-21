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
import {
  combineClassTestRows,
  deriveGradeSheetRows,
  flattenAssignment,
  flattenBoardViva,
  flattenClassTest,
  flattenCourseFile,
  flattenPaperSetter,
  flattenSessional,
  flattenTabulation,
} from "../create/components/pdf/pdfHelpers";

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
  const [draggedSection, setDraggedSection] = useState<string | null>(null);
  const hydrated = useRef(false);
  const isBacklog = billData.billInfo.examType === "backlog";
  const isMixedEvaluation = billData.billInfo.evaluationSystem === "mixed";
  const paperSetterRows = isMixedEvaluation
    ? [...flattenPaperSetter(billData.courseDuties.obe), ...flattenPaperSetter(billData.courseDuties.nonObe)]
    : flattenPaperSetter(billData.courseDuties.obe);
  const obeClassTestRows = flattenClassTest(billData.courseDuties.obe);
  const classTestRows = isMixedEvaluation
    ? combineClassTestRows(obeClassTestRows, flattenClassTest(billData.courseDuties.nonObe))
    : obeClassTestRows;
  const assignmentRows = flattenAssignment(billData.courseDuties.obe);
  const courseFileRows = flattenCourseFile(billData.courseDuties.obe, billData.sessionalDuties);
  const sessionalRows = flattenSessional(billData.sessionalDuties);
  const boardVivaRows = flattenBoardViva(billData.sessionalDuties);
  const tabulationRows = flattenTabulation(billData.studentDuties);
  const gradeSheetRows = deriveGradeSheetRows(billData.studentDuties, billData.tabulationStudentCount);
  const hasScrutiny = isMixedEvaluation
    ? billData.scrutinies.obe.length + billData.scrutinies.nonObe.length > 0
    : billData.scrutinies.obe.length > 0;
  const isFourthYearEven = billData.billInfo.year === "4th Year" && billData.billInfo.semester === "Even";
  const isFirstYearEven = billData.billInfo.year === "1st Year" && billData.billInfo.semester === "Even";
  const visibleSectionKeys = [
    ["committee", billData.committees.some((member) => member.name.trim() !== "")],
    ["paperSetter", paperSetterRows.length > 0],
    ["classTest", !isBacklog && classTestRows.length > 0],
    ["assignment", !isBacklog && assignmentRows.length > 0],
    ["courseFile", !isBacklog && courseFileRows.length > 0],
    ["questionWork", billData.questionWorks.some((teacher) => teacher.name.trim() !== "")],
    ["scrutiny", hasScrutiny],
    ["sessional", !isBacklog && sessionalRows.length > 0],
    ["boardViva", boardVivaRows.length > 0],
    ["tabulation", tabulationRows.length > 0],
    ["gradePreparation", gradeSheetRows.length > 0],
    ["gradeVerification", !isBacklog && gradeSheetRows.length > 0],
    ["courseAdviser", !isBacklog && billData.courseAdvisers.length > 0],
    ["courseCoordinator", !isBacklog && isFourthYearEven && billData.courseCoordinatorTeachers.length > 0],
    ["thesis", !isBacklog && isFourthYearEven && billData.thesisTeachers.length > 0],
    ["verification", billData.billInfo.hasGraduatingStudents === "yes" && billData.verificationTeachers.length > 0],
    ["practical", isFirstYearEven && !isBacklog && billData.practicalSurveyingTeachers.some((teacher) => teacher.name.trim() !== "")],
  ] as const;
  const pdfNumber = (key: (typeof visibleSectionKeys)[number][0]) =>
    visibleSectionKeys.filter(([, visible]) => visible).findIndex(([sectionKey]) => sectionKey === key) + 1;

  const dragSectionVisibility: Record<string, boolean> = {
    committee: billData.committees.some((member) => member.name.trim() !== ""),
    paperSetterObe: paperSetterRows.length > 0,
    classTest: !isBacklog && classTestRows.length > 0,
    assignment: !isBacklog && assignmentRows.length > 0,
    courseFile: !isBacklog && courseFileRows.length > 0,
    questionWork: billData.questionWorks.some((teacher) => teacher.name.trim() !== ""),
    scrutinyObe: hasScrutiny,
    sessionalDuty: !isBacklog && sessionalRows.length > 0,
    boardViva: boardVivaRows.length > 0,
    tabulation: tabulationRows.length > 0,
    gradeSheetPreparation: gradeSheetRows.length > 0,
    gradeSheetVerification: !isBacklog && gradeSheetRows.length > 0,
    courseAdviser: !isBacklog && billData.courseAdvisers.length > 0,
    courseCoordinator: !isBacklog && isFourthYearEven && billData.courseCoordinatorTeachers.length > 0,
    thesis: !isBacklog && isFourthYearEven && billData.thesisTeachers.length > 0,
    verification: billData.billInfo.hasGraduatingStudents === "yes" && billData.verificationTeachers.length > 0,
    practicalSurveying: isFirstYearEven && !isBacklog && billData.practicalSurveyingTeachers.some((teacher) => teacher.name.trim() !== ""),
  };
  const dragSectionLabels: Record<string, string> = {
    committee: "Examination Committee",
    paperSetterObe: "Paper Setter & Examiner (OBE/Non-OBE)",
    classTest: "Class Test",
    assignment: "Assignment",
    courseFile: "Course File",
    questionWork: "Question Typing / Sketching / Printing",
    scrutinyObe: "Scrutiny (OBE/Non-OBE)",
    sessionalDuty: "Sessional",
    boardViva: "Board Viva",
    tabulation: "Tabulation",
    gradeSheetPreparation: "Grade Sheet Preparation",
    gradeSheetVerification: "Grade Sheet Verification",
    courseAdviser: "Course Advisers",
    courseCoordinator: "Course Coordinator",
    thesis: "Thesis/Project Examination",
    verification: "Verification of Final Result",
    practicalSurveying: "Practical Surveying (CE 1226)",
  };

  const moveSection = (from: string, to: string) => {
    setBillData((prev) => {
      if (from === "committee" || to === "committee") return prev;
      const order = [
        "committee",
        ...(prev.sectionOrder ?? emptyBill.sectionOrder).filter((key) => key !== "committee"),
      ];
      const fromIndex = order.indexOf(from);
      const toIndex = order.indexOf(to);
      if (fromIndex < 0 || toIndex < 0) return prev;
      order.splice(fromIndex, 1);
      order.splice(toIndex, 0, from);
      return { ...prev, sectionOrder: order };
    });
  };

  useEffect(() => {
    const saved = loadCurrentWork();
    if (saved) {
      // Hydrate once from browser storage after the client mounts.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBillData({
        ...emptyBill,
        ...saved,
        sectionOrder: saved.sectionOrder ?? emptyBill.sectionOrder,
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

  const pageBreakControl = (key: string) => ({
    pageBreakAfter: Boolean(billData.pageBreakAfter?.[key]),
    onPageBreakAfterChange: (checked: boolean) =>
      setBillData((prev) => ({
        ...prev,
        pageBreakAfter: { ...prev.pageBreakAfter, [key]: checked },
      })),
    tableSpacing: billData.tableSpacing?.[key] ?? billData.layoutSpacing.sectionGap,
    onTableSpacingChange: (value: number) =>
      setBillData((prev) => ({
        ...prev,
        tableSpacing: { ...prev.tableSpacing, [key]: value },
      })),
  });

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
            <SectionPanel title="PDF Table Order">
              <p className="mb-3 text-xs text-slate-500">
                Drag tables to change their order and numbering in the PDF. Customization card labels remain fixed.
              </p>
              <div className="space-y-1">
                {["committee", ...(billData.sectionOrder ?? emptyBill.sectionOrder).filter((key) => key !== "committee")]
                  .filter((key) => dragSectionVisibility[key])
                  .map((key) => (
                  <div
                    key={key}
                    draggable
                    onDragStart={() => setDraggedSection(key)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={() => {
                      if (draggedSection) moveSection(draggedSection, key);
                      setDraggedSection(null);
                    }}
                    className="cursor-grab rounded border bg-slate-50 px-3 py-2 text-xs active:cursor-grabbing"
                  >
                    {dragSectionLabels[key] ?? key}
                  </div>
                  ))}
              </div>
            </SectionPanel>
            <SectionPanel title="Footer Area">
              <div>
                <label className="space-y-1 text-sm font-medium">
                  <span>Reserved footer area (pt)</span>
                  <input
                    type="number"
                    min="45"
                    max="200"
                    value={billData.layoutSpacing.footerArea ?? 68}
                    onChange={(event) =>
                      setBillData((prev) => ({
                        ...prev,
                        layoutSpacing: {
                          ...prev.layoutSpacing,
                          footerArea: Number(event.target.value) || 68,
                        },
                      }))
                    }
                    className="w-full rounded-md border px-3 py-2 text-sm"
                  />
                </label>
              </div>
            </SectionPanel>

            <SectionPanel visible={billData.committees.some((member) => member.name.trim() !== "")} title={`${pdfNumber("committee")}. Examination Committee`} {...pageBreakControl("committee")}>
              <ColumnWidthEditor
                widths={billData.layoutSettings.committee}
                setWidths={(v) => updateLayout("committee", v)}
                labels={committeeLabels}
              />
            </SectionPanel>

            <SectionPanel
              visible={paperSetterRows.length > 0}
              title={
                billData.billInfo.evaluationSystem === "mixed"
                  ? `${pdfNumber("paperSetter")}.1 OBE (New Syllabus) — Paper Setter & Examiner`
                  : `${pdfNumber("paperSetter")}. List of Teachers Associated with Paper Setter & Examiner`
              }
              {...pageBreakControl("paperSetterObe")}
            >
              <ColumnWidthEditor
                widths={billData.layoutSettings.paperSetter}
                setWidths={(v) => updateLayout("paperSetter", v)}
                labels={paperSetterLabels}
              />
            </SectionPanel>

            {billData.billInfo.evaluationSystem === "mixed" && (
              <SectionPanel visible={paperSetterRows.length > 0} title={`${pdfNumber("paperSetter")}.2 Non-OBE (Old Syllabus) — Paper Setter & Examiner`} {...pageBreakControl("paperSetterNonObe")}>
                <ColumnWidthEditor
                  widths={billData.layoutSettings.paperSetterNonObe}
                  setWidths={(v) => updateLayout("paperSetterNonObe", v)}
                  labels={paperSetterLabels}
                />
              </SectionPanel>
            )}

            <SectionPanel visible={!isBacklog && classTestRows.length > 0} title={`${pdfNumber("classTest")}. List of Teachers Associated with Class Test`} {...pageBreakControl("classTest")}>
              <ColumnWidthEditor
                widths={billData.layoutSettings.classTest}
                setWidths={(v) => updateLayout("classTest", v)}
                labels={classTestLabels}
              />
            </SectionPanel>

            <SectionPanel visible={!isBacklog && assignmentRows.length > 0} title={`${pdfNumber("assignment")}. List of Teachers Associated with Assignment`} {...pageBreakControl("assignment")}>
              <ColumnWidthEditor widths={billData.layoutSettings.assignment} setWidths={(v) => updateLayout("assignment", v)} labels={assignmentLabels} />
            </SectionPanel>

            <SectionPanel visible={!isBacklog && courseFileRows.length > 0} title={`${pdfNumber("courseFile")}. List of Teachers Associated with Course File`} {...pageBreakControl("courseFile")}>
              <ColumnWidthEditor widths={billData.layoutSettings.courseFile} setWidths={(v) => updateLayout("courseFile", v)} labels={courseFileLabels} />
            </SectionPanel>

            <SectionPanel visible={billData.questionWorks.some((teacher) => teacher.name.trim() !== "")} title={`${pdfNumber("questionWork")}. List of Teachers Associated with Question Typing / Sketching / Printing`} {...pageBreakControl("questionWork")}>
              <ColumnWidthEditor
                widths={billData.layoutSettings.questionWork}
                setWidths={(v) => updateLayout("questionWork", v)}
                labels={questionWorkLabels}
              />
            </SectionPanel>

            <SectionPanel
              visible={hasScrutiny}
              title={
                billData.billInfo.evaluationSystem === "mixed"
                  ? `${pdfNumber("scrutiny")}.1 OBE (New Syllabus) — Scrutiny`
                  : `${pdfNumber("scrutiny")}. List of Teachers Associated with Scrutiny`
              }
              {...pageBreakControl("scrutinyObe")}
            >
              <ColumnWidthEditor
                widths={billData.layoutSettings.scrutinyObe}
                setWidths={(v) => updateLayout("scrutinyObe", v)}
                labels={scrutinyLabels}
              />
            </SectionPanel>

            {billData.billInfo.evaluationSystem === "mixed" && (
              <SectionPanel visible={hasScrutiny} title={`${pdfNumber("scrutiny")}.2 Non-OBE (Old Syllabus) — Scrutiny`} {...pageBreakControl("scrutinyNonObe")}>
                <ColumnWidthEditor
                  widths={billData.layoutSettings.scrutinyNonObe}
                  setWidths={(v) => updateLayout("scrutinyNonObe", v)}
                  labels={scrutinyLabels}
                />
              </SectionPanel>
            )}

            <SectionPanel visible={!isBacklog && sessionalRows.length > 0} title={`${pdfNumber("sessional")}. List of Teachers Associated with Sessional`} {...pageBreakControl("sessionalDuty")}>
              <ColumnWidthEditor
                widths={billData.layoutSettings.sessionalDuty}
                setWidths={(v) => updateLayout("sessionalDuty", v)}
                labels={sessionalLabels}
              />
            </SectionPanel>

            <SectionPanel visible={boardVivaRows.length > 0} title={`${pdfNumber("boardViva")}. List of Teachers Associated with Board Viva`} {...pageBreakControl("boardViva")}>
              <ColumnWidthEditor widths={billData.layoutSettings.boardViva} setWidths={(v) => updateLayout("boardViva", v)} labels={studentDutyLabels} />
            </SectionPanel>

            <SectionPanel visible={tabulationRows.length > 0} title={`${pdfNumber("tabulation")}. List of Teachers Associated with Tabulation`} {...pageBreakControl("tabulation")}>
              <ColumnWidthEditor
                widths={billData.layoutSettings.tabulation}
                setWidths={(v) => updateLayout("tabulation", v)}
                labels={studentDutyLabels}
              />
            </SectionPanel>

            <SectionPanel visible={gradeSheetRows.length > 0} title={`${pdfNumber("gradePreparation")}. List of Teachers Associated with Grade Sheet Preparation`} {...pageBreakControl("gradeSheetPreparation")}>
              <ColumnWidthEditor widths={billData.layoutSettings.gradeSheetPreparation} setWidths={(v) => updateLayout("gradeSheetPreparation", v)} labels={gradeSheetLabels} />
            </SectionPanel>

            <SectionPanel visible={!isBacklog && gradeSheetRows.length > 0} title={`${pdfNumber("gradeVerification")}. List of Teachers Associated with Grade Sheet Verification`} {...pageBreakControl("gradeSheetVerification")}>
              <ColumnWidthEditor widths={billData.layoutSettings.gradeSheetVerification} setWidths={(v) => updateLayout("gradeSheetVerification", v)} labels={gradeSheetLabels} />
            </SectionPanel>

            <SectionPanel visible={!isBacklog && billData.courseAdvisers.length > 0} title={`${pdfNumber("courseAdviser")}. List of Course Advisers`} {...pageBreakControl("courseAdviser")}>
              <ColumnWidthEditor
                widths={billData.layoutSettings.courseAdviser}
                setWidths={(v) => updateLayout("courseAdviser", v)}
                labels={studentDutyLabels}
              />
            </SectionPanel>

            <SectionPanel visible={!isBacklog && isFourthYearEven && billData.courseCoordinatorTeachers.length > 0} title={`${pdfNumber("courseCoordinator")}. List of Teachers Associated with Course Coordinator`} {...pageBreakControl("courseCoordinator")}>
              <ColumnWidthEditor
                widths={billData.layoutSettings.courseCoordinator}
                setWidths={(v) => updateLayout("courseCoordinator", v)}
                labels={courseCoordinatorLabels}
              />
            </SectionPanel>

            <SectionPanel visible={!isBacklog && isFourthYearEven && billData.thesisTeachers.length > 0} title={`${pdfNumber("thesis")}. List of Teachers Associated with Thesis/Project Examination`} {...pageBreakControl("thesis")}>
              <ColumnWidthEditor
                widths={billData.layoutSettings.thesis}
                setWidths={(v) => updateLayout("thesis", v)}
                labels={thesisLabels}
              />
            </SectionPanel>

            <SectionPanel visible={billData.billInfo.hasGraduatingStudents === "yes" && billData.verificationTeachers.length > 0} title={`${pdfNumber("verification")}. List of Teachers Associated with Verification of Final Result`} {...pageBreakControl("verification")}>
              <ColumnWidthEditor
                widths={billData.layoutSettings.verification}
                setWidths={(v) => updateLayout("verification", v)}
                labels={verificationLabels}
              />
            </SectionPanel>

            {isFirstYearEven && !isBacklog && billData.practicalSurveyingTeachers.some((teacher) => teacher.name.trim() !== "") && (
                <SectionPanel
                  title={`${pdfNumber("practical")}. List of Teachers Associated with Practical Surveying (CE 1226)`}
                  {...pageBreakControl("practicalSurveying")}
                >
                  <ColumnWidthEditor
                    widths={billData.layoutSettings.practicalSurveying}
                    setWidths={(v) => updateLayout("practicalSurveying", v)}
                    labels={studentDutyLabels}
                  />
                </SectionPanel>
              )}
          </div>

          {/* RIGHT: paginated preview rendered by the same PDF document */}
          <div className="lg:sticky lg:top-20">
            <div className="h-[calc(100vh-7rem)] min-h-[720px] overflow-hidden rounded-xl border bg-slate-200 shadow-sm">
              <PdfPreviewViewer
                bill={billData}
              />
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
