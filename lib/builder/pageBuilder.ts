import type { Page } from "@/types/page";

export function buildPages(rawText: string): Page[] {
  const pages: Page[] = [];

  const regex =
    /========== PAGE (\d+) ==========\s*([\s\S]*?)(?=========== PAGE \d+ ==========|$)/g;

  let match: RegExpExecArray | null;

  while ((match = regex.exec(rawText)) !== null) {
    pages.push({
      pageNumber: Number(match[1]),
      text: match[2].trim(),
    });
  }

  return pages;
}