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
import { emptyBill } from "./components/emptyBill";
import {
  saveDraft,
  loadDraft,
  saveCurrentWork,
  loadCurrentWork,
  clearCurrentWork,
} from "@/lib/storage/draft";
import { exportBillData, importBillData } from "@/lib/storage/exportImport";

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
      // Hydrate once from browser storage after the client mounts.
      // eslint-disable-next-line react-hooks/set-state-in-effect
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
  const isCourseCoordinatorApplicable = isThesisApplicable;

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

  return (
    <main className="py-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
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
            totalQuestions={billData.questionWorkTotal}
            setTotalQuestions={(value) =>
              setBillData((prev) => ({ ...prev, questionWorkTotal: value }))
            }
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
            totalStudents={billData.courseAdviserStudentCount}
            setTotalStudents={(value) =>
              setBillData((prev) => ({ ...prev, courseAdviserStudentCount: value }))
            }
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
