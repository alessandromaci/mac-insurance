const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("TestMacInsurance", function () {
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

  const uniSmall = ethers.utils.parseUnits("1", 18);
  const uniMedium = ethers.utils.parseUnits("5", 18);
  const uniLarge = ethers.utils.parseUnits("9", 18);

  beforeEach(async () => {
    const macInterface = await ethers.getContractFactory(
      "Test_MacInsuranceMain"
    );

    const macContract = await macInterface.deploy();

    const account = await ethers.getSigners();
    const signer = account[0];
    const user = account[1];

    const macContractSigner = await new ethers.Contract(
      macContract.address,
      macInterface.interface,
      signer
    );

    // transferring some funds to the uni whale for transaction
    const tx = signer.sendTransaction({
      to: randomAddress,
      value: ethers.utils.parseUnits("2", 18),
    });

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [randomAddress],
    });
    const whaleSigner = await ethers.getSigner(randomAddress);

    const provider = new ethers.providers.JsonRpcProvider();
    //const signer = await ethers.provider.getSigner(randomAddress);
    //signer.address = signer._address;
    uniContract = new ethers.Contract(UNI_ADDRESS, ABI, provider);

    const uniContractWithSigner = uniContract.connect(signer);
    const uniContractWithWhaleSigner = uniContract.connect(whaleSigner);

    const receipt = await uniContractWithWhaleSigner.transfer(
      "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      uniLarge
    );
    const receipt1 = await uniContractWithWhaleSigner.transfer(
      user.address,
      uniLarge
    );
    const receipt2 = await uniContractWithWhaleSigner.approve(
      macContract.address,
      uniLarge
    );
  });
  it("Testing simulation: should be possible to request a reimbursement and receive the expected amount", async function () {
    const macInterface = await ethers.getContractFactory(
      "Test_MacInsuranceMain"
    );
    const macContract = await macInterface.deploy();

    const account = await ethers.getSigners();
    const signer = account[0];
    const user = account[1];

    const macContractSigner = await new ethers.Contract(
      macContract.address,
      macInterface.interface,
      signer
    );

    const uniContractWithSigner = uniContract.connect(signer);
    const uniContractWithUser = uniContract.connect(user);

    const macContractUser = macContract.connect(user);

    const oneDay = 24 * 60 * 60;
    const halfDay = oneDay / 2;
    const oneYear = oneDay * 365;

    //step 1: create an insurance request with profile "signer"
    const txInitPool = await macContractSigner.initPool(
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      "0x553303d460ee0afb37edff9be42922d8ff63220e",
      10,
      3,
      oneDay,
      oneYear
    );

    const receipt = await uniContractWithSigner.approve(
      macContract.address,
      uniLarge
    );

    const receipt1 = await uniContractWithUser.approve(
      macContract.address,
      uniLarge
    );

    // step 2: supply the insurance request with the required amount of funds
    const txSupply = await macContract.supplyPool(0, uniMedium);

    // step 3: time passes
    await ethers.provider.send("evm_increaseTime", [halfDay]);
    await ethers.provider.send("evm_mine");

    const balanceContractBefore = await uniContractWithSigner.balanceOf(
      macContractUser.address
    );

    // step 4: user apply for an insurance request
    const txRequest = await macContractUser.requestInsurance(0, uniSmall);
    const insuranceRequestDetail = await macContractUser.insuranceRequests(
      0,
      user.address
    );

    const balanceContractAfter = await uniContractWithSigner.balanceOf(
      macContractUser.address
    );

    const reimbursementAmount = `${insuranceRequestDetail[3].toString()}`;
    const feeAmount = `${insuranceRequestDetail[4].toString()}`;

    const balanceUserBefore = await uniContractWithUser.balanceOf(user.address);
    console.log(balanceUserBefore);

    // step 5: time passes and we simulate a price change
    await ethers.provider.send("evm_increaseTime", [oneDay]);
    await ethers.provider.send("evm_mine");
    const txPriceChange = await macContract.updatePriceToken(600000000);

    // step 6: user requests a reimbursement and receives the expected amount
    const txReimbursement = await macContractUser.requestReimbursement(0);

    const balanceUserAfter = await uniContractWithUser.balanceOf(user.address);
    console.log(balanceUserAfter);

    const balanceDifference = `${balanceUserAfter
      .sub(balanceUserBefore)
      .toString()}`;

    const balanceContractDifference = `${balanceContractAfter
      .sub(balanceContractBefore)
      .toString()}`;

    // step 7: calculating that what the user has is the sum of what it used to have + the reimbursement amount
    expect(balanceDifference).to.equal(reimbursementAmount);
    expect(balanceContractDifference).to.equal(feeAmount);
  });
});
