"use client";
import type { ExaminationBillData } from "../../create/components/types";
import BillPreview from "../../create/components/BillPreview";
import PreviewTable, { PreviewColumn } from "./PreviewTable";
import {
  flattenCourseDuties,
  flattenSessionalDuties,
} from "../../create/components/pdf/pdfHelpers";

interface Props {
  bill: ExaminationBillData;
}

const committeeCols: PreviewColumn[] = [
  { key: "sl", label: "Sl." },
  { key: "name", label: "Teacher Name" },
  { key: "designation", label: "Designation" },
  { key: "department", label: "Department" },
  { key: "role", label: "Role" },
];

const courseDutyCols: PreviewColumn[] = [
  { key: "courseCode", label: "Code" },
  { key: "courseTitle", label: "Title" },
  { key: "part", label: "Part" },
  { key: "name", label: "Teacher" },
  { key: "designation", label: "Designation" },
  { key: "department", label: "Dept." },
  { key: "paperSetter", label: "Paper Setter" },
  { key: "examiner", label: "Examiner" },
  { key: "classTest", label: "Class Test" },
  { key: "assignment", label: "Assignment" },
  { key: "courseFile", label: "Course File" },
];

const sessionalCols: PreviewColumn[] = [
  { key: "courseCode", label: "Code" },
  { key: "courseTitle", label: "Title" },
  { key: "name", label: "Teacher" },
  { key: "designation", label: "Designation" },
  { key: "department", label: "Dept." },
  { key: "sessional", label: "Sessional" },
  { key: "sessionalStudents", label: "Students" },
  { key: "courseFile", label: "Course File" },
];

const questionWorkCols: PreviewColumn[] = [
  { key: "sl", label: "Sl." },
  { key: "name", label: "Teacher Name" },
  { key: "designation", label: "Designation" },
  { key: "department", label: "Department" },
  { key: "questionNumber", label: "No. of Questions" },
];

const scrutinyCols: PreviewColumn[] = [
  { key: "name", label: "Teacher Name" },
  { key: "designation", label: "Designation" },
  { key: "department", label: "Department" },
  { key: "scriptCount", label: "No. of Scripts" },
];

const studentDutyCols: PreviewColumn[] = [
  { key: "sl", label: "Sl." },
  { key: "name", label: "Teacher Name" },
  { key: "designation", label: "Designation" },
  { key: "department", label: "Department" },
  { key: "students", label: "No. of Students" },
];

const courseAdviserCols: PreviewColumn[] = [
  { key: "sl", label: "Sl." },
  { key: "name", label: "Teacher Name" },
  { key: "designation", label: "Designation" },
  { key: "department", label: "Department" },
  { key: "students", label: "No. of Students" },
];

const thesisCols: PreviewColumn[] = [
  { key: "sl", label: "Sl." },
  { key: "name", label: "Teacher Name" },
  { key: "designation", label: "Designation" },
  { key: "department", label: "Department" },
  { key: "supervisorCount", label: "Supervisor" },
  { key: "examinerCount", label: "Examiner" },
  { key: "attendsViva", label: "Viva" },
];

const verificationCols: PreviewColumn[] = [
  { key: "sl", label: "Sl." },
  { key: "name", label: "Teacher Name" },
  { key: "designation", label: "Designation" },
  { key: "department", label: "Department" },
];

const courseCoordinatorCols: PreviewColumn[] = verificationCols;

