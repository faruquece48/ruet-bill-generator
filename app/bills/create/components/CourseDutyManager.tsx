"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CourseDuty, DutyOption, Designation } from "./types";

type StudentCount = Record<keyof DutyOption, number | "">;

const defaultDuty: DutyOption = {
  paperSetter: true,
  examiner: true,
  classTest: true,
  assignment: true,
  courseFile: true,
};

const defaultStudent: StudentCount = {
  paperSetter: "",
  examiner: "",
  classTest: "",
  assignment: "",
  courseFile: "",
};

const designationList: Designation[] = [
  "Lecturer",
  "Assistant Professor",
  "Associate Professor",
  "Professor",
];

const label = (s: string) => s.replace(/([A-Z])/g, " $1");

interface Props {
  evaluationSystem: "obe" | "mixed";
  courseDuties: { obe: CourseDuty[]; nonObe: CourseDuty[] };
  setCourseDuties: (data: { obe: CourseDuty[]; nonObe: CourseDuty[] }) => void;
}

export default function CourseDutyManager({
  evaluationSystem,
  courseDuties,
  setCourseDuties,
}: Props) {
  const getList = (type: "obe" | "nonObe") => {
    return courseDuties[type];
  };

  const setList = (type: "obe" | "nonObe", value: CourseDuty[]) => {
    setCourseDuties({
      ...courseDuties,
      [type]: value,
    });
  };

  const addCourse = (type: "obe" | "nonObe") => {
    setList(type, [
      ...getList(type),
      {
        courseCode: "",
        courseTitle: "",
        parts: ["A", "B"].map((part) => ({
          part,
          teacher: "",
          designation: "Assistant Professor",
          duties: { ...defaultDuty },
          students: { ...defaultStudent },
          additionalTeachers: [],
        })),
      },
    ]);
  };

  const updateCourse = (
    type: "obe" | "nonObe",
    ci: number,
    field: string,
    value: string
  ) => {
    const updated = [...getList(type)];
    (updated[ci] as any)[field] = value;
    setList(type, updated);
  };

  const updatePart = (
    type: "obe" | "nonObe",
    ci: number,
    pi: number,
    field: string,
    value: any
  ) => {
    const updated = [...getList(type)];
    (updated[ci].parts[pi] as any)[field] = value;
    setList(type, updated);
  };

  const updateStudent = (
    type: "obe" | "nonObe",
    ci: number,
    pi: number,
    duty: keyof DutyOption,
    value: string
  ) => {
    const updated = [...getList(type)];
    (updated[ci].parts[pi] as any).students[duty] =
      value === "" ? "" : Number(value);
    setList(type, updated);
  };

  const updateAdditionalStudent = (
    type: "obe" | "nonObe",
    ci: number,
    pi: number,
    duty: keyof DutyOption,
    value: string
  ) => {
    const updated = [...getList(type)];
    updated[ci].parts[pi].additionalTeachers[0].students[duty] =
      value === "" ? "" : Number(value);
    setList(type, updated);
  };

  const toggleDuty = (
    type: "obe" | "nonObe",
    ci: number,
    pi: number,
    field: keyof DutyOption
  ) => {
    const updated = [...getList(type)];
    const part = updated[ci].parts[pi];
    part.duties[field] = !part.duties[field];

    const remainingDuty: DutyOption = {
      paperSetter: false,
      examiner: false,
      classTest: false,
      assignment: false,
      courseFile: false,
    };
    const remainingStudent: StudentCount = { ...defaultStudent };

    (Object.keys(part.duties) as (keyof DutyOption)[]).forEach((key) => {
      if (!part.duties[key]) {
        remainingDuty[key] = true;
        remainingStudent[key] = part.students[key];
      }
    });

    part.additionalTeachers = Object.values(remainingDuty).some(Boolean)
      ? [
          {
            name: "",
            designation: "Assistant Professor",
            duties: remainingDuty,
            students: remainingStudent,
          },
        ]
      : [];

    setList(type, updated);
  };

  const updateAdditional = (
    type: "obe" | "nonObe",
    ci: number,
    pi: number,
    field: string,
    value: any
  ) => {
    const updated = [...getList(type)];
    (updated[ci].parts[pi].additionalTeachers[0] as any)[field] = value;
    setList(type, updated);
  };

  const renderSection = (title: string | null, type: "obe" | "nonObe") => {
    const courses = getList(type);
    return (
      <div className="rounded-xl border p-6 space-y-6">
        {title && <h3 className="text-lg font-bold">{title}</h3>}
        <Button type="button" onClick={() => addCourse(type)}>
          + Add Course
        </Button>

        {courses.map((course, cIndex) => (
          <div key={cIndex} className="rounded-xl border p-5 space-y-5">
            <div className="grid md:grid-cols-2 gap-4">
              <Input
                placeholder="Course Code"
                value={course.courseCode}
                onChange={(e) =>
                  updateCourse(type, cIndex, "courseCode", e.target.value)
                }
              />
              <Input
                placeholder="Course Title"
                value={course.courseTitle}
                onChange={(e) =>
                  updateCourse(type, cIndex, "courseTitle", e.target.value)
                }
              />
            </div>

            {course.parts.map((part, pIndex) => (
              <div key={pIndex} className="rounded-lg bg-slate-50 p-4">
                <h4 className="font-bold mb-4">Part {part.part}</h4>
                <Input
                  placeholder="Teacher Name"
                  value={part.teacher}
                  onChange={(e) =>
                    updatePart(type, cIndex, pIndex, "teacher", e.target.value)
                  }
                />
                <div className="mt-3">
                  <label className="text-sm">Designation</label>
                  <Select
                    value={part.designation}
                    onValueChange={(v) =>
                      updatePart(type, cIndex, pIndex, "designation", v)
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

                <div className="mt-5">
                  <h4 className="font-medium">Duty Selection</h4>
                  <div className="grid md:grid-cols-3 gap-3 mt-3">
                    {Object.keys(part.duties).map((d) => (
                      <label key={d} className="flex items-center gap-2">
                        <Checkbox
                          checked={part.duties[d as keyof DutyOption]}
                          onCheckedChange={() =>
                            toggleDuty(type, cIndex, pIndex, d as keyof DutyOption)
                          }
                        />
                        {label(d)}
                      </label>
                    ))}
                  </div>

                  <div className="mt-4">
                    <h4 className="font-medium">Number of Students</h4>
                    <div className="grid md:grid-cols-3 gap-3 mt-3">
                      {(Object.keys(part.students) as (keyof DutyOption)[]).map(
                        (d) => {
                          if (!part.duties[d]) return null;
                          return (
                            <Input
                              key={d}
                              type="number"
                              placeholder={`${label(d)} Students`}
                              value={part.students[d]}
                              onChange={(e) =>
                                updateStudent(
                                  type,
                                  cIndex,
                                  pIndex,
                                  d,
                                  e.target.value
                                )
                              }
                            />
                          );
                        }
                      )}
                    </div>
                  </div>

                  {part.additionalTeachers.length > 0 && (
                    <div className="mt-5 rounded-lg border bg-white p-4">
                      <h4 className="font-bold mb-4">
                        Additional Teacher Required
                      </h4>
                      <Input
                        placeholder="Teacher Name"
                        value={part.additionalTeachers[0].name}
                        onChange={(e) =>
                          updateAdditional(
                            type,
                            cIndex,
                            pIndex,
                            "name",
                            e.target.value
                          )
                        }
                      />
                      <div className="mt-3">
                        <label className="text-sm">Designation</label>
                        <Select
                          value={part.additionalTeachers[0].designation}
                          onValueChange={(v) =>
                            updateAdditional(
                              type,
                              cIndex,
                              pIndex,
                              "designation",
                              v as Designation
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
                      </div>
                      <p className="mt-4 font-medium">Assigned Duty:</p>
                      <div className="mt-2 flex flex-wrap gap-3">
                        {Object.keys(part.additionalTeachers[0].duties)
                          .filter(
                            (k) =>
                              part.additionalTeachers[0].duties[
                                k as keyof DutyOption
                              ]
                          )
                          .map((d) => (
                            <span
                              key={d}
                              className="rounded bg-green-100 px-3 py-1 text-sm"
                            >
                              ✓ {label(d)}
                            </span>
                          ))}
                      </div>
                      <div className="mt-4">
                        <p className="font-medium mb-3">Number of Students</p>
                        <div className="grid md:grid-cols-3 gap-3">
                          {(
                            Object.keys(
                              part.additionalTeachers[0].students
                            ) as (keyof DutyOption)[]
                          ).map((d) => {
                            if (!part.additionalTeachers[0].duties[d])
                              return null;
                            return (
                              <Input
                                key={d}
                                type="number"
                                placeholder={`${label(d)} Students`}
                                value={part.additionalTeachers[0].students[d]}
                                onChange={(e) =>
                                  updateAdditionalStudent(
                                    type,
                                    cIndex,
                                    pIndex,
                                    d,
                                    e.target.value
                                  )
                                }
                              />
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold">
        3. List of Teachers Associated with Paper Setter & Examiner
      </h2>
      {evaluationSystem === "obe" ? (
        renderSection(null, "obe")
      ) : (
        <div className="space-y-8">
          {renderSection("3.1 OBE (New Syllabus)", "obe")}
          {renderSection("3.2 Non OBE (Old Syllabus)", "nonObe")}
        </div>
      )}
    </div>
  );
}