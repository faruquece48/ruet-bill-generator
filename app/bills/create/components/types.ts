export type Designation =
  | "Lecturer"
  | "Assistant Professor"
  | "Associate Professor"
  | "Professor";


export interface BillInfo {
  billNo: string;
  examination: string;
  year: string;
  semester: string;
  examYear: string;
  series: string;
}


export interface CommitteeMember {

  name: string;

  designation: Designation;

  department: string;

  role:
  | "Chairman"
  | "Member"
  | "External Member";

}



export interface DutyOption {

  paperSetter: boolean;

  examiner: boolean;

  classTest: boolean;

  assignment: boolean;

  courseFile: boolean;

}



export interface AdditionalTeacher {


  name: string;


  designation: Designation;


  duties: DutyOption;

}



export interface CoursePart {


  part: "A" | "B";


  teacher: string;


  designation: Designation;


  duties: DutyOption;


  additionalTeachers: AdditionalTeacher[];

}




export interface CourseDuty {


  courseCode: string;


  courseTitle: string;


  parts: CoursePart[];


}