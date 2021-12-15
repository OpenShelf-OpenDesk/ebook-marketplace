import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useLoadingContext } from "../../../context/Loading";
import { useSignerContext } from "../../../context/Signer";
import { getBooksInMyShelf } from "../../../controllers/StorageStructures";
import Layout from "../../common/Layout";
import BookOwnedInShelfCard from "../BookOwnedInShelfCard";
import Navbar from "../Navbar";
import Image from "next/image";
import Sidebar from "../Sidebar";
import StudentCopyBookInShelfCard from "../StudentCopyBookInShelfCard";
import BookRentedInShelfCard from "../BookRentedInShelfCard";
import { StatusTag } from "./BookPreview";

interface Props {
  selected: 1 | 2 | 3;
  setSelected: Dispatch<SetStateAction<1 | 2 | 3>>;
}

const ReturnBookStatus = ({ statusCode }) => {
  return (
    <section className="flex justify-center fixed z-10 w-screen h-screen ">
      <div className="flex flex-col justify-center items-start">
        <StatusTag status={statusCode >= 1} tag="Sending transaction request" />
        <StatusTag status={statusCode >= 2} tag="Deleting Renting Flow" />
        <StatusTag
          status={statusCode >= 3}
          tag="Awaiting transaction success"
        />
      </div>
    </section>
  );
};
const Shelf = ({ selected, setSelected }: Props) => {
  const { setLoading } = useLoadingContext();
  const { signer } = useSignerContext();
  const [tabSelected, setTabSelected] = useState<number>(1);
  const [booksOwnedInShelf, setBooksOwnedInShelf] = useState<any>([]);
  const [booksRentedInShelf, setBooksRentedInShelf] = useState<any>([]);
  const [studentBooksCopyInShelf, setStudentBooksCopyInShelf] = useState<any>(
    []
  );
  const [validReturnBookAttempt, setValidReturnBookAttempt] =
    useState<boolean>(false);
  const [renturnBookProgressStatus, setRenturnBookProgressStatus] =
    useState<number>(0);

  useEffect(() => {
    setBooksOwnedInShelf([]);
    setStudentBooksCopyInShelf([]);
    setBooksRentedInShelf([]);
    getBooksInMyShelf(signer.signer, signer.address)
      .then((_booksInShelf) => {
        _booksInShelf.map((_book) => {
          if (
            _book.status == 0 ||
            _book.status == 1 ||
            _book.status == 3 ||
            _book.status == 4
          ) {
            setBooksOwnedInShelf((state) => {
              return [...state, _book];
            });
          } else if (_book.status == 5) {
            setBooksRentedInShelf((state) => {
              return [...state, _book];
            });
          } else if (_book.eBookID == 0) {
            setStudentBooksCopyInShelf((state) => {
              return [...state, _book];
            });
          }
        });
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

  const setRenturnBookProgressStatusCB = (statusCode) => {
    switch (statusCode) {
      case 1:
        setRenturnBookProgressStatus(1);
        break;
      case 2:
        setRenturnBookProgressStatus(2);
        break;
      case 3:
        setRenturnBookProgressStatus(3);
        break;
      default:
        setRenturnBookProgressStatus(0);
        break;
    }
  };

  return (
    <>
      {validReturnBookAttempt && (
        <ReturnBookStatus statusCode={renturnBookProgressStatus} />
      )}
      <Layout
        Navbar={Navbar}
        Sidebar={Sidebar}
        selected={selected}
        setSelected={setSelected}
      >
        <section
          className={`rounded-t-xl h-full w-full ${
            validReturnBookAttempt && "filter blur-xl bg-gray-100"
          }`}
        >
          <div className="w-full mt-2 flex flex-row rounded-t-xl">
            <div
              className={`w-2/6 py-3 text-center cursor-pointer ${
                tabSelected == 1
                  ? `font-bold bg-purple-100 rounded-tl-xl`
                  : `hover:font-semibold hover:bg-gray-50 rounded-tl-xl`
              }`}
              onClick={() => {
                setTabSelected(1);
              }}
            >
              Owned{" "}
              {booksOwnedInShelf.length > 0 && `(${booksOwnedInShelf.length})`}
            </div>
            <div
              className={`w-2/6 py-3 text-center cursor-pointer ${
                tabSelected == 2
                  ? `font-bold bg-purple-100`
                  : `hover:font-semibold hover:bg-gray-50`
              }`}
              onClick={() => {
                setTabSelected(2);
              }}
            >
              Rented
              {booksRentedInShelf.length > 0 &&
                `(${booksRentedInShelf.length})`}
            </div>
            <div
              className={`w-2/6 py-3 text-center cursor-pointer ${
                tabSelected == 3
                  ? `font-bold bg-purple-100 rounded-tr-xl`
                  : `hover:font-semibold hover:bg-gray-50 rounded-tr-xl`
              }`}
              onClick={() => {
                setTabSelected(3);
              }}
            >
              Distributed Copy
              {studentBooksCopyInShelf.length > 0 &&
                `(${studentBooksCopyInShelf.length})`}
            </div>
          </div>
          {booksOwnedInShelf.length > 0 && tabSelected == 1 ? (
            <div className="grid grid-cols-3 gap-x-7 gap-y-7 p-7 h-5/6 bg-purple-100 overflow-y-scroll">
              {console.log(booksOwnedInShelf)}
              {booksOwnedInShelf.map((_bookInShelf, index) => {
                return (
                  <BookOwnedInShelfCard
                    bookMetadataURI={_bookInShelf.metadataURI}
                    status={_bookInShelf.status}
                    key={index}
                  />
                );
              })}
            </div>
          ) : booksRentedInShelf.length > 0 && tabSelected == 2 ? (
            <div className="grid grid-cols-3 gap-x-7 gap-y-11 p-7 h-5/6 bg-purple-100 overflow-y-scroll">
              {booksRentedInShelf.map((_bookInShelf, index) => {
                return (
                  <BookRentedInShelfCard
                    bookMetadataURI={_bookInShelf.metadataURI}
                    key={index}
                    cb={setRenturnBookProgressStatusCB}
                  />
                );
              })}
            </div>
          ) : studentBooksCopyInShelf.length > 0 && tabSelected == 3 ? (
            <div className="grid grid-cols-3 gap-x-7 gap-y-11 p-7 h-5/6 bg-purple-100 overflow-y-scroll">
              {studentBooksCopyInShelf.map((_bookInShelf, index) => {
                return (
                  <StudentCopyBookInShelfCard
                    bookMetadataURI={_bookInShelf.metadataURI}
                    key={index}
                  />
                );
              })}
            </div>
          ) : (
            <div className="w-full h-5/6 flex flex-col justify-center items-center bg-purple-100">
              <Image
                src="/undraw_no_data_re_kwbl.svg"
                width={300}
                height={200}
                layout="fixed"
                className="transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-90 h-full"
              />
              <div className="p-10">
                <p className="font-semibold text-2xl text-gray-700">
                  Shelf is Empty
                </p>
              </div>
            </div>
          )}
        </section>
      </Layout>
    </>
  );
};

export default Shelf;
