/**
 * Wallet API routes
 * Handle BNB wallet, point wallet, NFT wallet operations
 */
import express, { Request, Response } from 'express'
import { requireAuth, walletRateLimit, validateWalletInput, securityHeaders, AuthenticatedRequest } from '../middleware/auth'
import { dbManager } from '../database'
import QRCode from 'qrcode'
import crypto from 'crypto'

const router = express.Router()


// Apply security headers to all wallet routes
router.use(securityHeaders)

// Apply authentication to all wallet routes
router.use(requireAuth)

// Supported mining coins
const MINING_COINS = ['LTC', 'DOGE', 'BELLS', 'PEP', 'JKC', 'LKY', 'DINGO', 'SHIC']

/**
 * Get wallet overview
 * GET /api/wallet/overview
 */
router.get('/overview', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id
    
    // Get BNB wallet
    let bnbWallet = await dbManager.getBNBWallet(userId)
    if (!bnbWallet) {
      // Create BNB wallet if doesn't exist
      const address = `0x${Math.random().toString(16).substr(2, 40)}` // Generate mock address
      bnbWallet = await dbManager.createBNBWallet(userId, address)
    }
    
    // Get point wallets
    const pointWallets = await dbManager.getPointWallets(userId)
    
    // Create missing point wallets for mining coins
    for (const coin of MINING_COINS) {
      const exists = pointWallets.find(w => w.coinSymbol === coin)
      if (!exists) {
        const newWallet = await dbManager.createPointWallet(userId, coin)
        pointWallets.push(newWallet)
      }
    }
    
    // Get NFTs
    const nfts = await dbManager.getNFTs(userId)
    
    // Calculate total values (mock prices for now)
    const bnbPrice = 300 // Mock BNB price
    const pointPrices = {
      'LTC': 0.5, 'DOGE': 0.08, 'BELLS': 0.05, 'BCH': 0.3,
      'ZEC': 0.4, 'DASH': 0.25, 'DGB': 0.02, 'RVN': 0.01
    }
    
    const bnbValue = bnbWallet.balance * bnbPrice
    const pointValues = pointWallets.map(wallet => ({
      symbol: wallet.coinSymbol,
      balance: wallet.balance,
      value: wallet.balance * (pointPrices[wallet.coinSymbol] || 0)
    }))
    const nftTotalValue = nfts.reduce((sum, nft) => sum + nft.currentValue, 0)
    
    const totalValue = bnbValue + pointValues.reduce((sum, p) => sum + p.value, 0) + nftTotalValue
    
    const walletOverview = {
      totalValue,
      bnbWallet: {
        balance: bnbWallet.balance,
        value: bnbValue,
        address: bnbWallet.address
      },
      pointWallets: pointValues,
      nftWallet: {
        count: nfts.length,
        totalValue: nftTotalValue
      }
    }
    
    res.json(walletOverview)
  } catch (error) {
    console.error('Wallet overview error:', error)
    res.status(500).json({ error: 'Failed to get wallet overview' })
  }
})

/**
 * BNB Wallet Operations
 */

/**
 * Get BNB wallet details
 * GET /api/wallet/bnb
 */
router.get('/bnb', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    let bnbWallet = await dbManager.getBNBWallet(userId);
    if (!bnbWallet) {
      const address = `0x${Math.random().toString(16).substr(2, 40)}`;
      bnbWallet = await dbManager.createBNBWallet(userId, address);
    }
    
    const transactions = await dbManager.getBNBTransactions(userId, 20);
    const bnbPrice = 300; // Mock BNB price
    
    const walletData = {
      address: bnbWallet.address,
      balance: bnbWallet.balance,
      value: bnbWallet.balance * bnbPrice,
      transactions: transactions.map(tx => ({
        id: tx.id.toString(),
        type: tx.type,
        amount: tx.amount,
        toAddress: tx.toAddress,
        fromAddress: tx.fromAddress,
        memo: tx.memo,
        timestamp: tx.createdAt,
        status: tx.status,
        txHash: tx.txHash
      }))
    };
    
    res.json(walletData);
  } catch (error) {
    console.error('BNB wallet error:', error);
    res.status(500).json({ error: 'Failed to get BNB wallet' });
  }
})

