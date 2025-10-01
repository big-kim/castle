/**
 * P2P Order Matching Service
 * Handles automatic order matching and trade execution
 */
import { dbManager, type P2POrder } from '../database.js'

export interface MatchResult {
  success: boolean
  matches: OrderMatch[]
  message?: string
}

export interface OrderMatch {
  buyOrder: P2POrder
  sellOrder: P2POrder
  matchedAmount: number
  matchedPrice: number
  totalValue: number
}

export class OrderMatchingService {
  /**
   * Find potential matches for a given order
   */
  async findMatches(orderId: number): Promise<MatchResult> {
    try {
      const order = await dbManager.getP2POrderById(orderId)
      if (!order) {
        return {
          success: false,
          matches: [],
          message: 'Order not found'
        }
      }

      if (order.status !== 'active') {
        return {
          success: false,
          matches: [],
          message: 'Order is not active'
        }
      }

      // Find opposite type orders for the same token
      const oppositeType = order.type === 'buy' ? 'sell' : 'buy'
      const potentialMatches = await dbManager.getP2POrders({
        type: oppositeType,
        status: 'active',
        tokenSymbol: order.tokenSymbol
      })

      // Filter out orders from the same user
      const validMatches = potentialMatches.filter(match => match.userId !== order.userId)

      // Find compatible matches based on price and payment method
      const compatibleMatches = this.findCompatibleMatches(order, validMatches)

      return {
        success: true,
        matches: compatibleMatches
      }
    } catch (error) {
      console.error('Error finding matches:', error)
      return {
        success: false,
        matches: [],
        message: 'Error occurred while finding matches'
      }
    }
  }

  /**
   * Find compatible matches based on price and payment method
   */
  private findCompatibleMatches(order: P2POrder, potentialMatches: P2POrder[]): OrderMatch[] {
    const matches: OrderMatch[] = []

    for (const match of potentialMatches) {
      // Check if payment methods are compatible
      if (!this.arePaymentMethodsCompatible(order.paymentMethod, match.paymentMethod)) {
        continue
      }

      // Check price compatibility
      const priceMatch = this.checkPriceCompatibility(order, match)
      if (!priceMatch.compatible) {
        continue
      }

      // Calculate matched amount (minimum of both orders)
      const matchedAmount = Math.min(order.amount, match.amount)
      const matchedPrice = priceMatch.price
      const totalValue = matchedAmount * matchedPrice

      const orderMatch: OrderMatch = {
        buyOrder: order.type === 'buy' ? order : match,
        sellOrder: order.type === 'sell' ? order : match,
        matchedAmount,
        matchedPrice,
        totalValue
      }

      matches.push(orderMatch)
    }

    // Sort matches by best price (for buyer: lowest price, for seller: highest price)
    matches.sort((a, b) => {
      if (order.type === 'buy') {
        return a.matchedPrice - b.matchedPrice // Buyer wants lowest price
      } else {
        return b.matchedPrice - a.matchedPrice // Seller wants highest price
      }
    })

    return matches
  }

  /**
   * Check if two payment methods are compatible
   */
  private arePaymentMethodsCompatible(method1: string, method2: string): boolean {
    // For now, we'll consider all payment methods compatible
    // In a real implementation, you might have specific compatibility rules
    return true
  }

  /**
   * Check price compatibility between two orders
   */
  private checkPriceCompatibility(order1: P2POrder, order2: P2POrder): { compatible: boolean; price: number } {
    // If order1 is buy and order2 is sell
    if (order1.type === 'buy' && order2.type === 'sell') {
      // Buy order price should be >= sell order price
      if (order1.pricePerToken >= order2.pricePerToken) {
        // Use the sell order price (seller gets their asking price)
        return { compatible: true, price: order2.pricePerToken }
      }
    }
    
    // If order1 is sell and order2 is buy
    if (order1.type === 'sell' && order2.type === 'buy') {
      // Buy order price should be >= sell order price
      if (order2.pricePerToken >= order1.pricePerToken) {
        // Use the sell order price (seller gets their asking price)
        return { compatible: true, price: order1.pricePerToken }
      }
    }

    return { compatible: false, price: 0 }
  }

