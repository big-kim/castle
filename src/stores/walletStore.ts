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
}));