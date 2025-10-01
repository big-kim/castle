/**
 * P2P Trading API routes
 * Handle P2P order creation, retrieval, updates, and transactions
 */
import { Router, type Request, type Response } from 'express'
import { dbManager } from '../database'
import { authenticateToken } from '../middleware/auth'
import { orderMatchingService } from '../services/orderMatching.js'

const router = Router()

/**
 * Get all P2P orders with optional filters
 * GET /api/p2p/orders
 */
router.get('/orders', async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      type,
      status = 'active',
      tokenSymbol,
      limit = 50,
      offset = 0
    } = req.query

    const filters = {
      type: type as 'buy' | 'sell' | undefined,
      status: status as string,
      tokenSymbol: tokenSymbol as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    }

    const orders = await dbManager.getP2POrders(filters)

    // Enrich orders with user ratings
    const enrichedOrders = await Promise.all(
      orders.map(async (order) => {
        const userRating = await dbManager.getUserAverageRating(order.userId)
        return {
          ...order,
          userRating: userRating || 0
        }
      })
    )

    res.json({
      success: true,
      data: enrichedOrders
    })
  } catch (error) {
    console.error('Get P2P orders error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching P2P orders'
    })
  }
})

/**
 * Get user's own P2P orders
 * GET /api/p2p/orders/my
 */
router.get('/orders/my', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { status, limit = 50, offset = 0 } = req.query

    const filters = {
      userId,
      status: status as string | undefined,
      limit: parseInt(limit as string),
      offset: parseInt(offset as string)
    }

    const orders = await dbManager.getP2POrders(filters)

    res.json({
      success: true,
      data: orders
    })
  } catch (error) {
    console.error('Get user P2P orders error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user P2P orders'
    })
  }
})

/**
 * Get specific P2P order by ID
 * GET /api/p2p/orders/:id
 */
router.get('/orders/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id)

    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      })
      return
    }

    const order = await dbManager.getP2POrderById(orderId)

    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      })
      return
    }

    // Enrich with user rating
    const userRating = await dbManager.getUserAverageRating(order.userId)
    const enrichedOrder = {
      ...order,
      userRating: userRating || 0
    }

    res.json({
      success: true,
      data: enrichedOrder
    })
  } catch (error) {
    console.error('Get P2P order error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching P2P order'
    })
  }
})

/**
 * Create new P2P order
 * POST /api/p2p/orders
 */
router.post('/orders', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const user = await dbManager.findUserById(userId)

    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      })
      return
    }

    const {
      productType,
      tokenSymbol,
      paymentTokenSymbol,
      amount,
      price,
      paymentMethod,
      type,
      tradeMethod = 'normal',
      productDetails
    } = req.body

    // Validate required fields
    if (!productType || !tokenSymbol || !paymentTokenSymbol || !amount || !price || !paymentMethod || !type) {
      res.status(400).json({
        success: false,
        message: 'Missing required fields'
      })
      return
    }

    // Calculate derived values
    const pricePerToken = price / amount
    const totalValue = price

    // Get user's current rating
    const userRating = await dbManager.getUserAverageRating(userId)

    const orderData = {
      userId,
      userName: user.name,
      userRating: userRating || 0,
      productType,
      tokenSymbol,
      paymentTokenSymbol,
      amount: parseFloat(amount),
      price: parseFloat(price),
      pricePerToken,
      totalValue,
      paymentMethod,
      type,
      status: 'active' as const,
      tradeMethod,
      productDetails: productDetails ? JSON.stringify(productDetails) : undefined
    }

    const newOrder = await dbManager.createP2POrder(orderData)

    // Try to auto-match the order
    const matchResult = await orderMatchingService.autoMatchOrder(newOrder.id)
    
    res.status(201).json({
      success: true,
      message: 'P2P order created successfully',
      data: newOrder,
      autoMatch: {
        executedTrades: matchResult.executedTrades,
        message: matchResult.message
      }
    })
  } catch (error) {
    console.error('Create P2P order error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating P2P order'
    })
  }
})

/**
 * Update P2P order
 * PUT /api/p2p/orders/:id
 */
