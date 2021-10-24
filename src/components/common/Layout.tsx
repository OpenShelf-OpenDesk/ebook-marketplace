import React, { Dispatch, SetStateAction, useState } from 'react';

interface Props {
  Navbar: React.FC;
  Sidebar: React.FC<SidebarProps>;
  children: JSX.Element;
}

export interface SidebarProps {
  selected: number;
  setSelected: Dispatch<SetStateAction<number>>;
}

const Layout = ({ Navbar, Sidebar, children }: Props) => {
  const [selected, setSelected] = useState(1);

  return (
    <div className='w-full no-scrollbar'>
      <Navbar />
      <div className='flex flex-row'>
        <Sidebar selected={selected} setSelected={setSelected} />
        <div className='pt-16 pl-24 w-full bg-white min-h-screen h-full pr-5'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
