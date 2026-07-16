import type { Page } from "@/types/page";
import type { DutyRecord } from "@/types/duty";

export function extractDutyRecords(
  pages: Page[]
): DutyRecord[] {

  const duties: DutyRecord[] = [];

  // Teacher name prefixes commonly found in RUET bills
  const teacherRegex =
    /(Mr\.|Mrs\.|Ms\.|Dr\.)\s+[A-Za-z.\s]+?(?=,)/g;

  pages.forEach((page) => {

    console.log(`========== PAGE ${page.pageNumber} ==========`);

    const matches = [...page.text.matchAll(teacherRegex)];

    matches.forEach(match => {

      console.log(match[0]);

      duties.push({
        dutyType: "committee",   // Temporary
        teacherName: match[0].trim(),
        designation: "",
        department: "",
        pageNumber: page.pageNumber,
      });

    });

  });

  return duties;

}