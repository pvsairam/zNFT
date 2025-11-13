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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="card">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Create Confidential Auction
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            List your NFT in a private auction with encrypted reserve price
          </p>

          {!isConnected ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-300">
                Please connect your wallet to create auctions
              </p>
            </div>
          ) : !isInitialized ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-300">
                Initializing FHEVM... Please wait.
              </p>
            </div>
          ) : (
            <form onSubmit={handleCreateAuction} className="space-y-6">
              {/* NFT Contract */}
              <div>
                <label htmlFor="nftContract" className="label">
                  NFT Contract Address *
                </label>
                <input
                  type="text"
                  id="nftContract"
                  value={nftContract}
                  onChange={(e) => setNftContract(e.target.value)}
                  className="input-field"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Address of the NFT contract (defaults to marketplace NFT)
                </p>
              </div>

              {/* Token ID */}
              <div>
                <label htmlFor="tokenId" className="label">
                  Token ID *
                </label>
                <input
                  type="number"
                  id="tokenId"
                  value={tokenId}
                  onChange={(e) => setTokenId(e.target.value)}
                  placeholder="0"
                  className="input-field"
                  required
                  min="0"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  The ID of the NFT you want to auction (you must own this NFT)
                </p>
              </div>

              {/* Reserve Price */}
              <div>
                <label htmlFor="reservePrice" className="label">
                  Reserve Price (ETH) * 🔒
                </label>
                <input
                  type="number"
                  id="reservePrice"
                  value={reservePrice}
                  onChange={(e) => setReservePrice(e.target.value)}
                  placeholder="0.1"
                  step="0.001"
                  className="input-field"
                  required
                  min="0"
                />
                <p className="text-sm text-green-600 dark:text-green-400 mt-1 flex items-center">
                  <span className="mr-1">🔒</span>
                  This value will be encrypted - bidders won't see it
                </p>
              </div>

              {/* Duration */}
              <div>
                <label htmlFor="duration" className="label">
                  Auction Duration *
                </label>
                <select
                  id="duration"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="input-field"
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
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  How long the auction will run
                </p>
              </div>

              {/* Important Notes */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  ⚠️ Important:
                </p>
                <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1">
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
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-300 font-semibold">
                    ✅ Auction created successfully!
                  </p>
                  {hash && (
                    <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                      Transaction: {hash.slice(0, 10)}...{hash.slice(-8)}
                    </p>
                  )}
                </div>
              )}
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
