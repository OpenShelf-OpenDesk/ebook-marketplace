// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

contract eBookPublisher is ERC1155, ReentrancyGuard, EIP712, AccessControl {
    using Counters for Counters.Counter;
    uint256 public immutable _bookID;
    address payable public immutable _author;
    uint256 public _price;
    uint256 private _freeBooksPrinted;
    uint256 private _pricedBooksPrinted;
    uint256 private _freeBooksSupplyLimit = 2;
    int256 private _pricedBooksSupplyLimit; // -1 for unlimited supply
    uint256 private FREE_BOOK_ID = 0;
    Counters.Counter private PRICED_BOOK_ID;

    bytes32 public constant AUTHOR = keccak256("AUTHOR");
    string private constant SIGNING_DOMAIN = "EBook-Voucher";
    string private constant SIGNATURE_VERSION = "1";

    constructor(
        uint256 bookID,
        address author,
        uint256 price,
        string memory eBookURI,
        int256 pricedBooksSupplyLimit
    ) ERC1155(eBookURI) EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
        _bookID = bookID;
        _author = payable(author);
        // _setURI(eBookURI);
        _price = price;
        _pricedBooksSupplyLimit = pricedBooksSupplyLimit;
        _mint(author, FREE_BOOK_ID, 1, "Author's Copy");
        _freeBooksPrinted += 1;
        _setupRole(AUTHOR, payable(author));
    }

    struct eBookVoucher {
        uint256 bookID;
        address studentAddress;
        uint256 price;
        bytes signature;
    }

    modifier withinFreeBookSupplyLimit() {
        require(
            _freeBooksPrinted < _freeBooksSupplyLimit,
            "Free book supply limit reached!!"
        );
        _;
        _freeBooksPrinted += 1;
    }

    modifier withinPricedBookSupplyLimit() {
        if (_pricedBooksSupplyLimit == 0) {
            require(_pricedBooksSupplyLimit != 0, "Sale not yet started!!");
        } else if (_pricedBooksSupplyLimit > 0) {
            require(
                _pricedBooksPrinted < uint256(_pricedBooksSupplyLimit),
                "Priced book supply limit reached!!"
            );
        }
        _;
        _pricedBooksPrinted += 1;
    }

    modifier onlyAuthor() {
        require(msg.sender == _author, "Only the author is privilaged!!");
        _;
    }

    function setFreeBookSupplyLimit(uint256 limit)
        external
        nonReentrant
        onlyAuthor
    {
        require(
            limit > _freeBooksPrinted,
            "Limit cannot be lesser than already supplied books!!"
        );
        _freeBooksSupplyLimit = limit;
    }

    function setPricedBookSupplyLimit(int256 limit)
        external
        nonReentrant
        onlyAuthor
    {
        if (limit != -1) {
            require(
                limit > int256(_pricedBooksPrinted),
                "Invalid supply limit!"
            );
        }
        _pricedBooksSupplyLimit = limit;
    }

    function setPrice(uint256 price) external nonReentrant onlyAuthor {
        _price = price;
    }

    // function printFreeVersion(address to)
    //     external
    //     nonReentrant
    //     onlyAuthor
    //     withinFreeBookSupplyLimit
    // {
    //     _mint(to, FREE_BOOK_ID, 1, "Free Copy");
    // }

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
        uint256 eBookId
    ) public {
        _safeTransferFrom(from, to, eBookId, 1, "");
    }

    // function createFreeBookVoucher() external onlyAuthor

    function getBookURI() external view returns (string memory bookURI) {
        bookURI = uri(_bookID);
    }

    /// @notice Returns a hash of the given eBookVoucher, prepared using EIP712 typed data hashing rules.
    /// @param voucher An eBookVoucher to hash.
    function _hash(eBookVoucher calldata voucher)
        internal
        view
        returns (bytes32)
    {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "eBookVoucher(uint256 bookID,address studentAddress,uint256 price)"
                        ),
                        voucher.bookID,
                        voucher.studentAddress,
                        voucher.price
                    )
                )
            );
    }

    function redeem(address student, eBookVoucher calldata voucher)
        external
        payable
        nonReentrant
        withinFreeBookSupplyLimit
        returns (uint256)
    {
        // make sure signature is valid and get the address of the signer
        address signer = _verify(voucher);

        // make sure that the signer is authorized to mint NFTs
        require(hasRole(AUTHOR, signer), "Signature invalid or unauthorized");
        require(
            voucher.studentAddress == student,
            "Unauthorised redepmtion request"
        );

        // make sure that the redeemer is paying enough to cover the buyer's cost
        require(msg.value >= voucher.price, "Insufficient funds to redeem");

        // first assign the token to the signer, to establish provenance on-chain
        _mint(signer, FREE_BOOK_ID, 1, "Student Copy");

        // transfer the token to the redeemer
        this.transfer(signer, voucher.studentAddress, 0);

        return _bookID;
    }

    /// @notice Returns the chain id of the current blockchain.
    /// @dev This is used to workaround an issue with ganache returning different values from the on-chain chainid() function and
    ///  the eth_chainId RPC method. See https://github.com/protocol/nft-website/issues/121 for context.
    function getChainID() external view returns (uint256) {
        uint256 id;
        assembly {
            id := chainid()
        }
        return id;
    }

    /// @notice Verifies the signature for a given eBookVoucher, returning the address of the signer.
    /// @dev Will revert if the signature is invalid. Does not verify that the signer is authorized to mint NFTs.
    /// @param voucher An eBookVoucher describing an unminted NFT.
    function _verify(eBookVoucher calldata voucher)
        internal
        view
        returns (address)
    {
        bytes32 digest = _hash(voucher);
        return ECDSA.recover(digest, voucher.signature);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(AccessControl, ERC1155)
        returns (bool)
    {
        return
            ERC1155.supportsInterface(interfaceId) ||
            AccessControl.supportsInterface(interfaceId);
    }
}
