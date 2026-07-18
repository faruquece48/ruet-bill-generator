"use client";
import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

interface Props {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

export default function SectionPanel({
  title,
  defaultOpen = false,
  children,
}: Props) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold text-gray-800">{title}</span>
        {open ? (
          <ChevronUp className="h-4 w-4 text-gray-500" />
        ) : (
          <ChevronDown className="h-4 w-4 text-gray-500" />
        )}
      </button>
      {open && <div className="border-t p-4 space-y-4">{children}</div>}
    </div>
  );
}