// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

contract StorageStructures {
    enum eBookStatus {
        OWNED,
        ON_SALE,
        LOCKED
    }

    struct Book {
        string uri;
        address author;
        address contractAddress;
    }

    struct eBook {
        uint256 bookID;
        uint256 eBookID;
        uint256 price;
        address owner;
        eBookStatus status;
    }

    mapping(address => uint256[]) internal authorsDesk;
    Book[] private books;
    mapping(address => eBook[]) private readersShelf;
    mapping(uint256 => eBook[]) public onSale;

    function getReadersShelf(address _index)
        public
        view
        returns (eBook[] memory)
    {
        return readersShelf[_index];
    }

    function addToShelf(address _reader, eBook memory _eBook) public {
        readersShelf[_reader].push(_eBook);
    }

    function getAuthorsDesk(address _index)
        public
        view
        returns (uint256[] memory)
    {
        return authorsDesk[_index];
    }

    function addToDesk(address _author, uint256 _bookID) public {
        authorsDesk[_author].push(_bookID);
    }

    function getBook(uint256 _index) public view returns (Book memory) {
        return books[_index];
    }

    function getAllBooks() public view returns (Book[] memory) {
        return books;
    }

    function addBook(Book memory _book) public {
        books.push(_book);
    }

    function getOnSale(uint256 _index) public view returns (eBook[] memory) {
        return onSale[_index];
    }

    function addToOnSale(uint256 _bookID, eBook memory _eBook) public {
        onSale[_bookID].push(_eBook);
    }
}
