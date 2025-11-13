'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { CONTRACTS } from '@/lib/contracts';
import { useFHEVM } from '@/contexts/FHEVMContext';
import { encryptBid, ethToWei, weiToEth } from '@/lib/encryption';

export default function AuctionDetailPage() {
  const params = useParams();
  const auctionId = params.id as string;
  const { address, isConnected } = useAccount();
  const { instance, isInitialized } = useFHEVM();
  const [bidAmount, setBidAmount] = useState('');
  const [isPlacingBid, setIsPlacingBid] = useState(false);
  const [isEnding, setIsEnding] = useState(false);

  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  // Get auction data
  const { data: auctionData, refetch: refetchAuction } = useReadContract({
    address: CONTRACTS.AUCTION.address,
    abi: CONTRACTS.AUCTION.abi,
    functionName: 'getAuction',
    args: [BigInt(auctionId)],
  });

  // Get bid count
  const { data: bidCount, refetch: refetchBidCount } = useReadContract({
    address: CONTRACTS.AUCTION.address,
    abi: CONTRACTS.AUCTION.abi,
    functionName: 'getBidCount',
    args: [BigInt(auctionId)],
  });

  // Auto-refresh data
  useEffect(() => {
    const interval = setInterval(() => {
      refetchAuction();
      refetchBidCount();
    }, 10000); // Refresh every 10 seconds

    return () => clearInterval(interval);
  }, [refetchAuction, refetchBidCount]);

  if (!auctionData) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="glass-card p-12 text-center">
            <svg className="w-12 h-12 mx-auto text-primary-400 animate-spin mb-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-slate-400">Loading auction...</p>
          </div>
        </main>
      </div>
    );
  }

  const [
    seller,
    nftContract,
    tokenId,
    startTime,
    endTime,
    ended,
    cancelled,
    winner,
    winningBidAmount,
    totalBids,
  ] = auctionData;

  const now = Math.floor(Date.now() / 1000);
  const isActive = !ended && !cancelled && now >= Number(startTime) && now < Number(endTime);
  const canEnd = !ended && !cancelled && now >= Number(endTime);
  const isSeller = address?.toLowerCase() === seller.toLowerCase();

  const handlePlaceBid = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (!isInitialized || !instance) {
      alert('FHEVM not initialized. Please wait or refresh the page.');
      return;
    }

    if (!bidAmount) {
      alert('Please enter a bid amount');
      return;
    }

    try {
      setIsPlacingBid(true);

      const bidWei = ethToWei(bidAmount);

      console.log('Encrypting bid amount...');
      const { encryptedInput, inputProof } = await encryptBid(
        instance,
        CONTRACTS.AUCTION.address,
        address,
        bidWei
      );

      console.log('Placing bid...');
      writeContract({
        address: CONTRACTS.AUCTION.address,
        abi: CONTRACTS.AUCTION.abi,
        functionName: 'placeBid',
        args: [BigInt(auctionId), encryptedInput, inputProof],
      });

      setBidAmount('');
    } catch (error) {
      console.error('Error placing bid:', error);
      alert(`Failed to place bid: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsPlacingBid(false);
    }
  };

  const handleEndAuction = async () => {
    if (!isConnected) {
      alert('Please connect your wallet');
      return;
    }

    try {
      setIsEnding(true);

      console.log('Ending auction...');
      writeContract({
        address: CONTRACTS.AUCTION.address,
        abi: CONTRACTS.AUCTION.abi,
        functionName: 'endAuction',
        args: [BigInt(auctionId)],
      });
    } catch (error) {
      console.error('Error ending auction:', error);
      alert(`Failed to end auction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsEnding(false);
    }
  };

  const getTimeRemaining = () => {
    if (ended) return 'Ended';
    if (now >= Number(endTime)) return 'Awaiting finalization';

    const remaining = Number(endTime) - now;
    const days = Math.floor(remaining / 86400);
    const hours = Math.floor((remaining % 86400) / 3600);
    const minutes = Math.floor((remaining % 3600) / 60);
    const seconds = remaining % 60;

    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    return `${minutes}m ${seconds}s`;
  };

  const gradients = ['nft-gradient', 'nft-gradient-alt', 'nft-gradient-fire', 'nft-gradient-ocean'];
  const gradient = gradients[Number(auctionId) % gradients.length];

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - NFT Display */}
          <div className="glass-card p-6">
            <div className={`aspect-square ${gradient} rounded-2xl relative overflow-hidden mb-6`}>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-48 h-48 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
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
            <h2 className="text-2xl font-bold text-white mb-2">
              NFT #{tokenId.toString()}
            </h2>
            <p className="text-slate-400 text-sm font-mono">
              {nftContract.slice(0, 6)}...{nftContract.slice(-4)}
            </p>
          </div>

          {/* Right Column - Auction Info */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="glass-card p-6">
              <div className="flex justify-between items-start mb-6">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">
                  Auction #{auctionId}
                </h1>
                {isActive && (
                  <span className="badge badge-success">
                    <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2 animate-pulse"></span>
                    Live
                  </span>
                )}
                {ended && (
                  <span className="badge bg-slate-800/80 text-slate-300 border-slate-700">
                    Ended
                  </span>
                )}
                {cancelled && (
                  <span className="badge badge-error">
                    Cancelled
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-slate-400">Seller</span>
                  <span className="font-mono text-white">
                    {seller.slice(0, 6)}...{seller.slice(-4)}
                    {isSeller && <span className="ml-2 text-primary-400">(You)</span>}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-slate-400">Time Remaining</span>
                  <span className="font-semibold text-white">
                    {getTimeRemaining()}
                  </span>
                </div>

                <div className="flex justify-between items-center pb-3 border-b border-white/10">
                  <span className="text-slate-400 flex items-center">
                    Total Bids
                    <svg className="w-4 h-4 ml-1 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <span className="font-semibold text-white">
                    {totalBids.toString()}
                  </span>
                </div>

                {ended && winner !== '0x0000000000000000000000000000000000000000' && (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 mt-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-emerald-400 font-semibold">Winner</span>
                      <span className="font-mono text-white">
                        {winner.slice(0, 6)}...{winner.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-400 font-semibold">Winning Bid</span>
                      <span className="font-bold text-white text-lg">
                        {weiToEth(winningBidAmount)} ETH
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bid Form or End Auction */}
            {isActive && !isSeller && isConnected && (
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  Place Encrypted Bid
                </h3>
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div>
                    <label htmlFor="bidAmount" className="block text-sm font-semibold text-slate-300 mb-2">
                      Bid Amount (ETH)
                    </label>
                    <input
                      type="number"
                      id="bidAmount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="0.1"
                      step="0.001"
                      className="w-full px-4 py-3 bg-slate-900/50 border border-accent-500/30 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-accent-500/50 focus:border-accent-500/50 transition-all"
                      required
                      min="0"
                    />
                    <p className="text-sm text-accent-400 mt-2 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      Your bid will be encrypted - others cannot see it
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={isPlacingBid || isConfirming || !isInitialized}
                    className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPlacingBid || isConfirming ? 'Placing Bid...' : 'Place Encrypted Bid'}
                  </button>

                  {isSuccess && (
                    <div className="glass-card p-4 border-emerald-500/30 bg-emerald-500/10">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="text-emerald-300 text-sm font-semibold">
                          Bid placed successfully!
                        </p>
                      </div>
                    </div>
                  )}
                </form>
              </div>
            )}

            {canEnd && (
              <div className="glass-card p-6">
                <h3 className="text-xl font-bold text-white mb-3 flex items-center">
                  <svg className="w-6 h-6 mr-2 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Auction Has Ended
                </h3>
                <p className="text-slate-400 mb-4">
                  The auction time has expired. Anyone can finalize the auction to determine the winner.
                </p>
                <button
                  onClick={handleEndAuction}
                  disabled={isEnding}
                  className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEnding ? 'Ending Auction...' : 'End Auction & Determine Winner'}
                </button>
              </div>
            )}

            {!isConnected && isActive && (
              <div className="glass-card p-5 border-amber-500/30 bg-amber-500/10">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-amber-300">
                    Connect your wallet to place bids
                  </p>
                </div>
              </div>
            )}

            {isSeller && isActive && (
              <div className="glass-card p-5 border-cyan-500/30 bg-cyan-500/10">
                <div className="flex items-center space-x-3">
                  <svg className="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-cyan-300">
                    This is your auction. You cannot bid on your own NFT.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bid History */}
        <div className="glass-card p-6 mt-8">
          <h3 className="text-xl font-bold text-white mb-4 flex items-center">
            <svg className="w-6 h-6 mr-2 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            Bid Activity
          </h3>
          <p className="text-slate-400 mb-4">
            Total encrypted bids: <span className="font-semibold text-white">{bidCount?.toString() || '0'}</span>
          </p>
          <div className="bg-slate-900/50 border border-accent-500/20 rounded-xl p-6 text-center">
            <svg className="w-12 h-12 mx-auto text-accent-400/50 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-accent-400 text-sm">
              All bid amounts are encrypted and hidden until the auction ends
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
