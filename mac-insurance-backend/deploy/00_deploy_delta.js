module.exports = async ({ getNamedAccounts, deployments }) => {
  {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    const IERC20_SOURCE =
      "@openzeppelin/contracts/token/ERC20/IERC20.sol:IERC20";
    const UNI_ADDRESS = "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984";
    const randomAddress = "0x973c877d5636e5cc6e15533ec440d52f299cdf9b";

    log(`Deploying Delta...`);
    log(`Deployer: ${deployer}`);

    const delta = await deploy("DeltaInsurancePool", {
      from: deployer,
      log: true,
      //ERC20uni, uni-usd price feed
      args: [
        "0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984",
        "0x553303d460EE0afB37EdFf9bE42922D8FF63220e",
      ],
    });

    log(`The contract address is ${delta.address}.`);

    const deltaObject = await ethers.getContractFactory("DeltaInsurancePool");

    const accounts = await hre.ethers.getSigners();
    const signer1 = accounts[0];

    const tx = signer1.sendTransaction({
      to: randomAddress,
      value: ethers.utils.parseUnits("3.0", 18),
    });

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

    console.log("check");
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [randomAddress],
    });
    const signer = await ethers.getSigner(randomAddress);

    const provider = new ethers.providers.JsonRpcProvider();
    //const signer = await ethers.provider.getSigner(randomAddress);
    //signer.address = signer._address;
    uniContract = new ethers.Contract(UNI_ADDRESS, ABI, provider);

    const uniContractWithSigner = uniContract.connect(signer);
    const uniContractWithSigner1 = uniContract.connect(signer1);

    const uni = ethers.utils.parseUnits("3", 18);
    const uni2 = ethers.utils.parseUnits("5", 18);

    const receipt = await uniContractWithSigner.transfer(
      "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266",
      uni
    );
    const receipt1 = await uniContractWithSigner1.approve(delta.address, uni2);

    const deltaContract = new ethers.Contract(
      delta.address,
      deltaObject.interface,
      signer1
    );

    const priceFeed = await deltaContract.getLatestPrice();

    const txInit = await deltaContract.initPool(3, 3);

    const txSupply = await deltaContract.supplyPool(0, uni);

    log(`This is the price feed ${priceFeed}`);
  }
};
