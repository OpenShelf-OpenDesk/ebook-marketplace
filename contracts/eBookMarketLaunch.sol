// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/utils/Counters.sol";
import "./eBookPublisher.sol";
import "./StorageStructures.sol";

contract eBookMarketLaunch {
    using Counters for Counters.Counter;
    Counters.Counter private eBookIDs;

    StorageStructures ss;

    constructor(address _StorageContractAddress) {
        ss = StorageStructures(_StorageContractAddress);
    }

    using Counters for Counters.Counter;
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
                    bytes(ss.getBook(ss.getAuthorsDesk(msg.sender)[i]).uri)
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
        if (ss.getBook(_bookId).contractAddress == address(0)) {
            revert InvalidBookId(_bookId);
        }
        _;
    }

    function publish(
        string memory _eBookURI,
        uint256 _price,
        int256 _pricedBooksSupplyLimit
    ) public newOnDesk(_eBookURI) {
        eBookIDs.increment();
        eBookPublisher neweBookPublisher = new eBookPublisher(
            eBookIDs.current(),
            msg.sender,
            _price,
            _eBookURI,
            _pricedBooksSupplyLimit
        );
        // uint256 _bookID = neweBookPublisher.bookID();
        ss.addBook(
            StorageStructures.Book({
                author: msg.sender,
                uri: _eBookURI,
                contractAddress: address(neweBookPublisher)
            })
        );
        ss.addToDesk(msg.sender, neweBookPublisher.bookID());
    }

    // Lazy Minting
    function purchaseFirstHand(uint256 _bookID)
        public
        payable
        bookExists(_bookID)
        newInShelf(_bookID)
    {
        eBookPublisher publisher = eBookPublisher(
            ss.getBook(_bookID).contractAddress
        );
        uint256 _price = publisher.price();
        require(msg.value >= _price, "Insufficient funds!!");
        payable(publisher.author()).transfer(msg.value);
        uint256 _eBookID = publisher.printPaidVersion(msg.sender);
        ss.addToShelf(
            msg.sender,
            StorageStructures.eBook({
                bookID: _bookID,
                eBookID: _eBookID,
                price: _price,
                owner: msg.sender,
                status: StorageStructures.eBookStatus.OWNED
            })
        );
    }
}