router.put('/orders/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id)
    const userId = req.user!.id

    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      })
      return
    }

    // Check if order exists and belongs to user
    const existingOrder = await dbManager.getP2POrderById(orderId)
    if (!existingOrder) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      })
      return
    }

    if (existingOrder.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only update your own orders'
      })
      return
    }

    const {
      amount,
      price,
      paymentMethod,
      status,
      smartContractStatus,
      contractAddress,
      transactionHash,
      escrowTimeout,
      productDetails
    } = req.body

    const updates: any = {}

    if (amount !== undefined) {
      updates.amount = parseFloat(amount)
      if (price !== undefined) {
        updates.price = parseFloat(price)
        updates.pricePerToken = parseFloat(price) / parseFloat(amount)
        updates.totalValue = parseFloat(price)
      }
    }

    if (price !== undefined && amount === undefined) {
      updates.price = parseFloat(price)
      updates.pricePerToken = parseFloat(price) / existingOrder.amount
      updates.totalValue = parseFloat(price)
    }

    if (paymentMethod) updates.paymentMethod = paymentMethod
    if (status) updates.status = status
    if (smartContractStatus) updates.smartContractStatus = smartContractStatus
    if (contractAddress) updates.contractAddress = contractAddress
    if (transactionHash) updates.transactionHash = transactionHash
    if (escrowTimeout) updates.escrowTimeout = escrowTimeout
    if (productDetails) updates.productDetails = JSON.stringify(productDetails)

    const updatedOrder = await dbManager.updateP2POrder(orderId, updates)

    if (!updatedOrder) {
      res.status(500).json({
        success: false,
        message: 'Failed to update order'
      })
      return
    }

    res.json({
      success: true,
      message: 'P2P order updated successfully',
      data: updatedOrder
    })
  } catch (error) {
    console.error('Update P2P order error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating P2P order'
    })
  }
})

/**
 * Delete P2P order
 * DELETE /api/p2p/orders/:id
 */
router.delete('/orders/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const orderId = parseInt(req.params.id)
    const userId = req.user!.id

    if (isNaN(orderId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid order ID'
      })
      return
    }

    // Check if order exists and belongs to user
    const existingOrder = await dbManager.getP2POrderById(orderId)
    if (!existingOrder) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      })
      return
    }

    if (existingOrder.userId !== userId) {
      res.status(403).json({
        success: false,
        message: 'You can only delete your own orders'
      })
      return
    }

    const deleted = await dbManager.deleteP2POrder(orderId)

    if (!deleted) {
      res.status(500).json({
        success: false,
        message: 'Failed to delete order'
      })
      return
    }

    res.json({
      success: true,
      message: 'P2P order deleted successfully'
    })
  } catch (error) {
    console.error('Delete P2P order error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error while deleting P2P order'
    })
  }
})

/**
 * Get user's P2P transactions
 * GET /api/p2p/transactions
 */
router.get('/transactions', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const transactions = await dbManager.getP2PTransactionsByUser(userId)

    res.json({
      success: true,
      data: transactions
    })
  } catch (error) {
    console.error('Get P2P transactions error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching P2P transactions'
    })
  }
})

/**
 * Create P2P transaction (initiate trade)
 * POST /api/p2p/transactions
 */
router.post('/transactions', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { orderId, amount, price } = req.body

    if (!orderId || !amount || !price) {
      res.status(400).json({
        success: false,
        message: 'Order ID, amount, and price are required'
      })
      return
    }

    // Check if order exists and is active
    const order = await dbManager.getP2POrderById(orderId)
    if (!order) {
      res.status(404).json({
        success: false,
        message: 'Order not found'
      })
      return
    }

    if (order.status !== 'active') {
      res.status(400).json({
        success: false,
        message: 'Order is not active'
      })
      return
    }

    if (order.userId === userId) {
      res.status(400).json({
        success: false,
        message: 'You cannot trade with your own order'
      })
      return
    }

    // Determine buyer and seller based on order type
    const buyerId = order.type === 'sell' ? userId : order.userId
    const sellerId = order.type === 'sell' ? order.userId : userId

    const transactionData = {
      orderId,
      buyerId,
      sellerId,
      amount: parseFloat(amount),
      price: parseFloat(price),
      status: 'pending' as const
    }

    const newTransaction = await dbManager.createP2PTransaction(transactionData)

    res.status(201).json({
      success: true,
      message: 'P2P transaction initiated successfully',
      data: newTransaction
    })
  } catch (error) {
    console.error('Create P2P transaction error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating P2P transaction'
    })
  }
})

/**
 * Update P2P transaction status
 * PUT /api/p2p/transactions/:id
 */
