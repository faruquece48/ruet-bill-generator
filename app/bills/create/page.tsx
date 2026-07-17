"use client";

import { useState } from "react";

import Toolbar from "./components/Toolbar";
import BillInformation from "./components/BillInformation";
import CommitteeTable from "./components/CommitteeTable";
import CourseDutyManager from "./components/CourseDutyManager";
import SessionalDutyManager from "./components/SessionalDutyManager";
import QuestionWorkManager from "./components/QuestionWorkManager";
import ScrutinyManager from "./components/ScrutinyManager";
import StudentDutyManager from "./components/StudentDutyManager";
import CourseAdviserManager from "./components/CourseAdviserManager";

import type { BillInfo } from "./components/types";

export default function Home() {
  const [bill, setBill] = useState<BillInfo>({
    billNo: "",
    examination: "",
    year: "",
    examType: "semester",
    semester: "",
    examYear: "",
    series: "",
    evaluationSystem: "obe",
  });

  const handleSave = () => alert("Save Draft clicked.");
  const handleLoad = () => alert("Load Draft clicked.");
  const handleExport = () => alert("Export Data clicked.");
  const handleImport = () => alert("Import Data clicked.");
  const handleClear = () => alert("Clear Form clicked.");
  const handleValidate = () => alert("Validate Data clicked.");

  return (
    <main className="min-h-screen bg-slate-50 py-10">
      <div className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        <h1 className="mb-8 text-3xl font-bold text-center">
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
          <BillInformation bill={bill} setBill={setBill} />
          <CommitteeTable />
          <CourseDutyManager evaluationSystem={bill.evaluationSystem} />
          <SessionalDutyManager />
          <QuestionWorkManager />
          <ScrutinyManager evaluationSystem={bill.evaluationSystem} />
          <StudentDutyManager />
          <CourseAdviserManager />
        </div>
      </div>
    </main>
  );
}