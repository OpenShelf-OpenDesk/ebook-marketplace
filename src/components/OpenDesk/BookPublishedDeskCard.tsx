import React, { useEffect, useState } from "react";
import { eBook } from "../../controllers/eBookMarketLaunch";
import PreviewBookCoverPage from "../common/PreviewBookCoverPage";
import LoadingCircle from "../common/LoadingCircle";
import { useRouter } from "next/router";
interface Props {
  bookMetadataURI: string;
}

const BookPublishedDeskCard = ({ bookMetadataURI }: Props) => {
  const router = useRouter();
  const [bookMetadata, setBookMetadata] = useState<eBook | undefined>();
  useEffect(() => {
    const fetchMetadata = async () => {
      const response = await fetch(`https://${bookMetadataURI}.ipfs.dweb.link`);
      const json = await response.json();
      return json;
    };
    fetchMetadata().then((_metadata) => {
      setBookMetadata(_metadata);
    });
  }, []);
  return bookMetadata ? (
    <div className="w-full border border-gray-300 flex flex-row space-x-5 bg-white rounded-lg">
      <div className="h-full shadow-lg transition duration-500 ease-in-out transform hover:-translate-y-1 hover:scale-105 bg-white">
        <PreviewBookCoverPage
          src={bookMetadata.ebook_cover_image}
          width={400}
          height={500}
        />
      </div>
      <div className="h-full w-full flex flex-col pt-9 space-y-5 px-7">
        <p className="text-lg font-semibold pt-3 text-center">
          {bookMetadata.title}
        </p>
        <p className="text-sm text-justify">
          {bookMetadata.description.slice(0, 550)}...
        </p>
        <div className="flex justify-around pt-5">
          <div className="stats">
            <div className="stat">
              <div className="stat-title">Launch Price</div>
              <div className="stat-value">{bookMetadata.launch_price}</div>
              <div className="stat-desc">{bookMetadata.currency}</div>
            </div>
          </div>
          <div className="stats">
            <div className="stat">
              <div className="stat-title">Supply Limit</div>
              <div
                className={`${
                  bookMetadata.supply_limit_bool
                    ? `stat-value`
                    : `stat-value text-lg`
                }`}
              >
                {bookMetadata.supply_limit_bool
                  ? bookMetadata.supply_limit
                  : `Not Set`}
              </div>
              <div className="stat-desc">
                {bookMetadata.supply_limit_bool ? `No. of Books` : `on Books`}
              </div>
            </div>
          </div>
          <div className="stats">
            <div className="stat">
              <div className="stat-title">Students Copies</div>
              <div className="stat-value">2</div>
              <div className="stat-desc">Books</div>
            </div>
          </div>
        </div>
        <div className="flex justify-center space-x-11 pb-5">
          <div className="stats">
            <div className="stat">
              <div className="stat-title">Total Purchases</div>
              <div className="stat-value">3</div>
              <div className="stat-desc">Books</div>
            </div>
          </div>
          <div className="stats">
            <div className="stat">
              <div className="stat-title">Total Sales</div>
              <div className="stat-value">2</div>
              <div className="stat-desc">{bookMetadata.currency}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-full w-2/5 flex flex-col justify-evenly py-20 px-9 rounded-r-lg border-l-8 border-green-100">
        <p className="text-center text-lg font-semibold text-accent py-16">
          Create Student Voucher
        </p>
        <form className="form-control">
          <label className="label">
            <span className="label-text">Student's Wallet Address</span>
          </label>
          <input
            type="text"
            placeholder="Address"
            name="studentAddress"
            className="input input-bordered"
          />
          <div className="flex justify-center py-7">
            <button type="submit" className="btn btn-accent">
              Create Voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  ) : (
    <div className="flex justify-center items-center">
      <LoadingCircle />
    </div>
  );
};

export default BookPublishedDeskCard;
