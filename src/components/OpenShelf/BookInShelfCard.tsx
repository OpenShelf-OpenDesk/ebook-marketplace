import React from 'react';
import PreviewBook from '../common/PreviewBook';

interface Props {
  bookURI: string;
}

const BookInShelfCard = ({ bookURI }: Props) => {
  return (
    <div className='group h-80 w-full border border-gray-300 flex flex-row space-x-5 pr-4 overflow-hidden bg-white'>
      <div className='flex-1 h-full'>
        <PreviewBook url={bookURI} />
      </div>
      <div className='flex-1 h-full w-full flex flex-col justify-center items-center'>
        <p className='text-center text-sm'>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
          eiusmod tempor incididunt ut labore et dolore magna aliqua. In arcu
          cursus euismod quis viverra nibh cras pulvinar mattis. Ullamcorper a
          lacus vestibulum sed arcu non odio euismod lacinia. Commodo odio
          aenean sed adipiscing diam. Aenean pharetra magna ac placerat.
        </p>
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
