import React from "react";
import Image from "next/image";

interface Props {
  src: string;
  height?: number;
  width?: number;
}

const PreviewBookCoverPage = ({ src, height, width }: Props) => {
  return (
    <div className="relative h-full w-full self-start flex items-center">
      {height && width ? (
        <Image src={src} height={height} width={width} layout="fixed" />
      ) : (
        <Image src={src} layout="fill" objectFit="cover" />
      )}
    </div>
  );
};

export default PreviewBookCoverPage;
