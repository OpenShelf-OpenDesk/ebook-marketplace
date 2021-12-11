// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;
import "./eBookPublisher.sol";

contract StorageStructures {
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
    mapping(address => eBook[]) private _readersShelf;
    mapping(uint256 => address[]) private _buyers;
    mapping(uint256 => address[]) private _sellers;
    mapping(uint256 => address[]) private _rentors;

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

    function addToDesk(address _author, uint256 bookID) external {
        _authorsDesk[_author].push(bookID);
    }

    function getBook(uint256 _index) external view returns (Book memory) {
        return books[_index - 1];
    }

    // function getEBookFromReadersShelf(uint256 _index) external view returns (eBook memory) {
    //     return books[_index - 1];
    // }

    function getAllBooks() external view returns (Book[] memory) {
        return books;
    }

    function addBook(Book memory _book) external {
        books.push(_book);
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

    function addRentor(uint256 bookID, address rentor) external {
        _rentors[bookID].push(rentor);
        this.setBookStatus(rentor, bookID, eBookStatus.RENTED);
    }

    function matchRentor(uint256 bookID) external returns (address) {
        address rentor = _rentors[bookID][0];
        for (uint256 i = 0; i < _rentors[bookID].length - 1; i++) {
            _rentors[bookID][i] = _rentors[bookID][i + 1];
        }
        _rentors[bookID].pop();
        return rentor;
    }

    function redeemStudentBookVoucher(
        eBookPublisher.eBookVoucher calldata voucher
    ) external {
        Book memory book = this.getBook(voucher.bookID);
        eBookPublisher publisher = eBookPublisher(book.publisherAddress);
        publisher.redeem(msg.sender, voucher);
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

    // -------------------------------------------------------------------------

    error BookNotOwnedInShelf(uint256 bookID, address reader);

    modifier ownedInShelf(address msgSender, uint256 bookID) {
        for (uint256 i = 0; i < _readersShelf[msgSender].length; i++) {
            if (bookID == _readersShelf[msgSender][i].bookID) {
                if (_readersShelf[msgSender][i].status == eBookStatus.OWNED) {
                    _;
                }
                return;
            }
        }
        revert BookNotOwnedInShelf(bookID, msgSender);
    }
}
