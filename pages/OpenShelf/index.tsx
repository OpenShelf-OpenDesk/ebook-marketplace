import type { NextPage } from 'next';
import { useState } from 'react';
import Exchange from '../../src/components/OpenShelf/Views/Exchange';
import Home from '../../src/components/OpenShelf/Views/Home';
import Shelf from '../../src/components/OpenShelf/Views/Shelf';

const OpenShelf: NextPage = () => {
  const [selected, setSelected] = useState<1 | 2 | 3>(1);
  if (selected == 1) {
    return <Home selected={selected} setSelected={setSelected} />;
  } else if (selected == 2) {
    return <Shelf selected={selected} setSelected={setSelected} />;
  } else if (selected == 3) {
    return <Exchange />;
  }
};

export default OpenShelf;
