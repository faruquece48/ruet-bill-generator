"use client";

import { Input } from "@/components/ui/input";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { BillInfo } from "./types";


interface Props {
  bill: BillInfo;
  setBill: React.Dispatch<React.SetStateAction<BillInfo>>;
}


export default function BillInformation({
  bill,
  setBill,
}: Props) {


  const updateField = (
    field: keyof BillInfo,
    value: string
  ) => {

    setBill({
      ...bill,
      [field]: value,
    });

  };


  return (

    <div className="space-y-6">


      {/* Bill No */}

      <div>

        <label className="mb-2 block text-sm font-medium">
          Bill No.
        </label>

        <Input
          placeholder="Example: 01"
          value={bill.billNo}
          onChange={(e)=>
            updateField(
              "billNo",
              e.target.value
            )
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

          onValueChange={(value)=>
            updateField(
              "examination",
              value
            )
          }

        >

          <SelectTrigger>

            <SelectValue
              placeholder="Select Examination"
            />

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


          </SelectContent>


        </Select>


      </div>



      {/* Year + Semester */}

      <div className="grid gap-6 md:grid-cols-2">


        <div>

          <label className="mb-2 block text-sm font-medium">

            Academic Year

          </label>


          <Select

            value={bill.year}

            onValueChange={(value)=>
              updateField(
                "year",
                value
              )
            }

          >

            <SelectTrigger>

              <SelectValue
                placeholder="Select Year"
              />

            </SelectTrigger>


            <SelectContent>

              <SelectItem value="1st Year">
                1st Year
              </SelectItem>


              <SelectItem value="2nd Year">
                2nd Year
              </SelectItem>


              <SelectItem value="3rd Year">
                3rd Year
              </SelectItem>


              <SelectItem value="4th Year">
                4th Year
              </SelectItem>


            </SelectContent>


          </Select>


        </div>




        <div>

          <label className="mb-2 block text-sm font-medium">

            Semester

          </label>


          <Select

            value={bill.semester}

            onValueChange={(value)=>
              updateField(
                "semester",
                value
              )
            }

          >

            <SelectTrigger>

              <SelectValue
                placeholder="Select Semester"
              />

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




      {/* Exam Year + Series */}


      <div className="grid gap-6 md:grid-cols-2">


        <div>

          <label className="mb-2 block text-sm font-medium">

            Examination Year

          </label>


          <Input

            placeholder="2024"

            value={bill.examYear}

            onChange={(e)=>
              updateField(
                "examYear",
                e.target.value
              )
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

            onChange={(e)=>
              updateField(
                "series",
                e.target.value
              )
            }

          />

        </div>


      </div>



    </div>

  );

}