router.put('/transactions/:id', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const transactionId = parseInt(req.params.id)
    const userId = req.user!.id
    const { status, completedAt } = req.body

    if (isNaN(transactionId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid transaction ID'
      })
      return
    }

    // Get transaction and verify user is involved
    const transactions = await dbManager.getP2PTransactionsByUser(userId)
    const transaction = transactions.find(t => t.id === transactionId)

    if (!transaction) {
      res.status(404).json({
        success: false,
        message: 'Transaction not found or you are not authorized to update it'
      })
      return
    }

    const updates: any = {}
    if (status) updates.status = status
    if (completedAt) updates.completedAt = completedAt

    const updatedTransaction = await dbManager.updateP2PTransaction(transactionId, updates)

    if (!updatedTransaction) {
      res.status(500).json({
        success: false,
        message: 'Failed to update transaction'
      })
      return
    }

    res.json({
      success: true,
      message: 'P2P transaction updated successfully',
      data: updatedTransaction
    })
  } catch (error) {
    console.error('Update P2P transaction error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error while updating P2P transaction'
    })
  }
})

/**
 * Create user rating
 * POST /api/p2p/ratings
 */
router.post('/ratings', authenticateToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const ratedByUserId = req.user!.id
    const { userId, orderId, rating, comment } = req.body

    if (!userId || !orderId || !rating) {
      res.status(400).json({
        success: false,
        message: 'User ID, order ID, and rating are required'
      })
      return
    }

    if (rating < 1 || rating > 5) {
      res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      })
      return
    }

    if (userId === ratedByUserId) {
      res.status(400).json({
        success: false,
        message: 'You cannot rate yourself'
      })
      return
    }

    const ratingData = {
      userId,
      ratedByUserId,
      orderId,
      rating,
      comment
    }

    const newRating = await dbManager.createUserRating(ratingData)

    res.status(201).json({
      success: true,
      message: 'User rating created successfully',
      data: newRating
    })
  } catch (error) {
    console.error('Create user rating error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error while creating user rating'
    })
  }
})

/**
 * Get user ratings
 * GET /api/p2p/ratings/:userId
 */
router.get('/ratings/:userId', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = parseInt(req.params.userId)

    if (isNaN(userId)) {
      res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      })
      return
    }

    const ratings = await dbManager.getUserRatings(userId)
    const averageRating = await dbManager.getUserAverageRating(userId)

    res.json({
      success: true,
      data: {
        ratings,
        averageRating: averageRating || 0,
        totalRatings: ratings.length
      }
    })
  } catch (error) {
    console.error('Get user ratings error:', error)
    res.status(500).json({
      success: false,
      message: 'Internal server error while fetching user ratings'
    })
  }
})

// Get order book for a specific token
router.get('/orderbook/:tokenSymbol', async (req: Request, res: Response) => {
  try {
    const { tokenSymbol } = req.params
    const orderBook = await orderMatchingService.getOrderBook(tokenSymbol)
    
    res.json({
      success: true,
      data: orderBook
    })
  } catch (error) {
    console.error('Error fetching order book:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch order book'
    })
  }
})

// Find compatible matches for an order
router.get('/orders/:orderId/matches', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params
    const order = await dbManager.getP2POrderById(parseInt(orderId))
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      })
    }

    const matches = await orderMatchingService.findCompatibleMatches(order)
    
    res.json({
      success: true,
      data: matches
    })
  } catch (error) {
    console.error('Error finding matches:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to find matches'
    })
  }
})

// Execute a trade between two orders
router.post('/orders/:orderId/execute', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params
    const { matchOrderId, amount } = req.body
    const userId = req.user?.id

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      })
    }

    if (!matchOrderId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Match order ID and amount are required'
      })
    }

    const buyOrder = await dbManager.getP2POrderById(parseInt(orderId))
    const sellOrder = await dbManager.getP2POrderById(parseInt(matchOrderId))

    if (!buyOrder || !sellOrder) {
      return res.status(404).json({
        success: false,
        message: 'One or both orders not found'
      })
    }

    // Verify user is involved in the trade
    if (buyOrder.userId !== userId && sellOrder.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to execute this trade'
      })
    }

    const result = await orderMatchingService.executeTrade(buyOrder, sellOrder, parseFloat(amount))
    
    res.json({
      success: true,
      message: 'Trade executed successfully',
      data: result
    })
  } catch (error) {
    console.error('Error executing trade:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to execute trade'
    })
  }
})

export default router