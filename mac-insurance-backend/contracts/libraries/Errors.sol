//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

library Errors {
    error PoolIdNotCreated();
    error NotEnoughLiquidity();
    error NotEnoughTokenBalance();
    error InsuranceAlreadyRequested();
    error ReimburesementRequirementNotMet();
}
