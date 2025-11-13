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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">My NFTs</h1>
            <p className="text-gray-600 dark:text-gray-400">
              NFTs you own that can be listed in confidential auctions
            </p>
          </div>

          <Link href="/mint" className="btn-primary">
            Mint New NFT
          </Link>
        </div>

        {!isConnected ? (
          <div className="card text-center py-12">
            <p className="text-gray-600 dark:text-gray-400">
              Connect your wallet to view your NFTs
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="card">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Owned NFTs</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {myTokens.length}
                </p>
              </div>

              <div className="card">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Supply</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalSupply?.toString() || '0'}
                </p>
              </div>

              <div className="card">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Auctions</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">0</p>
              </div>
            </div>

            {/* NFT Grid */}
            {totalSupply === undefined || totalSupply === 0n ? (
              <div className="card text-center py-12">
                <p className="text-2xl mb-4">🎨</p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  No NFTs in this collection yet. Mint your first NFT!
                </p>
                <Link href="/mint" className="btn-primary inline-block">
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

  return (
    <div className="card">
      {/* NFT Preview */}
      <div className="bg-gradient-to-br from-primary-400 to-primary-600 aspect-square rounded-lg mb-4 flex items-center justify-center text-white text-6xl">
        🖼️
      </div>

      {/* NFT Info */}
      <div className="space-y-2">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-gray-900 dark:text-white">NFT #{tokenId}</h3>
          {isInAuction ? (
            <span className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-300 text-xs px-2 py-1 rounded">
              In Auction
            </span>
          ) : (
            <span className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-300 text-xs px-2 py-1 rounded">
              Available
            </span>
          )}
        </div>

        {tokenURI && (
          <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
            {typeof tokenURI === 'string' ? tokenURI : 'Metadata available'}
          </p>
        )}

        {/* Actions */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
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
              className="bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-400 w-full py-2 rounded-lg text-sm cursor-not-allowed"
            >
              Currently in Auction
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
