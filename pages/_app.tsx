import '../styles/globals.css';
import type { AppProps } from 'next/app';
import SignerContext from '../src/context/Signer';
import { useState } from 'react';
import ConnectWallet from '../src/components/common/ConnectWallet';

function MyApp({ Component, pageProps }: AppProps) {
  const [signer, setSigner] = useState();
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
