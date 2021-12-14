import { ethers } from "ethers";
import StorageStructures from "../../artifacts/contracts/StorageStructures.sol/StorageStructures.json";
import contract_address from "../../contract_address.json";

export async function getRecentLaunches(reader) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    reader
  );
  const recentlyLaunchedBooks = await contract.getRecentLaunches();
  return recentlyLaunchedBooks.map((book) => {
    return book.metadataURI;
  });
}

export async function getBestSellers(reader) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    reader
  );
  const bestSellers = await contract.getBestSellers();
  return bestSellers.map((book) => {
    return book.metadataURI;
  });
}

export async function getBooksInMyShelf(reader, readerAddress) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    reader
  );
  const response = await contract.getReadersShelf(readerAddress);
  const booksInShelf = response.map((book) => {
    const bookInShelf = {
      bookID: Number(book.bookID),
      metadataURI: `https://${book.metadataURI}.ipfs.dweb.link`,
      eBookID: Number(book.eBookID),
      owner: book.owner,
      price: ethers.utils.formatUnits(book.price, "ether"),
      status: book.status,
    };
    return bookInShelf;
  });
  return booksInShelf;
}

// export async function getBooksOnSale(bookID, signer) {
//   const StorageStructuresContractAddress = contract_address.StorageStructures;
//   const contract = new ethers.Contract(
//     StorageStructuresContractAddress,
//     StorageStructures.abi,
//     signer
//   );
//   const booksOnSale = await contract.getOnSale();
//   console.log(booksOnSale);
// }

export async function getBookBuyersCount(bookID, signer) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    signer
  );
  const bookBuyersCount = await contract.getBuyersCount(bookID);
  console.log(Number(bookBuyersCount));
  return Number(bookBuyersCount);
}

export async function getBookSellersCount(bookID, signer) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    signer
  );
  const bookSellersCount = await contract.getSellersCount(bookID);
  console.log(Number(bookSellersCount));
  return Number(bookSellersCount);
}

export async function getBookURI(bookID, reader) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    reader
  );
  const bookURI = await contract.getBookURI(bookID);
  console.log(bookURI);
  return bookURI;
}

export async function getPublisherAddress(bookID, signer) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    signer
  );
  const publisherAddres = await contract.getPublisherAddress(bookID);
  console.log(publisherAddres);
  return publisherAddres;
}

export async function redeem(student, voucher, cb) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    student
  );
  try {
    const bookID = await contract.redeemStudentBookVoucher(voucher);
    cb(1);
    setTimeout(() => {
      cb(2);
    }, 1000)
    return bookID;
  } catch (error) {
    console.log(error);
    cb(-2);
  }
}

export async function getAuthorsDesk(author, authorAddress) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    author
  );
  const authorsDesk = await contract.getAuthorsDesk(authorAddress);
  console.log(authorsDesk);
  return authorsDesk;
}

export async function getPricedBooksPrinted(bookID, signer) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    signer
  );
  const pricedBooksPrinted = await contract.getPricedBooksPrinted(bookID);
  console.log(pricedBooksPrinted);
  return Number(pricedBooksPrinted);
}

export async function getFreeBooksPrinted(bookID, signer) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    signer
  );
  const freeBooksPrinted = await contract.getFreeBooksPrinted(bookID);
  console.log(freeBooksPrinted);
  return Number(freeBooksPrinted);
}

export async function getAuthorsRevenueForBook(bookID, author) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    author
  );
  const revenue = await contract.getAuthorsRevenueForBook(bookID);
  console.log(revenue);
  return ethers.utils.formatUnits(revenue, "ether");
}
