import '../styles/globals.css';
import type { AppProps } from 'next/app';
import SignerContext from '../src/context/Signer';
import { useEffect, useState } from 'react';
import ConnectWallet from '../src/components/common/ConnectWallet';
import { connectToWallet } from '../src/controllers/ConnectWallet';
import { ethers } from 'ethers';

function MyApp({ Component, pageProps }: AppProps) {
  const [signer, setSigner] = useState<
    | {
        address: string;
        signer: ethers.providers.JsonRpcSigner;
      }
    | undefined
  >(undefined);

  useEffect(() => {
    connectToWallet().then(async (_signer) => {
      if (_signer) {
        const _address = await _signer.getAddress();
        setSigner({ address: _address, signer: _signer });
      }
    });
  }, []);

  return (
    <SignerContext.Provider value={{ signer, setSigner }}>
      {!signer && <ConnectWallet />}
      <div className={`${!signer && 'filter blur-xl bg-gray-300'}`}>
        <Component {...pageProps} />
      </div>
    </SignerContext.Provider>
  );
}
export default MyApp;
