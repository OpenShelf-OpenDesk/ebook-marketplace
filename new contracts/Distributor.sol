// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "./contracts-upgradeable/proxy/utils/Initializable.sol";
import "./contracts-upgradeable/security/ReentrancyGuardUpgradeable.sol";
import "./contracts-upgradeable/utils/cryptography/draft-EIP712Upgradeable.sol";
import "./contracts-upgradeable/utils/cryptography/ECDSAUpgradeable.sol";
import "./contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import {ISuperToken} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";

import "./Types.sol";
import {Book} from "./Book.sol";
import {Publisher} from "./Publisher.sol";

contract Distributor is
    Initializable,
    ReentrancyGuardUpgradeable,
    EIP712Upgradeable
{
    using Types for Types.book;
    using Types for Types.ERROR;
    using Types for Types.author;
    using SafeMathUpgradeable for uint256;

    // Constants -----------------------------------------
    string private constant SIGNING_DOMAIN = "BOOK-VOUCHER";
    string private constant SIGNATURE_VERSION = "1";
    Publisher private _publisher;

    // Superfluid -----------------------------------------
    ISuperToken private _acceptedToken;

    // Mappings -----------------------------------------

    constructor() initializer {}

    function initialize(ISuperToken acceptedToken, address publisher)
        public
        initializer
    {
        __EIP712_init(SIGNING_DOMAIN, SIGNATURE_VERSION);
        __ReentrancyGuard_init();
        require(
            address(acceptedToken) != address(0),
            StringsUpgradeable.toString(uint256(Types.ERROR.IS_ZERO_ADDRESS))
        );
        _acceptedToken = acceptedToken;
        _publisher = Publisher(publisher);
        _publisher.initializeDistributor();
    }

    // Modifiers -----------------------------------------

    // Private Functions -----------------------------------------
    function _verify(Types.BookVoucher calldata voucher)
        private
        view
        returns (address)
    {
        bytes32 digest = _hash(voucher);
        return ECDSAUpgradeable.recover(digest, voucher.signature);
    }

    function _transferAcceptedToken(
        address sender,
        address to,
        uint256 amount
    ) private nonReentrant {
        if (sender == address(this)) {
            _acceptedToken.transfer(to, amount);
        } else {
            uint256 allowedAcceptedTokenBalance = _acceptedToken.allowance(
                sender,
                address(this)
            );
            require(
                allowedAcceptedTokenBalance >= amount,
                StringsUpgradeable.toString(
                    uint256(Types.ERROR.INSUFFICIENT_SPEND_ALLOWANCE)
                )
            );
            _acceptedToken.transferFrom(sender, to, amount);
        }
    }

    // Public Functions -----------------------------------------
    function purchaseFirstHand(uint256 bookID, bool payViaAcceptedToken)
        external
        payable
        nonReentrant
    {
        Book book = Book(_publisher.getBookAddress(bookID));
        require(
            book.hasNoRole(msg.sender),
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        uint256 price = book.getCurrentPrice();
        if (payViaAcceptedToken) {
            _transferAcceptedToken(msg.sender, address(this), price);
        } else {
            require(
                msg.value >= price,
                StringsUpgradeable.toString(
                    uint256(Types.ERROR.INSUFFICIENT_FUNDS_PROVIDED)
                )
            );
            _acceptedToken.upgrade(msg.value);
        }
        book.addRevenue();
        book.printPricedBook(msg.sender);
        if (!payViaAcceptedToken) {
            payable(msg.sender).transfer(msg.value.sub(price));
        }
    }

    function placeSellOrder(uint256 bookID, bool payementInAcceptedToken)
        external
        nonReentrant
    {
        Book book = Book(_publisher.getBookAddress(bookID));
        require(
            book.hasReaderRole(msg.sender),
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        require(
            book.getBookStatus(msg.sender) == Types.BOOK_STATUS.OWNED,
            StringsUpgradeable.toString(uint256(Types.ERROR.ALREADY_ON_SALE))
        );

        if (payementInAcceptedToken) {
            if (book.getBuyersCount(payementInAcceptedToken) > 0) {
                address buyer = book.executeOrder(
                    msg.sender,
                    false,
                    payementInAcceptedToken
                );
                _transferAcceptedToken(
                    address(this),
                    msg.sender,
                    book.getCopyPrice(msg.sender)
                );
                if (book.getMaxPrice() > book.getCopyPrice(msg.sender)) {
                    _transferAcceptedToken(
                        address(this),
                        buyer,
                        book.getMaxPrice() - book.getCopyPrice(msg.sender)
                    );
                }
            } else {
                book.addSeller(msg.sender, payementInAcceptedToken);
            }
        } else {
            if (book.getBuyersCount(payementInAcceptedToken) > 0) {
                address buyer = book.executeOrder(
                    msg.sender,
                    false,
                    payementInAcceptedToken
                );
                payable(msg.sender).transfer(book.getCopyPrice(msg.sender));
                if (book.getMaxPrice() > book.getCopyPrice(msg.sender)) {
                    payable(buyer).transfer(
                        book.getMaxPrice() - book.getCopyPrice(msg.sender)
                    );
                }
            } else {
                book.addSeller(msg.sender, payementInAcceptedToken);
            }
        }
    }

    function placeBuyOrder(uint256 bookID, bool payementInAcceptedToken)
        external
        payable
        nonReentrant
    {
        Book book = Book(_publisher.getBookAddress(bookID));
        require(
            book.hasNoRole(msg.sender),
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        uint256 price = book.getMaxPrice();
        address seller;
        if (payementInAcceptedToken) {
            _transferAcceptedToken(msg.sender, address(this), price);

            if (book.getSellersCount(payementInAcceptedToken) > 0) {
                seller = book.executeOrder(
                    msg.sender,
                    true,
                    payementInAcceptedToken
                );
                _transferAcceptedToken(
                    address(this),
                    seller,
                    book.getCopyPrice(seller)
                );
                if (book.getMaxPrice() > book.getCopyPrice(seller)) {
                    _transferAcceptedToken(
                        address(this),
                        msg.sender,
                        book.getMaxPrice() - book.getCopyPrice(seller)
                    );
                }
            } else {
                book.addBuyer(msg.sender, payementInAcceptedToken);
            }
        } else {
            require(
                msg.value >= price,
                StringsUpgradeable.toString(
                    uint256(Types.ERROR.INSUFFICIENT_FUNDS_PROVIDED)
                )
            );
            if (book.getSellersCount(payementInAcceptedToken) > 0) {
                seller = book.executeOrder(
                    msg.sender,
                    true,
                    payementInAcceptedToken
                );
                payable(seller).transfer(book.getCopyPrice(seller));
                if (book.getMaxPrice() > book.getCopyPrice(seller)) {
                    payable(msg.sender).transfer(
                        book.getMaxPrice() - book.getCopyPrice(seller)
                    );
                }
            } else {
                book.addBuyer(msg.sender, payementInAcceptedToken);
            }
        }
    }

    function withdrawRevenue(uint256 bookID) external nonReentrant {
        Book book = Book(_publisher.getBookAddress(bookID));
        require(
            book.hasAuthorRole(msg.sender),
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        uint256 withdrawableRevenue = book.getWithdrawableRevenue();
        require(
            withdrawableRevenue > 0,
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        Types.author[] memory authors = book.getAuthors();
        for (uint256 i = 0; i < authors.length; i++) {
            _transferAcceptedToken(
                address(this),
                authors[i].authorAddress,
                (withdrawableRevenue * authors[i].shares) / 100
            );
        }
        book.resetWithdrawableRevenue();
    }

    function _hash(Types.BookVoucher calldata voucher)
        public
        view
        returns (bytes32)
    {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256(
                            "BookVoucher(uint256 bookID,address receiver)"
                        ),
                        voucher.bookID,
                        voucher.receiver
                    )
                )
            );
    }

    function redeem(Types.BookVoucher calldata voucher) external nonReentrant {
        Book book = Book(_publisher.getBookAddress(voucher.bookID));
        require(
            book.hasNoRole(msg.sender),
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        address signer = _verify(voucher);
        require(
            book.minter() == signer,
            StringsUpgradeable.toString(uint256(Types.ERROR.INVALID_SIGNATURE))
        );
        require(
            voucher.receiver == msg.sender,
            StringsUpgradeable.toString(
                uint256(Types.ERROR.INVALID_REDEMPTION_REQUEST)
            )
        );
        book.printFreeBook(voucher.receiver);
    }

    function getChainID() external view returns (uint256 id) {
        id = block.chainid;
        return id;
    }
}
