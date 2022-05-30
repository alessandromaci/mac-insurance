//SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import {DataTypes} from "./libraries/DataTypes.sol";
import {Errors} from "./libraries/Errors.sol";
import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract MacInsuranceMain {
    uint16 public id;
    address tokenAddress;
    AggregatorV3Interface internal priceFeed;
    IERC20 internal insuredToken;

    mapping(uint16 => DataTypes.PoolData) public poolDataList;
    mapping(uint16 => mapping(address => DataTypes.PoolLiquiditySupply))
        public liquiditySupplyList;
    mapping(uint16 => mapping(address => DataTypes.InsuranceRequest))
        public insuranceRequests;

    event PoolUpdated(
        uint16 poolId,
        address tokenAddress,
        int256 basePrice,
        int256 tresholdPrice,
        uint8 fee,
        uint256 liquidityAdded,
        uint256 startDate,
        uint256 endDate
    );

    event InsuranceRequestCreated(
        uint16 poolId,
        address tokenAddress,
        address insuranceRequester,
        uint256 liquidtyToInsure,
        uint256 fee
    );

    constructor() {
        id = 0;
    }

    function getLatestPrice() internal view returns (int256) {
        (
            ,
            /*uint80 roundID*/
            int256 price, /*uint startedAt*/ /*uint timeStamp*/ /*uint80 answeredInRound*/
            ,
            ,

        ) = priceFeed.latestRoundData();
        return price;
    }

    function getUserFee(uint16 _id, uint256 _amount)
        public
        view
        returns (uint256)
    {
        uint256 totalLiquidity = poolDataList[_id].totalLiquidity;
        uint16 fee = poolDataList[_id].fee;
        uint256 f = (totalLiquidity * uint256(fee)) / 100;

        // userFee = (amountToInsure / TVL) * max fee
        uint256 userFee = (_amount * f) / totalLiquidity;
        return userFee;
    }

    function getReimbursement(uint16 _id, uint256 _amount)
        public
        view
        returns (uint256)
    {
        // step1: calculate the 20% amount
        //amount - (amount / 100 * loss cover)
        //step2:
        //(amount - step1) * amount / step1
        uint256 priceLossCover = poolDataList[_id].priceLossCover;
        uint256 priceDiff = _amount - ((_amount / 100) * priceLossCover);
        uint256 reimbursementAmount = ((_amount - priceDiff) * _amount) /
            priceDiff;
        return reimbursementAmount;
    }

    function initPool(
        address _tokenAddress,
        address _priceFeed,
        int256 _insuranceLossCoverage,
        uint8 _fee,
        uint256 _startDateFromDeployInSeconds,
        uint256 _endDateFromDeployInSeconds
    ) public returns (DataTypes.PoolData memory) {
        // initiating the required variable for the ERC20 transfers
        priceFeed = AggregatorV3Interface(_priceFeed);
        insuredToken = IERC20(_tokenAddress);
        tokenAddress = _tokenAddress;

        // time inputs created and checck that start date is not later than future
        uint256 startDate = block.timestamp +
            _startDateFromDeployInSeconds *
            1 seconds;
        uint256 endDate = block.timestamp +
            _endDateFromDeployInSeconds *
            1 seconds;
        if (endDate <= startDate) {
            revert Errors.EndDateEarlierThanStartDate();
        }

        DataTypes.PoolData memory pool;
        // retrieving the token price from the oracle
        int256 tokenPrice = getLatestPrice();
        int256 insuranceTreshold = tokenPrice -
            ((tokenPrice / 100) * _insuranceLossCoverage);

        pool.id = id;
        pool.tokenAddress = tokenAddress;
        pool.priceLossCover = uint256(_insuranceLossCoverage);
        pool.basePrice = tokenPrice;
        pool.insuranceTreshold = insuranceTreshold;
        pool.fee = _fee;
        pool.startDate = startDate;
        pool.endDate = endDate;

        // make the pool traceable by adding it in the mapping
        poolDataList[id] = pool;

        emit PoolUpdated(
            id,
            tokenAddress,
            tokenPrice,
            insuranceTreshold,
            _fee,
            0,
            startDate,
            endDate
        );

        // the id is increased by one after success
        id += 1;
        return (pool);
    }

    function supplyPool(uint16 _id, uint256 _amount) public returns (uint256) {
        if (_id > id) {
            revert Errors.PoolIdNotExist();
        }

        if (block.timestamp >= poolDataList[_id].startDate) {
            revert Errors.InsuranceInActivePeriod();
        }

        DataTypes.PoolLiquiditySupply memory poolSupply;

        //transfering insured token to this contract and TVL updated
        bool success = insuredToken.transferFrom(
            msg.sender,
            address(this),
            _amount
        );
        if (success) {
            poolDataList[_id].totalLiquidity += _amount;
        } else {
            revert Errors.TransferFailed();
        }

        poolSupply.id = _id;
        poolSupply.liquidityProvider = msg.sender;
        poolSupply.liquidityAdded = _amount;

        liquiditySupplyList[_id][msg.sender] = poolSupply;

        emit PoolUpdated(
            _id,
            poolDataList[_id].tokenAddress,
            poolDataList[_id].basePrice,
            poolDataList[_id].insuranceTreshold,
            poolDataList[_id].fee,
            poolDataList[_id].totalLiquidity,
            poolDataList[_id].startDate,
            poolDataList[_id].endDate
        );

        return (poolDataList[_id].totalLiquidity);
    }

    function withdrawPool(uint16 _id) public {
        if (_id > id) {
            revert Errors.PoolIdNotExist();
        }

        if (
            liquiditySupplyList[_id][msg.sender].liquidityProvider != msg.sender
        ) {
            revert Errors.RequesterUnauthorized();
        }

        if (block.timestamp <= poolDataList[_id].endDate) {
            revert Errors.InsuranceInActivePeriod();
        }

        if (liquiditySupplyList[_id][msg.sender].liquidityWithdrawn == true) {
            revert Errors.LiquidtyAlreadyWithdrawn();
        }

        uint256 withdrawAmount = liquiditySupplyList[_id][msg.sender]
            .liquidityAdded;

        bool success = insuredToken.transferFrom(
            address(this),
            msg.sender,
            withdrawAmount
        );
        if (success) {
            poolDataList[_id].totalLiquidity -= withdrawAmount;
        } else {
            revert Errors.TransferFailed();
        }

        // check that he hasn't withdrawn yet
        liquiditySupplyList[_id][msg.sender].liquidityWithdrawn = true;

        emit PoolUpdated(
            _id,
            poolDataList[_id].tokenAddress,
            poolDataList[_id].basePrice,
            poolDataList[_id].insuranceTreshold,
            poolDataList[_id].fee,
            poolDataList[_id].totalLiquidity,
            poolDataList[_id].startDate,
            poolDataList[_id].endDate
        );
    }

    function requestInsurance(uint16 _id, uint256 _amount) public {
        uint256 totalLiquidity = poolDataList[_id].totalLiquidity;

        if (block.timestamp >= poolDataList[_id].startDate) {
            revert Errors.InsuranceInActivePeriod();
        }

        uint256 tokenBalance = insuredToken.balanceOf(msg.sender);
        if (tokenBalance < _amount) {
            revert Errors.NotEnoughTokenBalance();
        }

        if (insuranceRequests[_id][msg.sender].liquidtyToInsure != 0) {
            revert Errors.InsuranceAlreadyRequested();
        }

        DataTypes.InsuranceRequest memory insuranceRequest;

        // calculating the fee and reimbursement amount
        uint256 feeAmount = getUserFee(_id, _amount);
        uint256 reimbursementAmount = getReimbursement(_id, _amount);
        if (reimbursementAmount > totalLiquidity) {
            revert Errors.NotEnoughInsuranceLiquidity();
        }

        bool success = insuredToken.transferFrom(
            msg.sender,
            address(this),
            feeAmount
        );

        if (!success) {
            revert Errors.TransferFailed();
        }

        insuranceRequest.id = _id;
        insuranceRequest.insuranceRequester = msg.sender;
        insuranceRequest.liquidtyToInsure = _amount;
        insuranceRequest.reimbursementAmount = reimbursementAmount;
        insuranceRequest.fee = feeAmount;

        insuranceRequests[_id][msg.sender] = insuranceRequest;

        emit InsuranceRequestCreated(
            _id,
            poolDataList[_id].tokenAddress,
            msg.sender,
            _amount,
            feeAmount
        );
    }

    function requestReimbursement(uint16 _id) public {
        if (
            block.timestamp <= poolDataList[_id].startDate ||
            block.timestamp > poolDataList[_id].endDate
        ) {
            revert Errors.InsuranceInActivePeriod();
        }

        if (
            insuranceRequests[_id][msg.sender].insuranceRequester != msg.sender
        ) {
            revert Errors.RequesterUnauthorized();
        }

        if (insuranceRequests[_id][msg.sender].reimbursementReceived == true) {
            revert Errors.ReimburesementAlreadyReceived();
        }

        int256 tokenPrice = getLatestPrice();
        if (tokenPrice > poolDataList[_id].insuranceTreshold) {
            revert Errors.ReimburesementRequirementNotMet();
        }

        uint256 reimbursementAmount = insuranceRequests[_id][msg.sender]
            .reimbursementAmount;
        bool success = insuredToken.transferFrom(
            address(this),
            msg.sender,
            reimbursementAmount
        );
        if (success) {
            insuranceRequests[_id][msg.sender].liquidtyToInsure = 0;
            insuranceRequests[_id][msg.sender].reimbursementReceived = true;
        } else {
            revert Errors.TransferFailed();
        }
    }
}
