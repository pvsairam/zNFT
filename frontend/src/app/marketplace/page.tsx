'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { CONTRACTS, AuctionData } from '@/lib/contracts';

export default function MarketplacePage() {
  const { isConnected } = useAccount();
  const [auctions, setAuctions] = useState<Array<AuctionData & { id: number }>>([]);

  // Get auction counter
  const { data: auctionCounter } = useReadContract({
    address: CONTRACTS.AUCTION.address,
    abi: CONTRACTS.AUCTION.abi,
    functionName: 'auctionCounter',
  });

  useEffect(() => {
    if (auctionCounter) {
      // Fetch all auctions
      fetchAuctions(Number(auctionCounter));
    }
  }, [auctionCounter]);

  const fetchAuctions = async (count: number) => {
    const auctionList: Array<AuctionData & { id: number }> = [];

    // Fetch each auction's data
    // Note: In a production app, you'd want to use a subgraph or indexer
    // For now, we'll just show that auctions exist
    for (let i = 0; i < Math.min(count, 10); i++) {
      auctionList.push({
        id: i,
        seller: '0x...',
        nftContract: CONTRACTS.NFT.address,
        tokenId: BigInt(i),
        startTime: BigInt(Date.now() / 1000),
        endTime: BigInt(Date.now() / 1000 + 3600),
        ended: false,
        cancelled: false,
        winner: '0x0000000000000000000000000000000000000000',
        winningBidAmount: 0n,
        totalBids: 0n,
      });
    }

    setAuctions(auctionList);
  };

  const getTimeRemaining = (endTime: bigint) => {
    const now = BigInt(Math.floor(Date.now() / 1000));
    if (now >= endTime) return 'Ended';

    const remaining = Number(endTime - now);
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Confidential Auctions
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Browse and bid on NFTs with complete privacy
            </p>
          </div>

          <Link href="/create-auction" className="btn-primary">
            Create Auction
          </Link>
        </div>

        {!isConnected ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Connect your wallet to view and participate in auctions
            </p>
          </div>
        ) : auctionCounter === undefined || auctionCounter === 0n ? (
          <div className="card text-center py-12">
            <p className="text-2xl mb-4">🎨</p>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No auctions yet. Be the first to create one!
            </p>
            <Link href="/create-auction" className="btn-primary inline-block">
              Create First Auction
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: Number(auctionCounter) }).map((_, i) => (
              <AuctionCard key={i} auctionId={i} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function AuctionCard({ auctionId }: { auctionId: number }) {
  const { data: auctionData } = useReadContract({
    address: CONTRACTS.AUCTION.address,
    abi: CONTRACTS.AUCTION.abi,
    functionName: 'getAuction',
    args: [BigInt(auctionId)],
  });

  if (!auctionData) {
    return (
      <div className="card animate-pulse">
        <div className="h-48 bg-gray-300 dark:bg-gray-700 rounded mb-4"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 dark:bg-gray-700 rounded w-2/3"></div>
      </div>
    );
  }

  const [seller, nftContract, tokenId, startTime, endTime, ended, cancelled, winner, winningBidAmount, totalBids] = auctionData;

  const isActive = !ended && !cancelled && Date.now() / 1000 < Number(endTime);
  const timeRemaining = (() => {
    const now = Math.floor(Date.now() / 1000);
    if (ended) return 'Ended';
    if (now >= Number(endTime)) return 'Ended';

    const remaining = Number(endTime) - now;
    const hours = Math.floor(remaining / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);

    if (hours > 24) {
      return `${Math.floor(hours / 24)}d ${hours % 24}h`;
    }
    return `${hours}h ${minutes}m`;
  })();

  return (
    <Link href={`/auction/${auctionId}`}>
      <div className="card hover:shadow-xl transition-shadow cursor-pointer">
        {/* NFT Preview */}
        <div className="bg-gradient-to-br from-primary-400 to-primary-600 h-48 rounded-lg mb-4 flex items-center justify-center text-white text-6xl">
          🖼️
        </div>

        {/* Auction Info */}
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-900 dark:text-white">
              NFT #{tokenId.toString()}
            </h3>
            {isActive && (
              <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded">
                Active
              </span>
            )}
            {ended && (
              <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 text-xs px-2 py-1 rounded">
                Ended
              </span>
            )}
          </div>

          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p>Seller: {seller.slice(0, 6)}...{seller.slice(-4)}</p>
          </div>

          <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">Time Remaining</p>
              <p className="font-semibold text-gray-900 dark:text-white">{timeRemaining}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 dark:text-gray-400">Bids</p>
              <p className="font-semibold text-gray-900 dark:text-white">{totalBids.toString()}</p>
            </div>
          </div>

          {ended && winner !== '0x0000000000000000000000000000000000000000' && (
            <div className="bg-green-50 dark:bg-green-900/20 rounded p-2 text-xs">
              <p className="text-green-800 dark:text-green-300">
                Winner: {winner.slice(0, 6)}...{winner.slice(-4)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
