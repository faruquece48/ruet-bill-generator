import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { ExaminationBillData } from "../types";
import {
  buildExamLine,
  formatTeacher,
  flattenCourseDuties,
  flattenSessionalDuties,
  FlatDutyRow,
  FlatSessionalRow,
} from "./pdfHelpers";

const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 70,
    paddingHorizontal: 40,
    fontSize: 9,
    fontFamily: "Helvetica",
  },
  header: {
    textAlign: "center",
    marginBottom: 12,
  },
  headerLine: {
    fontSize: 9,
    marginBottom: 2,
  },
  headerBold: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 10,
    marginTop: 12,
    marginBottom: 6,
  },
  table: {
    display: "flex",
    width: "100%",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
  },
  headerCell: {
    fontFamily: "Helvetica-Bold",
    borderWidth: 0.5,
    borderColor: "#000",
    padding: 4,
    fontSize: 8.5,
  },
  cell: {
    borderWidth: 0.5,
    borderColor: "#000",
    padding: 4,
    fontSize: 8.5,
  },
  footer: {
    position: "absolute",
    bottom: 24,
    right: 40,
    textAlign: "right",
  },
  footerText: {
    fontSize: 9,
  },
  emptyNote: {
    fontSize: 8.5,
    fontStyle: "italic",
    color: "#666",
    marginBottom: 8,
  },
});

interface SectionDef {
  title: string;
  applicable: boolean;
  content: () => JSX.Element;
}

