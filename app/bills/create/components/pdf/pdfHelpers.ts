import type {
  CourseDuty,
  SessionalCourse,
  StudentDuty,
  Designation,
  BillInfo,
} from "../types";

// ------------------------------
// Footer exam line, e.g. "4th Year Even Semester Examination-2023"
// ------------------------------
export function buildExamLine(bill: BillInfo): string {
  const year = bill.year || "";
  const semester = bill.examType === "semester" ? bill.semester || "" : "";
  const examYear = bill.examYear || "";
  const typeLabel = bill.examType === "semester" ? "Semester" : "Backlog";
  return `${year} ${semester} ${typeLabel} Examination-${examYear}`
    .replace(/\s+/g, " ")
    .trim();
}

// Single-line bold title, e.g.
// "B.Sc. Engineering 4th Year Even Semester Examination-2023 (Series 2019)"
export function buildFullTitle(bill: BillInfo): string {
  const exam = bill.examination || "B.Sc. Engineering";
  const year = bill.year || "";
  const typeLabel =
    bill.examType === "semester"
      ? `${bill.semester || ""} Semester Examination`
      : "Backlog Examination";
  const examYear = bill.examYear || "";
  const series = bill.series || "";
  return `${exam} ${year} ${typeLabel}-${examYear} (Series ${series})`
    .replace(/\s+/g, " ")
    .trim();
}

// "Name, Designation, Dept. of Department" — comma-joined single cell
export function formatTeacher(
  name: string,
  designation: Designation,
  department: string
): string {
  // NOTE: `department` already contains the "Dept. of ..." prefix as
  // stored (e.g. "Dept. of BECM"), so it's appended as-is here. Do not
  // re-prefix it — that was causing "Dept. of Dept. of BECM" in the
  // rendered teacher line.
  const parts = [name, designation].filter(Boolean);
  if (department) parts.push(department);
  return parts.join(", ");
}

// ------------------------------
// 2. Paper Setter & Examiner
// One row per part/additional-teacher, only if paperSetter or examiner is checked
// ------------------------------
export interface PaperSetterRow {
  courseCode: string;
  courseTitle: string;
  part: string;
  teacherLine: string;
  paperSetCount: string; // "01" if paperSetter checked, else ""
  scriptExamined: string; // examiner students value, else ""
}

export function flattenPaperSetter(courses: CourseDuty[]): PaperSetterRow[] {
  const rows: PaperSetterRow[] = [];
  courses.forEach((course) => {
    course.parts.forEach((part) => {
      const entries = [
        {
          name: part.teacher,
          designation: part.designation,
          department: part.department,
          duties: part.duties,
          students: part.students,
        },
        ...part.additionalTeachers.map((at) => ({
          name: at.name,
          designation: at.designation,
          department: at.department,
          duties: at.duties,
          students: at.students,
        })),
      ];
      entries.forEach((entry) => {
        if (!entry.duties.paperSetter && !entry.duties.examiner) return;
        rows.push({
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
          part: part.part,
          teacherLine: formatTeacher(
            entry.name,
            entry.designation,
            entry.department
          ),
          paperSetCount: entry.duties.paperSetter ? "01" : "",
          scriptExamined: entry.duties.examiner ? entry.students.examiner : "",
        });
      });
    });
  });
  return rows;
}

// ------------------------------
// 3. Class Test
// One row per part/additional-teacher, only if classTest is checked
// ------------------------------
export interface ClassTestRow {
  courseCode: string;
  courseTitle: string;
  teacherLine: string;
  classTestCount: number | "";
  students: number | "";
}

export function flattenClassTest(courses: CourseDuty[]): ClassTestRow[] {
  const rows: ClassTestRow[] = [];
  courses.forEach((course) => {
    course.parts.forEach((part) => {
      const entries = [
        {
          name: part.teacher,
          designation: part.designation,
          department: part.department,
          duties: part.duties,
          students: part.students,
        },
        ...part.additionalTeachers.map((at) => ({
          name: at.name,
          designation: at.designation,
          department: at.department,
          duties: at.duties,
          students: at.students,
        })),
      ];
      entries.forEach((entry) => {
        if (!entry.duties.classTest) return;
        rows.push({
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
          teacherLine: formatTeacher(
            entry.name,
            entry.designation,
            entry.department
          ),
          classTestCount: entry.students.classTestCount,
          students: entry.students.classTestStudents,
        });
      });
    });
  });
  return rows;
}

// ------------------------------
// 4. Assignment
// One row per part/additional-teacher, only if assignment is checked
// ------------------------------
export interface AssignmentRow {
  courseCode: string;
  courseTitle: string;
  teacherLine: string;
  assignmentValue: string;
}

