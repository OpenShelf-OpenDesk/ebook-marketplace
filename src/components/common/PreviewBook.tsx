import React from 'react';
import { Document, Page, pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

interface Props {
  url: string;
  height?: number;
  width?: number;
}

const PreviewBook = ({ url, height, width }: Props) => {
  return (
    <div>
      <Document file={url}>
        <Page pageNumber={1} height={height} width={width} />
      </Document>
    </div>
  );
};

export default PreviewBook;
