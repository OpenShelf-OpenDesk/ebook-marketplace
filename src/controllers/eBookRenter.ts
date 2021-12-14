import { ethers } from "ethers";
import eBookRenter from "../../artifacts/contracts/eBookRenting.sol/eBookRenting.json";
import contract_address from "../../contract_address.json";
import { createFlow, createUser } from "./Superfluid";

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
  const tx = await createFlow(
    createUser(readerAddress),
    contract_address.eBookRenter,
    flowrate,
    abiCoder.encode(["uint256"], [bookID])
  );
  console.log(tx);
}
