// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

library Types {
    struct book {
        uint256 bookID;
        author[] authors;
        uint256 price;
        bool supplyLimited;
        uint256 pricedBookSupplyLimit;
        uint256 freeBooksPrinted;
        uint256 pricedBooksPrinted;
        uint256 totalRevenue;
        uint256 withdrawableRevenue;
        string metadataURI;
    }

    struct author {
        address payable authorAddress;
        uint256 shares;
        bool authorRights;
    }

    struct copy {
        uint256 UID;
        BOOK_STATUS bookStatus;
        uint256 price;
    }

    enum BOOK_STATUS {
        OWNED,
        ON_SALE,
        AVAILABLE_FOR_RENT,
        RENTED,
        READING_ON_RENT,
        LOCKED
    }

    struct BookVoucher {
        uint256 bookID;
        address receiver;
        bytes signature;
    }

    enum ERROR {
        INSUFFICIENT_FUNDS_PROVIDED,
        INVALID_SIGNATURE,
        INVALID_REDEMPTION_REQUEST,
        PERMISSION_DENIED,
        SALE_NOT_STARTED,
        SUPPLY_LIMIT_REACHED,
        SUPPLY_ALREADY_LIMITED,
        SUPPLY_NOT_LIMITED,
        IS_ZERO_ADDRESS,
        INSUFFICIENT_SPEND_ALLOWANCE,
        ALREADY_ON_SALE,
        ALREADY_ON_RENT,
        ALREADY_OWNED,
        NOT_AVAILABLE_FOR_RENT,
        NOT_RENTED,
        INVALID_BOOK_ID,
        FLOW_DOES_NOT_EXIST,
        INSUFFICIENT_FLOW_BALANCE
    }
}
