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
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="glass-card p-8">
          <div className="mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent mb-3">
              Mint Your NFT
            </h1>
            <p className="text-slate-400 text-lg">
              Create a new NFT that can be listed in confidential auctions
            </p>
          </div>

          {!isConnected ? (
            <div className="glass-card p-6 border-amber-500/30 bg-amber-500/10">
              <div className="flex items-center space-x-3">
                <svg className="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-amber-300">
                  Please connect your wallet to mint NFTs
                </p>
              </div>
            </div>
          ) : (
            <form onSubmit={handleMint} className="space-y-6">
              {/* Token URI */}
              <div>
                <label htmlFor="tokenURI" className="block text-sm font-semibold text-slate-300 mb-2">
                  Token URI *
                </label>
                <input
                  type="text"
                  id="tokenURI"
                  value={tokenURI}
                  onChange={(e) => setTokenURI(e.target.value)}
                  placeholder="ipfs://QmExample... or https://..."
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all"
                  required
                />
                <p className="text-sm text-slate-500 mt-2">
                  IPFS hash or URL pointing to your NFT metadata (JSON file)
                </p>
              </div>

              {/* Recipient Address */}
              <div>
                <label htmlFor="recipient" className="block text-sm font-semibold text-slate-300 mb-2">
                  Recipient Address (optional)
                </label>
                <input
                  type="text"
                  id="recipient"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder={address || '0x...'}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-white/10 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500/50 transition-all font-mono text-sm"
                />
                <p className="text-sm text-slate-500 mt-2">
                  Leave empty to mint to your address
                </p>
              </div>

              {/* Metadata Example */}
              <div className="glass-card p-5 border-cyan-500/30 bg-cyan-500/5">
                <p className="text-sm font-semibold text-cyan-300 mb-3 flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  NFT Metadata Format (JSON):
                </p>
                <pre className="text-xs text-cyan-200 overflow-x-auto bg-slate-950/50 p-3 rounded-lg">
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
                <div className="glass-card p-5 border-emerald-500/30 bg-emerald-500/10">
                  <div className="flex items-start space-x-3">
                    <svg className="w-6 h-6 text-emerald-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <p className="text-emerald-300 font-semibold mb-1">
                        NFT minted successfully!
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

          {/* Info Section */}
          <div className="mt-8 pt-8 border-t border-white/10">
            <h3 className="font-semibold text-white mb-4 flex items-center">
              <svg className="w-5 h-5 mr-2 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Next Steps:
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-start">
                <span className="text-primary-400 font-bold mr-3 mt-0.5">1.</span>
                <span>Upload your NFT image and metadata to IPFS or a hosting service</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-400 font-bold mr-3 mt-0.5">2.</span>
                <span>Use the IPFS hash or URL as the Token URI when minting</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-400 font-bold mr-3 mt-0.5">3.</span>
                <span>After minting, you can create a confidential auction for your NFT</span>
              </li>
              <li className="flex items-start">
                <span className="text-primary-400 font-bold mr-3 mt-0.5">4.</span>
                <span>View your NFTs in the "My NFTs" section</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}
