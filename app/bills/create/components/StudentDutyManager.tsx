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
import type { Designation, StudentDuty } from "./types";

const designationList: Designation[] = [
  "Lecturer",
  "Assistant Professor",
  "Associate Professor",
  "Professor",
];

interface Props {
  title?: string;
  studentDuties: StudentDuty[];
  setStudentDuties: (data: StudentDuty[]) => void;
}

export default function StudentDutyManager({
  title = "7. List of Teachers Associated with Tabulation",
  studentDuties,
  setStudentDuties,
}: Props) {
  const records = studentDuties;

  const setRecords = (data: StudentDuty[]) => {
    setStudentDuties(data);
  };

  const addRecord = () => {
    setRecords([
      ...records,
      { name: "", designation: "Assistant Professor", students: "" },
    ]);
  };

  const removeRecord = (index: number) => {
    setRecords(records.filter((_, i) => i !== index));
  };

  const updateTeacher = (index: number, value: string) => {
    const updated = [...records];
    updated[index] = { ...updated[index], name: value };
    setRecords(updated);
  };

  const updateDesignation = (index: number, value: Designation) => {
    const updated = [...records];
    updated[index] = { ...updated[index], designation: value };
    setRecords(updated);
  };

  const updateStudent = (index: number, value: string) => {
    const updated = [...records];
    updated[index] = {
      ...updated[index],
      students: value === "" ? "" : Number(value),
    };
    setRecords(updated);
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-xl font-bold">{title}</h2>
      <Button type="button" onClick={addRecord}>
        <Plus className="mr-2 h-4 w-4" />
        Add Teacher
      </Button>
      <div className="space-y-4">
        {records.map((teacher, index) => (
          <div key={index} className="rounded-lg border bg-slate-50 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <Input
                placeholder="Teacher Name"
                value={teacher.name}
                onChange={(e) => updateTeacher(index, e.target.value)}
              />
              <Select
                value={teacher.designation}
                onValueChange={(value) =>
                  updateDesignation(index, value as Designation)
                }
              >
                <SelectTrigger>
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
                type="number"
                placeholder="No. of Students"
                value={teacher.students}
                onChange={(e) => updateStudent(index, e.target.value)}
              />
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeRecord(index)}
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