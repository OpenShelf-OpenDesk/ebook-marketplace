import React from 'react';
import Image from 'next/image';
import { XIcon } from '@heroicons/react/solid';

interface Props {}

const ConnectWallet = (props: Props) => {
  return (
    <section className='fixed z-10 w-screen h-screen flex flex-row justify-center'>
      <div className='bg-white h-2/4 w-1/4 self-center relative pt-5 rounded-lg shadow-md'>
        <XIcon className='absolute w-5 h-5 right-4 top-4 cursor-pointer hover:text-secondary' />
        <div className='w-full h-full flex flex-col justify-center space-y-10'>
          <div className='flex flex-row justify-evenly'>
            <h1 className='text-4xl font-bold text-primary '>OpenShelf</h1>
            <h1 className='text-4xl font-bold text-accent '>OpenDesk</h1>
          </div>
          <div className='flex flex-col justify-center space-y-2 px-12 pt-5'>
            <h3 className='text-center font-bold text-xl py-2 text-gray-600'>
              Connect To Wallet
            </h3>
            <button className='btn btn-outline border-gray-300 flex flex-row justify-between'>
              <span className='text-sm text-semibold'>Metamask</span>
              <Image
                src='/Metamask_Fox.svg'
                height={32}
                width={32}
                layout='fixed'
              />
            </button>
            <button className='btn btn-outline border-gray-300 flex flex-row justify-between'>
              <span className='text-sm text-semibold'>Brave Wallet</span>
              <Image
                src='/brave.svg'
                height={38 * 0.85}
                width={32 * 0.85}
                layout='fixed'
              />
            </button>
            <p className='pt-5 text-xs font-semibold text-center'>
              By connecting your wallet you accept our Terms of Use and Privacy
              Policy.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ConnectWallet;
