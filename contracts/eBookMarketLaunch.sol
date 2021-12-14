// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import {StorageStructures, ReentrancyGuard, eBookPublisher, Counters} from "./StorageStructures.sol";

contract eBookMarketLaunch is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _bookIDs;
    StorageStructures private _ss;

    constructor(address StorageStructuresContractAddress) {
        _ss = StorageStructures(StorageStructuresContractAddress);
    }

    error BookAlreadyInShelf(uint256 bookID, address buyer);
    error InvalidBookId(uint256 bookID);

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

    modifier bookExists(uint256 bookID) {
        if (bookID > _bookIDs.current()) {
            revert InvalidBookId(bookID);
        }
        _;
    }

    function publish(
        string memory eBookURI,
        string memory metadataURI,
        uint256 price,
        int256 pricedBooksSupplyLimit
    ) public nonReentrant {
        _bookIDs.increment();

        eBookPublisher neweBookPublisher = new eBookPublisher(
            _bookIDs.current(),
            msg.sender,
            price,
            eBookURI,
            pricedBooksSupplyLimit,
            _ss.getDonatorAddress()
        );
        _ss.addBook(
            StorageStructures.Book({
                author: msg.sender,
                metadataURI: metadataURI,
                price: price,
                publisherAddress: address(neweBookPublisher)
            })
        );
        _ss.addToDesk(msg.sender, _bookIDs.current());
    }

    function purchaseFirstHand(uint256 bookID)
        public
        payable
        nonReentrant
        bookExists(bookID)
        newInShelf(bookID)
    {
        StorageStructures.Book memory book = _ss.getBook(bookID);
        require(msg.sender != book.author, "Author can't buy own book!!");
        require(msg.value >= book.price, "Insufficient funds!!");
        payable(book.author).transfer(book.price);
        _ss.addToAuthorsRevenue(book.author, bookID, book.price);
        eBookPublisher publisher = eBookPublisher(book.publisherAddress);
        uint256 _eBookID = publisher.printPaidVersion(msg.sender);
        _ss.addToShelf(
            msg.sender,
            StorageStructures.eBook({
                bookID: bookID,
                eBookID: _eBookID,
                metadataURI: book.metadataURI,
                price: book.price,
                owner: msg.sender,
                status: StorageStructures.eBookStatus.OWNED
            })
        );
        _ss.updateBestSellers(bookID);
        payable(msg.sender).transfer(msg.value - book.price);
    }

    function getNextBookID() public view returns (uint256) {
        return _bookIDs.current() + 1;
    }
}
