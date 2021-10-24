import Web3Modal from 'web3modal';
import { ethers } from 'ethers';

export async function connectToWallet() {
  const we3modal = new Web3Modal();
  const connection = await we3modal.connect();
  const provider = new ethers.providers.Web3Provider(connection);
  const signer = provider.getSigner();
  return signer;
}
