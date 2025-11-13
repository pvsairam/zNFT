# 📚 Official Zama Sources & References

Comprehensive list of official Zama documentation and resources relevant to this Confidential NFT Marketplace project.

## 🔐 Core FHEVM Documentation

### Primary Resources
- **FHEVM Documentation**: https://docs.zama.ai/fhevm
  - Main entry point for all FHEVM development
  - Covers encrypted types, operations, and best practices

- **Frontend Integration Guide**: https://docs.zama.ai/fhevm/guides/frontend
  - Client-side encryption setup
  - Zama Relayer SDK usage
  - WASM initialization patterns

- **Decryption Guide**: https://docs.zama.ai/fhevm/guides/decrypt
  - Gateway-based decryption
  - User balance decryption (reencrypt pattern)
  - ACL permissions

### Standards & Specifications
- **ERC7984 Standard (Confidential ERC20)**: https://docs.openzeppelin.com/contracts-for-zama/confidential-erc20
  - New standard for confidential tokens
  - Encrypted balances and allowances
  - Operator approval patterns

- **Encrypted Input Creation**: https://docs.zama.ai/fhevm/guides/frontend#encrypting-inputs
  - How to create encrypted inputs client-side
  - Input proof generation
  - Best practices for encryption

## 📦 Official Libraries & Packages

### Smart Contract Libraries

**FHEVM Solidity Library**
- **GitHub**: https://github.com/zama-ai/fhevm
- **NPM**: `@fhevm/solidity`
- **Purpose**: Core TFHE operations for Solidity
- **Used for**: euint types, encrypted operations, ACL

**OpenZeppelin Confidential Contracts**
- **GitHub**: https://github.com/OpenZeppelin/openzeppelin-contracts-for-zama
- **NPM**: `@openzeppelin/confidential-contracts`
- **Purpose**: ERC7984 implementation
- **Used for**: Confidential token standards

**Hardhat Plugin**
- **NPM**: `@fhevm/hardhat-plugin`
- **Purpose**: Hardhat integration for FHEVM
- **Used for**: Testing and deployment

### Frontend Libraries

**Zama Relayer SDK**
- **NPM**: `@zama-fhe/relayer-sdk`
- **GitHub**: https://github.com/zama-ai/fhevm-relayer-sdk
- **Purpose**: Client-side encryption and relayer communication
- **Used for**: Creating encrypted inputs, WASM initialization

**Relayer Endpoint**
- **Testnet**: https://relayer.testnet.zama.cloud
- **Purpose**: Off-chain encryption service
- **Used for**: Generating encrypted proofs

## 🌐 Network Information

### Sepolia Testnet Configuration

**Network Details**
- **Chain ID**: 11155111
- **RPC URL**: https://rpc.sepolia.org/
- **Explorer**: https://sepolia.etherscan.io/
- **Faucet**: https://sepoliafaucet.com/

**FHEVM Infrastructure (Sepolia)**
- **Gateway Contract**: `0x7048C39f048125eDa9d678AEbaDfB22F7900a29F`
  - Explorer: https://sepolia.etherscan.io/address/0x7048C39f048125eDa9d678AEbaDfB22F7900a29F
  - Purpose: Handles decryption requests

- **KMS Verifier**: `0x1364cBBf2cDF5032C47d8226a6f6FBD2AFCDacAC`
  - Purpose: Key management and verification

- **ACL Contract**: `0x687820221192C5B662b25367F70076A37bc79b6c`
  - Purpose: Access control for encrypted data

### Example Deployed Contracts (Reference)

**Confidential Token Examples**
- **cUSD Token (ERC7984)**: `0x066E08fabeaB12965F5aD467bbBf6954B73B9d27`
  - Explorer: https://sepolia.etherscan.io/address/0x066E08fabeaB12965F5aD467bbBf6954B73B9d27
  - Type: Confidential stablecoin

