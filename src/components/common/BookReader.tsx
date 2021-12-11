import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useLoadingContext } from "../../context/Loading";
import { useSignerContext } from "../../context/Signer";
import { getBookURI } from "../../controllers/StorageStructures";
import {
  ArrowNarrowLeftIcon,
  PlusIcon,
  MinusIcon,
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
    <div className="flex h-full w-full justify-center">
      <p className="flex justify-center fixed right-20 top-10 cursor-pointer p-3 bg-gray-100 rounded-full border hover:shadow-md z-10">
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
      <div className="flex flex-col justify-center fixed right-20 bottom-10 z-10 items-center space-y-2.5">
        <p className="cursor-pointer p-3 bg-gray-100 rounded-full border hover:shadow-md">
          <PlusIcon
            className="w-6 h-6"
            onClick={() => {
              setZoomPercent(zoomPercent + 10);
            }}
          />
        </p>
        <div className="px-3 py-2 bg-gray-50 rounded-lg">
          <p>{zoomPercent + " %"}</p>
        </div>
        <p className="cursor-pointer p-3 bg-gray-100 rounded-full border hover:shadow-md">
          <MinusIcon
            className="w-6 h-6"
            onClick={() => {
              setZoomPercent(zoomPercent - 10);
            }}
          />
        </p>
      </div>
      <div className="w-full bg-gray-50 flex justify-center">
        <PreviewBook
          url={`https://${bookURI}.ipfs.dweb.link`}
          width={700 * (zoomPercent / 100)}
          height={500 * (zoomPercent / 100)}
        />
      </div>
    </div>
  );
};

export default BookReader;
