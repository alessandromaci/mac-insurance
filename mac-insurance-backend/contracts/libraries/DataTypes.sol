//SPDX-License-Identifier: MIT

pragma solidity ^0.8.10;

library DataTypes {
    struct PoolData {
        // id of the pool
        uint16 id;
        // the address token used
        address tokenAddress;
        // total liquidity locked in the pool by investor
        uint256 totalLiquidity;
        //percentage of price loss cover
        uint256 priceLossCover;
        // token price when the liquidity was supplied
        int256 basePrice;
        // token price treshold. Beyond this price, the insurer will pay the price difference between token price and treshold
        int256 insuranceTreshold;
        // the percentage of fee to require this pool insurance
        uint8 fee;
        // beginning of insurance active period
        uint startDate;
        // end of insurance active period
        uint endDate;
    }

    struct PoolLiquiditySupply {
        // id of the pool
        uint16 id;
        // investor who supplied liquidity
        address liquidityProvider;
        // token amount invested in the insurance pool
        uint256 liquidityAdded;
        // boolean value to register when user has withdrawn liquidity
        bool liquidityWithdrawn;
    }

    struct InsuranceRequest {
        // id of the pool
        uint16 id;
        // investor who requested insurance
        address insuranceRequester;
        // token amount to be insured
        uint256 liquidtyToInsure;
        // token amount paid to the insured when the insurance conditions are met
        uint256 reimbursementAmount;
        // token amount paid to the providers for the insurance
        uint256 fee;
    }
}
