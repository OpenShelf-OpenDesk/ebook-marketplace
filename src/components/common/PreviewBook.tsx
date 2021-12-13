import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useLoadingContext } from "../../context/Loading";
import Loading from "./Loading";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface Props {
  url: string;
  height?: number;
  width?: number;
  setNumOfPages?: React.Dispatch<React.SetStateAction<number>>;
  page?: number;
  scale?: number;
}

const PreviewBook = ({
  url,
  height,
  width,
  setNumOfPages,
  page,
  scale,
}: Props) => {
  const [numPages, setNumPages] = useState<number>(null);
  const { loading, setLoading } = useLoadingContext();

  useEffect(() => {
    setLoading(true);
  }, []);

  function onDocumentFullLoadSuccess({ numPages }) {
    setNumOfPages(numPages);
    {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  if (height && width && setNumOfPages && scale && page) {
    return (
      <div>
        {loading && <Loading />}
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
            renderAnnotationLayer={false}
            renderTextLayer={false}
            renderMode="svg"
          />
        </Document>
      </div>
    );
  } else {
    return (
      <div>
        {setLoading(false)}
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
      </div>
    );
  }
};

export default PreviewBook;
