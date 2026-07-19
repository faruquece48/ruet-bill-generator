"use client";
import { Document, Page, View, Text, StyleSheet, Font } from "@react-pdf/renderer";
import type { ExaminationBillData } from "../types";
import {
  flattenPaperSetter,
  flattenClassTest,
  flattenAssignment,
  flattenCourseFile,
  flattenSessional,
  flattenBoardViva,
  flattenTabulation,
  deriveGradeSheetRows,
  groupByCourse,
  computeThesisVivaFormula,
  formatTeacher,
  formatTeacherOnly,
  buildExamLine,
} from "./pdfHelpers";

// No licensed Monotype Corsiva font file is bundled, so this falls back
// to Helvetica for the header line. To use a real cursive font later:
// add the .ttf to /public/fonts/, uncomment the Font.register call below,
// and set FONT_SCRIPT back to "MonotypeCorsiva".
// Font.register({ family: "MonotypeCorsiva", src: "/fonts/monotype-corsiva.ttf" });
const FONT_SCRIPT: string | undefined = undefined;

// Disable automatic word-hyphenation (e.g. "Professor" -> "Profes-sor").
// Returning the word unchanged as a single "syllable" tells react-pdf's
// layout engine never to break inside a word — it will wrap at the next
// whitespace instead.
Font.registerHyphenationCallback((word) => [word]);

const BORDER = "#000000";

const styles = StyleSheet.create({
  page: { paddingTop: 30, paddingBottom: 60, paddingHorizontal: 36, fontSize: 11, fontFamily: "Helvetica" },
  headerBlock: { textAlign: "center", marginBottom: 14 },
  scriptLine: { fontSize: 10, fontFamily: FONT_SCRIPT ?? "Helvetica-Oblique", marginBottom: 2 },
  deptLine: { fontSize: 11, marginBottom: 2 },
  titleLine: { fontSize: 11, fontWeight: 700, marginTop: 4 },
  billNo: {
    position: "absolute",
    top: 30,
    right: 36,
    borderWidth: 0.5,
    borderColor: BORDER,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 11,
    fontWeight: 700,
  },
  sectionTitle: { fontSize: 12, fontWeight: 700, marginTop: 14, marginBottom: 4 },
  table: { width: "100%", borderWidth: 0.5, borderColor: BORDER },
  row: { flexDirection: "row", width: "100%" },
  cell: { borderRightWidth: 0.5, borderTopWidth: 0.5, borderColor: BORDER, padding: 4, fontSize: 11, justifyContent: "center" },
  headerCell: { borderRightWidth: 0.5, borderTopWidth: 0.5, borderColor: BORDER, padding: 4, fontSize: 11, fontWeight: 700, justifyContent: "center" },
  center: { textAlign: "center" },
  footer: { position: "absolute", bottom: 24, left: 36, right: 36, textAlign: "center", fontSize: 11 },
});

interface Col {
  key: string;
  label: string;
  width: number;
  align?: "left" | "center" | "right";
}

function formatCell(value: any): string {
  if (value === true) return "Yes";
  if (value === false || value === "" || value === undefined || value === null) return "—";
  return String(value);
}

