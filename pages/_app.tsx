import "../styles/globals.css";
import type { AppProps } from "next/app";
import SignerContext from "../src/context/Signer";
import PreviewBookContext from "../src/context/PreviewBook";
import LoadingContext from "../src/context/Loading";
import { useEffect, useState } from "react";
import ConnectWallet from "../src/components/common/ConnectWallet";
import { connectToWallet } from "../src/controllers/ConnectWallet";
import { ethers } from "ethers";
import { eBook } from "../src/controllers/eBookMarketLaunch";
import Loading from "../src/components/common/Loading";

function MyApp({ Component, pageProps }: AppProps) {
  const [signer, setSigner] = useState<
    | {
        address: string;
        signer: ethers.providers.JsonRpcSigner;
      }
    | undefined
  >(undefined);

  const [previewBook, setPreviewBook] = useState<eBook | undefined>();
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const providerEventsCB = async (_signer, _address) => {
      if (_signer && _address) {
        setSigner({ address: _address, signer: _signer });
      } else {
        setSigner(undefined);
      }
    };
    connectToWallet(providerEventsCB).then(async (_signer) => {
      if (_signer) {
        const _address = await _signer.getAddress();
        setSigner({ address: _address, signer: _signer });
      }
    });
  }, []);

  return (
    <SignerContext.Provider value={{ signer, setSigner }}>
      <PreviewBookContext.Provider value={{ previewBook, setPreviewBook }}>
        <LoadingContext.Provider value={{ loading, setLoading }}>
          {!signer && <ConnectWallet />}
          <div className={`${!signer && "filter blur-xl bg-gray-300"}`}>
            {loading && <Loading />}
            <div className={`${loading && "filter blur-xl bg-gray-100"}`}>
              <Component {...pageProps} />
            </div>
          </div>
        </LoadingContext.Provider>
      </PreviewBookContext.Provider>
    </SignerContext.Provider>
  );
}
export default MyApp;
