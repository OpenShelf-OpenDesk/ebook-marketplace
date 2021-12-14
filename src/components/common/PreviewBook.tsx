import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Props {
  url: string;
  height?: number;
  width?: number;
  setNumOfPages?: React.Dispatch<React.SetStateAction<number>>;
  page?: number;
  scale?: number;
  setLoadingState?: React.Dispatch<React.SetStateAction<boolean>>;
}

const PreviewBook = ({
  url,
  height,
  width,
  setNumOfPages,
  page,
  scale,
  setLoadingState,
}: Props) => {
  const [numPages, setNumPages] = useState<number>(null);

  function onDocumentFullLoadSuccess({ numPages }) {
    setNumOfPages(numPages);
    setTimeout(() => {
      setLoadingState(false);
    }, 1000);
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  if (height && width && setNumOfPages && scale && page) {
    return (
      <Document
        file={url}
        options={{ workerSrc: "/pdf.worker.min.js" }}
        onLoadSuccess={onDocumentFullLoadSuccess}
        loading={""}
        renderMode="svg"
      >
        <Page
          pageNumber={page}
          width={width}
          height={height}
          scale={scale}
          loading={""}
          renderMode="svg"
          renderAnnotationLayer={false}
          renderTextLayer={false}
        />
      </Document>
    );
  } else {
    return (
      <Document
        file={url}
        options={{ workerSrc: "/pdf.worker.min.js" }}
        onLoadSuccess={onDocumentLoadSuccess}
        loading={""}
      >
        {Array.from(new Array(numPages), (el, index) => (
          <Page
            pageNumber={index + 1}
            key={index}
            width={550}
            loading={""}
            renderAnnotationLayer={false}
            renderTextLayer={false}
          />
        ))}
      </Document>
    );
  }
};

export default PreviewBook;
