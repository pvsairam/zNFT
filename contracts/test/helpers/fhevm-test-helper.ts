/**
 * FHEVM Test Helper Functions
 *
 * This file contains helper functions for testing FHEVM contracts.
 *
 * Note: These helpers require the fhevmjs library and a proper FHEVM environment.
 * For local testing without FHEVM, use mocked encryption or deploy to Zama testnet.
 */

import { ethers } from "hardhat";

/**
 * Example structure for FHEVM instance
 * In production, use: import { createInstance } from "fhevmjs";
 */
export interface FHEVMInstance {
  createEncryptedInput: (contractAddress: string, userAddress: string) => any;
  getPublicKey: (contractAddress: string) => Promise<string>;
  decrypt: (contractAddress: string, ciphertext: bigint) => Promise<bigint>;
}

/**
 * Mock encrypted input for testing without FHEVM
 * @param value The value to "encrypt" (actually just returns mock data)
 * @returns Mock encrypted data structure
 */
export function mockEncryptedInput(value: number | bigint) {
  return {
    data: ethers.toBeHex(BigInt(value), 32),
    inputProof: ethers.toBeHex(0, 32), // Mock proof
  };
}

/**
 * Creates a mock FHEVM instance for testing
 * In production, replace with actual createInstance() from fhevmjs
 */
export async function createMockFHEVMInstance(): Promise<FHEVMInstance> {
  return {
    createEncryptedInput: (contractAddress: string, userAddress: string) => {
      return {
        add64: (value: number | bigint) => {
          return {
            encrypt: () => {
              return {
                data: ethers.toBeHex(BigInt(value), 32),
                inputProof: ethers.toBeHex(0, 32),
              };
            },
          };
        },
      };
    },
    getPublicKey: async (contractAddress: string) => {
      return ethers.toBeHex(0, 32); // Mock public key
    },
    decrypt: async (contractAddress: string, ciphertext: bigint) => {
      return ciphertext; // Mock decryption (returns same value)
    },
  };
}

/**
 * Example of how to encrypt a bid amount for testing on actual FHEVM
 * @param fhevmInstance The FHEVM instance
 * @param contractAddress The auction contract address
 * @param userAddress The bidder's address
 * @param bidAmount The bid amount to encrypt
 * @returns Encrypted input and proof
 */
export async function encryptBidAmount(
  fhevmInstance: FHEVMInstance,
  contractAddress: string,
  userAddress: string,
  bidAmount: bigint
) {
  const input = fhevmInstance.createEncryptedInput(contractAddress, userAddress);
  const encryptedBid = input.add64(bidAmount).encrypt();

  return {
    encryptedInput: encryptedBid.data,
    inputProof: encryptedBid.inputProof,
  };
}

/**
 * Example of how to encrypt a reserve price
 */
export async function encryptReservePrice(
  fhevmInstance: FHEVMInstance,
  contractAddress: string,
  userAddress: string,
  reservePrice: bigint
) {
  const input = fhevmInstance.createEncryptedInput(contractAddress, userAddress);
  const encryptedReserve = input.add64(reservePrice).encrypt();

  return {
    encryptedInput: encryptedReserve.data,
    inputProof: encryptedReserve.inputProof,
  };
}

/**
 * Helper to advance time for auction testing
 */
export async function advanceTime(seconds: number) {
  await ethers.provider.send("evm_increaseTime", [seconds]);
  await ethers.provider.send("evm_mine", []);
}

/**
 * Helper to get current block timestamp
 */
export async function getCurrentTimestamp(): Promise<number> {
  const block = await ethers.provider.getBlock("latest");
  return block!.timestamp;
}

/**
 * Example test workflow for encrypted auction
 * This demonstrates the full flow of creating and testing an encrypted auction
 */
export const FHEVM_TEST_WORKFLOW = `
1. Setup FHEVM Instance:
   const fhevmInstance = await createInstance({
     chainId: 8009,
     networkUrl: "https://devnet.zama.ai",
     gatewayUrl: "https://gateway.zama.ai",
   });

2. Generate Encryption Keys:
   const publicKey = await fhevmInstance.getPublicKey(auctionContractAddress);

3. Encrypt Reserve Price:
   const input = fhevmInstance.createEncryptedInput(auctionAddress, sellerAddress);
   const encrypted = input.add64(1000000n).encrypt();

4. Create Auction:
   await auction.createAuction(
     nftAddress,
     tokenId,
     encrypted.data,
     encrypted.inputProof,
     duration
   );

5. Encrypt Bid Amount:
   const bidInput = fhevmInstance.createEncryptedInput(auctionAddress, bidderAddress);
   const encryptedBid = bidInput.add64(2000000n).encrypt();

6. Place Encrypted Bid:
   await auction.placeBid(
     auctionId,
     encryptedBid.data,
     encryptedBid.inputProof
   );

7. End Auction (triggers decryption):
   await auction.endAuction(auctionId);

8. Verify Winner (after Gateway callback):
   const auctionData = await auction.getAuction(auctionId);
   expect(auctionData.winner).to.equal(expectedWinnerAddress);
`;

export default {
  mockEncryptedInput,
  createMockFHEVMInstance,
  encryptBidAmount,
  encryptReservePrice,
  advanceTime,
  getCurrentTimestamp,
  FHEVM_TEST_WORKFLOW,
};
