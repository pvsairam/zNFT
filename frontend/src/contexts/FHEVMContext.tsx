'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAccount } from 'wagmi';

// Mock FHEVM instance type for UI demo (until official library is installed)
type FhevmInstance = any;

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
  const { isConnected } = useAccount();

  const initInstance = async () => {
    if (!isConnected) {
      setError('Wallet not connected');
      return;
    }

    try {
      setError(null);
      console.log('🎨 UI Demo Mode: FHEVM library not installed');
      console.log('📝 To enable full FHEVM features, install official Zama SDK');
      console.log('📖 See MIGRATION_TO_OFFICIAL_SDK.md for instructions');

      // Simulate initialization for UI demo
      await new Promise(resolve => setTimeout(resolve, 1000));

      setInstance({ mock: true }); // Mock instance for UI demo
      setIsInitialized(true);
      console.log('✅ UI Demo Mode active - interface ready');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize';
      setError(errorMessage);
      console.error('Error:', err);
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
