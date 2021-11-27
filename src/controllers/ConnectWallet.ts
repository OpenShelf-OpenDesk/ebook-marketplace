import Web3Modal from "web3modal";
import { ethers } from "ethers";

export async function connectToWallet(cb) {
  const web3modal = new Web3Modal();
  const connection = await web3modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);

  connection.on("accountsChanged", async (accounts: string[]) => {
    if ((await provider.listAccounts()).length > 0) {
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      cb(signer, address);
    } else {
      cb(null, null);
    }
  });

  // Subscribe to chainId change
  connection.on("chainChanged", (chainId: number) => {
    console.log(chainId);
  });

  // Subscribe to provider connection
  connection.on("connect", (info: { chainId: number }) => {
    console.log(info);
  });

  // Subscribe to provider disconnection
  connection.on("disconnect", (error: { code: number; message: string }) => {
    console.log(error);
  });

  if ((await provider.listAccounts()).length > 0) {
    return provider.getSigner();
  }
  return undefined;
}
