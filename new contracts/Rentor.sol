// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.4;

import "./contracts-upgradeable/proxy/utils/Initializable.sol";
import "./contracts-upgradeable/utils/CountersUpgradeable.sol";
import "./contracts-upgradeable/utils/StringsUpgradeable.sol";

import {ISuperfluid, ISuperToken, ISuperApp, ISuperAgreement, SuperAppDefinitions} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {SuperAppBase} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

import "./Types.sol";
import {Book} from "./Book.sol";
import {Publisher} from "./Publisher.sol";

contract Rentor is Initializable, SuperAppBase {
    using Types for Types.book;
    using Types for Types.ERROR;

    // Storage Variables -----------------------------------------
    // mapping(address => uint256) private flowRecords;
    mapping(uint256 => address[]) private rentors;
    mapping(uint256 => mapping(address => address)) private renteeRentorPair;
    mapping(address => int96) private flowBalances;
    mapping(address => uint256[]) private rentedBooksRecord;

    Publisher private _publisher;

    // Superfluid -----------------------------------------
    ISuperfluid private _host;
    IConstantFlowAgreementV1 private _cfa;
    ISuperToken private _acceptedToken;

    // Constants -----------------------------------------
    uint8 private rentingPercentage = 20; // perMonth Basis

    constructor() initializer {}

    function initialize(
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        ISuperToken acceptedToken,
        address publisher
    ) public initializer {
        _publisher = Publisher(publisher);
        require(
            address(host) != address(0),
            StringsUpgradeable.toString(uint256(Types.ERROR.IS_ZERO_ADDRESS))
        );
        require(
            address(cfa) != address(0),
            StringsUpgradeable.toString(uint256(Types.ERROR.IS_ZERO_ADDRESS))
        );
        require(
            address(acceptedToken) != address(0),
            StringsUpgradeable.toString(uint256(Types.ERROR.IS_ZERO_ADDRESS))
        );
        _host = host;
        _cfa = cfa;
        _acceptedToken = acceptedToken;

        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL |
            SuperAppDefinitions.BEFORE_AGREEMENT_CREATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

        _host.registerApp(configWord);
    }

    // modifier -----------------------------------------
    modifier flowExists(address msgSender) {
        require(
            flowBalances[msgSender] > 0,
            StringsUpgradeable.toString(
                uint256(Types.ERROR.FLOW_DOES_NOT_EXIST)
            )
        );
        _;
    }

    modifier onlyHost() {
        require(
            msg.sender == address(_host),
            "RedirectAll: support only one host"
        );
        _;
    }

    modifier onlyExpected(ISuperToken superToken, address agreementClass) {
        require(_isSameToken(superToken), "RedirectAll: not accepted token");
        require(_isCFAv1(agreementClass), "RedirectAll: only CFAv1 supported");
        _;
    }

    // Private -----------------------------------------
    function _addRentor(uint256 bookID, address rentor) private {
        rentors[bookID].push(rentor);
    }

    function _removeRentor(uint256 bookID, address rentor) private {
        for (uint256 i = 0; i < rentors[bookID].length; i++) {
            if (rentors[bookID][i] == rentor) {
                for (uint256 j = i; j < rentors[bookID].length - 1; j++) {
                    rentors[bookID][j] = rentors[bookID][j + 1];
                }
                delete rentors[bookID][rentors[bookID].length - 1];
                break;
            }
        }
    }

    function _deleteRentedBookRecord(address reader, uint256 bookID) private {
        for (uint256 i = 0; i < rentedBooksRecord[reader].length; i++) {
            if (rentedBooksRecord[reader][i] == bookID) {
                for (
                    uint256 j = i;
                    j < rentedBooksRecord[reader].length - 1;
                    j++
                ) {
                    rentedBooksRecord[reader][j] = rentedBooksRecord[reader][
                        j + 1
                    ];
                }
                delete rentedBooksRecord[reader][
                    rentedBooksRecord[reader].length - 1
                ];
                break;
            }
        }
    }

    function _calculateFlowRate(uint256 price) private view returns (int256) {
        return (int256(price * rentingPercentage) / 100) / 2592000;
    }

    function _updateFlowFromContract(address to, int256 flowRate) private {
        _host.callAgreement(
            _cfa,
            abi.encodeWithSelector(
                _cfa.updateFlow.selector,
                _acceptedToken,
                to,
                flowRate,
                new bytes(0)
            ),
            "0x"
        );
    }

    function _deleteFlowFromContract(address to) private {
        _host.callAgreement(
            _cfa,
            abi.encodeWithSelector(
                _cfa.deleteFlow.selector,
                _acceptedToken,
                address(this),
                to,
                new bytes(0) // placeholder
            ),
            "0x"
        );
    }

    function _createFlowFromAgreement(address to, int96 flowRate) private {
        _host.callAgreement(
            _cfa,
            abi.encodeWithSelector(
                _cfa.createFlow.selector,
                _acceptedToken,
                to,
                flowRate,
                new bytes(0) // placeholder
            ),
            "0x"
        );
    }

    function _getFlowFromContract(address msgSender)
        private
        view
        returns (int96)
    {
        (, int96 outFlowRate, , ) = _cfa.getFlow(
            _acceptedToken,
            address(this),
            msgSender
        );
        return outFlowRate;
    }

    function _returnAllBooksOnRent(address msgSender) private {
        for (uint256 i = 0; i < rentedBooksRecord[msgSender].length; i++) {
            uint256 bookID = rentedBooksRecord[msgSender][i];
            address rentor = renteeRentorPair[bookID][msgSender];
            Book book = Book(_publisher.getBookAddress(bookID));
            int256 requiredFlow = _calculateFlowRate(book.getCopyPrice(rentor));
            int96 outFlowRateToRentor = _getFlowFromContract(rentor);
            _updateFlowFromContract(rentor, outFlowRateToRentor - requiredFlow);
            book.rentAgreementDeleted(rentor, msgSender);
            _addRentor(bookID, rentor);
            delete renteeRentorPair[bookID][msgSender];
        }
    }

    function _isSameToken(ISuperToken superToken) private view returns (bool) {
        return address(superToken) == address(_acceptedToken);
    }

    function _isCFAv1(address agreementClass) private view returns (bool) {
        return
            ISuperAgreement(agreementClass).agreementType() ==
            keccak256(
                "org.superfluid-finance.agreements.ConstantFlowAgreement.v1"
            );
    }

    // Public -----------------------------------------
    function setAvailableForRent(uint256 bookID) external {
        Book book = Book(_publisher.getBookAddress(bookID));
        require(
            book.hasReaderRole(msg.sender),
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        book.setAvailableForRent(msg.sender);
        _addRentor(bookID, msg.sender);
    }

    function setUnavailableForRent(uint256 bookID) external {
        Book book = Book(_publisher.getBookAddress(bookID));
        require(
            book.hasReaderRole(msg.sender),
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        book.setUnavailableForRent(msg.sender);
        _removeRentor(bookID, msg.sender);
    }

    function getRentorsCount(uint256 bookID) public view returns (uint256) {
        return rentors[bookID].length;
    }

    function takeBookOnRent(uint256 bookID) external flowExists(msg.sender) {
        Book book = Book(_publisher.getBookAddress(bookID));
        require(
            book.hasNoRole(msg.sender),
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        require(
            _publisher.getBookAddress(bookID) != address(0),
            StringsUpgradeable.toString(uint256(Types.ERROR.INVALID_BOOK_ID))
        );
        require(
            getRentorsCount(bookID) > 0,
            StringsUpgradeable.toString(
                uint256(Types.ERROR.NOT_AVAILABLE_FOR_RENT)
            )
        );
        int96 outFlowRateToMsgSender = _getFlowFromContract(msg.sender);
        // from contract to msg.sender
        int256 requiredFlow = _calculateFlowRate(
            book.getCopyPrice(rentors[bookID][0])
        );
        require(
            outFlowRateToMsgSender >= requiredFlow,
            StringsUpgradeable.toString(
                uint256(Types.ERROR.INSUFFICIENT_FLOW_BALANCE)
            )
        );
        _updateFlowFromContract(
            msg.sender,
            outFlowRateToMsgSender - requiredFlow
        );
        book.rentAgreementCreated(rentors[bookID][0], msg.sender);
        rentedBooksRecord[msg.sender].push(bookID);
        // from contract to rentor
        int96 outFlowRateToRentor = _getFlowFromContract(rentors[bookID][0]);
        renteeRentorPair[bookID][msg.sender] = rentors[bookID][0];
        _updateFlowFromContract(
            rentors[bookID][0],
            outFlowRateToRentor + requiredFlow
        );
        _removeRentor(bookID, rentors[bookID][0]);
    }

    function returnBookOnRent(address msgSender, uint256 bookID)
        external
        flowExists(msg.sender)
    {
        Book book = Book(_publisher.getBookAddress(bookID));
        require(
            book.hasReaderRole(msg.sender),
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        require(
            book.getBookStatus(msg.sender) == Types.BOOK_STATUS.READING_ON_RENT,
            StringsUpgradeable.toString(uint256(Types.ERROR.PERMISSION_DENIED))
        );
        // from contract to rentor
        address rentor = renteeRentorPair[bookID][msgSender];
        int256 requiredFlow = _calculateFlowRate(book.getCopyPrice(rentor));
        int96 outFlowRateToRentor = _getFlowFromContract(rentor);
        _updateFlowFromContract(rentor, outFlowRateToRentor - requiredFlow);
        book.rentAgreementDeleted(rentor, msgSender);
        _addRentor(bookID, rentor);
        delete renteeRentorPair[bookID][msgSender];
        // from contract to msg.Sender
        _deleteRentedBookRecord(msg.sender, bookID);
        int96 outFlowRateToMsgSender = _getFlowFromContract(msg.sender);
        _updateFlowFromContract(
            msg.sender,
            outFlowRateToMsgSender + requiredFlow
        );
    }

    // Super Agreement Callbacks -----------------------------------------

    function afterAgreementCreated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, // _agreementId,
        bytes calldata, /*_agreementData*/
        bytes calldata, /*_cbdata*/
        bytes calldata _ctx
    )
        external
        override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory newCtx)
    {
        ISuperfluid.Context memory context = _host.decodeCtx(_ctx);
        (, int96 inFlowRate, , ) = _cfa.getFlow(
            _acceptedToken,
            context.msgSender,
            address(this)
        );
        flowBalances[context.msgSender] = inFlowRate;
        _createFlowFromAgreement(context.msgSender, inFlowRate);
        newCtx = _ctx;
    }

    function afterAgreementUpdated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, // _agreementId,
        bytes calldata, /*_agreementData*/
        bytes calldata, /*_cbdata*/
        bytes calldata _ctx
    )
        external
        override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory newCtx)
    {
        ISuperfluid.Context memory context = _host.decodeCtx(_ctx);
        (, int96 inFlowRate, , ) = _cfa.getFlow(
            _acceptedToken,
            context.msgSender,
            address(this)
        );
        if (inFlowRate > _getFlowFromContract(context.msgSender)) {
            _updateFlowFromContract(context.msgSender, inFlowRate);
        } else {
            _deleteFlowFromContract(context.msgSender);
            _returnAllBooksOnRent(context.msgSender);
            _createFlowFromAgreement(context.msgSender, inFlowRate);
        }
        flowBalances[context.msgSender] = inFlowRate;
        newCtx = _ctx;
    }

    function afterAgreementTerminated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, // _agreementId,
        bytes calldata, /*_agreementData*/
        bytes calldata, // _cbdata,
        bytes calldata _ctx
    )
        external
        override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory newCtx)
    {
        ISuperfluid.Context memory context = _host.decodeCtx(_ctx);
        _deleteFlowFromContract(context.msgSender);
        _returnAllBooksOnRent(context.msgSender);
        newCtx = _ctx;
    }
}
