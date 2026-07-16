import type { SectionBlock } from "@/types/block";

const BLOCKS = [
  {
    title: "Paper Setter & Examiner",
    type: "paperSetterExaminer",
  },
  {
    title: "Tabulation",
    type: "tabulation",
  },
  {
    title: "Grade Sheet Preparation",
    type: "gradePreparation",
  },
  {
    title: "Grade Sheet Verification",
    type: "gradeVerification",
  },
  {
    title: "Board Viva",
    type: "boardViva",
  },
  {
    title: "Course Advisers",
    type: "courseAdviser",
  },
];

export function buildBlocks(text: string): SectionBlock[] {

  const positions: {
    index: number;
    title: string;
    type: string;
  }[] = [];

  // Find every block position
  BLOCKS.forEach((block) => {

    let start = 0;

    while (true) {

      const index = text.indexOf(block.title, start);

      if (index === -1) break;

      positions.push({
        index,
        title: block.title,
        type: block.type,
      });

      start = index + 1;

    }

  });

  // Sort by document position
  positions.sort((a, b) => a.index - b.index);

  const blocks: SectionBlock[] = [];

  for (let i = 0; i < positions.length; i++) {

    const current = positions[i];

    const next = positions[i + 1];

    const start = current.index;

    const end = next ? next.index : text.length;

    const content = text.substring(start, end);

console.log("==================================");
console.log("BLOCK TITLE:", current.title);
console.log("BLOCK TYPE:", current.type);
console.log("BLOCK CONTENT:");
console.log(content);
console.log("==================================");

blocks.push({

      id: i + 1,

      pageNumber: 0,

      title: current.title,

      type: current.type,

      content,

    });

  }

  return blocks;

}