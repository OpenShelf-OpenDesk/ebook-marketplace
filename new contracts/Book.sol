// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "./contracts-upgradeable/proxy/utils/Initializable.sol";
import "./contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "./contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "./contracts-upgradeable/access/AccessControlUpgradeable.sol";

import "./Types.sol";
import {Publisher} from "./Publisher.sol";

/**
 * @title Book
 * @author Raghav Goyal, Nonit Mittal
 * @dev
 */
contract Book is
    Initializable,
    AccessControlUpgradeable,
    ReentrancyGuardUpgradeable
{
    using CountersUpgradeable for CountersUpgradeable.Counter;
    using Types for Types.author;
    using Types for Types.book;
    using Types for Types.copy;
    using Types for Types.BOOK_STATUS;
    using Types for Types.BookVoucher;
    using Types for Types.ERROR;

    // Storage Variables -----------------------------------------
    CountersUpgradeable.Counter private _pricedBookUID;
    uint256 private _bookID;
    Types.author[] private _authors;
    address private _minter;
    uint256 private _price;
    uint256 private _maxPrice;
    bool private _supplyLimited;
    uint256 private _pricedBookSupplyLimit;
    CountersUpgradeable.Counter private _freeBooksPrinted;
    CountersUpgradeable.Counter private _pricedBooksPrinted;
    uint256 private _totalRevenue;
    uint256 private _withdrawableRevenue;
    string private _metadataURI;
    string private _bookURI;
    address private _publisher;
    address private _distributor;
    address private _rentor;

    // Arrays ------------------------------------------
    address[] private _buyers;
    address[] private _sellers;
    address[] private _buyersForAcceptedToken;
    address[] private _sellersForAcceptedToken;

    // Mappings ------------------------------------------
    mapping(address => Types.copy) private copiesRecord;

    // Constants -----------------------------------------
    uint256 private constant FREE_BOOK_ID = 0;

    // EVENTS
    event ShelfUpdated(
        uint256 bookID,
        uint256 UID,
        address reader,
        Types.BOOK_STATUS bookStatus
    );
    event BookUpdated(
        uint256 bookID,
        Types.author[] authors,
        address minter,
        uint256 price,
        uint256 maxPrice,
        bool supplyLimited,
        uint256 pricedBookSupplyLimit,
        uint256 freeBooksPrinted,
        uint256 pricedBooksPrinted,
        uint256 totalRevenue,
        uint256 withdrawableRevenue,
        string metadataURI,
        uint256 buyersCount,
        uint256 sellersCount,
        uint256 buyersCountForAcceptedToken,
        uint256 sellersCountForAcceptedToken
    );

    // Roles -----------------------------------------
    bytes32 private constant AUTHOR_ROLE = keccak256("AUTHOR");
    bytes32 private constant CO_AUTHOR_ROLE = keccak256("CO-AUTHOR");
    bytes32 private constant READER_ROLE = keccak256("READER");
    bytes32 private constant BUYER_ROLE = keccak256("BUYER");
    bytes32 private constant SELLER_ROLE = keccak256("SELLER");
    bytes32 private constant RENTOR_ROLE = keccak256("RENTOR");
    bytes32 private constant DISTRIBUTOR_ROLE = keccak256("DISTRIBUTOR");
    bytes32 private constant PUBLISHER_ROLE = keccak256("PUBLISHER");

    // Modifiers -----------------------------------------
    modifier withinPricedBookSupplyLimit() {
        if (_supplyLimited) {
            require(
                _pricedBookSupplyLimit != 0,
                StringsUpgradeable.toString(
                    uint256(Types.ERROR.SALE_NOT_STARTED)
                )
            );
            require(
                _pricedBookSupplyLimit > _pricedBooksPrinted.current(),
                StringsUpgradeable.toString(
                    uint256(Types.ERROR.SUPPLY_LIMIT_REACHED)
                )
            );
        }
        _;
    }

    // Initializer -----------------------------------------
    constructor() initializer {
        _publisher = msg.sender;
        _setupRole(PUBLISHER_ROLE, _publisher);
    }

    function initialize(
        string memory bookURI,
        Types.book memory book,
        address msgSender,
        address distributor,
        address rentor
    ) public initializer {
        __ReentrancyGuard_init();
        require(
            msg.sender == _publisher,
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        // Initializing Storage Variables
        _bookID = book.bookID;
        _minter = msgSender;
        _price = book.price;
        _supplyLimited = book.supplyLimited;
        _pricedBookSupplyLimit = book.pricedBookSupplyLimit;
        _metadataURI = book.metadataURI;
        _pricedBookUID.increment();
        _bookURI = bookURI;
        _distributor = distributor;
        _setupRole(DISTRIBUTOR_ROLE, distributor);
        _rentor = rentor;
        _setupRole(RENTOR_ROLE, rentor);

        for (uint256 i = 0; i < book.authors.length; i++) {
            // Minting first copy for Author
            _authors.push(book.authors[i]);
            _addRecord(
                FREE_BOOK_ID,
                book.authors[i].authorAddress,
                Types.BOOK_STATUS.LOCKED
            );
            _freeBooksPrinted.increment();

            // Granting initial roles
            if (book.authors[i].authorRights) {
                _setupRole(AUTHOR_ROLE, book.authors[i].authorAddress);
            } else {
                _setupRole(CO_AUTHOR_ROLE, book.authors[i].authorAddress);
            }
        }
    }

    // Private Functions -----------------------------------------
    function _addRecord(
        uint256 UID,
        address reader,
        Types.BOOK_STATUS bookStatus
    ) private {
        copiesRecord[reader] = Types.copy(UID, bookStatus, _price);
        emit ShelfUpdated(_bookID, UID, reader, bookStatus);
    }

    function _changeRecordStatus(
        address reader,
        Types.BOOK_STATUS newBookStatus
    ) private {
        copiesRecord[reader].bookStatus = newBookStatus;
        emit ShelfUpdated(
            _bookID,
            copiesRecord[reader].UID,
            reader,
            newBookStatus
        );
    }

    function _transferRecord(address from, address to) private {
        copiesRecord[to] = copiesRecord[from];
        delete copiesRecord[from];
        emit ShelfUpdated(
            _bookID,
            copiesRecord[to].UID,
            to,
            copiesRecord[to].bookStatus
        );
    }

    function _emitBookUpdated() private {
        emit BookUpdated(
            _bookID,
            _authors,
            _minter,
            _price,
            _maxPrice,
            _supplyLimited,
            _pricedBookSupplyLimit,
            _freeBooksPrinted.current(),
            _pricedBooksPrinted.current(),
            _totalRevenue,
            _withdrawableRevenue,
            _metadataURI,
            _buyers.length,
            _sellers.length,
            _buyersForAcceptedToken.length,
            _sellersForAcceptedToken.length
        );
    }

    // Public Functions ----------------------------------------
    function printPricedBook(address to)
        external
        onlyRole(DISTRIBUTOR_ROLE)
        withinPricedBookSupplyLimit
    {
        _addRecord(_pricedBookUID.current(), to, Types.BOOK_STATUS.OWNED);
        _pricedBooksPrinted.increment();
        _pricedBookUID.increment();
        _setupRole(READER_ROLE, msg.sender);
    }

    function printFreeBook(address to) external onlyRole(DISTRIBUTOR_ROLE) {
        _addRecord(FREE_BOOK_ID, to, Types.BOOK_STATUS.LOCKED);
        _freeBooksPrinted.increment();
        _setupRole(READER_ROLE, msg.sender);
    }

    function addSeller(address newSeller, bool payementInAcceptedToken)
        external
        onlyRole(DISTRIBUTOR_ROLE)
    {
        if (payementInAcceptedToken) {
            _sellersForAcceptedToken.push(newSeller);
        } else {
            _sellers.push(newSeller);
        }
        _revokeRole(READER_ROLE, newSeller);
        _setupRole(SELLER_ROLE, newSeller);
        _changeRecordStatus(newSeller, Types.BOOK_STATUS.ON_SALE);
        _emitBookUpdated();
    }

    function addBuyer(address newBuyer, bool payementInAcceptedToken)
        external
        onlyRole(DISTRIBUTOR_ROLE)
    {
        if (payementInAcceptedToken) {
            _buyersForAcceptedToken.push(newBuyer);
        } else {
            _buyers.push(newBuyer);
        }
        _setupRole(BUYER_ROLE, newBuyer);
        _emitBookUpdated();
    }

    function executeOrder(
        address reader,
        bool buy,
        bool payementInAcceptedToken
    ) external onlyRole(DISTRIBUTOR_ROLE) returns (address) {
        address matchFound;
        if (buy) {
            if (payementInAcceptedToken) {
                matchFound = _sellersForAcceptedToken[0];
                for (
                    uint256 i = 0;
                    i < _sellersForAcceptedToken.length - 1;
                    i++
                ) {
                    _sellersForAcceptedToken[i] = _sellersForAcceptedToken[
                        i + 1
                    ];
                }
                delete _sellersForAcceptedToken[
                    _sellersForAcceptedToken.length - 1
                ];
            } else {
                matchFound = _sellers[0];
                for (uint256 i = 0; i < _sellers.length - 1; i++) {
                    _sellers[i] = _sellers[i + 1];
                }
                delete _sellers[_sellers.length - 1];
            }
            _revokeRole(SELLER_ROLE, matchFound);
            _transferRecord(matchFound, reader);
            _changeRecordStatus(reader, Types.BOOK_STATUS.OWNED);
            return matchFound;
        } else {
            if (payementInAcceptedToken) {
                matchFound = _buyersForAcceptedToken[0];
                for (
                    uint256 i = 0;
                    i < _buyersForAcceptedToken.length - 1;
                    i++
                ) {
                    _buyersForAcceptedToken[i] = _buyersForAcceptedToken[i + 1];
                }
                delete _buyersForAcceptedToken[
                    _buyersForAcceptedToken.length - 1
                ];
            } else {
                matchFound = _buyers[0];
                for (uint256 i = 0; i < _buyers.length - 1; i++) {
                    _buyers[i] = _buyers[i + 1];
                }
                delete _buyers[_buyers.length - 1];
            }
            _revokeRole(BUYER_ROLE, matchFound);
            _setupRole(READER_ROLE, matchFound);
            _transferRecord(reader, matchFound);
            _changeRecordStatus(matchFound, Types.BOOK_STATUS.OWNED);
        }
        _emitBookUpdated();
        return matchFound;
    }

    function getBookStatus(address msgSender)
        external
        view
        returns (Types.BOOK_STATUS)
    {
        return copiesRecord[msgSender].bookStatus;
    }

    function getBuyersCount(bool payementInAcceptedToken)
        external
        view
        returns (uint256)
    {
        if (payementInAcceptedToken) {
            return _buyersForAcceptedToken.length;
        } else {
            return _buyers.length;
        }
    }

    function getSellersCount(bool payementInAcceptedToken)
        external
        view
        returns (uint256)
    {
        if (payementInAcceptedToken) {
            return _sellersForAcceptedToken.length;
        } else {
            return _sellers.length;
        }
    }

    function hasNoRole(address msgSender) external view returns (bool) {
        return
            !hasRole(READER_ROLE, msgSender) &&
            !hasRole(AUTHOR_ROLE, msgSender) &&
            !hasRole(CO_AUTHOR_ROLE, msgSender) &&
            !hasRole(PUBLISHER_ROLE, msgSender) &&
            !hasRole(DISTRIBUTOR_ROLE, msgSender) &&
            !hasRole(RENTOR_ROLE, msgSender) &&
            !hasRole(BUYER_ROLE, msgSender) &&
            !hasRole(SELLER_ROLE, msgSender);
    }

    function hasReaderRole(address msgSender) external view returns (bool) {
        return hasRole(READER_ROLE, msgSender);
    }

    function hasAuthorRole(address msgSender) external view returns (bool) {
        return hasRole(AUTHOR_ROLE, msgSender);
    }

    function getCurrentPrice() external view returns (uint256) {
        return _price;
    }

    function addRevenue() external onlyRole(DISTRIBUTOR_ROLE) nonReentrant {
        _totalRevenue += _price;
        _withdrawableRevenue += _price;
        _emitBookUpdated();
    }

    function getTotalRevenue() external view returns (uint256) {
        return _totalRevenue;
    }

    function getWithdrawableRevenue() external view returns (uint256) {
        return _withdrawableRevenue;
    }

    function resetWithdrawableRevenue() external onlyRole(DISTRIBUTOR_ROLE) {
        _withdrawableRevenue = 0;
        _emitBookUpdated();
    }

    function getAuthors() external view returns (Types.author[] memory) {
        return _authors;
    }

    function updatePrice(uint256 updatedPrice)
        external
        nonReentrant
        onlyRole(AUTHOR_ROLE)
    {
        require(
            updatedPrice != _price,
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        _price = updatedPrice;
        if (_price > _maxPrice) {
            _maxPrice = _price;
        }
        _emitBookUpdated();
    }

    function increaseMarketSupply(uint256 incrementSupplyBy)
        external
        nonReentrant
        onlyRole(AUTHOR_ROLE)
    {
        require(
            _supplyLimited,
            StringsUpgradeable.toString(uint256(Types.ERROR.SUPPLY_NOT_LIMITED))
        );
        _pricedBookSupplyLimit += incrementSupplyBy;
        _emitBookUpdated();
    }

    function limitSupply() external nonReentrant onlyRole(AUTHOR_ROLE) {
        require(
            !_supplyLimited,
            StringsUpgradeable.toString(
                uint256(Types.ERROR.SUPPLY_ALREADY_LIMITED)
            )
        );
        _supplyLimited = true;
        _pricedBookSupplyLimit = _pricedBooksPrinted.current();
        _emitBookUpdated();
    }

    function unlimitSupply() external nonReentrant onlyRole(AUTHOR_ROLE) {
        require(
            _supplyLimited,
            StringsUpgradeable.toString(uint256(Types.ERROR.SUPPLY_NOT_LIMITED))
        );
        _supplyLimited = false;
        _emitBookUpdated();
    }

    function minter() external view returns (address) {
        return _minter;
    }

    function getCopyPrice(address reader) external view returns (uint256) {
        return copiesRecord[reader].price;
    }

    function getMaxPrice() external view returns (uint256) {
        return _maxPrice;
    }

    function getBookURI()
        external
        view
        onlyRole(AUTHOR_ROLE)
        onlyRole(CO_AUTHOR_ROLE)
        onlyRole(READER_ROLE)
        returns (string memory)
    {
        require(
            copiesRecord[msg.sender].bookStatus != Types.BOOK_STATUS.RENTED,
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        return _bookURI;
    }

    function setAvailableForRent(address msgSender)
        external
        onlyRole(RENTOR_ROLE)
    {
        require(
            copiesRecord[msgSender].bookStatus == Types.BOOK_STATUS.OWNED,
            StringsUpgradeable.toString(uint256(Types.ERROR.ALREADY_ON_RENT))
        );
        _changeRecordStatus(msgSender, Types.BOOK_STATUS.AVAILABLE_FOR_RENT);
    }

    function setUnavailableForRent(address msgSender)
        external
        onlyRole(RENTOR_ROLE)
    {
        require(
            copiesRecord[msgSender].bookStatus ==
                Types.BOOK_STATUS.AVAILABLE_FOR_RENT,
            StringsUpgradeable.toString(uint256(Types.ERROR.ALREADY_OWNED))
        );
        _changeRecordStatus(msgSender, Types.BOOK_STATUS.OWNED);
    }

    function rentAgreementCreated(address from, address to)
        external
        onlyRole(RENTOR_ROLE)
    {
        require(
            copiesRecord[from].bookStatus ==
                Types.BOOK_STATUS.AVAILABLE_FOR_RENT,
            StringsUpgradeable.toString(
                uint256(Types.ERROR.NOT_AVAILABLE_FOR_RENT)
            )
        );
        _changeRecordStatus(from, Types.BOOK_STATUS.RENTED);
        _addRecord(
            copiesRecord[from].UID,
            to,
            Types.BOOK_STATUS.READING_ON_RENT
        );
    }

    function rentAgreementDeleted(address from, address to)
        external
        onlyRole(RENTOR_ROLE)
    {
        require(
            copiesRecord[from].bookStatus == Types.BOOK_STATUS.RENTED,
            StringsUpgradeable.toString(uint256(Types.ERROR.NOT_RENTED))
        );
        require(
            copiesRecord[to].bookStatus == Types.BOOK_STATUS.READING_ON_RENT,
            StringsUpgradeable.toString(uint256(Types.ERROR.NOT_RENTED))
        );
        _transferRecord(to, from);
        _changeRecordStatus(from, Types.BOOK_STATUS.AVAILABLE_FOR_RENT);
    }

    // -----------------------------------------
    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControlUpgradeable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
