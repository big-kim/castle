import type { 
  MiningOverviewData, 
  MineableCoin, 
  MineableCoinData, 
  MiningActivity,
  MiningSession,
  MiningEarning,
  MiningWithdrawal
} from '../types'

// ============================================================================
// MOCK MINING DATA
// ============================================================================

// Extended MineableCoinData with additional properties for UI compatibility
interface ExtendedMineableCoinData extends MineableCoinData {
  price?: number;
  balance?: number;
  hashRate?: number;
}

export const mockMineableCoins: ExtendedMineableCoinData[] = [
  {
    symbol: 'LTC' as MineableCoin,
    name: 'Litecoin',
    hashrate: 2500000000, // 2.5 GH/s
    earnings: 0.45678901,
    difficulty: 25467890.12345,
    blockReward: 12.5,
    estimatedDailyEarnings: 0.02345678,
    price: 95, // USD price
    balance: 0.45678901,
    hashRate: 2500000000
  },
  {
    symbol: 'DOGE' as MineableCoin,
    name: 'Dogecoin',
    hashrate: 1800000000, // 1.8 GH/s
    earnings: 125.456789,
    difficulty: 8567890.12345,
    blockReward: 10000,
    estimatedDailyEarnings: 12.345678,
    price: 0.08, // USD price
    balance: 125.456789,
    hashRate: 1800000000
  },
  {
    symbol: 'BELLS' as MineableCoin,
    name: 'Bellscoin',
    hashrate: 850000000, // 850 MH/s
    earnings: 2456.789012,
    difficulty: 1234567.89012,
    blockReward: 50,
    estimatedDailyEarnings: 245.678901,
    price: 0.0012, // USD price
    balance: 2456.789012,
    hashRate: 850000000
  },
  {
    symbol: 'PEP' as MineableCoin,
    name: 'Pepecoin',
    hashrate: 650000000, // 650 MH/s
    earnings: 15678.901234,
    difficulty: 987654.32109,
    blockReward: 100000,
    estimatedDailyEarnings: 1567.890123,
    price: 0.000045, // USD price
    balance: 15678.901234,
    hashRate: 650000000
  },
  {
    symbol: 'JKC' as MineableCoin,
    name: 'Junkcoin',
    hashrate: 420000000, // 420 MH/s
    earnings: 8901.234567,
    difficulty: 567890.12345,
    blockReward: 25,
    estimatedDailyEarnings: 890.123456,
    price: 0.0008, // USD price
    balance: 8901.234567,
    hashRate: 420000000
  },
  {
    symbol: 'LKY' as MineableCoin,
    name: 'Luckycoin',
    hashrate: 320000000, // 320 MH/s
    earnings: 567.890123,
    difficulty: 345678.90123,
    blockReward: 88,
    estimatedDailyEarnings: 56.789012,
    price: 0.015, // USD price
    balance: 567.890123,
    hashRate: 320000000
  },
  {
    symbol: 'DINGO' as MineableCoin,
    name: 'Dingocoin',
    hashrate: 280000000, // 280 MH/s
    earnings: 3456.789012,
    difficulty: 234567.89012,
    blockReward: 500,
    estimatedDailyEarnings: 345.678901,
    price: 0.00035, // USD price
    balance: 3456.789012,
    hashRate: 280000000
  },
  {
    symbol: 'SHIC' as MineableCoin,
    name: 'Shiba Classic',
    hashrate: 180000000, // 180 MH/s
    earnings: 89012.345678,
    difficulty: 123456.78901,
    blockReward: 1000000,
    estimatedDailyEarnings: 8901.234567,
    price: 0.0000012, // USD price
    balance: 89012.345678,
    hashRate: 180000000
  }
]

