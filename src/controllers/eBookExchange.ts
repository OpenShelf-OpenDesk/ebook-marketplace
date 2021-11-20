import { ethers } from 'ethers';
import eBookExchange from '../../artifacts/contracts/eBookExchange.sol/eBookExchange.json';
import contract_address from '../../contract_address.json';

export async function placeSellOrder(reader, bookID) {
  const eBookExchangeContractAddress = contract_address.eBookExchange;
  const contract = new ethers.Contract(
    eBookExchangeContractAddress,
    eBookExchange.abi,
    reader,
  );
  try {
    const transaction = await contract.placeSellOrder(bookID);
    const transactionStatus = await transaction.wait();
    console.log(transactionStatus);
  } catch (error) {
    console.log(error);
  }
}

export async function placeBuyOrder(reader, price, bookID, cb) {
  cb(1);
  const eBookExchangeContractAddress = contract_address.eBookExchange;
  const contract = new ethers.Contract(
    eBookExchangeContractAddress,
    eBookExchange.abi,
    reader,
  );
  try {
    const transaction = await contract.placeBuyOrder(bookID, {
      value: ethers.utils.parseUnits(price.toString(), 'ether'),
    });
    cb(2);
    const transactionStatus = await transaction.wait();
    cb(3);
    console.log(transactionStatus);
  } catch (error) {
    console.log(error);
  }
}
