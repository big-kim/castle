import { create } from 'zustand';
import type { MiningStore, MiningData, MineableCoin } from '../types';
import { createMockFetch, generateRandomNumber, generateId } from '../utils/mockData';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockMiningData = (): MiningData => ({
  totalHashrate: generateRandomNumber(1000, 5000),
  totalEarnings: generateRandomNumber(100, 1000),
  activeMachines: generateRandomNumber(5, 20),
  dailyEarnings: generateRandomNumber(10, 50),
  mineableCoins: [
    {
      symbol: 'BTC',
      name: 'Bitcoin',
      hashrate: generateRandomNumber(100, 500),
      earnings: generateRandomNumber(10, 100),
      difficulty: generateRandomNumber(1000000, 5000000),
      blockReward: 6.25,
      estimatedDailyEarnings: generateRandomNumber(1, 10),
    },
    {
      symbol: 'ETH',
      name: 'Ethereum',
      hashrate: generateRandomNumber(200, 800),
      earnings: generateRandomNumber(20, 200),
      difficulty: generateRandomNumber(500000, 2000000),
      blockReward: 2.0,
      estimatedDailyEarnings: generateRandomNumber(2, 15),
    },
    {
      symbol: 'ICC',
      name: 'IC Coin',
      hashrate: generateRandomNumber(300, 1000),
      earnings: generateRandomNumber(30, 300),
      difficulty: generateRandomNumber(100000, 500000),
      blockReward: 10.0,
      estimatedDailyEarnings: generateRandomNumber(5, 25),
    },
  ],
  recentActivities: Array.from({ length: 10 }, (_, index) => ({
    id: generateId(),
    type: 'mining' as const,
    coinSymbol: ['BTC', 'ETH', 'ICC'][Math.floor(Math.random() * 3)] as MineableCoin,
    amount: generateRandomNumber(0.001, 1),
    timestamp: new Date(Date.now() - index * 3600000).toISOString(),
    status: Math.random() > 0.1 ? 'completed' as const : 'pending' as const,
  })),
});

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

const mockFetchMiningData = createMockFetch(generateMockMiningData, {
  delay: [500, 1000],
});

const mockStartMining = createMockFetch(
  (coinSymbol: MineableCoin) => ({ success: true, coinSymbol }),
  { delay: [300, 600] }
);

const mockStopMining = createMockFetch(
  (coinSymbol: MineableCoin) => ({ success: true, coinSymbol }),
  { delay: [200, 400] }
);

// ============================================================================
// MINING STORE
// ============================================================================

export const useMiningStore = create<MiningStore>((set, get) => ({
  // State
  miningData: null,
  isLoading: false,
  activeMiningCoins: [],

  // Actions
  fetchMiningData: async () => {
    set({ isLoading: true });
    try {
      const miningData = await mockFetchMiningData();
      set({ miningData, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch mining data:', error);
      set({ isLoading: false });
    }
  },

  startMining: async (coinSymbol: MineableCoin) => {
    set({ isLoading: true });
    try {
      await mockStartMining(coinSymbol);
      const { activeMiningCoins } = get();
      if (!activeMiningCoins.includes(coinSymbol)) {
        set({ 
          activeMiningCoins: [...activeMiningCoins, coinSymbol],
          isLoading: false 
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to start mining:', error);
      set({ isLoading: false });
    }
  },

  stopMining: async (coinSymbol: MineableCoin) => {
    set({ isLoading: true });
    try {
      await mockStopMining(coinSymbol);
      const { activeMiningCoins } = get();
      set({ 
        activeMiningCoins: activeMiningCoins.filter(coin => coin !== coinSymbol),
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to stop mining:', error);
      set({ isLoading: false });
    }
  },

  refreshMiningData: async () => {
    await get().fetchMiningData();
  },
}));