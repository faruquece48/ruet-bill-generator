"use client";
import { useEffect, useRef, useState } from "react";
import BillInformation from "./components/BillInformation";
import CommitteeTable from "./components/CommitteeTable";
import CourseDutyManager from "./components/CourseDutyManager";
import SessionalDutyManager from "./components/SessionalDutyManager";
import QuestionWorkManager from "./components/QuestionWorkManager";
import ScrutinyManager from "./components/ScrutinyManager";
import StudentDutyManager from "./components/StudentDutyManager";
import CourseAdviserManager from "./components/CourseAdviserManager";
import ThesisManager from "./components/ThesisManager";
import VerificationManager from "./components/VerificationManager";
import CourseCoordinatorManager from "./components/CourseCoordinatorManager";
import Toolbar from "./components/Toolbar";
import DraftDialog from "./components/DraftDialog";
import type { ExaminationBillData } from "./components/types";
import { pdf } from "@react-pdf/renderer";
import BillPdfDocument from "./components/pdf/BillPdfDocument";
import {
  saveDraft,
  loadDraft,
  saveCurrentWork,
  loadCurrentWork,
  clearCurrentWork,
} from "@/lib/storage/draft";
import { exportBillData, importBillData } from "@/lib/storage/exportImport";
const emptyBill: ExaminationBillData = {
  billInfo: {
    billNo: "",
    examination: "",
    year: "",
    examType: "semester",
    semester: "",
    examYear: "",
    series: "",
    evaluationSystem: "obe",
    hasGraduatingStudents: "no",
  },
  committees: [
    { name: "", designation: "", department: "", role: "Member" },
  ],
  courseDuties: { obe: [], nonObe: [] },
  sessionalDuties: [],
  questionWorks: [],
  scrutinies: { obe: [], nonObe: [] },
  studentDuties: [],
  courseAdvisers: [],
  thesisTeachers: [],
  verificationTeachers: [],
  verificationStudentCount: "",
  courseCoordinatorTeachers: [],
};
export default function Home() {
  const [billData, setBillData] = useState<ExaminationBillData>(emptyBill);
  const [saveOpen, setSaveOpen] = useState(false);
  const [loadOpen, setLoadOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const hydrated = useRef(false);
  // Load autosaved work once, on first mount
  useEffect(() => {
    const saved = loadCurrentWork();
    if (saved) {
      // Merge over emptyBill so any field added after this draft was
      // saved (e.g. courseCoordinatorTeachers) still gets a safe default
      // instead of being undefined.
      setBillData({ ...emptyBill, ...saved });
    }
    hydrated.current = true;
  }, []);
  // Autosave on every change, after initial hydration
  useEffect(() => {
    if (!hydrated.current) return;
    saveCurrentWork(billData);
  }, [billData]);
  // ------------------------
  // Section numbering
  // ------------------------
  const isThesisApplicable =
    billData.billInfo.year === "4th Year" &&
    billData.billInfo.semester === "Even";
  const isVerificationApplicable =
    billData.billInfo.hasGraduatingStudents === "yes";
  // Course Coordinator table: 4th Year Even semester only
  const isCourseCoordinatorApplicable = isThesisApplicable;
  // Sections 9+ are conditional; number them dynamically based on
  // which ones actually render, in this fixed order:
  // Thesis -> Verification -> Course Coordinator
  let sectionCounter = 9;
  const thesisSectionNumber = sectionCounter;
  if (isThesisApplicable) sectionCounter++;
  const verificationSectionNumber = sectionCounter;
  if (isVerificationApplicable) sectionCounter++;
  const courseCoordinatorSectionNumber = sectionCounter;
  // ------------------------
  // Toolbar Handlers
  // ------------------------
  const handleSave = () => setSaveOpen(true);
  const handleLoad = () => setLoadOpen(true);
  const confirmSave = (name: string) => {
    saveDraft(name, billData);
    alert(`Saved as "${name}".`);
  };
  const confirmLoad = (name: string) => {
    const data = loadDraft(name);
    if (data) setBillData({ ...emptyBill, ...data });
  };
  const handleClear = () => {
    if (!window.confirm("Are you sure you want to clear all data?")) return;
    setBillData(emptyBill);
    clearCurrentWork();
    alert("Form cleared successfully.");
  };
  const handleExport = () => {
    exportBillData(billData);
  };
  const handleImport = () => {
    fileInputRef.current?.click();
  };
  const onFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const data = await importBillData(file);
      setBillData({ ...emptyBill, ...data });
      alert("Data imported successfully.");
    } catch (err) {
      alert("Failed to import: " + (err as Error).message);
    } finally {
      e.target.value = "";
    }
  };
  const handleValidate = () => alert("Validate Data clicked.");
  const handleGeneratePdf = async () => {
    try {
      const blob = await pdf(<BillPdfDocument bill={billData} />).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Examination-Bill-${billData.billInfo.billNo || "draft"}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      alert("Failed to generate PDF: " + (err as Error).message);
    }
  };
  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Examination Bill Generator
        </h1>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json"
          className="hidden"
          onChange={onFileSelected}
        />
        <Toolbar
          onSave={handleSave}
          onLoad={handleLoad}
          onExport={handleExport}
          onImport={handleImport}
          onClear={handleClear}
          onValidate={handleValidate}
        />
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleGeneratePdf}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
          >
            Download PDF
          </button>
        </div>
        <DraftDialog
          mode="save"
          open={saveOpen}
          onOpenChange={setSaveOpen}
          onSave={confirmSave}
        />
        <DraftDialog
          mode="load"
          open={loadOpen}
          onOpenChange={setLoadOpen}
          onLoad={confirmLoad}
        />
        <div className="space-y-8">
          <BillInformation
            bill={billData.billInfo}
            setBill={(value) =>
              setBillData((prev) => ({
                ...prev,
                billInfo:
                  typeof value === "function" ? value(prev.billInfo) : value,
              }))
            }
          />
          <CommitteeTable
            committees={billData.committees}
            setCommittees={(data) =>
              setBillData((prev) => ({ ...prev, committees: data }))
            }
          />
          <CourseDutyManager
            evaluationSystem={billData.billInfo.evaluationSystem}
            courseDuties={billData.courseDuties}
            setCourseDuties={(data) =>
              setBillData((prev) => ({ ...prev, courseDuties: data }))
            }
          />
          <SessionalDutyManager
            sessionalDuties={billData.sessionalDuties}
            setSessionalDuties={(data) =>
              setBillData((prev) => ({ ...prev, sessionalDuties: data }))
            }
          />
          <QuestionWorkManager
            questionWorks={billData.questionWorks}
            setQuestionWorks={(data) =>
              setBillData((prev) => ({ ...prev, questionWorks: data }))
            }
          />
          <ScrutinyManager
            evaluationSystem={billData.billInfo.evaluationSystem}
            scrutinies={billData.scrutinies}
            setScrutinies={(data) =>
              setBillData((prev) => ({ ...prev, scrutinies: data }))
            }
          />
          <StudentDutyManager
            studentDuties={billData.studentDuties}
            setStudentDuties={(data) =>
              setBillData((prev) => ({ ...prev, studentDuties: data }))
            }
          />
          <CourseAdviserManager
            courseAdvisers={billData.courseAdvisers}
            setCourseAdvisers={(data) =>
              setBillData((prev) => ({ ...prev, courseAdvisers: data }))
            }
          />
          {isThesisApplicable && (
            <ThesisManager
              bill={billData.billInfo}
              sectionNumber={thesisSectionNumber}
              thesisTeachers={billData.thesisTeachers}
              setThesisTeachers={(data) =>
                setBillData((prev) => ({ ...prev, thesisTeachers: data }))
              }
            />
          )}
          {isVerificationApplicable && (
            <VerificationManager
              sectionNumber={verificationSectionNumber}
              studentCount={billData.verificationStudentCount}
              setStudentCount={(value) =>
                setBillData((prev) => ({
                  ...prev,
                  verificationStudentCount: value,
                }))
              }
              verificationTeachers={billData.verificationTeachers}
              setVerificationTeachers={(data) =>
                setBillData((prev) => ({
                  ...prev,
                  verificationTeachers: data,
                }))
              }
            />
          )}
          {isCourseCoordinatorApplicable && (
            <CourseCoordinatorManager
              sectionNumber={courseCoordinatorSectionNumber}
              courseCoordinatorTeachers={billData.courseCoordinatorTeachers}
              setCourseCoordinatorTeachers={(data) =>
                setBillData((prev) => ({
                  ...prev,
                  courseCoordinatorTeachers: data,
                }))
              }
            />
          )}
        </div>
      </div>
    </main>
  );
}