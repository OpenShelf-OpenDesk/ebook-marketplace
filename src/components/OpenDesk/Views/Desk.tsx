import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useLoadingContext } from "../../../context/Loading";
import { useSignerContext } from "../../../context/Signer";
import { getAuthorsDesk } from "../../../controllers/StorageStructures";
import Layout from "../../common/Layout";
import BookPublishedDeskCard from "../BookPublishedDeskCard";
import Navbar from "../Navbar";
import Image from "next/image";
import Sidebar from "../Sidebar";

interface Props {
  selected: 1 | 2 | 3;
  setSelected: Dispatch<SetStateAction<1 | 2 | 3>>;
}

const Desk = ({ selected, setSelected }: Props) => {
  const { setLoading } = useLoadingContext();
  const { signer } = useSignerContext();

  const [booksPublishedInDesk, setBooksPublishedInDesk] = useState<any>([]);

  useEffect(() => {
    setBooksPublishedInDesk([]);
    getAuthorsDesk(signer.signer, signer.address)
      .then((authorsDesk) => {
        setBooksPublishedInDesk(authorsDesk);
      })
      .then(() => {
        setTimeout(() => {
          setLoading(false);
        }, 1000);
      });
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
      <section className="rounded-t-xl h-screen w-full">
        {booksPublishedInDesk.length > 0 ? (
          <div className="flex flex-col px-7 pt-7 pb-16 space-y-7 h-full bg-green-100 rounded-t-xl overflow-y-scroll">
            {booksPublishedInDesk.map((_bookInDesk, index) => {
              return (
                <BookPublishedDeskCard
                  bookMetadataURI={_bookInDesk.metadataURI}
                  key={index}
                />
              );
            })}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col justify-center items-center bg-green-100 rounded-t-xl">
            <Image
              src="/undraw_no_data_re_kwbl1.svg"
              width={300}
              height={200}
              layout="fixed"
              className="transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-90 h-full opacity-60"
            />
            <div className="p-10">
              <p className="font-semibold text-2xl text-gray-700">
                Desk is Empty
              </p>
            </div>
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Desk;
