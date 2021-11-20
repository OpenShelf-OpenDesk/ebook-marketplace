import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Props {
  url: string;
  height?: number;
  width?: number;
  page?: number;
}

const PreviewBook = ({ url, height, width, page = 1 }: Props) => {
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
        <Document file={url}>
          <Page pageNumber={page} />
        </Document>
      </div>
    );
  }
};

export default PreviewBook;