export function flattenAssignment(courses: CourseDuty[]): AssignmentRow[] {
  const rows: AssignmentRow[] = [];
  courses.forEach((course) => {
    course.parts.forEach((part) => {
      const entries = [
        {
          name: part.teacher,
          designation: part.designation,
          department: part.department,
          duties: part.duties,
          students: part.students,
        },
        ...part.additionalTeachers.map((at) => ({
          name: at.name,
          designation: at.designation,
          department: at.department,
          duties: at.duties,
          students: at.students,
        })),
      ];
      entries.forEach((entry) => {
        if (!entry.duties.assignment) return;
        rows.push({
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
          teacherLine: formatTeacher(
            entry.name,
            entry.designation,
            entry.department
          ),
          assignmentValue: entry.students.assignment,
        });
      });
    });
  });
  return rows;
}

// ------------------------------
// 5. Course File
// Merged from BOTH course-duty parts AND sessional courses, wherever
// courseFile is checked. Sessional courses come after course-duty rows,
// matching the reference document's ordering.
// ------------------------------
export interface CourseFileRow {
  courseCode: string;
  courseTitle: string;
  teacherLine: string;
}

export function flattenCourseFile(
  courseDuties: CourseDuty[],
  sessionalDuties: SessionalCourse[]
): CourseFileRow[] {
  const rows: CourseFileRow[] = [];
  courseDuties.forEach((course) => {
    course.parts.forEach((part) => {
      const entries = [
        {
          name: part.teacher,
          designation: part.designation,
          department: part.department,
          duties: part.duties,
        },
        ...part.additionalTeachers.map((at) => ({
          name: at.name,
          designation: at.designation,
          department: at.department,
          duties: at.duties,
        })),
      ];
      entries.forEach((entry) => {
        if (!entry.duties.courseFile) return;
        rows.push({
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
          teacherLine: formatTeacher(
            entry.name,
            entry.designation,
            entry.department
          ),
        });
      });
    });
  });
  sessionalDuties.forEach((course) => {
    const entries = [
      {
        name: course.teacher,
        designation: course.designation,
        department: course.department,
        duties: course.duties,
      },
      ...course.additionalTeachers.map((at) => ({
        name: at.name,
        designation: at.designation,
        department: at.department,
        duties: at.duties,
      })),
    ];
    entries.forEach((entry) => {
      if (!entry.duties.courseFile) return;
      rows.push({
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        teacherLine: formatTeacher(
          entry.name,
          entry.designation,
          entry.department
        ),
      });
    });
  });
  return rows;
}

// ------------------------------
// 8. Sessional (credit not modeled yet — left blank if not in type)
// ------------------------------
export interface SessionalRow {
  courseCode: string;
  courseTitle: string;
  courseLine: string;
  credit: string;
  teacherLine: string;
  students: number | "";
}

export function flattenSessional(courses: SessionalCourse[]): SessionalRow[] {
  const rows: SessionalRow[] = [];
  courses.forEach((course) => {
    const entries = [
      {
        name: course.teacher,
        designation: course.designation,
        department: course.department,
        duties: course.duties,
        students: course.students,
      },
      ...course.additionalTeachers.map((at) => ({
        name: at.name,
        designation: at.designation,
        department: at.department,
        duties: at.duties,
        students: at.students,
      })),
    ];
    entries.forEach((entry) => {
      if (!entry.duties.sessional) return;
      rows.push({
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        courseLine: course.courseTitle ? `${course.courseCode}\n${course.courseTitle}` : course.courseCode,
        credit: course.credit ?? "",
        teacherLine: formatTeacher(entry.name, entry.designation, entry.department),
        students: entry.students.sessional,
      });
    });
  });
  return rows;
}

// ------------------------------
// Board Viva — same source as Sessional (duties.boardViva), separate table
// ------------------------------
export interface BoardVivaRow {
  teacherLine: string;
  students: number | "";
}

export function flattenBoardViva(courses: SessionalCourse[]): BoardVivaRow[] {
  const rows: BoardVivaRow[] = [];
  const seen = new Set<string>();
  courses.forEach((course) => {
    const entries = [
      {
        name: course.teacher,
        designation: course.designation,
        department: course.department,
        duties: course.duties,
        students: course.students,
      },
      ...course.additionalTeachers.map((at) => ({
        name: at.name,
        designation: at.designation,
        department: at.department,
        duties: at.duties,
        students: at.students,
      })),
    ];
    entries.forEach((entry) => {
      if (!entry.duties.boardViva) return;
      const line = formatTeacher(entry.name, entry.designation, entry.department);
      // De-duplicate: same teacher may attend viva for multiple sessional courses
      if (seen.has(line)) return;
      seen.add(line);
      rows.push({ teacherLine: line, students: entry.students.boardViva });
    });
  });
  return rows;
}

