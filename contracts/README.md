# Smart Contracts

Solidity smart contracts for the Confidential NFT Marketplace using Zama's FHEVM.

## Contracts

### ConfidentialNFT.sol

Standard ERC721 NFT contract with auction status tracking.

**Key Features**:
- Mint NFTs with metadata URIs
- Track which NFTs are in auction
- Standard ERC721 functionality

**Main Functions**:

```solidity
function mint(address to, string memory uri) public returns (uint256)
function setTokenAuctionStatus(uint256 tokenId, bool inAuction) external
function isTokenInAuction(uint256 tokenId) external view returns (bool)
```

### ConfidentialAuction.sol

Encrypted auction contract using FHEVM.

**Key Features**:
- Encrypted reserve prices (euint64)
- Encrypted bids (euint64)
- Encrypted winner determination
- Gateway-based decryption
- ACL access control

**Main Functions**:

```solidity
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

## Development

### Compile

```bash
npm run compile
```

### Test

```bash
npm test
```

### Deploy

```bash
# Local
npm run deploy:local

# Zama Sepolia
npm run deploy:sepolia
```

## FHEVM Integration

### Encrypted Types

- `euint64`: Encrypted 64-bit unsigned integer
- `ebool`: Encrypted boolean
- `einput`: Encrypted input from client

### Operations

```solidity
// Comparison
ebool isGreater = TFHE.gt(a, b);
ebool isGreaterOrEqual = TFHE.ge(a, b);

// Selection
euint64 max = TFHE.select(isGreater, a, b);

// Access Control
TFHE.allow(value, address);
TFHE.allowThis(value);
```

### Gateway Decryption

```solidity
uint256 requestId = Gateway.requestDecryption(
    ciphertexts,
    callbackSelector,
    0,
    block.timestamp + 100,
    false
);
```

## Testing

Tests cover:
- NFT minting and ownership
- Auction creation
- Bid placement
- Winner determination
- Access control
- Edge cases

For full FHEVM encrypted tests, deploy to Zama testnet.

## Security

- Uses OpenZeppelin contracts
- ReentrancyGuard on state-changing functions
- Access control via ACL
- Gateway-only decryption callbacks

## Gas Optimization

- Efficient storage patterns
- Minimal on-chain computation
- Batch operations where possible

## License

MIT
