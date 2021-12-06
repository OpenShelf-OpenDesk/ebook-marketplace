import { useEffect, useReducer, useState } from "react";
import { SearchIcon } from "@heroicons/react/solid";
import { BellIcon as BellIconOutline } from "@heroicons/react/outline";
import { BellIcon as BellIconSolid } from "@heroicons/react/solid";
import { ChevronDownIcon } from "@heroicons/react/solid";
import Blockies from "react-blockies-image";
import { useSignerContext } from "../../context/Signer";
import { useRouter } from "next/router";
import { useLoadingContext } from "../../context/Loading";
import { ArrowNarrowLeftIcon } from "@heroicons/react/solid";

interface Props {}

function navbarReducer(state, action) {
  switch (action.type) {
    case "NOTIFICATION":
      return { search: false, notification: true };
    case "SEARCH":
      return { search: true, notification: false };
    default:
      return { search: false, notification: false };
  }
}

const Navbar = (props: Props) => {
  const { setLoading } = useLoadingContext();
  const router = useRouter();
  const { signer } = useSignerContext();
  const [signerAddress, setSignerAddress] = useState<string>(
    "0x0000000000000000000000000000000000000000"
  );

  const [navbarState, dispatch] = useReducer(navbarReducer, {
    search: false,
    notification: false,
  });

  useEffect(() => {
    if (signer) {
      setSignerAddress(signer.address);
    }
  }, [signer]);

  return (
    <nav className="navbar w-full text-neutral space-x-3 bg-white fixed pl-9 pr-5 py-4 z-10">
      <p className="cursor-pointer pr-10">
        <ArrowNarrowLeftIcon
          className="w-6 h-6"
          onClick={() => {
            setLoading(true);
            router.push("/");
          }}
        />
      </p>
      <div className="flex-1 hidden lg:flex">
        <span className="text-primary text-3xl font-bold">OpenShelf</span>
      </div>
      <div className="flex-1 lg:flex-none w-3/12 h-10">
        <div data-theme="light" className="form-control w-full">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              className="w-full pr-16 input input-ghost input-bordered h-12 focus:bg-gray-100"
              onFocus={() => {
                dispatch({ type: "SEARCH" });
              }}
            />
            <button className="absolute top-0 right-0 rounded-l-none btn btn-primary no-animation ">
              <SearchIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div
        className={`flex-none ${
          navbarState.notification && "bg-purple-100"
        } rounded-lg`}
        onClick={() => {
          dispatch({ type: "NOTIFICATION" });
        }}
      >
        <button className="btn btn-ghost focus:outline-none">
          {navbarState.notification ? (
            <BellIconSolid className="h-5 w-5 text-primary" />
          ) : (
            <BellIconOutline className="h-5 w-5" />
          )}
        </button>
      </div>

      <div className="flex-none bg-gray-100 w-2/12 rounded-lg cursor-pointer hover:bg-gray-200">
        <div className="avatar flex-none">
          <div className="rounded-tl-lg rounded-bl-lg w-12 h-12 bg-white object-fill">
            <Blockies seed={signerAddress} size={48} scale={8} />
          </div>
        </div>
        <div
          className="flex-1 ml-5 text-left tooltip tooltip-bottom"
          data-tip="Copy to Clipboard"
          onClick={() => navigator.clipboard.writeText(signerAddress)}
        >
          <div className="flex flex-col truncate">
            <p className="text-sm font-semibold">Personal Wallet</p>
            <p className="text-2xs">
              {signer
                ? `${signerAddress.slice(0, 8)}.....${signerAddress.slice(-4)}`
                : "0x0000000000000000000000000000000000000000"}
            </p>
          </div>
        </div>
        <div className="flex-none mx-3">
          <span className="block leading-relaxed text-center">
            <ChevronDownIcon className="w-4 h-4" />
          </span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
