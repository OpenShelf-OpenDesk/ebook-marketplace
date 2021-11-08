// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "./eBookPublisher.sol";
import "./StorageStructures.sol";

contract eBookMarketLaunch is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private bookIDs;
    StorageStructures private ss;

    constructor(address _StorageContractAddress) {
        ss = StorageStructures(_StorageContractAddress);
    }

    error BookAlreadyInShelf(uint256 _bookID, address buyer);
    error InvalidBookId(uint256 _bookID);

    modifier newInShelf(uint256 _bookID) {
        StorageStructures.eBook[] memory _readersShelf = ss.getReadersShelf(msg.sender);
        for (uint256 i = 0; i < _readersShelf.length; i++) {
            if (_bookID == _readersShelf[i].bookID) {
                revert BookAlreadyInShelf(_bookID, msg.sender);
            }
        }
        _;
    }


    modifier bookExists(uint256 _bookId) {
        if (_bookId > bookIDs.current()){
            revert InvalidBookId(_bookId );
        }
        _;
    }

    function publish(
        string memory _eBookURI,
        string memory _metadataURI,
        uint256 _price,
        int256 _pricedBooksSupplyLimit
    ) public nonReentrant {
        bookIDs.increment();
        eBookPublisher neweBookPublisher = new eBookPublisher(
            bookIDs.current(),
            msg.sender,
            _price,
            _eBookURI,
            _pricedBooksSupplyLimit
        );

        ss.addBook(
            StorageStructures.Book({
                author: msg.sender,
                metadataURI: _metadataURI,
                price: _price,
                publisherAddress: address(neweBookPublisher)
            })
        );
        ss.addToDesk(msg.sender, bookIDs.current());
    }

    function purchaseFirstHand(uint256 _bookID)
        public
        payable
        nonReentrant
        bookExists(_bookID)
        newInShelf(_bookID)
    {
        StorageStructures.Book memory _book = ss.getBook(_bookID);
        eBookPublisher _publisher = eBookPublisher(_book.publisherAddress);
        require(msg.value >= _book.price, "Insufficient funds!!");
        payable(_book.author).transfer(msg.value);
        uint256 _eBookID = _publisher.printPaidVersion(msg.sender);
        ss.addToShelf(msg.sender, StorageStructures.eBook({
                bookID: _bookID,
                eBookID: _eBookID,
                bookURI: _publisher.uri(_eBookID),
                price: _book.price,
                owner: msg.sender,
                status: StorageStructures.eBookStatus.OWNED
            }));
    }
}
