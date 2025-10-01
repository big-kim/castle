import { create } from 'zustand';
import type { MiningStore, MiningData, MineableCoin } from '../types';
import { createMockFetch, generateRandomNumber, generateId } from '../utils/mockData';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockMiningData = (): MiningData => ({
  id: generateId(),
  userId: 'user-123',
  tokenSymbol: ['BTC', 'ETH', 'ICC'][Math.floor(Math.random() * 3)] as any,
  hashPower: generateRandomNumber(100, 1000),
  dailyReward: generateRandomNumber(0.001, 0.1),
  totalMined: generateRandomNumber(1, 100),
  isActive: Math.random() > 0.3,
  startedAt: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 30 * 24 * 3600000).toISOString() : null,
  updatedAt: new Date().toISOString(),
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
  activities: [],
  summary: null,
  miningData: [],
  rewards: [],
  totalHashPower: 0,
  dailyRewardTotal: 0,
  isLoading: false,
  isWithdrawing: false,
  coinexAccounts: [],
  depositHistory: [],
  withdrawalHistory: [],

  // Actions
  fetchActivities: async () => {
    set({ isLoading: true });
    try {
      // Mock activities
      const activities = Array.from({ length: 10 }, (_, index) => ({
        id: generateId(),
        userId: generateId(),
        tokenSymbol: ['BTC', 'ETH', 'ICC'][Math.floor(Math.random() * 3)] as any,
        hashPowerAllocated: generateRandomNumber(100, 1000),
        hashPowerUsed: generateRandomNumber(80, 950),
        dailyReward: generateRandomNumber(0.001, 1),
        pendingRewards: generateRandomNumber(0.001, 0.5),
        totalMined: generateRandomNumber(1, 100),
        isActive: Math.random() > 0.3,
        startedAt: new Date(Date.now() - index * 24 * 3600000).toISOString(),
        updatedAt: new Date(Date.now() - index * 3600000).toISOString(),
      }));
      set({ activities, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      set({ isLoading: false });
    }
  },

  fetchSummary: async () => {
    set({ isLoading: true });
    try {
      // Mock summary
      const summary = {
        totalHashPower: generateRandomNumber(1000, 5000),
        usedHashPower: generateRandomNumber(800, 4500),
        totalEarnings: generateRandomNumber(100, 1000),
        dailyEarnings: generateRandomNumber(10, 50),
      };
      set({ summary, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch summary:', error);
      set({ isLoading: false });
    }
  },

  fetchMiningData: async () => {
    set({ isLoading: true });
    try {
      const miningData = [await mockFetchMiningData()];
      set({ miningData, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch mining data:', error);
      set({ isLoading: false });
    }
  },

  fetchRewards: async () => {
    set({ isLoading: true });
    try {
      // Mock rewards
      const rewards = Array.from({ length: 5 }, (_, index) => ({
        id: generateId(),
        userId: generateId(),
        tokenSymbol: ['BTC', 'ETH', 'ICC'][Math.floor(Math.random() * 3)] as any,
        amount: generateRandomNumber(0.001, 1),
        hashPowerUsed: generateRandomNumber(100, 1000),
        rewardDate: new Date(Date.now() - index * 24 * 3600000).toISOString(),
        createdAt: new Date(Date.now() - index * 24 * 3600000).toISOString(),
      }));
      set({ rewards, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch rewards:', error);
      set({ isLoading: false });
    }
  },

  startMining: async (coinId: string) => {
    set({ isLoading: true });
    try {
      await mockStartMining(coinId as any);
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to start mining:', error);
      set({ isLoading: false });
    }
  },

  stopMining: async (coinId: string) => {
    set({ isLoading: true });
    try {
      await mockStopMining(coinId as any);
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to stop mining:', error);
      set({ isLoading: false });
    }
  },

  claimReward: async (coinId: string) => {
    set({ isLoading: true });
    try {
      // Mock claim reward - just simulate claiming
      await new Promise(resolve => setTimeout(resolve, 1000));
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to claim reward:', error);
      set({ isLoading: false });
    }
  },

  withdraw: async (tokenSymbol: string, amount: number, withdrawalAddress: string) => {
    set({ isWithdrawing: true });
    try {
      // Mock withdrawal
      await new Promise(resolve => setTimeout(resolve, 2000));
      set({ isWithdrawing: false });
    } catch (error) {
      console.error('Failed to withdraw:', error);
      set({ isWithdrawing: false });
      throw error;
    }
  },

  registerCoinEXAccount: async (userId: string, email: string) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newAccount = { userId, email, registered: true };
      set(state => ({ coinexAccounts: [...state.coinexAccounts, newAccount] }));
    } catch (error) {
      console.error('Failed to register CoinEX account:', error);
      throw error;
    }
  },

  getCoinEXAccount: (userId: string) => {
    const state = get();
    return state.coinexAccounts.find(account => account.userId === userId);
  },

  generateDepositHistory: (coinSymbol: string, hashRate: number, price: number) => {
    // Mock deposit history generation based on hashRate and price
    const history = [];
    for (let i = 0; i < 30; i++) {
      const dailyAmount = (hashRate * price * 0.001) + (Math.random() * 0.01);
      history.push({
        id: generateId(),
        coinSymbol,
        amount: dailyAmount,
        usdValue: dailyAmount * price,
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      });
    }
    set({ depositHistory: history });
    return history;
  },

  withdrawToCoinEX: async (coinSymbol: string, amount: number, email: string) => {
    set({ isWithdrawing: true });
    try {
      // Mock withdrawal to CoinEX
      await new Promise(resolve => setTimeout(resolve, 2000));
      set({ isWithdrawing: false });
    } catch (error) {
      console.error('Failed to withdraw to CoinEX:', error);
      set({ isWithdrawing: false });
      throw error;
    }
  },

  getWithdrawalHistory: async () => {
    try {
      // Mock withdrawal history for all coins
      const history = [
        {
          id: generateId(),
          coinSymbol: 'ICC',
          amount: 50,
          timestamp: new Date().toISOString(),
          status: 'completed',
          coinexEmail: 'user@coinex.com'
        },
        {
          id: generateId(),
          coinSymbol: 'ICS',
          amount: 25,
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          status: 'completed',
          coinexEmail: 'user@coinex.com'
        }
      ];
      set({ withdrawalHistory: history });
      return history;
    } catch (error) {
      console.error('Failed to get withdrawal history:', error);
      return [];
    }
  },

  getAvailableBalance: (coinSymbol: string) => {
    // Mock available balance
    return 1000;
  },
}));