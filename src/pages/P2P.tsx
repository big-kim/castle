import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, User, Shield, Star, Filter, Search } from 'lucide-react';
import { useP2PStore } from '../stores/p2pStore';
import { useUserStore } from '../stores/userStore';
import { formatCurrency, formatTokenAmount, cn } from '../lib/utils';
import { P2POrder, TokenSymbol } from '../types';

type TabType = 'sell' | 'buy' | 'my-trades';

interface TabButtonProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

const TabButton: React.FC<TabButtonProps> = ({ active, onClick, children }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex-1 py-3 px-4 text-sm font-medium rounded-xl transition-all duration-200',
        active
          ? 'bg-primary text-white shadow-md'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      )}
    >
      {children}
    </button>
  );
};

interface OrderCardProps {
  order: P2POrder;
  onAction: (orderId: string, action: 'buy' | 'sell' | 'cancel') => void;
  currentUserId?: string;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onAction, currentUserId }) => {
  const isMyOrder = order.user_id === currentUserId;
  const isBuyOrder = order.type === 'buy';
  
  const getTokenIcon = (symbol: TokenSymbol) => {
    const iconMap = {
      ICC: '🪙',
      ICS: '💎',
      ICG: '🏆',
      USDT: '💵',
      BTC: '₿',
      ETH: 'Ξ',
      BNB: '🔶',
      ADA: '🔷',
    };
    return iconMap[symbol] || '🪙';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'completed':
        return 'text-blue-600 bg-blue-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'completed':
        return 'Completed';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status;
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">{getTokenIcon(order.token_symbol)}</div>
          <div>
            <h3 className="font-semibold text-gray-900">
              {isBuyOrder ? 'Buy' : 'Sell'} {order.token_symbol}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <User className="w-4 h-4" />
              <span>{order.user_name}</span>
              <div className="flex items-center space-x-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span>{order.user_rating}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className={cn(
          'px-2 py-1 rounded-lg text-xs font-medium',
          getStatusColor(order.status)
        )}>
          {getStatusText(order.status)}
        </div>
      </div>

      {/* Order Details */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="font-semibold text-gray-900">
            {formatTokenAmount(order.amount, 2)} {order.token_symbol}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Price</p>
          <p className="font-semibold text-gray-900">
            {formatCurrency(order.price_per_token)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Total</p>
          <p className="font-semibold text-primary">
            {formatCurrency(order.total_value)}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Payment</p>
          <p className="text-sm text-gray-700">{order.payment_method}</p>
        </div>
      </div>

      {/* Time and Action */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{new Date(order.created_at).toLocaleDateString()}</span>
        </div>
        
        {order.status === 'active' && (
          <div className="flex space-x-2">
            {isMyOrder ? (
              <button
                onClick={() => onAction(order.id, 'cancel')}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
              >
                Cancel
              </button>
            ) : (
              <button
                onClick={() => onAction(order.id, isBuyOrder ? 'sell' : 'buy')}
                className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
              >
                {isBuyOrder ? 'Sell to' : 'Buy from'} {order.user_name}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

interface FilterBarProps {
  onTokenFilter: (token: TokenSymbol | 'all') => void;
  onSearch: (query: string) => void;
  selectedToken: TokenSymbol | 'all';
}

const FilterBar: React.FC<FilterBarProps> = ({ onTokenFilter, onSearch, selectedToken }) => {
  const tokens: (TokenSymbol | 'all')[] = ['all', 'ICC', 'ICS', 'ICG', 'USDT'];
  
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search by username..."
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      
      {/* Token Filter */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {tokens.map((token) => (
          <button
            key={token}
            onClick={() => onTokenFilter(token)}
            className={cn(
              'px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
              selectedToken === token
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            )}
          >
            {token === 'all' ? 'All Tokens' : token}
          </button>
        ))}
      </div>
    </div>
  );
};

export const P2P: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('sell');
  const [selectedToken, setSelectedToken] = useState<TokenSymbol | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const { orders, myOrders, fetchOrders, fetchMyOrders, createOrder, cancelOrder, executeOrder, isLoading } = useP2PStore();
  const { user } = useUserStore();

  useEffect(() => {
    if (activeTab === 'my-trades') {
      fetchMyOrders();
    } else {
      fetchOrders();
    }
  }, [activeTab, fetchOrders, fetchMyOrders]);

  const handleOrderAction = async (orderId: string, action: 'buy' | 'sell' | 'cancel') => {
    try {
      if (action === 'cancel') {
        await cancelOrder(orderId);
      } else {
        await executeOrder(orderId, 0); // Amount will be determined by the order
      }
      // Refresh orders after action
      if (activeTab === 'my-trades') {
        fetchMyOrders();
      } else {
        fetchOrders();
      }
    } catch (error) {
      console.error('Order action failed:', error);
    }
  };

  const getFilteredOrders = () => {
    const ordersToFilter = activeTab === 'my-trades' ? myOrders : orders;
    
    let filtered = ordersToFilter;
    
    // Filter by tab type
    if (activeTab !== 'my-trades') {
      filtered = filtered.filter(order => order.type === activeTab);
    }
    
    // Filter by token
    if (selectedToken !== 'all') {
      filtered = filtered.filter(order => order.token_symbol === selectedToken);
    }
    
    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.user_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  const filteredOrders = getFilteredOrders();

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl p-4 shadow-sm animate-pulse">
            <div className="h-6 bg-gray-200 rounded mb-3"></div>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
            </div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2 bg-gray-50 p-1 rounded-xl">
        <TabButton
          active={activeTab === 'sell'}
          onClick={() => setActiveTab('sell')}
        >
          Sell Orders
        </TabButton>
        <TabButton
          active={activeTab === 'buy'}
          onClick={() => setActiveTab('buy')}
        >
          Buy Orders
        </TabButton>
        <TabButton
          active={activeTab === 'my-trades'}
          onClick={() => setActiveTab('my-trades')}
        >
          My Trades
        </TabButton>
      </div>

      {/* Filter Bar */}
      <FilterBar
        onTokenFilter={setSelectedToken}
        onSearch={setSearchQuery}
        selectedToken={selectedToken}
      />

      {/* Create Order Button */}
      {activeTab !== 'my-trades' && (
        <button className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors">
          Create {activeTab === 'sell' ? 'Sell' : 'Buy'} Order
        </button>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No {activeTab === 'my-trades' ? 'trades' : `${activeTab} orders`} found
            </h3>
            <p className="text-gray-500">
              {activeTab === 'my-trades'
                ? 'You haven\'t made any trades yet.'
                : `No ${activeTab} orders match your criteria.`}
            </p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              onAction={handleOrderAction}
              currentUserId={user?.id}
            />
          ))
        )}
      </div>
    </div>
  );
};