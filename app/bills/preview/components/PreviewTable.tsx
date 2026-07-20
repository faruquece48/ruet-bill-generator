"use client";
import type { ColumnWidths } from "../../create/components/types";

export interface PreviewColumn {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
}

interface Props {
  columns: PreviewColumn[];
  rows: Record<string, any>[];
  widths: ColumnWidths;
  showSerial?: boolean;
  mergeColumnKey?: string;
  mergeValue?: React.ReactNode;
}

export default function PreviewTable({
  columns,
  rows,
  widths,
  showSerial = false,
  mergeColumnKey,
  mergeValue,
}: Props) {
  const alignClass = (a?: string, key?: string) =>
    a === "center" || key === "sl" ? "text-center" : a === "right" ? "text-right" : "text-left";

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-gray-400">
      <table className="w-full table-fixed border-collapse text-xs">
        <colgroup>
          {columns.map((c) => (
            <col key={c.key} style={{ width: `${widths[c.key] ?? 0}%` }} />
          ))}
        </colgroup>
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key}
                className={`border border-gray-400 px-2 py-1.5 font-normal ${alignClass(c.align, c.key)}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => {
                if (mergeColumnKey && c.key === mergeColumnKey) {
                  if (i !== 0) return null;
                  return (
                    <td
                      key={c.key}
                      rowSpan={rows.length}
                      className="border border-gray-400 px-2 py-1 text-center align-middle"
                    >
                      {mergeValue ?? "—"}
                    </td>
                  );
                }
                return (
                  <td
                    key={c.key}
                    className={`border border-gray-400 px-2 py-1 align-top ${alignClass(c.align, c.key)}`}
                  >
                    {c.key === "sl" && showSerial ? i + 1 : formatCell(row[c.key])}
                  </td>
                );
              })}
            </tr>
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