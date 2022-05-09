const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MacInsurance", function () {
  const IERC20_SOURCE = "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20";
  const UNI_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
  // uni-usd price feed
  const UNI_ADDRESS_priceFeed = "0x553303d460EE0afB37EdFf9bE42922D8FF63220e";
  const randomAddress = "0x973c877d5636e5cc6e15533ec440d52f299cdf9b";

  const ABI = [
    // Some details about the token
    "function name() view returns (string)",
    "function symbol() view returns (string)",

    // Get the account balance
    "function balanceOf(address) view returns (uint)",

    // Send some of your tokens to someone else
    "function transfer(address to, uint amount)",
    "function approve(address to, uint amount)",

    // An event triggered whenever anyone transfers to someone else
    "event Transfer(address indexed from, address indexed to, uint amount)",
  ];

  beforeEach((async) => {
    const macInterface = await ethers.getContractFactory("MacInsuranceMain");
    const macContract = await macInterface.deploy();

    const account = await ethers.getSigners();
    const signer = account[0];

    const macContractSigner = await new ethers.Contract(
      macContract.address,
      macInterface,
      signer
    );

    // transferring some funds to the uni whale for transaction
    const tx = signer.sendTransaction({
      to: randomAddress,
      value: ethers.utils.parseUnits("2", 18),
    });
  });
  it("Should return that a new pool was created with the right inputs", async function () {
    const txInitPool = await macContractSigner.initPool();
    expect(await greeter.greet()).to.equal("Hello, world!");

    const setGreetingTx = await greeter.setGreeting("Hola, mundo!");

    // wait until the transaction is mined
    await setGreetingTx.wait();

    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});
