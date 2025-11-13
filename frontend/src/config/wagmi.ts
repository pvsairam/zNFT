import { createConfig, http } from 'wagmi';
import { sepolia } from 'wagmi/chains';

// Zama Sepolia Testnet configuration
export const zamaSepolia = {
  id: 8009,
  name: 'Zama Sepolia Testnet',
  network: 'zama-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'ZAMA',
    symbol: 'ZAMA',
  },
  rpcUrls: {
    default: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://devnet.zama.ai'],
    },
    public: {
      http: [process.env.NEXT_PUBLIC_RPC_URL || 'https://devnet.zama.ai'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Zama Explorer',
      url: 'https://explorer.zama.ai',
    },
  },
  testnet: true,
} as const;

export const config = createConfig({
  chains: [zamaSepolia, sepolia],
  transports: {
    [zamaSepolia.id]: http(),
    [sepolia.id]: http(),
  },
  ssr: true,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