- **cEUR Token (ERC7984)**: `0x60B5d3BFca0E45B65D5F0C1Ce15DB06f45c7AD5F`
  - Explorer: https://sepolia.etherscan.io/address/0x60B5d3BFca0E45B65D5F0C1Ce15DB06f45c7AD5F
  - Type: Confidential stablecoin

**CAMM (Confidential AMM) Example**
- **CAMM Pair Contract**: `0x0BfB47d6BB2a3b4383dAa30E32F92b891dAAEf98`
  - Explorer: https://sepolia.etherscan.io/address/0x0BfB47d6BB2a3b4383dAa30E32F92b891dAAEf98
  - Purpose: Reference implementation for DEX

- **Factory Contract**: `0xEF9B1AE63aB8d6e3D7512154079C4c0fe6EFd132`
- **Pair Library**: `0xEd3a54d970196e1665352554c68fd30afEf3b26f`

## 📖 Tutorials & Examples

### FHEVM Contracts Repository
- **GitHub**: https://github.com/zama-ai/fhevm-contracts/tree/main/contracts/amm
- **Content**: CAMM implementation, examples
- **Relevant for**: Understanding encrypted DEX patterns

### CAMM Documentation
- **Tutorial**: https://docs.zama.ai/fhevm/tutorials/see-all-tutorials#confidential-amm
- **Content**: Building confidential automated market makers
- **Relevant for**: Encrypted price calculations, liquidity pools

## 🛠 Development Tools

### Blockchain Development
- **Hardhat**: https://hardhat.org/
- **ethers.js v6**: https://docs.ethers.org/v6/

### Web3 Wallet Integration
- **MetaMask Documentation**: https://docs.metamask.io/
- **WalletConnect**: https://walletconnect.com/

### Frontend Frameworks
- **Next.js**: https://nextjs.org/
- **React**: https://react.dev/
- **TypeScript**: https://www.typescriptlang.org/

## 🎨 UI/UX Resources (Optional)

### Component Libraries
- **shadcn/ui**: https://ui.shadcn.com/
- **Radix UI**: https://www.radix-ui.com/
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Lucide Icons**: https://lucide.dev/

## 🔄 Integration Patterns

### EIP Standards Referenced
- **EIP-712 (Typed Structured Data)**: https://eips.ethereum.org/EIPS/eip-712
- **ERC-20 Token Standard**: https://eips.ethereum.org/EIPS/eip-20
- **ERC-721 NFT Standard**: https://eips.ethereum.org/EIPS/eip-721
- **ERC7984 (Confidential ERC20)**: Extended ERC-20 with FHE

### Key Patterns for NFT Marketplace

**1. Encrypted Input Creation**
```typescript
// Reference: https://docs.zama.ai/fhevm/guides/frontend#encrypting-inputs
const input = instance.createEncryptedInput(contractAddress, userAddress);
input.add64(bidAmount);
const encrypted = await input.encrypt();
```

**2. Gateway Decryption**
```solidity
// Reference: https://docs.zama.ai/fhevm/guides/decrypt
uint256 requestId = Gateway.requestDecryption(
    ciphertexts,
    callbackSelector,
    0,
    block.timestamp + 100,
    false
);
```

**3. User Reencryption (View Own Data)**
```solidity
// Reference: https://docs.zama.ai/fhevm/guides/decrypt#userDecrypt
function getUserBid(uint256 auctionId) public view returns (bytes memory) {
    euint64 userBid = userHighestBid[auctionId][msg.sender];
    return TFHE.reencrypt(userBid, msg.sender);
}
```

**4. Operator Approval Pattern**
```solidity
// Reference: https://docs.openzeppelin.com/contracts-for-zama/confidential-erc20#approvals-and-allowances
function approveEncrypted(address spender, einput encryptedAmount, bytes calldata inputProof) public {
    euint64 amount = TFHE.asEuint64(encryptedAmount, inputProof);
    _approve(msg.sender, spender, amount);
}
```

## 🔒 Security Best Practices

