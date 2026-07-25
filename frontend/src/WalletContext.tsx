import React, { createContext, useContext, useState, ReactNode } from 'react';
import { type DAppConnectorWalletAPI } from '@midnight-ntwrk/dapp-connector-api';

interface WalletContextType {
  wallet: DAppConnectorWalletAPI | null;
  setWallet: (wallet: DAppConnectorWalletAPI | null) => void;
  address: string;
  setAddress: (address: string) => void;
  isConnected: boolean;
  setIsConnected: (connected: boolean) => void;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [wallet, setWallet] = useState<DAppConnectorWalletAPI | null>(null);
  const [address, setAddress] = useState<string>('');
  const [isConnected, setIsConnected] = useState<boolean>(false);

  return (
    <WalletContext.Provider value={{ wallet, setWallet, address, setAddress, isConnected, setIsConnected }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
