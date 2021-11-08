import { useRouter } from 'next/router';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { useLoadingContext } from '../../../context/Loading';

interface Props {}

const RoleSelection = (props: Props) => {
  const router = useRouter();
  const { setLoading } = useLoadingContext();

  useEffect(() => {
    router.prefetch(`/OpenShelf`);
    router.prefetch(`/OpenDesk`);
    setLoading(false);
    return () => {
      setLoading(true);
    };
  }, []);
  return (
    <section id='role-selection' className='hero min-h-screen max-h-screen'>
      <div className='hero-content w-3/4 h-3/5'>
        <div className='grid grid-cols-2 gap-x-20 w-full h-full'>
          <div className='group flex flex-col card border border-gray-200 shadow-lg'>
            <div className='flex h-64 justify-center relative'>
              <Image
                src={`/undraw_book_lover_mkck.svg`}
                layout='fill'
                className='scale-95 transition duration-500 ease-in-out transform group-hover:-translate-y-1 group-hover:scale-105'
              />
            </div>
            <div className='card-body text-gray-700'>
              <div className='card-title text-2xl'>OpenShelf</div>
              <p>Fill your shelf with the bestselling classic books.</p>
              <div className='flex flex-col justify-end h-full'>
                <Link href='/OpenShelf'>
                  <button className='btn btn-sm btn-primary self-end w-full'>
                    Reader
                  </button>
                </Link>
              </div>
            </div>
          </div>
          <div className='group flex flex-col card border border-gray-200 shadow-lg'>
            <div className='flex h-64 justify-center relative'>
              <Image
                src={`/undraw_studying_s3l7.svg`}
                layout='fill'
                className='transition duration-500 ease-in-out transform group-hover:-translate-y-1 group-hover:scale-110'
              />
            </div>
            <div className='card-body text-gray-700'>
              <div className='card-title text-2xl'>OpenDesk</div>
              <p>
                Enlighten the world with your imagination, real stories or
                research.
              </p>
              <div className='flex flex-col justify-end h-full'>
                <Link href='/OpenDesk'>
                  <button className='btn btn-sm btn-accent self-end w-full'>
                    Author
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RoleSelection;
