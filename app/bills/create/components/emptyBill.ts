import type { ExaminationBillData } from "./types";
import { defaultLayoutSettings } from "./types";

export const emptyBill: ExaminationBillData = {
  billInfo: {
    billNo: "",
    examination: "",
    year: "",
    examType: "semester",
    semester: "",
    examYear: "",
    series: "",
    evaluationSystem: "obe",
    hasGraduatingStudents: "no",
  },
  committees: [{ name: "", designation: "", department: "", role: "Member" }],
  courseDuties: { obe: [], nonObe: [] },
  sessionalDuties: [],
  questionWorks: [],
  scrutinies: { obe: [], nonObe: [] },
  studentDuties: [],
  courseAdvisers: [],
  thesisTeachers: [],
  verificationTeachers: [],
  verificationStudentCount: "",
  courseCoordinatorTeachers: [],
  layoutSettings: defaultLayoutSettings,
};