/**
 * Send BNB
 * POST /api/wallet/bnb/send
 */
router.post('/bnb/send', walletRateLimit(5, 60000), validateWalletInput, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { toAddress, amount, memo } = req.body;
    
    if (!toAddress || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const bnbWallet = await dbManager.getBNBWallet(userId);
    if (!bnbWallet) {
      return res.status(404).json({ error: 'BNB wallet not found' });
    }
    
    const sendAmount = parseFloat(amount);
    if (bnbWallet.balance < sendAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Create transaction record
    const transaction = await dbManager.createBNBTransaction({
      userId,
      type: 'send',
      amount: sendAmount,
      toAddress,
      memo,
      status: 'pending',
      txHash: `0x${Math.random().toString(16).substr(2, 64)}` // Mock transaction hash
    });
    
    // Update balance (in real implementation, this would happen after network confirmation)
    await dbManager.updateBNBBalance(userId, bnbWallet.balance - sendAmount);
    
    // Simulate network processing
    setTimeout(async () => {
      try {
        await dbManager.createBNBTransaction({
          ...transaction,
          status: 'completed'
        });
      } catch (error) {
        console.error('Failed to update transaction status:', error);
      }
    }, 5000);
    
    res.json({ 
      success: true, 
      transaction: {
        id: transaction.id.toString(),
        type: transaction.type,
        amount: transaction.amount,
        toAddress: transaction.toAddress,
        memo: transaction.memo,
        status: transaction.status,
        txHash: transaction.txHash,
        timestamp: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('BNB send error:', error);
    res.status(500).json({ error: 'Failed to send BNB' });
  }
})

/**
 * Get BNB transaction history
 * GET /api/wallet/bnb/transactions
 */
router.get('/bnb/transactions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { page = 1, limit = 20 } = req.query
    
    const transactions = await dbManager.getBNBTransactions(userId, Number(limit))
    
    res.json({
      success: true,
      data: transactions
    })
  } catch (error) {
    console.error('BNB transactions error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch BNB transactions'
    })
  }
})

/**
 * Point Wallet Operations (Mining Coins)
 */

/**
 * Get point wallets (8 mining coins)
 * GET /api/wallet/points
 */
router.get('/points', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    let pointWallets = await dbManager.getPointWallets(userId);
    
    // Create missing point wallets for mining coins
    for (const coin of MINING_COINS) {
      const exists = pointWallets.find(w => w.coinSymbol === coin);
      if (!exists) {
        const newWallet = await dbManager.createPointWallet(userId, coin);
        pointWallets.push(newWallet);
      }
    }
    
    // Mock prices for point calculation (USD per coin)
    const pointPrices = {
      'LTC': 92.35, 'DOGE': 0.0825, 'BELLS': 0.0012, 'PEP': 0.0008,
      'JKC': 0.0005, 'LKY': 0.0015, 'DINGO': 0.0003, 'SHIC': 0.0002
    };
    
    const walletsWithValue = pointWallets.map(wallet => ({
      symbol: wallet.coinSymbol,
      balance: wallet.balance,
      totalEarned: wallet.totalEarned,
      value: wallet.balance * (pointPrices[wallet.coinSymbol] || 0)
    }));
    
    res.json({ pointWallets: walletsWithValue });
  } catch (error) {
    console.error('Point wallets error:', error);
    res.status(500).json({ error: 'Failed to get point wallets' });
  }
})

/**
 * Add mining earnings
 * POST /api/wallet/points/earn
 */
