// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
pragma abicoder v2;

import {StorageStructures} from "./StorageStructures.sol";

import {ISuperfluid, ISuperToken, ISuperApp, ISuperAgreement, SuperAppDefinitions} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/superfluid/ISuperfluid.sol";
import {IConstantFlowAgreementV1} from "@superfluid-finance/ethereum-contracts/contracts/interfaces/agreements/IConstantFlowAgreementV1.sol";
import {SuperAppBase} from "@superfluid-finance/ethereum-contracts/contracts/apps/SuperAppBase.sol";

contract eBookRenting is SuperAppBase {
    StorageStructures private _ss;
    ISuperfluid private _host; // host
    IConstantFlowAgreementV1 private _cfa; // the stored constant flow agreement class address
    ISuperToken private _acceptedToken; // accepted token
    bool private _onlyOnce = true;

    struct RenteeRenterPair {
        address renter;
        int256 outflow;
    }
    mapping(uint256 => mapping(address => RenteeRenterPair))
        private rentee_renter_pairs;

    constructor(
        // address StorageStructuresContractAddress,
        ISuperfluid host,
        IConstantFlowAgreementV1 cfa,
        ISuperToken acceptedToken
    ) {
        // _ss = StorageStructures(StorageStructuresContractAddress);

        require(address(host) != address(0), "host is zero address");
        require(address(cfa) != address(0), "cfa is zero address");
        require(
            address(acceptedToken) != address(0),
            "acceptedToken is zero address"
        );

        _host = host;
        _cfa = cfa;
        _acceptedToken = acceptedToken;

        uint256 configWord = SuperAppDefinitions.APP_LEVEL_FINAL |
            SuperAppDefinitions.BEFORE_AGREEMENT_UPDATED_NOOP |
            SuperAppDefinitions.AFTER_AGREEMENT_UPDATED_NOOP |
            SuperAppDefinitions.BEFORE_AGREEMENT_TERMINATED_NOOP;

        _host.registerApp(configWord);
    }

    error BookNotOwnedInShelf(uint256 bookID, address reader);
    error BookNotRentedInShelf(uint256 bookID, address reader);

    modifier ownedInShelf(address msgSender, uint256 bookID) {
        StorageStructures.eBook[] memory readersShelf = _ss.getReadersShelf(
            msg.sender
        );
        for (uint256 i = 0; i < readersShelf.length; i++) {
            if (bookID == readersShelf[i].bookID) {
                if (
                    readersShelf[i].status ==
                    StorageStructures.eBookStatus.OWNED
                ) {
                    _;
                }
                return;
            }
        }
        revert BookNotOwnedInShelf(bookID, msgSender);
    }

    modifier rentedInShelf(address msgSender, uint256 bookID) {
        StorageStructures.eBook[] memory readersShelf = _ss.getReadersShelf(
            msg.sender
        );
        for (uint256 i = 0; i < readersShelf.length; i++) {
            if (bookID == readersShelf[i].bookID) {
                if (
                    readersShelf[i].status ==
                    StorageStructures.eBookStatus.ON_RENT
                ) {
                    _;
                }
                return;
            }
        }
        revert BookNotRentedInShelf(bookID, msgSender);
    }

    function _setSS(address StorageStructuresContractAddress) external {
        require(_onlyOnce, "Unauthorised request!");
        _ss = StorageStructures(StorageStructuresContractAddress);
        _onlyOnce = false;
    }

    function putBookForRent(uint256 bookID)
        external
        ownedInShelf(msg.sender, bookID)
    {
        _ss.addRentor(bookID, msg.sender);
    }

    function removeBookFromRent(uint256 bookID)
        external
        rentedInShelf(msg.sender, bookID)
    {
        _ss.removeRentor(bookID, msg.sender);
    }

    /**************************************************************************
     * SuperApp callbacks
     *************************************************************************/

    function beforeAgreementCreated(
        ISuperToken _superToken,
        address _agreementClass,
        bytes32, // _agreementId,
        bytes calldata, /*_agreementData*/
        bytes calldata _ctx
    )
        external
        view
        override
        onlyExpected(_superToken, _agreementClass)
        onlyHost
        returns (bytes memory newCtx)
    {
        ISuperfluid.Context memory context = _host.decodeCtx(_ctx);
        uint256 bookID = abi.decode(context.userData, (uint256));
        require(_ss.getRentorsCount(bookID) > 0, "Renter not available!");
        newCtx = _ctx;
    }

    function afterAgreementCreated(
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
        (, int96 outFlowRate, , ) = _cfa.getFlow(
            _acceptedToken,
            context.msgSender,
            address(this)
        );
        uint256 bookID = abi.decode(context.userData, (uint256));
        uint256 price = _ss.getBookPrice(bookID) / 2592000;
        if (
            outFlowRate >=
            rentee_renter_pairs[bookID][context.msgSender].outflow +
                (int256(price) / 5)
        ) {
            address renter = _ss.matchRentor(bookID);
            (newCtx, ) = _host.callAgreementWithContext(
                _cfa,
                abi.encodeWithSelector(
                    _cfa.createFlow.selector,
                    _acceptedToken,
                    renter,
                    int256(price) / 5,
                    new bytes(0) // placeholder
                ),
                "0x",
                _ctx
            );
            _ss.addRentedBookToShelf(bookID, renter, context.msgSender);
            rentee_renter_pairs[bookID][context.msgSender].renter = renter;
            rentee_renter_pairs[bookID][context.msgSender]
                .outflow = outFlowRate;
        }
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
        uint256 bookID = abi.decode(context.userData, (uint256));
        uint256 price = _ss.getBookPrice(bookID) / 2592000;
        (newCtx, ) = _host.callAgreementWithContext(
            _cfa,
            abi.encodeWithSelector(
                _cfa.updateFlow.selector,
                _acceptedToken,
                rentee_renter_pairs[bookID][context.msgSender].renter,
                rentee_renter_pairs[bookID][context.msgSender].outflow -
                    int256(price) /
                    5,
                new bytes(0) // placeholder
            ),
            "0x",
            _ctx
        );
        _ss.removeRentedBookFromShelf(
            bookID,
            rentee_renter_pairs[bookID][context.msgSender].renter,
            context.msgSender
        );
        rentee_renter_pairs[bookID][context.msgSender].renter = address(0);
        rentee_renter_pairs[bookID][context.msgSender].outflow =
            rentee_renter_pairs[bookID][context.msgSender].outflow -
            int256(price) /
            5;
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
}
