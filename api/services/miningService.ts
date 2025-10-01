import { dbManager } from '../database.js'
import type { MiningPool, MiningSession, MiningEarning } from '../database.js'

export interface MiningPoolStats {
  totalHashPower: number
  activeMiners: number
  estimatedDailyReward: number
  difficulty: number
  blockReward: number
}

export interface MiningCalculation {
  userHashPower: number
  poolHashPower: number
  userShare: number
  estimatedDailyEarnings: number
  estimatedHourlyEarnings: number
}

export class MiningService {
  private static instance: MiningService
  private earningsIntervals: Map<string, NodeJS.Timeout> = new Map()

  static getInstance(): MiningService {
    if (!MiningService.instance) {
      MiningService.instance = new MiningService()
    }
    return MiningService.instance
  }

  /**
   * Initialize mining pools with default configurations
   */
  async initializeMiningPools(): Promise<void> {
    const defaultPools = [
      {
        coinSymbol: 'LTC',
        name: 'Litecoin Pool',
        algorithm: 'Scrypt',
        difficulty: 25000000,
        hashRate: 0,
        totalMiners: 0,
        rewardPerBlock: 12.5,
        blockTime: 150,
        poolFee: 0.015,
        isActive: true
      },
      {
        coinSymbol: 'DOGE',
        name: 'Dogecoin Pool',
        algorithm: 'Scrypt',
        difficulty: 8500000,
        hashRate: 0,
        totalMiners: 0,
        rewardPerBlock: 10000,
        blockTime: 60,
        poolFee: 0.01,
        isActive: true
      },
      {
        coinSymbol: 'BELLS',
        name: 'Bellscoin Pool',
        algorithm: 'Scrypt',
        difficulty: 1200000,
        hashRate: 0,
        totalMiners: 0,
        rewardPerBlock: 50,
        blockTime: 60,
        poolFee: 0.02,
        isActive: true
      },
      {
        coinSymbol: 'PEP',
        name: 'Pepecoin Pool',
        algorithm: 'Scrypt',
        difficulty: 800000,
        hashRate: 0,
        totalMiners: 0,
        rewardPerBlock: 100,
        blockTime: 60,
        poolFee: 0.015,
        isActive: true
      },
      {
        coinSymbol: 'JKC',
        name: 'Junkcoin Pool',
        algorithm: 'Scrypt',
        difficulty: 500000,
        hashRate: 0,
        totalMiners: 0,
        rewardPerBlock: 25,
        blockTime: 60,
        poolFee: 0.025,
        isActive: true
      },
      {
        coinSymbol: 'LKY',
        name: 'Luckycoin Pool',
        algorithm: 'Scrypt',
        difficulty: 300000,
        hashRate: 0,
        totalMiners: 0,
        rewardPerBlock: 88,
        blockTime: 60,
        poolFee: 0.018,
        isActive: true
      },
      {
        coinSymbol: 'DINGO',
        name: 'Dingocoin Pool',
        algorithm: 'Scrypt',
        difficulty: 600000,
        hashRate: 0,
        totalMiners: 0,
        rewardPerBlock: 1000,
        blockTime: 60,
        poolFee: 0.012,
        isActive: true
      },
      {
        coinSymbol: 'SHIC',
        name: 'Shicoin Pool',
        algorithm: 'Scrypt',
        difficulty: 400000,
        hashRate: 0,
        totalMiners: 0,
        rewardPerBlock: 500,
        blockTime: 60,
        poolFee: 0.02,
        isActive: true
      }
    ]

    for (const pool of defaultPools) {
      const existingPool = await dbManager.getMiningPoolByCoin(pool.coinSymbol)
      if (!existingPool) {
        await dbManager.createMiningPool(pool)
      }
    }
  }

  /**
   * Calculate mining statistics for a specific pool
   */
  async calculatePoolStats(coinSymbol: string): Promise<MiningPoolStats | null> {
    const pool = await dbManager.getMiningPoolByCoin(coinSymbol)
    if (!pool) return null

    const activeSessions = await dbManager.getActiveMiningSessionsByCoin(coinSymbol)
    const totalHashPower = activeSessions.reduce((sum, session) => sum + session.hashPower, 0)
    const activeMiners = activeSessions.length

    // Calculate estimated daily reward based on difficulty and block reward
    const blocksPerDay = 144 // Approximate blocks per day for most coins
    const networkHashRate = pool.difficulty * 1000000 // Convert to actual hash rate
    const poolHashRate = totalHashPower || 1 // Avoid division by zero
    const poolShare = poolHashRate / (networkHashRate + poolHashRate)
    const estimatedDailyReward = blocksPerDay * pool.blockReward * poolShare * (1 - pool.feePercentage / 100)

    return {
      totalHashPower,
      activeMiners,
      estimatedDailyReward,
      difficulty: pool.difficulty,
      blockReward: pool.blockReward
    }
  }

