import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useLoadingContext } from '../../../context/Loading';
import Layout from '../../common/Layout';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';
import Image from 'next/image';
import PreviewBookCoverPage from '../../common/PreviewBookCoverPage';
import data from '../../../../data.json';
interface Props {
  selected: 1 | 2 | 3;
  setSelected: Dispatch<SetStateAction<1 | 2 | 3>>;
}

const Exchange = ({ selected, setSelected }: Props) => {
  const { setLoading } = useLoadingContext();
  const [buyState, setBuyState] = useState<boolean>(true);
  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
    return () => {
      setLoading(true);
    };
  }, []);
  return (
    <Layout
      Navbar={Navbar}
      Sidebar={Sidebar}
      selected={selected}
      setSelected={setSelected}>
      <div className='rounded-t-xl overflow-hidden mb-10'>
        <div className='flex flex-row relative justify-start space-x-10'>
          <div className='w-3/4 p-20 h-2/3 z-0 bg-yellow-50'>
            <div className='flex flex-col justify-center items-center space-y-16'>
              <Image
                src='/undraw_business_deal_re_up4u.svg'
                width={300 * 1.5}
                height={200 * 1.5}
                layout='fixed'
              />
              <div className='text-gray-700 text-center flex-1 flex flex-col justify-center content-evenly min-h-full'>
                <p className='text-3xl font-bold py-7'>
                  First ever online e-book exchange
                </p>
                <p className='text-lg px-20'>
                  Trustless, Peer-to-Peer network of readers to exchange books
                  quickly and seamlessly. This platform is
                  <i> of you, for you and by you</i>, no matter who you are,
                  where you live and what you read...{' '}
                  <b>We redefined privacy</b>.
                </p>
              </div>
            </div>
          </div>
          <div className='w-1/4 h-full'>
            <div className='w-full h-hull'></div>
          </div>
          <div className='w-1/4 h-full absolute right-5'>
            <div className='w-full h-full flex flex-col pt-5'>
              <div className='w-full h-2/5'>
                <PreviewBookCoverPage src={data.ebook_cover_image} />
              </div>
              <div className='w-full h-3/5 pt-10'>
                <div className='flex'>
                  <a
                    className={
                      buyState
                        ? 'flex-1 border-t-4 border-green-500 font-semibold text-lg text-center pb-1 bg-green-50'
                        : 'flex-1 border-b border-r border-gray-300 font-semibold text-lg text-center py-1 cursor-pointer'
                    }
                    onClick={() => {
                      setBuyState(true);
                    }}>
                    Buy
                  </a>
                  <a
                    className={
                      buyState
                        ? 'flex-1 border-b border-l border-gray-300 font-semibold text-lg text-center py-1 cursor-pointer'
                        : 'flex-1 border-t-4 border-red-500 font-semibold text-lg text-center pb-1 bg-red-50'
                    }
                    onClick={() => {
                      setBuyState(false);
                    }}>
                    Sell
                  </a>
                </div>
                {buyState ? (
                  <div className='w-full h-full bg-green-50'></div>
                ) : (
                  <div className='w-full h-full bg-red-50'></div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Exchange;