export const mockMiningActivities: MiningActivity[] = [
  {
    id: 'activity_1',
    userId: 'mock_user_1',
    coinSymbol: 'LTC' as MineableCoin,
    hashPowerAllocated: 2500000000,
    hashPowerUsed: 2500000000,
    dailyReward: 0.02345678,
    pendingRewards: 0.01,
    totalMined: 0.45678901,
    isActive: true,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'activity_2',
    userId: 'mock_user_1',
    coinSymbol: 'DOGE' as MineableCoin,
    hashPowerAllocated: 1800000000,
    hashPowerUsed: 1800000000,
    dailyReward: 12.345678,
    pendingRewards: 5.5,
    totalMined: 125.456789,
    isActive: true,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'activity_3',
    userId: 'mock_user_1',
    coinSymbol: 'BELLS' as MineableCoin,
    hashPowerAllocated: 850000000,
    hashPowerUsed: 850000000,
    dailyReward: 245.678901,
    pendingRewards: 100.25,
    totalMined: 2456.789012,
    isActive: true,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'activity_4',
    userId: 'mock_user_1',
    coinSymbol: 'PEP' as MineableCoin,
    hashPowerAllocated: 650000000,
    hashPowerUsed: 650000000,
    dailyReward: 1567.890123,
    pendingRewards: 750.5,
    totalMined: 15678.901234,
    isActive: true,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'activity_5',
    userId: 'mock_user_1',
    coinSymbol: 'JKC' as MineableCoin,
    hashPowerAllocated: 420000000,
    hashPowerUsed: 420000000,
    dailyReward: 890.123456,
    pendingRewards: 400.75,
    totalMined: 8901.234567,
    isActive: true,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'activity_6',
    userId: 'mock_user_1',
    coinSymbol: 'LKY' as MineableCoin,
    hashPowerAllocated: 320000000,
    hashPowerUsed: 320000000,
    dailyReward: 56.789012,
    pendingRewards: 25.5,
    totalMined: 567.890123,
    isActive: true,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 144).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'activity_7',
    userId: 'mock_user_1',
    coinSymbol: 'DINGO' as MineableCoin,
    hashPowerAllocated: 280000000,
    hashPowerUsed: 280000000,
    dailyReward: 345.678901,
    pendingRewards: 150.25,
    totalMined: 3456.789012,
    isActive: true,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 168).toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'activity_8',
    userId: 'mock_user_1',
    coinSymbol: 'SHIC' as MineableCoin,
    hashPowerAllocated: 180000000,
    hashPowerUsed: 180000000,
    dailyReward: 8901.234567,
    pendingRewards: 4000.5,
    totalMined: 89012.345678,
    isActive: true,
    startedAt: new Date(Date.now() - 1000 * 60 * 60 * 192).toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export const mockMiningSessions: MiningSession[] = [
  {
    id: 'session_1',
    userId: 'mock_user_1',
    coinSymbol: 'DOGE' as MineableCoin, // string에서 MineableCoin으로 변경
    hashPower: 1800000000,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(), // 3 days ago
    isActive: true,
    totalEarnings: 125.456789
  },
  {
    id: 'session_2',
    userId: 'mock_user_1',
    coinSymbol: 'BELLS' as MineableCoin, // string에서 MineableCoin으로 변경
    hashPower: 850000000,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), // 2 days ago
    isActive: true,
    totalEarnings: 2456.789012
  },
  {
    id: 'session_3',
    userId: 'mock_user_1',
    coinSymbol: 'LTC' as MineableCoin, // string에서 MineableCoin으로 변경
    hashPower: 2500000000,
    startTime: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
    endTime: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString(), // 12 hours ago
    isActive: false,
    totalEarnings: 0.45678901
  }
]

export const mockMiningEarnings: MiningEarning[] = [
  {
    id: 'earning_1',
    userId: 'mock_user_1',
    sessionId: 'session_1',
    coinSymbol: 'DOGE' as MineableCoin, // string에서 MineableCoin으로 변경
    amount: 12.345678,
    hashPower: 1800000000,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString()
  },
  {
    id: 'earning_2',
    userId: 'mock_user_1',
    sessionId: 'session_2',
    coinSymbol: 'BELLS' as MineableCoin, // string에서 MineableCoin으로 변경
    amount: 245.678901,
    hashPower: 850000000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString()
  },
  {
    id: 'earning_3',
    userId: 'mock_user_1',
    sessionId: 'session_3',
    coinSymbol: 'LTC' as MineableCoin, // string에서 MineableCoin으로 변경
    amount: 0.02345678,
    hashPower: 2500000000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 4).toISOString()
  },
  {
    id: 'earning_4',
    userId: 'mock_user_1',
    sessionId: 'session_1',
    coinSymbol: 'DOGE' as MineableCoin, // string에서 MineableCoin으로 변경
    amount: 11.234567,
    hashPower: 1800000000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString()
  },
  {
    id: 'earning_5',
    userId: 'mock_user_1',
    sessionId: 'session_2',
    coinSymbol: 'BELLS' as MineableCoin, // string에서 MineableCoin으로 변경
    amount: 234.567890,
    hashPower: 850000000,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12).toISOString()
  }
]

