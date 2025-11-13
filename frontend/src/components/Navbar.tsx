'use client';

import Link from 'next/link';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { useFHEVM } from '@/contexts/FHEVMContext';

export function Navbar() {
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { isInitialized, error: fhevmError } = useFHEVM();

  return (
    <nav className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-primary-600">🔐</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                Confidential NFT
              </span>
            </Link>

            {/* Navigation Links */}
            <div className="hidden md:flex space-x-4">
              <Link
                href="/marketplace"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Marketplace
              </Link>
              <Link
                href="/mint"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Mint NFT
              </Link>
              <Link
                href="/create-auction"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                Create Auction
              </Link>
              <Link
                href="/my-nfts"
                className="text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 px-3 py-2 rounded-md text-sm font-medium"
              >
                My NFTs
              </Link>
            </div>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {/* FHEVM Status Indicator */}
            {isConnected && (
              <div className="hidden sm:flex items-center space-x-2">
                {isInitialized ? (
                  <span className="flex items-center text-xs text-green-600 dark:text-green-400">
                    <span className="w-2 h-2 bg-green-600 rounded-full mr-1"></span>
                    FHEVM Ready
                  </span>
                ) : fhevmError ? (
                  <span className="flex items-center text-xs text-red-600 dark:text-red-400">
                    <span className="w-2 h-2 bg-red-600 rounded-full mr-1"></span>
                    FHEVM Error
                  </span>
                ) : (
                  <span className="flex items-center text-xs text-yellow-600 dark:text-yellow-400">
                    <span className="w-2 h-2 bg-yellow-600 rounded-full mr-1 animate-pulse"></span>
                    Initializing...
                  </span>
                )}
              </div>
            )}

            {/* Connect/Disconnect Button */}
            {isConnected ? (
              <div className="flex items-center space-x-2">
                <span className="hidden sm:inline text-sm text-gray-700 dark:text-gray-300">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </span>
                <button
                  onClick={() => disconnect()}
                  className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={() => connect({ connector: connectors[0] })}
                className="btn-primary"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
