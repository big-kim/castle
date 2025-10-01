import { create } from 'zustand';
import type { GiftStore, GiftCardProduct, GiftCard, GiftCardPurchaseForm } from '../types';
import { createMockFetch, generateRandomNumber, generateId } from '../utils/mockData';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockGiftCardProduct = (): GiftCardProduct => ({
  id: generateId(),
  cardType: ['starbucks', 'cgv', 'lotte', 'gmarket'][Math.floor(Math.random() * 4)] as any,
  name: ['Starbucks Gift Card', 'CGV Gift Card', 'Lotte Gift Card', 'Gmarket Gift Card'][Math.floor(Math.random() * 4)],
  description: 'Premium gift card with instant delivery',
  faceValues: [10000, 25000, 50000, 100000],
  discountRate: generateRandomNumber(5, 20) / 100,
  imageUrl: '/images/gift-card-placeholder.png',
  isAvailable: Math.random() > 0.1,
  category: ['food', 'shopping', 'entertainment', 'digital'][Math.floor(Math.random() * 4)],
  stock: generateRandomNumber(10, 100),
  price: generateRandomNumber(9000, 95000),
  originalPrice: generateRandomNumber(10000, 100000),
  rating: generateRandomNumber(40, 50) / 10,
  reviews: generateRandomNumber(100, 1000),
  validityDays: 365,
  brand: ['starbucks', 'cgv', 'lotte', 'gmarket'][Math.floor(Math.random() * 4)],
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
  isLoading: false,

  // Actions
  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const products = await mockFetchGiftCardProducts();
      set({ 
        products, 
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
      const userGiftCards: GiftCard[] = Array.from({ length: 3 }, (_, index) => ({
        id: generateId(),
        userId: 'user-123',
        cardType: ['starbucks', 'cgv', 'lotte'][index % 3] as any,
        faceValue: [25000, 50000, 100000][index % 3],
        currentBalance: [25000, 45000, 80000][index % 3],
        nftTokenId: `nft-${generateId()}`,
        createdAt: new Date(Date.now() - index * 7 * 24 * 3600000).toISOString(),
        updatedAt: new Date().toISOString(),
        brand: ['starbucks', 'cgv', 'lotte'][index % 3],
        productName: ['Starbucks Gift Card', 'CGV Gift Card', 'Lotte Gift Card'][index % 3],
        status: 'active' as const,
        cardNumber: `****-****-****-${Math.floor(1000 + Math.random() * 9000)}`,
        expiresAt: new Date(Date.now() + 365 * 24 * 3600000).toISOString(),
        pin: Math.floor(1000 + Math.random() * 9000).toString(),
      }));
      
      set({ userGiftCards, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch user gift cards:', error);
      set({ isLoading: false });
    }
  },



  purchaseGiftCard: async (form: GiftCardPurchaseForm): Promise<GiftCard> => {
    set({ isLoading: true });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newGiftCard: GiftCard = {
        id: `gift-${Date.now()}`,
        userId: 'user-123',
        cardType: form.cardType,
        faceValue: form.faceValue,
        currentBalance: form.faceValue,
        nftTokenId: `nft-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'active',
        cardNumber: `****-****-****-${Math.floor(1000 + Math.random() * 9000)}`,
        expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
        pin: Math.floor(1000 + Math.random() * 9000).toString()
      };
      
      set(state => ({
        userGiftCards: [...state.userGiftCards, newGiftCard],
        isLoading: false
      }));
      
      return newGiftCard;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  generateQRCode: async (giftCardId: string): Promise<string> => {
    set({ isLoading: true });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const qrCode = `qr-${giftCardId}-${Date.now()}`;
      set({ isLoading: false });
      return qrCode;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  useGiftCard: async (giftCardId: string, amount: number): Promise<void> => {
    set({ isLoading: true });
    try {
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      set(state => ({
        userGiftCards: state.userGiftCards.map(card => 
          card.id === giftCardId 
            ? { 
                ...card, 
                currentBalance: Math.max(0, card.currentBalance - amount),
                updatedAt: new Date().toISOString()
              }
            : card
        ),
        isLoading: false
      }));
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  }
}));