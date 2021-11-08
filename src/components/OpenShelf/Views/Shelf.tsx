import React, { Dispatch, SetStateAction, useEffect } from 'react';
import { useLoadingContext } from '../../../context/Loading';
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
  useEffect(() => {
    setLoading(false);
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
          <BookInShelfCard />
          <BookInShelfCard />
        </div>
      </section>
    </Layout>
  );
};

export default Shelf;
