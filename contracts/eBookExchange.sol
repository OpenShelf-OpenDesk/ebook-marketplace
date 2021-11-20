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

    function placeSellOrder(uint256 _bookID)
        public
        payable
        nonReentrant
        alreadyInShelf(_bookID)
    {
        if (ss.getBuyersCount(_bookID) > 0) {
            StorageStructures.Book memory _book = ss.getBook(_bookID);
            address _buyer = ss.matchBuyer(_bookID);
            payable(_book.author).transfer((_book.price * 20) / 100);
            payable(msg.sender).transfer((_book.price * 80) / 100);
            ss.executeOrder(_buyer, msg.sender, _bookID);
        } else {
            ss.addSeller(_bookID, msg.sender);
            ss.setBookStatus(
                msg.sender,
                _bookID,
                StorageStructures.eBookStatus.ON_SALE
            );
        }
    }

    function placeBuyOrder(uint256 _bookID)
        public
        payable
        nonReentrant
        newInShelf(_bookID)
    {
        StorageStructures.Book memory _book = ss.getBook(_bookID);
        require(msg.value >= _book.price, "Insufficient funds!!");
        if (ss.getSellersCount(_bookID) > 0) {
            address _seller = ss.matchSeller(_bookID);
            payable(_book.author).transfer((_book.price * 20) / 100);
            payable(_seller).transfer((_book.price * 80) / 100);
            ss.executeOrder(msg.sender, _seller, _bookID);
        } else {
            ss.addBuyer(_bookID, msg.sender);
        }
        payable(msg.sender).transfer(msg.value - _book.price);
    }
}
