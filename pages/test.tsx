import React from 'react';
import PreviewBookCoverPage from '../src/components/common/PreviewBookCoverPage';
interface Props {}

const test = (props: Props) => {
  return (
    <PreviewBookCoverPage
      url='https://bafybeibmdx53zyvi2hiiadxa6hy3e6jtkdux6nojgkeb65e23j2ai3wmmq.ipfs.dweb.link/'
      page={1}
    />
  );
};

export default test;
