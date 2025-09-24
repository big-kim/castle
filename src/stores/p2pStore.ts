import { create } from 'zustand';
import type { P2POrder, P2PStore, P2POrderForm, P2PTransaction, TokenSymbol } from '../types';

// Mock data for development
const mockOrders: P2POrder[] = [
  {
    id: '1',
    user_id: '2',
    user_name: '이민수',
    user_rating: 4.8,
    type: 'sell',
    token_symbol: 'ICC',
    amount: 100,
    price: 0.5,
    price_per_token: 0.5,
    total_value: 50,
    payment_method: 'Bank Transfer',
    status: 'active',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: '2',
    user_id: '3',
    user_name: '박지영',
    user_rating: 4.9,
    type: 'buy',
    token_symbol: 'ICS',
    amount: 200,
    price: 0.45,
    price_per_token: 0.45,
    total_value: 90,
    payment_method: 'KakaoPay',
    status: 'active',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
  },
  {
    id: '3',
    user_id: '4',
    user_name: '최현우',
    user_rating: 4.7,
    type: 'sell',
    token_symbol: 'ICG',
    amount: 50,
    price: 0.52,
    price_per_token: 0.52,
    total_value: 26,
    payment_method: 'Toss',
    status: 'active',
    created_at: new Date(Date.now() - 10800000).toISOString(),
    updated_at: new Date(Date.now() - 10800000).toISOString(),
  },
  {
    id: '4',
    user_id: '5',
    user_name: '김소연',
    user_rating: 5.0,
    type: 'buy',
    token_symbol: 'USDT',
    amount: 1000,
    price: 1.0,
    price_per_token: 1.0,
    total_value: 1000,
    payment_method: 'Bank Transfer',
    status: 'active',
    created_at: new Date(Date.now() - 14400000).toISOString(),
    updated_at: new Date(Date.now() - 14400000).toISOString(),
  },
];

const mockMyOrders: P2POrder[] = [
  {
    id: '5',
    user_id: '1',
    user_name: '김태열',
    user_rating: 4.5,
    type: 'sell',
    token_symbol: 'ICC',
    amount: 150,
    price: 0.48,
    price_per_token: 0.48,
    total_value: 72,
    payment_method: 'Bank Transfer',
    status: 'active',
    created_at: new Date(Date.now() - 1800000).toISOString(),
    updated_at: new Date(Date.now() - 1800000).toISOString(),
  },
  {
    id: '6',
    user_id: '1',
    user_name: '김태열',
    user_rating: 4.5,
    type: 'buy',
    token_symbol: 'ICS',
    amount: 300,
    price: 0.42,
    price_per_token: 0.42,
    total_value: 126,
    payment_method: 'KakaoPay',
    status: 'completed',
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
  await new Promise(resolve => setTimeout(resolve, 600));
  return mockMyOrders;
};

const mockCreateOrder = async (orderForm: P2POrderForm): Promise<P2POrder> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newOrder: P2POrder = {
    id: Date.now().toString(),
    user_id: '1',
    user_name: '김태열',
    user_rating: 4.5,
    type: orderForm.type,
    token_symbol: orderForm.token_symbol,
    amount: orderForm.amount,
    price: orderForm.price,
    price_per_token: orderForm.price,
    total_value: orderForm.amount * orderForm.price,
    payment_method: 'Bank Transfer',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  return newOrder;
};

const mockCancelOrder = async (orderId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  // Simulate order cancellation
};

const mockExecuteOrder = async (orderId: string, amount: number): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 1500));
  // Simulate order execution with smart contract
};

export const useP2PStore = create<P2PStore>((set, get) => ({
  orders: [],
  myOrders: [],
  transactions: [],
  isLoading: false,

  fetchOrders: async (type?: 'sell' | 'buy') => {
    set({ isLoading: true });
    try {
      const orders = await mockFetchOrders(type);
      set({ orders, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch P2P orders:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchMyOrders: async () => {
    set({ isLoading: true });
    try {
      const myOrders = await mockFetchMyOrders();
      set({ myOrders, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch my orders:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  createOrder: async (orderForm: P2POrderForm) => {
    set({ isLoading: true });
    try {
      const newOrder = await mockCreateOrder(orderForm);
      const { myOrders } = get();
      set({ 
        myOrders: [newOrder, ...myOrders],
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to create order:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  cancelOrder: async (orderId: string) => {
    set({ isLoading: true });
    try {
      await mockCancelOrder(orderId);
      const { myOrders } = get();
      const updatedOrders = myOrders.map(order => 
        order.id === orderId 
          ? { ...order, status: 'cancelled' as const, updated_at: new Date().toISOString() }
          : order
      );
      set({ myOrders: updatedOrders, isLoading: false });
    } catch (error) {
      console.error('Failed to cancel order:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  executeOrder: async (orderId: string, amount: number) => {
    set({ isLoading: true });
    try {
      await mockExecuteOrder(orderId, amount);
      // Refresh orders after execution
      await get().fetchOrders();
      set({ isLoading: false });
    } catch (error) {
      console.error('Failed to execute order:', error);
      set({ isLoading: false });
      throw error;
    }
  },
}));