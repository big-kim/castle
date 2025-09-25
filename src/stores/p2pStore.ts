import { create } from 'zustand';
import { P2POrder, P2PStore, P2PTransaction, P2POrderForm, TokenSymbol, P2PProductType, TradeMethod, SmartContractStatus } from '../types';

// Mock data for development
let mockOrders: P2POrder[] = [
  {
    id: '1',
    user_id: '2',
    user_name: '이민수',
    user_rating: 4.8,
    type: 'sell',
    product_type: 'token',
    token_symbol: 'ICC',
    payment_token_symbol: 'USDT',
    amount: 100,
    price: 0.5,
    price_per_token: 0.5,
    total_value: 50,
    payment_method: 'Bank Transfer',
    status: 'active',
    trade_method: 'normal',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    user_id: '3',
    user_name: '박지영',
    user_rating: 4.9,
    type: 'buy',
    product_type: 'token',
    token_symbol: 'ICS',
    payment_token_symbol: 'ICC',
    amount: 200,
    price: 0.45,
    price_per_token: 0.45,
    total_value: 90,
    payment_method: 'KakaoPay',
    status: 'active',
    trade_method: 'smart_contract',
    smart_contract_status: 'listed',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    user_id: '4',
    user_name: '최현우',
    user_rating: 4.7,
    type: 'sell',
    product_type: 'nft',
    token_symbol: 'ICC',
    payment_token_symbol: 'USDT',
    amount: 1,
    price: 50,
    price_per_token: 50,
    total_value: 50,
    payment_method: 'Toss',
    status: 'active',
    trade_method: 'smart_contract',
    smart_contract_status: 'listed',
    product_details: {
      name: 'IC 스타벅스 상품권 NFT',
      description: '스타벅스 5만원 상품권 NFT',
      image_url: '/images/starbucks-nft.png',
      nft_contract_address: '0x1234...abcd',
      nft_token_id: '12345',
      brand: 'Starbucks',
      category: 'gift_card'
    },
    created_at: new Date(Date.now() - 10800000).toISOString(),
    updated_at: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: '4',
    user_id: '5',
    user_name: '김소연',
    user_rating: 5.0,
    type: 'sell',
    product_type: 'coupon',
    token_symbol: 'ICC',
    payment_token_symbol: 'USDT',
    amount: 1,
    price: 20,
    price_per_token: 20,
    total_value: 20,
    payment_method: 'Bank Transfer',
    status: 'active',
    trade_method: 'smart_contract',
    smart_contract_status: 'listed',
    product_details: {
      name: '디지털 쿠폰 15%',
      description: '15% 할인 디지털 쿠폰 - IC Castle 플랫폼 내 모든 상품 사용 가능',
      coupon_code: 'IC15OFF2024',
      expiry_date: '발급일로부터 1년',
      usage_location: 'IC Castle 플랫폼 내 모든 상품',
      brand: 'IC Castle',
      category: 'digital_coupon'
    },
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date(Date.now() - 14400000).toISOString(),
  },
  {
    id: '8',
    user_id: '7',
    user_name: '이수진',
    user_rating: 4.8,
    type: 'sell',
    product_type: 'coupon',
    token_symbol: 'ICC',
    payment_token_symbol: 'USDT',
    amount: 1,
    price: 35,
    price_per_token: 35,
    total_value: 35,
    payment_method: 'KakaoPay',
    status: 'active',
    trade_method: 'smart_contract',
    smart_contract_status: 'listed',
    product_details: {
      name: '디지털 쿠폰 20%',
      description: '20% 할인 디지털 쿠폰 - IC Castle 플랫폼 내 모든 상품 사용 가능',
      coupon_code: 'IC20OFF2024',
      expiry_date: '발급일로부터 1년',
      usage_location: 'IC Castle 플랫폼 내 모든 상품',
      brand: 'IC Castle',
      category: 'digital_coupon'
    },
    created_at: new Date(Date.now() - 21600000).toISOString(),
    updated_at: new Date(Date.now() - 21600000).toISOString(),
  },
  {
    id: '9',
    user_id: '8',
    user_name: '박준혁',
    user_rating: 4.9,
    type: 'sell',
    product_type: 'coupon',
    token_symbol: 'ICC',
    payment_token_symbol: 'USDT',
    amount: 1,
    price: 65,
    price_per_token: 65,
    total_value: 65,
    payment_method: 'Toss',
    status: 'active',
    trade_method: 'smart_contract',
    smart_contract_status: 'listed',
    product_details: {
      name: '디지털 쿠폰 30%',
      description: '30% 할인 디지털 쿠폰 - IC Castle 플랫폼 내 모든 상품 사용 가능',
      coupon_code: 'IC30OFF2024',
      expiry_date: '발급일로부터 1년',
      usage_location: 'IC Castle 플랫폼 내 모든 상품',
      brand: 'IC Castle',
      category: 'digital_coupon'
    },
    created_at: new Date(Date.now() - 25200000).toISOString(),
    updated_at: new Date(Date.now() - 25200000).toISOString(),
  },
  {
    id: '5',
    user_id: '6',
    user_name: '정민호',
    user_rating: 4.6,
    type: 'sell',
    product_type: 'other',
    token_symbol: 'ICC',
    payment_token_symbol: 'USDT',
    amount: 1,
    price: 100,
    price_per_token: 100,
    total_value: 100,
    payment_method: 'KakaoPay',
    status: 'active',
    trade_method: 'normal',
    product_details: {
      name: '아이폰 15 케이스',
      description: '새상품 아이폰 15용 실리콘 케이스 (블랙)',
      image_url: '/images/iphone-case.jpg',
      brand: 'Apple',
      category: 'accessories'
    },
    created_at: new Date(Date.now() - 18000000).toISOString(),
    updated_at: new Date(Date.now() - 18000000).toISOString(),
  },
];

