import { Section } from "@/types/section";

export function classifySection(
  title: string
): Section["type"] {

  const text = title.toLowerCase();

  if (text === "examination committee")
    return "committee";

  if (text.includes("paper setter"))
    return "paperSetterExaminer";

  if (text.includes("tabulation"))
    return "tabulation";

  if (text.includes("grade sheet preparation"))
    return "gradePreparation";

  if (text.includes("grade sheet verification"))
    return "gradeVerification";

  if (text.includes("board viva"))
    return "boardViva";

  if (text.includes("course adviser"))
    return "courseAdviser";

  return "unknown";
}