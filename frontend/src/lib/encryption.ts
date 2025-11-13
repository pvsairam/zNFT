/**
 * FHEVM Encryption utilities
 */

import { FhevmInstance } from 'fhevmjs';

/**
 * Encrypts a bid amount for the auction contract
 * @param instance FHEVM instance
 * @param contractAddress Auction contract address
 * @param userAddress Bidder's address
 * @param amount Bid amount (in wei)
 * @returns Encrypted input and proof
 */
export async function encryptBid(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  amount: bigint
): Promise<{ encryptedInput: string; inputProof: string }> {
  try {
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    const encryptedAmount = input.add64(Number(amount));
    const encrypted = encryptedAmount.encrypt();

    return {
      encryptedInput: encrypted.handles[0],
      inputProof: encrypted.inputProof,
    };
  } catch (error) {
    console.error('Error encrypting bid:', error);
    throw new Error('Failed to encrypt bid amount');
  }
}

/**
 * Encrypts a reserve price for auction creation
 * @param instance FHEVM instance
 * @param contractAddress Auction contract address
 * @param userAddress Seller's address
 * @param price Reserve price (in wei)
 * @returns Encrypted input and proof
 */
export async function encryptReservePrice(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  price: bigint
): Promise<{ encryptedInput: string; inputProof: string }> {
  try {
    const input = instance.createEncryptedInput(contractAddress, userAddress);
    const encryptedPrice = input.add64(Number(price));
    const encrypted = encryptedPrice.encrypt();

    return {
      encryptedInput: encrypted.handles[0],
      inputProof: encrypted.inputProof,
    };
  } catch (error) {
    console.error('Error encrypting reserve price:', error);
    throw new Error('Failed to encrypt reserve price');
  }
}

/**
 * Formats ETH amount to wei
 * @param ethAmount Amount in ETH
 * @returns Amount in wei
 */
export function ethToWei(ethAmount: string | number): bigint {
  try {
    const amount = typeof ethAmount === 'string' ? parseFloat(ethAmount) : ethAmount;
    return BigInt(Math.floor(amount * 10 ** 18));
  } catch (error) {
    console.error('Error converting ETH to wei:', error);
    return 0n;
  }
}

/**
 * Formats wei to ETH
 * @param weiAmount Amount in wei
 * @returns Amount in ETH
 */
export function weiToEth(weiAmount: bigint): string {
  try {
    return (Number(weiAmount) / 10 ** 18).toFixed(4);
  } catch (error) {
    console.error('Error converting wei to ETH:', error);
    return '0';
  }
}

/**
 * Validates if FHEVM instance is ready
 * @param instance FHEVM instance
 * @throws Error if instance is not ready
 */
export function validateFHEVMInstance(instance: FhevmInstance | null): void {
  if (!instance) {
    throw new Error('FHEVM instance not initialized. Please connect your wallet.');
  }
}
