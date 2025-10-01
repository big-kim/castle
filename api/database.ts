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