import React, { Dispatch, SetStateAction, useState } from 'react';

interface Props {
  Navbar: React.FC;
  Sidebar: React.FC<SidebarProps>;
  children: JSX.Element;
  selected: 1 | 2 | 3;
  setSelected: Dispatch<SetStateAction<1 | 2 | 3>>;
}

export interface SidebarProps {
  selected: number;
  setSelected: Dispatch<SetStateAction<1 | 2 | 3>>;
}

const Layout = ({
  Navbar,
  Sidebar,
  selected,
  setSelected,
  children,
}: Props) => {
  return (
    <div className='w-full no-scrollbar'>
      <Navbar />
      <div className='flex flex-row'>
        <Sidebar selected={selected} setSelected={setSelected} />
        <div className='pt-20 pl-24 w-full bg-white min-h-screen pr-5'>
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