export default function PreviewDocument({ bill }: Props) {
  const isThesisApplicable =
    bill.billInfo.year === "4th Year" && bill.billInfo.semester === "Even";
  const isVerificationApplicable = bill.billInfo.hasGraduatingStudents === "yes";
  const isCourseCoordinatorApplicable = isThesisApplicable;

  const courseDutyRows = [
    ...flattenCourseDuties(bill.courseDuties.obe),
    ...flattenCourseDuties(bill.courseDuties.nonObe),
  ];

  type Section = {
    title: string;
    hasData: boolean;
    content: React.ReactNode;
  };

  const sections: Section[] = [
    {
      title: "Examination Committee",
      hasData: bill.committees.some((m) => m.name.trim() !== ""),
      content: (
        <PreviewTable
          columns={committeeCols}
          rows={bill.committees}
          widths={bill.layoutSettings.committee}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Paper Setter & Examiner",
      hasData: courseDutyRows.length > 0,
      content: (
        <div className="space-y-4">
          {bill.courseDuties.obe.length > 0 && (
            <div>
              {bill.billInfo.evaluationSystem === "mixed" && (
                <p className="mb-1 text-xs font-semibold text-gray-500">
                  OBE (New Syllabus)
                </p>
              )}
              <PreviewTable
                columns={courseDutyCols}
                rows={flattenCourseDuties(bill.courseDuties.obe)}
                widths={bill.layoutSettings.courseDutyObe}
              />
            </div>
          )}
          {bill.courseDuties.nonObe.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold text-gray-500">
                Non-OBE (Old Syllabus)
              </p>
              <PreviewTable
                columns={courseDutyCols}
                rows={flattenCourseDuties(bill.courseDuties.nonObe)}
                widths={bill.layoutSettings.courseDutyNonObe}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      title: "List of Teachers Associated with Sessional Courses",
      hasData: bill.sessionalDuties.length > 0,
      content: (
        <PreviewTable
          columns={sessionalCols}
          rows={flattenSessionalDuties(bill.sessionalDuties)}
          widths={bill.layoutSettings.sessionalDuty}
        />
      ),
    },
    {
      title:
        "List of Teachers Associated with Question Typing, Sketching, Comparing & Printing",
      hasData: bill.questionWorks.length > 0,
      content: (
        <PreviewTable
          columns={questionWorkCols}
          rows={bill.questionWorks}
          widths={bill.layoutSettings.questionWork}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Scrutiny",
      hasData:
        bill.scrutinies.obe.length > 0 || bill.scrutinies.nonObe.length > 0,
      content: (
        <div className="space-y-4">
          {bill.scrutinies.obe.length > 0 && (
            <div>
              {bill.billInfo.evaluationSystem === "mixed" && (
                <p className="mb-1 text-xs font-semibold text-gray-500">
                  OBE (New Syllabus)
                </p>
              )}
              <PreviewTable
                columns={scrutinyCols}
                rows={bill.scrutinies.obe}
                widths={bill.layoutSettings.scrutinyObe}
              />
            </div>
          )}
          {bill.scrutinies.nonObe.length > 0 && (
            <div>
              <p className="mb-1 text-xs font-semibold text-gray-500">
                Non-OBE (Old Syllabus)
              </p>
              <PreviewTable
                columns={scrutinyCols}
                rows={bill.scrutinies.nonObe}
                widths={bill.layoutSettings.scrutinyNonObe}
              />
            </div>
          )}
        </div>
      ),
    },
    {
      title: "List of Teachers Associated with Tabulation",
      hasData: bill.studentDuties.length > 0,
      content: (
        <PreviewTable
          columns={studentDutyCols}
          rows={bill.studentDuties}
          widths={bill.layoutSettings.studentDuty}
          showSerial
        />
      ),
    },
    {
      title: "List of Course Advisers",
      hasData: bill.courseAdvisers.length > 0,
      content: (
        <PreviewTable
          columns={courseAdviserCols}
          rows={bill.courseAdvisers}
          widths={bill.layoutSettings.courseAdviser}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Thesis/Project Examination",
      hasData: isThesisApplicable && bill.thesisTeachers.length > 0,
      content: (
        <PreviewTable
          columns={thesisCols}
          rows={bill.thesisTeachers}
          widths={bill.layoutSettings.thesis}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Verification of Final Result",
      hasData:
        isVerificationApplicable && bill.verificationTeachers.length > 0,
      content: (
        <>
          {bill.verificationStudentCount && (
            <p className="mb-2 text-xs text-gray-600">
              No. of Students: {bill.verificationStudentCount}
            </p>
          )}
          <PreviewTable
            columns={verificationCols}
            rows={bill.verificationTeachers}
            widths={bill.layoutSettings.verification}
            showSerial
          />
        </>
      ),
    },
    {
      title: "List of Teachers Associated with Course Coordinator",
      hasData:
        isCourseCoordinatorApplicable &&
        bill.courseCoordinatorTeachers.length > 0,
      content: (
        <PreviewTable
          columns={courseCoordinatorCols}
          rows={bill.courseCoordinatorTeachers}
          widths={bill.layoutSettings.courseCoordinator}
          showSerial
        />
      ),
    },
  ];

  const visible = sections.filter((s) => s.hasData);

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-8">
      <BillPreview bill={bill.billInfo} />

      {visible.length === 0 && (
        <p className="text-center text-sm text-gray-400">
          No section data entered yet. Fill in the Bill page to see the
          preview.
        </p>
      )}

      {visible.map((section, i) => (
        <div key={section.title} className="space-y-3">
          <h2 className="text-lg font-bold">
            {i + 2}. {section.title}
          </h2>
          {section.content}
        </div>
      ))}
    </div>
  );
}