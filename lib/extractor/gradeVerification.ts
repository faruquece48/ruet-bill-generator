import type { SectionBlock } from "@/types/block";
import type { DutyRecord } from "@/types/duty";

export function parseGradeVerification(
  block: SectionBlock
): DutyRecord[] {

  console.log("========== GRADE VERIFICATION ==========");
  console.log(block.content);

  return [];

}