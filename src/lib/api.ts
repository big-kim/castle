// API configuration and utility functions - 더미 응답으로 대체
const API_BASE_URL = '/api';

// 더미 데이터 생성 함수
const createDummyResponse = (data: any) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        data: {
          success: true,
          data: data
        }
      });
    }, 300); // 네트워크 지연 시뮬레이션
  });
};

// Generic API request function - 더미 응답 반환
export const api = {
  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    console.log(`[DUMMY API] ${options.method || 'GET'} ${endpoint}`);
    
    // 더미 응답 생성
    const dummyData = {
      success: true,
      message: 'Success',
      data: {}
    };
    
    return createDummyResponse(dummyData) as Promise<T>;
  },

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  },

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  },

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  },
};

// Wallet API endpoints - 더미 데이터 반환
export const walletApi = {
  // BNB Wallet
  getBNBWallet: async () => {
    console.log('[DUMMY API] GET /wallet/bnb');
    return createDummyResponse({
      balance: '1.2345',
      address: '0x1234567890abcdef1234567890abcdef12345678',
      usdValue: 312.45
    });
  },
  
  sendBNB: async (to: string, amount: number, memo?: string) => {
    console.log(`[DUMMY API] POST /wallet/bnb/send - to: ${to}, amount: ${amount}`);
    return createDummyResponse({
      txHash: '0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890',
      success: true
    });
  },
  
  getBNBTransactions: async (limit?: number) => {
    console.log(`[DUMMY API] GET /wallet/bnb/transactions - limit: ${limit}`);
    return createDummyResponse([
      {
        id: '1',
        type: 'receive',
        amount: '0.5',
        from: '0xabcdef1234567890abcdef1234567890abcdef12',
        timestamp: new Date().toISOString(),
        txHash: '0x123...'
      }
    ]);
  },
  
  // Point Wallets
  getPointWallets: async () => {
    console.log('[DUMMY API] GET /wallet/points');
    return createDummyResponse([
      { coinSymbol: 'BTC', balance: '0.001', usdValue: 45.67 },
      { coinSymbol: 'ETH', balance: '0.1', usdValue: 234.56 }
    ]);
  },
  
  withdrawPoints: async (coinSymbol: string, amount: number, to: string) => {
    console.log(`[DUMMY API] POST /wallet/points/withdraw - ${coinSymbol}: ${amount}`);
    return createDummyResponse({ success: true });
  },
  
  addMiningEarnings: async (coinSymbol: string, amount: number) => {
    console.log(`[DUMMY API] POST /wallet/points/earn - ${coinSymbol}: ${amount}`);
    return createDummyResponse({ success: true });
  },
  
  getPointTransactions: async (coinSymbol?: string, limit?: number) => {
    console.log(`[DUMMY API] GET /wallet/points/transactions - ${coinSymbol}, limit: ${limit}`);
    return createDummyResponse([]);
  },
  
  // NFT Wallet
  getNFTWallet: async () => {
    console.log('[DUMMY API] GET /wallet/nft');
    return createDummyResponse([
      {
        id: '1',
        name: 'Sample NFT',
        image: '/images/sample-nft.png',
        value: 100
      }
    ]);
  },
  
  sendNFT: async (nftId: string, to: string) => {
    console.log(`[DUMMY API] POST /wallet/nft/send - NFT: ${nftId} to ${to}`);
    return createDummyResponse({ success: true });
  },
  
  buyNFT: async (nftType: string, value: number, paymentMethod: string) => {
    console.log(`[DUMMY API] POST /wallet/nft/buy - ${nftType}: ${value}`);
    return createDummyResponse({ success: true });
  },
  
  getNFTTransactions: async (limit?: number) => {
    console.log(`[DUMMY API] GET /wallet/nft/transactions - limit: ${limit}`);
    return createDummyResponse([]);
  },
  
  // QR Code
  generateQR: async (assetType: string, coinType?: string, nftId?: string) => {
    console.log(`[DUMMY API] POST /wallet/qr/generate - ${assetType}`);
    return createDummyResponse({
      qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
    });
  },
};

export default api;