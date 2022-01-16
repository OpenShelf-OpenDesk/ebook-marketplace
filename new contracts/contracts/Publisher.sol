// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "../contracts-upgradeable/proxy/utils/Initializable.sol";
import "../contracts-upgradeable/utils/CountersUpgradeable.sol";
import "../contracts-upgradeable/utils/StringsUpgradeable.sol";
import "../contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";

import "./Types.sol";
import {Book} from "./Book.sol";

contract Publisher is Initializable, ReentrancyGuardUpgradeable {
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using Types for Types.ERROR;
    using Types for Types.author;
    using Types for Types.book;

    // Storage Variables -----------------------------------------
    CountersUpgradeable.Counter private _bookID;
    mapping(uint256 => address) private publishedBooks;
    address private _distributor;
    address private _rentor;

    function initialize() public initializer {
        __ReentrancyGuard_init();
        _bookID.increment();
    }

    // Events -----------------------------------------
    event BookPublished(
        uint256 bookID,
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
        emit BookPublished(
            _bookID.current(),
            book.price,
            book.supplyLimited,
            book.pricedBookSupplyLimit,
            book.metadataURI
        );
        newBook.initialize(
            _distributor,
            _rentor,
            msg.sender,
            _bookID.current(),
            book.price,
            book.authors,
            book.supplyLimited,
            book.pricedBookSupplyLimit,
            book.metadataURI,
            bookURI
        );
        publishedBooks[_bookID.current()] = address(newBook);
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
