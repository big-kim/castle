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
  qrData: null,
  bnbTransactions: [],
  pointTransactions: [],
  nftTransactions: [],
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

  generateQRCode: async (assetType: string, amount?: number, memo?: string, tokenSymbol?: string) => {
    try {
      // Generate mock address based on asset type
      let address: string;
      switch (assetType) {
        case 'bnb':
          address = `0x${Math.random().toString(16).substr(2, 40)}`;
          break;
        case 'point':
          address = `point_${tokenSymbol || 'LTC'}_${Math.random().toString(16).substr(2, 20)}`;
          break;
        case 'nft':
          address = `nft_${Math.random().toString(16).substr(2, 20)}`;
          break;
        default:
          address = `addr_${Math.random().toString(16).substr(2, 20)}`;
      }

      // Generate mock QR code SVG using browser-compatible base64 encoding
      const svgContent = `
        <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
          <rect width="200" height="200" fill="white"/>
          <rect x="20" y="20" width="160" height="160" fill="black"/>
          <rect x="40" y="40" width="120" height="120" fill="white"/>
          <text x="100" y="105" text-anchor="middle" font-size="12" fill="black">QR Code</text>
          <text x="100" y="125" text-anchor="middle" font-size="8" fill="black">${assetType.toUpperCase()}</text>
        </svg>
      `;
      const qrCode = `data:image/svg+xml;base64,${btoa(svgContent)}`;

      set({ qrData: { address, qrCode } });
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      set({ qrData: null });
    }
  },

  fetchBNBTransactions: async () => {
    try {
      set({ isLoading: true });
      
      // Generate mock BNB transactions
      const mockTransactions = [
        {
          id: generateId(),
          type: 'receive',
          amount: 0.5,
          fromAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          toAddress: '0x1234567890abcdef1234567890abcdef12345678',
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          status: 'completed',
          txHash: '0x' + Math.random().toString(16).substr(2, 64),
          memo: 'BNB transfer'
        },
        {
          id: generateId(),
          type: 'send',
          amount: 0.2,
          fromAddress: '0x1234567890abcdef1234567890abcdef12345678',
          toAddress: '0xfedcba0987654321fedcba0987654321fedcba09',
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          status: 'completed',
          txHash: '0x' + Math.random().toString(16).substr(2, 64),
          memo: 'Payment'
        }
      ];
      
      set({ bnbTransactions: mockTransactions, isLoading: false });
      return mockTransactions;
    } catch (error) {
      console.error('Failed to fetch BNB transactions:', error);
      set({ bnbTransactions: [], isLoading: false });
      return [];
    }
  },

  fetchPointTransactions: async () => {
    try {
      set({ isLoading: true });
      
      // Generate mock point transactions
      const mockTransactions = [
        {
          id: generateId(),
          type: 'earn',
          amount: 100,
          coinSymbol: 'LTC',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          status: 'completed',
          memo: 'Mining reward'
        },
        {
          id: generateId(),
          type: 'withdraw',
          amount: 50,
          coinSymbol: 'DOGE',
          timestamp: new Date(Date.now() - 5400000).toISOString(),
          status: 'pending',
          memo: 'Withdrawal to external wallet'
        }
      ];
      
      set({ pointTransactions: mockTransactions, isLoading: false });
      return mockTransactions;
    } catch (error) {
      console.error('Failed to fetch point transactions:', error);
      set({ pointTransactions: [], isLoading: false });
      return [];
    }
  },

  fetchNFTTransactions: async () => {
    try {
      set({ isLoading: true });
      
      // Generate mock NFT transactions
      const mockTransactions = [
        {
          id: generateId(),
          type: 'buy',
          nftId: 'nft_' + generateId(),
          value: 100,
          timestamp: new Date(Date.now() - 2700000).toISOString(),
          status: 'completed',
          memo: 'Amazon Gift Card purchase'
        },
        {
          id: generateId(),
          type: 'send',
          nftId: 'nft_' + generateId(),
          value: 50,
          toAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
          timestamp: new Date(Date.now() - 9000000).toISOString(),
          status: 'completed',
          memo: 'Gift card transfer'
        }
      ];
      
      set({ nftTransactions: mockTransactions, isLoading: false });
      return mockTransactions;
    } catch (error) {
      console.error('Failed to fetch NFT transactions:', error);
      set({ nftTransactions: [], isLoading: false });
      return [];
    }
  },
}));