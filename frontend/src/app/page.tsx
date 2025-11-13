'use client';

import Link from 'next/link';
import { Navbar } from '@/components/Navbar';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <Navbar />

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Confidential NFT Marketplace
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Experience private NFT auctions powered by{' '}
            <span className="text-primary-600 font-semibold">Zama's FHEVM</span>.
            Place encrypted bids, protect your privacy, and trade NFTs with confidence.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
            <Link href="/marketplace" className="btn-primary text-lg px-8 py-3">
              Explore Auctions
            </Link>
            <Link
              href="/mint"
              className="bg-white dark:bg-gray-800 text-primary-600 dark:text-primary-400 border-2 border-primary-600 hover:bg-primary-50 dark:hover:bg-gray-700 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 text-lg"
            >
              Mint Your NFT
            </Link>
          </div>

          {/* Features */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="card">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Private Bidding
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                All bids are encrypted using FHEVM. Other bidders cannot see your bid amounts,
                ensuring fair and private auctions.
              </p>
            </div>

            <div className="card">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Encrypted Operations
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Winner determination happens entirely on encrypted data. No plaintext exposure
                until the auction ends.
              </p>
            </div>

            <div className="card">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Controlled Decryption
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Only the winning bid is decrypted through Zama's Gateway, using Access Control
                Lists for security.
              </p>
            </div>
          </div>

          {/* How It Works */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-10">
              How It Works
            </h2>
            <div className="grid md:grid-cols-4 gap-6">
              <div className="text-left">
                <div className="bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">
                  1
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Mint NFT</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create your unique NFT with metadata and artwork
                </p>
              </div>

              <div className="text-left">
                <div className="bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">
                  2
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Create Auction</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Set an encrypted reserve price and auction duration
                </p>
              </div>

              <div className="text-left">
                <div className="bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">
                  3
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">
                  Place Encrypted Bids
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Bidders submit encrypted bids that remain private
                </p>
              </div>

              <div className="text-left">
                <div className="bg-primary-600 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold mb-4">
                  4
                </div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-2">Winner Revealed</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  The highest bid is decrypted and the winner receives the NFT
                </p>
              </div>
            </div>
          </div>

          {/* Tech Stack */}
          <div className="mt-20 card max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Powered By
            </h2>
            <div className="flex flex-wrap justify-center gap-6 text-gray-600 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Zama FHEVM</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Solidity</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Next.js</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Wagmi</span>
              </div>
              <span>•</span>
              <div className="flex items-center space-x-2">
                <span className="font-semibold">Viem</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
