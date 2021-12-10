import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useLoadingContext } from "../../context/Loading";
import { useSignerContext } from "../../context/Signer";
import { getBookURI } from "../../controllers/StorageStructures";
import { ArrowNarrowLeftIcon } from "@heroicons/react/solid";
import PreviewBook from "./PreviewBook";
import Loading from "../common/Loading";

const BookReader = () => {
  const router = useRouter();
  const { signer } = useSignerContext();
  const { loading, setLoading } = useLoadingContext();
  const [bookID, setbookID] = useState<String>();
  const [bookURI, setbookURI] = useState<String>();

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
    }, 3000);
  }, [bookID]);

  return (
    <div className="flex h-full w-full justify-center">
      <p className="flex justify-center fixed right-20 top-10 cursor-pointer">
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
      {loading && <Loading />}
      <div className="w-full bg-gray-50 flex justify-center">
        <PreviewBook
          url={`https://${bookURI}.ipfs.dweb.link`}
          width={700}
          height={500}
        />
      </div>
    </div>
  );
};

export default BookReader;
