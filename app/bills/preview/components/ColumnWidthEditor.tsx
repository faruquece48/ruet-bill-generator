"use client";
import { Input } from "@/components/ui/input";
import type { ColumnWidths } from "../../create/components/types";

interface Props {
  widths: ColumnWidths;
  setWidths: (data: ColumnWidths) => void;
  labels?: Record<string, string>;
}

export default function ColumnWidthEditor({
  widths,
  setWidths,
  labels = {},
}: Props) {
  const keys = Object.keys(widths);
  const total = keys.reduce((sum, k) => sum + (widths[k] || 0), 0);

  const updateWidth = (key: string, value: string) => {
    const num = value === "" ? 0 : Number(value);
    setWidths({ ...widths, [key]: num });
  };

  return (
    <div className="rounded-lg border bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <p className="text-sm font-medium text-gray-700">
          Column Widths (%)
        </p>
        <span
          className={`text-xs font-semibold ${
            total === 100 ? "text-green-600" : "text-red-600"
          }`}
        >
          Total: {total}% {total !== 100 && "(should be 100%)"}
        </span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {keys.map((key) => (
          <div key={key}>
            <label className="mb-1 block text-xs text-gray-500">
              {labels[key] || key}
            </label>
            <Input
              type="number"
              min={0}
              max={100}
              value={widths[key]}
              onChange={(e) => updateWidth(key, e.target.value)}
              className="h-8"
            />
          </div>
        ))}
      </div>
    </div>
  );
}