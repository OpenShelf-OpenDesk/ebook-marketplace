import { ethers } from "ethers";
import StorageStructures from "../../artifacts/contracts/StorageStructures.sol/StorageStructures.json";
import contract_address from "../../contract_address.json";

export async function getAllBooks(reader) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    reader
  );
  const books = await contract.getAllBooks();
  return books.map((book) => {
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
      metadataURI: book.metadataURI,
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

export async function redeem(student, voucher) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    student
  );
  const bookID = await contract.redeem(voucher);
  console.log(bookID);
  return bookID;
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
