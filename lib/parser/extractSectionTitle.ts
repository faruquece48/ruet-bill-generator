export function extractSectionTitle(line: string): string {

  const text = line.trim();

  // Real section heading at the beginning of the document
  if (/^\d*\.?\s*Examination Committee/i.test(text)) {
    return "Examination Committee";
  }

  // Match: List of Teachers Associated with ...
  const match = text.match(
    /List of Teachers Associated with\s+(.+?)(?=\s+Sl\.?\s*No\.|\s+ST\.?\s*No\.|$)/i
  );

  if (match) {
    return `List of Teachers Associated with ${match[1].trim()}`;
  }

  return text;
}