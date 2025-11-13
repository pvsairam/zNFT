/**
 * Contract addresses and ABIs
 */

export const CONTRACTS = {
  NFT: {
    address: (process.env.NEXT_PUBLIC_NFT_CONTRACT_ADDRESS ||
      '0x0000000000000000000000000000000000000000') as `0x${string}`,
    abi: [
      'function mint(address to, string memory uri) public returns (uint256)',
      'function ownerOf(uint256 tokenId) public view returns (address)',
      'function tokenURI(uint256 tokenId) public view returns (string memory)',
      'function approve(address to, uint256 tokenId) public',
      'function getApproved(uint256 tokenId) public view returns (address)',
      'function totalSupply() public view returns (uint256)',
      'function balanceOf(address owner) public view returns (uint256)',
      'function isTokenInAuction(uint256 tokenId) public view returns (bool)',
      'event NFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI)',
    ],
  },
  AUCTION: {
    address: (process.env.NEXT_PUBLIC_AUCTION_CONTRACT_ADDRESS ||
      '0x0000000000000000000000000000000000000000') as `0x${string}`,
    abi: [
      'function createAuction(address nftContract, uint256 tokenId, bytes memory encryptedReservePrice, bytes memory inputProof, uint64 duration) public returns (uint256)',
      'function placeBid(uint256 auctionId, bytes memory encryptedBid, bytes memory inputProof) public payable',
      'function endAuction(uint256 auctionId) public',
      'function cancelAuction(uint256 auctionId) public',
      'function getAuction(uint256 auctionId) public view returns (address seller, address nftContract, uint256 tokenId, uint64 startTime, uint64 endTime, bool ended, bool cancelled, address winner, uint256 winningBidAmount, uint256 totalBids)',
      'function getBidCount(uint256 auctionId) public view returns (uint256)',
      'function isAuctionActive(uint256 auctionId) public view returns (bool)',
      'function auctionCounter() public view returns (uint256)',
      'event AuctionCreated(uint256 indexed auctionId, address indexed seller, address indexed nftContract, uint256 tokenId, uint64 startTime, uint64 endTime)',
      'event BidPlaced(uint256 indexed auctionId, address indexed bidder, uint64 timestamp)',
      'event AuctionEnded(uint256 indexed auctionId, address indexed winner, uint256 winningBid)',
    ],
  },
} as const;

export type AuctionData = {
  seller: string;
  nftContract: string;
  tokenId: bigint;
  startTime: bigint;
  endTime: bigint;
  ended: boolean;
  cancelled: boolean;
  winner: string;
  winningBidAmount: bigint;
  totalBids: bigint;
};
