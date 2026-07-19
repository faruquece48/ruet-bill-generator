"use client";
import { Fragment } from "react";
import type { ColumnWidths } from "../../create/components/types";
import type { CourseGroup } from "../../create/components/pdf/pdfHelpers";

export interface GroupedColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
}

interface Props<T> {
  entryColumns: GroupedColumn[];
  groups: CourseGroup<T>[];
  widths: ColumnWidths; // keys: "course" + entryColumns[].key
}

export default function GroupedCourseTable<T extends Record<string, any>>({
  entryColumns,
  groups,
  widths,
}: Props<T>) {
  const alignClass = (a?: string) =>
    a === "center" ? "text-center" : a === "right" ? "text-right" : "text-left";

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-400">
      <table className="w-full table-fixed border-collapse text-xs">
        <colgroup>
          <col style={{ width: `${widths.course ?? 0}%` }} />
          {entryColumns.map((c) => (
            <col key={c.key} style={{ width: `${widths[c.key] ?? 0}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            <th className="border border-gray-400 px-2 py-1.5 text-left font-semibold">
              Course No. &amp; Title
            </th>
            {entryColumns.map((c) => (
              <th key={c.key} className={`border border-gray-400 px-2 py-1.5 font-semibold ${alignClass(c.align)}`}>
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group, gi) => (
            <Fragment key={gi}>
              {group.entries.map((entry, ei) => (
                <tr key={ei}>
                  {ei === 0 && (
                    <td rowSpan={group.entries.length} className="border border-gray-400 px-2 py-1 align-middle">
                      <div className="font-semibold">{group.courseCode}</div>
                      <div>{group.courseTitle}</div>
                    </td>
                  )}
                  {entryColumns.map((c) => (
                    <td key={c.key} className={`border border-gray-400 px-2 py-1 align-top ${alignClass(c.align)}`}>
                      {formatCell((entry as any)[c.key])}
                    </td>
                  ))}
                </tr>
              ))}
            </Fragment>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(value: any): React.ReactNode {
  if (value === true) return "Yes";
  if (value === false || value === "" || value === undefined || value === null) return "—";
  return String(value);
}