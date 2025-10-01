import sqlite3 from 'sqlite3';
import { Database, open } from 'sqlite';
import bcrypt from 'bcryptjs';
import path from 'path';

export interface User {
  id: number;
  email: string;
  password?: string;
  name: string;
  provider: 'local' | 'kakao' | 'google' | 'apple';
  providerId?: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Session {
  id: string;
  userId: number;
  expiresAt: string;
  createdAt: string;
}

export interface BNBWallet {
  id: number;
  userId: number;
  address: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export interface BNBTransaction {
  id: number;
  userId: number;
  type: 'send' | 'receive';
  amount: number;
  toAddress?: string;
  fromAddress?: string;
  memo?: string;
  status: 'pending' | 'completed' | 'failed';
  txHash?: string;
  createdAt: string;
}

export interface PointWallet {
  id: number;
  userId: number;
  coinSymbol: string;
  balance: number;
  totalEarned: number;
  createdAt: string;
  updatedAt: string;
}

export interface PointTransaction {
  id: number;
  userId: number;
  coinSymbol: string;
  type: 'earn' | 'withdraw';
  amount: number;
  toAddress?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface NFTWallet {
  id: number;
  userId: number;
  tokenId: string;
  contractAddress: string;
  name: string;
  description: string;
  imageUrl: string;
  currentValue: number;
  createdAt: string;
}

export interface NFTTransaction {
  id: number;
  userId: number;
  nftId: number;
  type: 'send' | 'receive' | 'buy';
  toAddress?: string;
  fromAddress?: string;
  memo?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface P2POrder {
  id: number;
  userId: number;
  userName?: string;
  userRating?: number;
  productType: 'token' | 'nft' | 'coupon' | 'other';
  tokenSymbol: string;
  paymentTokenSymbol: string;
  amount: number;
  price: number;
  pricePerToken: number;
  totalValue: number;
  paymentMethod: string;
  type: 'buy' | 'sell';
  status: 'active' | 'completed' | 'cancelled';
  tradeMethod: 'normal' | 'smart_contract';
  smartContractStatus?: 'listed' | 'pending' | 'completed' | 'canceled' | 'timeout';
  contractAddress?: string;
  transactionHash?: string;
  escrowTimeout?: string;
  productDetails?: string; // JSON string
  createdAt: string;
  updatedAt: string;
}

export interface P2PTransaction {
  id: number;
  orderId: number;
  buyerId: number;
  sellerId: number;
  amount: number;
  price: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  completedAt?: string;
}

export interface UserRating {
  id: number;
  userId: number;
  ratedByUserId: number;
  orderId: number;
  rating: number;
  comment?: string;
  createdAt: string;
}

// Mining-related interfaces
export interface MiningPool {
  id: number;
  coinSymbol: string;
  name: string;
  algorithm: string;
  difficulty: number;
  hashRate: number;
  totalMiners: number;
  rewardPerBlock: number;
  blockTime: number;
  poolFee: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MiningSession {
  id: number;
  userId: number;
  poolId: number;
  coinSymbol: string;
  hashPower: number;
  status: 'active' | 'paused' | 'stopped';
  startedAt: string;
  stoppedAt?: string;
  totalEarnings: number;
  createdAt: string;
  updatedAt: string;
}

export interface MiningEarning {
  id: number;
  userId: number;
  sessionId: number;
  poolId: number;
  coinSymbol: string;
  amount: number;
  hashPower: number;
  blockHeight?: number;
  earnedAt: string;
  createdAt: string;
}

export interface MiningWithdrawal {
  id: number;
  userId: number;
  coinSymbol: string;
  amount: number;
  toAddress: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  txHash?: string;
  fee: number;
  createdAt: string;
  completedAt?: string;
}

// Gift Card interfaces
export interface GiftCardProduct {
  id: number;
  cardType: string;
  name: string;
  description: string;
  brand: string;
  category: string;
  faceValue: number;
  price: number;
  discountRate: number;
  imageUrl: string;
  isAvailable: boolean;
  stock: number;
  validityDays: number;
  minPurchase: number;
  maxPurchase: number;
  createdAt: string;
  updatedAt: string;
}

export interface GiftCard {
  id: number;
  userId: number;
  productId: number;
  cardType: string;
  cardNumber: string;
  pin: string;
  faceValue: number;
  currentBalance: number;
  status: 'active' | 'used' | 'expired' | 'redeemed';
  purchaseDate: string;
  expiryDate: string;
  lastUsedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface GiftCardPurchase {
  id: number;
  userId: number;
  productId: number;
  quantity: number;
  totalAmount: number;
  paymentMethod: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  transactionId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface GiftCardTransaction {
  id: number;
  giftCardId: number;
  userId: number;
  type: 'purchase' | 'redeem' | 'transfer' | 'refund';
  amount: number;
  merchantInfo?: string;
  description?: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
}

export interface QRTransaction {
  id: number;
  giftCardId: number;
  userId: number;
  amount: number;
  qrCode: string;
  expiresAt: string;
  status: 'pending' | 'used' | 'expired';
  usedAt?: string;
  merchantInfo?: string;
  createdAt: string;
}

class DatabaseManager {
  private db: Database | null = null;

  async initialize(): Promise<void> {
    try {
      this.db = await open({
        filename: process.env.DATABASE_URL || './database.sqlite',
        driver: sqlite3.Database
      });

      await this.createTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

  private async createTables(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    // Users table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT,
        name TEXT NOT NULL,
        provider TEXT NOT NULL DEFAULT 'local',
        providerId TEXT,
        avatar TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Sessions table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS sessions (
        id TEXT PRIMARY KEY,
        userId INTEGER NOT NULL,
        expiresAt DATETIME NOT NULL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // BNB Wallets table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS bnb_wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        address TEXT NOT NULL,
        balance REAL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(userId)
      )
    `);

    // BNB Transactions table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS bnb_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        toAddress TEXT,
        fromAddress TEXT,
        memo TEXT,
        status TEXT DEFAULT 'pending',
        txHash TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Point Wallets table (Mining coins)
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS point_wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        coinSymbol TEXT NOT NULL,
        balance REAL DEFAULT 0,
        totalEarned REAL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        UNIQUE(userId, coinSymbol)
      )
    `);

    // Point Transactions table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS point_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        coinSymbol TEXT NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        toAddress TEXT,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // NFT Wallets table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS nft_wallets (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        tokenId TEXT NOT NULL,
        contractAddress TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        imageUrl TEXT,
        currentValue REAL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // NFT Transactions table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS nft_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        nftId INTEGER NOT NULL,
        type TEXT NOT NULL,
        toAddress TEXT,
        fromAddress TEXT,
        memo TEXT,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (nftId) REFERENCES nft_wallets (id) ON DELETE CASCADE
      )
    `);

    // P2P Orders table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS p2p_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        userName TEXT,
        userRating REAL,
        productType TEXT NOT NULL,
        tokenSymbol TEXT NOT NULL,
        paymentTokenSymbol TEXT NOT NULL,
        amount REAL NOT NULL,
        price REAL NOT NULL,
        pricePerToken REAL NOT NULL,
        totalValue REAL NOT NULL,
        paymentMethod TEXT NOT NULL,
        type TEXT NOT NULL,
        status TEXT DEFAULT 'active',
        tradeMethod TEXT DEFAULT 'normal',
        smartContractStatus TEXT,
        contractAddress TEXT,
        transactionHash TEXT,
        escrowTimeout TEXT,
        productDetails TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // P2P Transactions table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS p2p_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderId INTEGER NOT NULL,
        buyerId INTEGER NOT NULL,
        sellerId INTEGER NOT NULL,
        amount REAL NOT NULL,
        price REAL NOT NULL,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        completedAt DATETIME,
        FOREIGN KEY (orderId) REFERENCES p2p_orders (id) ON DELETE CASCADE,
        FOREIGN KEY (buyerId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (sellerId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // User Ratings table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS user_ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        ratedByUserId INTEGER NOT NULL,
        orderId INTEGER NOT NULL,
        rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
        comment TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (ratedByUserId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (orderId) REFERENCES p2p_orders (id) ON DELETE CASCADE,
        UNIQUE(userId, ratedByUserId, orderId)
      )
    `);

    // Mining Pools table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS mining_pools (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        coinSymbol TEXT NOT NULL,
        name TEXT NOT NULL,
        algorithm TEXT NOT NULL,
        difficulty REAL DEFAULT 1.0,
        hashRate REAL DEFAULT 0,
        totalMiners INTEGER DEFAULT 0,
        rewardPerBlock REAL NOT NULL,
        blockTime INTEGER NOT NULL,
        poolFee REAL DEFAULT 0.01,
        isActive BOOLEAN DEFAULT 1,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(coinSymbol)
      )
    `);

    // Mining Sessions table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS mining_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        poolId INTEGER NOT NULL,
        coinSymbol TEXT NOT NULL,
        hashPower REAL DEFAULT 0,
        status TEXT DEFAULT 'active',
        startedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        stoppedAt DATETIME,
        totalEarnings REAL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (poolId) REFERENCES mining_pools (id) ON DELETE CASCADE
      )
    `);

