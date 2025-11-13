'use client';

import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { CONTRACTS } from '@/lib/contracts';

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const [tokenURI, setTokenURI] = useState('');
  const [recipient, setRecipient] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { data: hash, writeContract } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  });

  const handleMint = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isConnected || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (!tokenURI) {
      alert('Please enter a token URI');
      return;
    }

    const mintTo = recipient || address;

    try {
      setIsLoading(true);

      writeContract({
        address: CONTRACTS.NFT.address,
        abi: CONTRACTS.NFT.abi,
        functionName: 'mint',
        args: [mintTo, tokenURI],
      });
    } catch (error) {
      console.error('Error minting NFT:', error);
      alert('Failed to mint NFT. Check console for details.');
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
            Mint Your NFT
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Create a new NFT that can be listed in confidential auctions
          </p>

          {!isConnected ? (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-800 dark:text-yellow-300">
                Please connect your wallet to mint NFTs
              </p>
            </div>
          ) : (
            <form onSubmit={handleMint} className="space-y-6">
              {/* Token URI */}
              <div>
                <label htmlFor="tokenURI" className="label">
                  Token URI *
                </label>
                <input
                  type="text"
                  id="tokenURI"
                  value={tokenURI}
                  onChange={(e) => setTokenURI(e.target.value)}
                  placeholder="ipfs://QmExample... or https://..."
                  className="input-field"
                  required
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  IPFS hash or URL pointing to your NFT metadata (JSON file)
                </p>
              </div>

              {/* Recipient Address */}
              <div>
                <label htmlFor="recipient" className="label">
                  Recipient Address (optional)
                </label>
                <input
                  type="text"
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={address || '0x...'}
                  className="input-field"
                />
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Leave empty to mint to your address
                </p>
              </div>

              {/* Metadata Example */}
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2">
                  📝 NFT Metadata Format (JSON):
                </p>
                <pre className="text-xs text-blue-800 dark:text-blue-400 overflow-x-auto">
                  {JSON.stringify(
                    {
                      name: 'My Confidential NFT',
                      description: 'A unique NFT for private auctions',
                      image: 'ipfs://QmImageHash...',
                      attributes: [
                        { trait_type: 'Rarity', value: 'Rare' },
                        { trait_type: 'Type', value: 'Art' },
                      ],
                    },
                    null,
                    2
                  )}
                </pre>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading || isConfirming || !tokenURI}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || isConfirming ? 'Minting...' : 'Mint NFT'}
              </button>

              {/* Success Message */}
              {isSuccess && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <p className="text-green-800 dark:text-green-300 font-semibold">
                    ✅ NFT minted successfully!
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

          {/* Info Section */}
          <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">
              Next Steps:
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">1.</span>
                Upload your NFT image and metadata to IPFS or a hosting service
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">2.</span>
                Use the IPFS hash or URL as the Token URI when minting
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">3.</span>
                After minting, you can create a confidential auction for your NFT
              </li>
              <li className="flex items-start">
                <span className="text-primary-600 mr-2">4.</span>
                View your NFTs in the "My NFTs" section
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
