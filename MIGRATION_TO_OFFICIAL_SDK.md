# 🔄 Migration Guide: Aligning with Official Zama SDK

This guide explains how to update the current implementation to use the official Zama libraries and patterns based on the latest documentation.

## Key Changes Required

### 1. Library Updates

#### Current Implementation
```json
{
  "dependencies": {
    "fhevm": "^0.5.0",
    "fhevm-core-contracts": "^0.5.0"
  }
}
```

#### Official Zama Stack (Updated)
```json
{
  "dependencies": {
    "@fhevm/solidity": "latest",
    "@openzeppelin/confidential-contracts": "latest"
  },
  "devDependencies": {
    "@fhevm/hardhat-plugin": "latest"
  }
}
```

**Frontend**:
```json
{
  "dependencies": {
    "@zama-fhe/relayer-sdk": "latest",
    "ethers": "^6.0.0"
  }
}
```

### 2. Smart Contract Updates

#### Import Statements

**Before**:
```solidity
import "fhevm/lib/TFHE.sol";
import "fhevm/gateway/GatewayCaller.sol";
```

**After**:
```solidity
import "@fhevm/solidity/contracts/TFHE.sol";
import "@fhevm/solidity/contracts/gateway/GatewayCaller.sol";
```

#### Network Configuration

**Update hardhat.config.ts**:

```typescript
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@fhevm/hardhat-plugin";

const config: HardhatUserConfig = {
  solidity: "0.8.24",
  networks: {
    sepolia: {
      url: "https://rpc.sepolia.org/",
      accounts: [process.env.PRIVATE_KEY || ""],
      chainId: 11155111,
    },
  },
  // FHEVM Gateway configuration
  fhevm: {
    gatewayUrl: "https://gateway.sepolia.zama.ai",
    kmsVerifierAddress: "0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC",
    aclAddress: "0x687820221192C5B662b25367F70076A37bc79b6c",
  },
};

export default config;
```

### 3. Frontend SDK Migration

#### Current Implementation (fhevmjs)
```typescript
import { createInstance } from 'fhevmjs';

const instance = await createInstance({
  chainId: 8009,
  networkUrl: 'https://devnet.zama.ai',
  gatewayUrl: 'https://gateway.zama.ai',
});
```

#### Official Implementation (@zama-fhe/relayer-sdk)

**Create `src/lib/fhevm.ts`**:

```typescript
import { createFhevmInstance } from '@zama-fhe/relayer-sdk';
import { BrowserProvider } from 'ethers';

export async function initFhevm(provider: BrowserProvider) {
  // Initialize WASM
  await initFhevm.init();

  // Get network details
  const network = await provider.getNetwork();
  const chainId = Number(network.chainId);

  // Create FHEVM instance with relayer
  const instance = await createFhevmInstance({
    chainId,
    provider,
    relayerUrl: 'https://relayer.testnet.zama.cloud',
  });

  return instance;
}

// WASM initialization
initFhevm.init = async () => {
  // This is automatically handled by the SDK
};
```

**Update FHEVMContext.tsx**:

```typescript
'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createFhevmInstance, FhevmInstance } from '@zama-fhe/relayer-sdk';
import { useAccount, useWalletClient } from 'wagmi';
import { BrowserProvider } from 'ethers';

interface FHEVMContextType {
  instance: FhevmInstance | null;
  isInitialized: boolean;
  error: string | null;
}

const FHEVMContext = createContext<FHEVMContextType>({
  instance: null,
  isInitialized: false,
  error: null,
});

export function FHEVMProvider({ children }: { children: React.ReactNode }) {
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  useEffect(() => {
    if (!isConnected || !walletClient) return;

    const initInstance = async () => {
      try {
        // Convert WalletClient to ethers Provider
        const provider = new BrowserProvider(walletClient);

        // Create FHEVM instance
        const fhevmInstance = await createFhevmInstance({
          chainId: 11155111, // Sepolia
          provider,
          relayerUrl: 'https://relayer.testnet.zama.cloud',
        });

        setInstance(fhevmInstance);
        setIsInitialized(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to initialize FHEVM');
        console.error('FHEVM initialization error:', err);
      }
    };

    initInstance();
  }, [isConnected, walletClient]);

  return (
    <FHEVMContext.Provider value={{ instance, isInitialized, error }}>
      {children}
    </FHEVMContext.Provider>
  );
}

export function useFHEVM() {
  return useContext(FHEVMContext);
}
```

