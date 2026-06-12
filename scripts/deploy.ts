// @ts-nocheck
import pkg from "hardhat";
const { ethers, network } = pkg;

async function main() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  let usdcTokenAddress: string = "0x036CbD53842c5426634e7929541eC2318f3dCF7e"; // Base Sepolia USDC
  const oracleSigner = deployer.address; // Use deployer as the Oracle for now

  // Deploy TestUSDC on local network for testing
  if (network.name === "hardhat" || network.name === "localhost") {
      console.log("Local network detected. Deploying TestUSDC...");
      const TestUSDC = await ethers.getContractFactory("TestUSDC");
      const testUsdc = await TestUSDC.deploy();
      await testUsdc.waitForDeployment();
      usdcTokenAddress = await testUsdc.getAddress();
      console.log("TestUSDC deployed to:", usdcTokenAddress);
  }

  console.log("Using USDC Token Address:", usdcTokenAddress);
  console.log("Using Oracle Signer Address:", oracleSigner);

  const Vault = await ethers.getContractFactory("DailyGrindVault");
  const charityAddress = "0x000000000000000000000000000000000000dEaD"; // Standard burn address for hacked/slashed funds
  const vault = await Vault.deploy(usdcTokenAddress, oracleSigner, charityAddress);

  await vault.waitForDeployment();

  console.log("DailyGrindVault deployed to:", await vault.getAddress());
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
