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
        LOCKED
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
    mapping(address => uint256[]) private authorsDesk;
    mapping(address => eBook[]) private readersShelf;
    mapping(uint256 => address[]) private buyers;
    mapping(uint256 => address[]) private sellers;

    function getReadersShelf(address _reader)
        external
        view
        returns (eBook[] memory)
    {
        return readersShelf[_reader];
    }

    function setBookStatus(
        address _reader,
        uint256 _bookID,
        eBookStatus _status
    ) external {
        for (uint256 i = 0; i < readersShelf[_reader].length; i++) {
            if (readersShelf[_reader][i].bookID == _bookID) {
                readersShelf[_reader][i].status = _status;
            }
        }
    }

    function addToShelf(address _reader, eBook memory _eBook) external {
        readersShelf[_reader].push(_eBook);
    }

    function getAuthorsDesk(address _author)
        external
        view
        returns (uint256[] memory)
    {
        return authorsDesk[_author];
    }

    function addToDesk(address _author, uint256 _bookID) external {
        authorsDesk[_author].push(_bookID);
    }

    function getBook(uint256 _index) external view returns (Book memory) {
        return books[_index - 1];
    }

    function getAllBooks() external view returns (Book[] memory) {
        return books;
    }

    function addBook(Book memory _book) external {
        books.push(_book);
    }

    function getBuyersCount(uint256 _bookID) external view returns (uint256) {
        return buyers[_bookID].length;
    }

    function getSellersCount(uint256 _bookID) external view returns (uint256) {
        return sellers[_bookID].length;
    }

    function addBuyer(uint256 _bookID, address _buyer) external {
        buyers[_bookID].push(_buyer);
    }

    function addSeller(uint256 _bookID, address _seller) external {
        sellers[_bookID].push(_seller);
    }

    function matchBuyer(uint256 _bookID) external returns (address) {
        address _buyer = buyers[_bookID][0];
        for (uint256 i = 0; i < buyers[_bookID].length - 1; i++) {
            buyers[_bookID][i] = buyers[_bookID][i + 1];
        }
        buyers[_bookID].pop();
        return _buyer;
    }

    function matchSeller(uint256 _bookID) external returns (address) {
        address _seller = sellers[_bookID][0];
        for (uint256 i = 0; i < sellers[_bookID].length - 1; i++) {
            sellers[_bookID][i] = sellers[_bookID][i + 1];
        }
        sellers[_bookID].pop();
        return _seller;
    }

    function executeOrder(
        address _buyer,
        address _seller,
        uint256 _bookID
    ) external {
        for (uint256 i = 0; i < readersShelf[_seller].length; i++) {
            if (readersShelf[_seller][i].bookID == _bookID) {
                eBook memory _eBookOnSale = readersShelf[_seller][i];
                _eBookOnSale.owner = _buyer;
                _eBookOnSale.status = eBookStatus.OWNED;

                readersShelf[_seller][i] = readersShelf[_seller][
                    readersShelf[_seller].length - 1
                ];
                readersShelf[_seller].pop();

                eBookPublisher(this.getBook(_bookID).publisherAddress).transfer(
                        _seller,
                        _buyer,
                        _eBookOnSale.eBookID
                    );
                this.addToShelf(_buyer, _eBookOnSale);
                break;
            }
        }
    }
}
