import type { ExaminationBillData } from "../create/components/types";

export interface IndividualBillRow {
  id: string;
  description: string;
  course: string;
  quantity: string;
  courseCount: string;
  classTestCount: string;
  rate: string;
  minimumAmount?: number;
}

const withoutCourtesyTitle = (value: string) =>
  value.trim().replace(/^(mr|mrs|mst)\.?(?=\s)/i, "").trim();
const clean = (value: string) => withoutCourtesyTitle(value).toLocaleLowerCase();
const sameTeacher = (left: string, right: string) => clean(left) === clean(right);

export function collectTeacherNames(bill: ExaminationBillData): string[] {
  const names = new Map<string, string>();
  const add = (name: string) => {
    const displayName = withoutCourtesyTitle(name);
    if (displayName) names.set(clean(displayName), displayName);
  };

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

  return Array.from(names.values()).sort((a, b) => a.localeCompare(b));
}

export interface TeacherNameWarning {
  name: string;
  location: string;
}

export function collectTeacherNameWarnings(bill: ExaminationBillData): TeacherNameWarning[] {
  const warnings: TeacherNameWarning[] = [];
  const check = (name: string, location: string) => {
    const trimmed = name.trim();
    if (!trimmed || /(?:^|\s)dr\.?(?=\s|$)/i.test(trimmed) || /^(mr|mrs|mst)\.?(?=\s)/i.test(trimmed)) return;
    warnings.push({ name: trimmed, location });
  };

  bill.committees.forEach((teacher, index) => check(teacher.name, `Examination Committee, row ${index + 1}`));
  const checkCourses = (label: string, courses: ExaminationBillData["courseDuties"]["obe"]) =>
    courses.forEach((course) => course.parts.forEach((part) => {
      const courseLocation = `${label}, course ${course.courseCode || "(course code missing)"}, Part ${part.part}`;
      check(part.teacher, courseLocation);
      part.additionalTeachers.forEach((teacher, index) => check(teacher.name, `${courseLocation}, additional teacher ${index + 1}`));
    }));
  checkCourses("OBE course duties", bill.courseDuties.obe);
  checkCourses("Non-OBE course duties", bill.courseDuties.nonObe);
  bill.sessionalDuties.forEach((course) => {
    const location = `Sessional duties, course ${course.courseCode || "(course code missing)"}`;
    check(course.teacher, location);
    course.additionalTeachers.forEach((teacher, index) => check(teacher.name, `${location}, additional teacher ${index + 1}`));
  });
  const checkList = (label: string, teachers: { name: string }[]) =>
    teachers.forEach((teacher, index) => check(teacher.name, `${label}, row ${index + 1}`));
  checkList("Question typing/sketching/printing", bill.questionWorks);
  checkList("OBE scrutiny", bill.scrutinies.obe);
  checkList("Non-OBE scrutiny", bill.scrutinies.nonObe);
  checkList("Student duties", bill.studentDuties);
  checkList("Course advisers", bill.courseAdvisers);
  checkList("Thesis/project examination", bill.thesisTeachers);
  checkList("Final-result verification", bill.verificationTeachers);
  checkList("Course coordinators", bill.courseCoordinatorTeachers);
  checkList("Practical surveying", bill.practicalSurveyingTeachers);
  return warnings;
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

  bill.committees.forEach((member, index) => {
    if (!sameTeacher(member.name, teacherName)) return;
    add({
      description: index === 0 ? "পরীক্ষা কমিটির সভাপতি" : "পরীক্ষা কমিটির সদস্য",
      course: "",
      quantity: "",
      courseCount: "",
      classTestCount: "",
      rate: "5000",
    });
  });

  [
    ...bill.courseDuties.obe.map((course) => ({ course, isNonObe: false })),
    ...bill.courseDuties.nonObe.map((course) => ({ course, isNonObe: true })),
  ].forEach(({ course, isNonObe }) => {
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
          add({ description: "প্রশ্নপত্র প্রণয়ন", course: course.courseCode, quantity: "", courseCount: "1", classTestCount: "", rate: "5000" });
        if (entry.duties.examiner)
          add({ description: "সেমিস্টার ফাইনাল", course: course.courseCode, quantity: entry.students.examiner, courseCount: "1", classTestCount: "", rate: "120" });
        if (entry.duties.classTest)
          add({ description: "ক্লাস টেস্ট", course: course.courseCode, quantity: String(entry.students.classTestStudents || ""), courseCount: "1", classTestCount: String(entry.students.classTestCount || 2), rate: "50" });
        if (entry.duties.assignment) {
          const students = entry.students.classTestStudents;
          add({ description: "এসাইনমেন্ট / প্রেজেন্টেশন", course: course.courseCode, quantity: students ? `${students}/2` : entry.students.assignment, courseCount: "1", classTestCount: "2", rate: "50" });
        }
        if (entry.duties.courseFile && !isNonObe)
          add({ description: "কোর্স ফাইল প্রস্তুতকরণ", course: course.courseCode, quantity: "", courseCount: "1/2", classTestCount: "", rate: "6000" });
      });
    });
  });

  bill.sessionalDuties.forEach((course) => {
    const entries = [
      { name: course.teacher, duties: course.duties, students: course.students },
      ...course.additionalTeachers.map((teacher) => ({ name: teacher.name, duties: teacher.duties, students: teacher.students })),
    ];
    if (course.courseCode.replace(/\s+/g, "").toUpperCase() === "BECM4100") {
      const engagedEntries = entries.slice(1).filter((entry) => entry.name.trim());
      const engagedTeacherCount = engagedEntries.length;
      engagedEntries.filter((entry) => sameTeacher(entry.name, teacherName)).forEach(() => {
        const totalStudents = Number(course.students.sessional) || 0;
        add({
          description: "ইন্ডাস্ট্রিয়াল অ্যাটাচমেন্ট",
          course: course.courseCode,
          quantity: totalStudents && engagedTeacherCount
            ? `${totalStudents}/${engagedTeacherCount}`
            : "",
          courseCount: "1",
          classTestCount: "",
          rate: "400",
        });
        add({
          description: "কোর্স ফাইল প্রস্তুতকরণ",
          course: course.courseCode,
          quantity: "",
          courseCount: `1/${engagedTeacherCount}`,
          classTestCount: "",
          rate: "6000",
        });
      });
      return;
    }
    entries.filter((entry) => sameTeacher(entry.name, teacherName)).forEach((entry) => {
      if (entry.duties.sessional)
        add({ description: Number(course.credit) === 1.5 ? "সেশনাল (১.৫)" : "সেশনাল (০.৭৫)", course: course.courseCode, quantity: String(entry.students.sessional || ""), courseCount: "1", classTestCount: "", rate: "400" });
      if (entry.duties.boardViva)
        add({ description: "ভাইভা (সেন্ট্রাল/বোর্ড)", course: course.courseCode, quantity: String(entry.students.boardViva || ""), courseCount: "1", classTestCount: "", rate: "150" });
      if (entry.duties.courseFile)
        add({ description: "কোর্স ফাইল প্রস্তুতকরণ", course: course.courseCode, quantity: "", courseCount: "1", classTestCount: "", rate: "6000" });
    });
  });

  [...bill.scrutinies.obe, ...bill.scrutinies.nonObe]
    .filter((teacher) => sameTeacher(teacher.name, teacherName))
    .forEach((teacher) => add({ description: "স্ক্রুটিনি", course: "", quantity: String(teacher.scriptCount || ""), courseCount: "", classTestCount: "", rate: "30", minimumAmount: 1200 }));
  bill.studentDuties
    .filter((teacher) => sameTeacher(teacher.name, teacherName))
    .forEach(() =>
      add({
        description: "রেজাল্ট প্রস্তুতকরণ",
        course: "",
        quantity: bill.tabulationStudentCount
          ? `${bill.tabulationStudentCount}/${bill.studentDuties.length}`
          : "",
        courseCount: "",
        classTestCount: "",
        rate: "90",
      })
    );
  bill.studentDuties
    .filter((teacher) => sameTeacher(teacher.name, teacherName))
    .forEach(() =>
      add({
        description: "রেজাল্ট ভেরিফিকেশন",
        course: "",
        quantity: bill.tabulationStudentCount
          ? `${bill.tabulationStudentCount}/${bill.studentDuties.length}`
          : "",
        courseCount: "",
        classTestCount: "",
        rate: "60",
      })
    );
  bill.studentDuties.filter((teacher) => sameTeacher(teacher.name, teacherName)).forEach(() =>
    add({ description: "টেবুলেশন", course: "", quantity: String(bill.tabulationStudentCount || ""), courseCount: "", classTestCount: "", rate: "90", minimumAmount: 1500 })
  );
  bill.questionWorks.filter((teacher) => sameTeacher(teacher.name, teacherName)).forEach(() =>
    add({ description: "প্রশ্নপত্র টাইপ, অঙ্কন ও তুলনা, প্রশ্নপত্র ছাপানো", course: "", quantity: `${bill.questionWorkTotal || 5}/${bill.questionWorks.filter((teacher) => teacher.name.trim()).length || 1}`, courseCount: "", classTestCount: "", rate: "2400" })
  );
  bill.thesisTeachers
    .filter((teacher) => sameTeacher(teacher.name, teacherName))
    .forEach((teacher) => {
      if (teacher.supervisorCount !== "") {
        add({
          description: "থিসিস সুপারভিশন",
          course: "",
          quantity: String(teacher.supervisorCount),
          courseCount: "",
          classTestCount: "",
          rate: "6000",
        });
      }
      if (teacher.examinerCount !== "") {
        add({
          description: "পরীক্ষক (বহিঃ)",
          course: "",
          quantity: String(teacher.examinerCount),
          courseCount: "",
          classTestCount: "",
          rate: "4000",
        });
      }
      if (teacher.attendsViva) {
        add({
          description: "মৌখিক পরীক্ষা (ফাইনাল)",
          course: "",
          quantity: "1",
          courseCount: "",
          classTestCount: "",
          rate: "250",
        });
      }
    });
  bill.practicalSurveyingTeachers
    .filter((teacher) => sameTeacher(teacher.name, teacherName))
    .forEach(() =>
      add({
        description: "ইঞ্জিনিয়ারিং সার্ভে",
        course: "CE 1226",
        quantity: String(bill.practicalSurveyingStudentCount || ""),
        courseCount: "1",
        classTestCount: "",
        rate: "600",
      })
    );
  bill.verificationTeachers
    .filter((teacher) => sameTeacher(teacher.name, teacherName))
    .forEach(() =>
      add({
        description: "ফাইনাল গ্রাজুয়েশন রেজাল্ট ভেরিফিকেশন",
        course: "",
        quantity: bill.verificationStudentCount
          ? `${bill.verificationStudentCount}/${bill.verificationTeachers.filter((teacher) => teacher.name.trim()).length || 1}`
          : "",
        courseCount: "",
        classTestCount: "",
        rate: "2500",
      })
    );
  const namedCourseAdviserCount = bill.courseAdvisers.filter(
    (adviser) => adviser.name.trim()
  ).length;
  bill.courseAdvisers
    .filter((adviser) => sameTeacher(adviser.name, teacherName))
    .forEach(() =>
      add({
        description: "কোর্স এডভাইজার",
        course: "",
        quantity: bill.courseAdviserStudentCount
          ? namedCourseAdviserCount > 1
            ? `${bill.courseAdviserStudentCount}/${namedCourseAdviserCount}`
            : bill.courseAdviserStudentCount
          : "",
        courseCount: "",
        classTestCount: "",
        rate: "255",
      })
    );
  return rows;
}

