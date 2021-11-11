// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

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
        string bookURI;
        address owner;
        eBookStatus status;
    }

    Book[] private books;
    mapping(address => uint256[]) private authorsDesk;
    mapping(address => eBook[]) private readersShelf;
    mapping(uint256 => eBook[]) private onSale;

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

    // function getReadersShelfCount(address _reader)
    //     external
    //     view
    //     returns (uint)
    // {
    //     return readersShelf[_reader].length;
    // }

    // function getBookInReadersShelf(address _reader, uint at)
    //     external
    //     view
    //     returns (eBook memory)
    // {
    //     return readersShelf[_reader][at];
    // }

    function addToShelf(address _reader, eBook memory _eBook) external {
        readersShelf[_reader].push(_eBook);
    }

    function getAuthorsDesk(address _index)
        external
        view
        returns (uint256[] memory)
    {
        return authorsDesk[_index];
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

    function getOnSale(uint256 _index) external view returns (eBook[] memory) {
        return onSale[_index];
    }

    function addToOnSale(uint256 _bookID, eBook memory _eBook) external {
        _eBook.status = eBookStatus.ON_SALE;
        onSale[_bookID].push(_eBook);
    }

    function removeFromOnSale(uint256 _bookID) external {
        onSale[_bookID].pop();
    }

    function transferBook(
        address _from,
        address _to,
        eBook memory _eBookOnSale
    ) external {
        for (uint256 i = 0; i < readersShelf[_from].length; i++) {
            if (readersShelf[_from][i].bookID == _eBookOnSale.bookID) {
                readersShelf[_from][i] = readersShelf[_from][
                    readersShelf[_from].length - 1
                ];
                delete readersShelf[_from][readersShelf[_from].length - 1];
                break;
            }
        }
        _eBookOnSale.owner = _to;
        _eBookOnSale.status = eBookStatus.OWNED;
        this.addToShelf(_to, _eBookOnSale);
    }
}
