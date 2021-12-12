import React, { useEffect, useState } from "react";
import { eBook } from "../../controllers/eBookMarketLaunch";
import PreviewBookCoverPage from "../common/PreviewBookCoverPage";
import { useSignerContext } from "../../context/Signer";
import LoadingCircle from "../common/LoadingCircle";
import { useRouter } from "next/router";
import { eBookVoucherGenerator } from "../../utils/eBookVoucherGenerator";
import { DuplicateIcon } from "@heroicons/react/outline";
interface Props {
  bookMetadataURI: string;
}

const BookPublishedDeskCard = ({ bookMetadataURI }: Props) => {
  const router = useRouter();
  const { signer } = useSignerContext();
  const [bookMetadata, setBookMetadata] = useState<eBook | undefined>();
  const [voucherLoading, setVoucherLoading] = useState<boolean>(false);
  const [voucherGenerated, setVoucherGenerated] = useState<any | undefined>();
  const [validSubmission, setValidSubmission] = useState<boolean>(true);

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

  const handleSubmitVoucher = async (e) => {
    e.preventDefault();
    if (e.target.studentAddress.value.length > 0) {
      setVoucherLoading(true);
      setValidSubmission(true);
      // const voucherGenerator = new eBookVoucherGenerator({
      //   bookID: bookMetadata.book_id,
      //   author: signer.signer,
      // });
      // voucherGenerator
      //   .createVoucher(bookMetadata.book_id, e.target.studentAddress.value, 0)
      //   .then((voucher) => {
      //     setVoucherGenerated(voucher);
      //   });
      setVoucherGenerated({
        signature:
          "0xa5a16697a4d349b2ac00fbb7d13517fe7a1f6ff3b6d8312a7819adca1461f33a52a2df199c6ab752a7b76a2438c5e2d8b1eb15e540d964730bfe586b021e14591c",
      });
      setTimeout(() => {
        setVoucherLoading(false);
      }, 1000);
    } else {
      setValidSubmission(false);
    }
  };

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
              <div className="stat-title">Total Sales</div>
              <div className="stat-value">3</div>
              <div className="stat-desc">Books</div>
            </div>
          </div>
          <div className="stats">
            <div className="stat">
              <div className="stat-title">Total Revenue</div>
              <div className="stat-value">{bookMetadata.launch_price * 3}</div>
              <div className="stat-desc">{bookMetadata.currency}</div>
            </div>
          </div>
        </div>
      </div>
      {voucherLoading ? (
        <div className="h-full w-2/5 flex flex-col justify-center px-9 rounded-r-lg border-l-8 border-green-100 items-center">
          <LoadingCircle />
        </div>
      ) : voucherGenerated ? (
        <div className="h-full w-2/5 flex flex-col justify-evenly px-9 rounded-r-lg border-l-8 border-green-100">
          <p className="text-center text-lg font-semibold text-accent py-16">
            Student Voucher Details
          </p>
          <textarea
            name="studentVoucher"
            className="focus:outline-none py-3 px-5 border-2 resize-none overflow-hidden hover:shadow-md rounded-lg text-gray-400 italic"
            rows={6}
            readOnly
            value={voucherGenerated.signature}
          />
          <div className="flex justify-end">
            <button
              className="flex space-x-1.5 btn btn-accent btn-outline btn-xs justify-center"
              onClick={() => {
                navigator.clipboard.writeText(voucherGenerated.signature);
              }}
            >
              <p className="text-xs font-medium pt-0.5">Copy</p>
              <DuplicateIcon className="h-4 w-4" />
            </button>
          </div>
          <div className="flex justify-center pt-5 pb-11">
            <button
              type="submit"
              className="btn btn-accent"
              onClick={() => {
                setVoucherGenerated(null);
              }}
            >
              Create New Voucher
            </button>
          </div>
        </div>
      ) : (
        <div className="h-full w-2/5 flex flex-col justify-evenly py-20 px-9 rounded-r-lg border-l-8 border-green-100">
          <p className="text-center text-lg font-semibold text-accent py-14">
            Create Student Voucher
          </p>
          <form
            className="form-control"
            onSubmit={(e) => {
              handleSubmitVoucher(e);
            }}
          >
            <label className="label">
              <span className="label-text">Student's Wallet Address</span>
            </label>
            <input
              type="text"
              placeholder="Address"
              name="studentAddress"
              onChange={(e) => {
                if (e.target.value.length > 0) {
                  setValidSubmission(true);
                } else {
                  setValidSubmission(false);
                }
              }}
              className={`input input-bordered ${
                !validSubmission && `input-error`
              }`}
            />
            <div className="flex justify-center py-7">
              <button type="submit" className="btn btn-accent">
                Create Voucher
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  ) : (
    <div className="flex justify-center items-center">
      <LoadingCircle />
    </div>
  );
};

export default BookPublishedDeskCard;
