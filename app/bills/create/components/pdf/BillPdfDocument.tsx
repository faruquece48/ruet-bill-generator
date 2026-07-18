import { Document, Page, View, Text, StyleSheet } from "@react-pdf/renderer";
import type { ExaminationBillData } from "../types";
import {
  buildExamLine,
  buildFullTitle,
  formatTeacher,
  flattenPaperSetter,
  flattenClassTest,
  flattenAssignment,
  flattenCourseFile,
  flattenSessional,
  flattenBoardViva,
  flattenTabulation,
  deriveGradeSheetRows,
} from "./pdfHelpers";

interface Props {
  bill: ExaminationBillData;
}

// ------------------------------
// Styles
// NOTE on "Heaven's Light is Our Guide": the spec calls for the Monotype
// Corsiva font at 10pt italic. Monotype Corsiva is a proprietary Microsoft
// font and can't legally be bundled or fetched from a CDN, so this uses
// react-pdf's built-in "Times-Italic" as a close italic-script stand-in.
// To use the real font: Font.register({ family: "Monotype Corsiva", src:
// "<url-or-path-to-your-licensed-ttf>" }) at the top of this file, then
// swap fontFamily below to "Monotype Corsiva".
// ------------------------------
const styles = StyleSheet.create({
  page: {
    padding: 32,
    fontSize: 11,
    fontFamily: "Times-Roman",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  corsivaLine: {
    fontFamily: "Times-Italic",
    fontStyle: "italic",
    fontSize: 10,
  },
  billNoLine: {
    fontSize: 11,
  },
  centerBlock: {
    alignItems: "center",
    textAlign: "center",
  },
  deptLine: {
    fontSize: 11,
  },
  boldTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 4,
    marginBottom: 10,
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 4,
  },
  noDataLabel: {
    fontSize: 10,
    color: "#666",
    marginBottom: 6,
  },
  table: {
    borderTop: 0.75,
    borderLeft: 0.75,
    borderColor: "#000",
  },
  tableRow: {
    flexDirection: "row",
  },
  headerCell: {
    fontSize: 11,
    fontWeight: 700,
    padding: 4,
    borderRight: 0.75,
    borderBottom: 0.75,
    borderColor: "#000",
    backgroundColor: "#f0f0f0",
  },
  cell: {
    fontSize: 11,
    padding: 4,
    borderRight: 0.75,
    borderBottom: 0.75,
    borderColor: "#000",
  },
  footer: {
    position: "absolute",
    bottom: 24,
    left: 32,
    right: 32,
    textAlign: "center",
    fontSize: 9,
  },
});

// ------------------------------
// Generic table renderer
// ------------------------------
interface Column {
  key: string;
  label: string;
  width: number; // percentage
}

function Table({
  columns,
  rows,
  showSerial,
}: {
  columns: Column[];
  rows: Record<string, any>[];
  showSerial?: boolean;
}) {
  return (
    <View style={styles.table}>
      <View style={styles.tableRow}>
        {columns.map((c) => (
          <Text
            key={c.key}
            style={[styles.headerCell, { width: `${c.width}%` }]}
          >
            {c.label}
          </Text>
        ))}
      </View>
      {rows.map((row, i) => (
        <View style={styles.tableRow} key={i}>
          {columns.map((c) => (
            <Text key={c.key} style={[styles.cell, { width: `${c.width}%` }]}>
              {c.key === "sl" && showSerial
                ? String(i + 1).padStart(2, "0") + "."
                : formatCell(row[c.key])}
            </Text>
          ))}
        </View>
      ))}
    </View>
  );
}

function formatCell(value: any): string {
  if (value === true) return "Yes";
  if (value === false) return "";
  if (value === "" || value === undefined || value === null) return "";
  return String(value);
}

// Column width lookup: falls back to an even split if a key is missing
// from layoutSettings, so the PDF never crashes on incomplete settings.
function widthsFor(
  columns: { key: string; label: string }[],
  layout: Record<string, number> | undefined
): Column[] {
  const fallback = Math.floor(100 / columns.length);
  return columns.map((c, i) => ({
    ...c,
    width:
      layout && layout[c.key] !== undefined
        ? layout[c.key]
        : i === columns.length - 1
        ? 100 - fallback * (columns.length - 1)
        : fallback,
  }));
}