    // Mining Earnings table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS mining_earnings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        sessionId INTEGER NOT NULL,
        poolId INTEGER NOT NULL,
        coinSymbol TEXT NOT NULL,
        amount REAL NOT NULL,
        hashPower REAL NOT NULL,
        blockHeight INTEGER,
        earnedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (sessionId) REFERENCES mining_sessions (id) ON DELETE CASCADE,
        FOREIGN KEY (poolId) REFERENCES mining_pools (id) ON DELETE CASCADE
      )
    `);

    // Mining Withdrawals table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS mining_withdrawals (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        coinSymbol TEXT NOT NULL,
        amount REAL NOT NULL,
        toAddress TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        txHash TEXT,
        fee REAL DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        completedAt DATETIME,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Gift Card Products table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS gift_card_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        cardType TEXT NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        brand TEXT NOT NULL,
        category TEXT NOT NULL,
        faceValue REAL NOT NULL,
        price REAL NOT NULL,
        discountRate REAL DEFAULT 0,
        imageUrl TEXT,
        isAvailable BOOLEAN DEFAULT 1,
        stock INTEGER DEFAULT 0,
        validityDays INTEGER DEFAULT 365,
        minPurchase INTEGER DEFAULT 1,
        maxPurchase INTEGER DEFAULT 10,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Gift Cards table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS gift_cards (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        cardType TEXT NOT NULL,
        cardNumber TEXT NOT NULL UNIQUE,
        pin TEXT NOT NULL,
        faceValue REAL NOT NULL,
        currentBalance REAL NOT NULL,
        status TEXT DEFAULT 'active',
        purchaseDate DATETIME DEFAULT CURRENT_TIMESTAMP,
        expiryDate DATETIME NOT NULL,
        lastUsedAt DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES gift_card_products (id) ON DELETE CASCADE
      )
    `);

