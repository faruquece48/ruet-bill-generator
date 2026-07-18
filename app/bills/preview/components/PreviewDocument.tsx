"use client";

import type { ExaminationBillData } from "../../create/components/types";
import PreviewTable, { PreviewColumn } from "./PreviewTable";
import {
  flattenPaperSetter,
  flattenClassTest,
  flattenAssignment,
  flattenCourseFile,
  flattenSessional,
  flattenBoardViva,
  flattenTabulation,
  deriveGradeSheetRows,
} from "../../create/components/pdf/pdfHelpers";

interface Props {
  bill: ExaminationBillData;
}

// ---- Column sets ----
const committeeCols: PreviewColumn[] = [
  { key: "sl", label: "Sl." },
  { key: "teacherLine", label: "Name of Teachers & Designation" },
  { key: "department", label: "Department" },
  { key: "role", label: "Role" },
];

const paperSetterCols: PreviewColumn[] = [
  { key: "courseCode", label: "Course No. & Title" },
  { key: "part", label: "Part" },
  { key: "teacherLine", label: "Name of Teachers & Designation" },
  { key: "paperSetCount", label: "No. of Paper Set" },
  { key: "scriptExamined", label: "No. of Script Examined" },
];

const classTestCols: PreviewColumn[] = [
  { key: "courseCode", label: "Course No. & Title" },
  { key: "teacherLine", label: "Name of Teachers & Designation" },
  { key: "classTestCount", label: "No. of Class Test" },
  { key: "students", label: "No. of Students" },
];

const assignmentCols: PreviewColumn[] = [
  { key: "courseCode", label: "Course No. & Title" },
  { key: "teacherLine", label: "Name of Teachers & Designation" },
  { key: "assignmentValue", label: "No. of Class Assignment" },
];

const courseFileCols: PreviewColumn[] = [
  { key: "courseCode", label: "Course No. & Title" },
  { key: "teacherLine", label: "Name of Teachers & Designation" },
];

const questionWorkCols: PreviewColumn[] = [
  { key: "sl", label: "Sl. No." },
  { key: "teacherLine", label: "Name of The Teachers & Designation" },
  { key: "questionNumber", label: "No. of Question" },
];

const scrutinyCols: PreviewColumn[] = [
  { key: "sl", label: "Sl. No." },
  { key: "teacherLine", label: "Name of The Teachers & Designation" },
  { key: "scriptCount", label: "No. of Script" },
];

const sessionalCols: PreviewColumn[] = [
  { key: "courseCode", label: "Course No. & Title" },
  { key: "teacherLine", label: "Name of Teachers & Designation" },
  { key: "students", label: "No. of Students" },
];

const boardVivaCols: PreviewColumn[] = [
  { key: "sl", label: "Sl. No." },
  { key: "teacherLine", label: "Name of Teachers & Designation" },
  { key: "students", label: "No. of Students" },
];

const tabulationCols: PreviewColumn[] = [
  { key: "sl", label: "Sl. No." },
  { key: "teacherLine", label: "Name of Teachers & Designation" },
  { key: "students", label: "No. of Students" },
];

const gradeSheetCols: PreviewColumn[] = [
  { key: "sl", label: "Sl. No." },
  { key: "teacherLine", label: "Name of Teachers & Designation" },
  { key: "studentsDisplay", label: "No. of Students" },
];

const thesisCols: PreviewColumn[] = [
  { key: "sl", label: "Sl. No." },
  { key: "teacherLine", label: "Name of Teachers & Designation" },
  { key: "supervisorCount", label: "Supervisor" },
  { key: "examinerCount", label: "Thesis Examiner" },
  { key: "attendsViva", label: "Thesis Viva" },
];

const courseAdviserCols: PreviewColumn[] = [
  { key: "sl", label: "Sl. No." },
  { key: "teacherLine", label: "Name of Teachers & Designation" },
  { key: "students", label: "No. of Students" },
];

const courseCoordinatorCols: PreviewColumn[] = [
  { key: "sl", label: "Sl. No." },
  { key: "teacherLine", label: "Name of Teachers & Designation" },
];

const verificationCols: PreviewColumn[] = [
  { key: "sl", label: "Sl. No." },
  { key: "teacherLine", label: "Name of Teachers & Designation" },
  { key: "students", label: "No. of Students" },
];

