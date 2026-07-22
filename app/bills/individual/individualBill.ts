import type { ExaminationBillData } from "../create/components/types";

export interface IndividualBillRow {
  id: string;
  description: string;
  course: string;
  quantity: string;
  courseCount: string;
  classTestCount: string;
  rate: string;
}

const clean = (value: string) => value.trim().toLocaleLowerCase();
const sameTeacher = (left: string, right: string) => clean(left) === clean(right);

export function collectTeacherNames(bill: ExaminationBillData): string[] {
  const names = new Set<string>();
  const add = (name: string) => name.trim() && names.add(name.trim());

  bill.committees.forEach((teacher) => add(teacher.name));
  [...bill.courseDuties.obe, ...bill.courseDuties.nonObe].forEach((course) =>
    course.parts.forEach((part) => {
      add(part.teacher);
      part.additionalTeachers.forEach((teacher) => add(teacher.name));
    })
  );
  bill.sessionalDuties.forEach((course) => {
    add(course.teacher);
    course.additionalTeachers.forEach((teacher) => add(teacher.name));
  });
  [
    ...bill.questionWorks,
    ...bill.scrutinies.obe,
    ...bill.scrutinies.nonObe,
    ...bill.studentDuties,
    ...bill.courseAdvisers,
    ...bill.thesisTeachers,
    ...bill.verificationTeachers,
    ...bill.courseCoordinatorTeachers,
    ...bill.practicalSurveyingTeachers,
  ].forEach((teacher) => add(teacher.name));

  return Array.from(names).sort((a, b) => a.localeCompare(b));
}

export function deriveTeacherRows(
  bill: ExaminationBillData,
  teacherName: string
): IndividualBillRow[] {
  if (!teacherName) return [];
  let sequence = 0;
  const rows: IndividualBillRow[] = [];
  const add = (row: Omit<IndividualBillRow, "id">) =>
    rows.push({ ...row, id: `duty-${sequence++}` });

  [...bill.courseDuties.obe, ...bill.courseDuties.nonObe].forEach((course) => {
    course.parts.forEach((part) => {
      const entries = [
        { name: part.teacher, duties: part.duties, students: part.students },
        ...part.additionalTeachers.map((teacher) => ({
          name: teacher.name,
          duties: teacher.duties,
          students: teacher.students,
        })),
      ];
      entries.filter((entry) => sameTeacher(entry.name, teacherName)).forEach((entry) => {
        if (entry.duties.paperSetter)
          add({ description: "প্রশ্নপত্র প্রণয়ন", course: course.courseCode, quantity: "", courseCount: "1", classTestCount: "", rate: "5000" });
        if (entry.duties.examiner)
          add({ description: "উত্তরপত্র পরীক্ষণ", course: course.courseCode, quantity: entry.students.examiner, courseCount: "1", classTestCount: "", rate: "120" });
        if (entry.duties.classTest)
          add({ description: "ক্লাস টেস্ট", course: course.courseCode, quantity: String(entry.students.classTestStudents || ""), courseCount: "1", classTestCount: String(entry.students.classTestCount || 2), rate: "50" });
        if (entry.duties.assignment) {
          const students = entry.students.classTestStudents;
          add({ description: "এসাইনমেন্ট / প্রেজেন্টেশন", course: course.courseCode, quantity: students ? `${students}/2` : entry.students.assignment, courseCount: "1", classTestCount: "2", rate: "50" });
        }
        if (entry.duties.courseFile)
          add({ description: "কোর্স ফাইল প্রস্তুতকরণ", course: course.courseCode, quantity: "", courseCount: "1", classTestCount: "", rate: "3000" });
      });
    });
  });

  bill.sessionalDuties.forEach((course) => {
    const entries = [
      { name: course.teacher, duties: course.duties, students: course.students },
      ...course.additionalTeachers.map((teacher) => ({ name: teacher.name, duties: teacher.duties, students: teacher.students })),
    ];
    entries.filter((entry) => sameTeacher(entry.name, teacherName)).forEach((entry) => {
      if (entry.duties.sessional)
        add({ description: `ব্যবহারিক / সেশনাল (${course.credit || "-"})`, course: course.courseCode, quantity: String(entry.students.sessional || ""), courseCount: "1", classTestCount: "", rate: "" });
      if (entry.duties.boardViva)
        add({ description: "মৌখিক পরীক্ষা (ফাইনাল)", course: course.courseCode, quantity: String(entry.students.boardViva || ""), courseCount: "1", classTestCount: "", rate: "" });
      if (entry.duties.courseFile)
        add({ description: "কোর্স ফাইল প্রস্তুতকরণ", course: course.courseCode, quantity: "", courseCount: "1", classTestCount: "", rate: "3000" });
    });
  });

  [...bill.scrutinies.obe, ...bill.scrutinies.nonObe]
    .filter((teacher) => sameTeacher(teacher.name, teacherName))
    .forEach((teacher) => add({ description: "স্ক্রুটিনি", course: "", quantity: String(teacher.scriptCount || ""), courseCount: "", classTestCount: "", rate: "" }));
  bill.studentDuties.filter((teacher) => sameTeacher(teacher.name, teacherName)).forEach((teacher) =>
    add({ description: "টেবুলেশন", course: "", quantity: String(teacher.students || bill.tabulationStudentCount), courseCount: "", classTestCount: "", rate: "90" })
  );
  bill.questionWorks.filter((teacher) => sameTeacher(teacher.name, teacherName)).forEach(() =>
    add({ description: "প্রশ্নপত্র টাইপ, অঙ্কন ও তুলনা, প্রশ্নপত্র ছাপানো", course: "", quantity: `${bill.questionWorkTotal || 5}/${bill.questionWorks.filter((teacher) => teacher.name.trim()).length || 1}`, courseCount: "", classTestCount: "", rate: "2400" })
  );
  return rows;
}

export function evaluateQuantity(value: string): number {
  const normalized = value.trim();
  if (!normalized) return 1;
  const parts = normalized.split("/").map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return 0;
  return parts.length === 2 && parts[1] !== 0 ? parts[0] / parts[1] : parts[0];
}

export function rowAmount(row: IndividualBillRow): number {
  const rate = Number(row.rate) || 0;
  const quantity = evaluateQuantity(row.quantity);
  const courses = evaluateQuantity(row.courseCount);
  const tests = evaluateQuantity(row.classTestCount);
  return Math.round(rate * quantity * courses * tests * 100) / 100;
}

const small = ["শূন্য", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ", "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ"];
const tens = ["", "", "বিশ", "ত্রিশ", "চল্লিশ", "পঞ্চাশ", "ষাট", "সত্তর", "আশি", "নব্বই"];

function underHundred(value: number): string {
  if (value < 20) return small[value];
  const remainder = value % 10;
  return `${tens[Math.floor(value / 10)]}${remainder ? ` ${small[remainder]}` : ""}`;
}

export function amountInBanglaWords(input: number): string {
  const value = Math.max(0, Math.floor(input));
  if (value < 100) return underHundred(value);
  const groups: [number, string][] = [[10000000, "কোটি"], [100000, "লক্ষ"], [1000, "হাজার"], [100, "শত"]];
  let remainder = value;
  const words: string[] = [];
  groups.forEach(([unit, label]) => {
    const count = Math.floor(remainder / unit);
    if (count) {
      words.push(`${amountInBanglaWords(count)} ${label}`);
      remainder %= unit;
    }
  });
  if (remainder) words.push(underHundred(remainder));
  return words.join(" ");
}
