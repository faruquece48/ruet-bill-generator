"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpenText,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  FileText,
  Home,
  Megaphone,
  Settings,
  UserRound,
} from "lucide-react";
import heroImage from "../images/image_01.png";
import campusImage from "../images/image_02.png";
import logoImage from "../images/image_03.png";
import { emptyBill } from "../bills/create/components/emptyBill";
import type { ExaminationBillData } from "../bills/create/components/types";
import { loadCurrentWork } from "@/lib/storage/draft";
import {
  collectTeacherNames,
  deriveTeacherRows,
  rowAmount,
} from "../bills/individual/individualBill";

const menuItems = [
  { label: "Home", icon: Home },
  { label: "My Bills", icon: FileText },
  { label: "Exam Notices", icon: Bell },
  { label: "Academic Calendar", icon: CalendarDays },
];

const formatExam = (bill: ExaminationBillData) => {
  const info = bill.billInfo;
  if (info.examType === "backlog") {
    return `${info.year || "Academic"} Backlog Examination ${info.examYear || ""}`.trim();
  }
  return `${info.year || "Academic"} ${info.semester || ""} Semester Examination ${info.examYear || ""}`.replace(/\s+/g, " ").trim();
};

export default function TeacherTestPage() {
  const [bill, setBill] = useState<ExaminationBillData>(emptyBill);
  const [teacher, setTeacher] = useState("");

  useEffect(() => {
    const saved = loadCurrentWork();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setBill({ ...emptyBill, ...saved, billInfo: { ...emptyBill.billInfo, ...saved.billInfo } });
  }, []);

  const teachers = useMemo(() => collectTeacherNames(bill), [bill]);
  const selectedTeacher = teacher || teachers[0] || "Teacher";
  const teacherTotal = useMemo(
    () => deriveTeacherRows(bill, selectedTeacher).reduce((sum, row) => sum + rowAmount(row), 0),
    [bill, selectedTeacher]
  );
  const examName = formatExam(bill);
  const billNumber = bill.billInfo.billNo || "—";
  const today = new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date());

  const notices = [
    {
      title: `${examName || "Examination"} notice`,
      text: `The current examination bill is available for review. Bill No. ${billNumber}.`,
      date: today,
      tone: "blue",
    },
    {
      title: "Student information update",
      text: `${bill.billInfo.totalStudents || 30} students are currently configured for this examination.`,
      date: "Auto-generated",
      tone: "violet",
    },
    {
      title: "Series and evaluation reminder",
      text: `${bill.billInfo.series || "Series not set"} · ${bill.billInfo.evaluationSystem === "obe" ? "OBE (New Syllabus)" : "Mixed evaluation"}.`,
      date: "Auto-generated",
      tone: "amber",
    },
  ];

  return <main className="min-h-screen bg-[#f7f9ff] text-[#13264d]">
    <div className="mx-auto flex min-h-screen max-w-[1600px]">
      <aside className="hidden w-[255px] shrink-0 flex-col bg-[#082452] text-white lg:flex">
        <div className="px-6 pb-8 pt-8 text-center">
          <Image src={logoImage} alt="RUET logo" className="mx-auto h-24 w-24 rounded-full object-contain" />
          <p className="mt-5 text-2xl font-semibold tracking-wide">RUET</p>
          <p className="mt-1 whitespace-nowrap text-sm leading-6 text-blue-100">Bill Generator System</p>
        </div>
        <nav className="space-y-2 px-5">
          {menuItems.map(({ label, icon: Icon }, index) => <button key={label} type="button" className={`flex w-full items-center gap-4 rounded-xl px-4 py-3 text-left text-sm font-medium ${index === 0 ? "bg-indigo-600 text-white shadow-lg shadow-indigo-950/20" : "text-blue-100 hover:bg-white/10"}`}>
            <Icon className="h-5 w-5" /> <span>{label}</span>{index > 0 && <ChevronRight className="ml-auto h-4 w-4" />}
          </button>)}
        </nav>
        <div className="mt-6 overflow-hidden pt-2">
          <Image src={campusImage} alt="RUET campus illustration" className="h-52 w-full object-cover object-top opacity-80" />
          <p className="px-6 pb-8 pt-4 text-center text-xs leading-5 text-blue-100">Rajshahi University of<br />Engineering &amp; Technology</p>
        </div>
      </aside>

      <section className="min-w-0 flex-1">
        <header className="flex h-16 items-center justify-end gap-3 border-b bg-white px-5 sm:px-8">
          <button type="button" className="rounded-lg border border-slate-200 p-2.5 text-[#13264d]" aria-label="Notifications"><Bell className="h-5 w-5" /></button>
          <button type="button" className="flex items-center gap-2 rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium"><UserRound className="h-4 w-4" /> Teacher</button>
        </header>

        <div className="w-full space-y-6 p-5 sm:p-8">
          <section className="relative h-[390px] overflow-hidden rounded-2xl bg-[#f0f3ff] px-7 py-10 shadow-sm sm:h-[430px] sm:px-12">
            <Image src={heroImage} alt="Examination bill illustration" fill priority className="object-fill" />
            <div className="relative z-10 max-w-xl">
              <p className="text-xl font-semibold text-[#203d75]">Welcome to</p>
              <h1 className="mt-2 font-serif text-4xl font-bold leading-[0.98] text-[#102b5a] sm:text-5xl">RUET Examination<br />Bill Generator System</h1>
              <p className="mt-6 max-w-md text-base leading-7 text-[#465b87]">Review examination notices, track your assigned duties, and keep your bill information ready.</p>
              <Link href="/bills/individual" className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-200"><FileText className="h-4 w-4" /> View My Bill</Link>
            </div>
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(330px,1fr)]">
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
              <div className="mb-5 flex items-center justify-between"><h2 className="text-lg font-bold">Quick access</h2><span className="text-xs text-slate-400">Teacher view</span></div>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {[
                  [FileText, "My Bill", "Review your generated bill", "/bills/individual", "text-indigo-600"],
                  [BookOpenText, "Bill Summary", "View examination summary", "/bills/summary", "text-sky-600"],
                  [Megaphone, "Notices", "Read current announcements", "#notices", "text-emerald-600"],
                  [Bell, "Exam Notice", "See exam-related updates", "#notices", "text-orange-500"],
                ].map(([Icon, label, text, href, color]) => <Link key={label as string} href={href as string} className="rounded-xl border border-slate-100 p-5 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"><span className={`mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-50 ${color as string}`}><Icon className="h-7 w-7" /></span><p className="mt-3 font-semibold">{label as string}</p><p className="mt-1 text-xs leading-5 text-slate-500">{text as string}</p></Link>)}
              </div>
            </section>

            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"><h2 className="text-lg font-bold">My bill snapshot</h2><div className="mt-4 grid grid-cols-2 gap-3"><div className="rounded-xl bg-indigo-50 p-4"><p className="text-xs text-slate-500">Bill No.</p><p className="mt-1 text-2xl font-bold">{billNumber}</p></div><div className="rounded-xl bg-sky-50 p-4"><p className="text-xs text-slate-500">Billable rows</p><p className="mt-1 text-2xl font-bold">{deriveTeacherRows(bill, selectedTeacher).length}</p></div><div className="col-span-2 rounded-xl bg-emerald-50 p-4"><p className="text-xs text-slate-500">Current total</p><p className="mt-1 text-2xl font-bold">৳ {teacherTotal.toLocaleString("en-US")}</p></div></div><label className="mt-5 block text-sm font-medium">Preview teacher<select value={teacher} onChange={(event) => setTeacher(event.target.value)} className="mt-1.5 w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"><option value="">First available teacher</option>{teachers.map((name) => <option key={name}>{name}</option>)}</select></label></section>
          </div>

          <div id="notices" className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
            <section className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100"><div className="mb-4 flex items-center justify-between"><h2 className="text-lg font-bold">Automatic notices</h2><span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">Live from bill data</span></div><div className="space-y-3">{notices.map((notice) => <article key={notice.title} className="flex gap-3 rounded-xl border border-slate-100 p-4"><span className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${notice.tone === "blue" ? "bg-blue-50 text-blue-600" : notice.tone === "violet" ? "bg-violet-50 text-violet-600" : "bg-amber-50 text-amber-600"}`}><Megaphone className="h-4 w-4" /></span><div><h3 className="text-sm font-semibold">{notice.title}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{notice.text}</p><p className="mt-2 text-[11px] text-slate-400">{notice.date}</p></div></article>)}</div></section>
            <section className="rounded-2xl bg-[#102e60] p-6 text-white shadow-sm"><div className="flex items-center gap-3"><ClipboardList className="h-6 w-6 text-indigo-200" /><h2 className="text-lg font-bold">Exam information</h2></div><div className="mt-5 space-y-3 text-sm"><div className="flex items-center justify-between border-b border-white/10 pb-3"><span className="text-blue-200">Examination</span><span className="font-medium">{bill.billInfo.examination || "B.Sc. Engineering"}</span></div><div className="flex items-center justify-between border-b border-white/10 pb-3"><span className="text-blue-200">Exam</span><span className="text-right font-medium">{examName || "Not configured"}</span></div><div className="flex items-center justify-between border-b border-white/10 pb-3"><span className="text-blue-200">Series</span><span className="font-medium">{bill.billInfo.series || "—"}</span></div><div className="flex items-center justify-between"><span className="text-blue-200">Students</span><span className="font-medium">{bill.billInfo.totalStudents || 30}</span></div></div><div className="mt-6 flex items-center gap-2 rounded-lg bg-white/10 px-3 py-2 text-xs text-blue-100"><CheckCircle2 className="h-4 w-4 text-emerald-300" /> Information is generated from the latest saved bill.</div></section>
          </div>

          <footer className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-5 text-xs text-slate-500"><span>© 2025 RUET Examination Bill Generator System.</span><span>Teacher preview test page · hidden route</span><Settings className="h-4 w-4" /></footer>
        </div>
      </section>
    </div>
  </main>;
}
