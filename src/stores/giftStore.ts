import { create } from 'zustand';
import type { GiftCard, GiftStore, GiftCardProduct, GiftCardPurchaseForm } from '../types';

// Mock data for development
const mockGiftCardProducts: GiftCardProduct[] = [
  {
    id: '1',
    card_type: 'starbucks',
    name: 'IC Gift NFT',
    description: '전국 스타벅스 매장에서 사용 가능한 기프트카드',
    face_values: [10000, 30000, 50000, 100000],
    discount_rate: 5,
    image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=starbucks%20gift%20card%20premium%20design%20green%20logo&image_size=landscape_4_3',
    is_available: true,
    category: 'cafe',
    stock: 50,
  },
  {
    id: '2',
    card_type: 'cgv',
    name: 'IC Gift NFT',
    description: '전국 CGV 영화관에서 사용 가능한 관람권',
    face_values: [15000, 30000, 45000],
    discount_rate: 8,
    image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cgv%20cinema%20gift%20card%20red%20premium%20movie%20ticket&image_size=landscape_4_3',
    is_available: true,
    category: 'entertainment',
    stock: 30,
  },
  {
    id: '3',
    card_type: 'lotte',
    name: 'IC Gift NFT',
    description: '전국 롯데백화점에서 사용 가능한 상품권',
    face_values: [50000, 100000, 200000, 500000],
    discount_rate: 3,
    image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=lotte%20department%20store%20gift%20card%20luxury%20gold%20design&image_size=landscape_4_3',
    is_available: true,
    category: 'shopping',
    stock: 25,
   },
   {
    id: '4',
    card_type: 'gmarket',
    name: 'IC Gift NFT',
    description: 'G마켓에서 사용 가능한 온라인 상품권',
    face_values: [10000, 30000, 50000, 100000],
    discount_rate: 7,
    image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=gmarket%20online%20shopping%20gift%20card%20blue%20modern%20design&image_size=landscape_4_3',
    is_available: true,
    category: 'online',
    stock: 40,
  },
  {
    id: '5',
    card_type: 'olive_young',
    name: 'IC Gift NFT',
    description: '전국 올리브영 매장에서 사용 가능한 상품권',
    face_values: [20000, 50000, 100000],
    discount_rate: 6,
    image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=olive%20young%20cosmetics%20gift%20card%20green%20beauty%20design&image_size=landscape_4_3',
    is_available: true,
    category: 'beauty',
    stock: 35,
  },
  {
    id: '6',
    card_type: 'kyobo',
    name: 'IC Gift NFT',
    description: '전국 교보문고에서 사용 가능한 도서상품권',
    face_values: [10000, 30000, 50000],
    discount_rate: 4,
    image_url: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=kyobo%20bookstore%20gift%20card%20book%20education%20brown%20design&image_size=landscape_4_3',
    is_available: true,
    category: 'books',
    stock: 20,
   },
 ];

const mockUserGiftCards: GiftCard[] = [
  {
    id: '1',
    user_id: '1',
    card_type: 'starbucks',
    face_value: 50000,
    current_balance: 35000,
    nft_token_id: 'nft_starbucks_001',
    created_at: new Date(Date.now() - 7 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    card_type: 'cgv',
    face_value: 30000,
    current_balance: 30000,
    nft_token_id: 'nft_cgv_001',
    created_at: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 3600000).toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    card_type: 'lotte',
    face_value: 100000,
    current_balance: 75000,
    nft_token_id: 'nft_lotte_001',
    created_at: new Date(Date.now() - 21 * 24 * 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3 * 24 * 3600000).toISOString(),
  },
];

// Mock API functions
const mockFetchProducts = async (): Promise<GiftCardProduct[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockGiftCardProducts;
};

const mockFetchUserGiftCards = async (): Promise<GiftCard[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockUserGiftCards;
};

const mockPurchaseGiftCard = async (purchaseForm: GiftCardPurchaseForm): Promise<GiftCard> => {
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const product = mockGiftCardProducts.find(p => p.card_type === purchaseForm.card_type);
  if (!product) {
    throw new Error('Product not found');
  }
  
  const newGiftCard: GiftCard = {
    id: Date.now().toString(),
    user_id: '1',
    card_type: purchaseForm.card_type,
    face_value: purchaseForm.face_value,
    current_balance: purchaseForm.face_value,
    nft_token_id: `nft_${purchaseForm.card_type}_${Date.now()}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  return newGiftCard;
};

const mockGenerateQRCode = async (giftCardId: string): Promise<string> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Simulate QR code generation
  return `qr_code_data_${giftCardId}_${Date.now()}`;
};

const mockUseGiftCard = async (giftCardId: string, amount: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  // Simulate gift card usage
};

export const useGiftStore = create<GiftStore>((set, get) => ({
  products: [],
  userGiftCards: [],
  isLoading: false,

  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const products = await mockFetchProducts();
      set({ products, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch gift card products:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchUserGiftCards: async () => {
    set({ isLoading: true });
    try {
      const userGiftCards = await mockFetchUserGiftCards();
      set({ userGiftCards, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch user gift cards:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  purchaseGiftCard: async (purchaseForm: GiftCardPurchaseForm) => {
    set({ isLoading: true });
    try {
      const newGiftCard = await mockPurchaseGiftCard(purchaseForm);
      const { userGiftCards } = get();
      set({ 
        userGiftCards: [newGiftCard, ...userGiftCards],
        isLoading: false 
      });
      return newGiftCard;
    } catch (error) {
      console.error('Failed to purchase gift card:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  generateQRCode: async (giftCardId: string) => {
    set({ isLoading: true });
    try {
      const qrCodeData = await mockGenerateQRCode(giftCardId);
      set({ isLoading: false });
      return qrCodeData;
    } catch (error) {
      console.error('Failed to generate QR code:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  useGiftCard: async (giftCardId: string, amount: number) => {
    set({ isLoading: true });
    try {
      await mockUseGiftCard(giftCardId, amount);
      const { userGiftCards } = get();
      const updatedCards = userGiftCards.map(card => 
        card.id === giftCardId 
          ? { 
              ...card, 
              current_balance: card.current_balance - amount,
              updated_at: new Date().toISOString()
            }
          : card
      );
      set({ userGiftCards: updatedCards, isLoading: false });
    } catch (error) {
      console.error('Failed to use gift card:', error);
      set({ isLoading: false });
      throw error;
    }
  },
}));