// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

import {eBookPublisher} from "./eBookPublisher.sol";

contract eBookDonator is ReentrancyGuard, EIP712 {
    string private constant SIGNING_DOMAIN = "EBook-Voucher";
    string private constant SIGNATURE_VERSION = "1";

    struct eBookVoucher {
        uint256 bookID;
        address studentAddress;
        uint256 price;
        bytes signature;
    }

    constructor() EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {}

    function _hash(eBookVoucher calldata voucher)
        private
        view
        returns (bytes32)
    {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "eBookVoucher(uint256 bookID,address studentAddress,uint256 price)"
                        ),
                        voucher.bookID,
                        voucher.studentAddress,
                        voucher.price
                    )
                )
            );
    }

    function redeem(
        address publisheraddress,
        address student,
        eBookVoucher calldata voucher
    ) external payable nonReentrant returns (uint256) {
        eBookPublisher publisher = eBookPublisher(publisheraddress);
        address signer = _verify(voucher);
        address author = publisher.getAuthor();

        require(author == signer, "Signature invalid or unauthorized");
        require(
            voucher.studentAddress == student,
            "Unauthorised redepmtion request"
        );
        require(msg.value >= voucher.price, "Insufficient funds to redeem");
        payable(author).transfer(voucher.price);
        publisher.printFreeVersion(voucher.studentAddress);

        payable(voucher.studentAddress).transfer(msg.value - voucher.price);

        return voucher.bookID;
    }

    function getChainID() external view returns (uint256 id) {
        id = block.chainid;
        return id;
    }

    function _verify(eBookVoucher calldata voucher)
        private
        view
        returns (address)
    {
        bytes32 digest = _hash(voucher);
        return ECDSA.recover(digest, voucher.signature);
    }
}
