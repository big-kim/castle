import { create } from 'zustand';
import type { SimpleMiningStore, MiningOverviewData, MineableCoin } from '../types'
import { miningApi } from '../services/miningApi';

// ============================================================================
// MINING STORE
// ============================================================================

export const useMiningStore = create<SimpleMiningStore>((set, get) => ({
  // State
  miningData: null,
  isLoading: false,
  activeMiningCoins: [],

  // Actions
  fetchMiningData: async () => {
    set({ isLoading: true })
    try {
      const data = await miningApi.getMiningData()
      set({ miningData: data, isLoading: false })
    } catch (error) {
      console.error('Failed to fetch mining data:', error)
      // If authentication error, set empty data instead of error state
      if (error instanceof Error && error.message.includes('Authentication required')) {
        set({ 
          miningData: {
            totalEarnings: 0,
            totalWithdrawn: 0,
            totalBalance: 0,
            activeSessions: 0,
            mineableCoins: [],
            recentActivities: [],
            dailyEarnings: 0
          }, 
          isLoading: false 
        })
      } else {
        set({ isLoading: false })
      }
    }
  },

  startMining: async (coinSymbol: MineableCoin, hashPower: number = 100) => {
    try {
      const result = await miningApi.startMining(coinSymbol, hashPower)
      if (result) {
        // Update active mining coins
        set(state => ({
          activeMiningCoins: [...state.activeMiningCoins, coinSymbol]
        }))
        // Refresh mining data
        get().refreshMiningData()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to start mining:', error)
      return false
    }
  },

  stopMining: async (coinSymbol: MineableCoin) => {
    try {
      const result = await miningApi.stopMining(coinSymbol)
      if (result) {
        // Remove from active mining coins
        set(state => ({
          activeMiningCoins: state.activeMiningCoins.filter(coin => coin !== coinSymbol)
        }))
        // Refresh mining data
        get().refreshMiningData()
        return true
      }
      return false
    } catch (error) {
      console.error('Failed to stop mining:', error)
      return false
    }
  },

  refreshMiningData: async () => {
    try {
      const data = await miningApi.getMiningData()
      set({ miningData: data })
    } catch (error) {
      console.error('Failed to refresh mining data:', error)
      // If authentication error, set empty data instead of error state
      if (error instanceof Error && error.message.includes('Authentication required')) {
        set({ 
          miningData: {
            totalEarnings: 0,
            totalWithdrawn: 0,
            totalBalance: 0,
            activeSessions: 0,
            mineableCoins: [],
            recentActivities: [],
            dailyEarnings: 0
          }
        })
      }
    }
  },
}));