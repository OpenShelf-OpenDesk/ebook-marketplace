// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract eBookPublisher is ERC1155, ReentrancyGuard {
    using Counters for Counters.Counter;
    uint256 public immutable bookID;
    address public immutable author;
    uint256 public price;
    uint256 freeBooksPrinted;
    uint256 pricedBooksPrinted;
    uint256 freeBooksSupplyLimit = 1;
    int256 pricedBooksSupplyLimit; // -1 for unlimited supply
    uint256 FREE_BOOK_ID = 0;
    Counters.Counter PRICED_BOOK_ID;

    // struct eBookVoucher {
    //     uint256 eBookID;
    //     uint256 price;
    // }

    constructor(
        uint256 _bookID,
        address _author,
        uint256 _price,
        string memory _eBookURI,
        int256 _pricedBooksSupplyLimit
    ) ERC1155(_eBookURI) {
        bookID = _bookID;
        author = _author;
        _setURI(_eBookURI);
        price = _price;
        pricedBooksSupplyLimit = _pricedBooksSupplyLimit;
        _mint(_author, FREE_BOOK_ID, 1, "Author's Copy");
        freeBooksPrinted += 1;
    }

    modifier withinFreeBookSupplyLimit() {
        require(
            freeBooksPrinted < freeBooksSupplyLimit,
            "Free book supply limit reached!!"
        );
        _;
        freeBooksPrinted += 1;
    }

    modifier withinPricedBookSupplyLimit() {
        if (pricedBooksSupplyLimit == 0) {
            require(pricedBooksSupplyLimit != 0, "Sale not yet started!!");
        } else if (pricedBooksSupplyLimit > 0) {
            require(
                pricedBooksPrinted < uint256(pricedBooksSupplyLimit),
                "Priced book supply limit reached!!"
            );
        }
        _;
        pricedBooksPrinted += 1;
    }

    modifier onlyAuthor() {
        require(msg.sender == author, "Only the author have this privilage!!");
        _;
    }

    function setFreeBookSupplyLimit(uint256 limit)
        external
        nonReentrant
        onlyAuthor
    {
        require(
            limit > freeBooksPrinted,
            "Limit cannot be lesser than already supplied books!!"
        );
        freeBooksSupplyLimit = limit;
    }

    function setPricedBookSupplyLimit(int256 limit)
        external
        nonReentrant
        onlyAuthor
    {
        if (limit != -1) {
            require(
                limit > int256(pricedBooksPrinted),
                "Limit cannot be lesser than already supplied books!!"
            );
        }
        pricedBooksSupplyLimit = limit;
    }

    function setPrice(uint256 _price) external nonReentrant onlyAuthor {
        price = _price;
    }

    function printFreeVersion(address to)
        external
        nonReentrant
        onlyAuthor
        withinFreeBookSupplyLimit
    {
        _mint(to, FREE_BOOK_ID, 1, "Free Copy");
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

    function transfer(
        address from,
        address to,
        uint256 _eBookId
    ) public {
        _safeTransferFrom(from, to, _eBookId, 1, "");
    }

    // function createFreeBookVoucher() external onlyAuthor
}
