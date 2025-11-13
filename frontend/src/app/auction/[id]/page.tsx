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
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="card">
            <p className="text-center text-gray-600 dark:text-gray-400">Loading auction...</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Left Column - NFT Display */}
          <div className="card">
            <div className="bg-gradient-to-br from-primary-400 to-primary-600 aspect-square rounded-lg flex items-center justify-center text-white text-9xl mb-4">
              🖼️
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              NFT #{tokenId.toString()}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Contract: {nftContract.slice(0, 6)}...{nftContract.slice(-4)}
            </p>
          </div>

          {/* Right Column - Auction Info */}
          <div className="space-y-6">
            {/* Status Card */}
            <div className="card">
              <div className="flex justify-between items-start mb-4">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Auction #{auctionId}
                </h1>
                {isActive && (
                  <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 px-3 py-1 rounded-full text-sm font-semibold">
                    Active
                  </span>
                )}
                {ended && (
                  <span className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 px-3 py-1 rounded-full text-sm font-semibold">
                    Ended
                  </span>
                )}
                {cancelled && (
                  <span className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-300 px-3 py-1 rounded-full text-sm font-semibold">
                    Cancelled
                  </span>
                )}
              </div>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Seller</span>
                  <span className="font-mono text-gray-900 dark:text-white">
                    {seller.slice(0, 6)}...{seller.slice(-4)}
                    {isSeller && <span className="ml-2 text-primary-600">(You)</span>}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Time Remaining</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {getTimeRemaining()}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Total Bids 🔒</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {totalBids.toString()}
                  </span>
                </div>

                {ended && winner !== '0x0000000000000000000000000000000000000000' && (
                  <>
                    <div className="flex justify-between pt-3 border-t border-gray-200 dark:border-gray-700">
                      <span className="text-gray-600 dark:text-gray-400">Winner</span>
                      <span className="font-mono text-gray-900 dark:text-white">
                        {winner.slice(0, 6)}...{winner.slice(-4)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Winning Bid</span>
                      <span className="font-bold text-gray-900 dark:text-white">
                        {weiToEth(winningBidAmount)} ETH
                      </span>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Bid Form or End Auction */}
            {isActive && !isSeller && isConnected && (
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Place Encrypted Bid 🔒
                </h3>
                <form onSubmit={handlePlaceBid} className="space-y-4">
                  <div>
                    <label htmlFor="bidAmount" className="label">
                      Bid Amount (ETH)
                    </label>
                    <input
                      type="number"
                      id="bidAmount"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      placeholder="0.1"
                      step="0.001"
                      className="input-field"
                      required
                      min="0"
                    />
                    <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center">
                      <span className="mr-1">🔒</span>
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
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
                      <p className="text-green-800 dark:text-green-300 text-sm font-semibold">
                        ✅ Bid placed successfully!
                      </p>
                    </div>
                  )}
                </form>
              </div>
            )}

            {canEnd && (
              <div className="card">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Auction Has Ended
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  The auction time has expired. Anyone can finalize the auction to determine the
                  winner.
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
              <div className="card bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800">
                <p className="text-yellow-800 dark:text-yellow-300">
                  Connect your wallet to place bids
                </p>
              </div>
            )}

            {isSeller && isActive && (
              <div className="card bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
                <p className="text-blue-800 dark:text-blue-300">
                  This is your auction. You cannot bid on your own NFT.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bid History */}
        <div className="card mt-8">
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Bid Activity 🔒
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Total encrypted bids: <span className="font-semibold">{bidCount?.toString() || '0'}</span>
          </p>
          <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4 text-center">
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              🔒 All bid amounts are encrypted and hidden until the auction ends
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
