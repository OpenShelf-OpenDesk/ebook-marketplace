import React from 'react';

interface Props {
  color: string;
}

const BookCard = ({ color }: Props) => {
  return (
    <div className='overscroll-contain relative'>
      <div className='group carousel-item w-60 h-72 rounded cursor-pointer bg-white mr-8'>
        <div
          className={`absolute transition duration-500 ease-in-out transform group-hover:-translate-y-36 group-hover:shadow-lg h-72 w-60 bg-${color}-400 rounded`}></div>
        <div className='pt-36 w-full rounded border-2 border-transparent group-hover:border-gray-400 overscroll-none'>
          <div className='flex flex-col p-3 text-gray-700 h-full'>
            <p className='font-semibold mb-2'>Book Title</p>
            <p className='text-xs '>
              Book Description - Lorem ipsum dolor sit amet, consectetur
              adipiscing elit, sed do
            </p>
            <div className='flex w-full h-full justify-end'>
              <button
                className={`px-2 text-2xs text-center font-semibold h-7 text-white p-1 bg-${color}-400 rounded self-end`}>
                More &#10142;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
