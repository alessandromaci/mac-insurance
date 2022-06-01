//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

library Errors {
    error PoolIdNotExist();
    error NotEnoughInsuranceLiquidity();
    error NotEnoughTokenBalance();
    error InsuranceAlreadyRequested();
    error ReimburesementRequirementNotMet();
    error EndDateEarlierThanStartDate();
    error InsuranceInActivePeriod();
    error LiquidtyAlreadyWithdrawn();
    error ReimburesementAlreadyReceived();
    error TransferFailed();
    error RequesterUnauthorized();
}
