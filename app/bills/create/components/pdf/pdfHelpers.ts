import type {
  CourseDuty,
  SessionalCourse,
  Designation,
  BillInfo,
} from "../types";

// ------------------------------
// Footer exam line, e.g. "4th Year Even Semester Examination-2023"
// ------------------------------
export function buildExamLine(bill: BillInfo): string {
  const year = bill.year || "";
  const semester = bill.semester || "";
  const examYear = bill.examYear || "";
  return `${year} ${semester} Semester Examination-${examYear}`
    .replace(/\s+/g, " ")
    .trim();
}

export function formatTeacher(
  name: string,
  designation: Designation,
  department: string
): string {
  const parts = [name, designation].filter(Boolean);
  if (department) parts.push(`Dept. of ${department}`);
  return parts.join(", ");
}

// ------------------------------
// Flatten Course Duty (Paper Setter/Examiner/Class Test/Assignment/Course File)
// ------------------------------
export interface FlatDutyRow {
  courseCode: string;
  courseTitle: string;
  part: string;
  name: string;
  designation: Designation;
  department: string;
  paperSetter: boolean;
  examiner: string;
  classTest: boolean;
  classTestCount: number | "";
  classTestStudents: number | "";
  assignment: boolean;
  assignmentValue: string;
  courseFile: boolean;
}

export function flattenCourseDuties(courses: CourseDuty[]): FlatDutyRow[] {
  const rows: FlatDutyRow[] = [];
  courses.forEach((course) => {
    course.parts.forEach((part) => {
      rows.push({
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        part: part.part,
        name: part.teacher,
        designation: part.designation,
        department: part.department,
        paperSetter: part.duties.paperSetter,
        examiner: part.duties.examiner ? part.students.examiner : "",
        classTest: part.duties.classTest,
        classTestCount: part.duties.classTest
          ? part.students.classTestCount
          : "",
        classTestStudents: part.duties.classTest
          ? part.students.classTestStudents
          : "",
        assignment: part.duties.assignment,
        assignmentValue: part.duties.assignment
          ? part.students.assignment
          : "",
        courseFile: part.duties.courseFile,
      });
      part.additionalTeachers.forEach((at) => {
        rows.push({
          courseCode: course.courseCode,
          courseTitle: course.courseTitle,
          part: part.part,
          name: at.name,
          designation: at.designation,
          department: at.department,
          paperSetter: at.duties.paperSetter,
          examiner: at.duties.examiner ? at.students.examiner : "",
          classTest: at.duties.classTest,
          classTestCount: at.duties.classTest
            ? at.students.classTestCount
            : "",
          classTestStudents: at.duties.classTest
            ? at.students.classTestStudents
            : "",
          assignment: at.duties.assignment,
          assignmentValue: at.duties.assignment ? at.students.assignment : "",
          courseFile: at.duties.courseFile,
        });
      });
    });
  });
  return rows;
}

// ------------------------------
// Flatten Sessional Duty (Sessional / Course File)
// ------------------------------
export interface FlatSessionalRow {
  courseCode: string;
  courseTitle: string;
  name: string;
  designation: Designation;
  department: string;
  sessional: boolean;
  sessionalStudents: number | "";
  courseFile: boolean;
}

export function flattenSessionalDuties(
  courses: SessionalCourse[]
): FlatSessionalRow[] {
  const rows: FlatSessionalRow[] = [];
  courses.forEach((course) => {
    rows.push({
      courseCode: course.courseCode,
      courseTitle: course.courseTitle,
      name: course.teacher,
      designation: course.designation,
      department: course.department,
      sessional: course.duties.sessional,
      sessionalStudents: course.duties.sessional
        ? course.students.sessional
        : "",
      courseFile: course.duties.courseFile,
    });
    course.additionalTeachers.forEach((at) => {
      rows.push({
        courseCode: course.courseCode,
        courseTitle: course.courseTitle,
        name: at.name,
        designation: at.designation,
        sessional: at.duties.sessional,
        department: "",
        sessionalStudents: at.duties.sessional ? at.students.sessional : "",
        courseFile: at.duties.courseFile,
      });
    });
  });
  return rows;
}