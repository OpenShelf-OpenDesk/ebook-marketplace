import Web3Modal from 'web3modal';
import { ethers } from 'ethers';

export async function connectToWallet() {
  const we3modal = new Web3Modal();
  const connection = await we3modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  if ((await provider.listAccounts()).length > 0) {
    return provider.getSigner();
  }
  return undefined;
}
