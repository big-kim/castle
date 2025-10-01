/**
 * Mining API routes
 * Handle mining operations, pools, sessions, earnings, and withdrawals
 */
import express from 'express'
import { authenticateToken, walletRateLimit, validateWalletInput, securityHeaders } from '../middleware/auth.js'
import { dbManager } from '../database.js'
import { miningService } from '../services/miningService.js'

const router = express.Router()

// Apply security headers to all mining routes
router.use(securityHeaders)

// Supported mining coins
const MINING_COINS = ['LTC', 'DOGE', 'BELLS', 'PEP', 'JKC', 'LKY', 'DINGO', 'SHIC']

// Mining pool configurations
const MINING_POOL_CONFIGS = {
  'LTC': { name: 'Litecoin Pool', algorithm: 'Scrypt', rewardPerBlock: 12.5, blockTime: 150, poolFee: 0.01 },
  'DOGE': { name: 'Dogecoin Pool', algorithm: 'Scrypt', rewardPerBlock: 10000, blockTime: 60, poolFee: 0.01 },
  'BELLS': { name: 'Bellscoin Pool', algorithm: 'Scrypt', rewardPerBlock: 50, blockTime: 60, poolFee: 0.015 },
  'PEP': { name: 'Pepecoin Pool', algorithm: 'Scrypt', rewardPerBlock: 100, blockTime: 60, poolFee: 0.01 },
  'JKC': { name: 'Junkcoin Pool', algorithm: 'Scrypt', rewardPerBlock: 100, blockTime: 60, poolFee: 0.01 },
  'LKY': { name: 'Luckycoin Pool', algorithm: 'Scrypt', rewardPerBlock: 88, blockTime: 60, poolFee: 0.01 },
  'DINGO': { name: 'Dingocoin Pool', algorithm: 'Scrypt', rewardPerBlock: 500, blockTime: 60, poolFee: 0.01 },
  'SHIC': { name: 'Shincoin Pool', algorithm: 'Scrypt', rewardPerBlock: 25, blockTime: 60, poolFee: 0.01 }
}

/**
 * Initialize mining pools if they don't exist
 */
async function initializeMiningPools() {
  try {
    for (const [coinSymbol, config] of Object.entries(MINING_POOL_CONFIGS)) {
      const existingPool = await dbManager.getMiningPoolByCoin(coinSymbol)
      if (!existingPool) {
        await dbManager.createMiningPool({
          coinSymbol,
          name: config.name,
          algorithm: config.algorithm,
          difficulty: 1.0,
          hashRate: 0,
          totalMiners: 0,
          rewardPerBlock: config.rewardPerBlock,
          blockTime: config.blockTime,
          poolFee: config.poolFee,
          isActive: true
        })
      }
    }
  } catch (error) {
    console.error('Failed to initialize mining pools:', error)
  }
}

// Initialize pools when first accessed
let poolsInitialized = false;

async function ensurePoolsInitialized() {
  if (!poolsInitialized) {
    try {
      await miningService.initializeMiningPools();
      poolsInitialized = true;
      console.log('Mining pools initialized successfully');
    } catch (error) {
      console.error('Failed to initialize mining pools:', error);
      throw error;
    }
  }
}

/**
 * Get mining overview data
 * GET /api/mining/overview
 */
router.get('/overview', authenticateToken, async (req, res) => {
  try {
    await ensurePoolsInitialized();
    
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    const overview = await miningService.getUserMiningOverview(userId)

    res.json({
      success: true,
      data: overview
    })
  } catch (error) {
    console.error('Error fetching mining overview:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch mining overview' })
  }
})

/**
 * Get available mining pools
 * GET /api/mining/pools
 */
router.get('/pools', async (req, res) => {
  try {
    await ensurePoolsInitialized();
    
    const pools = await dbManager.getMiningPools(true)
    
    const poolsWithStats = await Promise.all(pools.map(async (pool) => {
      const stats = await miningService.calculatePoolStats(pool.coinSymbol)
      return {
        ...pool,
        stats: stats || {
          totalHashPower: 0,
          activeMiners: 0,
          estimatedDailyReward: 0,
          difficulty: pool.difficulty,
          blockReward: pool.blockReward
        }
      }
    }))
    
    res.json({
      success: true,
      data: poolsWithStats
    })
  } catch (error) {
    console.error('Error fetching mining pools:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch mining pools' })
  }
})

