// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // const Greeter = await hre.ethers.getContractFactory("Greeter");
  // const greeter = await Greeter.deploy("Hello, Hardhat!");

  // await greeter.deployed();

  // console.log("Greeter deployed to:", greeter.address);

  const IERC20_SOURCE = "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20";
  const UNI_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
  const randomAddress = "0x973c877d5636e5cc6e15533ec440d52f299cdf9b";

  //log(`The contract address is ${delta.address}.`);

  //const deltaObject = await ethers.getContractFactory("DeltaInsurancePool");

  //const accounts = await hre.ethers.getSigners();
  //const signer1 = accounts[0];

  // const tx = signer1.sendTransaction({
  //   to: randomAddress,
  //   value: ethers.utils.parseUnits("1.0", 18),
  // });

  const ABI = [
    // Some details about the token
    "function name() view returns (string)",
    "function symbol() view returns (string)",

    // Get the account balance
    "function balanceOf(address) view returns (uint)",

    // Send some of your tokens to someone else
    "function transfer(address to, uint amount)",

    // An event triggered whenever anyone transfers to someone else
    "event Transfer(address indexed from, address indexed to, uint amount)",
  ];

  console.log("check");
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [randomAddress],
  });
  const signer = await ethers.getSigner(randomAddress);

  console.log("check1");
  const provider = new ethers.providers.JsonRpcProvider();
  //const signer = await ethers.provider.getSigner(randomAddress);
  //signer.address = signer._address;
  uniContract = new ethers.Contract(UNI_ADDRESS, ABI, provider);
  console.log("check2");
  uniContractWithSigner = uniContract.connect(signer);

  console.log("check3");
  const uni = ethers.utils.parseUnits("1.0", 18);

  let test = (await uniContract.balanceOf(randomAddress)).toString();
  console.log(test);

  let transfer = uniContractWithSigner.transfer(
    "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
    uni
  );
  console.log(
    `${(
      await uniContract.balanceOf("0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266")
    ).toString()}`
  );
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