  /**
   * Calculate user's mining earnings potential
   */
  async calculateUserMiningPotential(coinSymbol: string, userHashPower: number): Promise<MiningCalculation | null> {
    const poolStats = await this.calculatePoolStats(coinSymbol)
    if (!poolStats) return null

    const poolHashPower = poolStats.totalHashPower + userHashPower
    const userShare = userHashPower / poolHashPower
    const estimatedDailyEarnings = poolStats.estimatedDailyReward * userShare
    const estimatedHourlyEarnings = estimatedDailyEarnings / 24

    return {
      userHashPower,
      poolHashPower,
      userShare,
      estimatedDailyEarnings,
      estimatedHourlyEarnings
    }
  }

  /**
   * Start mining session and begin earnings calculation
   */
  async startMining(userId: number, coinSymbol: string, hashPower: number): Promise<MiningSession | null> {
    // Check if user already has an active session for this coin
    const existingSessions = await dbManager.getActiveMiningSessionsByUser(userId)
    const activeSession = existingSessions.find(session => session.coinSymbol === coinSymbol)
    
    if (activeSession) {
      throw new Error(`Already mining ${coinSymbol}`)
    }

    // Get the mining pool
    const pool = await dbManager.getMiningPoolByCoin(coinSymbol)
    if (!pool) {
      throw new Error(`Mining pool not found for ${coinSymbol}`)
    }

    // Create new mining session
    const session = await dbManager.createMiningSession({
      userId,
      poolId: pool.id,
      coinSymbol,
      hashPower,
      status: 'active',
      startedAt: new Date().toISOString(),
      totalEarnings: 0
    })

    if (!session) {
      throw new Error('Failed to create mining session')
    }

    // Update pool statistics
    await this.updatePoolHashPower(coinSymbol)

    // Start earnings calculation
    this.startEarningsCalculation(session)

    return session
  }

  /**
   * Stop mining session
   */
  async stopMining(userId: number, coinSymbol: string): Promise<MiningSession | null> {
    const activeSessions = await dbManager.getActiveMiningSessionsByUser(userId)
    const session = activeSessions.find(s => s.coinSymbol === coinSymbol)
    
    if (!session) {
      throw new Error(`No active mining session found for ${coinSymbol}`)
    }

    // Stop earnings calculation
    this.stopEarningsCalculation(session.id.toString())

    // Update session
    const updatedSession = await dbManager.updateMiningSession(session.id, {
      stoppedAt: new Date().toISOString(),
      status: 'stopped'
    })

    // Update pool statistics
    await this.updatePoolHashPower(coinSymbol)

    return updatedSession
  }

  /**
   * Start automatic earnings calculation for a mining session
   */
  private startEarningsCalculation(session: MiningSession): void {
    const intervalId = setInterval(async () => {
      try {
        const calculation = await this.calculateUserMiningPotential(session.coinSymbol, session.hashPower)
        if (!calculation) return

        // Calculate earnings for the last interval (5 minutes)
        const intervalMinutes = 5
        const intervalEarnings = (calculation.estimatedHourlyEarnings / 60) * intervalMinutes

        // Add some randomness to make it more realistic (±20%)
        const randomFactor = 0.8 + Math.random() * 0.4
        const actualEarnings = intervalEarnings * randomFactor

        if (actualEarnings > 0) {
          // Record earnings
          await dbManager.createMiningEarning({
            sessionId: session.id,
            userId: session.userId,
            coinSymbol: session.coinSymbol,
            amount: actualEarnings,
            timestamp: new Date(),
            hashPower: session.hashPower
          })

          // Update session total earnings
          const currentSession = await dbManager.getMiningSession(session.id)
          if (currentSession && currentSession.isActive) {
            await dbManager.updateMiningSession(session.id, {
              totalEarnings: currentSession.totalEarnings + actualEarnings
            })
          }
        }
      } catch (error) {
        console.error('Error calculating earnings for session', session.id, error)
      }
    }, 5 * 60 * 1000) // Every 5 minutes

    this.earningsIntervals.set(session.id, intervalId)
  }

  /**
   * Stop earnings calculation for a mining session
   */
  private stopEarningsCalculation(sessionId: string): void {
    const intervalId = this.earningsIntervals.get(sessionId)
    if (intervalId) {
      clearInterval(intervalId)
      this.earningsIntervals.delete(sessionId)
    }
  }

