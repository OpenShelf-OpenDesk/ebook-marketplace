// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract eBookPublisher is ERC1155, ReentrancyGuard {
    using Counters for Counters.Counter;
    uint256 public immutable _bookID;
    address payable public immutable _author;
    uint256 public _price;
    uint256 private _freeBooksPrinted;
    uint256 private _pricedBooksPrinted;
    int256 private _pricedBooksSupplyLimit; // -1 for unlimited supply
    uint256 private FREE_BOOK_ID = 0;
    Counters.Counter private PRICED_BOOK_ID;
    address private immutable _donator;

    constructor(
        uint256 bookID,
        address author,
        uint256 price,
        string memory eBookURI,
        int256 pricedBooksSupplyLimit,
        address donator
    ) ERC1155(eBookURI) {
        _bookID = bookID;
        _author = payable(author);
        _price = price;
        _pricedBooksSupplyLimit = pricedBooksSupplyLimit;
        _mint(author, FREE_BOOK_ID, 1, "Author's Copy");
        _freeBooksPrinted += 1;
        _donator = donator;
    }

    struct eBookVoucher {
        uint256 bookID;
        address studentAddress;
        uint256 price;
        bytes signature;
    }

    modifier withinPricedBookSupplyLimit() {
        if (_pricedBooksSupplyLimit == 0) {
            require(_pricedBooksSupplyLimit != 0, "Sale not yet started!!");
        } else if (_pricedBooksSupplyLimit > 0) {
            require(
                _pricedBooksPrinted < uint256(_pricedBooksSupplyLimit),
                "Priced book supply limit reached!!"
            );
        }
        _;
        _pricedBooksPrinted += 1;
    }

    modifier onlyAuthor() {
        require(msg.sender == _author, "Only the author is privilaged!!");
        _;
    }

    function setPricedBookSupplyLimit(int256 limit)
        external
        nonReentrant
        onlyAuthor
    {
        if (limit != -1) {
            require(
                limit > int256(_pricedBooksPrinted),
                "Invalid supply limit!"
            );
        }
        _pricedBooksSupplyLimit = limit;
    }

    function setPrice(uint256 price) external nonReentrant onlyAuthor {
        _price = price;
    }

    function printPaidVersion(address to)
        external
        nonReentrant
        withinPricedBookSupplyLimit
        returns (uint256)
    {
        PRICED_BOOK_ID.increment();
        _mint(to, PRICED_BOOK_ID.current(), 1, "Purchased Copy");
        return PRICED_BOOK_ID.current();
    }

    function printFreeVersion(address to) external {
        require(msg.sender == _donator, "Unauthorized request!");
        _mint(_author, FREE_BOOK_ID, 1, "Student Copy");
        transfer(_author, to, 0);
        _freeBooksPrinted += 1;
    }

    function transfer(
        address from,
        address to,
        uint256 eBookId
    ) public {
        _safeTransferFrom(from, to, eBookId, 1, "");
    }

    function getBookURI() external view returns (string memory bookURI) {
        bookURI = uri(_bookID);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC1155)
        returns (bool)
    {
        return ERC1155.supportsInterface(interfaceId);
    }

    function getAuthor() external view returns (address) {
        return _author;
    }

    function getPricedBooksPrinted() external view returns (uint256) {
        return _pricedBooksPrinted;
    }

    function getFreeBooksPrinted() external view returns (uint256) {
        return _freeBooksPrinted;
    }
}
