import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";
import BookCard from "../../common/BookCard";
import Layout from "../../common/Layout";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import {
  getRecentLaunches,
  getBestSellers,
} from "../../../controllers/StorageStructures";
import { useLoadingContext } from "../../../context/Loading";
import { useSignerContext } from "../../../context/Signer";

interface Props {
  selected: 1 | 2 | 3;
  setSelected: Dispatch<SetStateAction<1 | 2 | 3>>;
}

const Home = ({ selected, setSelected }: Props) => {
  const [recentBooks, setRecentBooks] = useState<any>([]);
  const [bestSellerBooks, setBestSellerBooks] = useState<any>([]);
  const { setLoading } = useLoadingContext();
  const { signer } = useSignerContext();

  useEffect(() => {
    signer &&
      getRecentLaunches(signer.signer).then(
        async (recentLaunchesMetadataURIs) => {
          setRecentBooks(recentLaunchesMetadataURIs);
          getBestSellers(signer.signer)
            .then(async (bestSellersMetadataURIs) => {
              setBestSellerBooks(bestSellersMetadataURIs);
            })
            .then(() => {
              setTimeout(() => {
                setLoading(false);
              }, 1000);
            });
        }
      );
    return () => {
      setLoading(true);
    };
  }, [signer]);
  return (
    <Layout
      Navbar={Navbar}
      Sidebar={Sidebar}
      selected={selected}
      setSelected={setSelected}
    >
      <div className="rounded-t-xl overflow-hidden mb-10">
        <div className="p-20 h-2/3 z-0 bg-purple-100">
          <div className="flex flex-row justify-evenly space-x-16">
            <Image
              src="/undraw_Bookshelves_re_lxoy(animated).svg"
              width={300 * 2}
              height={200 * 2}
              layout="fixed"
              priority={true}
            />
            <div className="text-gray-700 flex-1 flex flex-col justify-center content-evenly min-h-full px-20 pb-20">
              <p className="text-3xl font-bold py-7">
                Welcome to the realm of digital books
              </p>
              <p className="text-lg">
                Here, you find books not just from the bestselling authors, but
                from people who have within a writer and dreams to move lives of
                people.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 mb-14 px-2">
          <h3 className="text-2xl font-bold">Recent Launches</h3>
          <div className="my-5 flex overscroll-x-contain overflow-scroll no-scrollbar">
            {recentBooks.map((book, index) => {
              return <BookCard key={index} book_metadata_uri={book} />;
            })}
          </div>
        </div>

        <div className="mt-10 mb-14 px-2">
          <h3 className="text-2xl font-bold">Bestselling</h3>
          <div className="my-5 flex overscroll-x-contain overflow-scroll no-scrollbar">
            {bestSellerBooks.map((book, index) => {
              return <BookCard key={index} book_metadata_uri={book} />;
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Home;
