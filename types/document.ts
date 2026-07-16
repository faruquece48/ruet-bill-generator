import { Section } from "./section";
import { Teacher } from "./teacher";
import { DutyRecord } from "./duty";

export interface DocumentMetadata {
  examination: string;
  semester: string;
  session: string;
  year: string;
  university: string;
}

export interface BillDocument {
  metadata: DocumentMetadata;
  sections: Section[];
  duties: DutyRecord[];
  teachers: Teacher[];
}