import React, { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { useLoadingContext } from "../../context/Loading";
import Loading from "./Loading";

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Props {
  url: string;
  height?: number;
  width?: number;
  page?: number;
}

const PreviewBook = ({ url, height, width, page }: Props) => {
  const [numPages, setNumPages] = useState<number>(null);
  const { loading, setLoading } = useLoadingContext();

  useEffect(() => {
    setLoading(true);
  }, []);

  function onDocumentFullLoadSuccess({ numPages }) {
    setNumPages(numPages);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  }

  function onDocumentLoadSuccess({ numPages }) {
    setNumPages(numPages);
  }

  if (height && width) {
    return (
      <div>
        {loading && <Loading />}
        <Document
          file={url}
          onLoadSuccess={onDocumentFullLoadSuccess}
          loading={""}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              pageNumber={index + 1}
              key={index}
              width={width}
              height={height}
              loading={""}
            />
          ))}
        </Document>
      </div>
    );
  } else if (height) {
    return (
      <div>
        {loading && <Loading />}
        <Document
          file={url}
          onLoadSuccess={onDocumentFullLoadSuccess}
          loading={""}
        >
          {Array.from(new Array(numPages), (el, index) => (
            <Page
              pageNumber={index + 1}
              key={index}
              width={550}
              height={height}
              loading={""}
            />
          ))}
        </Document>
      </div>
    );
  } else {
    return (
      <div>
        {setLoading(false)}
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