  /**
   * Execute a trade between two matched orders
   */
  async executeTrade(match: OrderMatch): Promise<{ success: boolean; transactionId?: number; message?: string }> {
    try {
      // Create a P2P transaction
      const transaction = await dbManager.createP2PTransaction({
        orderId: match.buyOrder.id,
        buyerId: match.buyOrder.userId,
        sellerId: match.sellOrder.userId,
        amount: match.matchedAmount,
        price: match.totalValue,
        status: 'pending'
      })

      // Update order amounts
      const buyOrderNewAmount = match.buyOrder.amount - match.matchedAmount
      const sellOrderNewAmount = match.sellOrder.amount - match.matchedAmount

      // Update buy order
      if (buyOrderNewAmount <= 0) {
        await dbManager.updateP2POrder(match.buyOrder.id, { status: 'completed' })
      } else {
        await dbManager.updateP2POrder(match.buyOrder.id, { 
          amount: buyOrderNewAmount,
          totalValue: buyOrderNewAmount * match.buyOrder.pricePerToken
        })
      }

      // Update sell order
      if (sellOrderNewAmount <= 0) {
        await dbManager.updateP2POrder(match.sellOrder.id, { status: 'completed' })
      } else {
        await dbManager.updateP2POrder(match.sellOrder.id, { 
          amount: sellOrderNewAmount,
          totalValue: sellOrderNewAmount * match.sellOrder.pricePerToken
        })
      }

      return {
        success: true,
        transactionId: transaction.id,
        message: 'Trade executed successfully'
      }
    } catch (error) {
      console.error('Error executing trade:', error)
      return {
        success: false,
        message: 'Error occurred while executing trade'
      }
    }
  }

  /**
   * Auto-match orders when a new order is created
   */
  async autoMatchOrder(orderId: number): Promise<{ success: boolean; executedTrades: number; message?: string }> {
    try {
      const matchResult = await this.findMatches(orderId)
      
      if (!matchResult.success || matchResult.matches.length === 0) {
        return {
          success: true,
          executedTrades: 0,
          message: 'No matches found'
        }
      }

      let executedTrades = 0
      const order = await dbManager.getP2POrderById(orderId)
      
      if (!order) {
        return {
          success: false,
          executedTrades: 0,
          message: 'Order not found'
        }
      }

      let remainingAmount = order.amount

      // Execute trades with best matches until order is fully filled
      for (const match of matchResult.matches) {
        if (remainingAmount <= 0) break

        // Adjust match amount based on remaining amount
        const adjustedMatch: OrderMatch = {
          ...match,
          matchedAmount: Math.min(match.matchedAmount, remainingAmount),
          totalValue: Math.min(match.matchedAmount, remainingAmount) * match.matchedPrice
        }

        const tradeResult = await this.executeTrade(adjustedMatch)
        
        if (tradeResult.success) {
          executedTrades++
          remainingAmount -= adjustedMatch.matchedAmount
        }
      }

      return {
        success: true,
        executedTrades,
        message: `Executed ${executedTrades} trades`
      }
    } catch (error) {
      console.error('Error in auto-matching:', error)
      return {
        success: false,
        executedTrades: 0,
        message: 'Error occurred during auto-matching'
      }
    }
  }

  /**
   * Get order book for a specific token
   */
  async getOrderBook(tokenSymbol: string): Promise<{
    buyOrders: P2POrder[]
    sellOrders: P2POrder[]
  }> {
    try {
      const [buyOrders, sellOrders] = await Promise.all([
        dbManager.getP2POrders({
          type: 'buy',
          status: 'active',
          tokenSymbol,
          limit: 50
        }),
        dbManager.getP2POrders({
          type: 'sell',
          status: 'active',
          tokenSymbol,
          limit: 50
        })
      ])

      // Sort buy orders by price (highest first)
      buyOrders.sort((a, b) => b.pricePerToken - a.pricePerToken)
      
      // Sort sell orders by price (lowest first)
      sellOrders.sort((a, b) => a.pricePerToken - b.pricePerToken)

      return {
        buyOrders,
        sellOrders
      }
    } catch (error) {
      console.error('Error getting order book:', error)
      return {
        buyOrders: [],
        sellOrders: []
      }
    }
  }
}

export const orderMatchingService = new OrderMatchingService()
export default orderMatchingService