"use client";

import { useEffect, useMemo, useState } from "react";
import { emptyBill } from "../create/components/emptyBill";
import type { ExaminationBillData } from "../create/components/types";
import { loadCurrentWork } from "@/lib/storage/draft";
import {
  amountInBanglaWords,
  collectTeacherNames,
  deriveTeacherRows,
  rowAmount,
  type IndividualBillRow,
} from "./individualBill";

const blankRow = (): IndividualBillRow => ({
  id: crypto.randomUUID(), description: "", course: "", quantity: "", courseCount: "", classTestCount: "", rate: "",
});

const inputClass = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500";

export default function IndividualTeacherBillPage() {
  const [bill, setBill] = useState<ExaminationBillData>(emptyBill);
  const [teacher, setTeacher] = useState("");
  const [nameBangla, setNameBangla] = useState("");
  const [designationBangla, setDesignationBangla] = useState("");
  const [addressBangla, setAddressBangla] = useState("বিইসিএম বিভাগ, রুয়েট।");
  const [accountNumber, setAccountNumber] = useState("");
  const [rows, setRows] = useState<IndividualBillRow[]>([]);

  useEffect(() => {
    const saved = loadCurrentWork();
    // Hydrate the client-only draft after the page mounts.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setBill({ ...emptyBill, ...saved });
  }, []);

  const teachers = useMemo(() => collectTeacherNames(bill), [bill]);
  const total = useMemo(() => rows.reduce((sum, row) => sum + rowAmount(row), 0), [rows]);
  const bengaliYear: Record<string, string> = { "1st Year": "১ম বর্ষ", "2nd Year": "২য় বর্ষ", "3rd Year": "৩য় বর্ষ", "4th Year": "৪র্থ বর্ষ" };
  const bengaliSemester: Record<string, string> = { Odd: "বিজোড়", Even: "জোড়", "Odd Semester": "বিজোড়", "Even Semester": "জোড়" };
  const toBengaliDigits = (value: string) => value.replace(/[0-9]/g, (digit) => "০১২৩৪৫৬৭৮৯"[Number(digit)]);
  const examTitle = bill.billInfo.examType === "backlog"
    ? `${bengaliYear[bill.billInfo.year] || bill.billInfo.year || "১ম বর্ষ"} ব্যাকলগ পরীক্ষা ${toBengaliDigits(bill.billInfo.examYear || "২০২৪")}`
    : `${bengaliYear[bill.billInfo.year] || bill.billInfo.year || "১ম বর্ষ"} ${bengaliSemester[bill.billInfo.semester] || bill.billInfo.semester || "বিজোড়"} সেমিস্টার পরীক্ষা ${toBengaliDigits(bill.billInfo.examYear || "২০২৪")}`;
  const degreeOptions = [
    { key: "B.Sc. Engineering", label: "বি.এস.সি. ইঞ্জিনিয়ারিং" },
    { key: "B.U.R.P", label: "বি.ইউ.আর.পি" },
    { key: "B.Arch.", label: "বি.আর্ক." },
    { key: "M.Sc. Engineering", label: "এম.এস.সি. ইঞ্জিনিয়ারিং" },
    { key: "M.Phil.", label: "এম.ফিল." },
    { key: "PhD", label: "পি.এইচ.ডি." },
  ];
  const selectedDegreeKey = bill.billInfo.examination === "Ph.D." ? "PhD" : bill.billInfo.examination;

  const selectTeacher = (value: string) => {
    setTeacher(value);
    if (!nameBangla) setNameBangla(value);
    setRows(deriveTeacherRows(bill, value));
  };
  const updateRow = (id: string, key: keyof IndividualBillRow, value: string) =>
    setRows((current) => current.map((row) => row.id === id ? { ...row, [key]: value } : row));

  return (
    <main className="individual-bill-page py-8">
      <div className="mx-auto max-w-[1700px] px-4 sm:px-6">
        <div className="no-print mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">Individual Teacher Bill</h1>
            <p className="text-sm text-slate-500">বাংলা নির্ধারিত ফরমে ব্যক্তিগত পরীক্ষার পারিশ্রমিক বিল</p>
          </div>
          <button type="button" onClick={() => window.print()} className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">Generate PDF / Print</button>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[430px_1fr]">
          <section className="no-print space-y-5 rounded-xl border bg-white p-5 shadow-sm">
            <div className="space-y-3">
              <h2 className="font-semibold">Teacher information</h2>
              <label className="block text-sm">Teacher from master bill<select value={teacher} onChange={(event) => selectTeacher(event.target.value)} className={`${inputClass} mt-1`}><option value="">Select teacher</option>{teachers.map((name) => <option key={name}>{name}</option>)}</select></label>
              <label className="block text-sm">নাম (বাংলায়)<input value={nameBangla} onChange={(event) => setNameBangla(event.target.value)} className={`${inputClass} mt-1`} /></label>
              <label className="block text-sm">পদবী (বাংলায়)<input value={designationBangla} onChange={(event) => setDesignationBangla(event.target.value)} className={`${inputClass} mt-1`} placeholder="সহকারী অধ্যাপক" /></label>
              <label className="block text-sm">ঠিকানা<input value={addressBangla} onChange={(event) => setAddressBangla(event.target.value)} className={`${inputClass} mt-1`} /></label>
              <label className="block text-sm">হিসাব নং<input value={accountNumber} onChange={(event) => setAccountNumber(event.target.value)} className={`${inputClass} mt-1`} /></label>
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between"><h2 className="font-semibold">Remuneration rows</h2><button type="button" onClick={() => setRows((current) => [...current, blankRow()])} className="rounded border px-3 py-1 text-xs hover:bg-slate-50">+ Add row</button></div>
              {rows.length === 0 && <p className="rounded bg-slate-50 p-3 text-xs text-slate-500">Select a teacher to import duties, or add a row manually.</p>}
              {rows.map((row, index) => (
                <div key={row.id} className="space-y-2 rounded-lg border p-3">
                  <div className="flex justify-between text-xs font-semibold"><span>Row {index + 1}</span><button type="button" onClick={() => setRows((current) => current.filter((item) => item.id !== row.id))} className="text-red-600">Remove</button></div>
                  <input aria-label="কাজের বিবরণ" value={row.description} onChange={(event) => updateRow(row.id, "description", event.target.value)} className={inputClass} placeholder="কাজের বিবরণ" />
                  <div className="grid grid-cols-2 gap-2"><input aria-label="কোর্স" value={row.course} onChange={(event) => updateRow(row.id, "course", event.target.value)} className={inputClass} placeholder="কোর্স" /><input aria-label="খাতা বা ছাত্র সংখ্যা" value={row.quantity} onChange={(event) => updateRow(row.id, "quantity", event.target.value)} className={inputClass} placeholder="খাতা/ছাত্র" /><input aria-label="কোর্স সংখ্যা" value={row.courseCount} onChange={(event) => updateRow(row.id, "courseCount", event.target.value)} className={inputClass} placeholder="কোর্স সংখ্যা" /><input aria-label="ক্লাস টেস্ট সংখ্যা" value={row.classTestCount} onChange={(event) => updateRow(row.id, "classTestCount", event.target.value)} className={inputClass} placeholder="ক্লাস টেস্ট" /><input aria-label="হার" value={row.rate} onChange={(event) => updateRow(row.id, "rate", event.target.value)} className={inputClass} placeholder="হার" /><div className="flex items-center rounded bg-slate-50 px-3 text-sm font-semibold">৳ {rowAmount(row).toLocaleString("en-BD")}</div></div>
                </div>
              ))}
            </div>
          </section>

          <section className="preview-shell overflow-auto rounded-xl bg-slate-300 p-5">
            <article className="bill-sheet mx-auto bg-white text-black shadow-xl" lang="bn">
              <header className="relative text-center bill-header">
                <p className="text-[10px]">ঐশী জ্যোতিই আমাদের পথ প্রদর্শক</p>
                <h2 className="mt-1 text-[18px] font-bold">রাজশাহী প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয়</h2>
                <h1 className="mt-2 text-[17px] font-bold">পরীক্ষা সংক্রান্ত পারিশ্রমিকের বিল ফরম</h1>
              </header>
              <div className="teacher-info grid grid-cols-2 text-[12px]"><div><p>নামঃ <span className="font-semibold">{nameBangla || "................................"}</span></p><p>ঠিকানাঃ <span className="font-semibold">{addressBangla}</span></p></div><div className="text-right"><p>পদবীঃ <span className="font-semibold">{designationBangla || "................................"}</span></p><p>হিসাব নংঃ <span className="font-semibold">{accountNumber || "........................"}</span></p></div></div>
              <table className="bill-meta w-full table-fixed border-collapse text-[10px]"><tbody><tr><td className="w-[42%] align-top">{degreeOptions.map((degree, index) => <span key={degree.key} className={selectedDegreeKey && selectedDegreeKey !== degree.key ? "line-through" : undefined}>{index > 0 ? "/" : ""}{degree.label}</span>)}<br/><span>বিভাগঃ বিইসিএম বিভাগ</span></td><td className="w-[42%] text-center font-bold">{examTitle}</td><td className="w-[8%] text-center">বিল নং-</td><td className="w-[8%] text-center font-bold">{toBengaliDigits(bill.billInfo.billNo || "০১")}</td></tr></tbody></table>

              <table className="bill-table w-full table-fixed border-collapse text-[10px]">
                <colgroup><col className="w-[5%]"/><col className="w-[27%]"/><col className="w-[17%]"/><col className="w-[12%]"/><col className="w-[10%]"/><col className="w-[10%]"/><col className="w-[9%]"/><col className="w-[10%]"/></colgroup>
                <thead><tr><th>ক্রমিক নং</th><th>কাজের বিবরণ</th><th>বিষয় / কোর্স</th><th>খাতা / ছাত্র সংখ্যা</th><th>কোর্স সংখ্যা</th><th>ক্লাস টেস্ট সংখ্যা</th><th>পারিশ্রমিকের হার</th><th>টাকার পরিমাণ</th></tr></thead>
                <tbody>{rows.map((row, index) => <tr key={row.id}><td className="text-center">{index + 1}।</td><td>{row.description || "—"}</td><td className="text-center">{row.course || "—"}</td><td className="text-center">{row.quantity || "—"}</td><td className="text-center">{row.courseCount || "—"}</td><td className="text-center">{row.classTestCount || "—"}</td><td className="text-right">{row.rate || "—"}</td><td className="text-right">{rowAmount(row).toLocaleString("en-BD")}</td></tr>)}</tbody>
                <tfoot><tr><td colSpan={2} className="font-semibold">কথায়ঃ {amountInBanglaWords(total)} টাকা মাত্র</td><td colSpan={5} className="text-right font-semibold">মোটঃ</td><td className="text-right font-bold">{total.toLocaleString("en-BD")}</td></tr></tfoot>
              </table>

              <p className="mt-5 text-[11px]">প্রতি স্বাক্ষরিত</p>
              <div className="mt-12 grid grid-cols-2 text-center text-[11px]"><div><div className="mx-auto w-56 border-t border-black pt-1">সভাপতি, পরীক্ষা কমিটি।</div></div><div><div className="mx-auto w-56 border-t border-black pt-1">পরীক্ষকের স্বাক্ষর</div><p className="mt-1">তারিখঃ</p></div></div>
              <p className="mt-6 text-center text-[11px] font-semibold underline">বিত্ত শাখা পূরণ করিবেন</p>
              <p className="mt-4 text-[11px]">{nameBangla || "................................"}-কে {amountInBanglaWords(total)} টাকা মাত্র পরিশোধ করা হইল।</p>
              <div className="mt-12 grid grid-cols-4 text-center text-[10px]"><p>হিসাব সহকারী</p><p>হিসাব রক্ষক</p><p>সহকারী কম্পট্রোলার</p><p>কম্পট্রোলার<br/>রাজশাহী প্রকৌশল ও প্রযুক্তি বিশ্ববিদ্যালয়</p></div>
              <div className="mt-7 border-t border-black pt-2 text-[9px] leading-5"><p><strong>বিঃদ্রঃ-</strong> বিলের মোট পরিমাণ ২০০/- টাকার উপরে হইলে ১০/- টাকা মূল্যের রাজস্ব স্ট্যাম্প দিতে হইবে।</p><p>সরকারি শিক্ষক/অফিসারদের ক্ষেত্রে যথাযথ কর্তৃপক্ষের অনুমোদন প্রয়োজন। উল্লেখ্য যে, প্রত্যেক সেমিস্টার পরীক্ষার জন্য পৃথকভাবে বিল জমা দিতে হইবে।</p></div>
            </article>
          </section>
        </div>
      </div>
      <style jsx global>{`
        /* The bill strings are Unicode Bengali. SutonnyMJ uses legacy Bijoy
           encoding and renders Unicode text as scrambled glyphs, so use a
           Unicode Bengali font for the readable preview/print output. */
        .bill-sheet { width: 210mm; min-height: 297mm; padding: 12mm 13mm; font-family: "Nirmala UI", "Vrinda", "SolaimanLipi", sans-serif; }
        .bill-header { margin-bottom: 26mm; }
        .teacher-info { margin-bottom: 3mm; }
        .bill-meta td { border: 1px solid #000; padding: 4px 5px; vertical-align: middle; }
        .bill-table { margin-top: 3mm; }
        .bill-table th, .bill-table td { border: 1px solid #000; padding: 4px 5px; vertical-align: middle; }
        .bill-table th { text-align: center; vertical-align: top; font-weight: 600; }
        @media print {
          @page { size: A4 portrait; margin: 0; }
          html, body { background: #fff !important; }
          .no-print, nav { display: none !important; }
          .individual-bill-page { padding: 0 !important; }
          .individual-bill-page > div { max-width: none !important; padding: 0 !important; }
          .individual-bill-page .grid { display: block !important; }
          .preview-shell { overflow: visible !important; padding: 0 !important; background: #fff !important; border-radius: 0 !important; }
          .bill-sheet { box-shadow: none !important; }
        }
      `}</style>
    </main>
  );
}
