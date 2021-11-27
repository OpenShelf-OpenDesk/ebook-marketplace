import React, { useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Props {
  url: string;
  height?: number;
  width?: number;
  page?: number;
}

const PreviewBook = ({ url, height, width, page }: Props) => {
  const [numPages, setNumPages] = useState<number>(null);

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  if (height && width) {
    return (
      <div>
        <Document file={url}>
          <Page pageNumber={page} height={height} width={width} />
        </Document>
      </div>
    );
  } else if (height) {
    return (
      <div>
        <Document file={url}>
          <Page pageNumber={page} height={320} />
        </Document>
      </div>
    );
  } else {
    return (
      <div>
        <Document file={url} onLoadSuccess={onDocumentLoadSuccess} loading={""}>
          {Array.from(new Array(numPages), (el, index) => (
            <Page pageNumber={index + 1} key={index} width={550} loading={""} />
          ))}
        </Document>
      </div>
    );
  }
};

export default PreviewBook;
