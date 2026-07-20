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
  formatDesignationDept,
  buildExamLine,
} from "./pdfHelpers";

// Place your Monotype Corsiva (or licensed cursive equivalent) .ttf at
// /public/fonts/monotype-corsiva.ttf. If it isn't present, delete the
// Font.register call and set FONT_SCRIPT to undefined.
Font.register({ family: "MonotypeCorsiva", src: "/fonts/monotype-corsiva.ttf" });
const FONT_SCRIPT: string | undefined = "MonotypeCorsiva";

const BORDER = "#000000";

const styles = StyleSheet.create({
  page: { paddingTop: 30, paddingBottom: 60, paddingHorizontal: 36, fontSize: 11, fontFamily: "Helvetica" },
  headerBlock: { textAlign: "center", marginBottom: 14 },
  scriptLine: { fontSize: 10, fontFamily: FONT_SCRIPT ?? "MonotypeCorsiva", marginBottom: 2 },
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
<<<<<<< Updated upstream
  cell: { borderRightWidth: BW, borderColor: BORDER, padding: 4, fontSize: 11, justifyContent: "center" },
  headerCell: {
    borderRightWidth: BW,
    borderColor: BORDER,
    padding: 4,
    fontSize: 11,
    fontWeight: 700,
    justifyContent: "center",
  },
  cellLeftEdge: { borderLeftWidth: BW },
  rowTopEdge: { borderTopWidth: BW, borderBottomWidth: BW, borderColor: BORDER },
  cellBottomEdge: { borderBottomWidth: BW },
  center: { textAlign: "center" },
  // Right-corner footer block: fixed width, anchored to the bottom-right,
  // text centered within that block. A blank spacer sits above "Chairman"
  // to leave room for an actual pen signature.
  footer: { position: "absolute", bottom: 24, right: 36, width: 190, textAlign: "center", fontSize: 11 },
  signatureSpace: { height: 14 },
=======
  cell: { borderRightWidth: 0.5, padding: 4, fontSize: 11, justifyContent: "center" },
  headerCell: { borderRightWidth: 0.5, padding: 4, fontSize: 11, fontWeight: 400, justifyContent: "center" },
  center: { textAlign: "center" },
  footer: { position: "absolute", bottom: 24, left: 36, right: 36, textAlign: "center", fontSize: 11 },
>>>>>>> Stashed changes
});

interface Col {
  key: string;
  label: string;
  width: number;
  align?: "left" | "center" | "right";
}

<<<<<<< Updated upstream
/**
 * Layout settings are relative column weights, not fixed percentages. This
 * keeps every table exactly as wide as its printable container even when a
 * saved layout's values do not add up to 100.
 */
function normalizeColumns(columns: Col[]): Col[] {
  if (columns.length === 0) return columns;

  const total = columns.reduce((sum, column) => sum + Math.max(0, column.width), 0);
  if (total <= 0) {
    return columns.map((column) => ({ ...column, width: 100 / columns.length }));
  }
  return columns.map((column) => ({ ...column, width: (Math.max(0, column.width) / total) * 100 }));
}

=======
>>>>>>> Stashed changes
function formatCell(value: any): string {
  if (value === true) return "Yes";
  if (value === false || value === "" || value === undefined || value === null) return "—";
  return String(value);
}

