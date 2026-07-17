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
import type { Designation, ScrutinyTeacher } from "./types";

const designationList: Designation[] = [
  "Lecturer",
  "Assistant Professor",
  "Associate Professor",
  "Professor",
];

interface Props {
  evaluationSystem: "obe" | "mixed";
}

export default function ScrutinyManager({ evaluationSystem }: Props) {
  const [obeTeachers, setObeTeachers] = useState<ScrutinyTeacher[]>([]);
  const [nonObeTeachers, setNonObeTeachers] = useState<ScrutinyTeacher[]>([]);

  const getList = (type: "obe" | "nonObe") =>
    type === "obe" ? obeTeachers : nonObeTeachers;
  const setList = (type: "obe" | "nonObe", value: ScrutinyTeacher[]) =>
    type === "obe" ? setObeTeachers(value) : setNonObeTeachers(value);

  const addTeacher = (type: "obe" | "nonObe") => {
    const newTeacher: ScrutinyTeacher = {
      name: "",
      designation: "Assistant Professor",
      scriptCount: "",
    };
    setList(type, [...getList(type), newTeacher]);
  };

  const removeTeacher = (type: "obe" | "nonObe", index: number) => {
    setList(
      type,
      getList(type).filter((_, i) => i !== index)
    );
  };

  const updateTeacher = (
    type: "obe" | "nonObe",
    index: number,
    field: keyof ScrutinyTeacher,
    value: any
  ) => {
    const list = [...getList(type)];
    list[index] = {
      ...list[index],
      [field]:
        field === "scriptCount"
          ? value === ""
            ? ""
            : Number(value)
          : value,
    };
    setList(type, list);
  };

  const renderSection = (title: string | null, type: "obe" | "nonObe") => {
    const teachers = getList(type);
    return (
      <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
        {title && <h3 className="text-lg font-bold">{title}</h3>}
        <Button type="button" onClick={() => addTeacher(type)}>
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
                  onChange={(e) =>
                    updateTeacher(type, index, "name", e.target.value)
                  }
                />
                <Select
                  value={teacher.designation}
                  onValueChange={(value) =>
                    updateTeacher(
                      type,
                      index,
                      "designation",
                      value as Designation
                    )
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
                  placeholder="No. of Scripts"
                  value={teacher.scriptCount}
                  onChange={(e) =>
                    updateTeacher(type, index, "scriptCount", e.target.value)
                  }
                />
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  onClick={() => removeTeacher(type, index)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">
        6. List of Teachers Associated with Scrutiny
      </h2>

      {evaluationSystem === "obe" ? (
        renderSection(null, "obe")
      ) : (
        <div className="space-y-8">
          {renderSection("6.1 OBE (New Syllabus)", "obe")}
          {renderSection("6.2 Non-OBE (Old Syllabus)", "nonObe")}
        </div>
      )}
    </div>
  );
}