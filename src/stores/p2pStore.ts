import { create } from 'zustand';
import type { P2PStore, P2POrder, P2PProductType, TradeMethod } from '../types';
import { p2pApi } from '../services/p2pApi';

// ============================================================================
// P2P API INTEGRATION
// ============================================================================

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
      const orders = await p2pApi.fetchOrders(filters);
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
      const newOrder = await p2pApi.createOrder(orderData);
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
      await p2pApi.updateOrder(orderId, updates);
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
      const myOrders = await p2pApi.fetchMyOrders();
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