'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { createInstance, FhevmInstance } from 'fhevmjs';
import { useAccount, usePublicClient } from 'wagmi';

interface FHEVMContextType {
  instance: FhevmInstance | null;
  isInitialized: boolean;
  error: string | null;
  initInstance: () => Promise<void>;
}

const FHEVMContext = createContext<FHEVMContextType>({
  instance: null,
  isInitialized: false,
  error: null,
  initInstance: async () => {},
});

export function FHEVMProvider({ children }: { children: React.ReactNode }) {
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();

  const initInstance = async () => {
    if (!isConnected || !publicClient) {
      setError('Wallet not connected');
      return;
    }

    try {
      setError(null);
      console.log('Initializing FHEVM instance...');

      const chainId = await publicClient.getChainId();
      const networkUrl = publicClient.chain?.rpcUrls.default.http[0] || '';
      const gatewayUrl = process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://gateway.zama.ai';

      const fhevmInstance = await createInstance({
        chainId,
        networkUrl,
        gatewayUrl,
      });

      setInstance(fhevmInstance);
      setIsInitialized(true);
      console.log('✅ FHEVM instance initialized');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize FHEVM';
      setError(errorMessage);
      console.error('Failed to initialize FHEVM:', err);
    }
  };

  useEffect(() => {
    if (isConnected && !isInitialized && !instance) {
      initInstance();
    }
  }, [isConnected, isInitialized, instance]);

  return (
    <FHEVMContext.Provider
      value={{
        instance,
        isInitialized,
        error,
        initInstance,
      }}
    >
      {children}
    </FHEVMContext.Provider>
  );
}

export function useFHEVM() {
  const context = useContext(FHEVMContext);
  if (!context) {
    throw new Error('useFHEVM must be used within FHEVMProvider');
  }
  return context;
}