export const mockMiningWithdrawals: MiningWithdrawal[] = [
  {
    id: 'withdrawal_1',
    userId: 'mock_user_1',
    coinSymbol: 'DOGE' as MineableCoin, // string에서 MineableCoin으로 변경
    amount: 100,
    fee: 5,
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(), // 7 days ago
    processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6).toISOString() // 6 days ago
  },
  {
    id: 'withdrawal_2',
    userId: 'mock_user_1',
    coinSymbol: 'BELLS' as MineableCoin, // string에서 MineableCoin으로 변경
    amount: 2000,
    fee: 100,
    status: 'completed',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(), // 14 days ago
    processedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 13).toISOString() // 13 days ago
  },
  {
    id: 'withdrawal_3',
    userId: 'mock_user_1',
    coinSymbol: 'LTC' as MineableCoin, // string에서 MineableCoin으로 변경
    amount: 0.2,
    fee: 0.01,
    status: 'pending',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString() // 2 hours ago
  }
]

export const mockMiningOverviewData: MiningOverviewData = {
  totalHashrate: mockMineableCoins.reduce((sum, coin) => sum + coin.hashrate, 0),
  totalEarnings: mockMineableCoins.reduce((sum, coin) => sum + coin.earnings, 0),
  activeMachines: mockMiningSessions.filter(session => session.isActive).length,
  dailyEarnings: mockMineableCoins.reduce((sum, coin) => sum + coin.estimatedDailyEarnings, 0),
  mineableCoins: mockMineableCoins,
  recentActivities: mockMiningActivities
}

// ============================================================================
// MOCK API RESPONSES
// ============================================================================

export interface MockMiningOverviewResponse {
  activeSessions: number
  totalEarnings: number
  totalWithdrawn: number
  totalBalance: number
  balancesByCoin: Record<string, number>
  activeSessionsDetails: MiningSession[]
}

export const mockMiningOverviewResponse: MockMiningOverviewResponse = {
  activeSessions: mockMiningSessions.filter(session => session.isActive).length,
  totalEarnings: mockMineableCoins.reduce((sum, coin) => sum + coin.earnings, 0),
  totalWithdrawn: mockMiningWithdrawals
    .filter(w => w.status === 'completed')
    .reduce((sum, w) => sum + w.amount, 0),
  totalBalance: mockMineableCoins.reduce((sum, coin) => sum + coin.earnings, 0) - 
    mockMiningWithdrawals
      .filter(w => w.status === 'completed')
      .reduce((sum, w) => sum + w.amount, 0),
  balancesByCoin: mockMineableCoins.reduce((acc, coin) => {
    acc[coin.symbol] = coin.earnings
    return acc
  }, {} as Record<string, number>),
  activeSessionsDetails: mockMiningSessions.filter(session => session.isActive)
}

export interface MockMiningPool {
  id: string
  coinSymbol: MineableCoin // string에서 MineableCoin으로 변경
  name: string
  difficulty: number
  blockReward: number
  totalHashPower: number
  activeMiners: number
  feePercentage: number
  minPayout: number
  isActive: boolean
  stats?: {
    totalHashPower: number
    activeMiners: number
    estimatedDailyReward: number
    difficulty: number
    blockReward: number
  }
}

