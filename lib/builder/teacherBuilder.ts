import type { DutyRecord } from "@/types/duty";
import type { Teacher } from "@/types/teacher";


export function buildTeachers(
  duties: DutyRecord[]
): Teacher[] {

  const map = new Map<string, Teacher>();


  duties.forEach((duty)=>{

    const key = duty.teacherName.trim();


    if(!map.has(key)){

      map.set(key,{
        name: duty.teacherName,
        designation: duty.designation,
        department: duty.department,
        duties:[]
      });

    }


    map.get(key)!.duties.push(duty);

  });


  return Array.from(map.values());

}