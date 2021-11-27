import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { usePreviewBookContext } from "../../context/PreviewBook";
import { eBook } from "../../controllers/eBookMarketLaunch";
import PreviewBookCoverPage from "../common/PreviewBookCoverPage";
import LoadingCircle from "../common/LoadingCircle";
interface Props {
  book_metadata_uri: string;
}

const BookCard = ({ book_metadata_uri }: Props) => {
  const router = useRouter();
  const [bookMetadata, setBookMetadata] = useState<eBook | undefined>();
  const { setPreviewBook } = usePreviewBookContext();
  useEffect(() => {
    const fetchMetadata = async () => {
      const response = await fetch(
        `https://${book_metadata_uri}.ipfs.dweb.link`
      );
      const json = await response.json();
      return json;
    };
    fetchMetadata().then((_metadata) => {
      setBookMetadata(_metadata);
    });
  }, []);

  return bookMetadata ? (
    <div className="overscroll-contain relative">
      <div className="group carousel-item w-60 h-80 rounded bg-white mr-8">
        <div
          className={`absolute transition duration-500 ease-in-out transform group-hover:-translate-y-40 shadow-lg w-60 h-72 rounded bg-none`}
        >
          <div className="h-full w-full bg-white">
            <PreviewBookCoverPage src={bookMetadata.ebook_cover_image} />
          </div>
        </div>
        <div className="pt-32 w-full h-72 rounded border border-transparent group-hover:border-gray-400 overscroll-none">
          <div className="flex flex-col p-3 text-gray-700 h-full">
            <p className="font-semibold mb-2">
              {bookMetadata.title.length > 23
                ? `${bookMetadata.title.substring(0, 23)}...`
                : bookMetadata.title}
            </p>
            <p className="text-xs ">
              {bookMetadata.description.length > 110
                ? `${bookMetadata.description.substring(0, 110)}...`
                : bookMetadata.description}
            </p>
            <div className="flex w-full h-full justify-end">
              <button
                className={`px-2 text-2xs text-center font-semibold h-7 text-white p-1 btn-primary rounded self-end`}
                onClick={() => {
                  setPreviewBook(bookMetadata);
                  router.push(
                    {
                      pathname: `/OpenShelf/bookpreview`,
                      query: { bookdata: JSON.stringify(bookMetadata) },
                    },
                    `/OpenShelf/bookpreview`
                  );
                }}
              >
                More &#10142;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center w-60 h-72 rounded bg-white border border-gray-400 mr-8">
      <LoadingCircle />
    </div>
  );
};

export default BookCard;
