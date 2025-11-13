/**
 * FHEVM Encryption utilities
 *
 * NOTE: This is currently in demo mode. To enable actual FHEVM encryption,
 * install the official Zama SDK and update these functions.
 * See MIGRATION_TO_OFFICIAL_SDK.md for instructions.
 */

// Mock type for demo
type FhevmInstance = any;

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
  console.log('🎨 Demo Mode: Mock encrypting bid amount:', amount.toString());
  console.log('📝 For actual encryption, install official Zama SDK');

  // Return mock encrypted data for UI demo
  return {
    encryptedInput: '0x' + '00'.repeat(32),
    inputProof: '0x' + '00'.repeat(32),
  };
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
  console.log('🎨 Demo Mode: Mock encrypting reserve price:', price.toString());
  console.log('📝 For actual encryption, install official Zama SDK');

  // Return mock encrypted data for UI demo
  return {
    encryptedInput: '0x' + '00'.repeat(32),
    inputProof: '0x' + '00'.repeat(32),
  };
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
