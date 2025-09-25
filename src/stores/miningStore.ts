import { create } from 'zustand';
import type { MiningData, MiningStore, MiningReward, MiningActivity, MiningSummary, TokenSymbol } from '../types';

// CoinEX Account interface
interface CoinEXAccount {
  email: string;
  isVerified: boolean;
  registeredAt: string;
}

// Daily Deposit Record interface
interface DailyDepositRecord {
  date: string;
  time: string;
  amount: number;
  hashRate: number;
  usdValue: number;
  cumulativeAmount: number;
  rewardCalculation: {
    baseReward: number;
    hashRateMultiplier: number;
    finalReward: number;
  };
}

// Withdrawal Record interface
interface WithdrawalRecord {
  id: string;
  coinSymbol: string;
  amount: number;
  coinexEmail: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  txHash?: string;
  errorMessage?: string;
}

// Hash Rate Graph Data interface
interface HashRateDataPoint {
  timestamp: string;
  hashRate: number;
  time: string;
}

// Mining Dashboard Data interface
interface MiningDashboard {
  currentHashRate: number;
  rejectionRate: number;
  hashRateHistory: HashRateDataPoint[];
  lastUpdated: string;
}

// Extended Mining Store interface
interface ExtendedMiningStore extends MiningStore {
  coinexAccounts: { [userId: string]: CoinEXAccount };
  depositHistory: { [coinSymbol: string]: DailyDepositRecord[] };
  withdrawalHistory: WithdrawalRecord[];
  miningDashboard: MiningDashboard;
  registerCoinEXAccount: (userId: string, email: string) => Promise<void>;
  getCoinEXAccount: (userId: string) => CoinEXAccount | null;
  generateDepositHistory: (coinSymbol: string, hashRate: number, price: number) => DailyDepositRecord[];
  withdrawToCoinEX: (coinSymbol: string, amount: number, coinexEmail: string) => Promise<void>;
  getWithdrawalHistory: () => WithdrawalRecord[];
  getAvailableBalance: (coinSymbol: string) => number;
  updateMiningDashboard: () => void;
  generateHashRateHistory: () => HashRateDataPoint[];
}

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

