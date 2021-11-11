import React, { useEffect } from 'react';
import { purchaseFirstHand } from '../../../controllers/eBookMarketLaunch';
import { useSignerContext } from '../../../context/Signer';
import { usePreviewBookContext } from '../../../context/PreviewBook';
import PreviewBookCoverPage from '../../common/PreviewBookCoverPage';
import { ArrowNarrowLeftIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';
import { useLoadingContext } from '../../../context/Loading';

interface Props {}

const BookPreview = (props: Props) => {
  const { setLoading } = useLoadingContext();
  const router = useRouter();
  const { signer } = useSignerContext();
  const { previewBook } = usePreviewBookContext();
  useEffect(() => {
    if (!previewBook) {
      router.push(`/OpenShelf`);
    }
    setLoading(false);
    return () => {
      setLoading(true);
    };
  }, []);
  return (
    <section className='w-screen h-screen py-28 px-40'>
      <p className='flex justify-center absolute right-20 top-10 cursor-pointer'>
        <ArrowNarrowLeftIcon
          className='w-6 h-6'
          onClick={() => {
            setLoading(true);
            router.back();
          }}
        />
      </p>
      <div className='flex flex-row w-full h-full justify-center space-x-32'>
        <div className='w-3/5 h-full bg-purple-100 rounded-lg'>
          <PreviewBookCoverPage src={previewBook.ebook_cover_image} />
        </div>
        <div className='flex flex-col w-full h-full justify-center space-y-10'>
          <div className='flex flex-col'>
            <h1 className='text-4xl font-bold text-center italic py-3'>
              {previewBook.title}
            </h1>
            <span className='text-xl font-semibold italic text-center w-full py-2'>
              {previewBook.author || 'Unkown'}
            </span>
          </div>
          <div>
            <p className='italic text-justify'>{previewBook.description}</p>
          </div>
          <div className='grid grid-cols-3 grid-rows-1 gap-5'>
            <div className='bg-green-50 rounded-lg flex flex-col p-5 space-y-1'>
              <span className='font-semibold'>Author's Price</span>
              <span className='text-3xl font-semibold'>
                <span className='text-xl font-bold align-top pr-1'>₹</span>
                {previewBook.launch_price}
              </span>
              <div className='flex-1 flex flex-col justify-end pt-12'>
                <button
                  className='w-full btn btn-accent btn-sm'
                  onClick={() => {
                    console.log('purchasing');
                    purchaseFirstHand(
                      1,
                      previewBook.launch_price,
                      signer.signer,
                    );
                  }}>
                  Buy
                </button>
              </div>
            </div>
            <div className='bg-purple-50 rounded-lg flex flex-col p-5 space-y-1'>
              <span className='font-semibold'>Exchange Price</span>
              <span className='text-3xl font-semibold'>
                <span className='text-xl font-bold align-top pr-1'>₹</span>
                194.00
              </span>
              <div className='flex-1 flex flex-col justify-end pt-12'>
                <button className='w-full btn btn-primary btn-sm'>Buy</button>
              </div>
            </div>
            <div className='bg-yellow-50 rounded-lg flex flex-col p-5 space-y-1'>
              <span className='font-semibold'>Rent Rate</span>
              <span className='text-3xl font-semibold'>
                <span className='text-xl font-bold align-top pr-1'>₹</span>
                31.00
                <span className='text-base align-bottom pl-1'>/ per month</span>
              </span>
              <div className='flex-1 flex flex-col justify-end pt-12'>
                <button className='w-full btn btn-warning btn-sm'>Buy</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookPreview;