    // Gift Card Purchases table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS gift_card_purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        productId INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        totalAmount REAL NOT NULL,
        paymentMethod TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        transactionId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        completedAt DATETIME,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE,
        FOREIGN KEY (productId) REFERENCES gift_card_products (id) ON DELETE CASCADE
      )
    `);

    // Gift Card Transactions table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS gift_card_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        giftCardId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount REAL NOT NULL,
        merchantInfo TEXT,
        description TEXT,
        status TEXT DEFAULT 'pending',
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (giftCardId) REFERENCES gift_cards (id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // QR Transactions table
    await this.db.exec(`
      CREATE TABLE IF NOT EXISTS qr_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        giftCardId INTEGER NOT NULL,
        userId INTEGER NOT NULL,
        amount REAL NOT NULL,
        qrCode TEXT NOT NULL UNIQUE,
        expiresAt DATETIME NOT NULL,
        status TEXT DEFAULT 'pending',
        usedAt DATETIME,
        merchantInfo TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (giftCardId) REFERENCES gift_cards (id) ON DELETE CASCADE,
        FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
      )
    `);

    // Create indexes
    await this.db.exec(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
      CREATE INDEX IF NOT EXISTS idx_users_provider ON users(provider, providerId);
      CREATE INDEX IF NOT EXISTS idx_sessions_userId ON sessions(userId);
      CREATE INDEX IF NOT EXISTS idx_sessions_expiresAt ON sessions(expiresAt);
      CREATE INDEX IF NOT EXISTS idx_bnb_wallets_userId ON bnb_wallets(userId);
      CREATE INDEX IF NOT EXISTS idx_bnb_transactions_userId ON bnb_transactions(userId);
      CREATE INDEX IF NOT EXISTS idx_point_wallets_userId ON point_wallets(userId);
      CREATE INDEX IF NOT EXISTS idx_point_wallets_coin ON point_wallets(userId, coinSymbol);
      CREATE INDEX IF NOT EXISTS idx_point_transactions_userId ON point_transactions(userId);
      CREATE INDEX IF NOT EXISTS idx_nft_wallets_userId ON nft_wallets(userId);
      CREATE INDEX IF NOT EXISTS idx_nft_transactions_userId ON nft_transactions(userId);
      CREATE INDEX IF NOT EXISTS idx_p2p_orders_userId ON p2p_orders(userId);
      CREATE INDEX IF NOT EXISTS idx_p2p_orders_status ON p2p_orders(status);
      CREATE INDEX IF NOT EXISTS idx_p2p_orders_type ON p2p_orders(type);
      CREATE INDEX IF NOT EXISTS idx_p2p_orders_tokenSymbol ON p2p_orders(tokenSymbol);
      CREATE INDEX IF NOT EXISTS idx_p2p_transactions_orderId ON p2p_transactions(orderId);
      CREATE INDEX IF NOT EXISTS idx_p2p_transactions_buyerId ON p2p_transactions(buyerId);
      CREATE INDEX IF NOT EXISTS idx_p2p_transactions_sellerId ON p2p_transactions(sellerId);
      CREATE INDEX IF NOT EXISTS idx_user_ratings_userId ON user_ratings(userId);
      CREATE INDEX IF NOT EXISTS idx_mining_pools_coinSymbol ON mining_pools(coinSymbol);
      CREATE INDEX IF NOT EXISTS idx_mining_pools_isActive ON mining_pools(isActive);
      CREATE INDEX IF NOT EXISTS idx_mining_sessions_userId ON mining_sessions(userId);
      CREATE INDEX IF NOT EXISTS idx_mining_sessions_poolId ON mining_sessions(poolId);
      CREATE INDEX IF NOT EXISTS idx_mining_sessions_status ON mining_sessions(status);
      CREATE INDEX IF NOT EXISTS idx_mining_sessions_coinSymbol ON mining_sessions(coinSymbol);
      CREATE INDEX IF NOT EXISTS idx_mining_earnings_userId ON mining_earnings(userId);
      CREATE INDEX IF NOT EXISTS idx_mining_earnings_sessionId ON mining_earnings(sessionId);
      CREATE INDEX IF NOT EXISTS idx_mining_earnings_coinSymbol ON mining_earnings(coinSymbol);
      CREATE INDEX IF NOT EXISTS idx_mining_withdrawals_userId ON mining_withdrawals(userId);
      CREATE INDEX IF NOT EXISTS idx_mining_withdrawals_status ON mining_withdrawals(status);
      CREATE INDEX IF NOT EXISTS idx_gift_card_products_cardType ON gift_card_products(cardType);
      CREATE INDEX IF NOT EXISTS idx_gift_card_products_brand ON gift_card_products(brand);
      CREATE INDEX IF NOT EXISTS idx_gift_card_products_category ON gift_card_products(category);
      CREATE INDEX IF NOT EXISTS idx_gift_card_products_isAvailable ON gift_card_products(isAvailable);
      CREATE INDEX IF NOT EXISTS idx_gift_cards_userId ON gift_cards(userId);
      CREATE INDEX IF NOT EXISTS idx_gift_cards_productId ON gift_cards(productId);
      CREATE INDEX IF NOT EXISTS idx_gift_cards_cardType ON gift_cards(cardType);
      CREATE INDEX IF NOT EXISTS idx_gift_cards_status ON gift_cards(status);
      CREATE INDEX IF NOT EXISTS idx_gift_cards_cardNumber ON gift_cards(cardNumber);
      CREATE INDEX IF NOT EXISTS idx_gift_card_purchases_userId ON gift_card_purchases(userId);
      CREATE INDEX IF NOT EXISTS idx_gift_card_purchases_productId ON gift_card_purchases(productId);
      CREATE INDEX IF NOT EXISTS idx_gift_card_purchases_status ON gift_card_purchases(status);
      CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_giftCardId ON gift_card_transactions(giftCardId);
      CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_userId ON gift_card_transactions(userId);
      CREATE INDEX IF NOT EXISTS idx_gift_card_transactions_type ON gift_card_transactions(type);
      CREATE INDEX IF NOT EXISTS idx_qr_transactions_giftCardId ON qr_transactions(giftCardId);
      CREATE INDEX IF NOT EXISTS idx_qr_transactions_userId ON qr_transactions(userId);
      CREATE INDEX IF NOT EXISTS idx_qr_transactions_qrCode ON qr_transactions(qrCode);
      CREATE INDEX IF NOT EXISTS idx_qr_transactions_status ON qr_transactions(status);
    `);
  }

  async createUser(userData: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    if (!this.db) throw new Error('Database not initialized');

    const hashedPassword = userData.password ? await bcrypt.hash(userData.password, 12) : null;

    const result = await this.db.run(
      `INSERT INTO users (email, password, name, provider, providerId, avatar)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userData.email, hashedPassword, userData.name, userData.provider, userData.providerId, userData.avatar]
    );

    const user = await this.db.get(
      'SELECT * FROM users WHERE id = ?',
      [result.lastID]
    );

    return user as User;
  }

  async findUserByEmail(email: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    const user = await this.db.get(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    return user as User | null;
  }

  async findUserByProvider(provider: string, providerId: string): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    const user = await this.db.get(
      'SELECT * FROM users WHERE provider = ? AND providerId = ?',
      [provider, providerId]
    );

    return user as User | null;
  }

  async findUserById(id: number): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    const user = await this.db.get(
      'SELECT * FROM users WHERE id = ?',
      [id]
    );

    return user as User | null;
  }

  async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, hashedPassword);
  }

  async updateUser(id: number, updates: Partial<User>): Promise<User | null> {
    if (!this.db) throw new Error('Database not initialized');

    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => `${key} = ?`)
      .join(', ');

    if (!setClause) return null;

    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'createdAt')
      .map(([, value]) => value);

    await this.db.run(
      `UPDATE users SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );

    return this.findUserById(id);
  }

  async createSession(userId: number, sessionId: string, expiresAt: Date): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run(
      'INSERT INTO sessions (id, userId, expiresAt) VALUES (?, ?, ?)',
      [sessionId, userId, expiresAt.toISOString()]
    );
  }

  async findSession(sessionId: string): Promise<Session | null> {
    if (!this.db) throw new Error('Database not initialized');

    const session = await this.db.get(
      'SELECT * FROM sessions WHERE id = ? AND expiresAt > CURRENT_TIMESTAMP',
      [sessionId]
    );

    return session as Session | null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    await this.db.run('DELETE FROM sessions WHERE id = ?', [sessionId]);
  }

  async cleanExpiredSessions(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run(
      'DELETE FROM sessions WHERE expiresAt < ?',
      [new Date().toISOString()]
    );
  }

  // BNB Wallet methods
  async createBNBWallet(userId: number, address: string): Promise<BNBWallet> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      'INSERT INTO bnb_wallets (userId, address) VALUES (?, ?)',
      [userId, address]
    );
    
    return this.getBNBWallet(userId);
  }

  async getBNBWallet(userId: number): Promise<BNBWallet | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const wallet = await this.db.get(
      'SELECT * FROM bnb_wallets WHERE userId = ?',
      [userId]
    );
    
    return wallet || null;
  }

  async updateBNBBalance(userId: number, balance: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run(
      'UPDATE bnb_wallets SET balance = ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ?',
      [balance, userId]
    );
  }

  async createBNBTransaction(transaction: Omit<BNBTransaction, 'id' | 'createdAt'>): Promise<BNBTransaction> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      'INSERT INTO bnb_transactions (userId, type, amount, toAddress, fromAddress, memo, status, txHash) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [transaction.userId, transaction.type, transaction.amount, transaction.toAddress, transaction.fromAddress, transaction.memo, transaction.status, transaction.txHash]
    );
    
    const newTransaction = await this.db.get(
      'SELECT * FROM bnb_transactions WHERE id = ?',
      [result.lastID]
    );
    
    return newTransaction;
  }

  async getBNBTransactions(userId: number, limit: number = 50): Promise<BNBTransaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transactions = await this.db.all(
      'SELECT * FROM bnb_transactions WHERE userId = ? ORDER BY createdAt DESC LIMIT ?',
      [userId, limit]
    );
    
    return transactions;
  }

  // Point Wallet methods
  async createPointWallet(userId: number, coinSymbol: string): Promise<PointWallet> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      'INSERT INTO point_wallets (userId, coinSymbol) VALUES (?, ?)',
      [userId, coinSymbol]
    );
    
    return this.getPointWallet(userId, coinSymbol);
  }

  async getPointWallet(userId: number, coinSymbol: string): Promise<PointWallet | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const wallet = await this.db.get(
      'SELECT * FROM point_wallets WHERE userId = ? AND coinSymbol = ?',
      [userId, coinSymbol]
    );
    
    return wallet || null;
  }

  async getPointWallets(userId: number): Promise<PointWallet[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const wallets = await this.db.all(
      'SELECT * FROM point_wallets WHERE userId = ? ORDER BY coinSymbol',
      [userId]
    );
    
    return wallets;
  }

  async updatePointBalance(userId: number, coinSymbol: string, balance: number, totalEarned?: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    if (totalEarned !== undefined) {
      await this.db.run(
        'UPDATE point_wallets SET balance = ?, totalEarned = ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ? AND coinSymbol = ?',
        [balance, totalEarned, userId, coinSymbol]
      );
    } else {
      await this.db.run(
        'UPDATE point_wallets SET balance = ?, updatedAt = CURRENT_TIMESTAMP WHERE userId = ? AND coinSymbol = ?',
        [balance, userId, coinSymbol]
      );
    }
  }

  async createPointTransaction(transaction: Omit<PointTransaction, 'id' | 'createdAt'>): Promise<PointTransaction> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      'INSERT INTO point_transactions (userId, coinSymbol, type, amount, toAddress, status) VALUES (?, ?, ?, ?, ?, ?)',
      [transaction.userId, transaction.coinSymbol, transaction.type, transaction.amount, transaction.toAddress, transaction.status]
    );
    
    const newTransaction = await this.db.get(
      'SELECT * FROM point_transactions WHERE id = ?',
      [result.lastID]
    );
    
    return newTransaction;
  }

  async getPointTransactions(userId: number, coinSymbol?: string, limit: number = 50): Promise<PointTransaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM point_transactions WHERE userId = ?';
    let params: any[] = [userId];
    
    if (coinSymbol) {
      query += ' AND coinSymbol = ?';
      params.push(coinSymbol);
    }
    
    query += ' ORDER BY createdAt DESC LIMIT ?';
    params.push(limit);
    
    const transactions = await this.db.all(query, params);
    return transactions;
  }

  // NFT Wallet methods
  async createNFT(nft: Omit<NFTWallet, 'id' | 'createdAt'>): Promise<NFTWallet> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      'INSERT INTO nft_wallets (userId, tokenId, contractAddress, name, description, imageUrl, currentValue) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [nft.userId, nft.tokenId, nft.contractAddress, nft.name, nft.description, nft.imageUrl, nft.currentValue]
    );
    
    const newNFT = await this.db.get(
      'SELECT * FROM nft_wallets WHERE id = ?',
      [result.lastID]
    );
    
    return newNFT;
  }

  async getNFTs(userId: number): Promise<NFTWallet[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const nfts = await this.db.all(
      'SELECT * FROM nft_wallets WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    
    return nfts;
  }

  async getNFTById(id: number): Promise<NFTWallet | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const nft = await this.db.get(
      'SELECT * FROM nft_wallets WHERE id = ?',
      [id]
    );
    
    return nft || null;
  }

  async deleteNFT(id: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      'DELETE FROM nft_wallets WHERE id = ?',
      [id]
    );
    
    return result.changes > 0;
  }

  async updateNFTValue(id: number, currentValue: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    await this.db.run(
      'UPDATE nft_wallets SET currentValue = ? WHERE id = ?',
      [currentValue, id]
    );
  }

  // Initialize point wallets for all supported coins
  async initializePointWallets(userId: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    const supportedCoins = ['LTC', 'DOGE', 'BELLS', 'PEP', 'JKC', 'LKY', 'DINGO', 'SHIC'];
    
    for (const coinSymbol of supportedCoins) {
      const existingWallet = await this.getPointWallet(userId, coinSymbol);
      if (!existingWallet) {
        await this.createPointWallet(userId, coinSymbol);
      }
    }
  }

  // Add mining earnings to point wallet
  async addMiningEarnings(userId: number, coinSymbol: string, amount: number): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');
    
    let wallet = await this.getPointWallet(userId, coinSymbol);
    if (!wallet) {
      wallet = await this.createPointWallet(userId, coinSymbol);
    }
    
    const newBalance = wallet.balance + amount;
    const newTotalEarned = wallet.totalEarned + amount;
    
    await this.updatePointBalance(userId, coinSymbol, newBalance, newTotalEarned);
    
    // Create transaction record
    await this.createPointTransaction({
      userId,
      coinSymbol,
      type: 'earn',
      amount,
      status: 'completed'
    });
  }

  async createNFTTransaction(transaction: Omit<NFTTransaction, 'id' | 'createdAt'>): Promise<NFTTransaction> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      'INSERT INTO nft_transactions (userId, nftId, type, toAddress, fromAddress, memo, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [transaction.userId, transaction.nftId, transaction.type, transaction.toAddress, transaction.fromAddress, transaction.memo, transaction.status]
    );
    
    const newTransaction = await this.db.get(
      'SELECT * FROM nft_transactions WHERE id = ?',
      [result.lastID]
    );
    
    return newTransaction;
  }

  async getNFTTransaction(id: number): Promise<NFTTransaction | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transaction = await this.db.get(
      'SELECT * FROM nft_transactions WHERE id = ?',
      [id]
    );
    
    return transaction || null;
  }

  async getNFTTransactions(userId: number, limit: number = 50): Promise<NFTTransaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transactions = await this.db.all(
      'SELECT * FROM nft_transactions WHERE userId = ? ORDER BY createdAt DESC LIMIT ?',
      [userId, limit]
    );
    
    return transactions;
  }

  // P2P Order methods
  async createP2POrder(order: Omit<P2POrder, 'id' | 'createdAt' | 'updatedAt'>): Promise<P2POrder> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      `INSERT INTO p2p_orders (
        userId, userName, userRating, productType, tokenSymbol, paymentTokenSymbol,
        amount, price, pricePerToken, totalValue, paymentMethod, type, status,
        tradeMethod, smartContractStatus, contractAddress, transactionHash,
        escrowTimeout, productDetails
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        order.userId, order.userName, order.userRating, order.productType,
        order.tokenSymbol, order.paymentTokenSymbol, order.amount, order.price,
        order.pricePerToken, order.totalValue, order.paymentMethod, order.type,
        order.status, order.tradeMethod, order.smartContractStatus,
        order.contractAddress, order.transactionHash, order.escrowTimeout,
        order.productDetails
      ]
    );
    
    const newOrder = await this.db.get(
      'SELECT * FROM p2p_orders WHERE id = ?',
      [result.lastID]
    );
    
    return newOrder;
  }

  async getP2POrders(filters?: {
    type?: 'buy' | 'sell';
    status?: string;
    tokenSymbol?: string;
    userId?: number;
    limit?: number;
    offset?: number;
  }): Promise<P2POrder[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM p2p_orders WHERE 1=1';
    const params: any[] = [];
    
    if (filters?.type) {
      query += ' AND type = ?';
      params.push(filters.type);
    }
    
    if (filters?.status) {
      query += ' AND status = ?';
      params.push(filters.status);
    }
    
    if (filters?.tokenSymbol) {
      query += ' AND tokenSymbol = ?';
      params.push(filters.tokenSymbol);
    }
    
    if (filters?.userId) {
      query += ' AND userId = ?';
      params.push(filters.userId);
    }
    
    query += ' ORDER BY createdAt DESC';
    
    if (filters?.limit) {
      query += ' LIMIT ?';
      params.push(filters.limit);
      
      if (filters?.offset) {
        query += ' OFFSET ?';
        params.push(filters.offset);
      }
    }
    
    const orders = await this.db.all(query, params);
    return orders;
  }

  async getP2POrderById(id: number): Promise<P2POrder | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const order = await this.db.get(
      'SELECT * FROM p2p_orders WHERE id = ?',
      [id]
    );
    
    return order || null;
  }

  async updateP2POrder(id: number, updates: Partial<P2POrder>): Promise<P2POrder | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!setClause) return null;
    
    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'createdAt')
      .map(([, value]) => value);
    
    await this.db.run(
      `UPDATE p2p_orders SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );
    
    return this.getP2POrderById(id);
  }

  async deleteP2POrder(id: number): Promise<boolean> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      'DELETE FROM p2p_orders WHERE id = ?',
      [id]
    );
    
    return result.changes > 0;
  }

  // P2P Transaction methods
  async createP2PTransaction(transaction: Omit<P2PTransaction, 'id' | 'createdAt'>): Promise<P2PTransaction> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      'INSERT INTO p2p_transactions (orderId, buyerId, sellerId, amount, price, status) VALUES (?, ?, ?, ?, ?, ?)',
      [transaction.orderId, transaction.buyerId, transaction.sellerId, transaction.amount, transaction.price, transaction.status]
    );
    
    const newTransaction = await this.db.get(
      'SELECT * FROM p2p_transactions WHERE id = ?',
      [result.lastID]
    );
    
    return newTransaction;
  }

  async getP2PTransactionsByUser(userId: number): Promise<P2PTransaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transactions = await this.db.all(
      'SELECT * FROM p2p_transactions WHERE buyerId = ? OR sellerId = ? ORDER BY createdAt DESC',
      [userId, userId]
    );
    
    return transactions;
  }

  async updateP2PTransaction(id: number, updates: Partial<P2PTransaction>): Promise<P2PTransaction | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!setClause) return null;
    
    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'createdAt')
      .map(([, value]) => value);
    
    await this.db.run(
      `UPDATE p2p_transactions SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    
    const transaction = await this.db.get(
      'SELECT * FROM p2p_transactions WHERE id = ?',
      [id]
    );
    
    return transaction || null;
  }

  // User Rating methods
  async createUserRating(rating: Omit<UserRating, 'id' | 'createdAt'>): Promise<UserRating> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      'INSERT INTO user_ratings (userId, ratedByUserId, orderId, rating, comment) VALUES (?, ?, ?, ?, ?)',
      [rating.userId, rating.ratedByUserId, rating.orderId, rating.rating, rating.comment]
    );
    
    const newRating = await this.db.get(
      'SELECT * FROM user_ratings WHERE id = ?',
      [result.lastID]
    );
    
    return newRating;
  }

  async getUserRatings(userId: number): Promise<UserRating[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const ratings = await this.db.all(
      'SELECT * FROM user_ratings WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    
    return ratings;
  }

  async getUserAverageRating(userId: number): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.get(
      'SELECT AVG(rating) as avgRating FROM user_ratings WHERE userId = ?',
      [userId]
    );
    
    return result?.avgRating || 0;
  }

  // Mining Pool methods
  async createMiningPool(pool: Omit<MiningPool, 'id' | 'createdAt' | 'updatedAt'>): Promise<MiningPool> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      `INSERT INTO mining_pools (coinSymbol, name, algorithm, difficulty, hashRate, totalMiners, rewardPerBlock, blockTime, poolFee, isActive)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [pool.coinSymbol, pool.name, pool.algorithm, pool.difficulty, pool.hashRate, pool.totalMiners, pool.rewardPerBlock, pool.blockTime, pool.poolFee, pool.isActive]
    );
    
    const newPool = await this.db.get(
      'SELECT * FROM mining_pools WHERE id = ?',
      [result.lastID]
    );
    
    return newPool;
  }

  async getMiningPools(isActive?: boolean): Promise<MiningPool[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM mining_pools';
    const params: any[] = [];
    
    if (isActive !== undefined) {
      query += ' WHERE isActive = ?';
      params.push(isActive);
    }
    
    query += ' ORDER BY coinSymbol';
    
    const pools = await this.db.all(query, params);
    return pools;
  }

  async getMiningPoolByCoin(coinSymbol: string): Promise<MiningPool | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const pool = await this.db.get(
      'SELECT * FROM mining_pools WHERE coinSymbol = ?',
      [coinSymbol]
    );
    
    return pool || null;
  }

  async updateMiningPool(id: number, updates: Partial<MiningPool>): Promise<MiningPool | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!setClause) return null;
    
    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'createdAt')
      .map(([, value]) => value);
    
    await this.db.run(
      `UPDATE mining_pools SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );
    
    const pool = await this.db.get(
      'SELECT * FROM mining_pools WHERE id = ?',
      [id]
    );
    
    return pool || null;
  }

  // Mining Session methods
  async createMiningSession(session: Omit<MiningSession, 'id' | 'createdAt' | 'updatedAt'>): Promise<MiningSession> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      `INSERT INTO mining_sessions (userId, poolId, coinSymbol, hashPower, status, startedAt, totalEarnings)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [session.userId, session.poolId, session.coinSymbol, session.hashPower, session.status, session.startedAt, session.totalEarnings]
    );
    
    const newSession = await this.db.get(
      'SELECT * FROM mining_sessions WHERE id = ?',
      [result.lastID]
    );
    
    return newSession;
  }

  async getMiningSessionsByUser(userId: number, status?: string): Promise<MiningSession[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM mining_sessions WHERE userId = ?';
    const params: any[] = [userId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY startedAt DESC';
    
    const sessions = await this.db.all(query, params);
    return sessions;
  }

  async getActiveMiningSession(userId: number, coinSymbol: string): Promise<MiningSession | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const session = await this.db.get(
      'SELECT * FROM mining_sessions WHERE userId = ? AND coinSymbol = ? AND status = ? ORDER BY startedAt DESC LIMIT 1',
      [userId, coinSymbol, 'active']
    );
    
    return session || null;
  }

  async updateMiningSession(id: number, updates: Partial<MiningSession>): Promise<MiningSession | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!setClause) return null;
    
    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'createdAt')
      .map(([, value]) => value);
    
    await this.db.run(
      `UPDATE mining_sessions SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );
    
    const session = await this.db.get(
      'SELECT * FROM mining_sessions WHERE id = ?',
      [id]
    );
    
    return session || null;
  }

  async getActiveMiningSessionsByUser(userId: number): Promise<MiningSession[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const sessions = await this.db.all(
      'SELECT * FROM mining_sessions WHERE userId = ? AND status = ? ORDER BY startedAt DESC',
      [userId, 'active']
    );
    
    return sessions;
  }

  async getActiveMiningSessionsByCoin(coinSymbol: string): Promise<MiningSession[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const sessions = await this.db.all(
      'SELECT * FROM mining_sessions WHERE coinSymbol = ? AND status = ? ORDER BY startedAt DESC',
      [coinSymbol, 'active']
    );
    
    return sessions;
  }

  // Mining Earning methods
  async createMiningEarning(earning: Omit<MiningEarning, 'id' | 'createdAt'>): Promise<MiningEarning> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      `INSERT INTO mining_earnings (userId, sessionId, poolId, coinSymbol, amount, hashPower, blockHeight, earnedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [earning.userId, earning.sessionId, earning.poolId, earning.coinSymbol, earning.amount, earning.hashPower, earning.blockHeight, earning.earnedAt]
    );
    
    const newEarning = await this.db.get(
      'SELECT * FROM mining_earnings WHERE id = ?',
      [result.lastID]
    );
    
    return newEarning;
  }

  async getMiningEarningsByUser(userId: number, coinSymbol?: string, limit?: number): Promise<MiningEarning[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM mining_earnings WHERE userId = ?';
    const params: any[] = [userId];
    
    if (coinSymbol) {
      query += ' AND coinSymbol = ?';
      params.push(coinSymbol);
    }
    
    query += ' ORDER BY earnedAt DESC';
    
    if (limit) {
      query += ' LIMIT ?';
      params.push(limit);
    }
    
    const earnings = await this.db.all(query, params);
    return earnings;
  }

  async getTotalEarningsByCoin(userId: number, coinSymbol: string): Promise<number> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.get(
      'SELECT SUM(amount) as totalEarnings FROM mining_earnings WHERE userId = ? AND coinSymbol = ?',
      [userId, coinSymbol]
    );
    
    return result?.totalEarnings || 0;
  }

  // Mining Withdrawal methods
  async createMiningWithdrawal(withdrawal: Omit<MiningWithdrawal, 'id' | 'createdAt'>): Promise<MiningWithdrawal> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      `INSERT INTO mining_withdrawals (userId, coinSymbol, amount, toAddress, status, fee)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [withdrawal.userId, withdrawal.coinSymbol, withdrawal.amount, withdrawal.toAddress, withdrawal.status, withdrawal.fee]
    );
    
    const newWithdrawal = await this.db.get(
      'SELECT * FROM mining_withdrawals WHERE id = ?',
      [result.lastID]
    );
    
    return newWithdrawal;
  }

  async getMiningWithdrawalsByUser(userId: number, status?: string): Promise<MiningWithdrawal[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM mining_withdrawals WHERE userId = ?';
    const params: any[] = [userId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY createdAt DESC';
    
    const withdrawals = await this.db.all(query, params);
    return withdrawals;
  }

  async updateMiningWithdrawal(id: number, updates: Partial<MiningWithdrawal>): Promise<MiningWithdrawal | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!setClause) return null;
    
    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'createdAt')
      .map(([, value]) => value);
    
    await this.db.run(
      `UPDATE mining_withdrawals SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    
    const withdrawal = await this.db.get(
      'SELECT * FROM mining_withdrawals WHERE id = ?',
      [id]
    );
    
    return withdrawal || null;
  }

  // Gift Card Product methods
  async createGiftCardProduct(product: Omit<GiftCardProduct, 'id' | 'createdAt' | 'updatedAt'>): Promise<GiftCardProduct> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      `INSERT INTO gift_card_products (cardType, name, description, brand, category, faceValue, price, discountRate, imageUrl, isAvailable, stock, validityDays, minPurchase, maxPurchase)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [product.cardType, product.name, product.description, product.brand, product.category, product.faceValue, product.price, product.discountRate, product.imageUrl, product.isAvailable, product.stock, product.validityDays, product.minPurchase, product.maxPurchase]
    );
    
    const newProduct = await this.db.get(
      'SELECT * FROM gift_card_products WHERE id = ?',
      [result.lastID]
    );
    
    return newProduct;
  }

  async getGiftCardProducts(filters?: { cardType?: string; brand?: string; category?: string; isAvailable?: boolean }): Promise<GiftCardProduct[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM gift_card_products WHERE 1=1';
    const params: any[] = [];
    
    if (filters?.cardType) {
      query += ' AND cardType = ?';
      params.push(filters.cardType);
    }
    
    if (filters?.brand) {
      query += ' AND brand = ?';
      params.push(filters.brand);
    }
    
    if (filters?.category) {
      query += ' AND category = ?';
      params.push(filters.category);
    }
    
    if (filters?.isAvailable !== undefined) {
      query += ' AND isAvailable = ?';
      params.push(filters.isAvailable);
    }
    
    query += ' ORDER BY brand, name';
    
    const products = await this.db.all(query, params);
    return products;
  }

  async getGiftCardProductById(id: number): Promise<GiftCardProduct | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const product = await this.db.get(
      'SELECT * FROM gift_card_products WHERE id = ?',
      [id]
    );
    
    return product || null;
  }

  async updateGiftCardProduct(id: number, updates: Partial<GiftCardProduct>): Promise<GiftCardProduct | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!setClause) return null;
    
    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'createdAt')
      .map(([, value]) => value);
    
    await this.db.run(
      `UPDATE gift_card_products SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );
    
    const updatedProduct = await this.db.get(
      'SELECT * FROM gift_card_products WHERE id = ?',
      [id]
    );
    
    return updatedProduct;
  }

  // Gift Card methods
  async createGiftCard(giftCard: Omit<GiftCard, 'id' | 'createdAt' | 'updatedAt'>): Promise<GiftCard> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      `INSERT INTO gift_cards (userId, productId, cardType, cardNumber, pin, faceValue, currentBalance, status, purchaseDate, expiryDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [giftCard.userId, giftCard.productId, giftCard.cardType, giftCard.cardNumber, giftCard.pin, giftCard.faceValue, giftCard.currentBalance, giftCard.status, giftCard.purchaseDate, giftCard.expiryDate]
    );
    
    const newGiftCard = await this.db.get(
      'SELECT * FROM gift_cards WHERE id = ?',
      [result.lastID]
    );
    
    return newGiftCard;
  }

  async getGiftCardsByUser(userId: number, status?: string): Promise<GiftCard[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    let query = 'SELECT * FROM gift_cards WHERE userId = ?';
    const params: any[] = [userId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY createdAt DESC';
    
    const giftCards = await this.db.all(query, params);
    return giftCards;
  }

  async getGiftCardByCardNumber(cardNumber: string): Promise<GiftCard | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const giftCard = await this.db.get(
      'SELECT * FROM gift_cards WHERE cardNumber = ?',
      [cardNumber]
    );
    
    return giftCard || null;
  }

  async updateGiftCard(id: number, updates: Partial<GiftCard>): Promise<GiftCard | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!setClause) return null;
    
    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'createdAt')
      .map(([, value]) => value);
    
    await this.db.run(
      `UPDATE gift_cards SET ${setClause}, updatedAt = CURRENT_TIMESTAMP WHERE id = ?`,
      [...values, id]
    );
    
    const updatedGiftCard = await this.db.get(
      'SELECT * FROM gift_cards WHERE id = ?',
      [id]
    );
    
    return updatedGiftCard;
  }

  // Gift Card Purchase methods
  async createGiftCardPurchase(purchase: Omit<GiftCardPurchase, 'id' | 'createdAt'>): Promise<GiftCardPurchase> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      `INSERT INTO gift_card_purchases (userId, productId, quantity, totalAmount, paymentMethod, status, transactionId)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [purchase.userId, purchase.productId, purchase.quantity, purchase.totalAmount, purchase.paymentMethod, purchase.status, purchase.transactionId]
    );
    
    const newPurchase = await this.db.get(
      'SELECT * FROM gift_card_purchases WHERE id = ?',
      [result.lastID]
    );
    
    return newPurchase;
  }

  async getGiftCardPurchasesByUser(userId: number): Promise<GiftCardPurchase[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const purchases = await this.db.all(
      'SELECT * FROM gift_card_purchases WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    
    return purchases;
  }

  async updateGiftCardPurchase(id: number, updates: Partial<GiftCardPurchase>): Promise<GiftCardPurchase | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!setClause) return null;
    
    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'createdAt')
      .map(([, value]) => value);
    
    await this.db.run(
      `UPDATE gift_card_purchases SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    
    const updatedPurchase = await this.db.get(
      'SELECT * FROM gift_card_purchases WHERE id = ?',
      [id]
    );
    
    return updatedPurchase;
  }

  // Gift Card Transaction methods
  async createGiftCardTransaction(transaction: Omit<GiftCardTransaction, 'id' | 'createdAt'>): Promise<GiftCardTransaction> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      `INSERT INTO gift_card_transactions (giftCardId, userId, type, amount, merchantInfo, description, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [transaction.giftCardId, transaction.userId, transaction.type, transaction.amount, transaction.merchantInfo, transaction.description, transaction.status]
    );
    
    const newTransaction = await this.db.get(
      'SELECT * FROM gift_card_transactions WHERE id = ?',
      [result.lastID]
    );
    
    return newTransaction;
  }

  async getGiftCardTransactionsByCard(giftCardId: number): Promise<GiftCardTransaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transactions = await this.db.all(
      'SELECT * FROM gift_card_transactions WHERE giftCardId = ? ORDER BY createdAt DESC',
      [giftCardId]
    );
    
    return transactions;
  }

  async getGiftCardTransactionsByUser(userId: number): Promise<GiftCardTransaction[]> {
    if (!this.db) throw new Error('Database not initialized');
    
    const transactions = await this.db.all(
      'SELECT * FROM gift_card_transactions WHERE userId = ? ORDER BY createdAt DESC',
      [userId]
    );
    
    return transactions;
  }

  // QR Transaction methods
  async createQRTransaction(qrTransaction: Omit<QRTransaction, 'id' | 'createdAt'>): Promise<QRTransaction> {
    if (!this.db) throw new Error('Database not initialized');
    
    const result = await this.db.run(
      `INSERT INTO qr_transactions (giftCardId, userId, amount, qrCode, expiresAt, status, merchantInfo)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [qrTransaction.giftCardId, qrTransaction.userId, qrTransaction.amount, qrTransaction.qrCode, qrTransaction.expiresAt, qrTransaction.status, qrTransaction.merchantInfo]
    );
    
    const newQRTransaction = await this.db.get(
      'SELECT * FROM qr_transactions WHERE id = ?',
      [result.lastID]
    );
    
    return newQRTransaction;
  }

  async getQRTransactionByCode(qrCode: string): Promise<QRTransaction | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const qrTransaction = await this.db.get(
      'SELECT * FROM qr_transactions WHERE qrCode = ?',
      [qrCode]
    );
    
    return qrTransaction || null;
  }

  async updateQRTransaction(id: number, updates: Partial<QRTransaction>): Promise<QRTransaction | null> {
    if (!this.db) throw new Error('Database not initialized');
    
    const setClause = Object.keys(updates)
      .filter(key => key !== 'id' && key !== 'createdAt')
      .map(key => `${key} = ?`)
      .join(', ');
    
    if (!setClause) return null;
    
    const values = Object.entries(updates)
      .filter(([key]) => key !== 'id' && key !== 'createdAt')
      .map(([, value]) => value);
    
    await this.db.run(
      `UPDATE qr_transactions SET ${setClause} WHERE id = ?`,
      [...values, id]
    );
    
    const updatedQRTransaction = await this.db.get(
      'SELECT * FROM qr_transactions WHERE id = ?',
      [id]
    );
    
    return updatedQRTransaction;
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      this.db = null;
    }
  }
}

export const dbManager = new DatabaseManager();
export { DatabaseManager };
export default dbManager;