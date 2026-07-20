"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  Designation,
  SessionalCourse,
  SessionalDutyOption,
  StudentCount,
} from "./types";

const designationList: Designation[] = [
  "Lecturer",
  "Assistant Professor",
  "Associate Professor",
  "Professor",
];

const defaultDuty: SessionalDutyOption = {
  courseFile: true,
  sessional: true,
  boardViva: true,
};

const defaultStudent: StudentCount = {
  courseFile: "",
  sessional: "",
  boardViva: "",
};

const label = (s: string) => s.replace(/([A-Z])/g, " $1");

interface Props {
  sessionalDuties: SessionalCourse[];
  setSessionalDuties: (data: SessionalCourse[]) => void;
}

export default function SessionalDutyManager({
  sessionalDuties,
  setSessionalDuties,
}: Props) {
  const courses = sessionalDuties;
  const setCourses = (data: SessionalCourse[]) => {
    setSessionalDuties(data);
  };

  const addCourse = () => {
    setCourses([
      ...courses,
      {
        courseCode: "",
        courseTitle: "",
        credit: "",
        teacher: "",
        designation: "Assistant Professor",
        department: "",
        duties: { ...defaultDuty },
        students: { ...defaultStudent },
        additionalTeachers: [],
      },
    ]);
  };

  const deleteCourse = (index: number) => {
    setCourses(courses.filter((_, i) => i !== index));
  };

  const updateCourse = (
    index: number,
    field: keyof SessionalCourse,
    value: any
  ) => {
    const updated = [...courses];
    (updated[index] as any)[field] = value;
    setCourses(updated);
  };

  const updateStudent = (
    courseIndex: number,
    duty: keyof StudentCount,
    value: string
  ) => {
    const updated = [...courses];
    updated[courseIndex].students[duty] = value === "" ? "" : Number(value);
    setCourses(updated);
  };

  const toggleDuty = (
    courseIndex: number,
    field: keyof SessionalDutyOption
  ) => {
    const updated = [...courses];
    const current = updated[courseIndex];
    current.duties[field] = !current.duties[field];
    const remainingDuty: SessionalDutyOption = {
      courseFile: false,
      sessional: false,
      boardViva: false,
    };
    const remainingStudent: StudentCount = {
      courseFile: "",
      sessional: "",
      boardViva: "",
    };
    (Object.keys(current.duties) as (keyof SessionalDutyOption)[]).forEach(
      (key) => {
        if (!current.duties[key]) {
          remainingDuty[key] = true;
          remainingStudent[key] = current.students[key];
        }
      }
    );
    if (Object.values(remainingDuty).some(Boolean)) {
      current.additionalTeachers = [
        {
          name: "",
          designation: "Assistant Professor",
          department: "",
          duties: remainingDuty,
          students: remainingStudent,
        },
      ];
    } else {
      current.additionalTeachers = [];
    }
    setCourses(updated);
  };

  const updateAdditionalTeacher = (
    courseIndex: number,
    field: "name" | "designation" | "department",
    value: string
  ) => {
    const updated = [...courses];
    if (!updated[courseIndex].additionalTeachers.length) return;
    if (field === "name") {
      updated[courseIndex].additionalTeachers[0].name = value;
    } else if (field === "designation") {
      updated[courseIndex].additionalTeachers[0].designation =
        value as Designation;
    } else {
      updated[courseIndex].additionalTeachers[0].department = value;
    }
    setCourses(updated);
  };

  const updateAdditionalStudent = (
    courseIndex: number,
    duty: keyof StudentCount,
    value: string
  ) => {
    const updated = [...courses];
    if (!updated[courseIndex].additionalTeachers.length) return;
    updated[courseIndex].additionalTeachers[0].students[duty] =
      value === "" ? "" : Number(value);
    setCourses(updated);
  };

  return (
    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">
      <h2 className="text-xl font-bold">
        4. List of Teachers Associated with Sessional Courses
      </h2>
      <Button type="button" onClick={addCourse}>
        + Add Sessional Course
      </Button>
      {courses.map((course, cIndex) => (
        <div
          key={cIndex}
          className="rounded-xl border bg-slate-50 p-5 space-y-5"
        >
          {/* Serial Number */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="flex items-center justify-center rounded-md border bg-white px-3 py-1 text-sm font-semibold text-gray-700">
                {String(cIndex + 1).padStart(2, "0")}.
              </span>
              <span className="text-sm font-medium text-gray-500">
                Sessional Course
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => deleteCourse(cIndex)}
              className="rounded-md bg-red-100 text-red-600 hover:bg-red-200 hover:text-red-700"
              aria-label="Delete sessional course"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {/* Course Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Course Code"
              value={course.courseCode}
              onChange={(e) =>
                updateCourse(cIndex, "courseCode", e.target.value)
              }
            />
            <Input
              placeholder="Course Title"
              value={course.courseTitle}
              onChange={(e) =>
                updateCourse(cIndex, "courseTitle", e.target.value)
              }
            />
            <label className="space-y-1 text-sm font-medium">
              <span>Credit</span>
              <Input
                type="number"
                min="0"
                step="0.5"
                placeholder="e.g. 1.5"
                aria-label="Sessional course credit"
                value={course.credit}
                onChange={(e) =>
                  updateCourse(cIndex, "credit", e.target.value)
                }
              />
            </label>
          </div>
          {/* Teacher Information */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              placeholder="Teacher Name"
              value={course.teacher}
              onChange={(e) =>
                updateCourse(cIndex, "teacher", e.target.value)
              }
            />
            <Select
              value={course.designation}
              onValueChange={(value) =>
                updateCourse(cIndex, "designation", value)
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
              placeholder="Department"
              value={course.department}
              onChange={(e) =>
                updateCourse(cIndex, "department", e.target.value)
              }
            />
          </div>
          {/* Duty Selection with inline student count */}
          <div>
            <h4 className="text-sm font-medium mb-2">Duty Selection</h4>
            <div className="grid md:grid-cols-3 gap-3">
              {(Object.keys(course.duties) as (keyof SessionalDutyOption)[]).map(
                (duty) => {
                  const checked = course.duties[duty];
                  return (
                    <div key={duty} className="flex items-center gap-2">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => toggleDuty(cIndex, duty)}
                      />
                      <span className="w-24 shrink-0 text-sm">
                        {label(duty)}
                      </span>
                      {checked && (
                        <Input
                          type="number"
                          placeholder="Students"
                          value={course.students[duty]}
                          onChange={(e) =>
                            updateStudent(cIndex, duty, e.target.value)
                          }
                          className="h-8"
                        />
                      )}
                    </div>
                  );
                }
              )}
            </div>
          </div>
          {/* Additional Teacher */}
          {course.additionalTeachers.length > 0 && (
            <div className="rounded-lg border bg-white p-5 space-y-5">
              <h4 className="font-bold text-lg">Additional Teacher Required</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  placeholder="Teacher Name"
                  value={course.additionalTeachers[0].name}
                  onChange={(e) =>
                    updateAdditionalTeacher(cIndex, "name", e.target.value)
                  }
                />
                <Select
                  value={course.additionalTeachers[0].designation}
                  onValueChange={(value) =>
                    value !== null && updateAdditionalTeacher(cIndex, "designation", value)
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
                  placeholder="Department"
                  value={course.additionalTeachers[0].department}
                  onChange={(e) =>
                    updateAdditionalTeacher(cIndex, "department", e.target.value)
                  }
                />
              </div>
              <div className="grid md:grid-cols-3 gap-3">
                {(
                  Object.keys(
                    course.additionalTeachers[0].duties
                  ) as (keyof SessionalDutyOption)[]
                ).map((duty) => {
                  if (!course.additionalTeachers[0].duties[duty]) return null;
                  return (
                    <div key={duty} className="flex items-center gap-2">
                      <span className="rounded bg-green-100 px-2 py-1 text-xs shrink-0">
                        ✓ {label(duty)}
                      </span>
                      <Input
                        type="number"
                        placeholder="Students"
                        value={course.additionalTeachers[0].students[duty]}
                        onChange={(e) =>
                          updateAdditionalStudent(cIndex, duty, e.target.value)
                        }
                        className="h-8"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
