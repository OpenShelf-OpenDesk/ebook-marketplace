import React from 'react';
import Image from 'next/image';
import Layout from '../../common/Layout';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

interface Props {}

const Home = (props: Props) => {
  return (
    <Layout Navbar={Navbar} Sidebar={Sidebar}>
      <div className='rounded-t-xl overflow-hidden mb-10'>
        <div className='p-20 h-2/3 z-0 bg-green-100'>
          <div className='flex flex-row justify-evenly space-x-16'>
            <Image
              src='/undraw_exams_g4ow.svg'
              width={300 * 2}
              height={200 * 2}
              layout='fixed'
            />
            <div className='text-gray-700 flex-1 flex flex-col justify-center content-evenly min-h-full px-20 pb-20'>
              <p className='text-3xl font-bold py-5'>
                Welcome to the realm of digital books
              </p>
              <p className='text-lg'>
                Here, you find books not just from the bestselling authors, but
                from people who have within a writer and dreams to move lives of
                people.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