const mockMyOrders: P2POrder[] = [
  {
    id: '6',
    user_id: '1',
    user_name: '김태열',
    user_rating: 4.5,
    type: 'sell',
    product_type: 'token',
    token_symbol: 'ICC',
    payment_token_symbol: 'USDT',
    amount: 150,
    price: 0.48,
    price_per_token: 0.48,
    total_value: 72,
    payment_method: 'Bank Transfer',
    status: 'active',
    trade_method: 'normal',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '7',
    user_id: '1',
    user_name: '김태열',
    user_rating: 4.5,
    type: 'buy',
    product_type: 'token',
    token_symbol: 'ICS',
    payment_token_symbol: 'ICC',
    amount: 300,
    price: 0.42,
    price_per_token: 0.42,
    total_value: 126,
    payment_method: 'KakaoPay',
    status: 'completed',
    trade_method: 'smart_contract',
    smart_contract_status: 'completed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

const mockTransactions: P2PTransaction[] = [
  {
    id: '1',
    order_id: '6',
    buyer_id: '1',
    seller_id: '3',
    amount: 300,
    price: 0.42,
    status: 'completed',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    completed_at: new Date(Date.now() - 3600000).toISOString(),
  },
];

// Mock API functions
const mockFetchOrders = async (type?: 'sell' | 'buy'): Promise<P2POrder[]> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  
  if (type) {
    return mockOrders.filter(order => order.type === type && order.status === 'active');
  }
  
  return mockOrders.filter(order => order.status === 'active');
};

const mockFetchMyOrders = async (): Promise<P2POrder[]> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  return mockOrders.filter(order => order.user_id === '1');
};