### OpenZeppelin Security Guidelines
- **Documentation**: https://docs.openzeppelin.com/contracts/
- **Best Practices**: https://consensys.github.io/smart-contract-best-practices/

### FHEVM-Specific Security
1. **Always use ACL**: Control who can decrypt what
2. **Minimize decryption**: Only decrypt when absolutely necessary
3. **Validate inputs**: Even encrypted inputs need validation
4. **Use established patterns**: Follow ERC7984 for tokens
5. **Test thoroughly**: Encryption adds complexity

## 🤝 Community & Support

### Official Channels
- **Zama Discord**: https://discord.com/invite/zama
- **Zama GitHub**: https://github.com/zama-ai
- **Zama Blog**: https://www.zama.ai/blog
- **Developer Program**: https://www.zama.ai/developer-program

### Getting Help
1. Check official documentation first
2. Search GitHub issues
3. Ask in Discord #developer-support channel
4. Review example contracts in fhevm-contracts repo

## 📊 Comparison: This Project vs Official Patterns

### Current Implementation
| Component | Current | Official Recommendation |
|-----------|---------|------------------------|
| Solidity Library | `fhevm` (older) | `@fhevm/solidity` |
| Frontend SDK | `fhevmjs` (older) | `@zama-fhe/relayer-sdk` |
| Network | Custom Zama network | Standard Sepolia |
| Relayer | Not used | Required |
| ethers Version | v6 | v6 (correct) |
| Token Standard | Custom | ERC7984 (for tokens) |

### Migration Path
See [MIGRATION_TO_OFFICIAL_SDK.md](MIGRATION_TO_OFFICIAL_SDK.md) for detailed migration instructions.

## 🗺 Roadmap & Future Updates

### Stay Updated
- **Zama Blog**: Check for new releases and features
- **GitHub Releases**: Watch @zama-ai repositories
- **Documentation**: Docs are regularly updated

### Upcoming Features (Check Official Sources)
- Mainnet deployment timeline
- Additional encrypted types
- Performance improvements
- New developer tools

## 📝 How to Use This Document

1. **Starting Development**: Review Core FHEVM Documentation
2. **Setting Up**: Use Network Information for configuration
3. **Writing Contracts**: Reference Integration Patterns
4. **Frontend Work**: Follow Frontend Libraries guides
5. **Deploying**: Use deployed infrastructure addresses
6. **Debugging**: Check Community & Support channels
7. **Migrating**: Follow Migration Guide if updating

## ⚠️ Important Notes

1. **Testnet Only**: All addresses are Sepolia testnet
2. **API Changes**: FHEVM is evolving - check for updates
3. **Gas Costs**: Encrypted operations are more expensive
4. **Decryption Time**: Gateway callbacks take time
5. **Browser Support**: WASM requires modern browsers

## 🔗 Quick Reference Links

**Must-Read Documentation**
1. FHEVM Overview: https://docs.zama.ai/fhevm
2. Frontend Guide: https://docs.zama.ai/fhevm/guides/frontend
3. Decryption Guide: https://docs.zama.ai/fhevm/guides/decrypt
4. ERC7984 Standard: https://docs.openzeppelin.com/contracts-for-zama/confidential-erc20

**Essential Code Examples**
1. FHEVM Contracts: https://github.com/zama-ai/fhevm-contracts
2. OZ Confidential: https://github.com/OpenZeppelin/openzeppelin-contracts-for-zama

**Infrastructure**
1. Relayer: https://relayer.testnet.zama.cloud
2. Gateway: `0x7048C39f048125eDa9d678AEbaDfB22F7900a29F`
3. Explorer: https://sepolia.etherscan.io/

---

**Last Updated**: November 13, 2025

**Note**: This document serves as a bridge between the current implementation and official Zama resources. Always refer to official documentation for the most up-to-date information.

**For migration instructions, see**: [MIGRATION_TO_OFFICIAL_SDK.md](MIGRATION_TO_OFFICIAL_SDK.md)