function SimpleTable({ columns, rows }: { columns: Col[]; rows: Record<string, any>[] }) {
  return (
    <View style={styles.table}>
      <View style={[styles.row, { borderTopWidth: 0 }]}>
        {columns.map((c, i) => (
          <View key={c.key} style={[styles.headerCell, { width: `${c.width}%`, borderTopWidth: 0 }, i === columns.length - 1 && { borderRightWidth: 0 }]}>
            <Text style={c.align === "center" || c.key === "sl" ? styles.center : undefined}>{c.label}</Text>
          </View>
        ))}
      </View>
      {rows.map((row, ri) => (
        <View style={styles.row} key={ri} wrap={false}>
          {columns.map((c, i) => (
            <View key={c.key} style={[styles.cell, { width: `${c.width}%` }, i === columns.length - 1 && { borderRightWidth: 0 }]}>
              <Text style={c.align === "center" || c.key === "sl" ? styles.center : undefined}>
                {c.key === "sl" ? String(ri + 1) : formatCell(row[c.key])}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
}

/**
 * GroupedTable: left column is the Course (spans the full height of the
 * group), middle section repeats one row per entry (e.g. Part A, Part B),
 * and an optional right-most groupColumn spans the full group height too
 * (e.g. a single merged "No. of Course File" value shared by every entry
 * in that course).
 */
function GroupedTable({
  courseWidth,
  entryColumns,
  groups,
  groupColumn,
}: {
  courseWidth: number;
  entryColumns: Col[];
  groups: { courseCode: string; courseTitle: string; entries: Record<string, any>[] }[];
  groupColumn?: {
    label: string;
    width: number;
    value: (group: { courseCode: string; courseTitle: string; entries: Record<string, any>[] }) => React.ReactNode;
  };
}) {
  const restTotal = entryColumns.reduce((s, c) => s + c.width, 0) || 1;
  const entriesWidth = 100 - courseWidth - (groupColumn?.width ?? 0);

  return (
    <View style={styles.table}>
      <View style={[styles.row, { borderTopWidth: 0 }]}>
        <View style={[styles.headerCell, { width: `${courseWidth}%`, borderTopWidth: 0 }, !groupColumn && entryColumns.length === 0 && { borderRightWidth: 0 }]}>
          <Text>Course No. &amp; Title</Text>
        </View>
        {entryColumns.map((c, i) => (
          <View
            key={c.key}
            style={[
              styles.headerCell,
              { width: `${c.width}%`, borderTopWidth: 0 },
              i === entryColumns.length - 1 && !groupColumn && { borderRightWidth: 0 },
            ]}
          >
            <Text style={c.align === "center" ? styles.center : undefined}>{c.label}</Text>
          </View>
        ))}
        {groupColumn && (
          <View style={[styles.headerCell, { width: `${groupColumn.width}%`, borderTopWidth: 0, borderRightWidth: 0 }]}>
            <Text style={styles.center}>{groupColumn.label}</Text>
          </View>
        )}
      </View>
      {groups.map((group, gi) => (
        <View style={styles.row} key={gi} wrap={false}>
          <View style={[styles.cell, { width: `${courseWidth}%` }]}>
            <Text style={{ fontWeight: 700 }}>{group.courseCode}</Text>
            <Text>{group.courseTitle}</Text>
          </View>
          <View style={{ width: `${entriesWidth}%` }}>
            {group.entries.map((entry, ei) => (
              <View key={ei} style={{ flexDirection: "row", borderTopWidth: 0.5, borderColor: BORDER }}>
                {entryColumns.map((c, ci) => (
                  <View
                    key={c.key}
                    style={[
                      styles.cell,
                      { width: `${(c.width / restTotal) * 100}%`, borderTopWidth: 0 },
                      ci === entryColumns.length - 1 && !groupColumn && { borderRightWidth: 0 },
                    ]}
                  >
                    <Text style={c.align === "center" ? styles.center : undefined}>{formatCell(entry[c.key])}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
          {groupColumn && (
            <View
              style={[
                styles.cell,
                { width: `${groupColumn.width}%`, justifyContent: "center", alignItems: "center", borderRightWidth: 0 },
              ]}
            >
              <Text style={styles.center}>{groupColumn.value(group)}</Text>
            </View>
          )}
        </View>
      ))}
    </View>
  );
}

function MergedColumnTable({
  columns,
  rows,
  mergeKey,
  mergeValue,
}: {
  columns: Col[];
  rows: Record<string, any>[];
  mergeKey: string;
  mergeValue: React.ReactNode;
}) {
  const mergeCol = columns.find((c) => c.key === mergeKey)!;
  const mergeIndex = columns.findIndex((c) => c.key === mergeKey);
  const leftCols = columns.slice(0, mergeIndex);
  const rightCols = columns.slice(mergeIndex + 1);
  const leftTotal = leftCols.reduce((s, c) => s + c.width, 0) || 1;
  const rightTotal = rightCols.reduce((s, c) => s + c.width, 0) || 1;
  const hasLeft = leftCols.length > 0;
  const hasRight = rightCols.length > 0;

  return (
    <View style={styles.table}>
      <View style={[styles.row, { borderTopWidth: 0 }]}>
        {columns.map((c, i) => (
          <View key={c.key} style={[styles.headerCell, { width: `${c.width}%`, borderTopWidth: 0 }, i === columns.length - 1 && { borderRightWidth: 0 }]}>
            <Text style={c.align === "center" || c.key === "sl" ? styles.center : undefined}>{c.label}</Text>
          </View>
        ))}
      </View>
      <View style={{ flexDirection: "row" }}>
        {hasLeft && (
          <View style={{ width: `${leftTotal}%` }}>
            {rows.map((row, ri) => (
              <View key={ri} style={{ flexDirection: "row", borderTopWidth: 0.5, borderColor: BORDER }} wrap={false}>
                {leftCols.map((c) => (
                  <View key={c.key} style={[styles.cell, { width: `${(c.width / leftTotal) * 100}%`, borderTopWidth: 0 }]}>
                    <Text style={c.key === "sl" ? styles.center : undefined}>
                      {c.key === "sl" ? String(ri + 1) : formatCell(row[c.key])}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
        <View
          style={[
            styles.cell,
            { width: `${mergeCol.width}%`, justifyContent: "center", alignItems: "center", borderTopWidth: 0.5 },
            !hasRight && { borderRightWidth: 0 },
          ]}
        >
          <Text style={styles.center}>{mergeValue ?? "—"}</Text>
        </View>
        {hasRight && (
          <View style={{ width: `${rightTotal}%` }}>
            {rows.map((row, ri) => (
              <View key={ri} style={{ flexDirection: "row", borderTopWidth: 0.5, borderColor: BORDER }} wrap={false}>
                {rightCols.map((c, ci) => (
                  <View
                    key={c.key}
                    style={[styles.cell, { width: `${(c.width / rightTotal) * 100}%`, borderTopWidth: 0 }, ci === rightCols.length - 1 && { borderRightWidth: 0 }]}
                  >
                    <Text>{formatCell(row[c.key])}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function Footer({ bill }: { bill: ExaminationBillData["billInfo"] }) {
  return (
    <View style={styles.footer} fixed>
      <Text>Chairman</Text>
      <Text>Examination Committee</Text>
      <Text>{buildExamLine(bill)}</Text>
      <Text>RUET, Rajshahi</Text>
    </View>
  );
}

export default function BillPdfDocument({ bill }: { bill: ExaminationBillData }) {
  const isBacklog = bill.billInfo.examType === "backlog";
  const isThesisApplicable = bill.billInfo.year === "4th Year" && bill.billInfo.semester === "Even";
  const isVerificationApplicable = bill.billInfo.hasGraduatingStudents === "yes";
  const isCourseCoordinatorApplicable = isThesisApplicable;

  const allCourseDuties = [...bill.courseDuties.obe, ...bill.courseDuties.nonObe];
  const paperSetterRows = flattenPaperSetter(allCourseDuties);
  const classTestRows = flattenClassTest(allCourseDuties);
  const assignmentRows = flattenAssignment(allCourseDuties);
  const courseFileRows = flattenCourseFile(allCourseDuties, bill.sessionalDuties);
  const sessionalRows = flattenSessional(bill.sessionalDuties);
  const boardVivaRows = flattenBoardViva(bill.sessionalDuties);
  const tabulationRows = flattenTabulation(bill.studentDuties);
  const gradeSheetRows = deriveGradeSheetRows(bill.studentDuties);
  const allScrutiny = [...bill.scrutinies.obe, ...bill.scrutinies.nonObe];

  const paperSetterGroups = groupByCourse(paperSetterRows);
  const classTestGroups = groupByCourse(classTestRows);
  const assignmentGroups = groupByCourse(assignmentRows);
  const courseFileGroups = groupByCourse(courseFileRows);

  const thesisVivaFormula = computeThesisVivaFormula(boardVivaRows, bill.thesisTeachers);
  const lw = bill.layoutSettings;

  // Committee: merge department into the name/designation line, matching
  // every other table in the document (formatTeacher already does this).
  const committeeRows = bill.committees.map((m) => ({
    teacherLine: formatTeacher(m.name, m.designation, m.department),
    role: m.role,
  }));

  type Section = { title: string; hasData: boolean; content: React.ReactNode; includeInBacklog: boolean };

  const sections: Section[] = [
    {
      title: "Examination Committee",
      hasData: bill.committees.some((m) => m.name.trim() !== ""),
      includeInBacklog: true,
      content: (
        <SimpleTable
          columns={[
            { key: "sl", label: "", width: lw.committee.sl ?? 8, align: "center" },
            { key: "teacherLine", label: "Name of Teachers & Designation", width: (lw.committee.teacherLine ?? 44) + (lw.committee.department ?? 28) },
            { key: "role", label: "Role", width: lw.committee.role ?? 20, align: "center" },
          ]}
          rows={committeeRows}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Paper Setter & Examiner",
      hasData: paperSetterRows.length > 0,
      includeInBacklog: true,
      content: (
        <GroupedTable
          courseWidth={lw.paperSetter.course ?? 30}
          entryColumns={[
            { key: "part", label: "Part", width: lw.paperSetter.part ?? 8, align: "center" },
            { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.paperSetter.teacherLine ?? 37 },
            { key: "paperSetCount", label: "No. of Paper Set", width: lw.paperSetter.paperSetCount ?? 12, align: "center" },
            { key: "scriptExamined", label: "No. of Script Examined", width: lw.paperSetter.scriptExamined ?? 13, align: "center" },
          ]}
          groups={paperSetterGroups}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Class Test",
      hasData: classTestRows.length > 0,
      includeInBacklog: false,
      content: (
        <GroupedTable
          courseWidth={lw.classTest.course ?? 30}
          entryColumns={[
            { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.classTest.teacherLine ?? 40 },
            { key: "classTestCount", label: "No. of Class Test", width: lw.classTest.classTestCount ?? 15, align: "center" },
            { key: "students", label: "No. of Students", width: lw.classTest.students ?? 15, align: "center" },
          ]}
          groups={classTestGroups}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Assignment",
      hasData: assignmentRows.length > 0,
      includeInBacklog: false,
      content: (
        <GroupedTable
          courseWidth={lw.assignment.course ?? 35}
          entryColumns={[
            { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.assignment.teacherLine ?? 45 },
            { key: "assignmentValue", label: "No. of Class Assignment", width: lw.assignment.assignmentValue ?? 20, align: "center" },
          ]}
          groups={assignmentGroups}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Course File",
      hasData: courseFileRows.length > 0,
      includeInBacklog: false,
      content: (
        <GroupedTable
          courseWidth={lw.courseFile.course ?? 35}
          entryColumns={[{ key: "teacherLine", label: "Name of Teachers & Designation", width: lw.courseFile.teacherLine ?? 50 }]}
          groupColumn={{
            label: "No. of Course File",
            width: lw.courseFile.courseFileCount ?? 15,
            value: () => "01",
          }}
          groups={courseFileGroups}
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
        <SimpleTable
          columns={[
            { key: "sl", label: "Sl. No.", width: lw.questionWork.sl ?? 10, align: "center" },
            { key: "teacherLine", label: "Name of The Teachers & Designation", width: lw.questionWork.teacherLine ?? 65 },
            { key: "questionNumber", label: "No. of Question", width: lw.questionWork.questionNumber ?? 25, align: "center" },
          ]}
          rows={bill.questionWorks.map((q) => ({
            teacherLine: formatTeacher(q.name, q.designation, q.department),
            questionNumber: q.questionNumber,
          }))}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Scrutiny",
      hasData: allScrutiny.length > 0,
      includeInBacklog: true,
      content: (
        <SimpleTable
          columns={[
            { key: "sl", label: "Sl. No.", width: lw.scrutinyObe.sl ?? 10, align: "center" },
            { key: "teacherLine", label: "Name of The Teachers & Designation", width: lw.scrutinyObe.teacherLine ?? 65 },
            { key: "scriptCount", label: "No. of Script", width: lw.scrutinyObe.scriptCount ?? 25, align: "center" },
          ]}
          rows={allScrutiny.map((s) => ({
            teacherLine: formatTeacher(s.name, s.designation, s.department),
            scriptCount: s.scriptCount,
          }))}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Sessional",
      hasData: sessionalRows.length > 0,
      includeInBacklog: false,
      content: (
        <SimpleTable
          columns={[
            { key: "sl", label: "Sl.", width: lw.sessionalDuty.sl ?? 8, align: "center" },
            { key: "courseCode", label: "Course No. & Title", width: lw.sessionalDuty.courseCode ?? 27 },
            { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.sessionalDuty.teacherLine ?? 45 },
            { key: "students", label: "No. of Students", width: lw.sessionalDuty.students ?? 20, align: "center" },
          ]}
          rows={sessionalRows.map((r) => ({
            courseCode: `${r.courseCode}\n${r.courseTitle}`,
            teacherLine: r.teacherLine,
            students: r.students,
          }))}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Board Viva",
      hasData: boardVivaRows.length > 0,
      includeInBacklog: true,
      content: (
        <SimpleTable
          columns={[
            { key: "sl", label: "Sl. No.", width: lw.studentDuty.sl ?? 10, align: "center" },
            { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.studentDuty.teacherLine ?? 65 },
            { key: "students", label: "No. of Students", width: lw.studentDuty.students ?? 25, align: "center" },
          ]}
          rows={boardVivaRows}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Tabulation",
      hasData: tabulationRows.length > 0,
      includeInBacklog: true,
      content: (
        <SimpleTable
          columns={[
            { key: "sl", label: "Sl. No.", width: lw.studentDuty.sl ?? 10, align: "center" },
            { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.studentDuty.teacherLine ?? 65 },
            { key: "students", label: "No. of Students", width: lw.studentDuty.students ?? 25, align: "center" },
          ]}
          rows={tabulationRows}
        />
      ),
    },
    {
      title: isBacklog
        ? "List of Teachers Associated with Grade Sheet Preparation & Verification"
        : "List of Teachers Associated with Grade Sheet Preparation",
      hasData: gradeSheetRows.length > 0,
      includeInBacklog: true,
      content: (
        <SimpleTable
          columns={[
            { key: "sl", label: "Sl. No.", width: lw.studentDuty.sl ?? 10, align: "center" },
            { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.studentDuty.teacherLine ?? 65 },
            { key: "studentsDisplay", label: "No. of Students", width: lw.studentDuty.students ?? 25, align: "center" },
          ]}
          rows={gradeSheetRows}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Grade Sheet Verification",
      hasData: !isBacklog && gradeSheetRows.length > 0,
      includeInBacklog: false,
      content: (
        <SimpleTable
          columns={[
            { key: "sl", label: "Sl. No.", width: lw.studentDuty.sl ?? 10, align: "center" },
            { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.studentDuty.teacherLine ?? 65 },
            { key: "studentsDisplay", label: "No. of Students", width: lw.studentDuty.students ?? 25, align: "center" },
          ]}
          rows={gradeSheetRows}
        />
      ),
    },
    {
      title: "List of Course Advisers",
      hasData: bill.courseAdvisers.length > 0,
      includeInBacklog: false,
      content: (
        <SimpleTable
          columns={[
            { key: "sl", label: "Sl. No.", width: lw.courseAdviser.sl ?? 10, align: "center" },
            { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.courseAdviser.teacherLine ?? 65 },
            { key: "students", label: "No. of Students", width: lw.courseAdviser.students ?? 25, align: "center" },
          ]}
          rows={bill.courseAdvisers.map((a) => ({
            teacherLine: formatTeacher(a.name, a.designation, a.department),
            students: a.students,
          }))}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Course Coordinator",
      hasData: isCourseCoordinatorApplicable && bill.courseCoordinatorTeachers.length > 0,
      includeInBacklog: false,
      content: (
        <SimpleTable
          columns={[
            { key: "sl", label: "Sl. No.", width: lw.courseCoordinator.sl ?? 10, align: "center" },
            { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.courseCoordinator.teacherLine ?? 90 },
          ]}
          rows={bill.courseCoordinatorTeachers.map((t) => ({
            teacherLine: formatTeacher(t.name, t.designation, t.department),
          }))}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Thesis/Project Examination",
      hasData: isThesisApplicable && bill.thesisTeachers.length > 0,
      includeInBacklog: false,
      content: (
        <MergedColumnTable
          columns={[
            { key: "sl", label: "Sl. No.", width: lw.thesis.sl ?? 8 },
            { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.thesis.teacherLine ?? 42 },
            { key: "supervisorCount", label: "Supervisor", width: lw.thesis.supervisorCount ?? 12, align: "center" },
            { key: "examinerCount", label: "Thesis Examiner", width: lw.thesis.examinerCount ?? 13, align: "center" },
            { key: "thesisViva", label: "Thesis Viva", width: lw.thesis.thesisViva ?? 25, align: "center" },
          ]}
          rows={bill.thesisTeachers.map((t) => ({
            teacherLine: formatTeacher(t.name, t.designation, t.department),
            supervisorCount: t.supervisorCount,
            examinerCount: t.examinerCount,
          }))}
          mergeKey="thesisViva"
          mergeValue={thesisVivaFormula || "—"}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Verification of Final Result",
      hasData: isVerificationApplicable && bill.verificationTeachers.length > 0,
      includeInBacklog: true,
      content: (
        <MergedColumnTable
          columns={[
            { key: "sl", label: "Sl. No.", width: lw.verification.sl ?? 10 },
            { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.verification.teacherLine ?? 65 },
            { key: "students", label: "No. of Students", width: lw.verification.students ?? 25 },
          ]}
          rows={bill.verificationTeachers.map((t) => ({
            teacherLine: formatTeacher(t.name, t.designation, t.department),
          }))}
          mergeKey="students"
          mergeValue={bill.verificationStudentCount || "—"}
        />
      ),
    },
  ];

  const visible = sections.filter((s) => {
    if (!s.hasData) return false;
    if (isBacklog && !s.includeInBacklog) return false;
    return true;
  });

  return (
    <Document>
      <Page size="LEGAL" style={styles.page} wrap>
        <View style={styles.billNo}>
          <Text>Bill No.: {bill.billInfo.billNo || "—"}</Text>
        </View>
        <View style={styles.headerBlock}>
          <Text style={styles.scriptLine}>Heaven's Light is Our Guide</Text>
          <Text style={styles.deptLine}>Department of Building Engineering &amp; Construction Management</Text>
          <Text style={styles.deptLine}>Rajshahi University of Engineering &amp; Technology</Text>
          <Text style={styles.titleLine}>
            {bill.billInfo.examination || "B.Sc. Engineering"} {bill.billInfo.year}{" "}
            {bill.billInfo.examType === "semester" ? `${bill.billInfo.semester} Semester Examination` : "Backlog Examination"}-
            {bill.billInfo.examYear} (Series {bill.billInfo.series})
          </Text>
        </View>

        {visible.map((section, i) => (
          <View key={section.title} style={{ marginBottom: 6 }}>
            <Text style={styles.sectionTitle}>
              {i + 1}. {section.title}
            </Text>
            {section.content}
          </View>
        ))}

        <Footer bill={bill.billInfo} />
      </Page>
    </Document>
  );
}