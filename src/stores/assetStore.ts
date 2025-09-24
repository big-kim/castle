import { create } from 'zustand';
import type { Asset, AssetStore, AssetSummary, TokenSymbol, GiftCard } from '../types';

// Mock data for development
const mockAssets: Asset[] = [
  {
    id: '1',
    user_id: '1',
    token_symbol: 'ICC',
    balance: 1250.5,
    usdt_value: 625.25,
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    token_symbol: 'ICS',
    balance: 890.75,
    usdt_value: 445.375,
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    token_symbol: 'ICG',
    balance: 2100.0,
    usdt_value: 1050.0,
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: '1',
    token_symbol: 'USDT',
    balance: 3420.80,
    usdt_value: 3420.80,
    updated_at: new Date().toISOString(),
  },
];

const mockGiftCards: GiftCard[] = [
  {
    id: '1',
    user_id: '1',
    card_type: 'starbucks',
    face_value: 50000,
    current_balance: 35000,
    nft_token_id: 'nft_starbucks_001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    card_type: 'cgv',
    face_value: 30000,
    current_balance: 30000,
    nft_token_id: 'nft_cgv_001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    card_type: 'lotte',
    face_value: 100000,
    current_balance: 75000,
    nft_token_id: 'nft_lotte_001',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

// Mock API functions
const mockFetchAssets = async (): Promise<Asset[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockAssets;
};

const mockFetchSummary = async (): Promise<AssetSummary> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const totalValueUsdt = mockAssets.reduce((sum, asset) => sum + asset.usdt_value, 0);
  
  return {
    total_value_usdt: totalValueUsdt,
    tokens: mockAssets,
    gift_cards: mockGiftCards,
  };
};

export const useAssetStore = create<AssetStore>((set, get) => ({
  assets: [],
  summary: null,
  isLoading: false,

  fetchAssets: async () => {
    set({ isLoading: true });
    try {
      const assets = await mockFetchAssets();
      set({ assets, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchSummary: async () => {
    set({ isLoading: true });
    try {
      const summary = await mockFetchSummary();
      set({ summary, assets: summary.tokens, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch asset summary:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  refreshAssets: async () => {
    const { fetchSummary } = get();
    await fetchSummary();
  },
}));