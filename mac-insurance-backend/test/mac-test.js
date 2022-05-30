const { expect, assert } = require("chai");
const { ethers } = require("hardhat");

describe("MacInsurance", function () {
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
    const macInterface = await ethers.getContractFactory("MacInsuranceMain");
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

    const uniSmall = ethers.utils.parseUnits("1", 18);
    const uniMedium = ethers.utils.parseUnits("5", 18);
    const uniLarge = ethers.utils.parseUnits("9", 18);

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
  it("Should return that a new pool is created with the right inputs", async function () {
    const macInterface = await ethers.getContractFactory("MacInsuranceMain");
    const macContract = await macInterface.deploy();

    const account = await ethers.getSigners();
    const signer = account[0];

    const macContractSigner = await new ethers.Contract(
      macContract.address,
      macInterface.interface,
      signer
    );

    const txInitPool = await macContractSigner.initPool(
      UNI_ADDRESS,
      UNI_ADDRESS_priceFeed,
      10,
      3,
      1,
      100
    );

    const txInitPool1 = await macContractSigner.initPool(
      UNI_ADDRESS,
      UNI_ADDRESS_priceFeed,
      16,
      6,
      1,
      100
    );

    const poolDetail = await macContractSigner.poolDataList(0);
    const poolDetail1 = await macContractSigner.poolDataList(1);

    expect(poolDetail[3]).to.equal(10);
    expect(poolDetail[6]).to.equal(3);
    expect(poolDetail1[3]).to.equal(16);
    expect(poolDetail1[6]).to.equal(6);
  });
  it("Should be possible to supply fresh insurance to a pool ", async function () {
    const macInterface = await ethers.getContractFactory("MacInsuranceMain");
    const macContract = await macInterface.deploy();

    const account = await ethers.getSigners();
    const signer = account[0];
    const whaleSigner = await ethers.getSigner(randomAddress);

    const macContractSigner = await new ethers.Contract(
      macContract.address,
      macInterface.interface,
      signer
    );

    const uniContractWithSigner = uniContract.connect(signer);

    const oneDay = 24 * 60 * 60;
    const oneYear = oneDay * 365;

    const txInitPool = await macContractSigner.initPool(
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      "0x553303d460ee0afb37edff9be42922d8ff63220e",
      10,
      3,
      oneDay,
      oneYear
    );

    const receipt1 = await uniContractWithSigner.approve(
      macContract.address,
      uniLarge
    );

    const txSupply = await macContract.supplyPool(0, uniSmall);

    const poolDetail = await macContractSigner.poolDataList(0);
    expect(poolDetail[2]).to.equal(uniSmall);
  });
  it("Should not be possible to supply a pool that doesn't exist", async function () {
    const macInterface = await ethers.getContractFactory("MacInsuranceMain");
    const macContract = await macInterface.deploy();

    const account = await ethers.getSigners();
    const signer = account[0];
    const whaleSigner = await ethers.getSigner(randomAddress);

    const macContractSigner = await new ethers.Contract(
      macContract.address,
      macInterface.interface,
      signer
    );

    const uniContractWithSigner = uniContract.connect(signer);

    const oneDay = 24 * 60 * 60;
    const oneYear = oneDay * 365;

    const txInitPool = await macContractSigner.initPool(
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      "0x553303d460ee0afb37edff9be42922d8ff63220e",
      10,
      3,
      oneDay,
      oneYear
    );

    const receipt1 = await uniContractWithSigner.approve(
      macContract.address,
      uniLarge
    );

    try {
      await macContract.supplyPool(5, uniSmall);
      assert.fail("The transaction should have thrown an error");
    } catch (error) {
      assert.include(error.message, "PoolIdNotExist()");
    }
  });
  it("Should be possible to request a pool insurance", async function () {
    const macInterface = await ethers.getContractFactory("MacInsuranceMain");
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
    const oneYear = oneDay * 365;

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

    const txSupply = await macContract.supplyPool(0, uniMedium);

    const txRequest = await macContract.requestInsurance(0, uniSmall);
    const txRequest1 = await macContractUser.requestInsurance(0, uniSmall);

    const poolDetail = await macContractSigner.insuranceRequests(
      0,
      signer.address
    );
    const poolDetail1 = await macContractSigner.insuranceRequests(
      0,
      user.address
    );

    expect(poolDetail[2]).to.equal(uniSmall);
    expect(poolDetail1[2]).to.equal(uniSmall);
  });
  it("Should not be possible to request a pool insurance during insurance validity period", async function () {
    const macInterface = await ethers.getContractFactory("MacInsuranceMain");
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
    const sevenDays = 7 * 24 * 60 * 60;
    const oneYear = oneDay * 365;

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

    const txSupply = await macContract.supplyPool(0, uniMedium);

    await ethers.provider.send("evm_increaseTime", [sevenDays]);
    await ethers.provider.send("evm_mine");

    try {
      await macContract.requestInsurance(0, uniSmall);
      assert.fail("The transaction should have thrown an error");
    } catch (error) {
      assert.include(error.message, "InsuranceInActivePeriod()");
    }
  });
  it("Should not be possible to withdraw liquidty from a pool insurance during insurance validity period", async function () {
    const macInterface = await ethers.getContractFactory("MacInsuranceMain");
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
    const sevenDays = 7 * 24 * 60 * 60;
    const oneYear = oneDay * 365;

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

    const txSupply = await macContract.supplyPool(0, uniMedium);

    await ethers.provider.send("evm_increaseTime", [sevenDays]);
    await ethers.provider.send("evm_mine");

    try {
      await macContract.withdrawPool(0);
      assert.fail("The transaction should have thrown an error");
    } catch (error) {
      assert.include(error.message, "InsuranceInActivePeriod()");
    }
  });
  it("Should not be possible to withdraw twice", async function () {
    const macInterface = await ethers.getContractFactory("MacInsuranceMain");
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
    const sevenDays = 7 * 24 * 60 * 60;
    const oneYear = oneDay * 365;
    const twoYears = 2 * oneYear;

    const txInitPool = await macContractSigner.initPool(
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      "0x553303d460ee0afb37edff9be42922d8ff63220e",
      10,
      3,
      sevenDays,
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

    const txSupply = await macContractUser.supplyPool(0, uniMedium);

    await ethers.provider.send("evm_increaseTime", [twoYears]);
    await ethers.provider.send("evm_mine");

    const txWithdraw1 = await macContractUser.withdrawPool(0);

    try {
      await macContractUser.withdrawPool(0);
      assert.fail("The transaction should have thrown an error");
    } catch (error) {
      assert.include(error.message, "LiquidtyAlreadyWithdrawn()");
    }
  });
  it("Should be possible to withdraw liquidty from a pool insurance after insurance validity period", async function () {
    const macInterface = await ethers.getContractFactory("MacInsuranceMain");
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
    const sevenDays = 7 * 24 * 60 * 60;
    const oneYear = oneDay * 365;
    const twoYears = 2 * oneYear;

    const txInitPool = await macContractSigner.initPool(
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      "0x553303d460ee0afb37edff9be42922d8ff63220e",
      10,
      3,
      sevenDays,
      oneYear
    );

    await uniContractWithSigner.approve(macContract.address, uniLarge);
    await uniContractWithUser.approve(macContract.address, uniLarge);

    await macContractUser.supplyPool(0, uniMedium);
    await macContract.supplyPool(0, uniMedium);

    await ethers.provider.send("evm_increaseTime", [twoYears]);
    await ethers.provider.send("evm_mine");

    const balanceBeforeWithdraw = await uniContractWithUser.balanceOf(
      user.address
    );
    const txWithdraw1 = await macContractUser.withdrawPool(0);
    const balanceAfterWithdraw = await uniContractWithUser.balanceOf(
      user.address
    );
    assert.equal(
      balanceAfterWithdraw.sub(balanceBeforeWithdraw).toString(),
      uniMedium.toString()
    );
  });
  it("Should not be possible to withdraw liquidty from a pool insurance before insurance validity period", async function () {
    const macInterface = await ethers.getContractFactory("MacInsuranceMain");
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
    const sevenDays = 7 * 24 * 60 * 60;
    const oneYear = oneDay * 365;
    const twoYears = 2 * oneYear;

    const txInitPool = await macContractSigner.initPool(
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      "0x553303d460ee0afb37edff9be42922d8ff63220e",
      10,
      3,
      sevenDays,
      oneYear
    );

    await uniContractWithSigner.approve(macContract.address, uniLarge);
    await uniContractWithUser.approve(macContract.address, uniLarge);

    await macContractUser.supplyPool(0, uniMedium);
    await macContract.supplyPool(0, uniMedium);

    try {
      await macContractUser.withdrawPool(0);
      assert.fail("The transaction should have thrown an error");
    } catch (error) {
      assert.include(error.message, "InsuranceInActivePeriod()");
    }
  });
  it("Should not be possible to request withdraw if you are not the owner", async function () {
    const macInterface = await ethers.getContractFactory("MacInsuranceMain");
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
    const sevenDays = 7 * 24 * 60 * 60;
    const oneYear = oneDay * 365;
    const twoYears = 2 * oneYear;

    const txInitPool = await macContractSigner.initPool(
      "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
      "0x553303d460ee0afb37edff9be42922d8ff63220e",
      10,
      3,
      sevenDays,
      oneYear
    );

    await uniContractWithSigner.approve(macContract.address, uniLarge);
    await uniContractWithUser.approve(macContract.address, uniLarge);

    await macContract.supplyPool(0, uniMedium);

    await ethers.provider.send("evm_increaseTime", [oneDay]);
    await ethers.provider.send("evm_mine");

    try {
      await macContractUser.withdrawPool(0);
      assert.fail("The transaction should have thrown an error");
    } catch (error) {
      assert.include(error.message, "RequesterUnauthorized()");
    }
  });
});
