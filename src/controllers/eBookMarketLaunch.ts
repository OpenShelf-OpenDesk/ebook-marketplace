import { ethers } from 'ethers';
import eBookMarketLaunch from '../../artifacts/contracts/eBookMarketLaunch.sol/eBookMarketlaunch.json';
import contract_address from '../../contract_address.json';
import { NFTStorage, Blob } from 'nft.storage';

export interface eBook {
  title: string;
  description: string;
  launch_price: number;
  currency?: string;
  supply_limit_bool: boolean;
  supply_limit: number;
  ebook_file: File;
}

async function uploadBook(eBookFile: File) {
  const client = new NFTStorage({
    token: process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY,
  });
  const eBookFile_cid = await client.storeBlob(new Blob([eBookFile]));
  console.log(`Uploaded eBook File...`);
  return eBookFile_cid;
}

async function uploadBookMetadata(eBook: eBook) {
  const client = new NFTStorage({
    token: process.env.NEXT_PUBLIC_NFT_STORAGE_API_KEY,
  });
  const metadata_cid = await client.storeBlob(
    new Blob([JSON.stringify(eBook)]),
  );
  console.log(`Uploaded metadata...`);
  return metadata_cid;
}

export async function publish(eBook: eBook, author) {
  const eBookMarketLaunchContractAddress = contract_address.eBookMarketLaunch;
  const contract = new ethers.Contract(
    eBookMarketLaunchContractAddress,
    eBookMarketLaunch.abi,
    author,
  );
  const { ebook_file, ...metadata } = eBook;
  const eBookURI = await uploadBook(ebook_file);
  const metadataURI = await uploadBookMetadata({
    ...metadata,
    ebook_file: new File(['Preview not available'], 'preview'),
  });
  const transaction = await contract.publish(
    eBookURI,
    ethers.utils.parseUnits(metadata.launch_price.toString(), 'ether'),
    metadata.supply_limit,
  );

  const transactionStatus = await transaction.wait();
  console.log(transactionStatus.events[0]);
  return metadataURI;
}

// export function purchaseFirstHand(bookID, reader) {
//   eBookMarketLaunch.purchaseFirstHand(bookID);
// }
