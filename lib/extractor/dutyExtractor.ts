import type { SectionBlock } from "@/types/block";
import type { DutyRecord } from "@/types/duty";

import { parsePaperSetter } from "./paperSetter";
import { parseTabulation } from "./tabulation";
import { parseGradePreparation } from "./gradePreparation";
import { parseGradeVerification } from "./gradeVerification";
import { parseBoardViva } from "./boardViva";

export function extractDutyRecords(
  blocks: SectionBlock[]
): DutyRecord[] {

  const duties: DutyRecord[] = [];

  blocks.forEach((block) => {

    switch (block.type) {

      case "paperSetterExaminer":
        duties.push(...parsePaperSetter(block));
        break;

      case "tabulation":
        duties.push(...parseTabulation(block));
        break;

      case "gradePreparation":
        duties.push(...parseGradePreparation(block));
        break;

      case "gradeVerification":
        duties.push(...parseGradeVerification(block));
        break;

      case "boardViva":
        duties.push(...parseBoardViva(block));
        break;

      default:
        break;
    }

  });

  return duties;

}