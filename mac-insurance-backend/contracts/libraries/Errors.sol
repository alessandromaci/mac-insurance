//SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

library Errors {
    error PoolIdNotCreated();
    error NotEnoughInsuranceLiquidity();
    error NotEnoughTokenBalance();
    error InsuranceAlreadyRequested();
    error ReimburesementRequirementNotMet();
    error EndDateEarlierThanStartDate();
    error InsuranceInActivePeriod();
}
