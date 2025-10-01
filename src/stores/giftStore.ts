import { create } from 'zustand';
import type { GiftStore, GiftCardProduct } from '../types';
import { createMockFetch, generateRandomNumber, generateId } from '../utils/mockData';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockGiftCardProduct = (): GiftCardProduct => ({
  id: generateId(),
  name: ['Starbucks Gift Card', 'Amazon Gift Card', 'Google Play Gift Card', 'iTunes Gift Card'][Math.floor(Math.random() * 4)],
  brand: ['Starbucks', 'Amazon', 'Google', 'Apple'][Math.floor(Math.random() * 4)],
  category: ['food', 'shopping', 'entertainment', 'digital'][Math.floor(Math.random() * 4)] as any,
  denomination: [10000, 25000, 50000, 100000][Math.floor(Math.random() * 4)],
  price: generateRandomNumber(9000, 95000),
  discountRate: generateRandomNumber(5, 20),
  imageUrl: '/images/gift-card-placeholder.png',
  description: 'Premium gift card with instant delivery',
  isAvailable: Math.random() > 0.1,
  validityPeriod: '1 year from purchase',
  termsAndConditions: 'Standard terms and conditions apply',
  createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 3600000).toISOString(),
  updatedAt: new Date().toISOString(),
});

const generateMockGiftCardProducts = (count: number = 20): GiftCardProduct[] => {
  return Array.from({ length: count }, generateMockGiftCardProduct);
};

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

const mockFetchGiftCardProducts = createMockFetch(
  (filters?: { category?: string; brand?: string; minPrice?: number; maxPrice?: number }) => {
    let products = generateMockGiftCardProducts();
    
    if (filters?.category) {
      products = products.filter(product => product.category === filters.category);
    }
    if (filters?.brand) {
      products = products.filter(product => product.brand === filters.brand);
    }
    if (filters?.minPrice) {
      products = products.filter(product => product.price >= filters.minPrice);
    }
    if (filters?.maxPrice) {
      products = products.filter(product => product.price <= filters.maxPrice);
    }
    
    return products.filter(product => product.isAvailable);
  },
  { delay: [500, 1000] }
);

const mockPurchaseGiftCard = createMockFetch(
  (productId: string, quantity: number = 1) => ({
    success: true,
    orderId: generateId(),
    productId,
    quantity,
    totalAmount: generateRandomNumber(10000, 100000) * quantity,
    purchaseDate: new Date().toISOString(),
    giftCards: Array.from({ length: quantity }, () => ({
      id: generateId(),
      code: `GC-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
      pin: Math.random().toString().substr(2, 4),
      expiryDate: new Date(Date.now() + 365 * 24 * 3600000).toISOString(),
    })),
  }),
  { delay: [1000, 2000] }
);

const mockGetPurchaseHistory = createMockFetch(
  () => Array.from({ length: 5 }, (_, index) => ({
    id: generateId(),
    productId: generateId(),
    productName: ['Starbucks Gift Card', 'Amazon Gift Card'][Math.floor(Math.random() * 2)],
    quantity: Math.floor(Math.random() * 3) + 1,
    totalAmount: generateRandomNumber(10000, 100000),
    purchaseDate: new Date(Date.now() - index * 7 * 24 * 3600000).toISOString(),
    status: Math.random() > 0.1 ? 'completed' : 'pending',
    giftCards: Array.from({ length: Math.floor(Math.random() * 3) + 1 }, () => ({
      id: generateId(),
      code: `GC-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
      pin: Math.random().toString().substr(2, 4),
      expiryDate: new Date(Date.now() + 365 * 24 * 3600000).toISOString(),
    })),
  })),
  { delay: [600, 1200] }
);

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
      const products = await mockFetchGiftCardProducts(filters);
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
      // Mock user gift cards - in real app, this would fetch from API
      const userGiftCards = Array.from({ length: 3 }, (_, index) => ({
        id: generateId(),
        code: `GC-${Math.random().toString(36).substr(2, 12).toUpperCase()}`,
        pin: Math.random().toString().substr(2, 4),
        productName: ['Starbucks Gift Card', 'Amazon Gift Card', 'Google Play Gift Card'][index % 3],
        denomination: [25000, 50000, 100000][index % 3],
        balance: [25000, 45000, 80000][index % 3],
        expiryDate: new Date(Date.now() + 365 * 24 * 3600000).toISOString(),
        purchaseDate: new Date(Date.now() - index * 7 * 24 * 3600000).toISOString(),
        status: 'active' as const,
        imageUrl: '/images/gift-card-placeholder.png',
      }));
      
      set({ userGiftCards, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch user gift cards:', error);
      set({ isLoading: false });
    }
  },

  purchaseGiftCard: async (productId, quantity = 1) => {
    set({ isLoading: true });
    try {
      const purchaseResult = await mockPurchaseGiftCard(productId, quantity);
      
      // Add to purchase history
      const { purchaseHistory } = get();
      const newPurchase = {
        id: purchaseResult.orderId,
        productId,
        productName: get().products.find(p => p.id === productId)?.name || 'Unknown Product',
        quantity,
        totalAmount: purchaseResult.totalAmount,
        purchaseDate: purchaseResult.purchaseDate,
        status: 'completed' as const,
        giftCards: purchaseResult.giftCards,
      };
      
      set({ 
        purchaseHistory: [newPurchase, ...purchaseHistory],
        isLoading: false 
      });
      
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
      const purchaseHistory = await mockGetPurchaseHistory();
      set({ purchaseHistory, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch purchase history:', error);
      set({ isLoading: false });
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
}));