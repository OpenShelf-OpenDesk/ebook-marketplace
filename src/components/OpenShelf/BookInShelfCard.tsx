import React from 'react';
import data from '../../../data.json';
import PreviewBookCoverPage from '../common/PreviewBookCoverPage';

interface Props {}

const BookInShelfCard = (props: Props) => {
  return (
    <div className='group h-80 w-full border border-gray-300 flex flex-row space-x-5 pr-4 overflow-hidden bg-white'>
      <div className='flex-1 h-full'>
        <PreviewBookCoverPage src={data.ebook_cover_image} />
      </div>
      <div className='flex-1 h-full w-full flex flex-col justify-center items-center'>
        <p className='text-center'>{data.description}</p>
        <div className='flex w-full pt-4 justify-center'>
          <button className='group-hover:animate-bounce' onClick={() => {}}>
            &#10142;
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookInShelfCard;
