import { ethers } from "ethers";
import eBookDonator from "../../artifacts/contracts/eBookDonator.sol/eBookDonator.json";
import contract_address from "../../contract_address.json";

const SIGNING_DOMAIN_NAME = "EBook-Voucher";
const SIGNING_DOMAIN_VERSION = "1";

export class eBookVoucherGenerator {
  _contract;
  _signer;
  _domain;
  _bookID;

  constructor({ bookID, author }) {
    const eBookDonatorContractAddress = contract_address.eBookDonator;
    this._contract = new ethers.Contract(
      eBookDonatorContractAddress,
      eBookDonator.abi,
      author
    );

    this._bookID = bookID;
    this._signer = author;
  }

  async createVoucher(studentAddress, price = 0) {
    const voucher = {
      bookID: this._bookID,
      studentAddress: studentAddress,
      price: price,
    };
    const domain = await this._signingDomain();
    const types = {
      eBookVoucher: [
        { name: "bookID", type: "uint256" },
        { name: "studentAddress", type: "address" },
        { name: "price", type: "uint256" },
      ],
    };
    const signature = await this._signer._signTypedData(domain, types, voucher);
    return {
      ...voucher,
      signature: signature,
    };
  }

  private async _signingDomain() {
    if (this._domain != null) {
      return this._domain;
    }
    const chainId = await this._contract.getChainID();
    console.log(Number(chainId));
    this._domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: this._contract.address,
      chainId,
    };
    return this._domain;
  }
}
