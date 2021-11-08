import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { eBook, publish } from '../../../controllers/eBookMarketLaunch';
import { useSignerContext } from '../../../context/Signer';
import { DocumentAddIcon } from '@heroicons/react/outline';
import { ExclamationCircleIcon } from '@heroicons/react/outline';
import PreviewBook from '../../common/PreviewBook';
import { useLoadingContext } from '../../../context/Loading';
import { ArrowNarrowLeftIcon } from '@heroicons/react/solid';
import { useRouter } from 'next/router';

interface Props {}

const NewBook = (props: Props) => {
  const [supplyLimitBool, setSupplyLimitBool] = useState<boolean>(false);
  const [selectedBookFile, setSelectedBookFile] = useState<File>();
  const [selectedBookLocalURL, setSelectedBookLocalURL] = useState<string>('');
  const [attemptSubmit, setAttemptSubmit] = useState<boolean>(false);
  const { signer } = useSignerContext();
  const { setLoading } = useLoadingContext();
  const router = useRouter();

  useEffect(() => {
    setLoading(false);
    return () => {
      setLoading(true);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedBookFile) {
      const newBook: eBook = {
        title: e.target.title.value,
        description: e.target.description.value,
        launch_price: e.target.launch_price.value,
        currency: e.target.currency.value,
        supply_limit_bool: supplyLimitBool,
        supply_limit: supplyLimitBool ? e.target.supply_limit.value : -1,
        ebook_file: selectedBookFile,
      };
      console.log('publishing');
      publish(newBook, signer.signer);
    } else {
      setAttemptSubmit(true);
    }
  };

  return (
    <section className='w-screen h-screen px-60 py-20'>
      <p className='flex justify-center absolute right-20 top-10 cursor-pointer'>
        <ArrowNarrowLeftIcon
          className='w-6 h-6'
          onClick={() => {
            setLoading(true);
            router.back();
          }}
        />
      </p>
      <form
        className='w-full h-full flex flex-row justify-center content-center space-x-40'
        onSubmit={handleSubmit}>
        {selectedBookFile ? (
          <div className='h-full w-full flex flex-col justify-center'>
            <PreviewBook url={selectedBookLocalURL} />
          </div>
        ) : (
          <label className='h-full w-full flex flex-col justify-center space-y-5'>
            <input
              name='ebook_file'
              type='file'
              accept='application/pdf'
              className='hidden'
              onChange={(e) => {
                setSelectedBookFile(e.target.files[0]);
                const url = URL.createObjectURL(e.target.files[0]);
                setSelectedBookLocalURL(url);
              }}
            />
            <div className='group bg-gray-50 relative w-full h-4/5 self-center cursor-pointer'>
              <Image
                src={`/undraw_add_document_re_mbjx.svg`}
                layout='fill'
                className='scale-95 transition duration-500 ease-in-out transform group-hover:-translate-y-1 group-hover:scale-105'
              />
            </div>
            {!attemptSubmit && !selectedBookFile && (
              <div className='alert alert-success'>
                <div className='flex-1 space-x-5'>
                  <DocumentAddIcon className='w-6 h-6' />
                  <label>Click to add e-book file</label>
                </div>
              </div>
            )}
            {attemptSubmit && !selectedBookFile && (
              <div className='alert alert-error'>
                <div className='flex-1 space-x-5'>
                  <ExclamationCircleIcon className='w-6 h-6' />
                  <label>No file selected</label>
                </div>
              </div>
            )}
          </label>
        )}

        <div className='w-full h-full flex flex-col justify-center space-y-5'>
          <h1 className='w-full text-2xl font-bold text-accent'>
            Book Details
          </h1>
          <input
            type='text'
            name='title'
            placeholder='Title'
            className='input input-bordered font-semibold'
            autoFocus={true}
            required
          />
          <textarea
            name='description'
            placeholder='Description'
            className='textarea textarea-bordered h-40 font-semibold'
            required
          />
          <div className='flex flex-row focus-within:ring-2 rounded-lg ring-gray-300 p-0.5'>
            <input
              type='number'
              name='launch_price'
              placeholder='Launch Price'
              className='flex-1 input input-bordered font-semibold rounded-r-none focus:ring-0 text-center'
              step='0.01'
              required
            />
            <select
              name='currency'
              className='flex-0 select select-bordered border-l-0 rounded-l-none focus:ring-0'>
              <option value='INR'>INR (₹)</option>
              <option value='MATIC'>MATIC TOKEN</option>
            </select>
          </div>
          <div className='flex flex-row space-x-5'>
            <div className='w-1/3 border rounded-lg border-gray-300'>
              <label className='cursor-pointer flex flex-row justify-evenly h-full'>
                <span className='text-sm text-gray-500 font-semibold self-center'>
                  Limit Supply
                </span>
                <input
                  type='checkbox'
                  checked={supplyLimitBool}
                  className='checkbox checkbox-sm checkbox-accent self-center'
                  onChange={() => {
                    setSupplyLimitBool((state) => {
                      return !state;
                    });
                  }}
                />
              </label>
            </div>
            <input
              type='number'
              name='supply_limit'
              placeholder='Supply Limit'
              disabled={!supplyLimitBool}
              className='flex-1 input input-bordered font-semibold text-center'
              required
            />
          </div>
          <button type='submit' className='btn btn-accent'>
            Publish
          </button>
        </div>
      </form>
    </section>
  );
};

export default NewBook;
