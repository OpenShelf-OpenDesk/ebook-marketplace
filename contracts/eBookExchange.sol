// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "./eBookMarketLaunch.sol";
import "./StorageStructures.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract eBookExchange is ReentrancyGuard {
    StorageStructures ss;

    constructor(address _StorageContractAddress) {
        ss = StorageStructures(_StorageContractAddress);
    }

    error BookAlreadyInShelf(uint256 _bookID, address buyer);
    error BookNotInShelf(uint256 _bookID, address seller);
    error InvalidBookId(uint256 _bookID);
    error NoOldBooksForSale(uint256 _bookID);

    modifier newInShelf(uint256 _bookID) {
        StorageStructures.eBook[] memory _readersShelf = ss.getReadersShelf(
            msg.sender
        );
        for (uint256 i = 0; i < _readersShelf.length; i++) {
            if (_bookID == _readersShelf[i].bookID) {
                revert BookAlreadyInShelf(_bookID, msg.sender);
            }
        }
        _;
    }

    modifier alreadyInShelf(uint256 _bookID) {
        StorageStructures.eBook[] memory _readersShelf = ss.getReadersShelf(
            msg.sender
        );
        for (uint256 i = 0; i < _readersShelf.length; i++) {
            if (_bookID == _readersShelf[i].bookID) {
                _;
                return;
            }
        }
        revert BookNotInShelf(_bookID, msg.sender);
    }

    // modifier bookExists(uint256 _bookId) {
    //     if (_bookId > bookIDs.current()){
    //         revert InvalidBookId(_bookId );
    //     }
    //     _;
    // }

    function putOnSale(uint256 _bookID)
        public
        nonReentrant
        // bookExists(_bookID)
        alreadyInShelf(_bookID)
    {
        StorageStructures.eBook[] memory _readersShelf = ss.getReadersShelf(
            msg.sender
        );
        for (uint256 i = 0; i < _readersShelf.length; i++) {
            if (_readersShelf[i].bookID == _bookID) {
                require(
                    _readersShelf[i].status ==
                        StorageStructures.eBookStatus.OWNED,
                    "This book is either on sale or non-transferable!!"
                );
                // ss.setBookStatus(msg.sender, _bookID, StorageStructures
                //     .eBookStatus
                //     .ON_SALE);
                ss.addToOnSale(_bookID, ss.getReadersShelf(msg.sender)[i]);
                break;
            }
        }
    }

    function purchaseSecondHand(uint256 _bookID)
        public
        payable
        nonReentrant
        // bookExists(_bookID)
        newInShelf(_bookID)
    {
        if (ss.getOnSale(_bookID).length > 0) {
            StorageStructures.eBook memory eBookOnSale = ss.getOnSale(_bookID)[
                ss.getOnSale(_bookID).length - 1
            ];
            require(msg.value >= eBookOnSale.price, "Insufficient funds!!");
            StorageStructures.Book memory _book = ss.getBook(_bookID);
            payable(_book.author).transfer((eBookOnSale.price * 10) / 100);
            payable(eBookOnSale.owner).transfer((eBookOnSale.price * 90) / 100);
            eBookPublisher(_book.publisherAddress).transfer(
                eBookOnSale.owner,
                msg.sender,
                eBookOnSale.eBookID
            );
            ss.transferBook(eBookOnSale.owner, msg.sender, eBookOnSale);
            ss.removeFromOnSale(_bookID);
        } else {
            revert NoOldBooksForSale(_bookID);
        }
    }
}
