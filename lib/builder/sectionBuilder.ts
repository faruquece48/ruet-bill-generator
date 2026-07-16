import type { Page } from "@/types/page";
import type { Section } from "@/types/section";

import { classifySection } from "@/lib/parser/sectionClassifier";

export function buildSections(
  pages: Page[]
): Section[] {

  const sections: Section[] = [];

  let id = 1;

  pages.forEach((page) => {

    const text = page.text;

    // ------------------------------
    // Examination Committee
    // ------------------------------

    if (
      page.pageNumber === 1 &&
      text.includes("Examination Committee")
    ) {

      sections.push({
        id: id++,
        pageNumber: 1,
        title: "Examination Committee",
        content: "",
        type: "committee",
      });

    }

    // ------------------------------
    // List of Teachers Associated...
    // ------------------------------

    const regex =
      /List of Teachers Associated with\s+(.+?)(?=\s+Sl\.?\s*No\.|\s+ST\.?\s*No\.|$)/gi;

    let match: RegExpExecArray | null;

    while ((match = regex.exec(text)) !== null) {

      const title =
        `List of Teachers Associated with ${match[1].trim()}`;
      console.log(title);
      sections.push({
        id: id++,
        pageNumber: page.pageNumber,
        title,
        content: "",
        type: classifySection(title),
      });

    }

  });

  return sections;

}