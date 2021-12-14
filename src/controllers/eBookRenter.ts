import { ethers } from "ethers";
import eBookRenter from "../../artifacts/contracts/eBookRenting.sol/eBookRenting.json";
import contract_address from "../../contract_address.json";
import { createFlow, createUser, deleteFlow } from "./Superfluid";

export async function putBookForRent(reader, bookID) {
  const eBookRenterContractAddress = contract_address.eBookRenter;
  const contract = new ethers.Contract(
    eBookRenterContractAddress,
    eBookRenter.abi,
    reader
  );
  await contract.putBookForRent(bookID);
}

export async function removeBookFromRent(reader, bookID) {
  const eBookRenterContractAddress = contract_address.eBookRenter;
  const contract = new ethers.Contract(
    eBookRenterContractAddress,
    eBookRenter.abi,
    reader
  );
  await contract.removeBookFromRent(bookID);
}

export async function takeBookOnRent(readerAddress, bookID, flowrate) {
  const abiCoder = new ethers.utils.AbiCoder();
  const encodedBookID = abiCoder.encode(["uint256"], [bookID]);
  const tx = await createFlow(
    createUser(readerAddress),
    contract_address.eBookRenter,
    flowrate,
    encodedBookID
  );
  console.log(tx);
}

export async function returnBookOnRent(readerAddress, bookID) {
  const abiCoder = new ethers.utils.AbiCoder();
  const encodedBookID = abiCoder.encode(["uint256"], [bookID]);
  const tx = await deleteFlow(
    createUser(readerAddress),
    contract_address.eBookRenter,
    encodedBookID
  );
  console.log(tx);
}