const mockCreateOrder = async (orderForm: P2POrderForm): Promise<P2POrder> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Convert price_per_token from string to number if needed
  const pricePerToken = typeof orderForm.price_per_token === 'string' 
    ? parseFloat(orderForm.price_per_token) 
    : orderForm.price_per_token;
  
  // Ensure we have valid numbers for calculation
  const validPrice = isNaN(pricePerToken) ? 0 : pricePerToken;
  const validAmount = isNaN(orderForm.amount) ? 0 : orderForm.amount;
  
  const newOrder: P2POrder = {
    id: Date.now().toString(),
    user_id: '1',
    user_name: '김태열',
    user_rating: 4.5,
    type: orderForm.type,
    product_type: orderForm.product_type,
    token_symbol: orderForm.token_symbol,
    payment_token_symbol: orderForm.payment_token_symbol,
    amount: validAmount,
    price: validPrice,
    price_per_token: validPrice,
    total_value: validAmount * validPrice,
    payment_method: orderForm.payment_method,
    status: 'active',
    trade_method: orderForm.trade_method || 'normal',
    smart_contract_status: orderForm.trade_method === 'smart_contract' ? 'listed' : undefined,
    product_details: orderForm.product_details,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  // Add to global mock orders array
  mockOrders = [newOrder, ...mockOrders];
  
  return newOrder;
};

const mockCancelOrder = async (orderId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const orderIndex = mockOrders.findIndex(order => order.id === orderId);
  if (orderIndex !== -1) {
    mockOrders[orderIndex].status = 'cancelled';
    mockOrders[orderIndex].smart_contract_status = 'canceled';
    mockOrders[orderIndex].updated_at = new Date().toISOString();
  }
};

const mockExecuteOrder = async (orderId: string, amount: number): Promise<P2PTransaction> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  const order = mockOrders.find(order => order.id === orderId);
  if (order) {
    order.status = 'completed';
    order.smart_contract_status = 'completed';
    order.updated_at = new Date().toISOString();
  }
  
  // Create and return a transaction record
  const transaction: P2PTransaction = {
    id: `tx_${Date.now()}`,
    order_id: orderId,
    buyer_id: '1',
    seller_id: order?.user_id || 'unknown',
    amount: amount,
    price: order?.price || 0,
    status: 'completed',
    created_at: new Date().toISOString(),
    completed_at: new Date().toISOString(),
  };
  
  return transaction;
};

// Smart Contract Mock Functions
const mockListAsset = async (orderId: string, tokenAddress: string, amount: number): Promise<string> => {
  // Simulate blockchain transaction delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const order = mockOrders.find(order => order.id === orderId);
  if (order) {
    order.smart_contract_status = 'listed';
    order.updated_at = new Date().toISOString();
  }
  
  return `0x${Math.random().toString(16).substr(2, 64)}`; // Mock transaction hash
};

const mockInitiateTrade = async (orderId: string, buyerAddress: string): Promise<string> => {
  // Simulate blockchain transaction delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const order = mockOrders.find(order => order.id === orderId);
  if (order) {
    order.smart_contract_status = 'pending';
    order.updated_at = new Date().toISOString();
  }
  
  return `0x${Math.random().toString(16).substr(2, 64)}`; // Mock transaction hash
};

const mockDepositAndExecute = async (orderId: string, paymentAmount: number): Promise<string> => {
  // Simulate blockchain transaction delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const order = mockOrders.find(order => order.id === orderId);
  if (order) {
    order.smart_contract_status = 'completed';
    order.status = 'completed';
    order.updated_at = new Date().toISOString();
  }
  
  return `0x${Math.random().toString(16).substr(2, 64)}`; // Mock transaction hash
};

const mockReclaimAsset = async (orderId: string): Promise<string> => {
  // Simulate blockchain transaction delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  const order = mockOrders.find(order => order.id === orderId);
  if (order) {
    order.smart_contract_status = 'canceled';
    order.status = 'cancelled';
    order.updated_at = new Date().toISOString();
  }
  
  return `0x${Math.random().toString(16).substr(2, 64)}`; // Mock transaction hash
};

