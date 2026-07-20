export type Designation =
  | ""
  | "Lecturer"
  | "Assistant Professor"
  | "Associate Professor"
  | "Professor";

export interface BillInfo {
  billNo: string;
  examination: string;
  year: string;
  examType: "semester" | "backlog";
  semester: string;
  examYear: string;
  series: string;
  evaluationSystem: "obe" | "mixed";
  hasGraduatingStudents: "yes" | "no";
}

export interface CommitteeMember {
  name: string;
  designation: Designation;
  department: string;
  role: "Chairman" | "Member" | "External Member";
}

// ------------------------------
// Paper Setter & Examiner Duty Types
// ------------------------------
export interface DutyOption {
  paperSetter: boolean;
  examiner: boolean;
  classTest: boolean;
  assignment: boolean;
  courseFile: boolean;
}

// paperSetter / courseFile are fixed/shared values (just a checkbox, no count).
// examiner / assignment accept a fraction-style string (e.g. "1", "1/2").
// classTest is split into its own count + total students.
export interface DutyStudentCount {
  examiner: string;
  assignment: string;
  classTestCount: number | "";
  classTestStudents: number | "";
}

export interface AdditionalTeacher {
  name: string;
  designation: Designation;
  department: string;
  duties: DutyOption;
  students: DutyStudentCount;
}

export interface CoursePart {
  part: "A" | "B";
  teacher: string;
  designation: Designation;
  department: string;
  duties: DutyOption;
  students: DutyStudentCount;
  additionalTeachers: AdditionalTeacher[];
}

export interface CourseDuty {
  courseCode: string;
  courseTitle: string;
  parts: CoursePart[];
}

// ------------------------------
// Sessional Duty Types
// ------------------------------
export interface SessionalDutyOption {
  courseFile: boolean;
  sessional: boolean;
  boardViva: boolean;
}

export interface StudentCount {
  courseFile: number | "";
  sessional: number | "";
  boardViva: number | "";
}

export interface SessionalAdditionalTeacher {
  name: string;
  designation: Designation;
  department: string;
  duties: SessionalDutyOption;
  students: StudentCount;
}

export interface SessionalCourse {
  courseCode: string;
  courseTitle: string;
  credit: string;
  teacher: string;
  designation: Designation;
  department: string;
  duties: SessionalDutyOption;
  students: StudentCount;
  additionalTeachers: SessionalAdditionalTeacher[];
}


// ------------------------------
// Question Work Types
// ------------------------------
export interface QuestionWork {
  name: string;
  designation: Designation;
  department: string;
  questionNumber: number | "";
}

// ------------------------------
// Scrutiny
// ------------------------------
export interface ScrutinyTeacher {
  name: string;
  designation: Designation;
  department: string;
  scriptCount: number | "";
}

export interface ScrutinySection {
  teachers: ScrutinyTeacher[];
}

// ------------------------------
// Student Duty (Tabulation) Types
// ------------------------------
export interface StudentDuty {
  name: string;
  designation: Designation;
  department: string;
  students: number | "";
}

// ------------------------------
// Course Adviser Types
// ------------------------------
export interface CourseAdviser {
  name: string;
  designation: Designation;
  department: string;
  students: number | "";
}

// ------------------------------
// Thesis / Project Examination Types
// ------------------------------
export interface ThesisTeacher {
  name: string;
  designation: Designation;
  department: string;
  supervisorCount: number | "";
  examinerCount: number | "";
  attendsViva: boolean;
}

export interface VerificationTeacher {
  name: string;
  designation: Designation;
  department: string;
}

// ------------------------------
// Course Coordinator Types
// ------------------------------
export interface CourseCoordinatorTeacher {
  name: string;
  designation: Designation;
  department: string;
}

