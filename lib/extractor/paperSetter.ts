import type { SectionBlock } from "@/types/block";
import type { DutyRecord } from "@/types/duty";
import { mergeLines } from "@/lib/parser/mergeLines";

export function parsePaperSetter(
  block: SectionBlock
): DutyRecord[] {

  const records: DutyRecord[] = [];

  const rawLines = block.content
    .split("\n")
    .map(line => line.trim())
    .filter(Boolean);

  const lines = mergeLines(rawLines);
  console.table(lines.map((line, index) => ({ index, line })));

  let currentCourse = {
    code: "",
    title: "",
  };

  // Guards against duplicate records if the same block content
  // ever gets parsed more than once upstream (see blockBuilder.ts
  // boundary-detection risk flagged separately).
  const seen = new Set<string>();

  for (let i = 0; i < lines.length; i++) {

    const line = lines[i];

    /*
      Course header line, standing alone on its own line.
      Example:
        CE1125 Surveying A
        Chem1107 Chemistry
        PHY1107 Physics

      This intentionally does NOT require a trailing count/honorific
      on the same line -- the original regex assumed course code,
      title, a numeric count, and the teacher's honorific all sat on
      one physical line. Real extracted text shows course headers
      standing alone, with numbered teacher lines following on
      separate lines. If your source PDFs ever DO put a count inline
      after the title, this still matches (the trailing content is
      just not required).
    */
    const courseMatch = line.match(
      /^([A-Za-z]{2,5}\s?\d{3,5})\s+(.+)$/
    );

    // Only treat this as a new course header if the line does NOT
    // also look like a teacher line -- otherwise a teacher whose
    // name happens to start with letters+digits (rare, but possible
    // with OCR artifacts) could be misread as a course header.
    const looksLikeTeacherLine = /^(Mr\.|Ms\.|Dr\.)/.test(line);

    if (courseMatch && !looksLikeTeacherLine) {
      currentCourse.code = courseMatch[1].replace(/\s+/g, "");
      currentCourse.title = courseMatch[2].trim();
      continue;
    }

    /*
      Teacher line, optionally prefixed with a roster number.
      Examples seen in real extracted output:
        02. Mr. MD. Mehedi Hassan Galib, Lecturer, Dept. of BECM, RUET
        30 03. Dr. Md. Johirul Islam, Professor, Dept. of Phy, RUET

      The second example has a stray leading number (likely a count
      from an adjacent table column that bled into this row during
      PDF text extraction -- see reader.ts column-joining behavior).
      We strip ANY leading digits/whitespace before the roster
      number, and separately capture the leading digit run in case
      it turns out to be a real count value once reader.ts is fixed
      to preserve column boundaries. Until that upstream fix lands,
      we can't reliably tell "stray OCR number" from "real duty
      count" here -- so we capture it but do not silently assume
      what it means.
    */
    const rosterMatch = line.match(
      /^(?:(\d+)\s+)?\d+\.\s*(Mr\.|Ms\.|Dr\.)\s*(.+)$/
    );

    if (rosterMatch) {

      const leadingNumber = rosterMatch[1]; // possibly a bled-over count, or undefined
      const honorific = rosterMatch[2];
      const rest = `${honorific} ${rosterMatch[3]}`;

      const teacherMatch = rest.match(
        /^(.*?)\s*,?\s*(Professor|Associate Professor|Assistant Professor|Lecturer)?[,]?\s*Dept\. of\s+([A-Za-z& ]+?)(?:,\s*RUET)?$/
      );

      if (teacherMatch) {

        const teacherName = teacherMatch[1].trim();
        const designation = teacherMatch[2] || "";
        const department = teacherMatch[3].trim();

        const dedupKey = [
          teacherName,
          department,
          currentCourse.code,
        ].join("|");

        if (seen.has(dedupKey)) {
          continue;
        }
        seen.add(dedupKey);

        records.push({

          dutyType: "paperSetterExaminer",

          teacherName,
          designation,
          department,

          courseCode: currentCourse.code,
          courseTitle: currentCourse.title,

          // Left as 0 deliberately -- see note below. Do not assume
          // leadingNumber is this teacher's count without verifying
          // against the raw pre-cleanText source, since it may
          // belong to the PREVIOUS line, not this one.
          paperSet: 0,
          scripts: 0,
          students: 0,

          pageNumber: block.pageNumber,

        });

      }

    } else if (
      // Fallback: plain teacher line with no roster numbering,
      // matching the original file's simpler check.
      /^(Mr\.|Ms\.|Dr\.)/.test(line) &&
      line.includes("Dept.")
    ) {

      const teacherMatch = line.match(
        /^(.*?)\s*,?\s*(Professor|Associate Professor|Assistant Professor|Lecturer)?[,]?\s*Dept\. of\s+([A-Za-z& ]+?)(?:,\s*RUET)?$/
      );

      if (teacherMatch) {

        const teacherName = teacherMatch[1].trim();
        const department = teacherMatch[3].trim();

        const dedupKey = [
          teacherName,
          department,
          currentCourse.code,
        ].join("|");

        if (seen.has(dedupKey)) continue;
        seen.add(dedupKey);

        records.push({
          dutyType: "paperSetterExaminer",
          teacherName,
          designation: teacherMatch[2] || "",
          department,
          courseCode: currentCourse.code,
          courseTitle: currentCourse.title,
          paperSet: 0,
          scripts: 0,
          students: 0,
          pageNumber: block.pageNumber,
        });

      }

    }

  }

  return records;

}