export default function BillPdfDocument({
  bill,
}: {
  bill: ExaminationBillData;
}) {
  const { billInfo } = bill;
  const examLine = buildExamLine(billInfo);

  const Footer = () => (
    <View style={styles.footer} fixed>
      <Text style={styles.footerText}>Chairman</Text>
      <Text style={styles.footerText}>Examination Committee</Text>
      <Text style={styles.footerText}>{examLine}</Text>
      <Text style={styles.footerText}>RUET, Rajshahi</Text>
    </View>
  );

  const allCourseDuties = [...bill.courseDuties.obe, ...bill.courseDuties.nonObe];
  const dutyRows = flattenCourseDuties(allCourseDuties);
  const sessionalRows = flattenSessionalDuties(bill.sessionalDuties);

  const paperSetterRows = dutyRows.filter((r) => r.paperSetter || r.examiner);
  const classTestRows = dutyRows.filter((r) => r.classTest);
  const assignmentRows = dutyRows.filter((r) => r.assignment);
  const courseFileRows = [
    ...dutyRows.filter((r) => r.courseFile),
  ];
  const sessionalCourseFileRows = sessionalRows.filter((r) => r.courseFile);
  const sessionalOnlyRows = sessionalRows.filter((r) => r.sessional);

  const allScrutiny = [...bill.scrutinies.obe, ...bill.scrutinies.nonObe];

  const sections: SectionDef[] = [
    {
      title: "Examination Committee",
      applicable: bill.committees.length > 0,
      content: () => (
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.headerCell, { width: "45%" }]}>
              Name of Teachers & Designation
            </Text>
            <Text style={[styles.headerCell, { width: "20%" }]}>
              Department
            </Text>
            <Text style={[styles.headerCell, { width: "35%" }]}>Role</Text>
          </View>
          {bill.committees.map((m, i) => (
            <View style={styles.row} key={i}>
              <Text style={[styles.cell, { width: "45%" }]}>
                {formatTeacher(m.name, m.designation, "")}
              </Text>
              <Text style={[styles.cell, { width: "20%" }]}>
                {m.department}
              </Text>
              <Text style={[styles.cell, { width: "35%" }]}>{m.role}</Text>
            </View>
          ))}
        </View>
      ),
    },
    {
      title: "List of Teachers Associated with Paper Setter & Examiner",
      applicable: paperSetterRows.length > 0,
      content: () => (
        <DutyTable
          rows={paperSetterRows}
          valueLabel="No. of Paper Set / Script Examined"
          getValue={(r) =>
            `${r.paperSetter ? "01" : "-"} / ${r.examiner || "-"}`
          }
        />
      ),
    },
    {
      title: "List of Teachers Associated with Class Test",
      applicable: classTestRows.length > 0,
      content: () => (
        <ClassTestTable rows={classTestRows} />
      ),
    },
    {
      title: "List of Teachers Associated with Assignment",
      applicable: assignmentRows.length > 0,
      content: () => (
        <DutyTable
          rows={assignmentRows}
          valueLabel="No. of Class Assignment"
          getValue={(r) => r.assignmentValue || "01"}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Course File",
      applicable: courseFileRows.length + sessionalCourseFileRows.length > 0,
      content: () => (
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.headerCell, { width: "20%" }]}>
              Course No. & Title
            </Text>
            <Text style={[styles.headerCell, { width: "60%" }]}>
              Name of Teachers & Designation
            </Text>
            <Text style={[styles.headerCell, { width: "20%" }]}>
              No. of Course File
            </Text>
          </View>
          {courseFileRows.map((r, i) => (
            <View style={styles.row} key={`c-${i}`}>
              <Text style={[styles.cell, { width: "20%" }]}>
                {r.courseCode}
                {"\n"}
                {r.courseTitle}
              </Text>
              <Text style={[styles.cell, { width: "60%" }]}>
                {formatTeacher(r.name, r.designation, r.department)}
              </Text>
              <Text style={[styles.cell, { width: "20%" }]}>01</Text>
            </View>
          ))}
          {sessionalCourseFileRows.map((r, i) => (
            <View style={styles.row} key={`s-${i}`}>
              <Text style={[styles.cell, { width: "20%" }]}>
                {r.courseCode}
                {"\n"}
                {r.courseTitle}
              </Text>
              <Text style={[styles.cell, { width: "60%" }]}>
                {formatTeacher(r.name, r.designation, r.department)}
              </Text>
              <Text style={[styles.cell, { width: "20%" }]}>01</Text>
            </View>
          ))}
        </View>
      ),
    },
    {
      title:
        "List of Teachers Associated with Question Typing, Sketching, Comparing & Printing",
      applicable: bill.questionWorks.length > 0,
      content: () => (
        <SimpleTeacherTable
          rows={bill.questionWorks}
          valueLabel="No. of Question"
          getValue={(r) => String(r.questionNumber)}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Scrutiny",
      applicable: allScrutiny.length > 0,
      content: () => (
        <SimpleTeacherTable
          rows={allScrutiny}
          valueLabel="No. of Script"
          getValue={(r) => String(r.scriptCount)}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Sessional",
      applicable: sessionalOnlyRows.length > 0,
      content: () => (
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.headerCell, { width: "30%" }]}>
              Course No. & Title
            </Text>
            <Text style={[styles.headerCell, { width: "50%" }]}>
              Name of Teachers & Designation
            </Text>
            <Text style={[styles.headerCell, { width: "20%" }]}>
              No. of Students
            </Text>
          </View>
          {sessionalOnlyRows.map((r, i) => (
            <View style={styles.row} key={i}>
              <Text style={[styles.cell, { width: "30%" }]}>
                {r.courseCode}
                {"\n"}
                {r.courseTitle}
              </Text>
              <Text style={[styles.cell, { width: "50%" }]}>
                {formatTeacher(r.name, r.designation, r.department)}
              </Text>
              <Text style={[styles.cell, { width: "20%" }]}>
                {r.sessionalStudents}
              </Text>
            </View>
          ))}
        </View>
      ),
    },
    {
      title: "List of Teachers Associated with Tabulation",
      applicable: bill.studentDuties.length > 0,
      content: () => (
        <SimpleTeacherTable
          rows={bill.studentDuties}
          valueLabel="No. of Students"
          getValue={(r) => String(r.students)}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Thesis/Project Examination",
      applicable:
        billInfo.year === "4th Year" &&
        billInfo.semester === "Even" &&
        bill.thesisTeachers.length > 0,
      content: () => (
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.headerCell, { width: "45%" }]}>
              Name of Teachers & Designation
            </Text>
            <Text style={[styles.headerCell, { width: "18%" }]}>
              Supervisor
            </Text>
            <Text style={[styles.headerCell, { width: "18%" }]}>
              Thesis Examiner
            </Text>
            <Text style={[styles.headerCell, { width: "19%" }]}>
              Attends Viva
            </Text>
          </View>
          {bill.thesisTeachers.map((t, i) => (
            <View style={styles.row} key={i}>
              <Text style={[styles.cell, { width: "45%" }]}>
                {formatTeacher(t.name, t.designation, t.department)}
              </Text>
              <Text style={[styles.cell, { width: "18%" }]}>
                {t.supervisorCount === "" ? "--" : t.supervisorCount}
              </Text>
              <Text style={[styles.cell, { width: "18%" }]}>
                {t.examinerCount === "" ? "--" : t.examinerCount}
              </Text>
              <Text style={[styles.cell, { width: "19%" }]}>
                {t.attendsViva ? "Yes" : "No"}
              </Text>
            </View>
          ))}
        </View>
      ),
    },
    {
      title: "List of Course Advisers",
      applicable: bill.courseAdvisers.length > 0,
      content: () => (
        <SimpleTeacherTable
          rows={bill.courseAdvisers}
          valueLabel="No. of Students"
          getValue={(r) => String(r.students)}
        />
      ),
    },
    {
      title: "List of Teachers Associated with Course Coordinator",
      applicable:
        billInfo.year === "4th Year" &&
        billInfo.semester === "Even" &&
        bill.courseCoordinatorTeachers.length > 0,
      content: () => (
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.headerCell, { width: "100%" }]}>
              Name of Teachers & Designation
            </Text>
          </View>
          {bill.courseCoordinatorTeachers.map((t, i) => (
            <View style={styles.row} key={i}>
              <Text style={[styles.cell, { width: "100%" }]}>
                {formatTeacher(t.name, t.designation, t.department)}
              </Text>
            </View>
          ))}
        </View>
      ),
    },
    {
      title: "List of Teachers Associated with Verification of Final Result",
      applicable:
        billInfo.hasGraduatingStudents === "yes" &&
        bill.verificationTeachers.length > 0,
      content: () => (
        <View style={styles.table}>
          <View style={styles.row}>
            <Text style={[styles.headerCell, { width: "70%" }]}>
              Name of Teachers & Designation
            </Text>
            <Text style={[styles.headerCell, { width: "30%" }]}>
              No. of Students
            </Text>
          </View>
          {bill.verificationTeachers.map((t, i) => (
            <View style={styles.row} key={i}>
              <Text style={[styles.cell, { width: "70%" }]}>
                {formatTeacher(t.name, t.designation, t.department)}
              </Text>
              <Text style={[styles.cell, { width: "30%" }]}>
                {i === 0 ? bill.verificationStudentCount : ""}
              </Text>
            </View>
          ))}
        </View>
      ),
    },
  ];

  const applicableSections = sections.filter((s) => s.applicable);

  return (
    <Document>
      <Page size="LEGAL" style={styles.page} wrap>
        <View style={styles.header}>
          <Text style={[styles.headerLine, styles.headerBold]}>
            Heaven's Light is Our Guide{"   "}Bill No.: {billInfo.billNo}
          </Text>
          <Text style={styles.headerLine}>
            {billInfo.examination} Examination
            {billInfo.series ? ` (Series ${billInfo.series})` : ""}
          </Text>
          <Text style={styles.headerLine}>{buildExamLine(billInfo)}</Text>
        </View>

        {applicableSections.map((section, idx) => (
          <View key={section.title} wrap={false === undefined}>
            <Text style={styles.sectionTitle}>
              {idx + 1}. {section.title}
            </Text>
            {section.content()}
          </View>
        ))}

        <Footer />
      </Page>
    </Document>
  );
}

