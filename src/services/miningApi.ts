import type { 
  MiningOverviewData, 
  MineableCoin, 
  MiningSession, 
  MiningEarning, 
  MiningWithdrawal,
  MineableCoinData,
  MiningActivity
} from '../types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004/api'

interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

interface MiningOverviewResponse {
  activeSessions: number
  totalEarnings: number
  totalWithdrawn: number
  totalBalance: number
  balancesByCoin: Record<string, number>
  activeSessionsDetails: MiningSession[]
}

interface MiningPoolStats {
  totalHashPower: number
  activeMiners: number
  estimatedDailyReward: number
  difficulty: number
  blockReward: number
}

interface MiningPool {
  id: string
  coinSymbol: string
  name: string
  difficulty: number
  blockReward: number
  totalHashPower: number
  activeMiners: number
  feePercentage: number
  minPayout: number
  isActive: boolean
  stats?: MiningPoolStats
}

class MiningApiService {
  private async fetchWithAuth<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
    try {
      // Get JWT token from localStorage (same as userStore.ts)
      const token = localStorage.getItem('ic-wallet-token')
      
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
          ...(token && { Authorization: `Bearer ${token}` }),
          ...options.headers,
        },
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Network error' }))
        throw new Error(errorData.error || `HTTP ${response.status}`)
      }

      return await response.json()
    } catch (error) {
      console.error(`Mining API Error (${endpoint}):`, error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  /**
   * Get mining overview/summary for the user
   */
  async getMiningOverview(): Promise<MiningOverviewResponse | null> {
    const response = await this.fetchWithAuth<MiningOverviewResponse>('/mining/overview')
    return response.success ? response.data || null : null
  }

  /**
   * Get available mining pools
   */
  async getMiningPools(): Promise<MiningPool[]> {
    const response = await this.fetchWithAuth<MiningPool[]>('/mining/pools')
    return response.success ? response.data || [] : []
  }

  /**
   * Get specific mining pool details
   */
  async getMiningPool(coinSymbol: string): Promise<MiningPool | null> {
    const response = await this.fetchWithAuth<MiningPool>(`/mining/pools/${coinSymbol}`)
    return response.success ? response.data || null : null
  }

  /**
   * Start mining for a specific coin
   */
  async startMining(coinSymbol: string, hashPower: number): Promise<MiningSession | null> {
    const response = await this.fetchWithAuth<MiningSession>('/mining/start', {
      method: 'POST',
      body: JSON.stringify({ coinSymbol, hashPower })
    })
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to start mining')
    }
    
    return response.data || null
  }

  /**
   * Stop mining for a specific coin
   */
  async stopMining(coinSymbol: string): Promise<MiningSession | null> {
    const response = await this.fetchWithAuth<MiningSession>('/mining/stop', {
      method: 'POST',
      body: JSON.stringify({ coinSymbol })
    })
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to stop mining')
    }
    
    return response.data || null
  }

  /**
   * Get user's mining sessions
   */
  async getMiningSessions(): Promise<MiningSession[]> {
    const response = await this.fetchWithAuth<MiningSession[]>('/mining/sessions')
    return response.success ? response.data || [] : []
  }

  /**
   * Get user's mining earnings
   */
  async getMiningEarnings(coinSymbol?: string, limit?: number): Promise<MiningEarning[]> {
    const params = new URLSearchParams()
    if (coinSymbol) params.append('coinSymbol', coinSymbol)
    if (limit) params.append('limit', limit.toString())
    
    const endpoint = `/mining/earnings${params.toString() ? `?${params.toString()}` : ''}`
    const response = await this.fetchWithAuth<MiningEarning[]>(endpoint)
    return response.success ? response.data || [] : []
  }

  /**
   * Get mining statistics
   */
  async getMiningStats(): Promise<MiningOverviewResponse | null> {
    const response = await this.fetchWithAuth<MiningOverviewResponse>('/mining/stats')
    return response.success ? response.data || null : null
  }

  /**
   * Request withdrawal of mining earnings
   */
  async requestWithdrawal(coinSymbol: string, amount: number): Promise<boolean> {
    const response = await this.fetchWithAuth('/mining/withdraw', {
      method: 'POST',
      body: JSON.stringify({ coinSymbol, amount })
    })
    
    if (!response.success) {
      throw new Error(response.error || 'Failed to process withdrawal')
    }
    
    return true
  }

  /**
   * Get user's withdrawal history
   */
  async getWithdrawalHistory(): Promise<MiningWithdrawal[]> {
    const response = await this.fetchWithAuth<MiningWithdrawal[]>('/mining/withdrawals')
    return response.success ? response.data || [] : []
  }

  /**
   * Transform mining data for compatibility with existing components
   */
  async getMiningData(): Promise<MiningOverviewData> {
    const [overview, pools, sessions, earnings] = await Promise.all([
      this.getMiningOverview(),
      this.getMiningPools(),
      this.getMiningSessions(),
      this.getMiningEarnings(undefined, 10) // Get recent 10 earnings
    ])

    // Transform pools to MineableCoinData format
    const mineableCoins: MineableCoinData[] = pools.map(pool => ({
      symbol: pool.coinSymbol as MineableCoin,
      name: pool.name,
      hashrate: pool.stats?.totalHashPower || 0,
      earnings: overview?.balancesByCoin?.[pool.coinSymbol] || 0,
      difficulty: pool.difficulty,
      blockReward: pool.stats?.blockReward || 0,
      estimatedDailyEarnings: pool.stats?.estimatedDailyReward || 0
    }))

    // Transform recent earnings to MiningActivity format
    const recentActivities: MiningActivity[] = earnings.slice(0, 10).map(earning => ({
      id: earning.id,
      type: 'mining' as const,
      coinSymbol: earning.coinSymbol as MineableCoin,
      amount: earning.amount,
      timestamp: earning.timestamp,
      status: 'completed' as const
    }))

    // Calculate daily earnings from today's earnings
    const today = new Date()
    const dailyEarnings = earnings
      .filter(earning => {
        const earningDate = new Date(earning.timestamp)
        return earningDate.toDateString() === today.toDateString()
      })
      .reduce((sum, earning) => sum + earning.amount, 0)

    return {
      totalHashrate: overview?.activeSessionsDetails.reduce((sum, session) => sum + session.hashPower, 0) || 0,
      totalEarnings: overview?.totalEarnings || 0,
      activeMachines: overview?.activeSessions || 0,
      dailyEarnings,
      mineableCoins,
      recentActivities
    }
  }
}

export const miningApi = new MiningApiService()
export default miningApi