  /**
   * Update pool hash power statistics
   */
  private async updatePoolHashPower(coinSymbol: string): Promise<void> {
    const pool = await dbManager.getMiningPoolByCoin(coinSymbol)
    if (!pool) return

    const activeSessions = await dbManager.getActiveMiningSessionsByCoin(coinSymbol)
    const totalHashPower = activeSessions.reduce((sum, session) => sum + session.hashPower, 0)
    const activeMiners = activeSessions.length

    await dbManager.updateMiningPool(pool.id, {
      hashRate: totalHashPower,
      totalMiners: activeMiners
    })
  }

  /**
   * Get user mining statistics
   */
  async getUserMiningStats(userId: number): Promise<any> {
    const activeSessions = await dbManager.getActiveMiningSessionsByUser(userId)
    const allSessions = await dbManager.getMiningSessionsByUser(userId)
    
    const totalEarnings = allSessions.reduce((sum, session) => sum + session.totalEarnings, 0)
    const totalHashPower = activeSessions.reduce((sum, session) => sum + session.hashPower, 0)
    
    return {
      activeSessions: activeSessions.length,
      totalSessions: allSessions.length,
      totalEarnings,
      totalHashPower,
      activeCoins: activeSessions.map(s => s.coinSymbol)
    }
  }

  /**
   * Process mining withdrawal
   */
  async processWithdrawal(userId: string, coinSymbol: string, amount: number): Promise<boolean> {
    const pool = await dbManager.getMiningPoolByCoin(coinSymbol)
    if (!pool) {
      throw new Error('Mining pool not found')
    }

    if (amount < pool.minPayout) {
      throw new Error(`Minimum payout is ${pool.minPayout} ${coinSymbol}`)
    }

    // Calculate withdrawal fee (2% of amount)
    const feePercentage = 2
    const fee = amount * (feePercentage / 100)
    const netAmount = amount - fee

    try {
      // Create withdrawal record
      await dbManager.createMiningWithdrawal({
        userId,
        coinSymbol,
        amount,
        fee,
        netAmount,
        status: 'completed',
        requestTime: new Date(),
        processTime: new Date()
      })

      // Add to user's point wallet
      await dbManager.addMiningEarnings(userId, coinSymbol, netAmount)

      return true
    } catch (error) {
      console.error('Error processing withdrawal:', error)
      return false
    }
  }

  /**
   * Get user's total mining balance for a specific coin
   */
  async getUserMiningBalance(userId: string, coinSymbol: string): Promise<number> {
    const earnings = await dbManager.getMiningEarningsByUserAndCoin(userId, coinSymbol)
    const withdrawals = await dbManager.getMiningWithdrawalsByUserAndCoin(userId, coinSymbol)
    
    const totalEarnings = earnings.reduce((sum, earning) => sum + earning.amount, 0)
    const totalWithdrawn = withdrawals.reduce((sum, withdrawal) => sum + withdrawal.amount, 0)
    
    return Math.max(0, totalEarnings - totalWithdrawn)
  }

  /**
   * Get comprehensive mining overview for a user
   */
  async getUserMiningOverview(userId: string) {
    const activeSessions = await dbManager.getActiveMiningSessionsByUser(userId)
    const allEarnings = await dbManager.getMiningEarningsByUser(userId)
    const allWithdrawals = await dbManager.getMiningWithdrawalsByUser(userId)

    // Group earnings by coin
    const earningsByCoin: Record<string, number> = {}
    allEarnings.forEach(earning => {
      earningsByCoin[earning.coinSymbol] = (earningsByCoin[earning.coinSymbol] || 0) + earning.amount
    })

    // Group withdrawals by coin
    const withdrawalsByCoin: Record<string, number> = {}
    allWithdrawals.forEach(withdrawal => {
      withdrawalsByCoin[withdrawal.coinSymbol] = (withdrawalsByCoin[withdrawal.coinSymbol] || 0) + withdrawal.amount
    })

    // Calculate balances by coin
    const balancesByCoin: Record<string, number> = {}
    Object.keys(earningsByCoin).forEach(coin => {
      const earnings = earningsByCoin[coin] || 0
      const withdrawals = withdrawalsByCoin[coin] || 0
      balancesByCoin[coin] = Math.max(0, earnings - withdrawals)
    })

    const totalEarnings = Object.values(earningsByCoin).reduce((sum, amount) => sum + amount, 0)
    const totalWithdrawn = Object.values(withdrawalsByCoin).reduce((sum, amount) => sum + amount, 0)
    const totalBalance = Object.values(balancesByCoin).reduce((sum, amount) => sum + amount, 0)

    return {
      activeSessions: activeSessions.length,
      totalEarnings,
      totalWithdrawn,
      totalBalance,
      balancesByCoin,
      activeSessionsDetails: activeSessions
    }
  }

  /**
   * Cleanup - stop all earnings calculations
   */
  cleanup(): void {
    this.earningsIntervals.forEach(intervalId => clearInterval(intervalId))
    this.earningsIntervals.clear()
  }
}

export const miningService = MiningService.getInstance()