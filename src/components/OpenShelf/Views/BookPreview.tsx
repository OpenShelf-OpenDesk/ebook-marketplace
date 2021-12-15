import React, { useEffect, useState } from "react";
import {
  eBook,
  purchaseFirstHand,
} from "../../../controllers/eBookMarketLaunch";
import { useSignerContext } from "../../../context/Signer";
import PreviewBookCoverPage from "../../common/PreviewBookCoverPage";
import {
  ArrowNarrowLeftIcon,
  CheckCircleIcon,
  XCircleIcon,
} from "@heroicons/react/solid";
import { AcademicCapIcon } from "@heroicons/react/outline";
import { useRouter } from "next/router";
import { useLoadingContext } from "../../../context/Loading";
import LoadingCircle from "../../common/LoadingCircle";
import { eBookVoucherGenerator } from "../../../utils/eBookVoucherGenerator";
import {
  getBookRentorsCount,
  getPricedBooksPrinted,
  redeem,
} from "../../../controllers/StorageStructures";
import { takeBookOnRent } from "../../../controllers/eBookRenter";

interface Props {}

export const StatusTag = ({ status, tag, error = false }) => {
  return (
    <div className="flex flex-row justify-center items-center space-x-10 text-gray-700">
      {status ? (
        error ? (
          <div className="flex justify-center items-center h-20 w-20">
            <XCircleIcon className="h-12 w-12" />
          </div>
        ) : (
          <div className="flex justify-center items-center h-20 w-20">
            <CheckCircleIcon className="h-12 w-12" />
          </div>
        )
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
        <StatusTag status={statusCode >= 1} tag="Sending transaction request" />
        <StatusTag status={statusCode >= 2} tag="Awaiting payment success" />
        <StatusTag
          status={statusCode >= 3}
          tag="Awaiting transaction success"
        />
      </div>
    </section>
  );
};

const VoucherRedeemingStatus = ({ statusCode, errorCode = 0 }) => {
  return (
    <section className="flex justify-center fixed z-10 w-screen h-screen ">
      <div className="flex flex-col justify-center items-start">
        <StatusTag
          status={statusCode >= 1}
          tag="Awaiting transaction success"
          error={Math.abs(errorCode) == 1}
        />
        <StatusTag
          status={statusCode >= 2}
          tag="Validating voucher signature"
          error={Math.abs(errorCode) == 2}
        />
      </div>
    </section>
  );
};

const BookRentingStatus = ({ statusCode }) => {
  return (
    <section className="flex justify-center fixed z-10 w-screen h-screen ">
      <div className="flex flex-col justify-center items-start">
        <StatusTag status={statusCode >= 1} tag="Sending transaction request" />
        <StatusTag status={statusCode >= 2} tag="Creating Renting Flow" />
        <StatusTag
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
  const [validRedeemSubmission, setValidRedeemSubmission] =
    useState<boolean>(true);
  const [validRedeemAttempt, setValidRedeemAttempt] = useState<boolean>(false);
  const [validPurchaseAttempt, setValidPurchaseAttempt] =
    useState<boolean>(false);
  const [progressBuyStatus, setProgressBuyStatus] = useState<number>(0);
  const [redeemProgressStatus, setRedeemProgressStatus] = useState<number>(0);
  const [validRentAttempt, setValidRentAttempt] = useState<boolean>(false);
  const [rentProgressStatus, setRentProgressStatus] = useState<number>(0);
  const [errorCode, setErrorCode] = useState<number>(0);
  const [pricedBooksSold, setPricedBooksSold] = useState<number>(0);
  const [bookRentorsCount, setBookRentorsCount] = useState<number>(0);

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

  useEffect(() => {
    bookPreviewData &&
      getPricedBooksPrinted(bookPreviewData.book_id, signer.signer).then(
        (booksPrinted) => {
          setPricedBooksSold(booksPrinted);
        }
      );
    bookPreviewData &&
      getBookRentorsCount(bookPreviewData.book_id, signer.signer).then(
        (bookRentorsCount) => {
          setBookRentorsCount(bookRentorsCount);
        }
      );
  }, [bookPreviewData]);

  const setProgressBuyStatusCB = (statusCode) => {
    switch (statusCode) {
      case 1:
        setProgressBuyStatus(1);
        break;
      case 2:
        setProgressBuyStatus(2);
        break;
      case 3:
        setProgressBuyStatus(3);
        break;
      default:
        setProgressBuyStatus(0);
        break;
    }
  };

  const setRedeemProgressStatusCB = (statusCode) => {
    switch (statusCode) {
      case 1:
        setRedeemProgressStatus(1);
        break;
      case 2:
        setRedeemProgressStatus(2);
        break;
      case -2:
        setErrorCode(-2);
        break;
      default:
        setProgressBuyStatus(0);
        break;
    }
  };

  const setRentProgressStatusCB = (statusCode) => {
    switch (statusCode) {
      case 1:
        setRentProgressStatus(1);
        break;
      case 2:
        setRentProgressStatus(2);
        break;
      case 3:
        setRentProgressStatus(3);
        break;
      default:
        setRentProgressStatus(0);
        break;
    }
  };

  const handleRedeemSubmit = (e) => {
    e.preventDefault();
    if (e.target.eBookVoucherSignature.value.length === 132) {
      setValidRedeemSubmission(true);
      setValidRedeemAttempt(true);
      const voucher = {
        bookID: bookPreviewData.book_id,
        price: 0,
        studentAddress: signer.address,
        signature: e.target.eBookVoucherSignature.value,
      };
      redeem(signer.signer, voucher, setRedeemProgressStatusCB).then(() => {
        setTimeout(() => {
          router.push(
            {
              pathname: `/OpenShelf`,
              query: {
                selected: 2,
              },
            },
            `/OpenShelf`
          );
        }, 1000);
      });
    } else {
      setValidRedeemSubmission(false);
      setValidRedeemAttempt(false);
    }
  };

  return (
    <>
      {validPurchaseAttempt && (
        <BookPurchasingStatus statusCode={progressBuyStatus} />
      )}
      {validRedeemAttempt && (
        <VoucherRedeemingStatus
          statusCode={redeemProgressStatus}
          errorCode={errorCode}
        />
      )}
      {validRentAttempt && (
        <BookRentingStatus statusCode={rentProgressStatus} />
      )}
      <div
        className={`${
          (validPurchaseAttempt || validRedeemAttempt || validRentAttempt) &&
          "filter blur-xl bg-gray-100"
        }`}
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
              <div className="flex flex-col w-full h-full justify-start space-y-5">
                <div className="flex flex-col pb-5">
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
                <div className="grid grid-cols-3 grid-rows-1 gap-5 pt-14 pb-3">
                  <div className="bg-green-50 rounded-lg flex flex-col p-5 space-y-1">
                    <span className="font-semibold">Author's Price</span>
                    <span className="text-3xl font-semibold">
                      <span className="text-xs font-bold align-top pr-1">
                        MATIC
                      </span>
                      {(bookPreviewData.launch_price * 1).toFixed(2)}
                    </span>
                    <div className="flex-1 flex flex-col justify-end pt-12">
                      <button
                        className="w-full btn btn-accent btn-sm"
                        disabled={
                          bookPreviewData.supply_limit_bool &&
                          pricedBooksSold == bookPreviewData.supply_limit
                        }
                        onClick={async () => {
                          setValidPurchaseAttempt(true);
                          await purchaseFirstHand(
                            bookPreviewData.book_id,
                            bookPreviewData.launch_price,
                            signer.signer,
                            setProgressBuyStatusCB
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
                      {(bookPreviewData.launch_price * 1).toFixed(2)}
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
                      {(bookPreviewData.launch_price * 0.2).toFixed(3)}
                      <span className="text-base align-bottom pl-1">
                        / per month
                      </span>
                    </span>
                    <div className="flex-1 flex flex-col justify-end pt-12">
                      <button
                        className="w-full btn btn-warning btn-sm"
                        disabled={bookRentorsCount == 0 && true}
                        onClick={async () => {
                          setValidRentAttempt(true);
                          await takeBookOnRent(
                            signer.address,
                            bookPreviewData.book_id,
                            bookPreviewData.launch_price * 0.2,
                            setRentProgressStatusCB
                          ).then(() => {
                            setTimeout(() => {
                              router.push(
                                {
                                  pathname: `/OpenShelf`,
                                  query: {
                                    selected: 2,
                                  },
                                },
                                `/OpenShelf`
                              );
                            }, 1000);
                          });
                        }}
                      >
                        Buy
                      </button>
                    </div>
                  </div>
                </div>
                <div className="w-full flex">
                  <form
                    className="flex flex-row w-full justify-between space-x-5 form-control px-5"
                    onSubmit={(e) => {
                      handleRedeemSubmit(e);
                    }}
                  >
                    <input
                      type="text"
                      name="eBookVoucherSignature"
                      placeholder="Voucher Signature"
                      autoComplete="off"
                      onChange={(e) => {
                        if (e.target.value.length == 132) {
                          setValidRedeemSubmission(true);
                        } else {
                          setValidRedeemSubmission(false);
                        }
                      }}
                      className={`input input-bordered input-sm w-full ${
                        !validRedeemSubmission && `input-error`
                      }`}
                    />
                    <button
                      type="submit"
                      className={`flex btn btn-outline btn-sm px-5 space-x-2 opacity-70`}
                    >
                      <p className="pt-1 text-sm font-medium">
                        Redeem Book Voucher
                      </p>
                      <AcademicCapIcon className="h-4 w-4" />
                    </button>
                  </form>
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
