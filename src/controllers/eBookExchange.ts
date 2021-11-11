import { ethers } from 'ethers';
import eBookExchange from '../../artifacts/contracts/eBookExchange.sol/eBookExchange.json';
import contract_address from '../../contract_address.json';

export async function putOnSale(reader, bookID) {
  const eBookExchangeContractAddress = contract_address.eBookExchange;
  const contract = new ethers.Contract(
    eBookExchangeContractAddress,
    eBookExchange.abi,
    reader,
  );
  try {
    const transaction = await contract.putOnSale(bookID);
    const transactionStatus = await transaction.wait();
    console.log(transactionStatus);
  } catch (error) {
    console.log(error);
  }
}