router.post('/points/earn', walletRateLimit(10, 60000), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { coinSymbol, amount } = req.body;
    
    if (!coinSymbol || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!MINING_COINS.includes(coinSymbol)) {
      return res.status(400).json({ error: 'Unsupported coin type' });
    }
    
    const earnAmount = parseFloat(amount);
    if (earnAmount <= 0) {
      return res.status(400).json({ error: 'Invalid amount' });
    }
    
    // Add mining earnings
    await dbManager.addMiningEarnings(userId, coinSymbol, earnAmount);
    
    // Get updated wallet
    const updatedWallet = await dbManager.getPointWallet(userId, coinSymbol);
    
    res.json({ 
      success: true, 
      wallet: {
        symbol: updatedWallet.coinSymbol,
        balance: updatedWallet.balance,
        totalEarned: updatedWallet.totalEarned,
        earnedAmount: earnAmount
      }
    });
  } catch (error) {
    console.error('Mining earnings error:', error);
    res.status(500).json({ error: 'Failed to add mining earnings' });
  }
})

/**
 * Withdraw mining coins
 * POST /api/wallet/points/withdraw
 */
router.post('/points/withdraw', walletRateLimit(3, 60000), validateWalletInput, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { coinSymbol, amount, toAddress } = req.body;
    
    if (!coinSymbol || !amount || !toAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const pointWallet = await dbManager.getPointWallet(userId, coinSymbol);
    if (!pointWallet) {
      return res.status(404).json({ error: 'Point wallet not found' });
    }
    
    const withdrawAmount = parseFloat(amount);
    if (pointWallet.balance < withdrawAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Create transaction record
    const transaction = await dbManager.createPointTransaction({
      userId,
      coinSymbol,
      type: 'withdraw',
      amount: withdrawAmount,
      toAddress,
      status: 'pending'
    });
    
    // Update balance
    await dbManager.updatePointBalance(userId, coinSymbol, pointWallet.balance - withdrawAmount);
    
    // Simulate network processing
    setTimeout(async () => {
      try {
        await dbManager.createPointTransaction({
          ...transaction,
          status: 'completed'
        });
      } catch (error) {
        console.error('Failed to update transaction status:', error);
      }
    }, 3000);
    
    res.json({ 
      success: true, 
      transaction: {
        id: transaction.id.toString(),
        coinSymbol: transaction.coinSymbol,
        type: transaction.type,
        amount: transaction.amount,
        toAddress: transaction.toAddress,
        status: transaction.status,
        timestamp: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('Point withdrawal error:', error);
    res.status(500).json({ error: 'Failed to withdraw points' });
  }
})

/**
 * Get point transaction history
 * GET /api/wallet/points/transactions
 */
router.get('/points/transactions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { coinSymbol, limit } = req.query;
    
    const transactions = await dbManager.getPointTransactions(
      userId, 
      coinSymbol as string, 
      limit ? parseInt(limit as string) : 50
    );
    
    res.json({ transactions });
  } catch (error) {
    console.error('Point transactions error:', error);
    res.status(500).json({ error: 'Failed to get point transactions' });
  }
})

/**
 * NFT Wallet Operations
 */

/**
 * Get NFT wallet items
 * GET /api/wallet/nft
 */
router.get('/nft', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    const nfts = await dbManager.getNFTs(userId);
    
    // If no NFTs exist, create some sample gift card NFTs
    if (nfts.length === 0) {
      const sampleNFTs = [
        {
          userId,
          tokenId: `token_${Date.now()}_1`,
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
          name: 'Starbucks Gift Card',
          description: '$50 Starbucks Gift Certificate',
          imageUrl: '/images/starbucks-nft.png',
          currentValue: 50.00
        },
        {
          userId,
          tokenId: `token_${Date.now()}_2`,
          contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
          name: 'Amazon Gift Card',
          description: '$100 Amazon Gift Certificate',
          imageUrl: '/images/amazon-nft.png',
          currentValue: 100.00
        }
      ];
      
      for (const nftData of sampleNFTs) {
        await dbManager.createNFT(nftData);
      }
      
      const updatedNFTs = await dbManager.getNFTs(userId);
      return res.json({ nfts: updatedNFTs });
    }
    
    res.json({ nfts });
  } catch (error) {
    console.error('NFT wallet error:', error);
    res.status(500).json({ error: 'Failed to get NFT wallet' });
  }
})

/**
 * Send NFT
 * POST /api/wallet/nft/send
 */
