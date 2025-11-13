# 🚀 Deployment Guide

Complete step-by-step guide for deploying the Confidential NFT Marketplace to production.

## Prerequisites Checklist

Before deploying, ensure you have:

- [ ] Node.js v20+ installed
- [ ] Wallet with test ETH on Zama Sepolia
- [ ] Private key added to `.env` (contracts)
- [ ] WalletConnect Project ID
- [ ] All dependencies installed
- [ ] Tests passing locally

## Step 1: Prepare Environment

### Smart Contracts Environment

Create `contracts/.env`:

```bash
cd contracts
cp .env.example .env
```

Edit `.env`:

```env
PRIVATE_KEY=your_wallet_private_key
ZAMA_SEPOLIA_RPC_URL=https://devnet.zama.ai
ETHERSCAN_API_KEY=optional_for_verification
REPORT_GAS=false
```

### Frontend Environment

Create `frontend/.env.local`:

```bash
cd frontend
cp .env.example .env.local
```

Edit `.env.local`:

```env
NEXT_PUBLIC_CHAIN_ID=8009
NEXT_PUBLIC_RPC_URL=https://devnet.zama.ai
NEXT_PUBLIC_GATEWAY_URL=https://gateway.zama.ai
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_walletconnect_id

# Will update after contract deployment
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=
NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS=
```

## Step 2: Get Test Funds

### Zama Sepolia Faucet

1. Visit Zama faucet (check docs for current URL)
2. Connect your wallet
3. Request test ETH
4. Wait for confirmation (~1-2 minutes)

**Verify balance**:

```bash
cd contracts
npx hardhat run scripts/setup-fhevm.ts --network zamaSepolia
```

## Step 3: Compile Contracts

```bash
cd contracts
npm run compile
```

**Expected output**:

```
Compiled 10 Solidity files successfully
```

**Verify compilation**:

```bash
ls artifacts/contracts/
# Should see: ConfidentialNFT.sol/ ConfidentialAuction.sol/
```

## Step 4: Run Tests

Before deploying, ensure all tests pass:

```bash
npm test
```

**Expected output**:

```
  ConfidentialNFT
    ✓ Should deploy successfully
    ✓ Should mint NFT
    ... (more tests)

  ConfidentialAuction
    ✓ Should deploy successfully
    ... (more tests)

  X passing (Xs)
```

## Step 5: Deploy Smart Contracts

### Deploy to Zama Sepolia

```bash
npm run deploy:sepolia
```

**Expected output**:

```
Starting deployment of Confidential NFT Marketplace...

Deploying contracts with account: 0x...
Account balance: 1.5 ETH

Deploying ConfidentialNFT...
✅ ConfidentialNFT deployed to: 0xABC123...

Deploying ConfidentialAuction...
✅ ConfidentialAuction deployed to: 0xDEF456...

📝 Deployment Summary:
========================
Network: zamaSepolia
Chain ID: 8009
ConfidentialNFT: 0xABC123...
ConfidentialAuction: 0xDEF456...
========================

💾 Deployment info saved to: ./deployments/8009.json
```

### Save Deployment Addresses

The script automatically saves to `contracts/deployments/8009.json`:

```json
{
  "network": "zamaSepolia",
  "chainId": "8009",
  "contracts": {
    "ConfidentialNFT": "0xABC123...",
    "ConfidentialAuction": "0xDEF456..."
  },
  "deployer": "0x...",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Step 6: Verify Contracts (Optional)

Verify contracts on block explorer:

```bash
# Verify NFT contract
npx hardhat verify --network zamaSepolia 0xABC123...

# Verify Auction contract
npx hardhat verify --network zamaSepolia 0xDEF456...
```

## Step 7: Update Frontend Configuration

Update `frontend/.env.local` with deployed addresses:

```env
NEXT_PUBLIC_NFT_CONTRACT_ADDRESS=0xABC123...
NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS=0xDEF456...
```

## Step 8: Test Smart Contracts

Test deployed contracts using Hardhat console:

```bash
npx hardhat console --network zamaSepolia
```

In console:

```javascript
// Get contracts
const nftAddress = "0xABC123...";
const NFT = await ethers.getContractFactory("ConfidentialNFT");
const nft = NFT.attach(nftAddress);

// Test mint
const tx = await nft.mint(
  "0xYourAddress",
  "ipfs://QmTest123"
);
await tx.wait();

