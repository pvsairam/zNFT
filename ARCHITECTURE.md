# 🏗 Architecture Overview

Detailed technical architecture of the Confidential NFT Marketplace.

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         User Interface                           │
│                   (Next.js 14 + React)                          │
└───────────────────┬─────────────────────────────────────────────┘
                    │
                    │ fhevmjs (Client-Side Encryption)
                    │
┌───────────────────▼─────────────────────────────────────────────┐
│                    Blockchain Layer                              │
│                  (Zama FHEVM Network)                           │
│                                                                  │
│  ┌──────────────────┐          ┌──────────────────┐            │
│  │  ConfidentialNFT │          │ConfidentialAuction│            │
│  │    (ERC721)      │◄─────────│   (FHEVM Logic)   │            │
│  └──────────────────┘          └──────────────────┘            │
│           │                              │                      │
│           │                              │ Encrypted Operations │
│           │                              ▼                      │
│           │                    ┌──────────────────┐            │
│           │                    │  TFHE Library    │            │
│           │                    │  (euint, ebool)  │            │
│           │                    └──────────────────┘            │
│           │                              │                      │
│           │                              │ Decryption Request   │
│           │                              ▼                      │
│           │                    ┌──────────────────┐            │
│           └────────────────────► Gateway Contract │            │
│                                └──────────────────┘            │
└──────────────────────────────────────┬───────────────────────────┘
                                       │
                                       │ ACL-Based Decryption
                                       │
                              ┌────────▼────────┐
                              │  Zama Gateway   │
                              │   (Off-chain)   │
                              └─────────────────┘
```

## Component Breakdown

### Frontend Layer

**Technology**: Next.js 14 App Router, React 18, TypeScript

**Components**:
- **Pages**: `/mint`, `/marketplace`, `/auction/[id]`, `/create-auction`, `/my-nfts`
- **Contexts**: FHEVMContext for encryption instance management
- **Libraries**: Wagmi for wallet connection, Viem for blockchain interactions

**Responsibilities**:
- User interface and interaction
- Wallet connection management
- Client-side encryption using fhevmjs
- Transaction submission
- Real-time auction monitoring

### Smart Contract Layer

#### ConfidentialNFT Contract

**Type**: ERC721 Token

**Storage**:
```solidity
mapping(uint256 => address) public tokenCreator;
mapping(uint256 => bool) public tokenInAuction;
```

**Flow**:
1. User calls `mint(to, uri)` → NFT created
2. Token ID increments via Counter
3. Creator tracked for royalties/attribution
4. Auction status managed by auction contract

#### ConfidentialAuction Contract

**Type**: FHEVM-Enabled Auction System

**Storage**:
```solidity
struct Auction {
    address seller;
    address nftContract;
    uint256 tokenId;
    euint64 reservePrice;     // Encrypted!
    uint64 startTime;
    uint64 endTime;
    bool ended;
    bool cancelled;
    address winner;
    uint256 winningBidAmount;
    uint256 totalBids;
}

struct Bid {
    address bidder;
    euint64 amount;           // Encrypted!
    uint64 timestamp;
}

mapping(uint256 => Auction) public auctions;
mapping(uint256 => Bid[]) public auctionBids;
mapping(uint256 => mapping(address => euint64)) public userHighestBid;
```

**Encrypted Operations**:
1. Reserve price encrypted by seller
2. Bids encrypted by bidders
3. Comparisons done on encrypted values
4. Winner determined through encrypted max finding
5. Only winning bid decrypted via Gateway

### FHEVM Encryption Layer

#### Client-Side (fhevmjs)

```typescript
// Initialize instance
const instance = await createInstance({
  chainId: 8009,
  networkUrl: rpcUrl,
  gatewayUrl: gatewayUrl,
});

// Create encrypted input
const input = instance.createEncryptedInput(contractAddress, userAddress);
const encrypted = input.add64(value).encrypt();

// Returns:
{
  handles: string[],      // Encrypted values
  inputProof: string      // Zero-knowledge proof
}
```

#### Contract-Side (TFHE Library)

```solidity
// Convert encrypted input
euint64 value = TFHE.asEuint64(encryptedInput, inputProof);

// Encrypted operations
ebool isGreater = TFHE.gt(bid1, bid2);
euint64 max = TFHE.select(isGreater, bid1, bid2);

// Access control
TFHE.allowThis(value);
TFHE.allow(value, userAddress);
```

### Gateway & Decryption

**Flow**:
1. Contract requests decryption: `Gateway.requestDecryption()`
2. Gateway receives request with ciphertexts
3. Off-chain KMS decrypts (if ACL permits)
4. Gateway calls contract callback with plaintext
5. Contract processes decrypted value

**Security**:
- Only authorized addresses can decrypt
- ACL enforced by KMS
- Callback only from Gateway contract
- Time-bounded decryption requests

## Data Flow

### Creating an Auction

```
User (Frontend)
    │
    ├─► 1. Select NFT & set reserve price
    │
    ├─► 2. Encrypt reserve price with fhevmjs
    │         input.add64(reservePrice).encrypt()
    │
    ├─► 3. Approve NFT transfer
    │         nft.approve(auctionContract, tokenId)
    │
    └─► 4. Call createAuction()
           auction.createAuction(
               nftAddress,
               tokenId,
               encryptedReserve,
               inputProof,
               duration
           )
                │
                ▼
        Smart Contract
                │
                ├─► 5. Convert to euint64
                │       TFHE.asEuint64(encryptedReserve, proof)
                │
                ├─► 6. Set ACL permissions
                │       TFHE.allowThis(), TFHE.allow()
                │
                ├─► 7. Transfer NFT to contract
                │       nft.transferFrom()
                │
                └─► 8. Create auction record
                        Store in mapping
