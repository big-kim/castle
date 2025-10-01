import { create } from 'zustand';
import type { P2PStore, P2POrder, P2PProductType, TradeMethod, OrderType, P2PTransaction } from '../types';
import { createMockFetch, generateRandomNumber, generateId } from '../utils/mockData';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockP2POrder = (type: OrderType): P2POrder => ({
  id: generateId(),
  userId: generateId(),
  userName: 'User' + Math.floor(Math.random() * 1000),
  userRating: generateRandomNumber(4.0, 5.0),
  productType: 'token' as P2PProductType,
  type,
  tokenSymbol: ['ICC', 'ICS', 'ICG', 'USDT'][Math.floor(Math.random() * 4)] as any,
  paymentTokenSymbol: 'USDT' as any,
  amount: generateRandomNumber(100, 10000),
  price: generateRandomNumber(0.5, 2.0),
  pricePerToken: generateRandomNumber(0.5, 2.0),
  totalValue: 0, // Will be calculated
  paymentMethod: ['Bank Transfer', 'PayPal', 'Cash'][Math.floor(Math.random() * 3)],
  tradeMethod: 'normal' as TradeMethod,
  status: Math.random() > 0.3 ? 'active' : 'completed',
  createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 3600000).toISOString(),
  updatedAt: new Date().toISOString(),
});

const generateMockP2POrders = (count: number = 20): P2POrder[] => {
  return Array.from({ length: count }, () => {
    const order = generateMockP2POrder(Math.random() > 0.5 ? 'buy' : 'sell');
    order.totalValue = order.amount * order.price;
    return order;
  });
};

// ============================================================================
// MOCK API FUNCTIONS
// ============================================================================

const mockFetchP2POrders = createMockFetch(
  (type?: OrderType) => {
    let orders = generateMockP2POrders();
    
    if (type) {
      orders = orders.filter(order => order.type === type);
    }
    
    return orders;
  },
  { delay: [600, 1200] }
);

const mockCreateP2POrder = createMockFetch(
  (orderData: Partial<P2POrder>) => ({
    ...generateMockP2POrder(orderData.type || 'buy'),
    ...orderData,
    id: generateId(),
    status: 'active' as const,
  }),
  { delay: [800, 1500] }
);

const mockUpdateP2POrder = createMockFetch(
  (orderId: string, updates: Partial<P2POrder>) => ({
    success: true,
    orderId,
    updates,
  }),
  { delay: [400, 800] }
);

// ============================================================================
// P2P STORE
// ============================================================================

export const useP2PStore = create<P2PStore>((set, get) => ({
  // State
  orders: [],
  myOrders: [],
  transactions: [],
  isLoading: false,
  error: null,

  // Actions
  fetchOrders: async (type) => {
    set({ isLoading: true, error: null });
    try {
      const orders = await mockFetchP2POrders(type);
      set({ 
        orders, 
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch P2P orders:', error);
      set({ isLoading: false, error: 'Failed to fetch orders' });
    }
  },

  createOrder: async (orderData) => {
    set({ isLoading: true, error: null });
    try {
      // Convert pricePerToken to number if it's a string
      const processedOrderData = {
        ...orderData,
        pricePerToken: typeof orderData.pricePerToken === 'string' 
          ? parseFloat(orderData.pricePerToken) 
          : orderData.pricePerToken
      };
      const newOrder = await mockCreateP2POrder(processedOrderData);
      const { orders, myOrders } = get();
      set({ 
        orders: [newOrder, ...orders],
        myOrders: [newOrder, ...myOrders],
        isLoading: false 
      });
      return newOrder;
    } catch (error) {
      console.error('Failed to create P2P order:', error);
      set({ isLoading: false, error: 'Failed to create order' });
      throw error;
    }
  },

  fetchMyOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      // In a real app, this would fetch user-specific orders
      const myOrders = generateMockP2POrders(5);
      set({ myOrders, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch my P2P orders:', error);
      set({ isLoading: false, error: 'Failed to fetch my orders' });
    }
  },

  cancelOrder: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      await mockUpdateP2POrder(orderId, { status: 'cancelled' });
      const { orders, myOrders } = get();
      
      const updateOrderInArray = (orderArray: P2POrder[]) =>
        orderArray.map(order => 
          order.id === orderId ? { ...order, status: 'cancelled' as const } : order
        );
      
      set({ 
        orders: updateOrderInArray(orders),
        myOrders: updateOrderInArray(myOrders),
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to cancel P2P order:', error);
      set({ isLoading: false, error: 'Failed to cancel order' });
      throw error;
    }
  },

  executeOrder: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      // Mock transaction creation
      const transaction: P2PTransaction = {
        id: generateId(),
        orderId,
        buyerId: 'mock-buyer-id',
        sellerId: 'mock-seller-id',
        amount: 100,
        price: 50,
        status: 'completed',
        createdAt: new Date().toISOString(),
        completedAt: new Date().toISOString()
      };
      
      const { transactions } = get();
      set({ 
        transactions: [transaction, ...transactions],
        isLoading: false 
      });
      return transaction;
    } catch (error) {
      console.error('Failed to execute P2P order:', error);
      set({ isLoading: false, error: 'Failed to execute order' });
      throw error;
    }
  },

  listAsset: async (orderId, tokenAddress, amount) => {
    set({ isLoading: true, error: null });
    try {
      // Mock smart contract interaction
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      set({ isLoading: false });
      return txHash;
    } catch (error) {
      console.error('Failed to list asset:', error);
      set({ isLoading: false, error: 'Failed to list asset' });
      throw error;
    }
  },

  initiateTrade: async (orderId, buyerAddress) => {
    set({ isLoading: true, error: null });
    try {
      // Mock smart contract interaction
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      set({ isLoading: false });
      return txHash;
    } catch (error) {
      console.error('Failed to initiate trade:', error);
      set({ isLoading: false, error: 'Failed to initiate trade' });
      throw error;
    }
  },

  depositAndExecute: async (orderId, paymentAmount) => {
    set({ isLoading: true, error: null });
    try {
      // Mock smart contract interaction
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      set({ isLoading: false });
      return txHash;
    } catch (error) {
      console.error('Failed to deposit and execute:', error);
      set({ isLoading: false, error: 'Failed to deposit and execute' });
      throw error;
    }
  },

  reclaimAsset: async (orderId) => {
    set({ isLoading: true, error: null });
    try {
      // Mock smart contract interaction
      const txHash = `0x${Math.random().toString(16).substr(2, 64)}`;
      set({ isLoading: false });
      return txHash;
    } catch (error) {
      console.error('Failed to reclaim asset:', error);
      set({ isLoading: false, error: 'Failed to reclaim asset' });
      throw error;
    }
  },

  clearError: () => {
    set({ error: null });
  },
}));