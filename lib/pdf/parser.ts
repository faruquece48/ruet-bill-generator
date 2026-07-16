import { cleanText } from "@/lib/parser/cleanText";
import { buildPages } from "@/lib/builder/pageBuilder";
import { buildSections } from "@/lib/builder/sectionBuilder";
import { extractDutyRecords } from "@/lib/extractor/dutyExtractor";

import type { DutyRecord } from "@/types/duty";

export function parsePDF(rawText: string): DutyRecord[] {

  // Step 1: Clean extracted PDF text
  const cleaned = cleanText(rawText);

  // Step 2: Split into logical pages
  const pages = buildPages(cleaned);

  console.log("================================");
  console.log("Pages");
  console.log("================================");
  console.table(
    pages.map((page) => ({
      page: page.pageNumber,
      characters: page.text.length,
    }))
  );

  // Step 3: Detect sections (for debugging and future use)
  const sections = buildSections(pages);

  console.log("================================");
  console.log("Sections");
  console.log("================================");
  console.table(
    sections.map((section) => ({
      id: section.id,
      page: section.pageNumber,
      title: section.title,
      type: section.type,
    }))
  );

  // Step 4: Extract duty records
  const duties = extractDutyRecords(pages);

  console.log("================================");
  console.log("Duty Records");
  console.log("================================");
  console.table(duties);

  return duties;

}