const mockWithdraw = async (tokenSymbol: TokenSymbol, amount: number, withdrawalAddress: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Simulate withdrawal processing
  console.log(`Withdrawing ${amount} ${tokenSymbol} to ${withdrawalAddress}`);
  // In real implementation, this would call the actual withdrawal API
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

// Generate mock hash rate history
const generateMockHashRateHistory = (): HashRateDataPoint[] => {
  const history: HashRateDataPoint[] = [];
  const now = new Date();
  
  for (let i = 23; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
    const baseHashRate = 1200;
    const variation = Math.sin(i * 0.5) * 200 + Math.random() * 100 - 50;
    const hashRate = Math.max(0, baseHashRate + variation);
    
    history.push({
      timestamp: timestamp.toISOString(),
      hashRate: Math.round(hashRate * 100) / 100,
      time: timestamp.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    });
  }
  
  return history;
};

export const useMiningStore = create<ExtendedMiningStore>((set, get) => ({
  activities: [],
  summary: null,
  miningData: [],
  rewards: [],
  totalHashPower: 0,
  dailyRewardTotal: 0,
  isLoading: false,
  isWithdrawing: false,
  coinexAccounts: {},
  depositHistory: {},
  withdrawalHistory: [],
  miningDashboard: {
    currentHashRate: 1250.5,
    rejectionRate: 2.1,
    hashRateHistory: generateMockHashRateHistory(),
    lastUpdated: new Date().toISOString()
  },

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

  withdraw: async (tokenSymbol: string, amount: number, withdrawalAddress: string) => {
    set({ isWithdrawing: true });
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(withdrawalAddress)) {
        throw new Error('Invalid email address format');
      }

      // Validate amount
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Check if user has sufficient balance
      const { miningData } = get();
      const coinData = miningData.find(data => data.token_symbol === tokenSymbol);
      if (!coinData || coinData.total_mined < amount) {
        throw new Error('Insufficient balance');
      }

      await mockWithdraw(tokenSymbol as TokenSymbol, amount, withdrawalAddress);
      
      // Update local data to reflect withdrawal
      const updatedMiningData = miningData.map(data => {
        if (data.token_symbol === tokenSymbol) {
          return {
            ...data,
            total_mined: data.total_mined - amount,
            updated_at: new Date().toISOString()
          };
        }
        return data;
      });
      
      set({ miningData: updatedMiningData, isWithdrawing: false });
      
      // Refresh all data
      const { fetchActivities, fetchMiningData, fetchRewards, fetchSummary } = get();
      await Promise.all([fetchActivities(), fetchMiningData(), fetchRewards(), fetchSummary()]);
    } catch (error) {
      console.error('Failed to withdraw:', error);
      set({ isWithdrawing: false });
      throw error;
    }
  },

  registerCoinEXAccount: async (userId: string, email: string) => {
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error('Invalid email address format');
      }

      const account: CoinEXAccount = {
        email,
        isVerified: true,
        registeredAt: new Date().toISOString()
      };

      // Save to localStorage for persistence
      localStorage.setItem(`coinex_account_${userId}`, JSON.stringify(account));

      // Update store
      const { coinexAccounts } = get();
      set({ 
        coinexAccounts: { 
          ...coinexAccounts, 
          [userId]: account 
        } 
      });
    } catch (error) {
      console.error('Failed to register CoinEX account:', error);
      throw error;
    }
  },

  getCoinEXAccount: (userId: string) => {
    const { coinexAccounts } = get();
    
    // First check store
    if (coinexAccounts[userId]) {
      return coinexAccounts[userId];
    }
    
    // Then check localStorage
    const savedAccount = localStorage.getItem(`coinex_account_${userId}`);
    if (savedAccount) {
      const account = JSON.parse(savedAccount);
      // Update store with loaded account
      set({ 
        coinexAccounts: { 
          ...coinexAccounts, 
          [userId]: account 
        } 
      });
      return account;
    }
    
    return null;
  },

  generateDepositHistory: (coinSymbol: string, hashRate: number, price: number) => {
    const history: DailyDepositRecord[] = [];
    const today = new Date();
    let cumulativeAmount = 0;
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
      const timeStr = '14:00'; // 매일 오후 2시 자동 지급
      
      // 해시레이트가 0이면 채굴 보상 없음
      if (hashRate === 0) {
        history.push({
          date: dateStr,
          time: timeStr,
          amount: 0,
          hashRate: 0,
          usdValue: 0,
          cumulativeAmount,
          rewardCalculation: {
            baseReward: 0,
            hashRateMultiplier: 0,
            finalReward: 0
          }
        });
        continue;
      }
      
      // 해시레이트 기반 보상 계산
      const baseReward = 0.001; // 기본 보상
      const hashRateMultiplier = hashRate / 100;
      const dailyVariation = 0.85 + Math.random() * 0.3; // 85% ~ 115% 변동
      const finalReward = baseReward * hashRateMultiplier * dailyVariation;
      
      const usdValue = finalReward * price;
      cumulativeAmount += finalReward;
      
      history.push({
        date: dateStr,
        time: timeStr,
        amount: finalReward,
        hashRate,
        usdValue,
        cumulativeAmount,
        rewardCalculation: {
          baseReward,
          hashRateMultiplier,
          finalReward
        }
      });
    }
    
    // Cache the generated history
    const { depositHistory } = get();
    set({ 
      depositHistory: { 
        ...depositHistory, 
        [coinSymbol]: history 
      } 
    });
    
    return history;
  },

  withdrawToCoinEX: async (coinSymbol: string, amount: number, coinexEmail: string) => {
    set({ isWithdrawing: true });
    try {
      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(coinexEmail)) {
        throw new Error('Invalid CoinEX email address format');
      }

      // Validate amount
      if (amount <= 0) {
        throw new Error('Amount must be greater than 0');
      }

      // Check if user has sufficient balance
      const { miningData } = get();
      const coinData = miningData.find(data => data.token_symbol === coinSymbol);
      if (!coinData || coinData.total_mined < amount) {
        throw new Error('Insufficient balance');
      }

      // Create withdrawal record
      const withdrawalRecord: WithdrawalRecord = {
        id: Date.now().toString(),
        coinSymbol,
        amount,
        coinexEmail,
        status: 'pending',
        timestamp: new Date().toISOString()
      };

      // Add to withdrawal history
      const { withdrawalHistory } = get();
      set({ withdrawalHistory: [...withdrawalHistory, withdrawalRecord] });

      // Simulate withdrawal processing
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Update withdrawal status to completed
      const updatedHistory = get().withdrawalHistory.map(record => 
        record.id === withdrawalRecord.id 
          ? { ...record, status: 'completed' as const, txHash: `0x${Math.random().toString(16).substr(2, 64)}` }
          : record
      );
      
      // Update local data to reflect withdrawal
      const updatedMiningData = miningData.map(data => {
        if (data.token_symbol === coinSymbol) {
          return {
            ...data,
            total_mined: data.total_mined - amount,
            updated_at: new Date().toISOString()
          };
        }
        return data;
      });
      
      set({ 
        miningData: updatedMiningData, 
        withdrawalHistory: updatedHistory,
        isWithdrawing: false 
      });
      
      // Refresh all data
      const { fetchActivities, fetchMiningData, fetchRewards, fetchSummary } = get();
      await Promise.all([fetchActivities(), fetchMiningData(), fetchRewards(), fetchSummary()]);
    } catch (error) {
      console.error('Failed to withdraw to CoinEX:', error);
      
      // Update withdrawal status to failed
      const { withdrawalHistory } = get();
      const updatedHistory = withdrawalHistory.map(record => 
        record.coinSymbol === coinSymbol && record.status === 'pending'
          ? { ...record, status: 'failed' as const, errorMessage: error instanceof Error ? error.message : 'Unknown error' }
          : record
      );
      
      set({ withdrawalHistory: updatedHistory, isWithdrawing: false });
      throw error;
    }
  },

  getWithdrawalHistory: () => {
    const { withdrawalHistory } = get();
    return withdrawalHistory;
  },

  getAvailableBalance: (coinSymbol: string) => {
    const { miningData } = get();
    const coinData = miningData.find(data => data.token_symbol === coinSymbol);
    return coinData?.total_mined || 0;
  },

  generateHashRateHistory: () => {
    return generateMockHashRateHistory();
  },

  updateMiningDashboard: () => {
    const { miningDashboard } = get();
    const now = new Date();
    
    // Update current hash rate with some variation
    const baseHashRate = 1250;
    const variation = Math.random() * 100 - 50;
    const newHashRate = Math.max(0, baseHashRate + variation);
    
    // Update rejection rate with some variation (keep it low)
    const baseRejectionRate = 2.0;
    const rejectionVariation = Math.random() * 1.0 - 0.5;
    const newRejectionRate = Math.max(0, Math.min(5, baseRejectionRate + rejectionVariation));
    
    // Add new data point to history and keep only last 24 hours
    const newDataPoint: HashRateDataPoint = {
      timestamp: now.toISOString(),
      hashRate: Math.round(newHashRate * 100) / 100,
      time: now.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    };
    
    const updatedHistory = [...miningDashboard.hashRateHistory, newDataPoint].slice(-24);
    
    set({
      miningDashboard: {
        currentHashRate: Math.round(newHashRate * 100) / 100,
        rejectionRate: Math.round(newRejectionRate * 10) / 10,
        hashRateHistory: updatedHistory,
        lastUpdated: now.toISOString()
      }
    });
  },
}));