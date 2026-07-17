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


type Designation =
  | "Lecturer"
  | "Assistant Professor"
  | "Associate Professor"
  | "Professor";


interface CourseAdviser {

  name: string;

  designation: Designation;

  students: number | "";

}



const designationList: Designation[] = [

  "Lecturer",

  "Assistant Professor",

  "Associate Professor",

  "Professor",

];




export default function CourseAdviserManager() {


  const [advisers, setAdvisers] = useState<CourseAdviser[]>([]);




  const addAdviser = () => {

    setAdvisers([

      ...advisers,

      {

        name: "",

        designation: "Assistant Professor",

        students: "",

      },

    ]);

  };





  const removeAdviser = (index:number) => {


    setAdvisers(

      advisers.filter(
        (_,i)=>i !== index
      )

    );


  };





  const updateAdviser = (

    index:number,

    field:keyof CourseAdviser,

    value:any

  ) => {


    const updated = [...advisers];


    updated[index] = {

      ...updated[index],

      [field]:

        field === "students"

        ?

        value === ""
        ? ""
        : Number(value)

        :

        value,

    };


    setAdvisers(updated);


  };






  return (

    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">


      <h2 className="text-xl font-bold">

        8. List of Course Advisers

      </h2>





      <Button onClick={addAdviser}>

        <Plus className="mr-2 h-4 w-4"/>

        Add Teacher

      </Button>





      <div className="space-y-4">


        {

          advisers.map((adviser,index)=>(


            <div

              key={index}

              className="rounded-lg border bg-slate-50 p-4"

            >


              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">


                <Input

                  placeholder="Teacher Name"

                  value={adviser.name}

                  onChange={(e)=>

                    updateAdviser(

                      index,

                      "name",

                      e.target.value

                    )

                  }

                />





                <Select

                  value={adviser.designation}

                  onValueChange={(value)=>

                    updateAdviser(

                      index,

                      "designation",

                      value as Designation

                    )

                  }

                >


                  <SelectTrigger>

                    <SelectValue/>

                  </SelectTrigger>



                  <SelectContent>


                    {

                      designationList.map((d)=>(

                        <SelectItem

                          key={d}

                          value={d}

                        >

                          {d}

                        </SelectItem>

                      ))

                    }


                  </SelectContent>


                </Select>






                <Input

                  type="number"

                  placeholder="No. of Students"

                  value={adviser.students}

                  onChange={(e)=>

                    updateAdviser(

                      index,

                      "students",

                      e.target.value

                    )

                  }

                />






                <Button

                  variant="destructive"

                  size="icon"

                  onClick={()=>removeAdviser(index)}

                >

                  <Trash2 className="h-4 w-4"/>

                </Button>



              </div>


            </div>


          ))

        }


      </div>



    </div>

  );

}