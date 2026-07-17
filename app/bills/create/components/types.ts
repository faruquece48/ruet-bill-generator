export type Designation =
  | "Lecturer"
  | "Assistant Professor"
  | "Associate Professor"
  | "Professor";

export interface BillInfo {
  billNo: string;
  examination: string;
  year: string;
  semester: string;
  examYear: string;
  series: string;
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

export type DutyStudentCount = Record<keyof DutyOption, number | "">;

export interface AdditionalTeacher {
  name: string;
  designation: Designation;
  duties: DutyOption;
  students: DutyStudentCount;
}

export interface CoursePart {
  part: "A" | "B";
  teacher: string;
  designation: Designation;
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
  duties: SessionalDutyOption;
  students: StudentCount;
}

export interface SessionalCourse {
  courseCode: string;
  courseTitle: string;
  teacher: string;
  designation: Designation;
  duties: SessionalDutyOption;
  students: StudentCount;
  additionalTeachers: SessionalAdditionalTeacher[];
}


// ------------------------------
// Scrutiny
// ------------------------------

export interface ScrutinyTeacher {
  name: string;
  designation: Designation;
  scriptCount: number | "";
}

export interface ScrutinySection {
  teachers: ScrutinyTeacher[];
}


export interface BillInfo {
  billNo: string;
  examination: string;
  year: string;
  examType: "semester" | "backlog";
  semester: string;
  examYear: string;
  series: string;
  evaluationSystem: "obe" | "mixed";
}


// ==============================
// Complete Examination Bill Data
// ==============================

export interface ExaminationBillData {

  // Examination Information
  billInfo: BillInfo;


  // Committee Members
  committees: any[];


  // Course related duties
  courseDuties: any[];


  // Sessional related duties
  sessionalDuties: any[];


  // Question preparation related work
  questionWorks: any[];


  // Scrutiny related duties
  scrutinies: any[];


  // Student related duties
  studentDuties: any[];


  // Course Adviser related duties
  courseAdvisers: any[];

}