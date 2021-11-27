import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import { useLoadingContext } from "../../../context/Loading";
import Layout from "../../common/Layout";
import Navbar from "../Navbar";
import Sidebar from "../Sidebar";
import Image from "next/image";
import PreviewBookCoverPage from "../../common/PreviewBookCoverPage";
import { eBook } from "../../../controllers/eBookMarketLaunch";
import {
  placeBuyOrder,
  placeSellOrder,
} from "../../../controllers/eBookExchange";
import { useSignerContext } from "../../../context/Signer";
import { CheckCircleIcon } from "@heroicons/react/solid";
import LoadingCircle from "../../common/LoadingCircle";
interface Props {
  selected: 1 | 2 | 3;
  setSelected: Dispatch<SetStateAction<1 | 2 | 3>>;
  exchangeData: string;
  initialBuyState: boolean;
}

const OrderStatusTag = ({ status, tag }) => {
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

const BuyOrderStatus = ({ statusCode }) => {
  return (
    <section className="flex justify-center fixed z-10 w-screen h-screen ">
      <div className="flex flex-col justify-center items-start">
        <OrderStatusTag
          status={statusCode >= 1}
          tag="sending transaction request"
        />
        <OrderStatusTag
          status={statusCode >= 2}
          tag="awaiting payment success"
        />
        <OrderStatusTag
          status={statusCode >= 3}
          tag="awaiting transaction success"
        />
      </div>
    </section>
  );
};

const SellOrderStatus = ({ statusCode }) => {
  return (
    <section className="flex justify-center fixed z-10 w-screen h-screen ">
      <div className="flex flex-col justify-center items-start">
        <OrderStatusTag
          status={statusCode >= 1}
          tag="sending transaction request"
        />
        <OrderStatusTag
          status={statusCode >= 2}
          tag="awaiting transaction success"
        />
      </div>
    </section>
  );
};

const Exchange = ({
  selected,
  setSelected,
  exchangeData,
  initialBuyState,
}: Props) => {
  const { setLoading } = useLoadingContext();
  const [buyState, setBuyState] = useState<boolean>(initialBuyState);
  const [selectedBook, setSelectedBook] = useState<eBook>();
  const { signer } = useSignerContext();
  const [validBuyOrderPlaced, setValidBuyOrderPlaced] =
    useState<boolean>(false);
  const [buyOrderProgressStatus, setBuyOrderProgressStatus] =
    useState<number>(0);
  const [validSellOrderPlaced, setValidSellOrderPlaced] =
    useState<boolean>(false);
  const [sellOrderProgressStatus, setSellOrderProgressStatus] =
    useState<number>(0);

  const setBuyOrderProgressStatusCB = (statusCode) => {
    switch (statusCode) {
      case 1:
        setBuyOrderProgressStatus(1);
        break;
      case 2:
        setBuyOrderProgressStatus(2);
        break;
      case 3:
        setBuyOrderProgressStatus(3);
        break;
      default:
        setBuyOrderProgressStatus(0);
        break;
    }
  };

  const setSellOrderProgressStatusCB = (statusCode) => {
    switch (statusCode) {
      case 1:
        setBuyOrderProgressStatus(1);
        break;
      case 2:
        setBuyOrderProgressStatus(2);
        break;
      default:
        setBuyOrderProgressStatus(0);
        break;
    }
  };

  useEffect(() => {
    if (exchangeData) {
      setSelectedBook(JSON.parse(exchangeData));
    }
    setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => {
      // setSelectedBook(undefined);
      setLoading(true);
    };
  }, []);
  return (
    <>
      {validBuyOrderPlaced && (
        <BuyOrderStatus statusCode={buyOrderProgressStatus} />
      )}
      {validSellOrderPlaced && (
        <SellOrderStatus statusCode={sellOrderProgressStatus} />
      )}
      <div
        className={`${
          (validBuyOrderPlaced || validSellOrderPlaced) &&
          "filter blur-xl bg-gray-100"
        }`}
      >
        <Layout
          Navbar={Navbar}
          Sidebar={Sidebar}
          selected={selected}
          setSelected={setSelected}
        >
          <div className="overflow-hidden h-full pb-10">
            <div className="flex flex-row justify-center space-x-10 h-full relative">
              <div className="flex justify-center items-center rounded-tl-xl w-3/4 h-5/6 z-0 bg-purple-50">
                <div className="flex flex-col justify-center items-center space-y-16">
                  <Image
                    src="/undraw_business_deal_re_up4u.svg"
                    width={300 * 1.5}
                    height={200 * 1.5}
                    layout="fixed"
                  />
                  <div className="text-gray-700 text-center flex-1 flex flex-col justify-center content-evenly min-h-full px-20">
                    <p className="text-3xl font-bold py-7">
                      First ever online e-book exchange
                    </p>
                    <p className="text-lg px-20">
                      Trustless, Peer-to-Peer network of readers to exchange
                      books quickly and seamlessly. This platform is
                      <i> of you, for you and by you</i>, no matter who you are,
                      where you live and what you read...{" "}
                      <b>We redefined privacy</b>.
                    </p>
                  </div>
                </div>
              </div>
              <div className="w-1/4 h-full">
                <div className="flex flex-col justify-center items-center w-full h-full">
                  <p className="font-semibold text-lg">
                    Select a book for details.
                  </p>
                </div>
              </div>
              {selectedBook && (
                <div className="bg-white border border-gray-300 w-1/4 h-full absolute right-5 rounded-tr-xl overflow-hidden">
                  <div className="w-full h-full flex flex-col pt-5">
                    <div className="flex justify-center w-full h-2/5">
                      <div className="h-full w-1/2">
                        <PreviewBookCoverPage
                          src={selectedBook.ebook_cover_image}
                        />
                      </div>
                    </div>
                    <div className="w-full h-3/5 mt-10">
                      <div className="flex">
                        <a
                          className={
                            buyState
                              ? "flex-1 border-t-4 border-green-500 font-semibold text-lg text-center py-1 bg-green-50"
                              : "flex-1 border-b border-r border-gray-300 font-semibold text-lg text-center pt-2 pb-1 cursor-pointer"
                          }
                          onClick={() => {
                            setBuyState(true);
                          }}
                        >
                          Buy
                        </a>
                        <a
                          className={
                            buyState
                              ? "flex-1 border-b border-l border-gray-300 font-semibold text-lg text-center pt-2 pb-1 cursor-pointer"
                              : "flex-1 border-t-4 border-red-500 font-semibold text-lg text-center py-1 bg-red-50"
                          }
                          onClick={() => {
                            setBuyState(false);
                          }}
                        >
                          Sell
                        </a>
                      </div>
                      {buyState ? (
                        <div className="w-full h-full bg-green-50">
                          <div className="flex flex-col justify-center w-full h-full px-16 text-lg font-semibold space-y-16 pb-10">
                            <div className="flex flex-col justify-center space-y-6 divide-y-2 divide-gray-400">
                              <div>
                                <p className="flex justify-between">
                                  <span>Seller Receives</span>
                                  <span>
                                    ₹ {selectedBook.launch_price * 0.8}
                                  </span>
                                </p>
                                <p className="flex justify-between">
                                  <span>Author Receives (20%)</span>
                                  <span className="text-right">
                                    ₹ {selectedBook.launch_price * 0.2}
                                  </span>
                                </p>
                              </div>
                              <div>
                                <p className="flex justify-between py-2">
                                  <span>Total Payment</span>
                                  <span className="text-right">
                                    ₹ {selectedBook.launch_price}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <button
                              className="btn btn-accent"
                              onClick={async () => {
                                setValidBuyOrderPlaced(true);
                                await placeBuyOrder(
                                  signer.signer,
                                  selectedBook.launch_price,
                                  selectedBook.book_id,
                                  setBuyOrderProgressStatusCB
                                );
                                setSelectedBook(undefined);
                                setValidBuyOrderPlaced(false);
                              }}
                            >
                              Place Buy Order
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="w-full h-full bg-red-50">
                          <div className="flex flex-col justify-center w-full h-full px-16 text-lg font-semibold space-y-16 pb-10">
                            <div className="flex flex-col justify-center space-y-6 divide-y-2 divide-gray-400">
                              <div>
                                <p className="flex justify-between">
                                  <span>Buyer Pays</span>
                                  <span>₹ {selectedBook.launch_price}</span>
                                </p>
                                <p className="flex justify-between">
                                  <span>Author Receives (20%)</span>
                                  <span className="text-right">
                                    ₹ {selectedBook.launch_price * 0.2}
                                  </span>
                                </p>
                              </div>
                              <div>
                                <p className="flex justify-between py-2">
                                  <span>Total Received</span>
                                  <span className="text-right">
                                    ₹ {selectedBook.launch_price * 0.8}
                                  </span>
                                </p>
                              </div>
                            </div>
                            <button
                              className="btn btn-error"
                              onClick={async () => {
                                setValidSellOrderPlaced(true);
                                await placeSellOrder(
                                  signer.signer,
                                  selectedBook.book_id
                                );
                                setSelectedBook(undefined);
                                setValidSellOrderPlaced(false);
                              }}
                            >
                              Place Sell Order
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Layout>
        )
      </div>
    </>
  );
};

export default Exchange;
