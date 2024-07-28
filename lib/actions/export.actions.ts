"use server";
import jsPDF from "jspdf";

type ExportPDFProps = {
  htmlContent: string;
  title: string;
  font: string;
  creator: string;
};

export const generatePDF = async ({
  htmlContent,
  title,
  font,
  creator,
}: ExportPDFProps) => {
  const doc = new jsPDF();
  doc.setCreationDate(new Date(Date.now()));
  doc.setFont(font);
  doc.addMetadata("Author", creator);
  doc.addMetadata("Title", title);
  doc.addMetadata("Creator", creator);
  doc.addMetadata("Producer", "ColabDocs");
  const result = await doc.html(htmlContent, {
    x: 10,
    y: 10,
    callback: function (doc) {
      doc.save(`${title}.pdf`);
    },
  });
  console.log(result);
  return result;
};
