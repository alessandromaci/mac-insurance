//SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

import {DataTypes} from "./libraries/DataTypes.sol";
import {Errors} from "./libraries/Errors.sol";
import "hardhat/console.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract DeltaInsurancePool {
    uint16 internal id = 0;
    address tokenAddress;
    AggregatorV3Interface internal priceFeed;
    IERC20 internal insuredToken;

    mapping(uint16 => DataTypes.PoolData) public poolDataList;
    mapping(uint16 => DataTypes.PoolLiquiditySupply) public liquiditySupplyList;
    mapping(uint16 => mapping(address => DataTypes.InsuranceRequest))
        public insuranceRequests;

    event PoolCreated(
        uint16 poolId,
        address tokenAddress,
        address owner,
        int256 basePrice,
        int256 tresholdPrice,
        uint startDate, 
        uint endDate
    );
    event PoolLiquidityAdded(
        uint16 poolId,
        address tokenAddress,
        address liquidityProvider,
        uint256 liquidityAdded
    );
    event InsuranceRequestCreated(
        uint16 poolId,
        address tokenAddress,
        address insuranceRequester,
        uint256 liquidtyToInsure,
        uint128 fee
    );

    // maybe best to move this inputs in the init pool functions so that we avoid everytime to deploy a new contract
    constructor(address _tokenAddress, address _priceFeed) {
        priceFeed = AggregatorV3Interface(_priceFeed);
        insuredToken = IERC20(_tokenAddress);
        tokenAddress = _tokenAddress;
    }

    function getLatestPrice() public view returns (int256) {
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
        internal
        view
        returns (uint256)
    {
        uint256 totalLiquidity = poolDataList[_id].totalLiquidity;
        uint16 fee = poolDataList[_id].fee;
        uint256 f = totalLiquidity / uint256(fee);

        // userFee = (amountToInsure / TVL) * max fee
        uint256 userFee = (_amount / totalLiquidity) / f;
        return userFee;
    }

    function getReimbursement(uint16 _id, uint256 _amount)
        internal
        view
        returns (uint256)
    {
        uint256 priceLossCover = poolDataList[_id].priceLossCover;
        int256 insuranceTreshold = poolDataList[_id].insuranceTreshold;
        uint256 reimbursementAmount = (_amount / priceLossCover) /
            uint256(insuranceTreshold);
        return reimbursementAmount;
    }

    function initPool(int256 _insuranceLossCoverage, uint8 _fee, uint32 _startDateFromDeployInDays, uint32 _endDateFromDeployInDays)
        public
        returns (DataTypes.PoolData memory)
    {       
        uint startDate = block.timestamp + _startDateFromDeployInDays * 1 days;
        uint endDate = block.timestamp + _endDateFromDeployInDays * 1 days;

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

        emit PoolCreated(
            id,
            tokenAddress,
            msg.sender,
            tokenPrice,
            insuranceTreshold, 
            startDate,
            endDate
        );

        // the id is increased by one after success
        id += 1;
        return (pool);
    }

    function supplyPool(uint16 _id, uint256 _amount) public returns (uint256) {
        if (_id > id) {
            revert Errors.PoolIdNotCreated();
        }

        if (block.timestamp <= poolDataList[_id].startDate) {
            revert Errors.InsuranceInActivePeriod();
        }

        DataTypes.PoolLiquiditySupply memory poolSupply;

        //transfering insured token to this contract and TVL updated
        insuredToken.transferFrom(msg.sender, address(this), _amount);
        poolDataList[_id].totalLiquidity += _amount;

        poolSupply.id = _id;
        poolSupply.liquidityProvider = msg.sender;
        poolSupply.liquidityAdded = _amount;

        liquiditySupplyList[_id] = poolSupply;

        emit PoolLiquidityAdded(_id, tokenAddress, msg.sender, _amount);

        return (poolDataList[_id].totalLiquidity);
    }

    function requestInsurance(uint16 _id, uint32 _amount) public {
        uint256 totalLiquidity = poolDataList[_id].totalLiquidity;
        if (_amount > totalLiquidity) {
            revert Errors.NotEnoughLiquidity();
        }

        if (block.timestamp <= poolDataList[_id].startDate) {
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
        insuredToken.transferFrom(msg.sender, address(this), feeAmount);

        insuranceRequest.id = _id;
        insuranceRequest.insuranceRequester = msg.sender;
        insuranceRequest.liquidtyToInsure = _amount;
        insuranceRequest.reimbursementAmount = reimbursementAmount;
        insuranceRequest.fee = feeAmount;

        insuranceRequests[_id][msg.sender] = insuranceRequest;
    }

    function requestReimbursement(uint16 _id) public {
        int256 tokenPrice = getLatestPrice();
        if (tokenPrice < poolDataList[_id].insuranceTreshold) {
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
        }
    }
}
