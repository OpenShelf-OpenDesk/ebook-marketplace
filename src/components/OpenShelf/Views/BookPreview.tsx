import React, { useEffect, useState } from "react";
import {
  eBook,
  purchaseFirstHand,
} from "../../../controllers/eBookMarketLaunch";
import { useSignerContext } from "../../../context/Signer";
import PreviewBookCoverPage from "../../common/PreviewBookCoverPage";
import { ArrowNarrowLeftIcon, CheckCircleIcon } from "@heroicons/react/solid";
import { useRouter } from "next/router";
import { useLoadingContext } from "../../../context/Loading";
import LoadingCircle from "../../common/LoadingCircle";

interface Props {}

const BookPurchasingStatusTag = ({ status, tag }) => {
  return (
    <div className="flex flex-row justify-center items-center space-x-10 text-gray-700">
      {status ? (
        <div className="flex justify-center items-center h-20 w-20">
          <CheckCircleIcon className="h-12 w-12" />
        </div>
      ) : (
        <LoadingCircle />
      )}
      <span className="text-2xl font-semibold text-center align-middle">
        {tag}
      </span>
    </div>
  );
};

const BookPurchasingStatus = ({ statusCode }) => {
  return (
    <section className="flex justify-center fixed z-10 w-screen h-screen ">
      <div className="flex flex-col justify-center items-start">
        <BookPurchasingStatusTag
          status={statusCode >= 1}
          tag="Sending transaction request"
        />
        <BookPurchasingStatusTag
          status={statusCode >= 2}
          tag="Awaiting payment success"
        />
        <BookPurchasingStatusTag
          status={statusCode >= 3}
          tag="Awaiting transaction success"
        />
      </div>
    </section>
  );
};

const BookPreview = (props: Props) => {
  const { setLoading } = useLoadingContext();
  const router = useRouter();
  const { signer } = useSignerContext();
  const [bookPreviewData, setBookPreviewData] = useState<eBook>();
  const [validPurchaseAttempt, setValidPurchaseAttempt] =
    useState<boolean>(false);
  const [progressStatus, setProgressStatus] = useState<number>(0);
  useEffect(() => {
    if (!router.query.bookdata) {
      router.push(`/OpenShelf`);
    } else {
      const data = JSON.parse(router.query.bookdata as string);
      setBookPreviewData(data);
      setLoading(false);
    }
    return () => {
      setLoading(true);
    };
  }, []);

  const setProgressStatusCB = (statusCode) => {
    switch (statusCode) {
      case 1:
        setProgressStatus(1);
        break;
      case 2:
        setProgressStatus(2);
        break;
      case 3:
        setProgressStatus(3);
        break;
      default:
        setProgressStatus(0);
        break;
    }
  };

  return (
    <>
      {validPurchaseAttempt && (
        <BookPurchasingStatus statusCode={progressStatus} />
      )}
      <div
        className={`${validPurchaseAttempt && "filter blur-xl bg-gray-100"}`}
      >
        {bookPreviewData && (
          <section className="w-screen h-screen py-28 px-40">
            <p className="flex justify-center absolute right-20 top-10 cursor-pointer">
              <ArrowNarrowLeftIcon
                className="w-6 h-6"
                onClick={() => {
                  setLoading(true);
                  router.back();
                }}
              />
            </p>
            <div className="flex flex-row w-full h-full justify-center space-x-32">
              <div className="w-3/5 h-full rounded-lg shadow-lg">
                <PreviewBookCoverPage src={bookPreviewData.ebook_cover_image} />
              </div>
              <div className="flex flex-col w-full h-full justify-center space-y-10">
                <div className="flex flex-col">
                  <h1 className="text-4xl font-bold text-center italic py-3">
                    {bookPreviewData.title}
                  </h1>
                  <span className="text-xl font-semibold italic text-center w-full py-2">
                    {bookPreviewData.author || "Unkown"}
                  </span>
                </div>
                <div className="h-1/4 overflow-scroll">
                  <p className="italic text-justify">
                    {bookPreviewData.description}
                  </p>
                </div>
                <div className="grid grid-cols-3 grid-rows-1 gap-5">
                  <div className="bg-green-50 rounded-lg flex flex-col p-5 space-y-1">
                    <span className="font-semibold">Author's Price</span>
                    <span className="text-3xl font-semibold">
                      <span className="text-xs font-bold align-top pr-1">
                        MATIC
                      </span>
                      {bookPreviewData.launch_price}
                    </span>
                    <div className="flex-1 flex flex-col justify-end pt-12">
                      <button
                        className="w-full btn btn-accent btn-sm"
                        onClick={async () => {
                          setValidPurchaseAttempt(true);
                          console.log("purchasing");
                          await purchaseFirstHand(
                            bookPreviewData.book_id,
                            bookPreviewData.launch_price,
                            signer.signer,
                            setProgressStatusCB
                          );
                          setTimeout(() => {
                            router.push(`/OpenShelf`);
                          }, 500);
                        }}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg flex flex-col p-5 space-y-1">
                    <span className="font-semibold">Exchange Price</span>
                    <span className="text-3xl font-semibold">
                      <span className="text-xs font-bold align-top pr-1">
                        MATIC
                      </span>
                      {bookPreviewData.launch_price}
                    </span>
                    <div className="flex-1 flex flex-col justify-end pt-12">
                      <button
                        className="w-full btn btn-primary btn-sm"
                        onClick={() => {
                          router.push(
                            {
                              pathname: `/OpenShelf`,
                              query: {
                                selected: 3,
                                data: JSON.stringify(bookPreviewData),
                              },
                            },
                            `/OpenShelf`
                          );
                        }}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                  <div className="bg-yellow-50 rounded-lg flex flex-col p-5 space-y-1">
                    <span className="font-semibold">Rent Rate</span>
                    <span className="text-3xl font-semibold">
                      <span className="text-xs font-bold align-top pr-1">
                        MATIC
                      </span>
                      31.00
                      <span className="text-base align-bottom pl-1">
                        / per month
                      </span>
                    </span>
                    <div className="flex-1 flex flex-col justify-end pt-12">
                      <button className="w-full btn btn-warning btn-sm">
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default BookPreview;
