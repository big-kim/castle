import { Router } from 'express';
import { authenticateToken } from '../middleware/auth.js';
import dbManager from '../database.js';
import { GiftCardType } from '../../src/types/index.js';

const router = Router();

// Helper function to generate unique card number
function generateCardNumber(): string {
  const timestamp = Date.now().toString();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `IC${timestamp.slice(-6)}${random}`;
}

// Helper function to generate PIN
function generatePIN(): string {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

// Helper function to generate QR code
function generateQRCode(): string {
  return `QR${Date.now()}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
}

// Get all gift card products
router.get('/products', async (req, res) => {
  try {
    const { cardType, brand, category, isAvailable } = req.query;
    
    const filters: any = {};
    if (cardType) filters.cardType = cardType as string;
    if (brand) filters.brand = brand as string;
    if (category) filters.category = category as string;
    if (isAvailable !== undefined) filters.isAvailable = isAvailable === 'true';
    
    const products = await dbManager.getGiftCardProducts(filters);
    res.json(products);
  } catch (error) {
    console.error('Error fetching gift card products:', error);
    res.status(500).json({ error: 'Failed to fetch gift card products' });
  }
});

// Get gift card product by ID
router.get('/products/:id', async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const product = await dbManager.getGiftCardProductById(productId);
    
    if (!product) {
      return res.status(404).json({ error: 'Gift card product not found' });
    }
    
    res.json(product);
  } catch (error) {
    console.error('Error fetching gift card product:', error);
    res.status(500).json({ error: 'Failed to fetch gift card product' });
  }
});

// Create new gift card product (admin only)
router.post('/products', authenticateToken, async (req, res) => {
  try {
    const {
      cardType,
      name,
      description,
      brand,
      category,
      faceValue,
      price,
      discountRate = 0,
      imageUrl,
      stock = 0,
      validityDays = 365,
      minPurchase = 1,
      maxPurchase = 10
    } = req.body;

    // Validate required fields
    if (!cardType || !name || !brand || !category || !faceValue || !price) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const product = await dbManager.createGiftCardProduct({
      cardType,
      name,
      description,
      brand,
      category,
      faceValue,
      price,
      discountRate,
      imageUrl,
      isAvailable: true,
      stock,
      validityDays,
      minPurchase,
      maxPurchase
    });

    res.status(201).json(product);
  } catch (error) {
    console.error('Error creating gift card product:', error);
    res.status(500).json({ error: 'Failed to create gift card product' });
  }
});

// Update gift card product (admin only)
router.put('/products/:id', authenticateToken, async (req, res) => {
  try {
    const productId = parseInt(req.params.id);
    const updates = req.body;

    const updatedProduct = await dbManager.updateGiftCardProduct(productId, updates);
    
    if (!updatedProduct) {
      return res.status(404).json({ error: 'Gift card product not found' });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating gift card product:', error);
    res.status(500).json({ error: 'Failed to update gift card product' });
  }
});

// Get user's gift cards
router.get('/cards', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { status } = req.query;
    
    const giftCards = await dbManager.getGiftCardsByUser(userId, status as string);
    res.json(giftCards);
  } catch (error) {
    console.error('Error fetching user gift cards:', error);
    res.status(500).json({ error: 'Failed to fetch gift cards' });
  }
});

// Get gift card by card number
router.get('/cards/:cardNumber', authenticateToken, async (req, res) => {
  try {
    const { cardNumber } = req.params;
    const userId = (req as any).user.id;
    
    const giftCard = await dbManager.getGiftCardByCardNumber(cardNumber);
    
    if (!giftCard) {
      return res.status(404).json({ error: 'Gift card not found' });
    }
    
    // Check if the gift card belongs to the user
    if (giftCard.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }
    
    res.json(giftCard);
  } catch (error) {
    console.error('Error fetching gift card:', error);
    res.status(500).json({ error: 'Failed to fetch gift card' });
  }
});

// Purchase gift card
router.post('/purchase', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { productId, quantity, paymentMethod } = req.body;

    // Validate required fields
    if (!productId || !quantity || !paymentMethod) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get product details
    const product = await dbManager.getGiftCardProductById(productId);
    if (!product) {
      return res.status(404).json({ error: 'Gift card product not found' });
    }

    if (!product.isAvailable) {
      return res.status(400).json({ error: 'Gift card product is not available' });
    }

    if (quantity < product.minPurchase || quantity > product.maxPurchase) {
      return res.status(400).json({ 
        error: `Quantity must be between ${product.minPurchase} and ${product.maxPurchase}` 
      });
    }

    if (product.stock > 0 && quantity > product.stock) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    const totalAmount = product.price * quantity;

    // Create purchase record
    const purchase = await dbManager.createGiftCardPurchase({
      userId,
      productId,
      quantity,
      totalAmount,
      paymentMethod,
      status: 'completed', // In real implementation, this would be 'pending' until payment is confirmed
      transactionId: `TXN${Date.now()}${Math.random().toString(36).substring(2, 6).toUpperCase()}`
    });

    // Create individual gift cards
    const giftCards = [];
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + product.validityDays);

    for (let i = 0; i < quantity; i++) {
      const giftCard = await dbManager.createGiftCard({
        userId,
        productId,
        cardType: product.cardType,
        cardNumber: generateCardNumber(),
        pin: generatePIN(),
        faceValue: product.faceValue,
        currentBalance: product.faceValue,
        status: 'active',
        purchaseDate: new Date().toISOString(),
        expiryDate: expiryDate.toISOString()
      });
      giftCards.push(giftCard);
    }

    // Update product stock if applicable
    if (product.stock > 0) {
      await dbManager.updateGiftCardProduct(productId, {
        stock: product.stock - quantity
      });
    }

    res.status(201).json({
      purchase,
      giftCards
    });
  } catch (error) {
    console.error('Error purchasing gift card:', error);
    res.status(500).json({ error: 'Failed to purchase gift card' });
  }
});

// Get purchase history
router.get('/purchases', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const purchases = await dbManager.getGiftCardPurchasesByUser(userId);
    res.json(purchases);
  } catch (error) {
    console.error('Error fetching purchase history:', error);
    res.status(500).json({ error: 'Failed to fetch purchase history' });
  }
});

// Use gift card (create transaction)
router.post('/use', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { cardNumber, pin, amount, merchantInfo, description } = req.body;

    // Validate required fields
    if (!cardNumber || !pin || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get gift card
    const giftCard = await dbManager.getGiftCardByCardNumber(cardNumber);
    if (!giftCard) {
      return res.status(404).json({ error: 'Gift card not found' });
    }

    // Check ownership
    if (giftCard.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Validate PIN
    if (giftCard.pin !== pin) {
      return res.status(400).json({ error: 'Invalid PIN' });
    }

    // Check card status
    if (giftCard.status !== 'active') {
      return res.status(400).json({ error: 'Gift card is not active' });
    }

    // Check expiry
    if (new Date(giftCard.expiryDate) < new Date()) {
      return res.status(400).json({ error: 'Gift card has expired' });
    }

    // Check balance
    if (giftCard.currentBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Create transaction
    const transaction = await dbManager.createGiftCardTransaction({
      giftCardId: giftCard.id,
      userId,
      type: 'usage',
      amount,
      merchantInfo,
      description,
      status: 'completed'
    });

    // Update gift card balance
    const newBalance = giftCard.currentBalance - amount;
    await dbManager.updateGiftCard(giftCard.id, {
      currentBalance: newBalance,
      lastUsedAt: new Date().toISOString(),
      status: newBalance === 0 ? 'used' : 'active'
    });

    res.json({
      transaction,
      remainingBalance: newBalance
    });
  } catch (error) {
    console.error('Error using gift card:', error);
    res.status(500).json({ error: 'Failed to use gift card' });
  }
});

// Generate QR code for gift card usage
router.post('/qr/generate', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { cardNumber, amount, merchantInfo } = req.body;

    // Validate required fields
    if (!cardNumber || !amount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get gift card
    const giftCard = await dbManager.getGiftCardByCardNumber(cardNumber);
    if (!giftCard) {
      return res.status(404).json({ error: 'Gift card not found' });
    }

    // Check ownership
    if (giftCard.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Check card status and balance
    if (giftCard.status !== 'active') {
      return res.status(400).json({ error: 'Gift card is not active' });
    }

    if (giftCard.currentBalance < amount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }

    // Generate QR transaction (expires in 15 minutes)
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const qrTransaction = await dbManager.createQRTransaction({
      giftCardId: giftCard.id,
      userId,
      amount,
      qrCode: generateQRCode(),
      expiresAt: expiresAt.toISOString(),
      status: 'pending',
      merchantInfo
    });

    res.json(qrTransaction);
  } catch (error) {
    console.error('Error generating QR code:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
});

// Use QR code
router.post('/qr/use', authenticateToken, async (req, res) => {
  try {
    const { qrCode } = req.body;

    if (!qrCode) {
      return res.status(400).json({ error: 'QR code is required' });
    }

    // Get QR transaction
    const qrTransaction = await dbManager.getQRTransactionByCode(qrCode);
    if (!qrTransaction) {
      return res.status(404).json({ error: 'QR code not found' });
    }

    // Check if already used
    if (qrTransaction.status === 'used') {
      return res.status(400).json({ error: 'QR code already used' });
    }

    // Check expiry
    if (new Date(qrTransaction.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'QR code has expired' });
    }

    // Get gift card
    const giftCard = await dbManager.getGiftCardByCardNumber(
      (await dbManager.db?.get('SELECT cardNumber FROM gift_cards WHERE id = ?', [qrTransaction.giftCardId]))?.cardNumber
    );

    if (!giftCard) {
      return res.status(404).json({ error: 'Associated gift card not found' });
    }

    // Check gift card balance
    if (giftCard.currentBalance < qrTransaction.amount) {
      return res.status(400).json({ error: 'Insufficient gift card balance' });
    }

    // Create gift card transaction
    const transaction = await dbManager.createGiftCardTransaction({
      giftCardId: giftCard.id,
      userId: qrTransaction.userId,
      type: 'qr_usage',
      amount: qrTransaction.amount,
      merchantInfo: qrTransaction.merchantInfo,
      description: `QR payment: ${qrCode}`,
      status: 'completed'
    });

    // Update gift card balance
    const newBalance = giftCard.currentBalance - qrTransaction.amount;
    await dbManager.updateGiftCard(giftCard.id, {
      currentBalance: newBalance,
      lastUsedAt: new Date().toISOString(),
      status: newBalance === 0 ? 'used' : 'active'
    });

    // Mark QR transaction as used
    await dbManager.updateQRTransaction(qrTransaction.id, {
      status: 'used',
      usedAt: new Date().toISOString()
    });

    res.json({
      transaction,
      remainingBalance: newBalance,
      qrTransaction
    });
  } catch (error) {
    console.error('Error using QR code:', error);
    res.status(500).json({ error: 'Failed to use QR code' });
  }
});

// Get gift card transactions
router.get('/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const transactions = await dbManager.getGiftCardTransactionsByUser(userId);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({ error: 'Failed to fetch transactions' });
  }
});

// Get transactions for a specific gift card
router.get('/cards/:cardNumber/transactions', authenticateToken, async (req, res) => {
  try {
    const userId = (req as any).user.id;
    const { cardNumber } = req.params;

    // Get gift card
    const giftCard = await dbManager.getGiftCardByCardNumber(cardNumber);
    if (!giftCard) {
      return res.status(404).json({ error: 'Gift card not found' });
    }

    // Check ownership
    if (giftCard.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const transactions = await dbManager.getGiftCardTransactionsByCard(giftCard.id);
    res.json(transactions);
  } catch (error) {
    console.error('Error fetching gift card transactions:', error);
    res.status(500).json({ error: 'Failed to fetch gift card transactions' });
  }
});

export default router;