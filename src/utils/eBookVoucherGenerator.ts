import { ethers } from "ethers";
import eBookPublisher from "../../artifacts/contracts/eBookPublisher.sol/eBookPublisher.json";
import { getPublisherAddress } from "../controllers/StorageStructures";

const SIGNING_DOMAIN_NAME = "EBook-Voucher";
const SIGNING_DOMAIN_VERSION = "1";

class LazyMinter {
  _contract;
  _signer;
  _domain;

  constructor({ bookID, author }) {
    getPublisherAddress(bookID, author).then((publisherAddress) => {
      this._contract = new ethers.Contract(
        publisherAddress,
        eBookPublisher.abi,
        author
      );
    });
    this._signer = author;
  }

  async createVoucher(bookID, studentAddress, price = 0) {
    const voucher = { bookID, studentAddress, price };
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
      signature,
    };
  }

  /**
   * @private
   * @returns {object} the EIP-721 signing domain, tied to the chainId of the signer
   */
  async _signingDomain() {
    if (this._domain != null) {
      return this._domain;
    }
    const chainId = await this._contract.getChainID();
    this._domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: this._contract.address,
      chainId,
    };
    return this._domain;
  }
}

module.exports = {
  LazyMinter,
};
