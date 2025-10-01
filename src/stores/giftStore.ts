import { create } from 'zustand';
import type { GiftStore, GiftCardProduct, GiftCard, GiftCardPurchase } from '../types';
import { GiftCardApiService } from '../services/giftApi';

// ============================================================================
// GIFT STORE
// ============================================================================

export const useGiftStore = create<GiftStore>((set, get) => ({
  // State
  products: [],
  userGiftCards: [],
  purchaseHistory: [],
  isLoading: false,
  currentFilters: {
    category: undefined,
    brand: undefined,
    minPrice: undefined,
    maxPrice: undefined,
  },

  // Actions
  fetchProducts: async (filters) => {
    set({ isLoading: true });
    try {
      const products = await GiftCardApiService.getProducts(filters);
      set({ 
        products, 
        currentFilters: { ...get().currentFilters, ...filters },
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch gift card products:', error);
      set({ isLoading: false });
    }
  },

  fetchUserGiftCards: async () => {
    set({ isLoading: true });
    try {
      const userGiftCards = await GiftCardApiService.getUserGiftCards();
      set({ userGiftCards, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch user gift cards:', error);
      // If authentication error, don't treat it as a critical error
      if (error instanceof Error && error.message.includes('Authentication required')) {
        set({ userGiftCards: [], isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },

  purchaseGiftCard: async (productId, quantity = 1) => {
    set({ isLoading: true });
    try {
      const purchaseResult = await GiftCardApiService.purchaseGiftCard(productId, quantity);
      
      // Refresh purchase history and user gift cards after successful purchase
      await get().fetchPurchaseHistory();
      await get().fetchUserGiftCards();
      
      set({ isLoading: false });
      return purchaseResult;
    } catch (error) {
      console.error('Failed to purchase gift card:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchPurchaseHistory: async () => {
    set({ isLoading: true });
    try {
      const purchaseHistory = await GiftCardApiService.getPurchaseHistory();
      set({ purchaseHistory, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch purchase history:', error);
      // If authentication error, don't treat it as a critical error
      if (error instanceof Error && error.message.includes('Authentication required')) {
        set({ purchaseHistory: [], isLoading: false });
      } else {
        set({ isLoading: false });
      }
    }
  },

  setFilters: (filters) => {
    set({ currentFilters: { ...get().currentFilters, ...filters } });
    get().fetchProducts(filters);
  },

  refreshProducts: async () => {
    const { currentFilters } = get();
    await get().fetchProducts(currentFilters);
  },

  generateQRCode: async (giftCardId: string) => {
    try {
      // Mock implementation for QR code generation
      const qrCode = `QR${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
      console.log('Generated QR code for gift card:', giftCardId, qrCode);
      return qrCode;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      throw error;
    }
  },

  useGiftCard: async (giftCardId: string, amount: number) => {
    try {
      // Mock implementation for using gift card
      console.log('Using gift card:', giftCardId, 'amount:', amount);
      // In a real implementation, this would call the API
      // await GiftCardApiService.useGiftCard(giftCardId, amount);
      
      // Refresh user gift cards after use
      await get().fetchUserGiftCards();
    } catch (error) {
      console.error('Failed to use gift card:', error);
      throw error;
    }
  },
}));