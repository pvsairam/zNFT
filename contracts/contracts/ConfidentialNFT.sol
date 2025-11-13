// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ConfidentialNFT
 * @dev ERC721 NFT contract for the Confidential NFT Marketplace
 * @notice This contract allows users to mint NFTs that can be auctioned
 * in the confidential marketplace with encrypted bids
 */
contract ConfidentialNFT is ERC721, ERC721URIStorage, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    // Mapping from token ID to creator address
    mapping(uint256 => address) public tokenCreator;

    // Mapping to track if a token is currently in auction
    mapping(uint256 => bool) public tokenInAuction;

    // Events
    event NFTMinted(uint256 indexed tokenId, address indexed creator, string tokenURI);
    event TokenAuctionStatusChanged(uint256 indexed tokenId, bool inAuction);

    constructor() ERC721("ConfidentialNFT", "CNFT") Ownable(msg.sender) {}

    /**
     * @dev Mints a new NFT
     * @param to Address that will receive the NFT
     * @param uri Metadata URI for the NFT
     * @return tokenId The ID of the newly minted token
     */
    function mint(address to, string memory uri) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        tokenCreator[tokenId] = msg.sender;

        emit NFTMinted(tokenId, msg.sender, uri);

        return tokenId;
    }

    /**
     * @dev Sets the auction status for a token
     * @param tokenId The token ID
     * @param inAuction Whether the token is in auction
     */
    function setTokenAuctionStatus(uint256 tokenId, bool inAuction) external {
        require(_ownerOf(tokenId) == msg.sender || owner() == msg.sender,
            "Only token owner or contract owner can change auction status");

        tokenInAuction[tokenId] = inAuction;
        emit TokenAuctionStatusChanged(tokenId, inAuction);
    }

    /**
     * @dev Checks if a token is currently in auction
     * @param tokenId The token ID to check
     * @return bool Whether the token is in auction
     */
    function isTokenInAuction(uint256 tokenId) external view returns (bool) {
        return tokenInAuction[tokenId];
    }

    /**
     * @dev Gets the creator of a token
     * @param tokenId The token ID
     * @return address The creator's address
     */
    function getCreator(uint256 tokenId) external view returns (address) {
        return tokenCreator[tokenId];
    }

    /**
     * @dev Gets the total number of minted tokens
     * @return uint256 The total supply
     */
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter.current();
    }

    // Override required functions
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