export const mockMiningPools: MockMiningPool[] = [
  {
    id: 'pool_ltc',
    coinSymbol: 'LTC' as MineableCoin, // string에서 MineableCoin으로 변경
    name: 'Litecoin Mining Pool',
    difficulty: 25467890.12345,
    blockReward: 12.5,
    totalHashPower: 2500000000,
    activeMiners: 500,
    feePercentage: 2.0,
    minPayout: 0.1,
    isActive: true,
    stats: {
      totalHashPower: 2500000000,
      activeMiners: 500,
      estimatedDailyReward: 0.02345678,
      difficulty: 25467890.12345,
      blockReward: 12.5
    }
  },
  {
    id: 'pool_doge',
    coinSymbol: 'DOGE' as MineableCoin, // string에서 MineableCoin으로 변경
    name: 'Dogecoin Mining Pool',
    difficulty: 8567890.12345,
    blockReward: 10000,
    totalHashPower: 1800000000,
    activeMiners: 850,
    feePercentage: 1.0,
    minPayout: 100,
    isActive: true,
    stats: {
      totalHashPower: 1800000000,
      activeMiners: 850,
      estimatedDailyReward: 12.345678,
      difficulty: 8567890.12345,
      blockReward: 10000
    }
  },
  {
    id: 'pool_bells',
    coinSymbol: 'BELLS' as MineableCoin, // string에서 MineableCoin으로 변경
    name: 'Bellscoin Mining Pool',
    difficulty: 1234567.89012,
    blockReward: 50,
    totalHashPower: 850000000,
    activeMiners: 300,
    feePercentage: 1.5,
    minPayout: 1000,
    isActive: true,
    stats: {
      totalHashPower: 850000000,
      activeMiners: 300,
      estimatedDailyReward: 245.678901,
      difficulty: 1234567.89012,
      blockReward: 50
    }
  },
  {
    id: 'pool_pep',
    coinSymbol: 'PEP' as MineableCoin, // string에서 MineableCoin으로 변경
    name: 'Pepecoin Mining Pool',
    difficulty: 987654.32109,
    blockReward: 100000,
    totalHashPower: 650000000,
    activeMiners: 200,
    feePercentage: 1.5,
    minPayout: 10000,
    isActive: true,
    stats: {
      totalHashPower: 650000000,
      activeMiners: 200,
      estimatedDailyReward: 1567.890123,
      difficulty: 987654.32109,
      blockReward: 100000
    }
  }
]

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Generate random mining activity for testing
 */
export const generateRandomMiningActivity = (coinSymbol: MineableCoin): MiningActivity => {
  const coinData = mockMineableCoins.find(coin => coin.symbol === coinSymbol)
  if (!coinData) throw new Error(`Coin ${coinSymbol} not found`)
  
  return {
    id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    userId: 'mock_user_1',
    coinSymbol,
    hashPowerAllocated: coinData.hashrate,
    hashPowerUsed: coinData.hashrate,
    dailyReward: coinData.estimatedDailyEarnings,
    pendingRewards: coinData.estimatedDailyEarnings * 0.5,
    totalMined: coinData.earnings,
    isActive: true,
    startedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
}

/**
 * Update mining earnings for active sessions
 */
export const updateMiningEarnings = (): void => {
  mockMineableCoins.forEach(coin => {
    const randomMultiplier = 0.8 + Math.random() * 0.4 // 0.8 to 1.2
    coin.earnings += coin.estimatedDailyEarnings * randomMultiplier
    
    // Add new activity
    const newActivity = generateRandomMiningActivity(coin.symbol)
    mockMiningActivities.unshift(newActivity)
    
    // Keep only last 20 activities
    if (mockMiningActivities.length > 20) {
      mockMiningActivities.splice(20)
    }
  })
}

/**
 * Get mock data with simulated real-time updates
 */
export const getMockMiningData = (): MiningOverviewData => {
  updateMiningEarnings()
  return {
    ...mockMiningOverviewData,
    totalHashrate: mockMineableCoins.reduce((sum, coin) => sum + coin.hashrate, 0),
    totalEarnings: mockMineableCoins.reduce((sum, coin) => sum + coin.earnings, 0),
    dailyEarnings: mockMineableCoins.reduce((sum, coin) => sum + coin.estimatedDailyEarnings, 0),
    mineableCoins: mockMineableCoins,
    recentActivities: mockMiningActivities.slice(0, 10)
  }
}