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
    <div className=''>
      {height && width ? (
        <Document file={url}>
          <Page pageNumber={1} height={height} width={width} />
        </Document>
      ) : (
        <Document file={url}>
          <Page pageNumber={1} height={320} />
        </Document>
      )}
    </div>
  );
};

export default PreviewBook;
