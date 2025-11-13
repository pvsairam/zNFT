# 🔐 Confidential NFT Marketplace

A privacy-preserving NFT marketplace built with **Zama's FHEVM (Fully Homomorphic Encryption for EVM)**. This platform enables confidential auctions where bids remain encrypted on-chain, ensuring complete privacy until the auction concludes.

## 🎯 Features

- **Private Bidding**: All bids are encrypted using FHEVM's euint64 type
- **Encrypted Reserve Price**: Sellers set minimum prices that remain confidential
- **Encrypted Winner Determination**: Smart contracts compute winners on encrypted data
- **Access Control Lists (ACL)**: Controlled decryption through Zama's Gateway
- **Full-Stack Implementation**: End-to-end encrypted auction flow from client to smart contract
- **Modern UI**: Next.js 14 with Tailwind CSS, Wagmi, and Viem

## 📋 Table of Contents

- [Architecture](#-architecture)
- [Prerequisites](#-prerequisites)
- [Installation](#-installation)
- [Configuration](#-configuration)
- [Smart Contracts](#-smart-contracts)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Frontend Setup](#-frontend-setup)
- [Usage Guide](#-usage-guide)
- [FHEVM Integration](#-fhevm-integration)
- [Security Considerations](#-security-considerations)
- [Troubleshooting](#-troubleshooting)
- [Resources](#-resources)

## 🏗 Architecture

### Smart Contracts

```
contracts/
├── ConfidentialNFT.sol        # ERC721 NFT contract
└── ConfidentialAuction.sol    # Encrypted auction logic
```

**ConfidentialNFT**: Standard ERC721 implementation with auction status tracking

**ConfidentialAuction**: Core auction contract featuring:
- Encrypted reserve prices (euint64)
- Encrypted bid amounts (euint64)
- Encrypted comparisons (TFHE.gt, TFHE.ge, TFHE.select)
- Gateway integration for controlled decryption
- ACL-based access control

### Frontend

```
frontend/
├── src/
│   ├── app/                   # Next.js 14 App Router pages
│   ├── components/            # React components
│   ├── contexts/              # FHEVM context provider
│   ├── config/                # Wagmi configuration
│   └── lib/                   # Encryption utilities
```

### Technology Stack

- **Blockchain**: Solidity 0.8.24, Hardhat
- **Encryption**: Zama FHEVM, fhevmjs
- **Frontend**: Next.js 14, React 18, TypeScript
- **Web3**: Wagmi v2, Viem v2
- **Styling**: Tailwind CSS
- **Testing**: Hardhat, Chai

## ✅ Prerequisites

Before you begin, ensure you have:

- **Node.js** v20 or higher
- **npm**, **yarn**, or **pnpm**
- **Git**
- **MetaMask** or another Web3 wallet
- Test ETH on Zama Sepolia testnet

### Get Test ETH

Visit the Zama faucet to get test ETH for deployment and testing:
- Zama Sepolia Faucet: [https://faucet.zama.ai](https://faucet.zama.ai) (check Zama docs for current faucet URL)

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/zNFT.git
cd zNFT
```

### 2. Install Dependencies

Install root dependencies and workspace dependencies:

```bash
npm install
```

Or install each workspace individually:

```bash
# Install contract dependencies
cd contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

## ⚙️ Configuration

### Smart Contracts Configuration

1. **Create environment file**:

```bash
cd contracts
cp .env.example .env
```

2. **Edit `.env` file**:

```env
# Your wallet private key (DO NOT commit this!)
PRIVATE_KEY=your_private_key_here

# RPC URLs
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
ZAMA_SEPOLIA_RPC_URL=https://devnet.zama.ai

# Etherscan API key for verification
ETHERSCAN_API_KEY=your_etherscan_api_key

# Gas reporting
REPORT_GAS=false
```

⚠️ **Security Warning**: Never commit your `.env` file or private keys to version control!

### Frontend Configuration

1. **Create environment file**:

```bash
cd frontend
cp .env.example .env.local
```

2. **Edit `.env.local` file**:

```env
# Blockchain Configuration
NEXT_PUBLIC_CHAIN_ID=8009
NEXT_PUBLIC_RPC_URL=https://devnet.zama.ai
NEXT_PUBLIC_GATEWAY_URL=https://gateway.zama.ai

# Contract Addresses (update after deployment)
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xYourNFTContractAddress
NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS=0xYourAuctionContractAddress

# WalletConnect Project ID
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
```

### Get WalletConnect Project ID

1. Visit [WalletConnect Cloud](https://cloud.walletconnect.com)
2. Create a new project
3. Copy your Project ID to `.env.local`

## 📝 Smart Contracts

### Contract Overview

#### ConfidentialNFT.sol

```solidity
// Key functions:
function mint(address to, string memory uri) public returns (uint256)
function setTokenAuctionStatus(uint256 tokenId, bool inAuction) external
function isTokenInAuction(uint256 tokenId) external view returns (bool)
```

#### ConfidentialAuction.sol

```solidity
// Key functions:
function createAuction(
    address nftContract,
    uint256 tokenId,
    einput encryptedReservePrice,
    bytes calldata inputProof,
    uint64 duration
) external returns (uint256)

function placeBid(
    uint256 auctionId,
    einput encryptedBid,
    bytes calldata inputProof
) external payable

function endAuction(uint256 auctionId) external
```

### Compile Contracts

```bash
cd contracts
npm run compile
```

This generates:
- Contract artifacts in `artifacts/`
- TypeChain types in `typechain-types/`

## 🧪 Testing

### Run All Tests

```bash
cd contracts
npm test
```

### Run with Coverage

```bash
npm run coverage
```

### Run Specific Tests

```bash
npx hardhat test test/ConfidentialNFT.test.ts
npx hardhat test test/ConfidentialAuction.test.ts
```

### Test Structure

```
test/
├── ConfidentialNFT.test.ts           # NFT contract tests
├── ConfidentialAuction.test.ts       # Auction contract tests
└── helpers/
    └── fhevm-test-helper.ts          # FHEVM testing utilities
```

**Note**: Full FHEVM encrypted operation tests require deployment to Zama testnet or using fhevmjs mocks.

## 🚀 Deployment

### Deploy to Local Hardhat Network

1. **Start local node**:

```bash
cd contracts
npm run node
```

2. **Deploy contracts** (in a new terminal):

```bash
npm run deploy:local
```

### Deploy to Zama Sepolia Testnet

1. **Ensure you have test ETH** from the Zama faucet

2. **Verify your `.env` configuration**:
   - `PRIVATE_KEY` is set
   - `ZAMA_SEPOLIA_RPC_URL` is correct

3. **Deploy**:

```bash
npm run deploy:sepolia
```

4. **Save contract addresses**:

The deployment script saves addresses to `contracts/deployments/{chainId}.json`:

```json
{
  "network": "zamaSepolia",
  "chainId": "8009",
  "contracts": {
    "ConfidentialNFT": "0x...",
    "ConfidentialAuction": "0x..."
  },
  "deployer": "0x...",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

5. **Update frontend environment**:

Copy the deployed contract addresses to `frontend/.env.local`:

```env
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xYourDeployedNFTAddress
NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS=0xYourDeployedAuctionAddress
```

### Verify Contracts on Etherscan

```bash
npx hardhat verify --network zamaSepolia <NFT_CONTRACT_ADDRESS>
npx hardhat verify --network zamaSepolia <AUCTION_CONTRACT_ADDRESS>
```

## 💻 Frontend Setup

### Install Dependencies

```bash
cd frontend
npm install
```

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build

```bash
npm run build
npm start
```

### Frontend Structure

```
src/
├── app/
│   ├── page.tsx                    # Home page
│   ├── marketplace/page.tsx        # Auction listings
│   ├── mint/page.tsx               # NFT minting
│   ├── create-auction/page.tsx     # Create auction
│   ├── auction/[id]/page.tsx       # Auction detail & bidding
│   └── my-nfts/page.tsx            # User's NFT collection
├── components/
│   └── Navbar.tsx                  # Navigation component
├── contexts/
│   └── FHEVMContext.tsx            # FHEVM instance provider
├── config/
│   └── wagmi.ts                    # Wagmi configuration
└── lib/
    ├── contracts.ts                # Contract ABIs & addresses
    └── encryption.ts               # FHEVM encryption utilities
```

## 📖 Usage Guide

### 1. Connect Wallet

1. Open the app at `http://localhost:3000`
2. Click "Connect Wallet"
3. Approve the connection in MetaMask
4. Switch to Zama Sepolia network if prompted
5. Wait for FHEVM initialization (green "FHEVM Ready" indicator)

### 2. Mint an NFT

1. Navigate to **"Mint NFT"**
2. Enter your NFT metadata URI (IPFS or hosted JSON)
3. Click **"Mint NFT"**
4. Confirm transaction in wallet
5. Wait for confirmation

**Metadata Format** (JSON):

```json
{
  "name": "My Confidential NFT",
  "description": "A unique NFT for private auctions",
  "image": "ipfs://QmImageHash...",
  "attributes": [
    { "trait_type": "Rarity", "value": "Rare" },
    { "trait_type": "Type", "value": "Art" }
  ]
}
```

### 3. Create a Confidential Auction

1. Navigate to **"Create Auction"**
2. Fill in auction details:
   - **NFT Contract**: Auto-filled with marketplace NFT address
   - **Token ID**: The ID of your NFT
   - **Reserve Price**: Minimum bid (will be encrypted) 🔒
   - **Duration**: Auction length
3. **Important**: First approve the auction contract to transfer your NFT
4. Click **"Create Auction"**
5. Confirm transaction (reserve price is encrypted client-side)

### 4. Place an Encrypted Bid

1. Navigate to **"Marketplace"**
2. Select an active auction
3. Enter your bid amount
4. Click **"Place Encrypted Bid"**
5. Your bid is encrypted client-side using FHEVM 🔒
6. Confirm transaction
7. Your bid amount remains hidden from other bidders

### 5. End Auction & Determine Winner

1. Wait for auction to expire
2. Anyone can click **"End Auction & Determine Winner"**
3. The contract computes the winner using encrypted comparisons
4. Gateway decrypts only the winning bid amount
5. Winner receives the NFT
6. Winning bid amount is revealed

## 🔐 FHEVM Integration

### Client-Side Encryption

The frontend uses `fhevmjs` to encrypt values before sending to the contract:

```typescript
import { createInstance } from 'fhevmjs';

// Initialize FHEVM instance
const instance = await createInstance({
  chainId: 8009,
  networkUrl: 'https://devnet.zama.ai',
  gatewayUrl: 'https://gateway.zama.ai',
});

// Encrypt a bid
const input = instance.createEncryptedInput(contractAddress, userAddress);
const encryptedBid = input.add64(bidAmount).encrypt();

// Send to contract
await contract.placeBid(
  auctionId,
  encryptedBid.handles[0],
  encryptedBid.inputProof
);
```

### Smart Contract Encrypted Operations

```solidity
import "fhevm/lib/TFHE.sol";

// Convert encrypted input to euint64
euint64 bidAmount = TFHE.asEuint64(encryptedBid, inputProof);

// Encrypted comparison
ebool isHigher = TFHE.gt(newBid, currentHighestBid);

// Select based on encrypted condition
euint64 highest = TFHE.select(isHigher, newBid, currentHighestBid);

// Set ACL permissions
TFHE.allowThis(bidAmount);
TFHE.allow(bidAmount, msg.sender);
```

### Gateway Decryption

```solidity
// Request decryption
uint256 requestId = Gateway.requestDecryption(
    ciphertexts,
    callbackSelector,
    0,
    block.timestamp + 100,
    false
);

// Callback receives decrypted value
function callback(uint256 requestId, uint64 decryptedValue)
    public onlyGateway {
    // Process decrypted value
}
```

## 🛡 Security Considerations

### Access Control

- **ACL Permissions**: Use `TFHE.allow()` to grant specific addresses access to encrypted values
- **Gateway Only**: Decryption callbacks should use `onlyGateway` modifier
- **Ownership Checks**: Verify NFT ownership before auction creation

### Best Practices

1. **Never decrypt sensitive values unnecessarily**
2. **Use ACL to control who can decrypt specific ciphertexts**
3. **Validate all inputs before encryption**
4. **Implement reentrancy guards on state-changing functions**
5. **Test encrypted operations thoroughly on testnet**

### Known Limitations

- **Performance**: FHE operations are computationally expensive
- **Gas Costs**: Encrypted operations cost more gas than plaintext
- **Testnet Only**: Currently deployed on Zama Sepolia testnet
- **Beta Software**: FHEVM is evolving; check for updates

## 🔧 Troubleshooting

### Common Issues

#### FHEVM Initialization Fails

**Error**: "Failed to initialize FHEVM"

**Solutions**:
- Ensure you're connected to Zama Sepolia (Chain ID: 8009)
- Check RPC URL in `.env.local`
- Verify Gateway URL is correct
- Try refreshing the page

#### Transaction Fails: "Auction not started"

**Solution**: Wait for `startTime` to pass. Auctions start at block.timestamp.

#### Cannot See Bid Amounts

**This is expected!** Bid amounts are encrypted. Only the winning bid is decrypted after auction ends.

#### "Please connect your wallet" Even When Connected

**Solution**:
- Check if wallet is connected to correct network
- Ensure FHEVM is initialized (check status indicator)
- Try disconnecting and reconnecting wallet

#### Deployment Fails: "Insufficient funds"

**Solution**: Get test ETH from Zama faucet before deploying.

### Get Help

- **Zama Discord**: [discord.gg/zama](https://discord.gg/zama)
- **Documentation**: [docs.zama.ai](https://docs.zama.ai)
- **GitHub Issues**: Open an issue in this repository

## 📚 Resources

### Official Zama Resources

- **Main Docs**: https://docs.zama.ai/
- **FHEVM Docs**: https://docs.zama.ai/fhevm
- **Solidity Reference**: https://docs.zama.ai/fhevm/developers/reference/solidity/overview
- **fhevmjs Library**: https://github.com/zama-ai/fhevmjs
- **Hardhat Template**: https://github.com/zama-ai/fhevm-hardhat-template

### External Resources

- **Hardhat**: https://hardhat.org/
- **Next.js**: https://nextjs.org/
- **Wagmi**: https://wagmi.sh/
- **Viem**: https://viem.sh/
- **Tailwind CSS**: https://tailwindcss.com/

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Write/update tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License. See [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Zama** for FHEVM technology and support
- **OpenZeppelin** for secure smart contract libraries
- **Next.js** team for the excellent framework

---

**Built with 🔐 by [Your Name]**

For questions or support, please open an issue or contact us at [your-email@example.com]
