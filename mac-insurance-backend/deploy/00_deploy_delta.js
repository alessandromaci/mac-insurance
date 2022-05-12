module.exports = async ({ getNamedAccounts, deployments }) => {
  {
    const { deploy, log } = deployments;
    const { deployer } = await getNamedAccounts();

    log(`Deploying Mac...`);
    log(`Deployer: ${deployer}`);

    const mac = await deploy("MacInsuranceMain", {
      from: deployer,
      log: true,
    });

    log(`The contract address is ${mac.address}.`);

    log(`Deploying Test Mac...`);

    const testMac = await deploy("Test_MacInsuranceMain", {
      from: deployer,
      log: true,
    });

    log(`The test contract address is ${testMac.address}.`);
  }
};
