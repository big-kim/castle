import type { 
  Asset, 
  GiftCard, 
  P2POrder, 
  MiningActivity, 
  StakingProduct,
  GiftCardProduct,
  TokenSymbol,
  GiftCardType,
  P2PProductType,
  TradeMethod,
  OrderType,
  OrderStatus
} from '../types';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

/**
 * Creates a delay for simulating API calls
 */
export const createMockDelay = (min = 500, max = 1000): Promise<void> => {
  const delay = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise(resolve => setTimeout(resolve, delay));
};

/**
 * Generates mock asset data
 */
export const generateMockAssets = (): Asset[] => [
  {
    id: '1',
    userId: '1',
    tokenSymbol: 'ICC',
    balance: 1250.5,
    usdtValue: 625.25,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: '1',
    tokenSymbol: 'ICS',
    balance: 890.75,
    usdtValue: 445.375,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: '1',
    tokenSymbol: 'ICG',
    balance: 2100.0,
    usdtValue: 1050.0,
    updatedAt: new Date().toISOString(),
  },
  {
    id: '4',
    userId: '1',
    tokenSymbol: 'USDT',
    balance: 3420.80,
    usdtValue: 3420.80,
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Generates mock gift card data
 */
export const generateMockGiftCards = (): GiftCard[] => [
  {
    id: '1',
    userId: '1',
    cardType: 'starbucks',
    faceValue: 50000,
    currentBalance: 35000,
    nftTokenId: 'nft_starbucks_001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: '1',
    cardType: 'cgv',
    faceValue: 30000,
    currentBalance: 30000,
    nftTokenId: 'nft_cgv_001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: '1',
    cardType: 'lotte',
    faceValue: 100000,
    currentBalance: 75000,
    nftTokenId: 'nft_lotte_001',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Generates mock P2P orders
 */
export const generateMockP2POrders = (): P2POrder[] => [
  {
    id: '1',
    userId: '2',
    userName: '이민수',
    userRating: 4.8,
    type: 'sell',
    productType: 'token',
    tokenSymbol: 'ICC',
    paymentTokenSymbol: 'USDT',
    amount: 100,
    price: 0.5,
    pricePerToken: 0.5,
    totalValue: 50,
    paymentMethod: 'Bank Transfer',
    status: 'active',
    tradeMethod: 'normal',
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    userId: '3',
    userName: '박지영',
    userRating: 4.9,
    type: 'buy',
    productType: 'token',
    tokenSymbol: 'ICS',
    paymentTokenSymbol: 'ICC',
    amount: 200,
    price: 0.45,
    pricePerToken: 0.45,
    totalValue: 90,
    paymentMethod: 'KakaoPay',
    status: 'active',
    tradeMethod: 'smart_contract',
    smartContractStatus: 'listed',
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    updatedAt: new Date(Date.now() - 7200000).toISOString(),
  },
];

/**
 * Generates mock mining activities
 */
export const generateMockMiningActivities = (): MiningActivity[] => [
  {
    id: '1',
    userId: '1',
    tokenSymbol: 'BTC',
    hashPowerAllocated: 100,
    hashPowerUsed: 85,
    dailyReward: 0.001,
    pendingRewards: 0.0025,
    totalMined: 0.15,
    isActive: true,
    startedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: '1',
    tokenSymbol: 'ETH',
    hashPowerAllocated: 150,
    hashPowerUsed: 120,
    dailyReward: 0.05,
    pendingRewards: 0.125,
    totalMined: 2.5,
    isActive: true,
    startedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

/**
 * Generates mock staking products
 */
export const generateMockStakingProducts = (): StakingProduct[] => [
  {
    id: '1',
    type: 'usdt',
    name: 'USDT 스테이킹',
    description: '안정적인 USDT 스테이킹으로 연 12% 수익',
    apy: 12,
    minAmount: 100,
    maxAmount: 10000,
    durationDays: 30,
    available: true,
    riskLevel: 'low',
    availableSlots: 50,
    totalStaked: 125000,
  },
  {
    id: '2',
    type: 'giftCard',
    name: 'IC Gift NFT 스테이킹',
    description: 'IC Gift NFT를 스테이킹하여 추가 수익 창출',
    apy: 18,
    minAmount: 50000,
    maxAmount: 500000,
    durationDays: 60,
    available: true,
    riskLevel: 'medium',
    availableSlots: 25,
    totalStaked: 2500000,
  },
];

/**
 * Generates mock gift card products
 */
export const generateMockGiftCardProducts = (): GiftCardProduct[] => [
  {
    id: '1',
    cardType: 'starbucks',
    name: 'IC Gift NFT',
    description: '전국 스타벅스 매장에서 사용 가능한 기프트카드',
    faceValues: [10000, 30000, 50000, 100000],
    discountRate: 5,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=starbucks%20gift%20card%20premium%20design%20green%20logo&image_size=landscape_4_3',
    isAvailable: true,
    category: 'cafe',
    stock: 50,
  },
  {
    id: '2',
    cardType: 'cgv',
    name: 'IC Gift NFT',
    description: '전국 CGV 영화관에서 사용 가능한 관람권',
    faceValues: [15000, 30000, 45000],
    discountRate: 8,
    imageUrl: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cgv%20cinema%20gift%20card%20red%20premium%20movie%20ticket&image_size=landscape_4_3',
    isAvailable: true,
    category: 'entertainment',
    stock: 30,
  },
];

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

/**
 * Generic mock fetch function with error simulation
 */
export const createMockFetch = <T>(
  dataGenerator: () => T,
  options: {
    delay?: [number, number];
    errorRate?: number;
    errorMessage?: string;
  } = {}
) => {
  const { 
    delay = [500, 1000], 
    errorRate = 0, 
    errorMessage = 'Mock API Error' 
  } = options;

  return async (): Promise<T> => {
    await createMockDelay(delay[0], delay[1]);
    
    if (Math.random() < errorRate) {
      throw new Error(errorMessage);
    }
    
    return dataGenerator();
  };
};

/**
 * Creates a mock API function that returns paginated data
 */
export const createMockPaginatedFetch = <T>(
  dataGenerator: () => T[],
  options: {
    delay?: [number, number];
    pageSize?: number;
  } = {}
) => {
  const { delay = [500, 1000], pageSize = 10 } = options;

  return async (page = 1, limit = pageSize): Promise<{
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
  }> => {
    await createMockDelay(delay[0], delay[1]);
    
    const allData = dataGenerator();
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const data = allData.slice(startIndex, endIndex);
    
    return {
      data,
      total: allData.length,
      page,
      limit,
      hasMore: endIndex < allData.length,
    };
  };
};

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generates a random ID
 */
export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

/**
 * Generates a random timestamp within the last N days
 */
export const generateRandomTimestamp = (daysAgo = 30): string => {
  const now = Date.now();
  const randomTime = Math.floor(Math.random() * daysAgo * 24 * 60 * 60 * 1000);
  return new Date(now - randomTime).toISOString();
};

/**
 * Generates a random number within a range
 */
export const generateRandomNumber = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Generates a random integer within a range
 */
export const generateRandomInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

/**
 * Picks a random item from an array
 */
export const pickRandom = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};