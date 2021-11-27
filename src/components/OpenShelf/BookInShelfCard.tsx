import React, { useEffect, useState } from "react";
import { eBook } from "../../controllers/eBookMarketLaunch";
import PreviewBookCoverPage from "../../components/common/PreviewBookCoverPage";
import LoadingCircle from "../common/LoadingCircle";
import { useRouter } from "next/router";
interface Props {
  bookMetadataURI: string;
}

const BookInShelfCard = ({ bookMetadataURI }: Props) => {
  const router = useRouter();
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
    <div className="group h-80 w-full border border-gray-300 flex flex-row space-x-5 pr-4 overflow-hidden bg-white">
      <div className="flex-1 h-full">
        <PreviewBookCoverPage
          src={bookMetadata.ebook_cover_image}
          height={320}
        />
      </div>
      <div className="flex-1 h-full w-full flex flex-col justify-center items-center py-5">
        <p className="text-center text-sm">
          {bookMetadata.description.slice(0, 325)}...
        </p>
        <div className="flex flex-col w-full h-full pt-4 justify-end">
          <div className="flex justify-between">
            <button
              className="text-sm text-red-500 font-semibold"
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
              Place Sell Order
            </button>
            <button
              className="text-sm text-primary self-end"
              onClick={() => {}}
            >
              Read &#10142;
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

export default BookInShelfCard;
