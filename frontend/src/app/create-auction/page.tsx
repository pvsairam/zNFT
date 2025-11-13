'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { CONTRACTS } from '@/lib/contracts';
import { useFHEVM } from '@/contexts/FHEVMContext';
import { encryptReservePrice, ethToWei } from '@/lib/encryption';

export default function CreateAuctionPage() {
  const { address, isConnected } = useAccount();
  const { instance, isInitialized } = useFHEVM();
  const [nftContract, setNftContract] = useState(CONTRACTS.NFT.address);
  const [tokenId, setTokenId] = useState('');
  const [reservePrice, setReservePrice] = useState('');
  const [duration, setDuration] = useState('3600'); // 1 hour default
  const [isLoading, setIsLoading] = useState(false);

  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleCreateAuction = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (!isInitialized || !instance) {
      alert('FHEVM not initialized. Please wait or refresh the page.');
      return;
    }

    if (!tokenId || !reservePrice || !duration) {
      alert('Please fill in all fields');
      return;
    }

    try {
      setIsLoading(true);

      // Convert reserve price to wei
      const reservePriceWei = ethToWei(reservePrice);

      // Encrypt reserve price
      console.log('Encrypting reserve price...');
      const { encryptedInput, inputProof } = await encryptReservePrice(
        instance,
        CONTRACTS.AUCTION.address,
        address,
        reservePriceWei
      );

      console.log('Creating auction...');

      // Create auction with encrypted reserve price
      writeContract({
        address: CONTRACTS.AUCTION.address,
        abi: CONTRACTS.AUCTION.abi,
        functionName: 'createAuction',
        args: [
          nftContract,
          BigInt(tokenId),
          encryptedInput,
          inputProof,
          BigInt(duration),
        ],
      });
    } catch (error) {
      console.error('Error creating auction:', error);
      alert(`Failed to create auction: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent mb-3">
              Create Confidential Auction
            </h1>
            <p className="text-slate-400 text-lg flex items-center">
              <svg className="w-5 h-5 mr-2 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              List your NFT in a private auction with encrypted reserve price
            </p>
          </div>

          {!isConnected ? (
            <div className="glass-card p-6 border-amber-500/30 bg-amber-500/10">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-amber-300">
                  Please connect your wallet to create auctions
                </p>
              </div>
            </div>
          ) : !isInitialized ? (
            <div className="glass-card p-6 border-cyan-500/30 bg-cyan-500/10">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-cyan-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <p className="text-cyan-300">
                  Initializing FHEVM... Please wait.
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleCreateAuction} className="space-y-6">
              {/* NFT Contract */}
              <div>
                <label htmlFor="nftContract" className="block text-sm font-semibold text-slate-300 mb-2">
                  NFT Contract Address *
                </label>
                <input
                  type="text"
                  id="nftContract"
                  value={nftContract}
                  onChange={(e) => setNftContract(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all font-mono text-sm"
                  required
                />
                <p className="text-sm text-slate-500 mt-2">
                  Address of the NFT contract (defaults to marketplace NFT)
                </p>
              </div>

              {/* Token ID */}
              <div>
                <label htmlFor="tokenId" className="block text-sm font-semibold text-slate-300 mb-2">
                  Token ID *
                </label>
                <input
                  type="number"
                  id="tokenId"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  required
                  min="0"
                />
                <p className="text-sm text-slate-500 mt-2">
                  The ID of the NFT you want to auction (you must own this NFT)
                </p>
              </div>

              {/* Reserve Price */}
              <div>
                <label htmlFor="reservePrice" className="block text-sm font-semibold text-slate-300 mb-2 flex items-center">
                  Reserve Price (ETH) *
                  <svg className="w-4 h-4 ml-2 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </label>
                <input
                  type="number"
                  id="reservePrice"
                  value={reservePrice}
                  onChange={(e) => setReservePrice(e.target.value)}
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
                  This value will be encrypted - bidders won't see it
                </p>
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="block text-sm font-semibold text-slate-300 mb-2">
                  Auction Duration *
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  required
                >
                  <option value="3600">1 Hour</option>
                  <option value="10800">3 Hours</option>
                  <option value="21600">6 Hours</option>
                  <option value="43200">12 Hours</option>
                  <option value="86400">1 Day</option>
                  <option value="259200">3 Days</option>
                  <option value="604800">7 Days</option>
                </select>
                <p className="text-sm text-slate-500 mt-2">
                  How long the auction will run
                </p>
              </div>

              {/* Important Notes */}
              <div className="glass-card p-5 border-amber-500/30 bg-amber-500/5">
                <p className="text-sm font-semibold text-amber-300 mb-3 flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  Important:
                </p>
                <ul className="text-sm text-amber-200 space-y-2">
                  <li>• You must approve the auction contract to transfer your NFT first</li>
                  <li>• The NFT will be locked in the auction contract during the auction</li>
                  <li>• Reserve price is encrypted - only revealed if not met at auction end</li>
                  <li>• You cannot cancel an auction once bids are placed</li>
                </ul>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isConfirming}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || isConfirming ? 'Creating Auction...' : 'Create Auction'}
              </button>

              {/* Success Message */}
              {isSuccess && (
                <div className="glass-card p-5 border-emerald-500/30 bg-emerald-500/10">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-emerald-300 font-semibold mb-1">
                        Auction created successfully!
                      </p>
                      {hash && (
                        <p className="text-sm text-emerald-400/80 font-mono">
                          Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
