import { create } from 'zustand';
import type { Asset, AssetStore, AssetSummary } from '../types';
import { 
  generateMockAssets, 
  generateMockGiftCards, 
  createMockFetch 
} from '../utils/mockData';

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

const mockFetchAssets = createMockFetch(generateMockAssets, {
  delay: [600, 1000],
});

const mockFetchSummary = createMockFetch(() => {
  const assets = generateMockAssets();
  const giftCards = generateMockGiftCards();
  const totalValueUsdt = assets.reduce((sum, asset) => sum + asset.usdtValue, 0);
  
  return {
    totalValueUsdt,
    tokens: assets,
    giftCards,
  };
}, {
  delay: [500, 800],
});

// ============================================================================
// ASSET STORE
// ============================================================================

export const useAssetStore = create<AssetStore>((set, get) => ({
  // State
  assets: [],
  summary: null,
  isLoading: false,

  // Actions
  fetchAssets: async () => {
    set({ isLoading: true });
    try {
      const assets = await mockFetchAssets();
      set({ assets, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch assets:', error);
      set({ isLoading: false });
    }
  },

  fetchSummary: async () => {
    set({ isLoading: true });
    try {
      const summary = await mockFetchSummary();
      set({ summary, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      set({ isLoading: false });
    }
  },

  refreshAssets: async () => {
    const { fetchAssets, fetchSummary } = get();
    await Promise.all([fetchAssets(), fetchSummary()]);
  },
}));