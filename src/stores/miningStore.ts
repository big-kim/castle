import { create } from 'zustand';
import type { MiningData, MiningStore, MiningReward, MiningActivity, MiningSummary, TokenSymbol } from '../types';

// Mock data for development
const mockMiningData: MiningData[] = [
  {
    id: '1',
    user_id: '1',
    token_symbol: 'ICC',
    hash_power: 1250,
    daily_reward: 12.5,
    total_mined: 3750.25,
    is_active: true,
    started_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    token_symbol: 'ICS',
    hash_power: 890,
    daily_reward: 8.9,
    total_mined: 2670.0,
    is_active: true,
    started_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    token_symbol: 'ICG',
    hash_power: 2100,
    daily_reward: 21.0,
    total_mined: 6300.0,
    is_active: true,
    started_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '4',
    user_id: '1',
    token_symbol: 'USDT',
    hash_power: 500,
    daily_reward: 5.0,
    total_mined: 1500.0,
    is_active: false,
    started_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: '5',
    user_id: '1',
    token_symbol: 'BTC',
    hash_power: 0,
    daily_reward: 0,
    total_mined: 0,
    is_active: false,
    started_at: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: '6',
    user_id: '1',
    token_symbol: 'ETH',
    hash_power: 0,
    daily_reward: 0,
    total_mined: 0,
    is_active: false,
    started_at: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: '7',
    user_id: '1',
    token_symbol: 'BNB',
    hash_power: 0,
    daily_reward: 0,
    total_mined: 0,
    is_active: false,
    started_at: null,
    updated_at: new Date().toISOString(),
  },
  {
    id: '8',
    user_id: '1',
    token_symbol: 'ADA',
    hash_power: 0,
    daily_reward: 0,
    total_mined: 0,
    is_active: false,
    started_at: null,
    updated_at: new Date().toISOString(),
  },
];

const mockRewards: MiningReward[] = [
  {
    id: '1',
    user_id: '1',
    token_symbol: 'ICC',
    amount: 12.5,
    hash_power_used: 1250,
    reward_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: '2',
    user_id: '1',
    token_symbol: 'ICS',
    amount: 8.9,
    hash_power_used: 890,
    reward_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
  {
    id: '3',
    user_id: '1',
    token_symbol: 'ICG',
    amount: 21.0,
    hash_power_used: 2100,
    reward_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
  },
];

// Mock API functions
const mockFetchMiningData = async (): Promise<MiningData[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  return mockMiningData;
};

const mockFetchRewards = async (): Promise<MiningReward[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockRewards;
};

const mockStartMining = async (tokenSymbol: TokenSymbol): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  // Simulate starting mining operation
};

const mockStopMining = async (tokenSymbol: TokenSymbol): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  // Simulate stopping mining operation
};

const mockClaimRewards = async (tokenSymbol: TokenSymbol): Promise<number> => {
  await new Promise(resolve => setTimeout(resolve, 1200));
  // Simulate claiming mining rewards
  const miningData = mockMiningData.find(data => data.token_symbol === tokenSymbol);
  return miningData?.daily_reward || 0;
};

// Convert MiningData to MiningActivity format
const convertToActivity = (data: MiningData): MiningActivity => ({
  id: data.id,
  user_id: data.user_id,
  token_symbol: data.token_symbol,
  hash_power_allocated: data.hash_power + 500, // Add some buffer for allocated
  hash_power_used: data.hash_power,
  daily_reward: data.daily_reward,
  pending_rewards: data.is_active ? data.daily_reward * 0.8 : 0, // Mock pending rewards
  total_mined: data.total_mined,
  is_active: data.is_active,
  started_at: data.started_at,
  updated_at: data.updated_at,
});

export const useMiningStore = create<MiningStore>((set, get) => ({
  activities: [],
  summary: null,
  miningData: [],
  rewards: [],
  totalHashPower: 0,
  dailyRewardTotal: 0,
  isLoading: false,

  fetchActivities: async () => {
    set({ isLoading: true });
    try {
      const miningData = await mockFetchMiningData();
      const activities = miningData.map(convertToActivity);
      const totalHashPower = miningData
        .filter(data => data.is_active)
        .reduce((sum, data) => sum + data.hash_power, 0);
      const dailyRewardTotal = miningData
        .filter(data => data.is_active)
        .reduce((sum, data) => sum + data.daily_reward, 0);
      
      set({ 
        activities,
        miningData, 
        totalHashPower, 
        dailyRewardTotal, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch mining activities:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchSummary: async () => {
    try {
      const miningData = await mockFetchMiningData();
      const totalHashPower = miningData.reduce((sum, data) => sum + data.hash_power + 500, 0);
      const usedHashPower = miningData
        .filter(data => data.is_active)
        .reduce((sum, data) => sum + data.hash_power, 0);
      const totalEarnings = miningData.reduce((sum, data) => sum + data.total_mined, 0);
      const dailyEarnings = miningData
        .filter(data => data.is_active)
        .reduce((sum, data) => sum + data.daily_reward, 0);
      
      const summary: MiningSummary = {
        total_hash_power: totalHashPower,
        used_hash_power: usedHashPower,
        total_earnings: totalEarnings,
        daily_earnings: dailyEarnings,
      };
      
      set({ summary });
    } catch (error) {
      console.error('Failed to fetch mining summary:', error);
      throw error;
    }
  },

  fetchMiningData: async () => {
    set({ isLoading: true });
    try {
      const miningData = await mockFetchMiningData();
      const totalHashPower = miningData
        .filter(data => data.is_active)
        .reduce((sum, data) => sum + data.hash_power, 0);
      const dailyRewardTotal = miningData
        .filter(data => data.is_active)
        .reduce((sum, data) => sum + data.daily_reward, 0);
      
      set({ 
        miningData, 
        totalHashPower, 
        dailyRewardTotal, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch mining data:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchRewards: async () => {
    set({ isLoading: true });
    try {
      const rewards = await mockFetchRewards();
      set({ rewards, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch mining rewards:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  startMining: async (coinId: string) => {
    try {
      await mockStartMining(coinId as TokenSymbol);
      // Refresh data after starting mining
      const { fetchActivities, fetchMiningData, fetchRewards, fetchSummary } = get();
      await Promise.all([fetchActivities(), fetchMiningData(), fetchRewards(), fetchSummary()]);
    } catch (error) {
      console.error('Failed to start mining:', error);
      throw error;
    }
  },

  stopMining: async (coinId: string) => {
    try {
      await mockStopMining(coinId as TokenSymbol);
      // Refresh data after stopping mining
      const { fetchActivities, fetchMiningData, fetchRewards, fetchSummary } = get();
      await Promise.all([fetchActivities(), fetchMiningData(), fetchRewards(), fetchSummary()]);
    } catch (error) {
      console.error('Failed to stop mining:', error);
      throw error;
    }
  },

  claimReward: async (coinId: string) => {
    try {
      await mockClaimRewards(coinId as TokenSymbol);
      // Refresh data after claiming
      const { fetchActivities, fetchMiningData, fetchRewards, fetchSummary } = get();
      await Promise.all([fetchActivities(), fetchMiningData(), fetchRewards(), fetchSummary()]);
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      throw error;
    }
  },

  claimRewards: async (coinId: string) => {
    try {
      await mockClaimRewards(coinId as TokenSymbol);
      // Refresh data after claiming
      const { fetchMiningData, fetchRewards } = get();
      await Promise.all([fetchMiningData(), fetchRewards()]);
    } catch (error) {
      console.error('Failed to claim rewards:', error);
      throw error;
    }
  },
}));