// ------------------------------
// Tabulation (reused as-is for section "Tabulation")
// ------------------------------
export interface TabulationRow {
  teacherLine: string;
  students: number | "";
}

export function flattenTabulation(duties: StudentDuty[]): TabulationRow[] {
  return duties.map((d) => ({
    teacherLine: formatTeacher(d.name, d.designation, d.department),
    students: d.students,
  }));
}

// ------------------------------
// Grade Sheet Preparation & Verification
// Same teacher list as Tabulation, but student count divided by 3,
// displayed as "N/3" (e.g. tabulation students=31 -> "31/3")
// ------------------------------
export interface GradeSheetRow {
  teacherLine: string;
  studentsDisplay: string; // e.g. "31/3"
}

export function deriveGradeSheetRows(duties: StudentDuty[]): GradeSheetRow[] {
  return duties.map((d) => ({
    teacherLine: formatTeacher(d.name, d.designation, d.department),
    studentsDisplay: d.students === "" ? "" : `${d.students}/3`,
  }));
}

// ------------------------------
// Group flattened rows by course (courseCode + courseTitle), so Part A
// and Part B of the same course share a single serial number and a
// single merged "Course No. & Title" cell instead of repeating it on
// every row.
// ------------------------------
export interface CourseGroup<T> {
  sl: number;
  courseCode: string;
  courseTitle: string;
  entries: T[];
}

export function groupByCourse<
  T extends { courseCode: string; courseTitle: string }
>(rows: T[]): CourseGroup<T>[] {
  const map = new Map<string, CourseGroup<T>>();
  let nextSl = 1;
  rows.forEach((row) => {
    const key = `${row.courseCode}||${row.courseTitle}`;
    if (!map.has(key)) {
      map.set(key, {
        sl: nextSl++,
        courseCode: row.courseCode,
        courseTitle: row.courseTitle,
        entries: [],
      });
    }
    map.get(key)!.entries.push(row);
  });
  return Array.from(map.values());
}

// ------------------------------
// Thesis Viva formula display, e.g. "(30 x 5)/10" — matches the source
// document's format: (total viva students x 5) / (no. of teachers
// attending viva). Shown as one merged cell for the whole column,
// not evaluated to a single number.
//
// ASSUMPTION: "total viva students" is taken from the Board Viva batch
// size (bill.sessionalDuties' boardViva student count), since that's the
// only "total students attending a viva" figure available in the data
// model. If this isn't the right source field, let me know and I'll
// repoint it.
// ------------------------------
export function buildThesisVivaFormula(
  totalVivaStudents: number | "",
  teachersAttendingViva: number
): string {
  if (totalVivaStudents === "" || teachersAttendingViva <= 0) return "";
  return `(${totalVivaStudents} x 5)/${teachersAttendingViva}`;
}

// ------------------------------
// Course grouping helper — merges consecutive rows sharing the same
// course (e.g. Part A / Part B of one course) into one visual group.
// Only the first row in each group gets a serial number and shows the
// course code/title; later rows in the same group get blanks there so
// tables can render a "merged cell" look without native rowSpan.
// ------------------------------
export function groupConsecutiveByCourse<
  T extends { courseCode: string; courseTitle: string }
>(rows: T[]): (T & { sl: number | ""; showCourse: boolean })[] {
  let counter = 0;
  let lastCode: string | null = null;
  return rows.map((row) => {
    const isNew = row.courseCode !== lastCode;
    if (isNew) {
      counter += 1;
      lastCode = row.courseCode;
    }
    return {
      ...row,
      sl: isNew ? counter : "",
      showCourse: isNew,
    };
  });
}

export function courseLabel(courseCode: string, courseTitle: string): string {
  return courseTitle ? `${courseCode}\n${courseTitle}` : courseCode;
}

// Add near formatTeacher()

// "Name, Designation" only — no department. Used for Committee, where
// Department already has its own separate column.
export function formatTeacherOnly(name: string, designation: Designation): string {
  return [name, designation].filter(Boolean).join(", ");
}

// ------------------------------
// Thesis Viva merged formula: (totalVivaStudents x 5)/(teachers attending viva)
// totalVivaStudents comes from the Board Viva batch size (first Board Viva
// row's student count — all rows share the same batch). If Board Viva has
// no data, or no thesis teacher has attendsViva checked, returns "".
// ------------------------------
export function computeThesisVivaFormula(
  boardVivaRows: { students: number | "" }[],
  thesisTeachers: { attendsViva: boolean }[]
): string {
  const totalStudents = boardVivaRows.length > 0 ? boardVivaRows[0].students : "";
  const attendingCount = thesisTeachers.filter((t) => t.attendsViva).length;
  if (totalStudents === "" || attendingCount === 0) return "";
  return `(${totalStudents} x 5)/${attendingCount}`;
}
