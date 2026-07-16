"use client";

import { useState } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Trash2, Plus } from "lucide-react";

export default function CreateBillPage() {
  const [bill, setBill] = useState({
    billNo: "",
    examination: "",
    year: "",
    semester: "",
    examYear: "",
    series: "",
  });
  const [committee, setCommittee] = useState([
  {
    name: "",
    designation: "",
    department: "",
    role: "Member",
  },
]);
const addMember = () => {
  setCommittee([
    ...committee,
    {
      name: "",
      designation: "",
      department: "",
      role: "Member",
    },
  ]);
};

const removeMember = (index: number) => {
  setCommittee(committee.filter((_, i) => i !== index));
};

const updateMember = (
  index: number,
  field: "name" | "designation" | "department" | "role",
  value: string
) => {
  const updated = [...committee];
  updated[index] = {
    ...updated[index],
    [field]: value,
  };
  setCommittee(updated);
};

  return (
    <div className="mx-auto max-w-4xl p-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">
            Create New Examination Bill
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">

          {/* Bill No */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Bill No.
            </label>

            <Input
              placeholder="Example: 01"
              value={bill.billNo}
              onChange={(e) =>
                setBill({
                  ...bill,
                  billNo: e.target.value,
                })
              }
            />
          </div>

          {/* Examination */}
          <div>
            <label className="mb-2 block text-sm font-medium">
              Examination
            </label>

            <Select
              value={bill.examination}
              onValueChange={(value) =>
                setBill({
                  ...bill,
                  examination: value,
                })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select Examination" />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="B.Sc. Engineering">
                  B.Sc. Engineering
                </SelectItem>

                <SelectItem value="M.Sc. Engineering">
                  M.Sc. Engineering
                </SelectItem>

                <SelectItem value="PhD">
                  PhD
                </SelectItem>

                <SelectItem value="Other">
                  Other
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Academic Information */}
          <div className="grid gap-6 md:grid-cols-2">

            {/* Academic Year */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Academic Year
              </label>

              <Select
                value={bill.year}
                onValueChange={(value) =>
                  setBill({
                    ...bill,
                    year: value,
                  })
                }
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

            {/* Semester */}
            <div>
              <label className="mb-2 block text-sm font-medium">
                Semester
              </label>

              <Select
                value={bill.semester}
                onValueChange={(value) =>
                  setBill({
                    ...bill,
                    semester: value,
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Semester" />
                </SelectTrigger>

                <SelectContent>
                  <SelectItem value="Odd Semester">
                    Odd Semester
                  </SelectItem>

                  <SelectItem value="Even Semester">
                    Even Semester
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

          </div>

          {/* Exam Year & Series */}
          <div className="grid gap-6 md:grid-cols-2">

            <div>
              <label className="mb-2 block text-sm font-medium">
                Examination Year
              </label>

              <Input
                placeholder="2024"
                value={bill.examYear}
                onChange={(e) =>
                  setBill({
                    ...bill,
                    examYear: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">
                Series
              </label>

              <Input
                placeholder="2023"
                value={bill.series}
                onChange={(e) =>
                  setBill({
                    ...bill,
                    series: e.target.value,
                  })
                }
              />
            </div>

          </div>

          {/* Live Preview */}

          <div className="rounded-xl border bg-slate-50 p-6">

            <div className="flex justify-end">
              <div className="rounded border px-5 py-2 font-bold">
                Bill No.: {bill.billNo || "01"}
              </div>
            </div>

            <div className="mt-4 text-center">

              <p className="italic">
                Heaven's Light is Our Guide
              </p>

              <p className="text-lg">
                Department of Building Engineering & Construction Management
              </p>

              <p className="text-lg">
                Rajshahi University of Engineering & Technology
              </p>

              <h2 className="text-lg font-bold">

                {bill.examination || "B.Sc. Engineering"}{" "}

                {bill.year || "1st Year"}{" "}

                {bill.semester || "Odd Semester"}{" "}

                Examination-{bill.examYear || "2024"}{" "}

                (Series {bill.series || "2023"})

              </h2>

            </div>

          </div>

          {/* Examination Committee */}

<div className="rounded-xl border p-6">

  <h2 className="mb-5 text-xl font-bold">
    1. Examination Committee
  </h2>

  <Table>

    <TableHeader>

      <TableRow>

        <TableHead className="w-12">
          Sl.
        </TableHead>

        <TableHead>
          Name
        </TableHead>

        <TableHead>
          Designation
        </TableHead>

        <TableHead>
          Department
        </TableHead>

        <TableHead className="w-48">
          Role
        </TableHead>

        <TableHead className="w-20 text-center">
          Action
        </TableHead>

      </TableRow>

    </TableHeader>

    <TableBody>

      {committee.map((member, index) => (

        <TableRow key={index}>

          <TableCell>

            {index + 1}

          </TableCell>

          <TableCell>

            <Input
              placeholder="Teacher Name"
              value={member.name}
              onChange={(e) =>
                updateMember(index, "name", e.target.value)
              }
            />

          </TableCell>

          <TableCell>

            <Input
              placeholder="Designation"
              value={member.designation}
              onChange={(e) =>
                updateMember(index, "designation", e.target.value)
              }
            />

          </TableCell>

          <TableCell>

            <Input
              placeholder="Department"
              value={member.department}
              onChange={(e) =>
                updateMember(index, "department", e.target.value)
              }
            />

          </TableCell>

          <TableCell>

            <Select
              value={member.role}
              onValueChange={(value) =>
                updateMember(index, "role", value)
              }
            >

              <SelectTrigger>

                <SelectValue />

              </SelectTrigger>

              <SelectContent>

                <SelectItem value="Chairman">
                  Chairman
                </SelectItem>

                <SelectItem value="Member">
                  Member
                </SelectItem>

                <SelectItem value="External Member">
                  External Member
                </SelectItem>

              </SelectContent>

            </Select>

          </TableCell>

          <TableCell className="text-center">

            <Button
              variant="destructive"
              size="icon"
              onClick={() => removeMember(index)}
            >

              <Trash2 className="h-4 w-4" />

            </Button>

          </TableCell>

        </TableRow>

      ))}

    </TableBody>

  </Table>

  <div className="mt-5">

    <Button onClick={addMember}>

      <Plus className="mr-2 h-4 w-4" />

      Add Member

    </Button>

  </div>

</div>

          {/* Save */}

          <div className="flex justify-end">

            <Button size="lg">

              Save & Continue

            </Button>

          </div>

        </CardContent>
      </Card>
    </div>
  );
}