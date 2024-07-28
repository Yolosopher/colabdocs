"use client";

import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import richToWord from "rich-to-word";

type ExportProps = {
  rootElement: HTMLElement | null;
  title: string;
  font: string;
  creator: string;
};

export const generatePDF = ({
  rootElement,
  title,
  font,
  creator,
}: ExportProps) => {
  return new Promise(async (resolve, reject) => {
    if (!rootElement) return reject("Root element not found");

    const doc = new jsPDF("p", "pt", "a4");
    doc.setCreationDate(new Date(Date.now()));
    doc.setFont(font);
    doc.addMetadata("Author", creator);
    doc.addMetadata("Title", title);
    doc.addMetadata("Creator", creator);
    doc.addMetadata("Producer", "ColabDocs");

    // CANVAS IMAGE
    const canvas = await html2canvas(rootElement, {
      scale: 2,
    });
    const imgData = canvas.toDataURL("image/png");
    const imgWidth = doc.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    doc.addImage(imgData, "PNG", 0, 0, imgWidth, imgHeight);

    doc.save(`${title}.pdf`);

    //  remove rootElement color style after generating pdf
    resolve(true);
  });
};

export const generateDoc = ({
  creator,
  font,
  rootElement,
  title,
}: ExportProps) => {
  return new Promise(async (resolve, reject) => {
    if (!rootElement) return reject("Root element not found");
    var header =
      "<html xmlns:o='urn:schemas-microsoft-com:office:office' " +
      "xmlns:w='urn:schemas-microsoft-com:office:word' " +
      "xmlns='http://www.w3.org/TR/REC-html40'>" +
      `<head>
      <meta charset='utf-8'>
      <title>${title}</title>
      <style>
        html, body {
          font-family: ${font};
        }
      </style>
      </head><body>`;
    var footer = "</body></html>";
    var sourceHTML = header + rootElement.innerHTML + footer;

    var source =
      "data:application/vnd.ms-word;charset=utf-8," +
      encodeURIComponent(sourceHTML);
    var fileDownload = document.createElement("a");
    document.body.appendChild(fileDownload);
    fileDownload.href = source;
    fileDownload.download = `${title}.doc`;
    fileDownload.click();
    document.body.removeChild(fileDownload);

    resolve(true);
  });
};
