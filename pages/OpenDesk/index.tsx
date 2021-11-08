import type { NextPage } from 'next';
import { useState } from 'react';
import Desk from '../../src/components/OpenDesk/Views/Desk';
import Home from '../../src/components/OpenDesk/Views/Home';

const OpenDesk: NextPage = () => {
  const [selected, setSelected] = useState<1 | 2 | 3>(1);
  if (selected == 1) {
    return <Home selected={selected} setSelected={setSelected} />;
  } else if (selected == 2) {
    return <Desk />;
  }
};

export default OpenDesk;
