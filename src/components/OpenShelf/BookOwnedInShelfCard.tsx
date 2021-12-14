import React, { useEffect, useState } from "react";
import { eBook } from "../../controllers/eBookMarketLaunch";
import PreviewBookCoverPage from "../common/PreviewBookCoverPage";
import LoadingCircle from "../common/LoadingCircle";
import { useRouter } from "next/router";
import { putBookForRent } from "../../controllers/eBookRenter";
import { useSignerContext } from "../../context/Signer";
interface Props {
  bookMetadataURI: string;
  status: number;
}

const BookOwnedInShelfCard = ({ bookMetadataURI, status }: Props) => {
  const router = useRouter();
  const { signer } = useSignerContext();
  const [bookMetadata, setBookMetadata] = useState<eBook | undefined>();
  useEffect(() => {
    const fetchMetadata = async () => {
      const response = await fetch(bookMetadataURI);
      const json = await response.json();
      return json;
    };
    fetchMetadata().then((_metadata) => {
      setBookMetadata(_metadata);
    });
  }, []);
  return bookMetadata ? (
    <div className="group h-80 w-full border border-gray-300 flex flex-row space-x-5 pr-5 overflow-hidden bg-white rounded-lg">
      <div className="flex-1 h-full w-full shadow-lg transition duration-500 ease-in-out transform hover:-translate-y-1 group-hover:scale-110">
        <PreviewBookCoverPage
          src={bookMetadata.ebook_cover_image}
          height={320}
        />
      </div>
      <div className="flex-1 h-full w-full flex flex-col justify-center items-center py-5">
        <p className="text-sm text-justify">
          {bookMetadata.description.slice(0, 311)}...
        </p>
        <div className="flex flex-col w-full h-full justify-end">
          <div className="flex justify-end py-3">
            <button
              className="text-sm text-primary self-end"
              onClick={() => {
                router.push(
                  {
                    pathname: `/bookReader`,
                    query: {
                      bookID: bookMetadata.book_id,
                    },
                  },
                  `/OpenShelf`
                );
              }}
            >
              Read &#10142;
            </button>
          </div>
          <div className="flex justify-between">
            <button
              disabled={status == 0 ? false : true}
              className={`text-sm font-semibold ${
                status == 0 ? "text-red-500" : `text-red-300 cursor-default`
              }`}
              onClick={() => {
                router.push(
                  {
                    pathname: `/exchange`,
                    query: {
                      selected: 3,
                      buyState: false,
                      data: JSON.stringify(bookMetadata),
                    },
                  },
                  `/OpenShelf`
                );
              }}
            >
              {status == 0 ? `Place Sell Order` : `On Sale`}
            </button>
            <button
              className="text-sm text-red-500 font-semibold"
              onClick={() => {
                putBookForRent(signer.signer, bookMetadata.book_id).then(() => {
                  router.reload();
                });
              }}
            >
              Put On Rent
            </button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center">
      <LoadingCircle />
    </div>
  );
};

export default BookOwnedInShelfCard;