function teacherLine(name: string, designation: string, department: string) {
  return formatTeacher(name, designation as any, department);
}

export default function BillPdfDocument({ bill }: Props) {
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

  const committeeRows = bill.committees.map((m) => ({
    ...m,
    teacherLine: teacherLine(m.name, m.designation, m.department),
  }));
  const questionWorkRows = bill.questionWorks.map((q) => ({
    ...q,
    teacherLine: teacherLine(q.name, q.designation, q.department),
  }));
  const scrutinyRows = allScrutiny.map((s) => ({
    ...s,
    teacherLine: teacherLine(s.name, s.designation, s.department),
  }));
  const courseAdviserRows = bill.courseAdvisers.map((a) => ({
    ...a,
    teacherLine: teacherLine(a.name, a.designation, a.department),
  }));
  const courseCoordinatorRows = bill.courseCoordinatorTeachers.map((t) => ({
    ...t,
    teacherLine: teacherLine(t.name, t.designation, t.department),
  }));
  const thesisRows = bill.thesisTeachers.map((t) => ({
    ...t,
    teacherLine: teacherLine(t.name, t.designation, t.department),
    attendsViva: t.attendsViva ? "Yes" : "",
  }));
  const verificationRows = bill.verificationTeachers.map((t) => ({
    ...t,
    teacherLine: teacherLine(t.name, t.designation, t.department),
  }));

  const layout = bill.layoutSettings;

  type Section = {
    title: string;
    hasData: boolean;
    includeInBacklog: boolean;
    content: React.ReactNode;
  };

  const sections: Section[] = [
    {
      title: "Examination Committee",
      hasData: committeeRows.some((m) => m.name.trim() !== ""),
      includeInBacklog: true,
      content: (
        <Table
          columns={widthsFor(
            [
              { key: "sl", label: "Sl." },
              { key: "teacherLine", label: "Name of Teachers & Designation" },
              { key: "department", label: "Department" },
              { key: "role", label: "Role" },
            ],
            layout.committee
          )}
          rows={committeeRows}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Paper Setter & Examiner",
      hasData: paperSetterRows.length > 0,
      includeInBacklog: true,
      content: (
        <Table
          columns={widthsFor(
            [
              { key: "courseCode", label: "Course No. & Title" },
              { key: "part", label: "Part" },
              {
                key: "teacherLine",
                label: "Name of Teachers & Designation",
              },
              { key: "paperSetCount", label: "No. of Paper Set" },
              { key: "scriptExamined", label: "No. of Script Examined" },
            ],
            layout.courseDutyObe
          )}
          rows={paperSetterRows}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Class Test",
      hasData: classTestRows.length > 0,
      includeInBacklog: false,
      content: (
        <Table
          columns={widthsFor(
            [
              { key: "courseCode", label: "Course No. & Title" },
              {
                key: "teacherLine",
                label: "Name of Teachers & Designation",
              },
              { key: "classTestCount", label: "No. of Class Test" },
              { key: "students", label: "No. of Students" },
            ],
            layout.courseDutyObe
          )}
          rows={classTestRows}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Assignment",
      hasData: assignmentRows.length > 0,
      includeInBacklog: false,
      content: (
        <Table
          columns={widthsFor(
            [
              { key: "courseCode", label: "Course No. & Title" },
              {
                key: "teacherLine",
                label: "Name of Teachers & Designation",
              },
              { key: "assignmentValue", label: "No. of Class Assignment" },
            ],
            layout.courseDutyObe
          )}
          rows={assignmentRows}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Course File",
      hasData: courseFileRows.length > 0,
      includeInBacklog: false,
      content: (
        <Table
          columns={widthsFor(
            [
              { key: "courseCode", label: "Course No. & Title" },
              {
                key: "teacherLine",
                label: "Name of Teachers & Designation",
              },
            ],
            layout.courseDutyObe
          )}
          rows={courseFileRows}
        />
      ),
    },
    {
      title: isBacklog
        ? "List of Teachers Associated with Question Typing, Sketching & Printing"
        : "List of Teachers Associated with Question Typing, Sketching, Comparing & Printing",
      hasData: questionWorkRows.length > 0,
      includeInBacklog: true,
      content: (
        <Table
          columns={widthsFor(
            [
              { key: "sl", label: "Sl. No." },
              {
                key: "teacherLine",
                label: "Name of The Teachers & Designation",
              },
              { key: "questionNumber", label: "No. of Question" },
            ],
            layout.questionWork
          )}
          rows={questionWorkRows}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Scrutiny",
      hasData: scrutinyRows.length > 0,
      includeInBacklog: true,
      content: (
        <Table
          columns={widthsFor(
            [
              { key: "sl", label: "Sl. No." },
              {
                key: "teacherLine",
                label: "Name of The Teachers & Designation",
              },
              { key: "scriptCount", label: "No. of Script" },
            ],
            layout.scrutinyObe
          )}
          rows={scrutinyRows}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Sessional",
      hasData: sessionalRows.length > 0,
      includeInBacklog: false,
      content: (
        <Table
          columns={widthsFor(
            [
              { key: "courseCode", label: "Course No. & Title" },
              {
                key: "teacherLine",
                label: "Name of Teachers & Designation",
              },
              { key: "students", label: "No. of Students" },
            ],
            layout.sessionalDuty
          )}
          rows={sessionalRows}
        />
      ),
    },
    // Board Viva: appears purely based on whether board-viva data exists
    // (i.e. any student selected a sessional course), in both semester
    // and backlog modes. Numbering is automatic since it's inserted into
    // the same sequential list below.
    {
      title: "List of Teachers Associated with Board Viva",
      hasData: boardVivaRows.length > 0,
      includeInBacklog: true,
      content: (
        <Table
          columns={widthsFor(
            [
              { key: "sl", label: "Sl. No." },
              {
                key: "teacherLine",
                label: "Name of Teachers & Designation",
              },
              { key: "students", label: "No. of Students" },
            ],
            layout.studentDuty
          )}
          rows={boardVivaRows}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Tabulation",
      hasData: tabulationRows.length > 0,
      includeInBacklog: true,
      content: (
        <Table
          columns={widthsFor(
            [
              { key: "sl", label: "Sl. No." },
              {
                key: "teacherLine",
                label: "Name of Teachers & Designation",
              },
              { key: "students", label: "No. of Students" },
            ],
            layout.studentDuty
          )}
          rows={tabulationRows}
          showSerial
        />
      ),
    },
    // Grade Sheet Preparation & Verification: backlog mode merges these
    // into ONE section (matching your fixed 7-item list); semester mode
    // keeps them as two separate sections, both pulling the same
    // tabulation-derived, ÷3 data.
    ...(isBacklog
      ? [
          {
            title:
              "List of Teachers Associated with Grade Sheet Preparation & Verification",
            hasData: gradeSheetRows.length > 0,
            includeInBacklog: true,
            content: (
              <Table
                columns={widthsFor(
                  [
                    { key: "sl", label: "Sl. No." },
                    {
                      key: "teacherLine",
                      label: "Name of Teachers & Designation",
                    },
                    { key: "studentsDisplay", label: "No. of Students" },
                  ],
                  layout.studentDuty
                )}
                rows={gradeSheetRows}
                showSerial
              />
            ),
          } as Section,
        ]
      : [
          {
            title: "List of Teachers Associated with Grade Sheet Preparation",
            hasData: gradeSheetRows.length > 0,
            includeInBacklog: true,
            content: (
              <Table
                columns={widthsFor(
                  [
                    { key: "sl", label: "Sl. No." },
                    {
                      key: "teacherLine",
                      label: "Name of Teachers & Designation",
                    },
                    { key: "studentsDisplay", label: "No. of Students" },
                  ],
                  layout.studentDuty
                )}
                rows={gradeSheetRows}
                showSerial
              />
            ),
          } as Section,
          {
            title: "List of Teachers Associated with Grade Sheet Verification",
            hasData: gradeSheetRows.length > 0,
            includeInBacklog: true,
            content: (
              <Table
                columns={widthsFor(
                  [
                    { key: "sl", label: "Sl. No." },
                    {
                      key: "teacherLine",
                      label: "Name of Teachers & Designation",
                    },
                    { key: "studentsDisplay", label: "No. of Students" },
                  ],
                  layout.studentDuty
                )}
                rows={gradeSheetRows}
                showSerial
              />
            ),
          } as Section,
        ]),
    {
      title: "List of Course Advisers",
      hasData: courseAdviserRows.length > 0,
      includeInBacklog: false,
      content: (
        <Table
          columns={widthsFor(
            [
              { key: "sl", label: "Sl. No." },
              {
                key: "teacherLine",
                label: "Name of Teachers & Designation",
              },
              { key: "students", label: "No. of Students" },
            ],
            layout.courseAdviser
          )}
          rows={courseAdviserRows}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Course Coordinator",
      hasData: isCourseCoordinatorApplicable && courseCoordinatorRows.length > 0,
      includeInBacklog: false,
      content: (
        <Table
          columns={widthsFor(
            [
              { key: "sl", label: "Sl. No." },
              {
                key: "teacherLine",
                label: "Name of Teachers & Designation",
              },
            ],
            layout.courseCoordinator
          )}
          rows={courseCoordinatorRows}
          showSerial
        />
      ),
    },
    {
      title: "List of Teachers Associated with Thesis/Project Examination",
      hasData: isThesisApplicable && thesisRows.length > 0,
      includeInBacklog: false,
      content: (
        <Table
          columns={widthsFor(
            [
              { key: "sl", label: "Sl. No." },
              {
                key: "teacherLine",
                label: "Name of Teachers & Designation",
              },
              { key: "supervisorCount", label: "Supervisor" },
              { key: "examinerCount", label: "Thesis Examiner" },
              { key: "attendsViva", label: "Thesis Viva" },
            ],
            layout.thesis
          )}
          rows={thesisRows}
          showSerial
        />
      ),
    },
    // Verification of Final Result: always the last section, applies in
    // both semester and backlog exams, gated only by hasGraduatingStudents
    // (from the Bill Information page).
    {
      title: "List of Teachers Associated with Verification of Final Result",
      hasData: isVerificationApplicable && verificationRows.length > 0,
      includeInBacklog: true,
      content: (
        <>
          {bill.verificationStudentCount && (
            <Text style={styles.noDataLabel}>
              No. of Students: {bill.verificationStudentCount}
            </Text>
          )}
          <Table
            columns={widthsFor(
              [
                { key: "sl", label: "Sl. No." },
                {
                  key: "teacherLine",
                  label: "Name of Teachers & Designation",
                },
              ],
              layout.verification
            )}
            rows={verificationRows}
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

  const examLine = buildExamLine(bill.billInfo);
  const fullTitle = buildFullTitle(bill.billInfo);

  return (
    <Document>
      <Page size="LEGAL" style={styles.page} wrap>
        <View style={styles.headerRow}>
          <Text style={styles.corsivaLine}>Heaven&apos;s Light is Our Guide</Text>
          <Text style={styles.billNoLine}>
            Bill No.: {bill.billInfo.billNo || ""}
          </Text>
        </View>
        <View style={styles.centerBlock}>
          <Text style={styles.deptLine}>
            Department of Building Engineering &amp; Construction Management
          </Text>
          <Text style={styles.deptLine}>
            Rajshahi University of Engineering &amp; Technology
          </Text>
        </View>
        <Text style={styles.boldTitle}>{fullTitle}</Text>

        {visible.length === 0 && (
          <Text style={styles.noDataLabel}>
            No section data entered yet.
          </Text>
        )}

        {visible.map((section, i) => (
          <View key={section.title} wrap={false}>
            <Text style={styles.sectionTitle}>
              {i + 1}. {section.title}
            </Text>
            {section.content}
          </View>
        ))}

        <Text style={styles.footer} fixed>
          Chairman{"\n"}Examination Committee{"\n"}
          {examLine}
          {"\n"}RUET, Rajshahi
        </Text>
      </Page>
    </Document>
  );
}