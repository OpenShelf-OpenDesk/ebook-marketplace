import React from 'react';
import { HomeIcon as HomeIconSolid } from '@heroicons/react/solid';
import { HomeIcon as HomeIconOutline } from '@heroicons/react/outline';
import { ViewBoardsIcon as ViewBoardsIconSolid } from '@heroicons/react/solid';
import { ViewBoardsIcon as ViewBoardsIconOutline } from '@heroicons/react/outline';
import { SwitchHorizontalIcon as SwitchHorizontalIconSolid } from '@heroicons/react/solid';
import { SwitchHorizontalIcon as SwitchHorizontalIconOutline } from '@heroicons/react/outline';
import { SidebarProps } from '../common/Layout';

const Sidebar = ({ selected, setSelected }: SidebarProps) => {
  return (
    <div className='min-h-screen w-24 bg-white text-neutral fixed mt-16'>
      <div className='py-4 h-full w-full'>
        <ul className='menu w-full py-3'>
          {selected === 1 ? (
            <li className='bordered'>
              <a>
                <div className='flex justify-center w-full h-10 bg-purple-100 rounded'>
                  <HomeIconSolid className='h-6 w-6 self-center text-primary' />
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
                  <HomeIconOutline className='h-5 w-5 self-center' />
                  <span className='text-2xs p-0.5 text-center font-semibold'>
                    Home
                  </span>
                </div>
              </a>
            </li>
          )}
          {selected === 2 ? (
            <li className='bordered'>
              <a>
                <div className='rounded flex justify-center w-full h-10 bg-purple-100'>
                  <ViewBoardsIconSolid className='h-6 w-6 text-primary self-center' />
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
                  <span className='text-2xs p-0.5 text-center font-semibold'>
                    Shelf
                  </span>
                </div>
              </a>
            </li>
          )}
          {selected === 3 ? (
            <li className='bordered'>
              <a>
                <div className='flex justify-center w-full h-10 bg-purple-100 rounded'>
                  <SwitchHorizontalIconSolid className='h-6 w-6 text-primary self-center' />
                </div>
              </a>
            </li>
          ) : (
            <li
              onClick={() => {
                setSelected(3);
              }}>
              <a>
                <div className='flex flex-col justify-center content-center h-10 w-full'>
                  <SwitchHorizontalIconOutline className='h-5 w-5 self-center' />
                  <span className='text-2xs p-0.5 text-center font-semibold'>
                    Exchange
                  </span>
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
