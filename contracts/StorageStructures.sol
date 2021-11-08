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

    function getReadersShelf(address _index)
        external
        view
        returns (eBook[] memory)
    {
        return readersShelf[_index];
    }

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
        return books[_index-1];
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
        onSale[_bookID].push(_eBook);
    }
}
