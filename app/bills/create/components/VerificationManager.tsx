"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import type { Designation, VerificationTeacher } from "./types";

const designationList: Designation[] = [
  "Lecturer",
  "Assistant Professor",
  "Associate Professor",
  "Professor",
];

interface Props {
  sectionNumber: number;
  studentCount: string;
  setStudentCount: (value: string) => void;
  verificationTeachers: VerificationTeacher[];
  setVerificationTeachers: (data: VerificationTeacher[]) => void;
}

export default function VerificationManager({
  sectionNumber,
  studentCount,
  setStudentCount,
  verificationTeachers,
  setVerificationTeachers,
}: Props) {
  const teachers = verificationTeachers;
  const setTeachers = (data: VerificationTeacher[]) => {
    setVerificationTeachers(data);
  };

  const addTeacher = () => {
    setTeachers([
      ...teachers,
      {
        name: "",
        designation: "Assistant Professor",
        department: "",
      },
    ]);
  };

  const removeTeacher = (index: number) => {
    setTeachers(teachers.filter((_, i) => i !== index));
  };

  const updateTeacher = (index: number, value: string) => {
    const updated = [...teachers];
    updated[index] = { ...updated[index], name: value };
    setTeachers(updated);
  };

  const updateDesignation = (index: number, value: Designation) => {
    const updated = [...teachers];
    updated[index] = { ...updated[index], designation: value };
    setTeachers(updated);
  };

  const updateDepartment = (index: number, value: string) => {
    const updated = [...teachers];
    updated[index] = { ...updated[index], department: value };
    setTeachers(updated);
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-xl font-bold">
        {sectionNumber}. List of Teachers Associated with Verification of
        Final Result
      </h2>
      <div>
        <label className="mb-1 block text-sm text-gray-600">
          No. of Students
        </label>
        <Input
          className="max-w-xs"
          placeholder="e.g. 31/7"
          value={studentCount}
          onChange={(e) => setStudentCount(e.target.value)}
        />
      </div>
      <Button type="button" onClick={addTeacher}>
        <Plus className="mr-2 h-4 w-4" />
        Add Teacher
      </Button>
      <div className="space-y-4">
        {teachers.map((teacher, index) => (
          <div key={index} className="rounded-lg border bg-slate-50 p-4">
            <div className="flex flex-wrap items-center gap-4">
              <span className="flex w-14 shrink-0 items-center justify-center rounded-md border bg-white px-3 py-2 text-sm font-semibold text-gray-700">
                {String(index + 1).padStart(2, "0")}.
              </span>
              <Input
                placeholder="Teacher Name"
                value={teacher.name}
                onChange={(e) => updateTeacher(index, e.target.value)}
                className="w-full max-w-sm min-w-[160px]"
              />
              <Select
                value={teacher.designation}
                onValueChange={(value) =>
                  updateDesignation(index, value as Designation)
                }
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {designationList.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                placeholder="Department"
                value={teacher.department}
                onChange={(e) => updateDepartment(index, e.target.value)}
                className="w-full max-w-sm min-w-[160px]"
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeTeacher(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}