```

### Placing a Bid

```
Bidder (Frontend)
    │
    ├─► 1. Enter bid amount
    │
    ├─► 2. Encrypt bid with fhevmjs
    │         input.add64(bidAmount).encrypt()
    │
    └─► 3. Call placeBid()
           auction.placeBid(
               auctionId,
               encryptedBid,
               inputProof
           )
                │
                ▼
        Smart Contract
                │
                ├─► 4. Validate auction is active
                │
                ├─► 5. Convert to euint64
                │       TFHE.asEuint64(encryptedBid, proof)
                │
                ├─► 6. Compare with previous highest
                │       isHigher = TFHE.gt(newBid, currentHighest)
                │
                ├─► 7. Update user's highest bid
                │       highest = TFHE.select(isHigher, newBid, old)
                │
                └─► 8. Store encrypted bid
                        auctionBids[id].push(bid)
```

### Ending Auction & Winner Selection

```
Anyone
    │
    └─► 1. Call endAuction(auctionId)
                │
                ▼
        Smart Contract
                │
                ├─► 2. Validate auction expired
                │
                ├─► 3. Find highest bid (encrypted)
                │       Loop through bids
                │       Use TFHE.gt() and TFHE.select()
                │
                ├─► 4. Check reserve met (encrypted)
                │       meetsReserve = TFHE.ge(highest, reserve)
                │
                ├─► 5. Request decryption
                │       requestId = Gateway.requestDecryption(
                │           [highestBid, meetsReserve],
                │           callbackSelector
                │       )
                │
                └─► 6. Wait for callback...
                            │
                            ▼
                    Gateway (Off-chain)
                            │
                            ├─► 7. Verify ACL permissions
                            │
                            ├─► 8. Decrypt values
                            │
                            └─► 9. Call callback
                                       │
                                       ▼
                            Smart Contract
                                       │
                                       ├─► 10. Receive decrypted values
                                       │
                                       ├─► 11. Determine winner
                                       │
                                       ├─► 12. Transfer NFT to winner
                                       │
                                       └─► 13. Emit events
```

## Security Model

### Threat Model

**Protected Against**:
- Bid amount disclosure to other bidders
- Reserve price disclosure to bidders
- Front-running based on bid values
- MEV attacks targeting auction outcomes

**Trust Assumptions**:
- Zama Gateway operates correctly
- KMS is secure and doesn't collude
- Smart contract code is bug-free
- FHEVM library is secure

### Access Control

**ACL Hierarchy**:
```
euint64 encryptedValue
    │
    ├─► Contract (TFHE.allowThis)
    │       Can perform operations
    │
    ├─► Owner (TFHE.allow)
    │       Can request decryption
    │
    └─► Authorized Addresses
            Can be granted access
```

**Decryption Authorization**:
- Only Gateway can call decryption callbacks
- Only authorized addresses in ACL can decrypt
- Time-bounded decryption requests
- One-time use decryption proofs

## Performance Considerations

### Gas Costs

**Approximate Gas Usage** (Zama testnet):
- Create Auction: ~500k gas (includes encryption)
- Place Bid: ~300k gas (includes encryption)
- End Auction: ~400k gas (includes decryption request)

**Optimization Strategies**:
- Batch operations where possible
- Minimize encrypted operations
- Use appropriate integer sizes (euint32 vs euint64)
- Cache frequently accessed values

### Scalability

**Current Limitations**:
- One auction at a time per NFT
- Linear search through bids
- Gateway throughput limits

**Future Improvements**:
- Index auctions off-chain (The Graph)
- Batch winner determination
- Optimistic execution patterns

## Upgradability

**Current Implementation**: Non-upgradeable contracts

**Considerations for V2**:
- Proxy pattern for upgradeability
- Versioned auction formats
- Backward compatibility
- Data migration strategies

## Monitoring & Observability

### Events

All major actions emit events:
```solidity
event AuctionCreated(uint256 indexed auctionId, ...);
event BidPlaced(uint256 indexed auctionId, address indexed bidder, ...);
event AuctionEnded(uint256 indexed auctionId, address winner, uint256 amount);
```

### Recommended Monitoring

- Transaction success rates
- Gas usage patterns
- Auction participation rates
- Average time to end auction
- Gateway callback latency

## Future Enhancements

### Roadmap

1. **V1.1**: Batch operations, better winner tracking
2. **V2.0**: Multi-token auctions, English auctions
3. **V3.0**: Sealed-bid auctions, proxy bidding
4. **V4.0**: Cross-chain auctions, L2 integration

### Research Areas

- Optimistic FHE operations
- ZK-SNARK integration
- Decentralized Gateway
- Homomorphic auction mechanisms

---

**For implementation details, see source code and inline documentation.**
