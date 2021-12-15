import React, { useEffect, useState } from "react";
import { eBook } from "../../controllers/eBookMarketLaunch";
import PreviewBookCoverPage from "../common/PreviewBookCoverPage";
import LoadingCircle from "../common/LoadingCircle";
import { useRouter } from "next/router";
import {
  putBookForRent,
  returnBookOnRent,
} from "../../controllers/eBookRenter";
import { useSignerContext } from "../../context/Signer";
interface Props {
  bookMetadataURI: string;
  cb: (statusCode: any) => void;
}

const BookRentedInShelfCard = ({ bookMetadataURI, cb }: Props) => {
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
      <div className="flex-1 h-full w-full shadow-lg">
        <PreviewBookCoverPage
          src={bookMetadata.ebook_cover_image}
          height={320}
        />
      </div>
      <div className="flex-1 h-full w-full flex flex-col justify-center items-center py-5">
        <p className="text-sm text-justify">
          {bookMetadata.description.slice(0, 330)}...
        </p>
        <div className="flex flex-col w-full h-full justify-end">
          <div className="flex justify-between">
            <button
              className={`text-sm font-semibold text-red-500`}
              onClick={() => {
                returnBookOnRent(signer.address, bookMetadata.book_id, cb).then(
                  () => {
                    router.reload();
                  }
                );
              }}
            >
              Return Book
            </button>
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
        </div>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center">
      <LoadingCircle />
    </div>
  );
};

export default BookRentedInShelfCard;
