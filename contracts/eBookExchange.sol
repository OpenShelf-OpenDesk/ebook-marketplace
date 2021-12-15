// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {StorageStructures, ReentrancyGuard} from "./StorageStructures.sol";

contract eBookExchange is ReentrancyGuard {
    StorageStructures _ss;

    constructor(address StorageContractAddress) {
        _ss = StorageStructures(StorageContractAddress);
    }

    error BookAlreadyInShelf(uint256 bookID, address buyer);
    error BookNotInShelf(uint256 bookID, address seller);

    modifier newInShelf(uint256 bookID) {
        StorageStructures.eBook[] memory readersShelf = _ss.getReadersShelf(
            msg.sender
        );
        for (uint256 i = 0; i < readersShelf.length; i++) {
            if (bookID == readersShelf[i].bookID) {
                revert BookAlreadyInShelf(bookID, msg.sender);
            }
        }
        _;
    }

    modifier alreadyInShelf(uint256 bookID) {
        StorageStructures.eBook[] memory readersShelf = _ss.getReadersShelf(
            msg.sender
        );
        for (uint256 i = 0; i < readersShelf.length; i++) {
            if (bookID == readersShelf[i].bookID) {
                _;
                return;
            }
        }
        revert BookNotInShelf(bookID, msg.sender);
    }

    function placeSellOrder(uint256 bookID)
        public
        payable
        nonReentrant
        alreadyInShelf(bookID)
    {
        if (_ss.getBuyersCount(bookID) > 0) {
            StorageStructures.Book memory book = _ss.getBook(bookID);
            address buyer = _ss.matchBuyer(bookID);
            payable(book.author).transfer((book.price * 20) / 100);
            _ss.addToAuthorsRevenue(
                book.author,
                bookID,
                (book.price * 20) / 100
            );
            payable(msg.sender).transfer((book.price * 80) / 100);
            _ss.executeOrder(buyer, msg.sender, bookID);
        } else {
            _ss.addSeller(bookID, msg.sender);
        }
    }

    function placeBuyOrder(uint256 bookID)
        public
        payable
        nonReentrant
        newInShelf(bookID)
    {
        StorageStructures.Book memory book = _ss.getBook(bookID);
        require(msg.value >= book.price, "Insufficient funds!!");
        if (_ss.getSellersCount(bookID) > 0) {
            address seller = _ss.matchSeller(bookID);
            payable(book.author).transfer((book.price * 20) / 100);
            _ss.addToAuthorsRevenue(
                book.author,
                bookID,
                (book.price * 20) / 100
            );
            payable(seller).transfer((book.price * 80) / 100);
            _ss.executeOrder(msg.sender, seller, bookID);
        } else {
            _ss.addBuyer(bookID, msg.sender);
        }
        payable(msg.sender).transfer(msg.value - book.price);
    }
}
