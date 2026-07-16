import type { SectionBlock } from "@/types/block";
import type { DutyRecord } from "@/types/duty";

export function parseTabulation(
  block: SectionBlock
): DutyRecord[] {

  console.log("========== TABULATION ==========");
  console.log(block.content);

  return [];

}