### 4. Encryption Pattern Updates

#### Creating Encrypted Inputs

**Before**:
```typescript
const input = instance.createEncryptedInput(contractAddress, userAddress);
const encryptedBid = input.add64(bidAmount).encrypt();

await contract.placeBid(
  auctionId,
  encryptedBid.handles[0],
  encryptedBid.inputProof
);
```

**After (Official Pattern)**:
```typescript
import { toHexString } from '@zama-fhe/relayer-sdk';

// Create encrypted input
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add64(bidAmount);

// Get encrypted data
const encryptedData = await input.encrypt();
const inputProof = toHexString(encryptedData.inputProof);
const handles = encryptedData.handles.map(h => toHexString(h));

// Call contract
await contract.placeBid(
  auctionId,
  handles[0], // einput
  inputProof  // bytes calldata proof
);
```

### 5. Decryption Pattern Updates

#### User Balance Decryption (userDecrypt Pattern)

**Add to ConfidentialAuction.sol**:

```solidity
import "@fhevm/solidity/contracts/TFHE.sol";

contract ConfidentialAuction {
    // Allow users to decrypt their own bids
    function getUserBid(uint256 auctionId)
        public
        view
        returns (bytes memory)
    {
        euint64 userBid = userHighestBid[auctionId][msg.sender];
        return TFHE.reencrypt(userBid, msg.sender);
    }
}
```

**Frontend decryption**:

```typescript
// Get reencrypted bid
const reencryptedBid = await contract.getUserBid(auctionId);

// Decrypt on client
const decryptedBid = await instance.decrypt(
  contractAddress,
  reencryptedBid
);

console.log('My bid:', decryptedBid);
```

### 6. Network Configuration Updates

**Update `.env` files**:

**contracts/.env**:
```env
PRIVATE_KEY=your_private_key
SEPOLIA_RPC_URL=https://rpc.sepolia.org/
ETHERSCAN_API_KEY=your_etherscan_key

# Official Zama Infrastructure (Sepolia)
GATEWAY_CONTRACT=0x7048C39f048125eDa9d678AEbaDfB22F7900a29F
KMS_VERIFIER=0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC
ACL_CONTRACT=0x687820221192C5B662b25367F70076A37bc79b6c
```

**frontend/.env.local**:
```env
NEXT_PUBLIC_CHAIN_ID=11155111
NEXT_PUBLIC_RPC_URL=https://rpc.sepolia.org/
NEXT_PUBLIC_RELAYER_URL=https://relayer.testnet.zama.cloud
NEXT_PUBLIC_GATEWAY_CONTRACT=0x7048C39f048125eDa9d678AEbaDfB22F7900a29F

NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=your_deployed_nft_address
NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS=your_deployed_auction_address
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id
```

### 7. Updated Encryption Utilities

**Update `src/lib/encryption.ts`**:

```typescript
import { FhevmInstance, toHexString } from '@zama-fhe/relayer-sdk';

export async function encryptBid(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  amount: bigint
): Promise<{ encryptedInput: string; inputProof: string }> {
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.add64(Number(amount));

  const encrypted = await input.encrypt();

  return {
    encryptedInput: toHexString(encrypted.handles[0]),
    inputProof: toHexString(encrypted.inputProof),
  };
}

export async function encryptReservePrice(
  instance: FhevmInstance,
  contractAddress: string,
  userAddress: string,
  price: bigint
): Promise<{ encryptedInput: string; inputProof: string }> {
  const input = instance.createEncryptedInput(contractAddress, userAddress);
  input.add64(Number(price));

  const encrypted = await input.encrypt();

  return {
    encryptedInput: toHexString(encrypted.handles[0]),
    inputProof: toHexString(encrypted.inputProof),
  };
}

export async function decryptBid(
  instance: FhevmInstance,
  contractAddress: string,
  reencryptedData: Uint8Array
): Promise<bigint> {
  return await instance.decrypt(contractAddress, reencryptedData);
}
```

