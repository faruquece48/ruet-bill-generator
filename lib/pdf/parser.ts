import { cleanText } from "@/lib/parser/cleanText";
import { buildPages } from "@/lib/builder/pageBuilder";
import { buildSections } from "@/lib/builder/sectionBuilder";
import { buildBlocks } from "@/lib/builder/blockBuilder";
import { extractDutyRecords } from "@/lib/extractor/dutyExtractor";
import { buildDocument } from "@/lib/builder/documentBuilder";

import type { DutyRecord } from "@/types/duty";

export function parsePDF(rawText: string): DutyRecord[] {

  const cleaned = cleanText(rawText);

  const pages = buildPages(cleaned);

  console.log("================================");
  console.log("Pages");
  console.log("================================");

  console.table(
    pages.map(page => ({
      page: page.pageNumber,
      characters: page.text.length,
    }))
  );

  const sections = buildSections(pages);

  console.log("================================");
  console.log("Sections");
  console.log("================================");

  console.table(
    sections.map(section => ({
      id: section.id,
      page: section.pageNumber,
      title: section.title,
      type: section.type,
    }))
  );

  const blocks = buildBlocks(cleaned);

  console.log("================================");
  console.log("Blocks");
  console.log("================================");

  console.table(
    blocks.map(block => ({
      page: block.pageNumber,
      title: block.title,
      length: block.content.length,
    }))
  );

  const duties = extractDutyRecords(blocks);

  console.log("================================");
  console.log("Duty Records");
  console.log("================================");

  console.table(duties);

  const document = buildDocument(
    blocks,
    duties
  );

  console.log("==============================");
  console.log("DOCUMENT");
  console.log("==============================");
  console.log(document);

  return document.duties;
}