export interface RemunerationChartRow {
  id: string;
  description: string;
  duty?: IndividualBillRow;
}

export interface RemunerationChartSection {
  serial: number;
  title: string;
  rows: RemunerationChartRow[];
}

/**
 * Returns the number of consecutive rows that share this description.
 * A zero means the cell is covered by the rowSpan of an earlier row.
 */
export function descriptionRowSpan(
  rows: RemunerationChartRow[],
  rowIndex: number
): number {
  const description = rows[rowIndex]?.description;
  if (rowIndex > 0 && rows[rowIndex - 1]?.description === description) return 0;

  let span = 1;
  while (rows[rowIndex + span]?.description === description) span += 1;
  return span;
}

interface ChartTemplate {
  label: string;
  matches: (description: string) => boolean;
}

const exact = (label: string): ChartTemplate => ({
  label,
  matches: (description) => description === label,
});

/**
 * Keeps the university's complete remuneration chart visible. A template row
 * is retained when no matching duty exists; repeated duties expand beneath the
 * same work-description heading.
 */
export function buildRemunerationChart(
  duties: IndividualBillRow[]
): RemunerationChartSection[] {
  const templates: { title: string; items: ChartTemplate[] }[] = [
    { title: "প্রশ্নপত্র প্রণয়ন", items: [exact("প্রশ্নপত্র প্রণয়ন")] },
    {
      title: "প্রশ্নপত্র নিয়ামক (মডারেশন)",
      items: [exact("পরীক্ষা কমিটির সভাপতি"), exact("পরীক্ষা কমিটির সদস্য")],
    },
    {
      title: "উত্তরপত্র পরীক্ষণ",
      items: [
        exact("সেমিস্টার ফাইনাল"),
        exact("ক্লাস টেস্ট"),
        exact("এসাইনমেন্ট / প্রেজেন্টেশন"),
        exact("কোর্স ফাইল প্রস্তুতকরণ"),
      ],
    },
    {
      title: "ব্যবহারিক / সেশনাল",
      items: [
        exact("ইঞ্জিনিয়ারিং সার্ভে"),
        exact("সেমিনার"),
        exact("প্রজেক্ট ডিজাইন"),
        exact("সেশনাল (১.৫)"),
        exact("সেশনাল (০.৭৫)"),
        exact("ইন্ডাস্ট্রিয়াল অ্যাটাচমেন্ট"),
        exact("ভাইভা (সেন্ট্রাল/বোর্ড)"),
      ],
    },
    {
      title: "থিসিস/প্রজেক্ট পরীক্ষক",
      items: [
        exact("থিসিস সুপারভিশন"),
        exact("পরীক্ষক (বহিঃ)"),
        exact("মৌখিক পরীক্ষা (ফাইনাল)"),
      ],
    },
    {
      title: "টেবুলেশন",
      items: [
        exact("টেবুলেশন"),
        exact("রেজাল্ট প্রস্তুতকরণ"),
        exact("রেজাল্ট ভেরিফিকেশন"),
      ],
    },
    {
      title: "অন্যান্য",
      items: [
        exact("ফাইনাল গ্রাজুয়েশন রেজাল্ট ভেরিফিকেশন"),
        exact("কোর্স এডভাইজার"),
        exact("কোর্স কো-অর্ডিনেটর"),
      ],
    },
    { title: "স্ক্রুটিনি", items: [exact("স্ক্রুটিনি")] },
    {
      title: "প্রশ্নপত্র প্রস্তুতকরণ",
      items: [
        exact("প্রশ্নপত্র টাইপ, অঙ্কন ও তুলনা, প্রশ্নপত্র ছাপানো"),
      ],
    },
  ];

  const used = new Set<string>();
  const sections = templates.map((section, sectionIndex) => ({
    serial: sectionIndex + 1,
    title: section.title,
    rows: section.items.flatMap((item, itemIndex) => {
      const matching = duties.filter(
        (duty) => !used.has(duty.id) && item.matches(duty.description)
      );
      matching.forEach((duty) => used.add(duty.id));
      return matching.length
        ? matching.map((duty) => ({
            id: duty.id,
            description: duty.description,
            duty,
          }))
        : [{
            id: `blank-${sectionIndex}-${itemIndex}`,
            description: item.label,
          }];
    }),
  }));

  const unmatched = duties.filter((duty) => !used.has(duty.id));
  if (unmatched.length) {
    const other = sections[6];
    other.rows.push(
      ...unmatched.map((duty) => ({
        id: duty.id,
        description: duty.description,
        duty,
      }))
    );
  }
  return sections;
}

export function evaluateQuantity(value: string | number | null | undefined): number {
  const normalized = String(value ?? "").trim();
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
  const calculatedAmount = Math.round(rate * quantity * courses * tests * 100) / 100;
  return Math.max(row.minimumAmount ?? 0, calculatedAmount);
}

export function isMinimumAmountApplied(row: IndividualBillRow): boolean {
  if (!row.minimumAmount) return false;
  const rate = Number(row.rate) || 0;
  const calculatedAmount =
    rate *
    evaluateQuantity(row.quantity) *
    evaluateQuantity(row.courseCount) *
    evaluateQuantity(row.classTestCount);
  return calculatedAmount < row.minimumAmount;
}

const small = ["শূন্য", "এক", "দুই", "তিন", "চার", "পাঁচ", "ছয়", "সাত", "আট", "নয়", "দশ", "এগারো", "বারো", "তেরো", "চৌদ্দ", "পনেরো", "ষোলো", "সতেরো", "আঠারো", "উনিশ"];
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