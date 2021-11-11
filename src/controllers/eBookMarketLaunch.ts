import { ethers } from 'ethers';
import eBookMarketLaunch from '../../artifacts/contracts/eBookMarketLaunch.sol/eBookMarketlaunch.json';
import contract_address from '../../contract_address.json';
import { NFTStorage, Blob } from 'nft.storage';
import { pdfjs } from 'react-pdf';

pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.js`;

export interface eBook {
  title: string;
  description: string;
  launch_price: number;
  currency?: string;
  supply_limit_bool: boolean;
  supply_limit: number;
  ebook_file?: File;
  ebook_cover_image?: string;
}

const readFileData = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      resolve(e.target.result);
    };
    reader.onerror = (err) => {
      reject(err);
    };
    reader.readAsDataURL(file);
  });
};

async function extractCoverImage(file) {
  const data = await readFileData(file);
  const pdf = await pdfjs.getDocument(data).promise;
  const canvas = document.createElement('canvas');
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 1 });
  const context = canvas.getContext('2d');
  canvas.height = viewport.height;
  canvas.width = viewport.width;
  await page.render({ canvasContext: context, viewport: viewport }).promise;
  const image = canvas.toDataURL();
  canvas.remove();
  return image;
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
  const eBookCoverImage = await extractCoverImage(ebook_file);
  const metadataURI = await uploadBookMetadata({
    ...metadata,
    ebook_cover_image: eBookCoverImage,
  });
  try {
    const transaction = await contract.publish(
      eBookURI,
      metadataURI,
      ethers.utils.parseUnits(metadata.launch_price.toString(), 'ether'),
      metadata.supply_limit,
    );
    const transactionStatus = await transaction.wait();
    console.log(transactionStatus.events[0]);
    return metadataURI;
  } catch (error) {
    console.log(error);
  }
}

export async function purchaseFirstHand(bookID, price, reader) {
  const eBookMarketLaunchContractAddress = contract_address.eBookMarketLaunch;
  const contract = new ethers.Contract(
    eBookMarketLaunchContractAddress,
    eBookMarketLaunch.abi,
    reader,
  );
  try {
    const transaction = await contract.purchaseFirstHand(bookID, {
      value: ethers.utils.parseUnits(price.toString(), 'ether'),
    });
    const transactionStatus = await transaction.wait();
    console.log(transactionStatus);
  } catch (error) {
    console.log(error);
  }
}
