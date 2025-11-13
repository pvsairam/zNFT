# ⚡ Quick Start Guide

Get the Confidential NFT Marketplace running in 5 minutes.

## Prerequisites

- Node.js v20+
- MetaMask wallet
- Test ETH on Zama Sepolia

## Installation

```bash
# Clone repository
git clone https://github.com/yourusername/zNFT.git
cd zNFT

# Install all dependencies
npm install
```

## Smart Contracts

### 1. Configure

```bash
cd contracts
cp .env.example .env
# Edit .env and add your PRIVATE_KEY
```

### 2. Deploy

```bash
# Deploy to Zama Sepolia
npm run deploy:sepolia
```

**Save the contract addresses!**

## Frontend

### 1. Configure

```bash
cd frontend
cp .env.example .env.local
# Edit .env.local and add:
# - Contract addresses from deployment
# - WalletConnect Project ID
```

### 2. Run

```bash
npm run dev
```

### 3. Test

Open `http://localhost:3000`:

1. Click "Connect Wallet"
2. Switch to Zama Sepolia network
3. Wait for FHEVM to initialize (green indicator)
4. Navigate to "Mint NFT"
5. Mint your first NFT!

## Common Issues

**"FHEVM not initialized"**
- Wait a few seconds for initialization
- Check you're on Zama Sepolia network (Chain ID: 8009)

**"Insufficient funds"**
- Get test ETH from Zama faucet

**"Wrong network"**
- Switch to Zama Sepolia in MetaMask

## Next Steps

- Read the full [README](README.md)
- Check the [Deployment Guide](DEPLOYMENT_GUIDE.md)
- Review [Architecture](ARCHITECTURE.md)
- Try creating an auction!

## Test Workflow

1. **Mint NFT**: Create token with metadata
2. **Create Auction**: Set encrypted reserve price
3. **Place Bids**: Submit encrypted bids
4. **End Auction**: Determine winner after expiry
5. **Check Winner**: View decrypted winning bid

## Get Help

- Zama Discord: [discord.gg/zama](https://discord.gg/zama)
- Documentation: [docs.zama.ai](https://docs.zama.ai)
- GitHub Issues: Open an issue

---

**Happy Building! 🚀**
