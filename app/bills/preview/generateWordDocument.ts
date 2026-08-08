import type { ExaminationBillData } from "../create/components/types";
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
  formatCourseAdviserStudents,
  buildExamLine,
  computeThesisVivaFormula,
  formatDesignationDept,
  formatTeacher,
} from "../create/components/pdf/pdfHelpers";

type Row = (string | number)[];
type WordSection = { key: string; title: string; headers: string[]; rows: Row[]; backlog: boolean; show?: boolean; showHeader?: boolean; mergeColumn?: number; groupMergeColumns?: number[] };

const value = (input: unknown) => {
  if (input === undefined || input === null || input === "" || input === 0 || input === "0") return "—";
  return String(input);
};

const numbered = (rows: Row[]) => rows.map((row, index) => [index + 1, ...row]);

export async function generateWordDocument(bill: ExaminationBillData): Promise<Blob> {
  const {
    AlignmentType,
    BorderStyle,
    Document,
    Footer,
    Packer,
    Paragraph,
    Table,
    TableCell,
    TableRow,
    TextRun,
    VerticalAlign,
    VerticalMergeType,
    WidthType,
  } = await import("docx");

  const mixed = bill.billInfo.evaluationSystem === "mixed";
  const backlog = bill.billInfo.examType === "backlog";
  const obePaper = flattenPaperSetter(bill.courseDuties.obe);
  const nonObePaper = flattenPaperSetter(bill.courseDuties.nonObe);
  const classTests = mixed
    ? combineClassTestRows(flattenClassTest(bill.courseDuties.obe), flattenClassTest(bill.courseDuties.nonObe))
    : flattenClassTest(bill.courseDuties.obe);
  const assignments = flattenAssignment(bill.courseDuties.obe);
  const courseFiles = flattenCourseFile(bill.courseDuties.obe, bill.sessionalDuties);
  const sessionals = flattenSessional(bill.sessionalDuties);
  const boardViva = flattenBoardViva(bill.sessionalDuties, bill.vivaBoardTeachers, Number(bill.billInfo.totalStudents) || "");
  const tabulation = flattenTabulation(bill.studentDuties);
  const gradeSheets = deriveGradeSheetRows(bill.studentDuties, bill.tabulationStudentCount);
  const questionTeachers = bill.questionWorks.filter((person) => person.name.trim());
  const questionShare = `${bill.questionWorkTotal || "5"}/${questionTeachers.length || 1}`;
  const thesisViva = computeThesisVivaFormula(boardViva, bill.thesisTeachers) || "—";
  const fourthYearEven = !backlog && bill.billInfo.year === "4th Year" && bill.billInfo.semester === "Even";
  const firstYearEven = !backlog && bill.billInfo.year === "1st Year" && bill.billInfo.semester === "Even";

  const courseRows = <T extends object>(rows: T[], fields: string[]) => rows.map((row) => [
    [value((row as Record<string, unknown>).courseCode), value((row as Record<string, unknown>).courseTitle)].join("\n"),
    ...fields.map((field) => value((row as Record<string, unknown>)[field])),
  ]);
  const personRows = (people: { name: string; designation: ExaminationBillData["committees"][number]["designation"]; department: string }[], extra?: (person: never) => Row) =>
    numbered(people.map((person) => [formatTeacher(person.name, person.designation, person.department), ...(extra ? extra(person as never) : [])]));

  const sections: WordSection[] = [
    { key: "committee", title: "Examination Committee", headers: ["Sl. No.", "Name", "Designation & Department", "Role"], rows: numbered(bill.committees.map((m) => [m.name, formatDesignationDept(m.designation, m.department), m.role])), backlog: true, show: bill.committees.some((m) => m.name.trim()), showHeader: false },
    { key: "paperSetterObe", title: mixed ? "Paper Setter & Examiner — OBE (New Syllabus)" : "List of Teachers Associated with Paper Setter & Examiner", headers: ["Course No. & Title", "Part", "Name of Teachers & Designation", "No. of Paper Set", "No. of Script Examined"], rows: courseRows(obePaper, ["part", "teacherLine", "paperSetCount", "scriptExamined"]), backlog: true, groupMergeColumns: [0] },
    { key: "paperSetterNonObe", title: "Paper Setter & Examiner — Non-OBE (Old Syllabus)", headers: ["Course No. & Title", "Part", "Name of Teachers & Designation", "No. of Paper Set", "No. of Script Examined"], rows: courseRows(nonObePaper, ["part", "teacherLine", "paperSetCount", "scriptExamined"]), backlog: true, groupMergeColumns: [0] },
    { key: "classTest", title: "List of Teachers Associated with Class Test", headers: ["Course No. & Title", "Name of Teachers & Designation", "No. of Class Test", "No. of Students"], rows: courseRows(classTests, ["teacherLine", "classTestCount", "students"]), backlog: false, groupMergeColumns: [0] },
    { key: "assignment", title: "List of Teachers Associated with Assignment", headers: ["Course No. & Title", "Name of Teachers & Designation", "No. of Class Assignment"], rows: courseRows(assignments, ["teacherLine", "assignmentValue"]), backlog: false, groupMergeColumns: [0, 2] },
    { key: "courseFile", title: "List of Teachers Associated with Course File", headers: ["Course No. & Title", "Name of Teachers & Designation", "No. of Course File"], rows: courseRows(courseFiles, ["teacherLine"]).map((row) => [...row, "01"]), backlog: false, groupMergeColumns: [0, 2] },
    { key: "questionWork", title: backlog ? "List of Teachers Associated with Question Typing, Sketching & Printing" : "List of Teachers Associated with Question Typing, Sketching, Comparing & Printing", headers: ["Sl. No.", "Name of The Teachers & Designation", "No. of Question"], rows: personRows(questionTeachers, () => [questionShare]), backlog: true, mergeColumn: 2 },
    { key: "scrutinyObe", title: mixed ? "Scrutiny — OBE (New Syllabus)" : "List of Teachers Associated with Scrutiny", headers: ["Sl. No.", "Name of Teachers & Designation", "No. of Script"], rows: personRows(bill.scrutinies.obe, (p) => [value((p as { scriptCount: unknown }).scriptCount)]), backlog: true },
    { key: "scrutinyNonObe", title: "Scrutiny — Non-OBE (Old Syllabus)", headers: ["Sl. No.", "Name of Teachers & Designation", "No. of Script"], rows: personRows(bill.scrutinies.nonObe, (p) => [value((p as { scriptCount: unknown }).scriptCount)]), backlog: true },
    { key: "sessionalDuty", title: "List of Teachers Associated with Sessional", headers: ["Course No. & Title", "Credit", "Name of Teachers & Designation", "No. of Students"], rows: courseRows(sessionals, ["credit", "teacherLine", "students"]), backlog: false, groupMergeColumns: [0, 1, 3] },
    { key: "boardViva", title: "List of Teachers Associated with Board Viva", headers: ["Sl. No.", "Name of Teachers & Designation", "No. of Students"], rows: numbered(boardViva.map((row) => [value(row.teacherLine), value(row.students)])), backlog: true },
    { key: "tabulation", title: "List of Teachers Associated with Tabulation", headers: ["Sl. No.", "Name of Teachers & Designation", "No. of Students"], rows: numbered(tabulation.map((row) => [value(row.teacherLine), bill.tabulationStudentCount || "—"])), backlog: true, mergeColumn: 2 },
    { key: "gradeSheetPreparation", title: backlog ? "List of Teachers Associated with Grade Sheet Preparation & Verification" : "List of Teachers Associated with Grade Sheet Preparation", headers: ["Sl. No.", "Name of Teachers & Designation", "No. of Students"], rows: numbered(gradeSheets.map((row) => [value(row.teacherLine), value(row.studentsDisplay)])), backlog: true, mergeColumn: 2 },
    { key: "gradeSheetVerification", title: "List of Teachers Associated with Grade Sheet Verification", headers: ["Sl. No.", "Name of Teachers & Designation", "No. of Students"], rows: numbered(gradeSheets.map((row) => [value(row.teacherLine), value(row.studentsDisplay)])), backlog: false, mergeColumn: 2 },
    { key: "courseAdviser", title: "List of Course Advisers", headers: ["Sl. No.", "Name of Teachers & Designation", "No. of Students"], rows: personRows(bill.courseAdvisers, () => [formatCourseAdviserStudents(bill.courseAdviserStudentCount, bill.courseAdvisers.filter((a) => a.name.trim()).length) || "—"]), backlog: false, mergeColumn: 2 },
    { key: "courseCoordinator", title: "List of Teachers Associated with Course Coordinator", headers: ["Sl. No.", "Name of Teachers & Designation"], rows: personRows(bill.courseCoordinatorTeachers), backlog: false, show: fourthYearEven && bill.courseCoordinatorTeachers.length > 0 },
    { key: "thesis", title: "List of Teachers Associated with Thesis/Project Examination", headers: ["Sl. No.", "Name of Teachers & Designation", "Supervisor", "Thesis Examiner", "Thesis Viva"], rows: personRows(bill.thesisTeachers, (p) => { const t = p as { supervisorCount: unknown; examinerCount: unknown }; return [value(t.supervisorCount), value(t.examinerCount), thesisViva]; }), backlog: false, show: fourthYearEven && bill.thesisTeachers.length > 0, mergeColumn: 4 },
    { key: "verification", title: "List of Teachers Associated with Verification of Final Result", headers: ["Sl. No.", "Name of Teachers & Designation", "No. of Students"], rows: personRows(bill.verificationTeachers, () => [bill.verificationStudentCount ? `${bill.verificationStudentCount}/${bill.verificationTeachers.filter((t) => t.name.trim()).length || 1}` : "—"]), backlog: true, show: bill.billInfo.hasGraduatingStudents === "yes" && bill.verificationTeachers.length > 0, mergeColumn: 2 },
    { key: "practicalSurveying", title: "List of Teachers Associated with Practical Surveying (CE 1226)", headers: ["SL No.", "Name of Teachers & Designation", "No. of Students"], rows: personRows(bill.practicalSurveyingTeachers.filter((t) => t.name.trim()), () => [`${bill.practicalSurveyingStudentCount || "27"}/${bill.practicalSurveyingTeachers.filter((t) => t.name.trim()).length || 1}`]), backlog: false, show: firstYearEven && bill.practicalSurveyingTeachers.some((t) => t.name.trim()), mergeColumn: 2 },
  ];

  const order = ["committee", ...(bill.sectionOrder ?? []).filter((key) => key !== "committee")];
  const orderKey = (key: string) => key === "paperSetterNonObe" ? "paperSetterObe" : key === "scrutinyNonObe" ? "scrutinyObe" : key;
  const visible = sections
    .filter((section) => section.rows.length && section.show !== false && (!backlog || section.backlog))
    .filter((section) => mixed || !section.key.endsWith("NonObe"))
    .sort((a, b) => {
      const ai = order.indexOf(orderKey(a.key));
      const bi = order.indexOf(orderKey(b.key));
      if (ai !== bi) return (ai < 0 ? 999 : ai) - (bi < 0 ? 999 : bi);
      return a.key.endsWith("NonObe") ? 1 : -1;
    });
  const layoutKey: Record<string, keyof ExaminationBillData["layoutSettings"]> = {
    committee: "committee", paperSetterObe: "paperSetter", paperSetterNonObe: "paperSetterNonObe",
    classTest: "classTest", assignment: "assignment", courseFile: "courseFile", questionWork: "questionWork",
    scrutinyObe: "scrutinyObe", scrutinyNonObe: "scrutinyNonObe", sessionalDuty: "sessionalDuty",
    boardViva: "boardViva", tabulation: "tabulation", gradeSheetPreparation: "gradeSheetPreparation",
    gradeSheetVerification: "gradeSheetVerification", courseAdviser: "courseAdviser", courseCoordinator: "courseCoordinator",
    thesis: "thesis", verification: "verification", practicalSurveying: "practicalSurveying",
  };
  const sectionWidths = (section: WordSection) => {
    const raw = Object.values(bill.layoutSettings[layoutKey[section.key]] ?? {});
    const widths = raw.length === section.headers.length ? raw : section.headers.map(() => 1);
    const total = widths.reduce((sum, width) => sum + Math.max(0, width), 0) || widths.length;
    return widths.map((width) => (Math.max(0, width) / total) * 100);
  };
  const centered = (header: string) =>
    header === "Sl. No." || header === "SL No." || header === "Part" || header === "Credit" ||
    header === "Role" || header.startsWith("No. of") || header === "Supervisor" ||
    header === "Thesis Examiner" || header === "Thesis Viva";
  const borders = { style: BorderStyle.SINGLE, size: 4, color: "000000" };
  const cell = (
    text: string | number,
    bold: boolean,
    width: number,
    center: boolean,
    verticalMerge?: "restart" | "continue",
    keepWithNextRow = false
  ) => new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 80, right: 80 },
    ...(verticalMerge ? { verticalMerge: verticalMerge === "restart" ? VerticalMergeType.RESTART : VerticalMergeType.CONTINUE } : {}),
    borders: { top: borders, bottom: borders, left: borders, right: borders },
    children: String(text).split("\n").map((line) => new Paragraph({
      alignment: center ? AlignmentType.CENTER : AlignmentType.LEFT,
      keepNext: keepWithNextRow,
      keepLines: true,
      spacing: { before: 0, after: 0, line: 220 },
      children: [new TextRun({ text: line, bold, size: 19, font: "Times New Roman" })],
    })),
  });
  const children: (InstanceType<typeof Paragraph> | InstanceType<typeof Table>)[] = [
    new Table({
      alignment: AlignmentType.RIGHT,
      width: { size: 1900, type: WidthType.DXA },
      borders: { top: borders, bottom: borders, left: borders, right: borders, insideHorizontal: borders, insideVertical: borders },
      rows: [new TableRow({ children: [new TableCell({
        width: { size: 1900, type: WidthType.DXA },
        borders: { top: borders, bottom: borders, left: borders, right: borders },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 0, after: 0 },
          children: [new TextRun({ text: `Bill No.: ${bill.billInfo.billNo || "—"}`, bold: true, size: 22, font: "Times New Roman" })],
        })],
      })] })],
    }),
    ...["Heaven’s Light is Our Guide", "Department of Building Engineering & Construction Management", "Rajshahi University of Engineering & Technology"].map((text) => new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text, size: 20, font: "Times New Roman" })] })),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 280 }, children: [new TextRun({ text: `${bill.billInfo.examination || "B.Sc. Engineering"} ${bill.billInfo.year} ${backlog ? "Backlog Examination" : `${bill.billInfo.semester} Semester Examination`} ${bill.billInfo.examYear} (Series ${bill.billInfo.series})`, bold: true, size: 20, font: "Times New Roman" })] }),
  ];
  const groupNumbers = new Map<string, number>();
  let nextNumber = 1;
  visible.forEach((section) => {
    const group = orderKey(section.key);
    if (!groupNumbers.has(group)) groupNumbers.set(group, nextNumber++);
  });
  visible.forEach((section) => {
    const widths = sectionWidths(section);
    const number = groupNumbers.get(orderKey(section.key));
    const firstInGroup = visible.find((candidate) => orderKey(candidate.key) === orderKey(section.key)) === section;
    const forcePageBreak = Boolean(bill.pageBreakAfter?.[section.key]);
    if (mixed && section.key.startsWith("paperSetter") && firstInGroup) {
      children.push(new Paragraph({ pageBreakBefore: forcePageBreak, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: `${number}. List of Teachers Associated with Paper Setter & Examiner`, bold: true, size: 20, font: "Times New Roman" })] }));
    }
    if (mixed && section.key.startsWith("scrutiny") && firstInGroup) {
      children.push(new Paragraph({ pageBreakBefore: forcePageBreak, spacing: { before: 0, after: 80 }, children: [new TextRun({ text: `${number}. List of Teachers Associated with Scrutiny`, bold: true, size: 20, font: "Times New Roman" })] }));
    }
    const subsection = mixed && (section.key.startsWith("paperSetter") || section.key.startsWith("scrutiny"));
    const title = subsection
      ? `${number}.${section.key.endsWith("NonObe") ? "2 Non-OBE (Old Syllabus)" : "1 OBE (New Syllabus)"}`
      : `${number}. ${section.title}`;
    children.push(new Paragraph({
      pageBreakBefore: forcePageBreak && (!firstInGroup || !subsection),
      spacing: { before: subsection ? 100 : 0, after: 80 },
      children: [new TextRun({ text: title, bold: true, size: 20, font: "Times New Roman" })],
    }));
    children.push(new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [
        ...(section.showHeader === false ? [] : [new TableRow({ cantSplit: true, children: section.headers.map((header, column) => cell(header, true, widths[column], centered(header))) })]),
        ...section.rows.map((row, rowIndex) => new TableRow({
          cantSplit: true,
          children: row.map((item, column) => {
            const isWholeColumnMerge = section.mergeColumn === column && section.rows.length > 1;
            const isGroupColumn = section.groupMergeColumns?.includes(column) ?? false;
            const sameCourseAsPrevious = rowIndex > 0 && section.rows[rowIndex - 1]?.[0] === row[0];
            const sameCourseAsNext = rowIndex < section.rows.length - 1 && section.rows[rowIndex + 1]?.[0] === row[0];
            // Word only has a native "do not split this row" option. Chaining
            // every non-final row in a course to its successor makes Word move
            // the complete course block when the remaining page space is too
            // small, matching the PDF pagination behavior.
            const keepCourseTogether = section.groupMergeColumns?.includes(0) === true && sameCourseAsNext;
            const isGroupMerge = isGroupColumn && (sameCourseAsPrevious || sameCourseAsNext);
            const merge = isWholeColumnMerge
              ? (rowIndex === 0 ? "restart" : "continue")
              : isGroupMerge
                ? (sameCourseAsPrevious ? "continue" : "restart")
                : undefined;
            return cell(
              merge === "continue" ? "" : item,
              false,
              widths[column],
              centered(section.headers[column]),
              merge,
              keepCourseTogether
            );
          }),
        })),
      ],
    }));
    const tableGap = Math.max(0, bill.tableSpacing?.[section.key] ?? bill.layoutSpacing?.sectionGap ?? 0);
    if (tableGap > 0) children.push(new Paragraph({ spacing: { before: 0, after: tableGap * 20 }, children: [] }));
  });

  const footerArea = Math.max(45, bill.layoutSpacing?.footerArea ?? 68);
  const document = new Document({ sections: [{
    properties: { page: { size: { width: 12240, height: 20160 }, margin: { top: 600, right: 720, bottom: footerArea * 20, left: 720, header: 0, footer: 480 } } },
    children,
    footers: { default: new Footer({ children: [
      new Table({
        alignment: AlignmentType.RIGHT,
        width: { size: 3800, type: WidthType.DXA },
        borders: {
          top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        },
        rows: [new TableRow({ children: [new TableCell({
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          },
          children: ["Chairman", "Examination Committee", buildExamLine(bill.billInfo), "RUET, Rajshahi"].map((text) =>
            new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0, line: 200 }, children: [new TextRun({ text, size: 20, font: "Times New Roman" })] })
          ),
        })] })],
      }),
    ] }) },
  }] });
  return Packer.toBlob(document);
}
