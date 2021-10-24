import React from 'react';
import { ChartPieIcon as ChartPieIconSolid } from '@heroicons/react/solid';
import { ChartPieIcon as ChartPieIconOutline } from '@heroicons/react/outline';
import { CollectionIcon as CollectionIconSolid } from '@heroicons/react/solid';
import { CollectionIcon as ViewBoardsIconOutline } from '@heroicons/react/outline';
import { SidebarProps } from '../common/Layout';

const Sidebar = ({ selected, setSelected }: SidebarProps) => {
  return (
    <div className='min-h-screen w-24 bg-white text-neutral fixed mt-16'>
      <div className='py-4 h-full w-full'>
        <ul className='menu w-full py-3'>
          {selected === 1 ? (
            <li className='border-l-4 border-accent'>
              <a>
                <div className='flex justify-center w-full h-10 bg-green-100 rounded'>
                  <ChartPieIconSolid className='h-6 w-6 self-center text-accent' />
                </div>
              </a>
            </li>
          ) : (
            <li
              onClick={() => {
                setSelected(1);
              }}>
              <a>
                <div className='flex flex-col justify-center content-center h-10 w-full'>
                  <ChartPieIconOutline className='h-5 w-5 self-center' />
                  <span className='text-2xs p-0.5 text-center'>Dashboard</span>
                </div>
              </a>
            </li>
          )}
          {selected === 2 ? (
            <li className='border-l-4 border-accent'>
              <a>
                <div className='rounded flex justify-center w-full h-10 bg-green-100'>
                  <CollectionIconSolid className='h-6 w-6 text-accent self-center' />
                </div>
              </a>
            </li>
          ) : (
            <li
              onClick={() => {
                setSelected(2);
              }}>
              <a>
                <div className='flex flex-col justify-center content-center h-10 w-full'>
                  <ViewBoardsIconOutline className='h-5 w-5 self-center' />
                  <span className='text-2xs p-0.5 text-center'>Desk</span>
                </div>
              </a>
            </li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
