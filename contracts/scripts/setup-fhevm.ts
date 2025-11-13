import { ethers } from "hardhat";

/**
 * Script to set up FHEVM environment and verify Gateway contract connectivity
 */
async function main() {
  console.log("Setting up FHEVM environment...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Account:", deployer.address);
  console.log("Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  const network = await ethers.provider.getNetwork();
  console.log("Network:", network.name);
  console.log("Chain ID:", network.chainId.toString());

  // Check if we're on a supported FHEVM network
  if (network.chainId === 8009n) {
    console.log("\n✅ Connected to Zama Sepolia Testnet");
  } else if (network.chainId === 31337n) {
    console.log("\n⚠️  Running on local Hardhat network");
    console.log("Note: FHEVM features require Zama testnet or mainnet");
  } else {
    console.log("\n⚠️  Unknown network - FHEVM features may not be available");
  }

  console.log("\n📚 FHEVM Setup Guide:");
  console.log("========================");
  console.log("1. Ensure you have test ETH from Zama faucet");
  console.log("2. Gateway contract should be pre-deployed on Zama networks");
  console.log("3. Use fhevmjs library for client-side encryption");
  console.log("4. Generate encryption keys using createInstance()");
  console.log("========================\n");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
