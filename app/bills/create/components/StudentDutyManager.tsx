"use client";

import { useState } from "react";
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
import type { Designation } from "./types";

interface TeacherDuty {
  name: string;
  designation: Designation;
  students: number | "";
}

interface Props {
  title?: string;
}

const designationList: Designation[] = [
  "Lecturer",
  "Assistant Professor",
  "Associate Professor",
  "Professor",
];

export default function StudentDutyManager({
  title = "7. List of Teachers Associated with Tabulation",
}: Props) {
  const [teachers, setTeachers] = useState<TeacherDuty[]>([]);

  const addTeacher = () => {
    setTeachers([
      ...teachers,
      { name: "", designation: "Assistant Professor", students: "" },
    ]);
  };

  const removeTeacher = (index: number) => {
    setTeachers(teachers.filter((_, i) => i !== index));
  };

  const updateTeacher = (
    index: number,
    field: keyof TeacherDuty,
    value: any
  ) => {
    const updated = [...teachers];
    updated[index] = {
      ...updated[index],
      [field]: field === "students" ? (value === "" ? "" : Number(value)) : value,
    };
    setTeachers(updated);
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-xl font-bold">{title}</h2>

      <Button type="button" onClick={addTeacher}>
        <Plus className="mr-2 h-4 w-4" />
        Add Teacher
      </Button>

      <div className="space-y-4">
        {teachers.map((teacher, index) => (
          <div key={index} className="rounded-lg border bg-slate-50 p-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
              <Input
                placeholder="Teacher Name"
                value={teacher.name}
                onChange={(e) => updateTeacher(index, "name", e.target.value)}
              />
              <Select
                value={teacher.designation}
                onValueChange={(value) =>
                  updateTeacher(index, "designation", value as Designation)
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
                onChange={(e) =>
                  updateTeacher(index, "students", e.target.value)
                }
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