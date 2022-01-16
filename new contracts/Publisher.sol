// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "./contracts-upgradeable/proxy/utils/Initializable.sol";
import "./contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./contracts-upgradeable/utils/StringsUpgradeable.sol";
import "./contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "./Types.sol";
import {Book} from "./Book.sol";

contract Publisher is Initializable, ReentrancyGuardUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using Types for Types.book;
    using Types for Types.ERROR;
    using Types for Types.author;

    // Storage Variables -----------------------------------------
    CountersUpgradeable.Counter private _bookID;
    mapping(uint256 => address) private publishedBooks;
    address private _distributor;
    address private _rentor;

    constructor() initializer {}

    function initialize() public initializer {
        __ReentrancyGuard_init();
        _bookID.increment();
    }

    // Events -----------------------------------------
    event BookPublished(
        uint256 bookID,
        Types.author[] authors,
        uint256 price,
        bool supplyLimited,
        uint256 pricedBookSupplyLimit,
        string metadataURI
    );

    // Public Functions -----------------------------------------
    function initializeDistributor() external {
        require(
            _distributor == address(0),
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        _distributor = msg.sender;
    }

    function initializeRentor() external {
        require(
            _rentor == address(0),
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        _rentor = msg.sender;
    }

    function publish(string memory bookURI, Types.book calldata book)
        external
        nonReentrant
    {
        Book newBook = new Book();
        newBook.initialize(bookURI, book, msg.sender, _distributor, _rentor);
        publishedBooks[_bookID.current()] = address(newBook);
        emit BookPublished(
            _bookID.current(),
            book.authors,
            book.price,
            book.supplyLimited,
            book.pricedBookSupplyLimit,
            book.metadataURI
        );
        _bookID.increment();
    }

    function getBookAddress(uint256 bookID) external view returns (address) {
        require(
            msg.sender == _distributor || msg.sender == _rentor,
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        return publishedBooks[bookID];
    }
}