console.log("Minted token 0");

// Check owner
const owner = await nft.ownerOf(0);
console.log("Owner:", owner);
```

## Step 9: Deploy Frontend

### Development Deployment

```bash
cd frontend
npm run dev
```

Visit `http://localhost:3000` and test:

1. ✅ Wallet connection
2. ✅ FHEVM initialization
3. ✅ Mint NFT
4. ✅ Create auction
5. ✅ Place bid
6. ✅ End auction

### Production Build

```bash
npm run build
npm start
```

### Deploy to Vercel

1. **Install Vercel CLI**:

```bash
npm install -g vercel
```

2. **Login**:

```bash
vercel login
```

3. **Deploy**:

```bash
cd frontend
vercel
```

4. **Set Environment Variables** in Vercel dashboard:
   - `NEXT_PUBLIC_CHAIN_ID`
   - `NEXT_PUBLIC_RPC_URL`
   - `NEXT_PUBLIC_GATEWAY_URL`
   - `NEXT_PUBLIC_NFT_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS`
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

5. **Deploy production**:

```bash
vercel --prod
```

### Deploy to Netlify

1. **Install Netlify CLI**:

```bash
npm install -g netlify-cli
```

2. **Login**:

```bash
netlify login
```

3. **Deploy**:

```bash
cd frontend
netlify deploy
```

4. Set environment variables in Netlify dashboard

5. **Deploy to production**:

```bash
netlify deploy --prod
```

## Step 10: Post-Deployment Testing

### Test Checklist

- [ ] Connect wallet to Zama Sepolia
- [ ] FHEVM initializes successfully
- [ ] Can mint NFT
- [ ] Can approve auction contract
- [ ] Can create auction with encrypted reserve price
- [ ] Can view auction in marketplace
- [ ] Can place encrypted bid
- [ ] Can end auction after expiry
- [ ] Winner is determined correctly
- [ ] NFT transfers to winner

### Monitor Transactions

Use Zama block explorer (if available) or:

```bash
# In Hardhat console
const tx = await provider.getTransaction("0xTransactionHash...");
console.log(tx);

const receipt = await provider.getTransactionReceipt("0xTransactionHash...");
console.log(receipt);
```

## Troubleshooting

### Deployment Fails

**Error**: "Insufficient funds"
- **Solution**: Get more test ETH from faucet

**Error**: "Nonce too high"
- **Solution**: Reset MetaMask account or wait for pending transactions

**Error**: "Transaction underpriced"
- **Solution**: Increase gas price in hardhat.config.ts

### Frontend Issues

**Error**: "Contract not deployed at address"
- **Solution**: Verify contract addresses in `.env.local`

**Error**: "FHEVM initialization failed"
- **Solution**: Check RPC and Gateway URLs

**Error**: "Wrong network"
- **Solution**: Switch wallet to Zama Sepolia (Chain ID: 8009)

## Security Checklist

Before going live:

- [ ] Remove all test private keys
- [ ] Audit smart contracts
- [ ] Test with multiple users
- [ ] Set appropriate gas limits
- [ ] Document all contract addresses
- [ ] Set up monitoring/alerts
- [ ] Prepare incident response plan

## Mainnet Deployment

⚠️ **Warning**: FHEVM is currently in testnet. Check Zama's roadmap for mainnet availability.

When ready for mainnet:

1. Audit contracts thoroughly
2. Test extensively on testnet
3. Update RPC URLs to mainnet
4. Use hardware wallet for deployment
5. Start with small value contracts
6. Monitor closely

## Maintenance

### Update Contracts

To deploy new versions:

```bash
# Compile new version
npm run compile

# Deploy with different script or network
npx hardhat run scripts/deploy-v2.ts --network zamaSepolia
```

### Monitor Gas Costs

```bash
# Enable gas reporting
echo "REPORT_GAS=true" >> .env

# Run tests with gas report
npm test
```

## Resources

- **Zama Docs**: https://docs.zama.ai
- **Hardhat Docs**: https://hardhat.org/docs
- **Vercel Docs**: https://vercel.com/docs
- **Netlify Docs**: https://docs.netlify.com

## Support

If you encounter issues:

1. Check troubleshooting section
2. Review Zama documentation
3. Ask in Zama Discord
4. Open GitHub issue

---

**Happy Deploying! 🚀**
