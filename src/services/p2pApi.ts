import type { P2POrder, P2PProductType, TradeMethod, P2PTransaction, UserRating } from '../types';

const API_BASE_URL = 'http://localhost:3004/api';

// Helper function to get auth token
const getAuthToken = () => {
  return localStorage.getItem('token');
};

// Helper function to make authenticated requests
const makeAuthenticatedRequest = async (url: string, options: RequestInit = {}) => {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ message: 'Network error' }));
    throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
  }

  return response.json();
};

export const p2pApi = {
  // Fetch P2P orders with optional filters
  async fetchOrders(filters?: { 
    type?: P2PProductType; 
    tokenSymbol?: string; 
    tradeMethod?: TradeMethod;
    status?: string;
  }): Promise<P2POrder[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.tokenSymbol) params.append('tokenSymbol', filters.tokenSymbol);
    if (filters?.tradeMethod) params.append('tradeMethod', filters.tradeMethod);
    if (filters?.status) params.append('status', filters.status);

    const url = `${API_BASE_URL}/p2p/orders${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await makeAuthenticatedRequest(url);
    return response.data;
  },

  // Fetch user's own orders
  async fetchMyOrders(): Promise<P2POrder[]> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/p2p/orders/my`);
    return response.data;
  },

  // Get a specific order by ID
  async getOrderById(orderId: string): Promise<P2POrder> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/p2p/orders/${orderId}`);
    return response.data;
  },

  // Create a new P2P order
  async createOrder(orderData: {
    type: P2PProductType;
    tokenSymbol: string;
    amount: number;
    price: number;
    tradeMethod: TradeMethod;
    description?: string;
  }): Promise<P2POrder> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/p2p/orders`, {
      method: 'POST',
      body: JSON.stringify(orderData),
    });
    return response.data;
  },

  // Update an existing order
  async updateOrder(orderId: string, updates: Partial<P2POrder>): Promise<void> {
    await makeAuthenticatedRequest(`${API_BASE_URL}/p2p/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  // Delete an order
  async deleteOrder(orderId: string): Promise<void> {
    await makeAuthenticatedRequest(`${API_BASE_URL}/p2p/orders/${orderId}`, {
      method: 'DELETE',
    });
  },

  // Get user's P2P transactions
  async getMyTransactions(): Promise<P2PTransaction[]> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/p2p/transactions/my`);
    return response.data;
  },

  // Create a P2P transaction
  async createTransaction(data: {
    orderId: number;
    amount: number;
    price: number;
  }): Promise<P2PTransaction> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/p2p/transactions`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Update transaction status
  async updateTransactionStatus(transactionId: string, status: string): Promise<void> {
    await makeAuthenticatedRequest(`${API_BASE_URL}/p2p/transactions/${transactionId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Create user rating
  async createRating(data: {
    ratedUserId: number;
    orderId: number;
    rating: number;
    comment?: string;
  }): Promise<UserRating> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/p2p/ratings`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.data;
  },

  // Get user ratings
  async getUserRatings(userId: string): Promise<UserRating[]> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/p2p/ratings/user/${userId}`);
    return response.data;
  },

  // Get user average rating
  async getUserAverageRating(userId: string): Promise<{ averageRating: number; totalRatings: number }> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/p2p/ratings/user/${userId}/average`);
    return response.data;
  },

  // Get order book for a token
  async getOrderBook(tokenSymbol: string): Promise<{ buyOrders: P2POrder[]; sellOrders: P2POrder[] }> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/p2p/orderbook/${tokenSymbol}`);
    return response.data;
  },

  // Find compatible matches for an order
  async findMatches(orderId: string): Promise<P2POrder[]> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/p2p/orders/${orderId}/matches`);
    return response.data;
  },

  // Execute a trade
  async executeTrade(orderId: string, matchOrderId: string, amount: number): Promise<any> {
    const response = await makeAuthenticatedRequest(`${API_BASE_URL}/p2p/orders/${orderId}/execute`, {
      method: 'POST',
      body: JSON.stringify({ matchOrderId, amount }),
    });
    return response.data;
  },
};