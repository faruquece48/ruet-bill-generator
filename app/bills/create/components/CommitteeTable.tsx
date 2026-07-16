"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Trash2, Plus } from "lucide-react";

import { CommitteeMember } from "./types";


interface Props {

  committee: CommitteeMember[];

  setCommittee: React.Dispatch<
    React.SetStateAction<CommitteeMember[]>
  >;

}



export default function CommitteeTable({

  committee,

  setCommittee,

}: Props) {



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




  const removeMember = (index:number)=>{

    const updated = committee.filter(
      (_,i)=> i !== index
    );

    setCommittee(updated);

  };





  const updateMember = (

    index:number,

    field:keyof CommitteeMember,

    value:string

  )=>{


    const updated = [...committee];


    updated[index] = {

      ...updated[index],

      [field]:value,

    };


    setCommittee(updated);


  };





  return (


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

              Name of Teacher

            </TableHead>



            <TableHead>

              Designation & Department

            </TableHead>



            <TableHead className="w-48">

              Role

            </TableHead>



            <TableHead className="w-16">

              Action

            </TableHead>


          </TableRow>

        </TableHeader>





        <TableBody>


          {committee.map((member,index)=>(


            <TableRow key={index}>


              <TableCell>

                {index+1}

              </TableCell>





              <TableCell>


                <Input

                  placeholder="Teacher Name"

                  value={member.name}

                  onChange={(e)=>

                    updateMember(

                      index,

                      "name",

                      e.target.value

                    )

                  }

                />


              </TableCell>







              <TableCell>


                <div className="grid gap-2">


                  <Input

                    placeholder="Designation"

                    value={member.designation}

                    onChange={(e)=>

                      updateMember(

                        index,

                        "designation",

                        e.target.value

                      )

                    }

                  />



                  <Input

                    placeholder="Department"

                    value={member.department}

                    onChange={(e)=>

                      updateMember(

                        index,

                        "department",

                        e.target.value

                      )

                    }

                  />


                </div>


              </TableCell>








              <TableCell>


                <Select


                  value={member.role}


                  onValueChange={(value)=>

                    updateMember(

                      index,

                      "role",

                      value

                    )

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








              <TableCell>


                <Button


                  variant="destructive"

                  size="icon"


                  onClick={()=>removeMember(index)}


                >


                  <Trash2 className="h-4 w-4"/>


                </Button>


              </TableCell>



            </TableRow>


          ))}



        </TableBody>



      </Table>






      <div className="mt-5">


        <Button

          onClick={addMember}

        >

          <Plus className="mr-2 h-4 w-4"/>

          Add Member


        </Button>


      </div>



    </div>


  );


}