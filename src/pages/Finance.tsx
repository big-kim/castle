import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Clock, Gift, DollarSign, Calendar, ArrowUpRight, ArrowDownLeft, Plus } from 'lucide-react';
import { useAssetStore } from '../stores/assetStore';
import { formatCurrency, formatTokenAmount, cn } from '../lib/utils';
import { StakingProduct, WithdrawalHistory } from '../types';

type TabType = 'staking' | 'history' | 'rewards';

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

interface StakingCardProps {
  product: StakingProduct;
  onStake: (productId: string) => void;
}

const StakingCard: React.FC<StakingCardProps> = ({ product, onStake }) => {
  const getProductIcon = (type: string) => {
    switch (type) {
      case 'usdt':
        return '💵';
      case 'gift_card':
        return '🎁';
      default:
        return '💰';
    }
  };

  const getProductName = (type: string) => {
    switch (type) {
      case 'usdt':
        return 'USDT Staking';
      case 'gift_card':
        return 'Gift Card Staking';
      default:
        return 'Staking Product';
    }
  };

  const getRiskLevel = (apy: number) => {
    if (apy >= 15) return { level: 'High', color: 'text-red-600 bg-red-50' };
    if (apy >= 8) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-50' };
    return { level: 'Low', color: 'text-green-600 bg-green-50' };
  };

  const risk = getRiskLevel(product.apy);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">{getProductIcon(product.product_type)}</div>
          <div>
            <h3 className="font-semibold text-gray-900">{getProductName(product.product_type)}</h3>
            <p className="text-sm text-gray-500">{product.duration} days</p>
          </div>
        </div>
        
        <div className={cn(
          'px-3 py-1 rounded-lg text-xs font-medium',
          risk.color
        )}>
          {risk.level} Risk
        </div>
      </div>

      {/* APY and Details */}
      <div className="space-y-4">
        <div className="text-center py-4 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl">
          <p className="text-sm text-gray-500 mb-1">Annual Percentage Yield</p>
          <p className="text-3xl font-bold text-primary">{product.apy}%</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">Min Amount</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(product.min_amount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Max Amount</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(product.max_amount)}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Available Slots</span>
            <span className="font-medium">{product.available_slots}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Total Staked</span>
            <span className="font-medium">{formatCurrency(product.total_staked)}</span>
          </div>
        </div>
        
        <button
          onClick={() => onStake(product.id)}
          disabled={product.available_slots === 0}
          className={cn(
            'w-full py-3 font-medium rounded-xl transition-colors',
            product.available_slots > 0
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          {product.available_slots > 0 ? 'Stake Now' : 'Sold Out'}
        </button>
      </div>
    </div>
  );
};

interface HistoryItemProps {
  item: WithdrawalHistory;
}

const HistoryItem: React.FC<HistoryItemProps> = ({ item }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'pending':
        return 'text-yellow-600 bg-yellow-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'pending':
        return 'Pending';
      case 'failed':
        return 'Failed';
      default:
        return status;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="w-4 h-4 text-green-600" />;
      case 'withdrawal':
        return <ArrowUpRight className="w-4 h-4 text-red-600" />;
      case 'staking_reward':
        return <Gift className="w-4 h-4 text-primary" />;
      default:
        return <DollarSign className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
      case 'deposit':
        return 'Deposit';
      case 'withdrawal':
        return 'Withdrawal';
      case 'staking_reward':
        return 'Staking Reward';
      default:
        return type;
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gray-50 rounded-lg">
            {getTypeIcon(item.transaction_type)}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{getTypeName(item.transaction_type)}</h4>
            <p className="text-sm text-gray-500">
              {new Date(item.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <div className={cn(
          'px-2 py-1 rounded-lg text-xs font-medium',
          getStatusColor(item.status)
        )}>
          {getStatusText(item.status)}
        </div>
      </div>
      
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">Amount</p>
          <p className="font-semibold text-gray-900">
            {formatCurrency(item.amount)}
          </p>
        </div>
        
        {item.fee && (
          <div className="text-right">
            <p className="text-sm text-gray-500">Fee</p>
            <p className="text-sm text-gray-700">
              {formatCurrency(item.fee)}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

interface RewardsSummaryProps {
  totalRewards: number;
  monthlyRewards: number;
  activeStakings: number;
}

const RewardsSummary: React.FC<RewardsSummaryProps> = ({ totalRewards, monthlyRewards, activeStakings }) => {
  return (
    <div className="space-y-4">
      {/* Total Rewards Card */}
      <div className="bg-gradient-to-br from-prestige-blue to-prestige-blue/80 rounded-2xl p-6 text-white shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Total Rewards Earned</h3>
          <TrendingUp className="w-6 h-6" />
        </div>
        <p className="text-3xl font-bold mb-2">{formatCurrency(totalRewards)}</p>
        <p className="text-prestige-blue-light text-sm">Lifetime earnings from staking</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl mb-2">📈</div>
          <p className="text-sm text-gray-500">This Month</p>
          <p className="font-semibold text-prestige-blue">{formatCurrency(monthlyRewards)}</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl mb-2">🔒</div>
          <p className="text-sm text-gray-500">Active Stakings</p>
          <p className="font-semibold text-green-600">{activeStakings}</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center space-x-2 py-3 bg-prestige-blue text-white rounded-xl hover:bg-prestige-blue/90 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">New Staking</span>
          </button>
          <button className="flex items-center justify-center space-x-2 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">View Calendar</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export const Finance: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('staking');
  const { summary, fetchSummary, isLoading } = useAssetStore();

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  // Mock data for staking products
  const stakingProducts: StakingProduct[] = [
    {
      id: '1',
      type: 'usdt',
      name: 'USDT Staking 30D',
      description: '30-day USDT staking with 12.5% APY',
      apy: 12.5,
      duration_days: 30,
      min_amount: 100,
      max_amount: 10000,
      available: true,
      product_type: 'usdt',
      duration: 30,
      available_slots: 50,
      total_staked: 125000,
    },
    {
      id: '2',
      type: 'gift_card',
      name: 'Gift Card Staking 60D',
      description: '60-day gift card staking with 8.0% APY',
      apy: 8.0,
      duration_days: 60,
      min_amount: 50,
      max_amount: 5000,
      available: true,
      product_type: 'gift_card',
      duration: 60,
      available_slots: 25,
      total_staked: 75000,
    },
    {
      id: '3',
      type: 'usdt',
      name: 'USDT Staking 90D',
      description: '90-day USDT staking with 18.0% APY',
      apy: 18.0,
      duration_days: 90,
      min_amount: 500,
      max_amount: 50000,
      available: false,
      product_type: 'usdt',
      duration: 90,
      available_slots: 0,
      total_staked: 250000,
    },
  ];

  // Mock data for transaction history
  const transactionHistory: WithdrawalHistory[] = [
    {
      id: '1',
      type: 'staking_reward',
      amount: 125.50,
      status: 'completed',
      date: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      type: 'deposit',
      amount: 1000.00,
      status: 'completed',
      date: '2024-01-14T15:20:00Z',
    },
    {
      id: '3',
      type: 'withdrawal',
      amount: 500.00,
      status: 'pending',
      date: '2024-01-13T09:15:00Z',
    },
    {
      id: '4',
      type: 'staking_reward',
      amount: 87.25,
      status: 'completed',
      date: '2024-01-12T14:45:00Z',
    },
  ];

  const handleStake = (productId: string) => {
    console.log('Staking product:', productId);
    // TODO: Implement staking logic
  };

  // Mock rewards data
  const rewardsData = {
    totalRewards: 2450.75,
    monthlyRewards: 312.50,
    activeStakings: 3,
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Tab Navigation */}
      <div className="flex space-x-2 bg-gray-50 p-1 rounded-xl">
        <TabButton
          active={activeTab === 'staking'}
          onClick={() => setActiveTab('staking')}
        >
          Staking
        </TabButton>
        <TabButton
          active={activeTab === 'history'}
          onClick={() => setActiveTab('history')}
        >
          History
        </TabButton>
        <TabButton
          active={activeTab === 'rewards'}
          onClick={() => setActiveTab('rewards')}
        >
          Rewards
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === 'staking' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Staking Products</h2>
            <button className="text-prestige-blue text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {stakingProducts.map((product) => (
              <StakingCard
                key={product.id}
                product={product}
                onStake={handleStake}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'history' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">Transaction History</h2>
            <button className="text-prestige-blue text-sm font-medium">
              Export
            </button>
          </div>
          
          <div className="space-y-3">
            {transactionHistory.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Transaction History
                </h3>
                <p className="text-gray-500">
                  Your transaction history will appear here.
                </p>
              </div>
            ) : (
              transactionHistory.map((item) => (
                <HistoryItem key={item.id} item={item} />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'rewards' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">Rewards Summary</h2>
          <RewardsSummary
            totalRewards={rewardsData.totalRewards}
            monthlyRewards={rewardsData.monthlyRewards}
            activeStakings={rewardsData.activeStakings}
          />
        </div>
      )}
    </div>
  );
};