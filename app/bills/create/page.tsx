"use client";

import { useState } from "react";
import BillInformation from "./components/BillInformation";
import CommitteeTable from "./components/CommitteeTable";
import CourseDutyManager from "./components/CourseDutyManager";
import SessionalDutyManager from "./components/SessionalDutyManager";
import QuestionWorkManager from "./components/QuestionWorkManager";
import ScrutinyManager from "./components/ScrutinyManager";
import StudentDutyManager from "./components/StudentDutyManager";
import CourseAdviserManager from "./components/CourseAdviserManager";
import Toolbar from "./components/Toolbar";

import type { ExaminationBillData } from "./components/types";

import {
  saveDraft,
  loadDraft,
  deleteDraft,
} from "@/lib/storage/draft";

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
  },

  committees: [
    {
      name: "",
      designation: "",
      department: "",
      role: "Member",
    },
  ],

  courseDuties: {
    obe: [],
    nonObe: [],
  },

  sessionalDuties: [],

  questionWorks: [],

  scrutinies: {
    obe: [],
    nonObe: [],
  },

  studentDuties: [],

  courseAdvisers: [],
};

export default function Home() {
  const [billData, setBillData] =
    useState<ExaminationBillData>(emptyBill);

  const handleSave = () => {
    saveDraft(billData);
  };

  const handleLoad = () => {
    const data = loadDraft();

    if (data) {
      setBillData(data);
    }
  };

  const handleClear = () => {
    if (
      !window.confirm(
        "Are you sure you want to clear all data?"
      )
    ) {
      return;
    }

    setBillData(emptyBill);
    deleteDraft();
    alert("Form cleared successfully.");
  };

  const handleExport = () => {
    alert("Export Data clicked.");
  };

  const handleImport = () => {
    alert("Import Data clicked.");
  };

  const handleValidate = () => {
    alert("Validate Data clicked.");
  };

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-center text-3xl font-bold">
          Examination Bill Generator
        </h1>

        <Toolbar
          onSave={handleSave}
          onLoad={handleLoad}
          onExport={handleExport}
          onImport={handleImport}
          onClear={handleClear}
          onValidate={handleValidate}
        />

        <div className="space-y-8">
          <BillInformation
            bill={billData.billInfo}
            setBill={(value) =>
              setBillData((prev) => ({
                ...prev,
                billInfo:
                  typeof value === "function"
                    ? value(prev.billInfo)
                    : value,
              }))
            }
          />

          <CommitteeTable
            committees={billData.committees}
            setCommittees={(data) =>
              setBillData((prev) => ({
                ...prev,
                committees: data,
              }))
            }
          />

          <CourseDutyManager
            evaluationSystem={
              billData.billInfo.evaluationSystem
            }
            courseDuties={billData.courseDuties}
            setCourseDuties={(data) =>
              setBillData((prev) => ({
                ...prev,
                courseDuties: data,
              }))
            }
          />

          <SessionalDutyManager
            sessionalDuties={
              billData.sessionalDuties
            }
            setSessionalDuties={(data) =>
              setBillData((prev) => ({
                ...prev,
                sessionalDuties: data,
              }))
            }
          />

          <QuestionWorkManager
            questionWorks={billData.questionWorks}
            setQuestionWorks={(data) =>
              setBillData((prev) => ({
                ...prev,
                questionWorks: data,
              }))
            }
          />

          <ScrutinyManager
            evaluationSystem={
              billData.billInfo.evaluationSystem
            }
            scrutinies={billData.scrutinies}
            setScrutinies={(data) =>
              setBillData((prev) => ({
                ...prev,
                scrutinies: data,
              }))
            }
          />

          <StudentDutyManager
            studentDuties={billData.studentDuties}
            setStudentDuties={(data) =>
              setBillData((prev) => ({
                ...prev,
                studentDuties: data,
              }))
            }
          />

          <CourseAdviserManager
            courseAdvisers={
              billData.courseAdvisers
            }
            setCourseAdvisers={(data) =>
              setBillData((prev) => ({
                ...prev,
                courseAdvisers: data,
              }))
            }
          />
        </div>
      </div>
    </main>
  );
}