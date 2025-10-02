import { create } from 'zustand';
import type { SimpleMiningStore, MiningOverviewData, MineableCoin } from '../types'
import { miningApi } from '../services/miningApi';
// Import mock data for fallback when backend is not available
import { getMockMiningData, generateRandomMiningActivity } from '../utils/mockMiningData';

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
      // Try to fetch real data from API
      const data = await miningApi.getMiningData()
      set({ miningData: data, isLoading: false })
      console.log('✅ Mining data fetched from API successfully')
    } catch (error) {
      console.error('Failed to fetch mining data:', error)
      
      // Check if it's a connection error (backend not available)
      const isConnectionError = error instanceof Error && 
        (error.message.includes('Failed to fetch') || 
         error.message.includes('ERR_CONNECTION_REFUSED') ||
         error.message.includes('Network error'))
      
      if (isConnectionError) {
        // Use mock data when backend is not available
        console.log('🔄 Backend not available, using mock mining data')
        const mockData = getMockMiningData()
        set({ miningData: mockData, isLoading: false })
      } else if (error instanceof Error && error.message.includes('Authentication required')) {
        // If authentication error, set empty data instead of error state
        set({ 
          miningData: {
            totalHashrate: 0,
            totalEarnings: 0,
            activeMachines: 0,
            dailyEarnings: 0,
            mineableCoins: [],
            recentActivities: []
          }, 
          isLoading: false 
        })
      } else {
        // For other errors, use mock data as fallback
        console.log('⚠️ API error, falling back to mock mining data')
        const mockData = getMockMiningData()
        set({ miningData: mockData, isLoading: false })
      }
    }
  },

  startMining: async (coinSymbol: MineableCoin, hashPower: number = 100) => {
    try {
      // Try real API first
      const result = await miningApi.startMining(coinSymbol, hashPower)
      if (result) {
        // Update active mining coins
        set(state => ({
          activeMiningCoins: [...state.activeMiningCoins, coinSymbol]
        }))
        // Refresh mining data
        get().refreshMiningData()
        return
      }
      throw new Error('Failed to start mining')
    } catch (error) {
      console.error('Failed to start mining:', error)
      
      // Check if it's a connection error (backend not available)
      const isConnectionError = error instanceof Error && 
        (error.message.includes('Failed to fetch') || 
         error.message.includes('ERR_CONNECTION_REFUSED') ||
         error.message.includes('Network error'))
      
      if (isConnectionError) {
        // Simulate starting mining with mock data
        console.log(`🔄 Backend not available, simulating mining start for ${coinSymbol}`)
        
        // Update active mining coins
        set(state => ({
          activeMiningCoins: [...state.activeMiningCoins, coinSymbol]
        }))
        
        // Generate a new mining activity
        const currentData = get().miningData
        if (currentData) {
          const newActivity = generateRandomMiningActivity(coinSymbol)
          const updatedData = {
            ...currentData,
            recentActivities: [newActivity, ...currentData.recentActivities.slice(0, 9)]
          }
          set({ miningData: updatedData })
        }
        
        return
      }
      
      throw error
    }
  },

  stopMining: async (coinSymbol: MineableCoin) => {
    try {
      // Try real API first
      const result = await miningApi.stopMining(coinSymbol)
      if (result) {
        // Remove from active mining coins
        set(state => ({
          activeMiningCoins: state.activeMiningCoins.filter(coin => coin !== coinSymbol)
        }))
        // Refresh mining data
        get().refreshMiningData()
        return
      }
      throw new Error('Failed to stop mining')
    } catch (error) {
      console.error('Failed to stop mining:', error)
      
      // Check if it's a connection error (backend not available)
      const isConnectionError = error instanceof Error && 
        (error.message.includes('Failed to fetch') || 
         error.message.includes('ERR_CONNECTION_REFUSED') ||
         error.message.includes('Network error'))
      
      if (isConnectionError) {
        // Simulate stopping mining with mock data
        console.log(`🔄 Backend not available, simulating mining stop for ${coinSymbol}`)
        
        // Remove from active mining coins
        set(state => ({
          activeMiningCoins: state.activeMiningCoins.filter(coin => coin !== coinSymbol)
        }))
        
        return
      }
      
      throw error
    }
  },

  refreshMiningData: async () => {
    try {
      // Try to fetch real data from API
      const data = await miningApi.getMiningData()
      set({ miningData: data })
      console.log('✅ Mining data refreshed from API successfully')
    } catch (error) {
      console.error('Failed to refresh mining data:', error)
      
      // Check if it's a connection error (backend not available)
      const isConnectionError = error instanceof Error && 
        (error.message.includes('Failed to fetch') || 
         error.message.includes('ERR_CONNECTION_REFUSED') ||
         error.message.includes('Network error'))
      
      if (isConnectionError) {
        // Use mock data when backend is not available
        console.log('🔄 Backend not available, refreshing with mock mining data')
        const mockData = getMockMiningData()
        set({ miningData: mockData })
      } else if (error instanceof Error && error.message.includes('Authentication required')) {
        // If authentication error, set empty data instead of error state
        set({ 
          miningData: {
            totalHashrate: 0,
            totalEarnings: 0,
            activeMachines: 0,
            dailyEarnings: 0,
            mineableCoins: [],
            recentActivities: []
          }
        })
      } else {
        // For other errors, use mock data as fallback
        console.log('⚠️ API error, falling back to mock mining data for refresh')
        const mockData = getMockMiningData()
        set({ miningData: mockData })
      }
    }
  },
}));