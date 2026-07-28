"use client";

import { useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import { emptyBill } from "../create/components/emptyBill";
import type { ColumnWidths, ExaminationBillData } from "../create/components/types";
import { loadCurrentWork } from "@/lib/storage/draft";
import { getSavedIndividualTeacherNames, loadIndividualTeacherInformation, saveIndividualTeacherInformation } from "@/lib/storage/individualTeacher";
import ColumnWidthEditor from "../preview/components/ColumnWidthEditor";
import { collectTeacherNames, collectTeacherNameWarnings, deriveTeacherRows, rowAmount } from "./individualBill";
import IndividualBillPdfDocument from "./IndividualBillPdfDocument";
import IndividualBillPdfPreview from "./IndividualBillPdfPreview";
import IndividualLayoutEditor, { defaultIndividualBillLayout } from "./IndividualLayoutEditor";

const inputClass = "w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500";
const defaultAddress = "বিইসিএম বিভাগ, রুয়েট।";

const teacherInitials = (name: string) => {
  const ignoredTitles = new Set(["dr", "mr", "mrs", "ms", "mst"]);
  return name
    .trim()
    .split(/\s+/)
    .filter((word) => !ignoredTitles.has(word.replace(/\./g, "").toLocaleLowerCase()))
    .map((word) => word.match(/[\p{L}\p{N}]/u)?.[0] || "")
    .join("")
    .toLocaleUpperCase();
};

const formattedBillNumber = (billNumber: string) => {
  const value = billNumber.trim();
  if (/^\d+$/.test(value)) return value.padStart(2, "0");
  return value.replace(/[<>:"/\\|?*\u0000-\u001F]+/g, "-") || "00";
};

export default function IndividualTeacherBillPage() {
  const [bill, setBill] = useState<ExaminationBillData>(emptyBill);
  const [teacher, setTeacher] = useState("");
  const [nameBangla, setNameBangla] = useState("");
  const [designationBangla, setDesignationBangla] = useState("");
  const [addressBangla, setAddressBangla] = useState(defaultAddress);
  const [accountNumber, setAccountNumber] = useState("");
  const [status, setStatus] = useState("");
  const [downloading, setDownloading] = useState(false);
  const [metaWidths, setMetaWidths] = useState<ColumnWidths>({ qualifications: 36, examination: 38, billNumber: 26 });
  const [tableWidths, setTableWidths] = useState<ColumnWidths>({ serial: 7, descriptionGroup: 11, description: 18, course: 13, quantity: 10, courseCount: 6, classTestCount: 9, rate: 12, amount: 14 });
  const [layoutSettings, setLayoutSettings] = useState(defaultIndividualBillLayout);

  useEffect(() => {
    const saved = loadCurrentWork();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved) setBill({ ...emptyBill, ...saved });
  }, []);

  const teachers = useMemo(() => {
    const names = new Map<string, string>();
    [...getSavedIndividualTeacherNames(), ...collectTeacherNames(bill)].forEach((name) => {
      names.set(name.trim().toLocaleLowerCase(), name.trim());
    });
    return Array.from(names.values());
  }, [bill]);
  const warnings = useMemo(() => collectTeacherNameWarnings(bill), [bill]);
  const rows = useMemo(() => deriveTeacherRows(bill, teacher), [bill, teacher]);
  const total = useMemo(() => rows.reduce((sum, row) => sum + rowAmount(row), 0), [rows]);
  const document = useMemo(() => <IndividualBillPdfDocument bill={bill} teacher={teacher} nameBangla={nameBangla} designationBangla={designationBangla} addressBangla={addressBangla} accountNumber={accountNumber} metaWidths={metaWidths} tableWidths={tableWidths} layoutSettings={layoutSettings} />, [bill, teacher, nameBangla, designationBangla, addressBangla, accountNumber, metaWidths, tableWidths, layoutSettings]);

  useEffect(() => {
    if (teacher || teachers.length === 0) return;
    const firstTeacher = teachers[0];
    const saved = loadIndividualTeacherInformation(firstTeacher);
    // Populate the initial preview as soon as the master bill is hydrated.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTeacher(firstTeacher);
    setNameBangla((saved?.nameBangla ?? firstTeacher).replace(/^(mr|mrs|ms|mst)\.?(?=\s)/i, "").trim());
    setDesignationBangla(saved?.designationBangla ?? "");
    setAddressBangla(saved?.addressBangla ?? defaultAddress);
    setAccountNumber(saved?.accountNumber ?? "");
  }, [teacher, teachers]);

  const selectTeacher = (name: string) => {
    setTeacher(name);
    const saved = name ? loadIndividualTeacherInformation(name) : null;
    setNameBangla((saved?.nameBangla ?? name).replace(/^(mr|mrs|ms|mst)\.?(?=\s)/i, "").trim());
    setDesignationBangla(saved?.designationBangla ?? "");
    setAddressBangla(saved?.addressBangla ?? defaultAddress);
    setAccountNumber(saved?.accountNumber ?? "");
  };

  const saveTeacher = () => {
    if (!teacher) return;
    const saved = saveIndividualTeacherInformation(teacher, {
      englishName: teacher,
      nameBangla,
      designationBangla,
      addressBangla,
      accountNumber,
    });
    setStatus(saved ? "Teacher information saved." : "Unable to save teacher information.");
  };

  const download = async () => {
    setDownloading(true);
    setStatus("");
    try {
      const blob = await pdf(document).toBlob();
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      const initials = teacherInitials(teacher) || "Teacher";
      link.download = `${initials}_${formattedBillNumber(bill.billInfo.billNo)}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setStatus("PDF generated successfully.");
    } catch (error) {
      console.error(error);
      setStatus("Unable to generate PDF.");
    } finally {
      setDownloading(false);
    }
  };

  return <main className="py-8"><div className="mx-auto max-w-[1700px] px-4 sm:px-6">
    <div className="mb-5 flex items-center justify-between gap-3"><div><h1 className="text-2xl font-bold">Individual Teacher Bill</h1><p className="text-sm text-slate-500">The preview and downloaded Legal PDF use the same editable-text renderer.</p></div><div className="flex items-center gap-3">{status && <span className="text-xs">{status}</span>}<button onClick={download} disabled={downloading} className="rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white disabled:bg-blue-400">{downloading ? "Generating PDF…" : "Generate PDF"}</button></div></div>
    <div className="grid items-start gap-6 xl:grid-cols-[430px_1fr]">
      <section className="space-y-5 rounded-xl border bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Teacher information</h2>
        <label className="block text-sm">Teacher from master bill<select value={teacher} onChange={(event) => selectTeacher(event.target.value)} className={`${inputClass} mt-1`}><option value="">Select teacher</option>{teachers.map((name) => <option key={name}>{name}</option>)}</select></label>
        {warnings.length > 0 && <div className="rounded border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900"><p>{warnings.length} teacher name(s) are missing a courtesy title:</p><ul className="mt-2 list-disc space-y-1 pl-4">{warnings.map((warning) => <li key={`${warning.location}-${warning.name}`}>{warning.name} — {warning.location}</li>)}</ul></div>}
        <label className="block text-sm">নাম (বাংলায়)<input value={nameBangla} onChange={(e) => setNameBangla(e.target.value)} className={`${inputClass} mt-1`} /></label>
        <label className="block text-sm">পদবী (বাংলায়)<input value={designationBangla} onChange={(e) => setDesignationBangla(e.target.value)} className={`${inputClass} mt-1`} /></label>
        <label className="block text-sm">ঠিকানা<input value={addressBangla} onChange={(e) => setAddressBangla(e.target.value)} className={`${inputClass} mt-1`} /></label>
        <label className="block text-sm">হিসাব নং<input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} className={`${inputClass} mt-1`} /></label>
        <button onClick={saveTeacher} disabled={!teacher} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white disabled:bg-slate-300">Save teacher information</button>
        <div className="border-t pt-4 text-sm"><p>Billable rows: {rows.length}</p><p>Total: ৳ {total.toLocaleString("bn-BD")}</p></div>
        <div className="border-t pt-4"><h2 className="mb-2 font-semibold">Figure table widths</h2><ColumnWidthEditor widths={metaWidths} setWidths={setMetaWidths} labels={{ qualifications: "Qualifications", examination: "Examination", billNumber: "Bill number" }} /></div>
        <div className="border-t pt-4"><h2 className="mb-2 font-semibold">Remuneration table widths</h2><ColumnWidthEditor widths={tableWidths} setWidths={setTableWidths} labels={{ serial: "Serial", descriptionGroup: "Description group", description: "Description", course: "Course", quantity: "Scripts/students", courseCount: "Courses", classTestCount: "Class tests", rate: "Rate", amount: "Amount" }} /></div>
        <div className="border-t pt-4"><h2 className="mb-2 font-semibold">Typography and section spacing</h2><IndividualLayoutEditor settings={layoutSettings} setSettings={setLayoutSettings} /></div>
      </section>
      <IndividualBillPdfPreview document={document} />
    </div>
  </div></main>;
}
