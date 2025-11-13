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
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent mb-2">
              Confidential Auctions
            </h1>
            <p className="text-slate-400 flex items-center">
              <svg className="w-5 h-5 mr-2 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Browse and bid on NFTs with complete privacy
            </p>
          </div>

          <Link href="/create-auction" className="btn-primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create Auction
          </Link>
        </div>

        {!isConnected ? (
          <div className="glass-card p-12 text-center">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-primary-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Connect Your Wallet</h3>
            <p className="text-slate-400">
              Connect your wallet to view and participate in auctions
            </p>
          </div>
        ) : auctionCounter === undefined || auctionCounter === 0n ? (
          <div className="glass-card p-12 text-center">
            <div className="mb-6">
              <svg className="w-20 h-20 mx-auto text-accent-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Auctions Yet</h3>
            <p className="text-slate-400 mb-6">
              No auctions yet. Be the first to create one!
            </p>
            <Link href="/create-auction" className="btn-primary inline-flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
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
      <div className="glass-card p-6 animate-pulse">
        <div className="aspect-square rounded-xl bg-slate-800/50 mb-4"></div>
        <div className="h-6 bg-slate-800/50 rounded mb-2"></div>
        <div className="h-4 bg-slate-800/50 rounded w-2/3"></div>
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

  const gradients = ['nft-gradient', 'nft-gradient-alt', 'nft-gradient-fire', 'nft-gradient-ocean'];
  const gradient = gradients[auctionId % gradients.length];

  return (
    <Link href={`/auction/${auctionId}`} className="group">
      <div className="glass-card p-0 overflow-hidden group-hover:scale-[1.02] transition-transform duration-300">
        {/* NFT Preview */}
        <div className={`aspect-square ${gradient} relative overflow-hidden`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-32 h-32 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>

          {/* Status Badge */}
          <div className="absolute top-4 right-4">
            {isActive ? (
              <span className="badge badge-success">
                <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                Live
              </span>
            ) : (
              <span className="badge bg-slate-800/80 text-slate-300 border-slate-700">
                Ended
              </span>
            )}
          </div>

          {/* Encrypted Badge */}
          <div className="absolute bottom-4 left-4">
            <span className="badge badge-info">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Encrypted
            </span>
          </div>
        </div>

        {/* Auction Info */}
        <div className="p-5 space-y-4">
          <div>
            <h3 className="text-xl font-bold text-white mb-1">
              NFT #{tokenId.toString()}
            </h3>
            <p className="text-sm text-slate-400 font-mono">
              {seller.slice(0, 6)}...{seller.slice(-4)}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-slate-900/50 rounded-lg p-3 border border-white/5">
              <p className="text-xs text-slate-400 mb-1">Time Left</p>
              <p className="font-semibold text-white">{timeRemaining}</p>
            </div>
            <div className="bg-slate-900/50 rounded-lg p-3 border border-white/5">
              <p className="text-xs text-slate-400 mb-1">Bids</p>
              <p className="font-semibold text-white">{totalBids.toString()} 🔐</p>
            </div>
          </div>

          {/* Winner Info */}
          {ended && winner !== '0x0000000000000000000000000000000000000000' && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-3">
              <p className="text-xs text-emerald-400 mb-1">Winner</p>
              <p className="text-sm font-mono text-white">
                {winner.slice(0, 8)}...{winner.slice(-6)}
              </p>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
