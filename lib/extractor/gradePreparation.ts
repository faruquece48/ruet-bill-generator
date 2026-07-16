import type { SectionBlock } from "@/types/block";
import type { DutyRecord } from "@/types/duty";

export function parseGradePreparation(
  block: SectionBlock
): DutyRecord[] {

  console.log("========== GRADE PREPARATION ==========");
  console.log(block.content);

  return [];

}