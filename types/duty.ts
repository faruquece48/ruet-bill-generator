export type DutyType =
  | "committee"
  | "paperSetterExaminer"
  | "tabulation"
  | "gradePreparation"
  | "gradeVerification"
  | "boardViva"
  | "courseAdviser";

export interface DutyRecord {
  dutyType: DutyType;

  teacherName: string;

  designation: string;

  department: string;

  courseCode?: string;

  courseTitle?: string;

  paperSet?: number;

  scripts?: number;

  students?: number;

  pageNumber: number;
}