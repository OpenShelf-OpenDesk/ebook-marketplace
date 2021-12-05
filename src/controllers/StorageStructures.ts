import { ethers } from 'ethers';
import StorageStructures from '../../artifacts/contracts/StorageStructures.sol/StorageStructures.json';
import contract_address from '../../contract_address.json';

export async function getAllBooks() {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const provider = new ethers.providers.JsonRpcProvider(
    `http://localhost:7545/`,
  );
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    provider,
  );
  const books = await contract.getAllBooks();
  return books.map((book) => {
    return book.metadataURI;
  });
}

export async function getBooksInMyShelf(reader) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const provider = new ethers.providers.JsonRpcProvider(
    `http://localhost:7545/`,
  );
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    provider,
  );
  const response = await contract.getReadersShelf(reader);
  const booksInShelf = response.map((_book) => {
    const bookInShelf = {
      bookID: Number(_book.bookID),
      metadataURI: _book.metadataURI,
      eBookID: Number(_book.eBookID),
      owner: _book.owner,
      price: ethers.utils.formatUnits(_book.price, 'ether'),
      status: _book.status,
    };
    return bookInShelf;
  });
  return booksInShelf;
}

export async function getBooksOnSale(_bookID) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const provider = new ethers.providers.JsonRpcProvider(
    `http://localhost:7545/`,
  );
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    provider,
  );
  const booksOnSale = await contract.getOnSale();
  console.log(booksOnSale);
}

export async function getBookBuyersCount(_bookID) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const provider = new ethers.providers.JsonRpcProvider(
    `http://localhost:7545/`,
  );
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    provider,
  );
  const bookBuyersCount = await contract.getBuyersCount(_bookID);
  console.log(Number(bookBuyersCount));
  return Number(bookBuyersCount);
}

export async function getBookSellersCount(_bookID) {
  const StorageStructuresContractAddress = contract_address.StorageStructures;
  const provider = new ethers.providers.JsonRpcProvider(
    `http://localhost:7545/`,
  );
  const contract = new ethers.Contract(
    StorageStructuresContractAddress,
    StorageStructures.abi,
    provider,
  );
  const bookSellersCount = await contract.getSellersCount(_bookID);
  console.log(Number(bookSellersCount));
  return Number(bookSellersCount);
}