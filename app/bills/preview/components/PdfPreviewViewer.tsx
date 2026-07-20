"use client";

import { PDFViewer } from "@react-pdf/renderer";
import type { ExaminationBillData } from "../../create/components/types";
import BillPdfDocument from "../../create/components/pdf/BillPdfDocument";

export default function PdfPreviewViewer({
  bill,
}: {
  bill: ExaminationBillData;
}) {
  return (
    <PDFViewer
      showToolbar
      style={{ width: "100%", height: "100%", border: "none" }}
    >
      <BillPdfDocument bill={bill} />
    </PDFViewer>
  );
}
