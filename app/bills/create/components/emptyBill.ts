import type { ExaminationBillData } from "./types";
import { defaultLayoutSettings } from "./types";

const practicalSurveyingTeachers = [
  "Prof. Dr. Md. Abdul Alim",
  "Prof. Dr. N.H.M. Kamrujjaman Serker",
  "Prof. Dr. Md. Kumruzzaman (1)",
  "Prof. Dr. Md. Niamul Bari",
  "Prof. Dr. Md. Kamruzzaman (2)",
  "Prof. Dr. Md. Mahmud Sazzad",
  "Prof. Dr. S. M. Zahurul Islam",
  "Prof. Dr. Md. Akhtar Hossain",
  "Prof. Dr. Md. Shafiqul Islam",
  "Prof. Dr. Md. Robiul Awall",
  "Prof. Dr. Abu Sufian Md. Zia Hasan",
  "Prof. Dr. H. M. Rasel",
  "Prof. Dr. Md. Abu Sayeed",
  "Prof. Dr. Md. Zahangir Alam",
  "Prof. Dr. Anupam Chowdhury",
  "Prof. Dr. Bulbul Ahmed",
].map((name) => ({ name, designation: "" as const, department: "Dept. of CE, RUET" }));

const becmPracticalSurveyingTeachers = [
  "Mr. Mithun Chakrabartty",
  "Mrs. Shayla Sharmin",
  "Mehedi Hasan",
  "Mr. Aojpy Kumar Shuvo",
  "Faruque Abdullah",
  "Md. Ashraful Islam",
  "Mr. Nur Alam Riad",
  "Mr. Towfik Hassan",
  "Mr. MD. Mehedi Hassan Galib",
  "Mr. Md. Rumman Howlader",
].map((name) => ({ name, designation: "" as const, department: "Dept. of BECM, RUET" }));

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
  pageBreakAfter: {},
  scrutinies: { obe: [], nonObe: [] },
  studentDuties: [],
  tabulationStudentCount: "",
  courseAdvisers: [],
  courseAdviserStudentCount: "",
  practicalSurveyingTeachers: [
    ...practicalSurveyingTeachers,
    ...becmPracticalSurveyingTeachers,
  ],
  practicalSurveyingStudentCount: "27",
  thesisTeachers: [],
  verificationTeachers: [],
  verificationStudentCount: "",
  courseCoordinatorTeachers: [],
  layoutSettings: defaultLayoutSettings,
  layoutSpacing: { sectionGap: 6, footerArea: 68 },
};