// ------------------------------
// Reusable table renderers
// ------------------------------
function DutyTable({
  rows,
  valueLabel,
  getValue,
}: {
  rows: FlatDutyRow[];
  valueLabel: string;
  getValue: (r: FlatDutyRow) => string;
}) {
  return (
    <View style={styles.table}>
      <View style={styles.row}>
        <Text style={[styles.headerCell, { width: "18%" }]}>
          Course No. & Title
        </Text>
        <Text style={[styles.headerCell, { width: "10%" }]}>Part</Text>
        <Text style={[styles.headerCell, { width: "47%" }]}>
          Name of Teachers & Designation
        </Text>
        <Text style={[styles.headerCell, { width: "25%" }]}>
          {valueLabel}
        </Text>
      </View>
      {rows.map((r, i) => (
        <View style={styles.row} key={i}>
          <Text style={[styles.cell, { width: "18%" }]}>
            {r.courseCode}
            {"\n"}
            {r.courseTitle}
          </Text>
          <Text style={[styles.cell, { width: "10%" }]}>{r.part}</Text>
          <Text style={[styles.cell, { width: "47%" }]}>
            {formatTeacher(r.name, r.designation, r.department)}
          </Text>
          <Text style={[styles.cell, { width: "25%" }]}>{getValue(r)}</Text>
        </View>
      ))}
    </View>
  );
}

