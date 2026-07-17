"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { BillInfo } from "./types";

interface Props {
  bill: BillInfo;
  setBill: React.Dispatch<React.SetStateAction<BillInfo>>;
}

export default function BillInformation({ bill, setBill }: Props) {
  const updateField = (field: keyof BillInfo, value: string) => {
    setBill((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const heading =
    bill.examType === "semester"
      ? `${bill.examination || "B.Sc. Engineering"} ${bill.year || ""} ${
          bill.semester || ""
        } Semester Examination ${bill.examYear || "2024"} (Series ${
          bill.series || "2023"
        })`
      : `${bill.examination || "B.Sc. Engineering"} ${
          bill.year || ""
        } Backlog Examination ${bill.examYear || "2024"} (Series ${
          bill.series || "2023"
        })`;

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-xl font-bold">1. Examination Information</h2>

      <div className="rounded-lg bg-slate-100 p-4">
        <p className="text-sm text-gray-500 mb-1">
          Generated Examination Title
        </p>
        <p className="font-semibold text-lg">{heading}</p>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Bill No.</label>
        <Input
          placeholder="Example: 01"
          value={bill.billNo}
          onChange={(e) => updateField("billNo", e.target.value)}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">Examination</label>
        <Select
          value={bill.examination}
          onValueChange={(value) => updateField("examination", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Examination" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="B.Sc. Engineering">B.Sc. Engineering</SelectItem>
            <SelectItem value="M.Sc. Engineering">M.Sc. Engineering</SelectItem>
            <SelectItem value="PhD">PhD</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Academic Year
          </label>
          <Select
            value={bill.year}
            onValueChange={(value) => updateField("year", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1st Year">1st Year</SelectItem>
              <SelectItem value="2nd Year">2nd Year</SelectItem>
              <SelectItem value="3rd Year">3rd Year</SelectItem>
              <SelectItem value="4th Year">4th Year</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">
            Examination Type
          </label>
          <Select
            value={bill.examType}
            onValueChange={(value) =>
              updateField("examType", value as "semester" | "backlog")
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="semester">Semester Examination</SelectItem>
              <SelectItem value="backlog">Backlog Examination</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {bill.examType === "semester" && (
        <div>
          <label className="mb-2 block text-sm font-medium">Semester</label>
          <Select
            value={bill.semester}
            onValueChange={(value) => updateField("semester", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Odd">Odd Semester</SelectItem>
              <SelectItem value="Even">Even Semester</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Examination Year
          </label>
          <Input
            placeholder="2024"
            value={bill.examYear}
            onChange={(e) => updateField("examYear", e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Series</label>
          <Input
            placeholder="2023"
            value={bill.series}
            onChange={(e) => updateField("series", e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">
          Evaluation System
        </label>
        <Select
          value={bill.evaluationSystem}
          onValueChange={(value) =>
            updateField("evaluationSystem", value as "obe" | "mixed")
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Select Evaluation System" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="obe">OBE (New Syllabus)</SelectItem>
            <SelectItem value="mixed">Mixed (OBE + Non-OBE)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}