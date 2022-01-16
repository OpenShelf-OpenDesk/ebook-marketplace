// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

// import {Base64} from "../contracts-upgradeable/utils/Base64.sol";

library Types {
    struct book {
        uint256 bookID;
        author[] authors;
        uint256 price;
        bool supplyLimited;
        uint256 pricedBookSupplyLimit;
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

    function getEnumValueInString(BOOK_STATUS bookStatus)
        internal
        pure
        returns (string memory)
    {
        if (bookStatus == BOOK_STATUS.OWNED) return "OWNED";
        if (bookStatus == BOOK_STATUS.ON_SALE) return "ON_SALE";
        if (bookStatus == BOOK_STATUS.AVAILABLE_FOR_RENT)
            return "AVAILABLE_FOR_RENT";
        if (bookStatus == BOOK_STATUS.RENTED) return "RENTED";
        if (bookStatus == BOOK_STATUS.READING_ON_RENT) return "READING_ON_RENT";
        if (bookStatus == BOOK_STATUS.LOCKED) return "LOCKED";
        return "";
    }

    // function getBookJSON(book memory book_)
    //     external
    //     pure
    //     returns (string memory)
    // {
    //     return
    //         string(
    //             abi.encodePacked(
    //                 "data:application/json;base64,",
    //                 Base64.encode(
    //                     string(
    //                         abi.encodePacked(
    //                             "{'bookID' : '",
    //                             book_.bookID,
    //                             "','authors' : '','price' : '",
    //                             book_.price,
    //                             "', 'supplyLimited' : '",
    //                             book_.supplyLimited,
    //                             "', 'pricedBookSupplyLimit' : '",
    //                             book_.pricedBookSupplyLimit,
    //                             "', 'totalRevenue' : '",
    //                             book_.totalRevenue,
    //                             "', 'withdrawableRevenue' : '",
    //                             book_.withdrawableRevenue,
    //                             "', 'metadataURI' : '",
    //                             book_.metadataURI,
    //                             "'}"
    //                         )
    //                     )
    //                 )
    //             )
    //         );
    // }
}
