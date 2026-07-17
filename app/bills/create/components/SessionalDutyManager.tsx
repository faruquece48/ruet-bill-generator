"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
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
        teacher: "",
        designation: "Assistant Professor",
        duties: { ...defaultDuty },
        students: { ...defaultStudent },
        additionalTeachers: [],
      },
    ]);
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
    field: "name" | "designation",
    value: string
  ) => {
    const updated = [...courses];

    if (!updated[courseIndex].additionalTeachers.length) return;

    if (field === "name") {
      updated[courseIndex].additionalTeachers[0].name = value;
    } else {
      updated[courseIndex].additionalTeachers[0].designation =
        value as Designation;
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
          {/* Course Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Teacher Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          </div>

          {/* Duty Selection */}
          <div>
            <h4 className="font-semibold mb-3">Duty Selection</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(course.duties) as (keyof SessionalDutyOption)[]).map(
                (duty) => (
                  <label key={duty} className="flex items-center gap-2">
                    <Checkbox
                      checked={course.duties[duty]}
                      onCheckedChange={() => toggleDuty(cIndex, duty)}
                    />
                    {duty.replace(/([A-Z])/g, " $1")}
                  </label>
                )
              )}
            </div>
          </div>

          {/* Student Number */}
          <div>
            <h4 className="font-semibold mb-3">Number of Students</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {(Object.keys(course.students) as (keyof StudentCount)[]).map(
                (duty) => {
                  if (!course.duties[duty]) return null;
                  return (
                    <Input
                      key={duty}
                      type="number"
                      placeholder={`${duty.replace(/([A-Z])/g, " $1")} Students`}
                      value={course.students[duty]}
                      onChange={(e) =>
                        updateStudent(cIndex, duty, e.target.value)
                      }
                    />
                  );
                }
              )}
            </div>
          </div>

          {/* Additional Teacher */}
          {course.additionalTeachers.length > 0 && (
            <div className="rounded-lg border bg-white p-5 space-y-5">
              <h4 className="font-bold text-lg">Additional Teacher Required</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    updateAdditionalTeacher(cIndex, "designation", value)
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
              </div>

              <div>
                <p className="font-medium mb-3">Assigned Duties</p>
                <div className="flex flex-wrap gap-3">
                  {(
                    Object.keys(
                      course.additionalTeachers[0].duties
                    ) as (keyof SessionalDutyOption)[]
                  )
                    .filter((duty) => course.additionalTeachers[0].duties[duty])
                    .map((duty) => (
                      <span
                        key={duty}
                        className="rounded bg-green-100 px-3 py-1 text-sm"
                      >
                        ✓ {duty.replace(/([A-Z])/g, " $1")}
                      </span>
                    ))}
                </div>
              </div>

              <div>
                <p className="font-medium mb-3">Number of Students</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {(
                    Object.keys(
                      course.additionalTeachers[0].students
                    ) as (keyof StudentCount)[]
                  ).map((duty) => {
                    if (!course.additionalTeachers[0].duties[duty])
                      return null;
                    return (
                      <Input
                        key={duty}
                        type="number"
                        placeholder={`${duty.replace(/([A-Z])/g, " $1")} Students`}
                        value={course.additionalTeachers[0].students[duty]}
                        onChange={(e) =>
                          updateAdditionalStudent(cIndex, duty, e.target.value)
                        }
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}