// ==============================
// Complete Examination Bill Data
// ==============================
export interface ExaminationBillData {
  billInfo: BillInfo;
  committees: CommitteeMember[];
  courseDuties: { obe: CourseDuty[]; nonObe: CourseDuty[] };
  sessionalDuties: SessionalCourse[];
  questionWorks: QuestionWork[];
  scrutinies: { obe: ScrutinyTeacher[]; nonObe: ScrutinyTeacher[] };
  studentDuties: StudentDuty[];
  courseAdvisers: CourseAdviser[];
  thesisTeachers: ThesisTeacher[];
  verificationTeachers: VerificationTeacher[];
  verificationStudentCount: string;
  courseCoordinatorTeachers: CourseCoordinatorTeacher[];
  layoutSettings: TableLayoutSettings;
}

// ------------------------------
// PDF Table Layout / Column Width Settings
// ------------------------------

export interface ColumnWidths {
  [columnKey: string]: number; // percentage (0-100), should sum to ~100 per table
}

export interface TableLayoutSettings {
  committee: ColumnWidths;
  courseDutyObe: ColumnWidths;
  courseDutyNonObe: ColumnWidths;
  paperSetter: ColumnWidths;
  classTest: ColumnWidths;
  assignment: ColumnWidths;
  courseFile: ColumnWidths;
  sessionalDuty: ColumnWidths;
  questionWork: ColumnWidths;
  scrutinyObe: ColumnWidths;
  scrutinyNonObe: ColumnWidths;
  studentDuty: ColumnWidths;
  boardViva: ColumnWidths;
  tabulation: ColumnWidths;
  gradeSheetPreparation: ColumnWidths;
  gradeSheetVerification: ColumnWidths;
  courseAdviser: ColumnWidths;
  thesis: ColumnWidths;
  verification: ColumnWidths;
  courseCoordinator: ColumnWidths;
}

export const defaultLayoutSettings: TableLayoutSettings = {
  committee: { sl: 8, name: 30, designationDept: 42, role: 20 },
  courseDutyObe: {
    courseCode: 8,
    courseTitle: 18,
    part: 6,
    name: 16,
    designation: 12,
    department: 10,
    paperSetter: 6,
    examiner: 8,
    classTest: 6,
    assignment: 8,
    courseFile: 2,
  },
  courseDutyNonObe: {
    courseCode: 8,
    courseTitle: 18,
    part: 6,
    name: 16,
    designation: 12,
    department: 10,
    paperSetter: 6,
    examiner: 8,
    classTest: 6,
    assignment: 8,
    courseFile: 2,
  },
  // Used by GroupedCourseTable in PreviewDocument.tsx — needs a "course"
  // width plus one width per entryColumns key passed for that section.
  paperSetter: {
    course: 30,
    part: 8,
    teacherLine: 32,
    paperSetCount: 15,
    scriptExamined: 15,
  },
  classTest: {
    course: 34,
    teacherLine: 36,
    classTestCount: 15,
    students: 15,
  },
  assignment: {
    course: 50,
    teacherLine: 35,
    assignmentValue: 15,
  },
  courseFile: { course: 35, teacherLine: 50, count: 15 },
  sessionalDuty: {
    courseLine: 30,
    credit: 8,
    teacherLine: 52,
    students: 10,
  },
  questionWork: { sl: 10, teacherLine: 65, questionNumber: 25 },
  scrutinyObe: { sl: 10, teacherLine: 65, scriptCount: 25 },
  scrutinyNonObe: { sl: 10, teacherLine: 65, scriptCount: 25 },
  studentDuty: { sl: 10, teacherLine: 65, students: 25 },
  boardViva: { sl: 10, teacherLine: 65, students: 25 },
  tabulation: { sl: 10, teacherLine: 65, students: 25 },
  gradeSheetPreparation: { sl: 10, teacherLine: 65, studentsDisplay: 25 },
  gradeSheetVerification: { sl: 10, teacherLine: 65, studentsDisplay: 25 },
  courseAdviser: { sl: 10, teacherLine: 65, students: 25 },
  thesis: {
    sl: 6,
    name: 22,
    designation: 14,
    department: 18,
    supervisorCount: 14,
    examinerCount: 14,
    attendsViva: 12,
  },
  verification: { sl: 10, teacherLine: 65, students: 25 },
  courseCoordinator: { sl: 10, teacherLine: 90 },
};
