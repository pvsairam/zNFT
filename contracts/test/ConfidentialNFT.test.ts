import { expect } from "chai";
import { ethers } from "hardhat";
import { ConfidentialNFT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("ConfidentialNFT", function () {
  let nft: ConfidentialNFT;
  let owner: SignerWithAddress;
  let user1: SignerWithAddress;
  let user2: SignerWithAddress;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const ConfidentialNFT = await ethers.getContractFactory("ConfidentialNFT");
    nft = await ConfidentialNFT.deploy();
    await nft.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the correct name and symbol", async function () {
      expect(await nft.name()).to.equal("ConfidentialNFT");
      expect(await nft.symbol()).to.equal("CNFT");
    });

    it("Should set the correct owner", async function () {
      expect(await nft.owner()).to.equal(owner.address);
    });
  });

  describe("Minting", function () {
    it("Should mint a new NFT", async function () {
      const tokenURI = "ipfs://QmTest123";

      await expect(nft.connect(user1).mint(user1.address, tokenURI))
        .to.emit(nft, "NFTMinted")
        .withArgs(0, user1.address, tokenURI);

      expect(await nft.ownerOf(0)).to.equal(user1.address);
      expect(await nft.tokenURI(0)).to.equal(tokenURI);
      expect(await nft.getCreator(0)).to.equal(user1.address);
    });

    it("Should increment token IDs correctly", async function () {
      await nft.connect(user1).mint(user1.address, "ipfs://token1");
      await nft.connect(user2).mint(user2.address, "ipfs://token2");

      expect(await nft.ownerOf(0)).to.equal(user1.address);
      expect(await nft.ownerOf(1)).to.equal(user2.address);
      expect(await nft.totalSupply()).to.equal(2);
    });

    it("Should allow minting to a different address", async function () {
      await nft.connect(user1).mint(user2.address, "ipfs://token1");

      expect(await nft.ownerOf(0)).to.equal(user2.address);
      expect(await nft.getCreator(0)).to.equal(user1.address);
    });
  });

  describe("Auction Status", function () {
    beforeEach(async function () {
      await nft.connect(user1).mint(user1.address, "ipfs://token1");
    });

    it("Should allow token owner to set auction status", async function () {
      await expect(nft.connect(user1).setTokenAuctionStatus(0, true))
        .to.emit(nft, "TokenAuctionStatusChanged")
        .withArgs(0, true);

      expect(await nft.isTokenInAuction(0)).to.equal(true);
    });

    it("Should allow contract owner to set auction status", async function () {
      await expect(nft.connect(owner).setTokenAuctionStatus(0, true))
        .to.emit(nft, "TokenAuctionStatusChanged")
        .withArgs(0, true);

      expect(await nft.isTokenInAuction(0)).to.equal(true);
    });

    it("Should not allow non-owner to set auction status", async function () {
      await expect(
        nft.connect(user2).setTokenAuctionStatus(0, true)
      ).to.be.revertedWith("Only token owner or contract owner can change auction status");
    });

    it("Should toggle auction status", async function () {
      await nft.connect(user1).setTokenAuctionStatus(0, true);
      expect(await nft.isTokenInAuction(0)).to.equal(true);

      await nft.connect(user1).setTokenAuctionStatus(0, false);
      expect(await nft.isTokenInAuction(0)).to.equal(false);
    });
  });

  describe("Token URI", function () {
    it("Should return correct token URI", async function () {
      const tokenURI = "ipfs://QmTestURI123";
      await nft.connect(user1).mint(user1.address, tokenURI);

      expect(await nft.tokenURI(0)).to.equal(tokenURI);
    });

    it("Should revert for non-existent token", async function () {
      await expect(nft.tokenURI(999)).to.be.reverted;
    });
  });

  describe("Total Supply", function () {
    it("Should return correct total supply", async function () {
      expect(await nft.totalSupply()).to.equal(0);

      await nft.connect(user1).mint(user1.address, "ipfs://token1");
      expect(await nft.totalSupply()).to.equal(1);

      await nft.connect(user2).mint(user2.address, "ipfs://token2");
      expect(await nft.totalSupply()).to.equal(2);
    });
  });

  describe("ERC721 Standard Functions", function () {
    beforeEach(async function () {
      await nft.connect(user1).mint(user1.address, "ipfs://token1");
    });

    it("Should support ERC721 interface", async function () {
      // ERC721 interface ID: 0x80ac58cd
      expect(await nft.supportsInterface("0x80ac58cd")).to.equal(true);
    });

    it("Should allow token transfer", async function () {
      await nft.connect(user1).transferFrom(user1.address, user2.address, 0);
      expect(await nft.ownerOf(0)).to.equal(user2.address);
    });

    it("Should allow token approval", async function () {
      await nft.connect(user1).approve(user2.address, 0);
      expect(await nft.getApproved(0)).to.equal(user2.address);
    });
  });
});
