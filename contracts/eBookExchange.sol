// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "./eBookMarketLaunch.sol";
import "./StorageStructures.sol";

contract eBookExchange {
    StorageStructures ss;

    constructor(address _StorageContractAddress) {
        ss = StorageStructures(_StorageContractAddress);
    }

    error BookAlreadyInShelf(uint256 _bookID, address buyer);
    error BookAlreadyOnDesk(string _uri, address author);
    error BookNotInShelf(uint256 _bookID, address seller);
    error InvalidBookId(uint256 _bookID);
    error NoOldBooksForSale(uint256 _bookID);

    modifier newInShelf(uint256 _bookID) {
        for (uint256 i = 0; i < ss.getReadersShelf(msg.sender).length; i++) {
            if (_bookID == ss.getReadersShelf(msg.sender)[i].bookID) {
                revert BookAlreadyInShelf(_bookID, msg.sender);
            }
        }
        _;
    }

    modifier newOnDesk(string memory _uri) {
        for (uint256 i = 0; i < ss.getAuthorsDesk(msg.sender).length; i++) {
            if (
                keccak256(bytes(_uri)) ==
                keccak256(
                    bytes(ss.getBooks(ss.getAuthorsDesk(msg.sender)[i]).uri)
                )
            ) {
                revert BookAlreadyOnDesk(_uri, msg.sender);
            }
        }
        _;
    }

    modifier alreadyInShelf(uint256 _bookID) {
        for (uint256 i = 0; i < ss.getReadersShelf(msg.sender).length; i++) {
            if (_bookID == ss.getReadersShelf(msg.sender)[i].bookID) {
                _;
                return;
            }
        }
        revert BookNotInShelf(_bookID, msg.sender);
    }

    modifier bookExists(uint256 _bookId) {
        if (ss.getBooks(_bookId).contractAddress == address(0)) {
            revert InvalidBookId(_bookId);
        }
        _;
    }

    function putOnSale(uint256 _bookID)
        public
        bookExists(_bookID)
        alreadyInShelf(_bookID)
    {
        for (uint256 i = 0; i < ss.getReadersShelf(msg.sender).length; i++) {
            if (ss.getReadersShelf(msg.sender)[i].bookID == _bookID) {
                require(
                    ss.getReadersShelf(msg.sender)[i].status ==
                        StorageStructures.eBookStatus.OWNED,
                    "This book is either on sale or non-transferable!!"
                );
                ss.addToOnSale(_bookID, ss.getReadersShelf(msg.sender)[i]);
                ss.getReadersShelf(msg.sender)[i].status = StorageStructures
                    .eBookStatus
                    .ON_SALE;
                break;
            }
        }
    }

    function purchaseSecondHand(uint256 _bookID)
        public
        payable
        bookExists(_bookID)
        newInShelf(_bookID)
    {
        if (ss.getOnSale(_bookID).length > 0) {
            StorageStructures.eBook memory eBookOnSale = ss.getOnSale(_bookID)[
                ss.getOnSale(_bookID).length - 1
            ];
            require(
                msg.value >= eBookOnSale.price,
                "Funds are lesser than the book's price!!"
            );
            eBookPublisher(ss.getBooks(_bookID).contractAddress).transfer(
                eBookOnSale.owner,
                msg.sender,
                eBookOnSale.eBookID
            );
            payable(ss.getBooks(_bookID).author).transfer(
                (eBookOnSale.price * 10) / 100
            );
            payable(eBookOnSale.owner).transfer((eBookOnSale.price * 90) / 100);
            for (
                uint256 i = 0;
                i < ss.getReadersShelf(msg.sender).length;
                i++
            ) {
                if (ss.getReadersShelf(msg.sender)[i].bookID == _bookID) {
                    ss.getReadersShelf(msg.sender)[i] = ss.getReadersShelf(
                        msg.sender
                    )[ss.getReadersShelf(msg.sender).length - 1];
                    delete ss.getReadersShelf(msg.sender)[
                        ss.getReadersShelf(msg.sender).length - 1
                    ];
                    break;
                }
            }
        } else {
            revert NoOldBooksForSale(_bookID);
        }
    }
}
