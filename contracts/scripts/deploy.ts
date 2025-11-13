import { ethers } from "hardhat";

async function main() {
  console.log("Starting deployment of Confidential NFT Marketplace...\n");

  const [deployer] = await ethers.getSigners();
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

  // Deploy ConfidentialNFT
  console.log("Deploying ConfidentialNFT...");
  const ConfidentialNFT = await ethers.getContractFactory("ConfidentialNFT");
  const nft = await ConfidentialNFT.deploy();
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("✅ ConfidentialNFT deployed to:", nftAddress);

  // Deploy ConfidentialAuction
  console.log("\nDeploying ConfidentialAuction...");
  const ConfidentialAuction = await ethers.getContractFactory("ConfidentialAuction");
  const auction = await ConfidentialAuction.deploy();
  await auction.waitForDeployment();
  const auctionAddress = await auction.getAddress();
  console.log("✅ ConfidentialAuction deployed to:", auctionAddress);

  // Save deployment addresses
  console.log("\n📝 Deployment Summary:");
  console.log("========================");
  console.log("Network:", (await ethers.provider.getNetwork()).name);
  console.log("Chain ID:", (await ethers.provider.getNetwork()).chainId);
  console.log("ConfidentialNFT:", nftAddress);
  console.log("ConfidentialAuction:", auctionAddress);
  console.log("========================\n");

  // Save addresses to file
  const fs = require("fs");
  const deploymentInfo = {
    network: (await ethers.provider.getNetwork()).name,
    chainId: (await ethers.provider.getNetwork()).chainId.toString(),
    contracts: {
      ConfidentialNFT: nftAddress,
      ConfidentialAuction: auctionAddress,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const deploymentPath = `./deployments/${(await ethers.provider.getNetwork()).chainId}.json`;
  fs.mkdirSync("./deployments", { recursive: true });
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log("💾 Deployment info saved to:", deploymentPath);

  // Verification instructions
  console.log("\n📋 To verify contracts on Etherscan, run:");
  console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${nftAddress}`);
  console.log(`npx hardhat verify --network ${(await ethers.provider.getNetwork()).name} ${auctionAddress}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