// Header row + body rows, single horizontal line between each row, single
// vertical line between each column. No wrap={false} on the outer table so
// react-pdf can naturally close/reopen the border across a page break.
function SimpleTable({ columns, rows }: { columns: Col[]; rows: Record<string, any>[] }) {
  const normalizedColumns = normalizeColumns(columns);

  return (
    <View style={styles.table}>
<<<<<<< Updated upstream
      <View style={[styles.row, styles.rowTopEdge]} wrap={false}>
        {normalizedColumns.map((c, i) => (
          <View key={c.key} style={[styles.headerCell, { width: `${c.width}%` }, i === 0 ? styles.cellLeftEdge : {}]}>
=======
      <View style={styles.row}>
        {columns.map((c, i) => (
          <View key={c.key} style={[styles.headerCell, { width: `${c.width}%` }, i === columns.length - 1 && { borderRightWidth: 0 }]}>
>>>>>>> Stashed changes
            <Text style={c.align === "center" || c.key === "sl" ? styles.center : undefined}>{c.label}</Text>
          </View>
        ))}
      </View>
      {rows.map((row, ri) => (
<<<<<<< Updated upstream
        <View style={[styles.row, styles.rowTopEdge]} key={ri} wrap={false}>
          {normalizedColumns.map((c, i) => (
            <View key={c.key} style={[styles.cell, { width: `${c.width}%` }, i === 0 ? styles.cellLeftEdge : {}, ri === rows.length - 1 ? styles.cellBottomEdge : {}]}>
=======
        <View key={ri} style={[styles.row, { borderTopWidth: 0.5, borderColor: BORDER }]} wrap={false}>
          {columns.map((c, i) => (
            <View key={c.key} style={[styles.cell, { width: `${c.width}%` }, i === columns.length - 1 && { borderRightWidth: 0 }]}>
>>>>>>> Stashed changes
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

// Grouped (merged course-cell) table. Single border system: the course
// cell and its entry rows are siblings in one flex row, sharing the same
// top border per group (not per entry), so there is exactly one line
// between groups and no separate boxes inside a group.
function GroupedTable({
  courseWidth,
  entryColumns,
  groups,
<<<<<<< Updated upstream
  groupMergeColumn,
=======
>>>>>>> Stashed changes
}: {
  courseWidth: number;
  entryColumns: Col[];
  groups: { courseCode: string; courseTitle: string; entries: Record<string, any>[] }[];
<<<<<<< Updated upstream
  groupMergeColumn?: { key: string; label: string; width: number; align?: "left" | "center" | "right"; value: () => React.ReactNode };
}) {
  const normalized = normalizeColumns([
    { key: "course", label: "Course No. & Title", width: courseWidth },
    ...entryColumns,
    ...(groupMergeColumn ? [groupMergeColumn] : []),
  ]);
  const normalizedCourseWidth = normalized[0].width;
  const normalizedEntryColumns = normalized.slice(1, 1 + entryColumns.length);
  const normalizedMergeColumn = groupMergeColumn ? normalized[normalized.length - 1] : undefined;
  const entryTotal = normalizedEntryColumns.reduce((sum, column) => sum + column.width, 0) || 1;

  return (
    <View style={styles.table}>
      <View style={[styles.row, styles.rowTopEdge]}>
        <View style={[styles.headerCell, { width: `${normalizedCourseWidth}%` }, styles.cellLeftEdge]}>
          <Text>Course No. &amp; Title</Text>
        </View>
        {normalizedEntryColumns.map((c) => (
          <View
            key={c.key}
            style={[
              styles.headerCell,
              { width: `${c.width}%` },
            ]}
          >
            <Text style={c.align === "center" ? styles.center : undefined}>{c.label}</Text>
          </View>
        ))}
        {normalizedMergeColumn && (
          <View style={[styles.headerCell, { width: `${normalizedMergeColumn.width}%` }]}>
            <Text style={normalizedMergeColumn.align === "center" ? styles.center : undefined}>
              {normalizedMergeColumn.label}
            </Text>
          </View>
        )}
      </View>

      {groups.map((group, gi) => (
        <View key={gi} style={[styles.row, styles.rowTopEdge, { alignItems: "stretch" }]} wrap={false}>
          <View style={[styles.cell, { width: `${normalizedCourseWidth}%`, justifyContent: "center" }, styles.cellLeftEdge, gi === groups.length - 1 ? styles.cellBottomEdge : {}]}>
            <Text>{group.courseCode}</Text>
            <Text>{group.courseTitle}</Text>
          </View>
          <View style={{ width: `${entryTotal}%` }}>
            {group.entries.map((entry, ei) => (
              <View
                key={ei}
                style={[{ flexDirection: "row" }, ei > 0 ? styles.rowTopEdge : {}]}
              >
                {normalizedEntryColumns.map((c) => (
=======
}) {
  const restTotal = entryColumns.reduce((s, c) => s + c.width, 0) || 1;

  return (
    <View style={styles.table}>
      <View style={styles.row}>
        <View style={[styles.headerCell, { width: `${courseWidth}%` }]}>
          <Text>Course No. &amp; Title</Text>
        </View>
        {entryColumns.map((c, i) => (
          <View key={c.key} style={[styles.headerCell, { width: `${c.width}%` }, i === entryColumns.length - 1 && { borderRightWidth: 0 }]}>
            <Text style={c.align === "center" ? styles.center : undefined}>{c.label}</Text>
          </View>
        ))}
      </View>

      {groups.map((group, gi) => (
        <View key={gi} style={[styles.row, { borderTopWidth: 0.5, borderColor: BORDER, alignItems: "stretch" }]} wrap={false}>
          <View style={[styles.cell, { width: `${courseWidth}%`, justifyContent: "center" }]}>
            <Text>{group.courseCode}</Text>
            <Text>{group.courseTitle}</Text>
          </View>
          <View style={{ width: `${100 - courseWidth}%` }}>
            {group.entries.map((entry, ei) => (
              <View
                key={ei}
                style={[
                  { flexDirection: "row" },
                  ei > 0 && { borderTopWidth: 0.5, borderColor: BORDER },
                ]}
              >
                {entryColumns.map((c, ci) => (
>>>>>>> Stashed changes
                  <View
                    key={c.key}
                    style={[
                      styles.cell,
<<<<<<< Updated upstream
                      { width: `${(c.width / entryTotal) * 100}%` },
                      gi === groups.length - 1 && ei === group.entries.length - 1 ? styles.cellBottomEdge : {},
=======
                      { width: `${(c.width / restTotal) * 100}%`, borderRightWidth: ci === entryColumns.length - 1 ? 0 : 0.5 },
>>>>>>> Stashed changes
                    ]}
                  >
                    <Text style={c.align === "center" ? styles.center : undefined}>{formatCell(entry[c.key])}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
<<<<<<< Updated upstream
          {normalizedMergeColumn && groupMergeColumn && (
            <View style={[styles.cell, { width: `${normalizedMergeColumn.width}%`, justifyContent: "center" }, gi === groups.length - 1 ? styles.cellBottomEdge : {}]}>
              <Text style={styles.center}>{groupMergeColumn.value()}</Text>
            </View>
          )}
=======
>>>>>>> Stashed changes
        </View>
      ))}
    </View>
  );
}

// Merged-column table (Thesis Viva formula, Verification student count).
// Both the left block and right block, plus every count column, respect
// their own `align` setting — this fixes Supervisor/Thesis Examiner not
// being centered previously.
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
  const normalizedColumns = normalizeColumns(columns);
  const mergeCol = normalizedColumns.find((c) => c.key === mergeKey)!;
  const mergeIndex = normalizedColumns.findIndex((c) => c.key === mergeKey);
  const leftCols = normalizedColumns.slice(0, mergeIndex);
  const rightCols = normalizedColumns.slice(mergeIndex + 1);
  const leftTotal = leftCols.reduce((s, c) => s + c.width, 0) || 1;
  const rightTotal = rightCols.reduce((s, c) => s + c.width, 0) || 1;

  const renderSideRow = (
    cols: Col[],
    total: number,
    row: Record<string, any>,
    ri: number,
    isFirstBlock: boolean
  ) => (
    <View key={ri} style={{ flexDirection: "row", borderTopWidth: 0.5, borderColor: BORDER }} wrap={false}>
      {cols.map((c, ci) => (
        <View
          key={c.key}
          style={[
            styles.cell,
            { width: `${(c.width / total) * 100}%` },
            !(isFirstBlock && ci === cols.length - 1) && ci === cols.length - 1 && { borderRightWidth: 0 },
          ]}
        >
          <Text style={c.align === "center" || c.key === "sl" ? styles.center : undefined}>
            {c.key === "sl" ? String(ri + 1) : formatCell(row[c.key])}
          </Text>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.table}>
<<<<<<< Updated upstream
      <View style={[styles.row, styles.rowTopEdge]} wrap={false}>
        {normalizedColumns.map((c, i) => (
          <View key={c.key} style={[styles.headerCell, { width: `${c.width}%` }, i === 0 ? styles.cellLeftEdge : {}]}>
=======
      <View style={styles.row}>
        {columns.map((c, i) => (
          <View key={c.key} style={[styles.headerCell, { width: `${c.width}%` }, i === columns.length - 1 && { borderRightWidth: 0 }]}>
>>>>>>> Stashed changes
            <Text style={c.align === "center" || c.key === "sl" ? styles.center : undefined}>{c.label}</Text>
          </View>
        ))}
      </View>
<<<<<<< Updated upstream
      <View style={styles.row}>
        {hasLeft && (
          <View style={{ width: `${leftTotal}%` }}>
            {rows.map((row, ri) => (
              <View key={ri} style={[{ flexDirection: "row" }, styles.rowTopEdge]} wrap={false}>
                {leftCols.map((c, ci) => (
                  <View key={c.key} style={[styles.cell, { width: `${(c.width / leftTotal) * 100}%` }, ci === 0 ? styles.cellLeftEdge : {}, ri === rows.length - 1 ? styles.cellBottomEdge : {}]}>
                    <Text style={c.key === "sl" ? styles.center : undefined}>
                      {c.key === "sl" ? String(ri + 1) : formatCell(row[c.key])}
                    </Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
        <View style={[styles.cell, styles.rowTopEdge, styles.cellBottomEdge, { width: `${mergeCol.width}%`, justifyContent: "center", alignItems: "center" }, !hasLeft ? styles.cellLeftEdge : {}]}>
          <Text style={styles.center}>{mergeValue ?? "—"}</Text>
        </View>
        {hasRight && (
          <View style={{ width: `${rightTotal}%` }}>
            {rows.map((row, ri) => (
              <View key={ri} style={[{ flexDirection: "row" }, styles.rowTopEdge]} wrap={false}>
                {rightCols.map((c) => (
                  <View key={c.key} style={[styles.cell, { width: `${(c.width / rightTotal) * 100}%` }, ri === rows.length - 1 ? styles.cellBottomEdge : {}]}>
                    <Text>{formatCell(row[c.key])}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}
=======
      <View style={{ flexDirection: "row" }}>
        <View style={{ width: `${leftTotal}%` }}>
          {rows.map((row, ri) => renderSideRow(leftCols, leftTotal, row, ri, true))}
        </View>
        <View style={[styles.cell, { width: `${mergeCol.width}%`, justifyContent: "center", alignItems: "center", borderTopWidth: 0.5, borderColor: BORDER }]}>
          <Text style={styles.center}>{mergeValue ?? "—"}</Text>
        </View>
        <View style={{ width: `${rightTotal}%` }}>
          {rows.map((row, ri) => renderSideRow(rightCols, rightTotal, row, ri, false))}
        </View>
>>>>>>> Stashed changes
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

  // Committee: Sl. / Name / Designation & Department / Role — 4 columns
  const committeeRows = bill.committees.map((m) => ({
    name: m.name,
    designationDept: formatDesignationDept(m.designation, m.department),
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
            { key: "sl", label: "Sl.", width: lw.committee.sl ?? 8, align: "center" },
            { key: "name", label: "Name of Teachers", width: lw.committee.name ?? 30 },
            { key: "designationDept", label: "Designation & Department", width: lw.committee.designationDept ?? 42 },
            { key: "role", label: "Role", width: lw.committee.role ?? 20 },
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
<<<<<<< Updated upstream
          courseWidth={lw.courseFile.course ?? 35}
          entryColumns={[
            { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.courseFile.teacherLine ?? 50 },
          ]}
          groups={courseFileGroups}
          groupMergeColumn={{
            key: "count",
            label: "No. of Course File",
            width: lw.courseFile.count ?? 15,
            align: "center",
            value: () => "01",
          }}
=======
          courseWidth={lw.courseFile.course ?? 40}
          entryColumns={[{ key: "teacherLine", label: "Name of Teachers & Designation", width: lw.courseFile.teacherLine ?? 60 }]}
          groups={courseFileGroups}
>>>>>>> Stashed changes
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
            { key: "courseLine", label: "Course No. & Title", width: lw.sessionalDuty.courseLine ?? 30 },
            { key: "credit", label: "Credit", width: lw.sessionalDuty.credit ?? 8, align: "center" },
            { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.sessionalDuty.teacherLine ?? 52 },
            { key: "students", label: "No. of Students", width: lw.sessionalDuty.students ?? 10, align: "center" },
          ]}
          rows={sessionalRows}
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
            { key: "sl", label: "Sl. No.", width: lw.boardViva.sl ?? 10, align: "center" },
            { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.boardViva.teacherLine ?? 65 },
            { key: "students", label: "No. of Students", width: lw.boardViva.students ?? 25, align: "center" },
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
    <MergedColumnTable
      columns={[
        { key: "sl", label: "Sl. No.", width: lw.tabulation.sl ?? 10 },
        { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.tabulation.teacherLine ?? 65 },
        { key: "students", label: "No. of Students", width: lw.tabulation.students ?? 25 },
      ]}
      rows={tabulationRows}
      mergeKey="students"
      mergeValue={tabulationRows[0]?.students ?? "—"}
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
    <MergedColumnTable
      columns={[
        { key: "sl", label: "Sl. No.", width: lw.gradeSheetPreparation.sl ?? 10 },
        { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.gradeSheetPreparation.teacherLine ?? 65 },
        { key: "studentsDisplay", label: "No. of Students", width: lw.gradeSheetPreparation.studentsDisplay ?? 25 },
      ]}
      rows={gradeSheetRows}
      mergeKey="studentsDisplay"
      mergeValue={gradeSheetRows[0]?.studentsDisplay ?? "—"}
    />
  ),
},
{
  title: "List of Teachers Associated with Grade Sheet Verification",
  hasData: !isBacklog && gradeSheetRows.length > 0,
  includeInBacklog: false,
  content: (
    <MergedColumnTable
      columns={[
        { key: "sl", label: "Sl. No.", width: lw.gradeSheetVerification.sl ?? 10 },
        { key: "teacherLine", label: "Name of Teachers & Designation", width: lw.gradeSheetVerification.teacherLine ?? 65 },
        { key: "studentsDisplay", label: "No. of Students", width: lw.gradeSheetVerification.studentsDisplay ?? 25 },
      ]}
      rows={gradeSheetRows}
      mergeKey="studentsDisplay"
      mergeValue={gradeSheetRows[0]?.studentsDisplay ?? "—"}
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
            { key: "sl", label: "Sl. No.", width: lw.thesis.sl ?? 8, align: "center" },
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
            { key: "sl", label: "Sl. No.", width: lw.verification.sl ?? 10, align: "center" },
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
      <Page size="A4" style={styles.page} wrap>
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