function ClassTestTable({ rows }: { rows: FlatDutyRow[] }) {
  return (
    <View style={styles.table}>
      <View style={styles.row}>
        <Text style={[styles.headerCell, { width: "22%" }]}>
          Course No. & Title
        </Text>
        <Text style={[styles.headerCell, { width: "48%" }]}>
          Name of Teachers & Designation
        </Text>
        <Text style={[styles.headerCell, { width: "15%" }]}>
          No. of Class Test
        </Text>
        <Text style={[styles.headerCell, { width: "15%" }]}>
          No. of Students
        </Text>
      </View>
      {rows.map((r, i) => (
        <View style={styles.row} key={i}>
          <Text style={[styles.cell, { width: "22%" }]}>
            {r.courseCode}
            {"\n"}
            {r.courseTitle}
          </Text>
          <Text style={[styles.cell, { width: "48%" }]}>
            {formatTeacher(r.name, r.designation, r.department)}
          </Text>
          <Text style={[styles.cell, { width: "15%" }]}>
            {r.classTestCount}
          </Text>
          <Text style={[styles.cell, { width: "15%" }]}>
            {r.classTestStudents}
          </Text>
        </View>
      ))}
    </View>
  );
}

function SimpleTeacherTable<T extends { name: string; designation: any; department?: string }>({
  rows,
  valueLabel,
  getValue,
}: {
  rows: T[];
  valueLabel: string;
  getValue: (r: T) => string;
}) {
  return (
    <View style={styles.table}>
      <View style={styles.row}>
        <Text style={[styles.headerCell, { width: "10%" }]}>SI. No.</Text>
        <Text style={[styles.headerCell, { width: "65%" }]}>
          Name of Teachers & Designation
        </Text>
        <Text style={[styles.headerCell, { width: "25%" }]}>
          {valueLabel}
        </Text>
      </View>
      {rows.map((r, i) => (
        <View style={styles.row} key={i}>
          <Text style={[styles.cell, { width: "10%" }]}>
            {String(i + 1).padStart(2, "0")}.
          </Text>
          <Text style={[styles.cell, { width: "65%" }]}>
            {formatTeacher(r.name, r.designation, r.department || "")}
          </Text>
          <Text style={[styles.cell, { width: "25%" }]}>{getValue(r)}</Text>
        </View>
      ))}
    </View>
  );
}