// Get specific mining pool details
router.get('/pools/:coinSymbol', async (req, res) => {
  try {
    await ensurePoolsInitialized();
    
    const { coinSymbol } = req.params
    
    if (!MINING_COINS.includes(coinSymbol.toUpperCase())) {
      return res.status(400).json({ success: false, error: 'Invalid coin symbol' })
    }

    const pool = await dbManager.getMiningPoolByCoin(coinSymbol.toUpperCase())
    if (!pool) {
      return res.status(404).json({ success: false, error: 'Mining pool not found' })
    }

    const stats = await miningService.calculatePoolStats(coinSymbol.toUpperCase())

    res.json({
      success: true,
      data: {
        ...pool,
        stats: stats || {
          totalHashPower: 0,
          activeMiners: 0,
          estimatedDailyReward: 0,
          difficulty: pool.difficulty,
          blockReward: pool.blockReward
        }
      }
    })
  } catch (error) {
    console.error('Error fetching mining pool details:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch mining pool details' })
  }
})

/**
 * Start mining for a specific coin
 * POST /api/mining/start
 */
router.post('/start', authenticateToken, validateWalletInput, async (req, res) => {
  try {
    await ensurePoolsInitialized();
    
    const userId = req.user?.id
    const { coinSymbol, hashPower } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    if (!MINING_COINS.includes(coinSymbol)) {
      return res.status(400).json({ success: false, error: 'Invalid coin symbol' })
    }

    if (!hashPower || hashPower <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid hash power' })
    }

    const session = await miningService.startMining(userId, coinSymbol, hashPower)

    res.json({
      success: true,
      data: session
    })
  } catch (error) {
    console.error('Error starting mining:', error)
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message })
    } else {
      res.status(500).json({ success: false, error: 'Failed to start mining' })
    }
  }
})

/**
 * Stop mining for a specific coin
 * POST /api/mining/stop
 */
router.post('/stop', authenticateToken, validateWalletInput, async (req, res) => {
  try {
    await ensurePoolsInitialized();
    
    const userId = req.user?.id
    const { coinSymbol } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    if (!MINING_COINS.includes(coinSymbol)) {
      return res.status(400).json({ success: false, error: 'Invalid coin symbol' })
    }

    const session = await miningService.stopMining(userId, coinSymbol)

    res.json({
      success: true,
      data: session
    })
  } catch (error) {
    console.error('Error stopping mining:', error)
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message })
    } else {
      res.status(500).json({ success: false, error: 'Failed to stop mining' })
    }
  }
})

/**
 * Get user's mining sessions
 * GET /api/mining/sessions
 */
router.get('/sessions', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    const sessions = await dbManager.getMiningSessionsByUser(userId)

    res.json({
      success: true,
      data: sessions
    })
  } catch (error) {
    console.error('Error fetching mining sessions:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch mining sessions' })
  }
})

/**
 * Get user's mining earnings
 * GET /api/mining/earnings
 */
router.get('/earnings', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    const { coinSymbol, limit } = req.query
    const earnings = await dbManager.getMiningEarningsByUser(userId, coinSymbol as string, limit ? parseInt(limit as string) : undefined)

    res.json({
      success: true,
      data: earnings
    })
  } catch (error) {
    console.error('Error fetching mining earnings:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch mining earnings' })
  }
})

// Get mining statistics
router.get('/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    const overview = await miningService.getUserMiningOverview(userId)

    res.json({
      success: true,
      data: overview
    })
  } catch (error) {
    console.error('Error fetching mining stats:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch mining statistics' })
  }
})

/**
 * Request mining withdrawal
 * POST /api/mining/withdraw
 */
router.post('/withdraw', authenticateToken, validateWalletInput, walletRateLimit(5, 300000), async (req, res) => {
  try {
    const userId = req.user?.id
    const { coinSymbol, amount } = req.body

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    if (!MINING_COINS.includes(coinSymbol)) {
      return res.status(400).json({ success: false, error: 'Invalid coin symbol' })
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, error: 'Invalid amount' })
    }

    // Check user's mining balance
    const balance = await miningService.getUserMiningBalance(userId, coinSymbol)
    if (balance < amount) {
      return res.status(400).json({ success: false, error: 'Insufficient mining balance' })
    }

    const success = await miningService.processWithdrawal(userId, coinSymbol, amount)
    
    if (success) {
      res.json({
        success: true,
        message: 'Withdrawal processed successfully'
      })
    } else {
      res.status(500).json({ success: false, error: 'Failed to process withdrawal' })
    }
  } catch (error) {
    console.error('Error processing withdrawal:', error)
    if (error instanceof Error) {
      res.status(400).json({ success: false, error: error.message })
    } else {
      res.status(500).json({ success: false, error: 'Failed to process withdrawal' })
    }
  }
})

// Get user's withdrawal history
router.get('/withdrawals', authenticateToken, async (req, res) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated' })
    }

    const withdrawals = await dbManager.getMiningWithdrawalsByUser(userId)

    res.json({
      success: true,
      data: withdrawals
    })
  } catch (error) {
    console.error('Error fetching withdrawal history:', error)
    res.status(500).json({ success: false, error: 'Failed to fetch withdrawal history' })
  }
})



export default router