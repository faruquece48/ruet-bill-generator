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
  committees: [
    {
      name: "",
      designation: "",
      department: "Dept. of BECM, RUET",
      role: "Member",
    },
  ],
  courseDuties: { obe: [], nonObe: [] },
  sessionalDuties: [],
  questionWorks: [],
  questionWorkTotal: "5",
  scrutinies: { obe: [], nonObe: [] },
  studentDuties: [],
  courseAdvisers: [],
  thesisTeachers: [],
  verificationTeachers: [],
  verificationStudentCount: "",
  courseCoordinatorTeachers: [],
  layoutSettings: defaultLayoutSettings,
};
