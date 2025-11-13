'use client';

import { useState, useEffect } from 'react';
import { useAccount, useReadContract } from 'wagmi';
import Link from 'next/link';
import { Navbar } from '@/components/Navbar';
import { CONTRACTS } from '@/lib/contracts';

export default function MyNFTsPage() {
  const { address, isConnected } = useAccount();
  const [myTokens, setMyTokens] = useState<number[]>([]);

  // Get total supply
  const { data: totalSupply } = useReadContract({
    address: CONTRACTS.NFT.address,
    abi: CONTRACTS.NFT.abi,
    functionName: 'totalSupply',
  });

  useEffect(() => {
    if (totalSupply && isConnected && address) {
      fetchMyNFTs(Number(totalSupply));
    }
  }, [totalSupply, isConnected, address]);

  const fetchMyNFTs = async (count: number) => {
    if (!address) return;

    const tokens: number[] = [];

    // Check each token to see if we own it
    // Note: In production, use The Graph or an indexer for better performance
    for (let i = 0; i < count; i++) {
      // We'll just show a placeholder for now
      // In a real app, you'd check ownership with ownerOf(i)
    }

    setMyTokens(tokens);
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-400 via-accent-400 to-primary-400 bg-clip-text text-transparent mb-2">
              My NFTs
            </h1>
            <p className="text-slate-400">
              NFTs you own that can be listed in confidential auctions
            </p>
          </div>

          <Link href="/mint" className="btn-primary">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Mint New NFT
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
              Connect your wallet to view your NFTs
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">🎨</span>
                  <span className="text-3xl font-bold text-white">{myTokens.length}</span>
                </div>
                <p className="text-sm text-slate-400">Owned NFTs</p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">📊</span>
                  <span className="text-3xl font-bold text-white">
                    {totalSupply?.toString() || '0'}
                  </span>
                </div>
                <p className="text-sm text-slate-400">Total Supply</p>
              </div>

              <div className="glass-card p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-3xl">⚡</span>
                  <span className="text-3xl font-bold text-white">0</span>
                </div>
                <p className="text-sm text-slate-400">In Auctions</p>
              </div>
            </div>

            {/* NFT Grid */}
            {totalSupply === undefined || totalSupply === 0n ? (
              <div className="glass-card p-12 text-center">
                <div className="mb-6">
                  <svg className="w-20 h-20 mx-auto text-accent-500/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No NFTs Yet</h3>
                <p className="text-slate-400 mb-6">
                  No NFTs in this collection yet. Mint your first NFT!
                </p>
                <Link href="/mint" className="btn-primary inline-flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Mint NFT
                </Link>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: Number(totalSupply) }).map((_, i) => (
                  <NFTCard key={i} tokenId={i} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

function NFTCard({ tokenId }: { tokenId: number }) {
  const { address } = useAccount();

  const { data: owner } = useReadContract({
    address: CONTRACTS.NFT.address,
    abi: CONTRACTS.NFT.abi,
    functionName: 'ownerOf',
    args: [BigInt(tokenId)],
  });

  const { data: tokenURI } = useReadContract({
    address: CONTRACTS.NFT.address,
    abi: CONTRACTS.NFT.abi,
    functionName: 'tokenURI',
    args: [BigInt(tokenId)],
  });

  const { data: isInAuction } = useReadContract({
    address: CONTRACTS.NFT.address,
    abi: CONTRACTS.NFT.abi,
    functionName: 'isTokenInAuction',
    args: [BigInt(tokenId)],
  });

  const isOwner = address && owner && address.toLowerCase() === owner.toLowerCase();

  // Only show if we own it
  if (!isOwner) return null;

  const gradients = ['nft-gradient', 'nft-gradient-alt', 'nft-gradient-fire', 'nft-gradient-ocean'];
  const gradient = gradients[tokenId % gradients.length];

  return (
    <div className="glass-card p-0 overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
      {/* NFT Preview */}
      <div className={`aspect-square ${gradient} relative overflow-hidden`}>
        <div className="absolute inset-0 flex items-center justify-center">
          <svg className="w-32 h-32 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>

        {/* Status Badge */}
        <div className="absolute top-4 right-4">
          {isInAuction ? (
            <span className="badge bg-amber-500/20 text-amber-300 border-amber-500/30">
              In Auction
            </span>
          ) : (
            <span className="badge badge-success">
              Available
            </span>
          )}
        </div>
      </div>

      {/* NFT Info */}
      <div className="p-5 space-y-3">
        <div>
          <h3 className="text-xl font-bold text-white mb-1">NFT #{tokenId}</h3>
          {tokenURI && (
            <p className="text-xs text-slate-500 truncate font-mono">
              {typeof tokenURI === 'string' ? tokenURI.slice(0, 40) + '...' : 'Metadata available'}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-white/10">
          {!isInAuction ? (
            <Link
              href={`/create-auction?tokenId=${tokenId}`}
              className="btn-primary w-full block text-center text-sm"
            >
              Create Auction
            </Link>
          ) : (
            <button
              disabled
              className="w-full py-2 px-4 rounded-lg text-sm bg-slate-800/50 text-slate-500 border border-white/5 cursor-not-allowed"
            >
              Currently in Auction
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
