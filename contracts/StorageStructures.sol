// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import {eBookPublisher, Counters} from "./eBookPublisher.sol";
import {eBookDonator} from "./eBookDonator.sol";

// import {ISuperfluid, ISuperToken, ISuperApp, ISuperAgreement, SuperAppDefinitions} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
// import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
// import {eBookRenter} from "./eBookRenter.sol";
import {eBookRenting} from "./eBookRenting.sol";

contract StorageStructures {

    // ISuperfluid private _host; // host
    // IConstantFlowAgreementV1 private _cfa; // the stored constant flow agreement class address
    // ISuperToken private _acceptedToken; // accepted token

    struct Book {
        string metadataURI;
        address author;
        uint256 price;
        address publisherAddress;
    }

    enum eBookStatus {
        OWNED,
        ON_SALE,
        LOCKED,
        ON_RENT,
        RENTED_ON_RENT,
        RENTED
    }

    struct eBook {
        uint256 bookID;
        uint256 eBookID;
        uint256 price;
        string metadataURI;
        address owner;
        eBookStatus status;
    }

    Book[] private books;
    mapping(address => uint256[]) private _authorsDesk;
    mapping(address => mapping(uint256 => uint256)) private _authorsRevenue;
    mapping(address => eBook[]) private _readersShelf;
    mapping(uint256 => address[]) private _buyers;
    mapping(uint256 => address[]) private _sellers;
    mapping(uint256 => address[]) private _rentors;
    // mapping(uint256 => address) private _rentingContracts;

    eBookDonator private _donator;
    eBookRenting private _renter;

    constructor(
        // ISuperfluid host,
        // IConstantFlowAgreementV1 cfa,
        // ISuperToken acceptedToken,
        address donatorAddress,
        address renterAddress
        ) {
        // require(address(host) != address(0), "host is zero address");
        // require(address(cfa) != address(0), "cfa is zero address");
        // require(
        //     address(acceptedToken) != address(0),
        //     "acceptedToken is zero address"
        // );

        // _host = host;
        // _cfa = cfa;
        // _acceptedToken = acceptedToken;
        _donator = eBookDonator(donatorAddress);
        _renter = eBookRenting(renterAddress);
        _renter._setSS(address(this));
    }

    // function getHost()external view returns (ISuperfluid){
    //     return _host;
    // }

    // function getCFA()external view returns (IConstantFlowAgreementV1){
    //     return _cfa;
    // }

    // function getAcceptedToken()external view returns (ISuperToken){
    //     return _acceptedToken;
    // }

    function getReadersShelf(address _reader)
        external
        view
        returns (eBook[] memory)
    {
        return _readersShelf[_reader];
    }

    function setBookStatus(
        address _reader,
        uint256 bookID,
        eBookStatus _status
    ) external {
        for (uint256 i = 0; i < _readersShelf[_reader].length; i++) {
            if (_readersShelf[_reader][i].bookID == bookID) {
                _readersShelf[_reader][i].status = _status;
            }
        }
    }

    function addToShelf(address _reader, eBook memory _eBook) external {
        _readersShelf[_reader].push(_eBook);
    }

    function getAuthorsDesk(address author)
        external
        view
        returns (Book[] memory)
    {
        Book[] memory authorsPublishedBooks = new Book[](
            _authorsDesk[author].length
        );
        uint256[] memory booksAddress = _authorsDesk[author];
        for (uint256 i = 0; i < booksAddress.length; i++) {
            Book memory book = this.getBook(booksAddress[i]);
            authorsPublishedBooks[i] = book;
        }
        return authorsPublishedBooks;
    }

    function addToDesk(address author, uint256 bookID) external {
        _authorsDesk[author].push(bookID);
    }

    function getBook(uint256 bookID) external view returns (Book memory) {
        return books[bookID - 1];
    }

    function getAllBooks() external view returns (Book[] memory) {
        return books;
    }

    function addBook(Book memory book) external {
        books.push(book);
        // eBookRenter renter = new eBookRenter(books.length, book.price, _host, _cfa, _acceptedToken, address(this));
        // _rentingContracts[books.length] = address(renter);
    }

    function getBookPrice(uint256 bookID) external view returns(uint256) {
        return this.getBook(bookID).price;
    }

    function getBuyersCount(uint256 bookID) external view returns (uint256) {
        return _buyers[bookID].length;
    }

    function getSellersCount(uint256 bookID) external view returns (uint256) {
        return _sellers[bookID].length;
    }

    function addBuyer(uint256 bookID, address buyer) external {
        _buyers[bookID].push(buyer);
    }

    function addSeller(uint256 bookID, address seller) external {
        _sellers[bookID].push(seller);
    }

    function matchBuyer(uint256 bookID) external returns (address) {
        address buyer = _buyers[bookID][0];
        for (uint256 i = 0; i < _buyers[bookID].length - 1; i++) {
            _buyers[bookID][i] = _buyers[bookID][i + 1];
        }
        _buyers[bookID].pop();
        return buyer;
    }

    function matchSeller(uint256 bookID) external returns (address) {
        address seller = _sellers[bookID][0];
        for (uint256 i = 0; i < _sellers[bookID].length - 1; i++) {
            _sellers[bookID][i] = _sellers[bookID][i + 1];
        }
        _sellers[bookID].pop();
        return seller;
    }

    function executeOrder(
        address buyer,
        address seller,
        uint256 bookID
    ) external {
        for (uint256 i = 0; i < _readersShelf[seller].length; i++) {
            if (_readersShelf[seller][i].bookID == bookID) {
                eBook memory eBookOnSale = _readersShelf[seller][i];
                eBookOnSale.owner = buyer;
                eBookOnSale.status = eBookStatus.OWNED;

                _readersShelf[seller][i] = _readersShelf[seller][
                    _readersShelf[seller].length - 1
                ];
                _readersShelf[seller].pop();

                eBookPublisher(this.getBook(bookID).publisherAddress).transfer(
                    seller,
                    buyer,
                    eBookOnSale.eBookID
                );
                this.addToShelf(buyer, eBookOnSale);
                break;
            }
        }
    }

    function getBookURI(uint256 bookID)
        public
        view
        returns (string memory bookURI)
    {
        eBook[] memory readerEBooks = _readersShelf[msg.sender];
        for (uint256 i = 0; i < readerEBooks.length; i++) {
            if (readerEBooks[i].bookID == bookID) {
                require(
                    readerEBooks[i].owner == address(msg.sender),
                    "Only owner can access the book!!"
                );
                Book memory book = this.getBook(bookID);
                eBookPublisher publisher = eBookPublisher(
                    book.publisherAddress
                );
                bookURI = publisher.getBookURI();
            }
        }
    }

    function getRentorsCount(uint256 bookID) external view returns (uint256) {
        return _rentors[bookID].length;
    }

    modifier onlyRenter(address msgSender){
        require(msgSender == address(_renter), "Unauthorized request!");
        _;
    }

    function addRentor(uint256 bookID, address rentor) external onlyRenter(msg.sender){
        _rentors[bookID].push(rentor);
        this.setBookStatus(rentor, bookID, eBookStatus.ON_RENT);
    }

    function removeRentor(uint256 bookID, address rentor) external onlyRenter(msg.sender) {
        for (uint256 i = 0; i < _rentors[bookID].length - 1; i++) {
            _rentors[bookID][i] = _rentors[bookID][i + 1];
        }
        _rentors[bookID].pop();
        this.setBookStatus(rentor, bookID, eBookStatus.OWNED);
    }

    function matchRentor(uint256 bookID) external onlyRenter(msg.sender) returns (address) {
        address rentor = _rentors[bookID][0];
        for (uint256 i = 0; i < _rentors[bookID].length - 1; i++) {
            _rentors[bookID][i] = _rentors[bookID][i + 1];
        }
        _rentors[bookID].pop();
        return rentor;
    }

    error VoucherAlreadyReedeemed(uint256 bookID, address reader);

    function redeemStudentBookVoucher(
        eBookDonator.eBookVoucher calldata voucher
    ) external {
        Book memory book = this.getBook(voucher.bookID);
        for (uint256 i = 0; i < _readersShelf[msg.sender].length; i++) {
            if (voucher.bookID == _readersShelf[msg.sender][i].bookID) {
                revert VoucherAlreadyReedeemed(voucher.bookID, msg.sender);
            }
        }
        _donator.redeem(book.publisherAddress, msg.sender, voucher);
        this.addToShelf(
            msg.sender,
            eBook(
                voucher.bookID,
                0,
                voucher.price,
                book.metadataURI,
                msg.sender,
                eBookStatus.LOCKED
            )
        );
    }

    function getPublisherAddress(uint256 bookID)
        external
        view
        returns (address)
    {
        return this.getBook(bookID).publisherAddress;
    }

    function getDonatorAddress() external view returns (address) {
        return address(_donator);
    }

    function getRenterAddress() external view returns (address) {
        return address(_renter);
    }

    function getPricedBooksPrinted(uint256 bookID)
        external
        view
        returns (uint256)
    {
        Book memory book = this.getBook(bookID);
        eBookPublisher publisher = eBookPublisher(book.publisherAddress);
        return publisher.getPricedBooksPrinted();
    }

    function getFreeBooksPrinted(uint256 bookID)
        external
        view
        returns (uint256)
    {
        Book memory book = this.getBook(bookID);
        eBookPublisher publisher = eBookPublisher(book.publisherAddress);
        return publisher.getFreeBooksPrinted();
    }

    function addToAuthorsRevenue(
        address author,
        uint256 bookID,
        uint256 revenue
    ) external {
        _authorsRevenue[author][bookID] =
            _authorsRevenue[author][bookID] +
            revenue;
    }

    function getAuthorsRevenueForBook(uint256 bookID)
        external
        view
        returns (uint256)
    {
        return _authorsRevenue[msg.sender][bookID];
    }

    function addRentedBookToShelf(
        uint256 bookID,
        address renter,
        address rentee
    ) external {
        eBook[] memory rentersEBooks = _readersShelf[renter];
        for (uint256 i = 0; i < rentersEBooks.length; i++) {
            if (rentersEBooks[i].bookID == bookID) {
                if (rentersEBooks[i].status == eBookStatus.ON_RENT) {
                    eBook memory renteesEBook = rentersEBooks[i];
                    renteesEBook.status = eBookStatus.RENTED;
                    this.addToShelf(rentee, renteesEBook);
                    rentersEBooks[i].status == eBookStatus.RENTED_ON_RENT;
                }
            }
        }
    }

    function removeRentedBookFromShelf(
        uint256 bookID,
        address renter,
        address rentee
    ) external {
        for (uint256 i = 0; i < _readersShelf[rentee].length; i++) {
            if (_readersShelf[rentee][i].bookID == bookID) {
                _readersShelf[rentee][i] = _readersShelf[rentee][
                    _readersShelf[rentee].length - 1
                ];
                _readersShelf[rentee].pop();
                _rentors[bookID].push(renter);
                this.setBookStatus(renter, bookID, eBookStatus.ON_RENT);
            }
        }
    }

    // -------------------------------------------------------------------------

    // error BookNotOwnedInShelf(uint256 bookID, address reader);

    // modifier ownedInShelf(address msgSender, uint256 bookID) {
    //     for (uint256 i = 0; i < _readersShelf[msgSender].length; i++) {
    //         if (bookID == _readersShelf[msgSender][i].bookID) {
    //             if (_readersShelf[msgSender][i].status == eBookStatus.OWNED) {
    //                 _;
    //             }
    //             return;
    //         }
    //     }
    //     revert BookNotOwnedInShelf(bookID, msgSender);
    // }
}