export const useP2PStore = create<P2PStore>((set, get) => ({
  orders: [],
  myOrders: [],
  transactions: [],
  isLoading: false,
  error: null,

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const orders = await mockFetchOrders();
      set({ orders, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch orders', isLoading: false });
    }
  },

  fetchMyOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const myOrders = await mockFetchMyOrders();
      set({ myOrders, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to fetch my orders', isLoading: false });
    }
  },

  createOrder: async (orderData: P2POrderForm) => {
    set({ isLoading: true, error: null });
    try {
      const newOrder = await mockCreateOrder(orderData);
      const currentOrders = get().orders;
      set({ orders: [newOrder, ...currentOrders], isLoading: false });
      return newOrder;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to create order', isLoading: false });
      throw error;
    }
  },

  cancelOrder: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      await mockCancelOrder(orderId);
      const currentOrders = get().orders;
      const updatedOrders = currentOrders.map(order => 
        order.id === orderId ? { ...order, status: 'cancelled' as const, smart_contract_status: 'canceled' as const } : order
      );
      set({ orders: updatedOrders, isLoading: false });
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to cancel order', isLoading: false });
      throw error;
    }
  },

  executeOrder: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      const order = get().orders.find(o => o.id === orderId);
      if (!order) {
        throw new Error('Order not found');
      }
      const transaction = await mockExecuteOrder(orderId, order.total_value);
      const currentOrders = get().orders;
      const currentTransactions = get().transactions;
      
      const updatedOrders = currentOrders.map(order => 
        order.id === orderId ? { ...order, status: 'completed' as const, smart_contract_status: 'completed' as const } : order
      );
      
      set({ 
        orders: updatedOrders, 
        transactions: [transaction, ...currentTransactions],
        isLoading: false 
      });
      return transaction;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to execute order', isLoading: false });
      throw error;
    }
  },

  // Smart Contract Functions
  listAsset: async (orderId: string, tokenAddress: string, amount: number) => {
    set({ isLoading: true, error: null });
    try {
      const txHash = await mockListAsset(orderId, tokenAddress, amount);
      const currentOrders = get().orders;
      const updatedOrders = currentOrders.map(order => 
        order.id === orderId ? { ...order, smart_contract_status: 'listed' as const } : order
      );
      set({ orders: updatedOrders, isLoading: false });
      return txHash;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to list asset', isLoading: false });
      throw error;
    }
  },

  initiateTrade: async (orderId: string, buyerAddress: string) => {
    set({ isLoading: true, error: null });
    try {
      const txHash = await mockInitiateTrade(orderId, buyerAddress);
      const currentOrders = get().orders;
      const updatedOrders = currentOrders.map(order => 
        order.id === orderId ? { ...order, smart_contract_status: 'pending' as const } : order
      );
      set({ orders: updatedOrders, isLoading: false });
      return txHash;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to initiate trade', isLoading: false });
      throw error;
    }
  },

  depositAndExecute: async (orderId: string, paymentAmount: number) => {
    set({ isLoading: true, error: null });
    try {
      const txHash = await mockDepositAndExecute(orderId, paymentAmount);
      const currentOrders = get().orders;
      const updatedOrders = currentOrders.map(order => 
        order.id === orderId ? { ...order, smart_contract_status: 'completed' as const, status: 'completed' as const } : order
      );
      set({ orders: updatedOrders, isLoading: false });
      return txHash;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to deposit and execute', isLoading: false });
      throw error;
    }
  },

  reclaimAsset: async (orderId: string) => {
    set({ isLoading: true, error: null });
    try {
      const txHash = await mockReclaimAsset(orderId);
      const currentOrders = get().orders;
      const updatedOrders = currentOrders.map(order => 
        order.id === orderId ? { ...order, smart_contract_status: 'canceled' as const, status: 'cancelled' as const } : order
      );
      set({ orders: updatedOrders, isLoading: false });
      return txHash;
    } catch (error) {
      set({ error: error instanceof Error ? error.message : 'Failed to reclaim asset', isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null })
}));