import type { BillDocument } from "@/types/document";
import type { SectionBlock } from "@/types/block";
import type { DutyRecord } from "@/types/duty";
import { buildTeachers } from "@/lib/builder/teacherBuilder";

export function buildDocument(
  blocks: SectionBlock[],
  duties: DutyRecord[]
): BillDocument {

  return {

    metadata: {
      examination: "",
      semester: "",
      session: "",
      year: "",
      university: "RUET",
    },

    sections: [],

    duties,

    teachers: buildTeachers(duties),

  };

}