### 8. ERC7984 Integration (Optional Enhancement)

For a more standard implementation, consider using ERC7984 for confidential tokens:

```solidity
import "@openzeppelin/confidential-contracts/contracts/token/ERC7984/ConfidentialERC20.sol";

contract ConfidentialNFTPayment is ConfidentialERC20 {
    constructor() ConfidentialERC20("Confidential Bid Token", "cBID") {
        _mint(msg.sender, 1000000 * 10**18);
    }
}
```

## Migration Steps

### Step 1: Update Dependencies

```bash
cd contracts
npm uninstall fhevm fhevm-core-contracts
npm install @fhevm/solidity @openzeppelin/confidential-contracts
npm install --save-dev @fhevm/hardhat-plugin

cd ../frontend
npm uninstall fhevmjs
npm install @zama-fhe/relayer-sdk ethers@^6
```

### Step 2: Update Imports

Replace all `fhevm` imports with `@fhevm/solidity` in contracts:

```bash
find contracts -name "*.sol" -type f -exec sed -i 's/import "fhevm/import "@fhevm\/solidity/g' {} +
```

### Step 3: Update Hardhat Config

Copy the new configuration from section 2 above.

### Step 4: Update Frontend SDK Usage

Replace all `fhevmjs` usage with `@zama-fhe/relayer-sdk` patterns.

### Step 5: Recompile and Test

```bash
cd contracts
npm run compile
npm test
```

### Step 6: Redeploy

```bash
npm run deploy:sepolia
# Update frontend .env.local with new addresses
```

### Step 7: Test Frontend

```bash
cd frontend
npm run dev
```

## Official Resources

### Documentation
- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Relayer SDK Guide**: https://docs.zama.ai/fhevm/guides/frontend
- **OpenZeppelin Confidential Contracts**: https://docs.openzeppelin.com/contracts-for-zama/

### Contract Examples
- **CAMM Implementation**: https://github.com/zama-ai/fhevm-contracts/tree/main/contracts/amm
- **ERC7984 Examples**: https://github.com/OpenZeppelin/openzeppelin-contracts-for-zama

### Deployed Infrastructure (Sepolia)
- **Gateway Contract**: `0x7048C39f048125eDa9d678AEbaDfB22F7900a29F`
- **KMS Verifier**: `0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC`
- **ACL Contract**: `0x687820221192C5B662b25367F70076A37bc79b6c`
- **Relayer Endpoint**: https://relayer.testnet.zama.cloud

## Breaking Changes Summary

| Component | Old | New |
|-----------|-----|-----|
| Solidity Library | `fhevm` | `@fhevm/solidity` |
| Frontend SDK | `fhevmjs` | `@zama-fhe/relayer-sdk` |
| Network | Zama Sepolia (8009) | Standard Sepolia (11155111) |
| Relayer | Not used | Required (`relayer.testnet.zama.cloud`) |
| Gateway | Generic | Specific address (Sepolia) |
| ethers version | v6 compatible | Must use ethers v6 |
| Encryption | Direct creation | Through relayer |
| Decryption | Gateway callback only | Gateway + client-side reencryption |

## Benefits of Migration

1. ✅ **Official Support**: Using maintained Zama libraries
2. ✅ **Better Performance**: Optimized relayer for encryption
3. ✅ **Standard Network**: Deploy on regular Sepolia testnet
4. ✅ **More Features**: Access to ERC7984 and confidential tokens
5. ✅ **Community**: Aligned with official examples and tutorials
6. ✅ **Future-Proof**: Compatible with upcoming Zama updates

## Notes

- The current implementation is still valid for learning purposes
- Migration can be done incrementally
- Test thoroughly after each step
- Keep backups before migrating

---

**This migration guide ensures alignment with official Zama documentation and best practices.**
