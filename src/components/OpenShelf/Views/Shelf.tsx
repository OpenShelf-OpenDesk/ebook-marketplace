import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useLoadingContext } from '../../../context/Loading';
import { useSignerContext } from '../../../context/Signer';
import { getBooksInMyShelf } from '../../../controllers/StorageStructures';
import Layout from '../../common/Layout';
import BookInShelfCard from '../BookInShelfCard';
import Navbar from '../Navbar';
import Sidebar from '../Sidebar';

interface Props {
  selected: 1 | 2 | 3;
  setSelected: Dispatch<SetStateAction<1 | 2 | 3>>;
}

const Shelf = ({ selected, setSelected }: Props) => {
  const { setLoading } = useLoadingContext();
  const { signer } = useSignerContext();
  const [booksInShelf, setBooksInShelf] = useState<any>();
  useEffect(() => {
    // const fetchBook = async (book_uri) => {
    //   const response = await fetch(`https://${book_uri}.ipfs.dweb.link`);
    //   const file = await response.blob();
    //   console.log(file);
    //   return file;
    // };
    getBooksInMyShelf(signer.address).then((_booksInShelf) => {
      Promise.all(
        _booksInShelf.map((_book) => {
          // return fetchBook(_book.bookURI);
          return `https://${_book.metadataURI}.ipfs.dweb.link`;
        }),
      ).then((_fetchedBooks) => {
        setBooksInShelf(_fetchedBooks);
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      });
    });
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
      <section className='rounded-t-xl overflow-hidden h-full w-full'>
        <div className='grid grid-cols-3 gap-x-8 gap-y-12 p-5 bg-yellow-900'>
          {booksInShelf &&
            booksInShelf.map((_bookInShelf, index) => {
              return (
                <BookInShelfCard bookMetadataURI={_bookInShelf} key={index} />
              );
            })}
        </div>
      </section>
    </Layout>
  );
};

export default Shelf;
