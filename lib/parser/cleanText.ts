export function cleanText(rawText: string): string {
  return rawText

    // Convert tabs to spaces
    .replace(/\t/g, " ")

    // Remove multiple spaces
    .replace(/[ ]+/g, " ")

    // Remove spaces before newlines
    .replace(/ +\n/g, "\n")

    // Remove extra blank lines
    .replace(/\n{3,}/g, "\n\n")

    // Trim whole document
    .trim();
}