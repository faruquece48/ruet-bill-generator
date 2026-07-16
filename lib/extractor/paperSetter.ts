import type { SectionBlock } from "@/types/block";
import type { DutyRecord } from "@/types/duty";

export function parsePaperSetter(
  block: SectionBlock
): DutyRecord[] {

  console.log("========== PAPER SETTER ==========");
  console.log(block.content);

  const duties: DutyRecord[] = [];

  const teacherRegex =
    /(Mr\.|Ms\.|Mrs\.|Dr\.)[\s\S]*?Dept\.\s*of\s*([A-Za-z& ]+),\s*RUET/g;

  let match: RegExpExecArray | null;

  while ((match = teacherRegex.exec(block.content)) !== null) {

    duties.push({

      dutyType: "paperSetterExaminer",

      teacherName: match[0].split(",")[0].trim(),

      designation: "",

      department: match[2].trim(),

      courseCode: "",

      courseTitle: "",

      paperSet: 0,

      scripts: 0,

      pageNumber: block.pageNumber,

    });

  }

  return duties;

}