import { create } from 'zustand';
import type { P2PStore, P2POrder, P2PProductType, TradeMethod } from '../types';
import { createMockFetch, generateRandomNumber, generateId } from '../utils/mockData';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockP2POrder = (type: P2PProductType): P2POrder => ({
  id: generateId(),
  userId: generateId(),
  type,
  tokenSymbol: ['ICC', 'ICS', 'ICG', 'USDT'][Math.floor(Math.random() * 4)] as any,
  amount: generateRandomNumber(100, 10000),
  price: generateRandomNumber(0.5, 2.0),
  totalValue: 0, // Will be calculated
  tradeMethod: ['bank_transfer', 'paypal', 'cash'][Math.floor(Math.random() * 3)] as TradeMethod,
  status: Math.random() > 0.3 ? 'active' : 'completed',
  createdAt: new Date(Date.now() - Math.random() * 7 * 24 * 3600000).toISOString(),
  updatedAt: new Date().toISOString(),
  userRating: generateRandomNumber(4.0, 5.0),
  completedTrades: generateRandomNumber(10, 500),
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
  (filters?: { type?: P2PProductType; tokenSymbol?: string; tradeMethod?: TradeMethod }) => {
    let orders = generateMockP2POrders();
    
    if (filters?.type) {
      orders = orders.filter(order => order.type === filters.type);
    }
    if (filters?.tokenSymbol) {
      orders = orders.filter(order => order.tokenSymbol === filters.tokenSymbol);
    }
    if (filters?.tradeMethod) {
      orders = orders.filter(order => order.tradeMethod === filters.tradeMethod);
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
  isLoading: false,
  currentFilters: {
    type: 'buy',
    tokenSymbol: 'ICC',
    tradeMethod: undefined,
  },

  // Actions
  fetchOrders: async (filters) => {
    set({ isLoading: true });
    try {
      const orders = await mockFetchP2POrders(filters);
      set({ 
        orders, 
        currentFilters: { ...get().currentFilters, ...filters },
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to fetch P2P orders:', error);
      set({ isLoading: false });
    }
  },

  createOrder: async (orderData) => {
    set({ isLoading: true });
    try {
      const newOrder = await mockCreateP2POrder(orderData);
      const { orders, myOrders } = get();
      set({ 
        orders: [newOrder, ...orders],
        myOrders: [newOrder, ...myOrders],
        isLoading: false 
      });
      return newOrder;
    } catch (error) {
      console.error('Failed to create P2P order:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  updateOrder: async (orderId, updates) => {
    set({ isLoading: true });
    try {
      await mockUpdateP2POrder(orderId, updates);
      const { orders, myOrders } = get();
      
      const updateOrderInArray = (orderArray: P2POrder[]) =>
        orderArray.map(order => 
          order.id === orderId ? { ...order, ...updates } : order
        );
      
      set({ 
        orders: updateOrderInArray(orders),
        myOrders: updateOrderInArray(myOrders),
        isLoading: false 
      });
    } catch (error) {
      console.error('Failed to update P2P order:', error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchMyOrders: async () => {
    set({ isLoading: true });
    try {
      // In a real app, this would fetch user-specific orders
      const myOrders = generateMockP2POrders(5);
      set({ myOrders, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch my P2P orders:', error);
      set({ isLoading: false });
    }
  },

  setFilters: (filters) => {
    set({ currentFilters: { ...get().currentFilters, ...filters } });
    get().fetchOrders(filters);
  },

  refreshOrders: async () => {
    const { currentFilters } = get();
    await get().fetchOrders(currentFilters);
  },
}));