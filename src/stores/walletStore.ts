import { create } from 'zustand';
import type { WalletStore, WalletOverview, TokenSymbol } from '../types';
import { createMockFetch, generateRandomNumber, generateId } from '../utils/mockData';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockWalletOverview = (): WalletOverview => ({
  totalBalance: 15420.75,
  totalBalanceUsdt: 15420.75,
  tokens: [
    {
      symbol: 'ICC',
      balance: 1250.5,
      usdtValue: 625.25,
      change24h: 2.5,
    },
    {
      symbol: 'ICS',
      balance: 890.75,
      usdtValue: 445.375,
      change24h: -1.2,
    },
    {
      symbol: 'ICG',
      balance: 2100.0,
      usdtValue: 1050.0,
      change24h: 5.8,
    },
    {
      symbol: 'USDT',
      balance: 3420.80,
      usdtValue: 3420.80,
      change24h: 0.1,
    },
  ],
  recentTransactions: [
    {
      id: generateId(),
      type: 'receive',
      amount: 100,
      tokenSymbol: 'ICC',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'completed',
    },
    {
      id: generateId(),
      type: 'send',
      amount: 50,
      tokenSymbol: 'USDT',
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      status: 'completed',
    },
    {
      id: generateId(),
      type: 'mining',
      amount: 0.001,
      tokenSymbol: 'BTC',
      timestamp: new Date(Date.now() - 10800000).toISOString(),
      status: 'completed',
    },
    {
      id: generateId(),
      type: 'staking',
      amount: 25,
      tokenSymbol: 'ICG',
      timestamp: new Date(Date.now() - 14400000).toISOString(),
      status: 'pending',
    },
  ],
});

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

const mockFetchWalletOverview = createMockFetch(generateMockWalletOverview, {
  delay: [800, 1200],
});

// ============================================================================
// WALLET STORE
// ============================================================================

export const useWalletStore = create<WalletStore>((set, get) => ({
  // State
  overview: null,
  isLoading: false,
  qrData: null,
  bnbTransactions: null,
  pointTransactions: null,
  nftTransactions: null,

  // Actions
  fetchWalletOverview: async () => {
    set({ isLoading: true });
    try {
      const overview = await mockFetchWalletOverview();
      set({ overview, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch wallet overview:', error);
      set({ isLoading: false });
    }
  },

  generateQRCode: async (walletType: string, amount?: number, memo?: string) => {
    set({ isLoading: true });
    try {
      // Mock QR code generation
      const qrCodeString = `<svg>Mock QR Code for ${walletType}</svg>`;
      const address = `mock_address_${walletType}_${Date.now()}`;
      
      set({ qrData: qrCodeString, isLoading: false });
      return qrCodeString;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  sendBNB: async (toAddress: string, amount: number, memo?: string) => {
    set({ isLoading: true });
    try {
      // Mock BNB send
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ isLoading: false });
      console.log(`Sending ${amount} BNB to ${toAddress}${memo ? ` with memo: ${memo}` : ''}`);
    } catch (error) {
      console.error('Failed to send BNB:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  withdrawPoint: async (coinSymbol: string, amount: number, toAddress: string) => {
    set({ isLoading: true });
    try {
      // Mock point withdrawal
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ isLoading: false });
      console.log(`Withdrawing ${amount} ${coinSymbol} to ${toAddress}`);
    } catch (error) {
      console.error('Failed to withdraw points:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  sendNFT: async (nftId: string, toAddress: string, memo?: string) => {
    set({ isLoading: true });
    try {
      // Mock NFT send
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ isLoading: false });
      console.log(`Sending NFT ${nftId} to ${toAddress}${memo ? ` with memo: ${memo}` : ''}`);
    } catch (error) {
      console.error('Failed to send NFT:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchBNBTransactions: async () => {
    try {
      // Mock BNB transactions
      const mockTransactions = [
        {
          id: generateId(),
          type: 'receive',
          amount: 0.5,
          fromAddress: '0x1234...5678',
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          txHash: '0xabcd...efgh'
        },
        {
          id: generateId(),
          type: 'send',
          amount: 0.2,
          toAddress: '0x9876...5432',
          status: 'completed',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          txHash: '0xijkl...mnop'
        }
      ];
      set({ bnbTransactions: mockTransactions });
      return mockTransactions;
    } catch (error) {
      console.error('Failed to fetch BNB transactions:', error);
      return [];
    }
  },

  fetchPointTransactions: async () => {
    try {
      // Mock point transactions
      const mockTransactions = [
        {
          id: generateId(),
          type: 'earn',
          coinSymbol: 'ICC',
          amount: 100,
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      set({ pointTransactions: mockTransactions });
      return mockTransactions;
    } catch (error) {
      console.error('Failed to fetch point transactions:', error);
      return [];
    }
  },

  fetchNFTTransactions: async () => {
    try {
      // Mock NFT transactions
      const mockTransactions = [
        {
          id: generateId(),
          type: 'receive',
          nftId: 'nft_001',
          fromAddress: '0x1111...2222',
          status: 'completed',
          timestamp: new Date(Date.now() - 3600000).toISOString()
        }
      ];
      set({ nftTransactions: mockTransactions });
      return mockTransactions;
    } catch (error) {
      console.error('Failed to fetch NFT transactions:', error);
      return [];
    }
  },
}));