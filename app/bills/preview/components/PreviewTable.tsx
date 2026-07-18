"use client";
import type { ColumnWidths } from "../../create/components/types";

export interface PreviewColumn {
  key: string;
  label: string;
}

interface Props {
  columns: PreviewColumn[];
  rows: Record<string, any>[];
  widths: ColumnWidths;
  showSerial?: boolean;
}

export default function PreviewTable({
  columns,
  rows,
  widths,
  showSerial = false,
}: Props) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full border-collapse text-xs">
        <colgroup>
          {columns.map((c) => (
            <col key={c.key} style={{ width: `${widths[c.key] ?? 0}%` }} />
          ))}
        </colgroup>
        <thead className="bg-slate-100">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="border px-2 py-1.5 text-left">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {columns.map((c) => (
                <td key={c.key} className="border px-2 py-1 align-top">
                  {c.key === "sl" && showSerial
                    ? i + 1
                    : formatCell(row[c.key])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function formatCell(value: any): React.ReactNode {
  if (value === true) return "✓";
  if (value === false) return "—";
  if (value === "" || value === undefined || value === null) return "—";
  return String(value);
}