router.post('/nft/send', walletRateLimit(2, 60000), validateWalletInput, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { nftId, toAddress, memo } = req.body;
    
    if (!nftId || !toAddress) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const nft = await dbManager.getNFTById(parseInt(nftId));
    if (!nft || nft.userId !== userId) {
      return res.status(404).json({ error: 'NFT not found or not owned by user' });
    }
    
    // Create transaction record
    const transaction = await dbManager.createNFTTransaction({
      userId,
      nftId: parseInt(nftId),
      type: 'send',
      toAddress,
      memo,
      status: 'pending'
    });
    
    // In a real implementation, the NFT would be transferred on the blockchain
    // For now, we'll simulate the transfer by removing it from the user's wallet
    setTimeout(async () => {
      try {
        await dbManager.deleteNFT(parseInt(nftId));
        await dbManager.createNFTTransaction({
          ...transaction,
          status: 'completed'
        });
      } catch (error) {
        console.error('Failed to complete NFT transfer:', error);
      }
    }, 3000);
    
    res.json({ 
      success: true, 
      transaction: {
        id: transaction.id.toString(),
        nftId: transaction.nftId,
        type: transaction.type,
        toAddress: transaction.toAddress,
        memo: transaction.memo,
        status: transaction.status,
        timestamp: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('NFT send error:', error);
    res.status(500).json({ error: 'Failed to send NFT' });
  }
})

/**
 * Buy NFT (Gift Card)
 * POST /api/wallet/nft/buy
 */
router.post('/nft/buy', walletRateLimit(5, 60000), validateWalletInput, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { nftType, value, paymentMethod } = req.body;
    
    if (!nftType || !value || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const purchaseValue = parseFloat(value);
    if (purchaseValue <= 0) {
      return res.status(400).json({ error: 'Invalid purchase value' });
    }
    
    // Check payment method balance (simplified)
    if (paymentMethod === 'bnb') {
      const bnbWallet = await dbManager.getBNBWallet(userId);
      const bnbPrice = 500; // Mock BNB price
      const requiredBNB = purchaseValue / bnbPrice;
      
      if (bnbWallet.balance < requiredBNB) {
        return res.status(400).json({ error: 'Insufficient BNB balance' });
      }
      
      // Deduct BNB
      await dbManager.updateBNBBalance(userId, bnbWallet.balance - requiredBNB);
    }
    
    // Create NFT
    const nftData = {
      userId,
      tokenId: `token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      contractAddress: '0x1234567890abcdef1234567890abcdef12345678',
      name: `${nftType} Gift Card`,
      description: `$${purchaseValue} ${nftType} Gift Certificate`,
      imageUrl: `/images/${nftType.toLowerCase()}-nft.png`,
      currentValue: purchaseValue
    };
    
    const newNFT = await dbManager.createNFT(nftData);
    
    // Create transaction record
    const transaction = await dbManager.createNFTTransaction({
      userId,
      nftId: newNFT.id,
      type: 'buy',
      memo: `Purchased ${nftType} gift card for $${purchaseValue}`,
      status: 'completed'
    });
    
    res.json({ 
      success: true, 
      nft: newNFT,
      transaction: {
        id: transaction.id.toString(),
        nftId: transaction.nftId,
        type: transaction.type,
        memo: transaction.memo,
        status: transaction.status,
        timestamp: transaction.createdAt
      }
    });
  } catch (error) {
    console.error('NFT purchase error:', error);
    res.status(500).json({ error: 'Failed to purchase NFT' });
  }
})

/**
 * Get NFT transaction history
 * GET /api/wallet/nft/transactions
 */
router.get('/nft/transactions', async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { limit = 50 } = req.query;
    
    const transactions = await dbManager.getNFTTransactions(userId, Number(limit));
    
    res.json({ 
      success: true,
      transactions 
    });
  } catch (error) {
    console.error('NFT transactions fetch error:', error);
    res.status(500).json({ error: 'Failed to get NFT transactions' });
  }
})

/**
 * Generate QR code for receiving
 * GET /api/wallet/qr/:walletType
 */
router.get('/qr/:walletType', walletRateLimit(10, 60000), async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id
    const { walletType } = req.params
    const { amount, memo } = req.query
    
    // Get user's wallet address based on type
    let address: string
    
    switch (walletType) {
      case 'bnb':
        const bnbWallet = await dbManager.getBNBWallet(userId)
        address = bnbWallet.address
        break
      case 'nft':
        const user = await dbManager.findUserById(userId)
        address = user?.nftAddress || generateMockAddress('nft')
        break
      default:
        res.status(400).json({
          success: false,
          message: 'Invalid wallet type'
        })
        return
    }
    
    // Generate QR code data
    const qrData = {
      address,
      amount: amount ? Number(amount) : undefined,
      memo: memo as string,
      walletType
    }
    
    res.json({
      success: true,
      data: {
        qrData: JSON.stringify(qrData),
        address
      }
    })
  } catch (error) {
    console.error('QR generation error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code'
    })
  }
})

// QR Code generation
router.post('/qr/generate', walletRateLimit(10, 60000), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { type, amount, memo } = req.body;
    
    if (!type) {
      return res.status(400).json({ error: 'QR type is required' });
    }
    
    // Generate QR data based on type
    let qrPayload;
    switch (type) {
      case 'bnb':
        qrPayload = {
          type: 'bnb_receive',
          userId,
          address: `bnb1${userId}receive${Date.now()}`,
          amount: amount || 0,
          memo: memo || ''
        };
        break;
      case 'point':
        qrPayload = {
          type: 'point_receive',
          userId,
          coinType: req.body.coinType || 'LTC',
          amount: amount || 0,
          memo: memo || ''
        };
        break;
      case 'nft':
        qrPayload = {
          type: 'nft_receive',
          userId,
          nftType: req.body.nftType || 'gift_card',
          memo: memo || ''
        };
        break;
      default:
        return res.status(400).json({ error: 'Invalid QR type' });
    }
    
    // In a real implementation, you would use a QR code library like 'qrcode'
    // For now, we'll create a mock QR code data URL
    const qrString = JSON.stringify(qrPayload);
    const qrCodeUrl = `data:image/svg+xml;base64,${Buffer.from(`
      <svg width="200" height="200" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="black"/>
        <rect x="40" y="40" width="120" height="120" fill="white"/>
        <text x="100" y="105" text-anchor="middle" font-size="12" fill="black">QR Code</text>
        <text x="100" y="125" text-anchor="middle" font-size="8" fill="black">${type.toUpperCase()}</text>
      </svg>
    `).toString('base64')}`;
    
    const qrData = {
      id: Date.now().toString(),
      type,
      payload: qrPayload,
      qrCode: qrCodeUrl,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      createdAt: new Date().toISOString()
    };
    
    res.json({ success: true, qrData });
  } catch (error) {
    console.error('QR generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Helper functions
function calculateTotalValue(bnbWallet: any, pointWallets: any[], nftWallets: any[]): number {
  let total = 0
  
  // Add BNB value (mock price: $500)
  if (bnbWallet) {
    total += bnbWallet.balance * 500
  }
  
  // Add point wallet values (mock prices)
  const coinPrices: { [key: string]: number } = {
    LTC: 92.35,
    DOGE: 0.0825,
    BELLS: 0.0012,
    PEP: 0.0008,
    JKC: 0.0005,
    LKY: 0.0015,
    DINGO: 0.0003,
    SHIC: 0.0002
  }
  
  pointWallets.forEach(wallet => {
    const price = coinPrices[wallet.coinSymbol] || 0
    total += wallet.balance * price
  })
  
  // Add NFT values
  nftWallets.forEach(nft => {
    total += nft.currentValue || 0
  })
  
  return total
}

function generateMockTxHash(): string {
  return '0x' + crypto.randomBytes(32).toString('hex')
}

function generateMockAddress(type: string): string {
  const prefix = type === 'bnb' ? 'bnb' : '0x'
  return prefix + crypto.randomBytes(20).toString('hex')
}

export default router