function withTeacherLine<
  T extends { name: string; designation: string; department: string }
>(rows: T[]) {
  return rows.map((r) => ({
    ...r,
    teacherLine: `${r.name}, ${r.designation}${
      r.department ? `, Dept. of ${r.department}` : ""
    }`,
  }));
}

export default function PreviewDocument({ bill }: Props) {
  const isBacklog = bill.billInfo.examType === "backlog";
  const isThesisApplicable =
    bill.billInfo.year === "4th Year" && bill.billInfo.semester === "Even";
  const isVerificationApplicable =
    bill.billInfo.hasGraduatingStudents === "yes";
  const isCourseCoordinatorApplicable = isThesisApplicable;

  const allCourseDuties = [
    ...bill.courseDuties.obe,
    ...bill.courseDuties.nonObe,
  ];

  const paperSetterRows = flattenPaperSetter(allCourseDuties);
  const classTestRows = flattenClassTest(allCourseDuties);
  const assignmentRows = flattenAssignment(allCourseDuties);
  const courseFileRows = flattenCourseFile(
    allCourseDuties,
    bill.sessionalDuties
  );
  const sessionalRows = flattenSessional(bill.sessionalDuties);
  const boardVivaRows = flattenBoardViva(bill.sessionalDuties);
  const tabulationRows = flattenTabulation(bill.studentDuties);
  const gradeSheetRows = deriveGradeSheetRows(bill.studentDuties);
  const allScrutiny = [...bill.scrutinies.obe, ...bill.scrutinies.nonObe];

  type Section = {
    title: string;
    hasData: boolean;
    content: React.ReactNode;
    includeInBacklog: boolean; // whether this counts toward backlog's fixed 7
  };

  const sections: Section[] = [
    {
      title: "Examination Committee",
      hasData: bill.committees.some((m) => m.name.trim() !== ""),
      includeInBacklog: true,
      content: (
        <PreviewTable
          columns={committeeCols}
          rows={withTeacherLine(bill.committees)}
          widths={bill.layoutSettings.committee}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Paper Setter & Examiner",
      hasData: paperSetterRows.length > 0,
      includeInBacklog: true,
      content: (
        <PreviewTable
          columns={paperSetterCols}
          rows={paperSetterRows}
          widths={bill.layoutSettings.courseDutyObe}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Class Test",
      hasData: classTestRows.length > 0,
      includeInBacklog: false,
      content: (
        <PreviewTable
          columns={classTestCols}
          rows={classTestRows}
          widths={bill.layoutSettings.courseDutyObe}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Assignment",
      hasData: assignmentRows.length > 0,
      includeInBacklog: false,
      content: (
        <PreviewTable
          columns={assignmentCols}
          rows={assignmentRows}
          widths={bill.layoutSettings.courseDutyObe}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Course File",
      hasData: courseFileRows.length > 0,
      includeInBacklog: false,
      content: (
        <PreviewTable
          columns={courseFileCols}
          rows={courseFileRows}
          widths={bill.layoutSettings.courseDutyObe}
        />
      ),
    },
    {
      title: isBacklog
        ? "List of Teachers Associated with Question Typing, Sketching & Printing"
        : "List of Teachers Associated with Question Typing, Sketching, Comparing & Printing",
      hasData: bill.questionWorks.length > 0,
      includeInBacklog: true,
      content: (
        <PreviewTable
          columns={questionWorkCols}
          rows={withTeacherLine(bill.questionWorks as any)}
          widths={bill.layoutSettings.questionWork}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Scrutiny",
      hasData: allScrutiny.length > 0,
      includeInBacklog: true,
      content: (
        <PreviewTable
          columns={scrutinyCols}
          rows={withTeacherLine(allScrutiny as any)}
          widths={bill.layoutSettings.scrutinyObe}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Sessional",
      hasData: sessionalRows.length > 0,
      includeInBacklog: false,
      content: (
        <PreviewTable
          columns={sessionalCols}
          rows={sessionalRows}
          widths={bill.layoutSettings.sessionalDuty}
        />
      ),
    },
    // Board Viva: appears purely based on whether board-viva data exists,
    // in both semester and backlog modes (confirmed).
    {
      title: "List of Teachers Associated with Board Viva",
      hasData: boardVivaRows.length > 0,
      includeInBacklog: true,
      content: (
        <PreviewTable
          columns={boardVivaCols}
          rows={boardVivaRows}
          widths={bill.layoutSettings.studentDuty}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Tabulation",
      hasData: tabulationRows.length > 0,
      includeInBacklog: true,
      content: (
        <PreviewTable
          columns={tabulationCols}
          rows={tabulationRows}
          widths={bill.layoutSettings.studentDuty}
          showSerial
        />
      ),
    },
    // Grade Sheet Preparation and Verification: always two separate
    // sections, in both semester and backlog modes (confirmed).
    {
      title: "List of Teachers Associated with Grade Sheet Preparation",
      hasData: gradeSheetRows.length > 0,
      includeInBacklog: true,
      content: (
        <PreviewTable
          columns={gradeSheetCols}
          rows={gradeSheetRows}
          widths={bill.layoutSettings.studentDuty}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Grade Sheet Verification",
      hasData: gradeSheetRows.length > 0,
      includeInBacklog: true,
      content: (
        <PreviewTable
          columns={gradeSheetCols}
          rows={gradeSheetRows}
          widths={bill.layoutSettings.studentDuty}
          showSerial
        />
      ),
    },
    {
      title: "List of Course Advisers",
      hasData: bill.courseAdvisers.length > 0,
      includeInBacklog: false,
      content: (
        <PreviewTable
          columns={courseAdviserCols}
          rows={withTeacherLine(bill.courseAdvisers as any)}
          widths={bill.layoutSettings.courseAdviser}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Course Coordinator",
      hasData:
        isCourseCoordinatorApplicable &&
        bill.courseCoordinatorTeachers.length > 0,
      includeInBacklog: false,
      content: (
        <PreviewTable
          columns={courseCoordinatorCols}
          rows={withTeacherLine(bill.courseCoordinatorTeachers as any)}
          widths={bill.layoutSettings.courseCoordinator}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Thesis/Project Examination",
      hasData: isThesisApplicable && bill.thesisTeachers.length > 0,
      includeInBacklog: false,
      content: (
        <PreviewTable
          columns={thesisCols}
          rows={withTeacherLine(bill.thesisTeachers as any)}
          widths={bill.layoutSettings.thesis}
          showSerial
        />
      ),
    },
    // Verification: always last, gated only by hasGraduatingStudents,
    // applies to either semester or backlog exams.
    {
      title: "List of Teachers Associated with Verification of Final Result",
      hasData:
        isVerificationApplicable && bill.verificationTeachers.length > 0,
      includeInBacklog: true,
      content: (
        <>
          {bill.verificationStudentCount && (
            <p className="mb-2 text-xs text-gray-600">
              No. of Students: {bill.verificationStudentCount}
            </p>
          )}
          <PreviewTable
            columns={verificationCols}
            rows={withTeacherLine(bill.verificationTeachers as any)}
            widths={bill.layoutSettings.verification}
            showSerial
          />
        </>
      ),
    },
  ];

  const visible = sections.filter((s) => {
    if (!s.hasData) return false;
    if (isBacklog && !s.includeInBacklog) return false;
    return true;
  });

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-8">
      <div className="text-center space-y-1">
        <p
          className="italic"
          style={{ fontFamily: "'Monotype Corsiva', cursive", fontSize: 10 }}
        >
          Heaven&apos;s Light is Our Guide
        </p>
        <p className="text-[11px]">
          Department of Building Engineering &amp; Construction Management
        </p>
        <p className="text-[11px]">
          Rajshahi University of Engineering &amp; Technology
        </p>
        <p className="mt-1 text-[11px] font-bold">
          {bill.billInfo.examination || "B.Sc. Engineering"}{" "}
          {bill.billInfo.year} {bill.billInfo.semester} Semester Examination-
          {bill.billInfo.examYear} (Series {bill.billInfo.series})
        </p>
      </div>

      {visible.length === 0 && (
        <p className="text-center text-sm text-gray-400">
          No section data entered yet. Fill in the Bill page to see the
          preview.
        </p>
      )}

      {visible.map((section, i) => (
        <div key={section.title} className="space-y-3 text-[11px]">
          <h2 className="text-lg font-bold">
            {i + 1}. {section.title}
          </h2>
          {section.content}
        </div>
      ))}
    </div>
  );
}