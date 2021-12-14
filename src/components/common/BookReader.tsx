import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useLoadingContext } from "../../context/Loading";
import { useSignerContext } from "../../context/Signer";
import { getBookURI } from "../../controllers/StorageStructures";
import {
  ArrowNarrowLeftIcon,
  PlusIcon,
  MinusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "@heroicons/react/solid";
import PreviewBook from "./PreviewBook";
import Loading from "../common/Loading";

const BookReader = () => {
  const router = useRouter();
  const { signer } = useSignerContext();
  const { setLoading } = useLoadingContext();
  const [bookID, setbookID] = useState<String>();
  const [bookURI, setbookURI] = useState<String>();
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [numOfPages, setNumOfPages] = useState<number>(0);
  const [page, setPage] = useState<number>(1);
  const [loadingState, setLoadingState] = useState<boolean>(true);

  useEffect(() => {
    if (!router.query.bookID) {
      router.push(`/OpenShelf`);
    } else {
      const data = JSON.parse(router.query.bookID as string);
      setbookID(data);
    }
    return () => {
      setLoading(true);
    };
  }, []);

  useEffect(() => {
    bookID &&
      getBookURI(bookID, signer.signer).then((bookURI) => {
        setbookURI(bookURI);
      });

    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, [bookID]);

  return (
    <>
      {loadingState && <Loading />}
      <div
        className={`h-full w-full ${
          loadingState && "filter blur-xl bg-gray-300"
        }`}
      >
        <p className="flex justify-center fixed right-20 top-10 cursor-pointer p-3 bg-gray-100 rounded-full border hover:shadow-md z-50">
          <ArrowNarrowLeftIcon
            className="w-6 h-6"
            onClick={() => {
              setLoading(true);
              router.push(
                {
                  pathname: `/OpenShelf`,
                  query: {
                    selected: 2,
                  },
                },
                `/OpenShelf`
              );
            }}
          />
        </p>
        <div className="flex justify-center fixed left-20 top-10 z-50 items-center space-x-2.5">
          <p className="cursor-pointer p-3 bg-gray-100 rounded-full border hover:shadow-md">
            <MinusIcon
              className="w-6 h-6"
              onClick={() => {
                setZoomPercent(zoomPercent - 5);
              }}
            />
          </p>
          <div className="px-3 py-2 bg-gray-50 rounded-lg">
            <p>{zoomPercent + " %"}</p>
          </div>
          <p className="cursor-pointer p-3 bg-gray-100 rounded-full border hover:shadow-md">
            <PlusIcon
              className="w-6 h-6"
              onClick={() => {
                setZoomPercent(zoomPercent + 5);
              }}
            />
          </p>
        </div>
        {/* --- */}
        <div className="flex justify-center fixed right-20 bottom-10 z-50 items-center space-x-2.5">
          <p className="cursor-pointer p-3 bg-gray-100 rounded-full border hover:shadow-md">
            <ChevronLeftIcon
              className="w-6 h-6"
              onClick={() => {
                if (page > 1) {
                  setPage(page - 1);
                }
              }}
            />
          </p>
          <div className="px-5 py-2 bg-gray-50 rounded-lg flex">
            <p>{page + " / " + numOfPages}</p>
          </div>
          <p className="cursor-pointer p-3 bg-gray-100 rounded-full border hover:shadow-md">
            <ChevronRightIcon
              className="w-6 h-6"
              onClick={() => {
                if (page < numOfPages) {
                  setPage(page + 1);
                }
              }}
            />
          </p>
        </div>
        <div className="w-full min-h-screen bg-gray-50 flex justify-center items-center overflow-scroll">
          <PreviewBook
            url={`https://${bookURI}.ipfs.dweb.link`}
            width={600}
            height={500}
            scale={zoomPercent / 100}
            setNumOfPages={setNumOfPages}
            page={page}
            setLoadingState={setLoadingState}
          />
        </div>
      </div>
    </>
  );
};

export default BookReader;
