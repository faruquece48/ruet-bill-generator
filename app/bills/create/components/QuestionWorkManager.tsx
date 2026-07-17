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

import { Trash2, Plus } from "lucide-react";


type Designation =
  | "Lecturer"
  | "Assistant Professor"
  | "Associate Professor"
  | "Professor";


interface QuestionTeacher {

  name: string;

  designation: Designation;

  questionNumber: number | "";

}



const designationList: Designation[] = [

  "Lecturer",

  "Assistant Professor",

  "Associate Professor",

  "Professor",

];



export default function QuestionWorkManager(){


  const [teachers,setTeachers] = useState<QuestionTeacher[]>([]);



  const addTeacher = ()=>{


    setTeachers([

      ...teachers,

      {

        name:"",

        designation:"Assistant Professor",

        questionNumber:"",

      }

    ]);


  };





  const removeTeacher=(index:number)=>{


    setTeachers(

      teachers.filter(
        (_,i)=>i!==index
      )

    );


  };






  const updateTeacher=(

    index:number,

    field:keyof QuestionTeacher,

    value:any

  )=>{


    const updated=[...teachers];


    updated[index]={

      ...updated[index],

      [field]:

      field==="questionNumber"

      ?

      value===""
      ? ""
      : Number(value)

      :

      value

    };


    setTeachers(updated);


  };





  return (

    <div className="rounded-xl border bg-white p-6 shadow-sm space-y-6">


      <h2 className="text-xl font-bold">

        5. List of Teachers Associated with Question Typing, Sketching, Comparing & Printing

      </h2>





      <Button onClick={addTeacher}>

        <Plus className="mr-2 h-4 w-4"/>

        Add Teacher

      </Button>





      <div className="space-y-4">


      {
        teachers.map((teacher,index)=>(


          <div

            key={index}

            className="rounded-lg border bg-slate-50 p-4"

          >


            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">


              <Input

                placeholder="Teacher Name"

                value={teacher.name}

                onChange={(e)=>

                  updateTeacher(

                    index,

                    "name",

                    e.target.value

                  )

                }

              />





              <Select

                value={teacher.designation}

                onValueChange={(value)=>

                  updateTeacher(

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

                placeholder="No. of Question"

                value={teacher.questionNumber}

                onChange={(e)=>

                  updateTeacher(

                    index,

                    "questionNumber",

                    e.target.value

                  )

                }

              />






              <Button

                variant="destructive"

                size="icon"

                onClick={()=>removeTeacher(index)}

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