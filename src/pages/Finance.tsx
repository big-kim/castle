import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Clock, Gift, DollarSign, Calendar, ArrowUpRight, ArrowDownLeft, Plus, Coins, HandCoins, CreditCard } from 'lucide-react';
import { useAssetStore } from '../stores/assetStore';
import { formatCurrency, formatTokenAmount, cn } from '../lib/utils';
import { StakingProduct, LendProduct, LoanProduct, WithdrawalHistory } from '../types';

type TabType = 'staking' | 'lend' | 'loan';

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

interface LendCardProps {
  product: LendProduct;
  onLend: (productId: string) => void;
}

interface LoanCardProps {
  product: LoanProduct;
  onLoan: (productId: string) => void;
}

const StakingCard: React.FC<StakingCardProps> = ({ product, onStake }) => {
  const getProductIcon = (type: string) => {
    switch (type) {
      case 'gift_card':
        return '🎁';
      default:
        return '🎁';
    }
  };

  const getProductName = (type: string) => {
    switch (type) {
      case 'gift_card':
        return 'IC 상품권 NFT 스테이킹';
      default:
        return 'IC 상품권 NFT 스테이킹';
    }
  };

  const getRiskLevel = (apy: number) => {
    if (apy >= 15) return { level: '고위험', color: 'text-red-600 bg-red-50' };
    if (apy >= 10) return { level: '중위험', color: 'text-yellow-600 bg-yellow-50' };
    return { level: '저위험', color: 'text-green-600 bg-green-50' };
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
          <p className="text-sm text-gray-500 mb-1">연간 수익률</p>
          <p className="text-3xl font-bold text-primary">{product.apy}%</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">최소 금액</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(product.min_amount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">최대 금액</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(product.max_amount)}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">사용 가능한 슬롯</span>
            <span className="font-medium">{product.available_slots}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">총 스테이킹</span>
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
          {product.available_slots > 0 ? '지금 스테이킹' : '매진'}
        </button>
      </div>
    </div>
  );
};

const LendCard: React.FC<LendCardProps> = ({ product, onLend }) => {
  const getRiskLevel = (apy: number) => {
    if (apy >= 15) return { level: '고위험', color: 'text-red-600 bg-red-50' };
    if (apy >= 10) return { level: '중위험', color: 'text-yellow-600 bg-yellow-50' };
    return { level: '저위험', color: 'text-green-600 bg-green-50' };
  };

  const risk = getRiskLevel(product.apy);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">🎁</div>
          <div>
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.duration_days} days</p>
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
        <div className="text-center py-4 bg-gradient-to-r from-green-500/10 to-green-400/5 rounded-xl">
          <p className="text-sm text-gray-500 mb-1">연간 수익률</p>
          <p className="text-3xl font-bold text-green-600">{product.apy}%</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">최소 금액</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(product.min_amount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">담보 비율</p>
            <p className="font-semibold text-gray-900">
              {product.collateral_ratio}%
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">사용 가능한 슬롯</span>
            <span className="font-medium">{product.available_slots}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">총 대여금</span>
            <span className="font-medium">{formatCurrency(product.total_lent || 0)}</span>
          </div>
        </div>
        
        <button
          onClick={() => onLend(product.id)}
          disabled={!product.available || product.available_slots === 0}
          className={cn(
            'w-full py-3 font-medium rounded-xl transition-colors',
            product.available && (product.available_slots || 0) > 0
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          {product.available && (product.available_slots || 0) > 0 ? 'NFT 대여하기' : '매진'}
        </button>
      </div>
    </div>
  );
};

const LoanCard: React.FC<LoanCardProps> = ({ product, onLoan }) => {
  const getRiskLevel = (rate: number) => {
    if (rate >= 20) return { level: '고위험', color: 'text-red-600 bg-red-50' };
    if (rate >= 15) return { level: '중위험', color: 'text-yellow-600 bg-yellow-50' };
    return { level: '저위험', color: 'text-green-600 bg-green-50' };
  };

  const risk = getRiskLevel(product.interest_rate);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="text-3xl">💳</div>
          <div>
            <h3 className="font-semibold text-gray-900">{product.name}</h3>
            <p className="text-sm text-gray-500">{product.duration_days} days</p>
          </div>
        </div>
        
        <div className={cn(
          'px-3 py-1 rounded-lg text-xs font-medium',
          risk.color
        )}>
          {risk.level} Risk
        </div>
      </div>

      {/* Interest Rate and Details */}
      <div className="space-y-4">
        <div className="text-center py-4 bg-gradient-to-r from-blue-500/10 to-blue-400/5 rounded-xl">
          <p className="text-sm text-gray-500 mb-1">연간 이자율</p>
          <p className="text-3xl font-bold text-blue-600">{product.interest_rate}%</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">최소 금액</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(product.min_amount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">LTV 비율</p>
            <p className="font-semibold text-gray-900">
              {product.loan_to_value_ratio}%
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">담보 필요</span>
            <span className="font-medium">{product.collateral_required ? '예' : '아니오'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">총 대출금</span>
            <span className="font-medium">{formatCurrency(product.total_loaned || 0)}</span>
          </div>
        </div>
        
        <button
          onClick={() => onLoan(product.id)}
          disabled={!product.available || product.available_slots === 0}
          className={cn(
            'w-full py-3 font-medium rounded-xl transition-colors',
            product.available && (product.available_slots || 0) > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          {product.available && (product.available_slots || 0) > 0 ? '대출 신청하기' : '한도 초과'}
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
        return '완료';
      case 'pending':
        return '대기중';
      case 'failed':
        return '실패';
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
        return '입금';
      case 'withdrawal':
        return '출금';
      case 'staking_reward':
        return '스테이킹 보상';
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
            <p className="text-sm text-gray-500">금액</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(item.amount)}
            </p>
          </div>
          
          {item.fee && (
            <div className="text-right">
              <p className="text-sm text-gray-500">수수료</p>
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
          <h3 className="text-lg font-semibold">총 획득 보상</h3>
          <TrendingUp className="w-6 h-6" />
        </div>
        <p className="text-3xl font-bold mb-2">{formatCurrency(totalRewards)}</p>
        <p className="text-prestige-blue-light text-sm">스테이킹으로 얻은 평생 수익</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl mb-2">📈</div>
          <p className="text-sm text-gray-500">이번 달</p>
          <p className="font-semibold text-prestige-blue">{formatCurrency(monthlyRewards)}</p>
        </div>
        
        <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 text-center">
          <div className="text-2xl mb-2">🔒</div>
          <p className="text-sm text-gray-500">활성 스테이킹</p>
          <p className="font-semibold text-green-600">{activeStakings}</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="space-y-3">
        <h4 className="font-semibold text-gray-900">빠른 실행</h4>
        <div className="grid grid-cols-2 gap-3">
          <button className="flex items-center justify-center space-x-2 py-3 bg-prestige-blue text-white rounded-xl hover:bg-prestige-blue/90 transition-colors">
            <Plus className="w-4 h-4" />
            <span className="text-sm font-medium">새 스테이킹</span>
          </button>
          <button className="flex items-center justify-center space-x-2 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors">
            <Calendar className="w-4 h-4" />
            <span className="text-sm font-medium">캘린더 보기</span>
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

  // Mock data for staking products - IC상품권NFT 스테이킹만
  const stakingProducts: StakingProduct[] = [
    {
      id: '2',
      type: 'gift_card',
      name: 'IC 상품권 NFT 스테이킹 30일',
      description: '30일 IC 상품권 NFT 스테이킹으로 8.0% 수익률',
      apy: 8.0,
      duration_days: 30,
      min_amount: 50,
      max_amount: 5000,
      available: true,
      product_type: 'gift_card',
      duration: 30,
      available_slots: 25,
      total_staked: 75000,
    },
    {
      id: '4',
      type: 'gift_card',
      name: 'IC 상품권 NFT 스테이킹 60일',
      description: '60일 IC 상품권 NFT 스테이킹으로 12.0% 수익률',
      apy: 12.0,
      duration_days: 60,
      min_amount: 100,
      max_amount: 10000,
      available: true,
      product_type: 'gift_card',
      duration: 60,
      available_slots: 15,
      total_staked: 125000,
    },
    {
      id: '5',
      type: 'gift_card',
      name: 'IC 상품권 NFT 스테이킹 90일',
      description: '90일 IC 상품권 NFT 스테이킹으로 15.0% 수익률',
      apy: 15.0,
      duration_days: 90,
      min_amount: 200,
      max_amount: 20000,
      available: true,
      product_type: 'gift_card',
      duration: 90,
      available_slots: 8,
      total_staked: 180000,
    },
  ];

  // Mock data for lend products
  const lendProducts: LendProduct[] = [
    {
      id: 'lend1',
      name: 'IC 상품권 NFT 대여 30일',
      description: '30일 단기 NFT 대여로 높은 수익률을 제공합니다.',
      nft_type: 'ic_gift_card',
      apy: 15.0,
      duration_days: 30,
      min_amount: 200,
      max_amount: 20000,
      available: true,
      collateral_ratio: 120,
      available_slots: 10,
      total_lent: 35000
    },
    {
      id: 'lend2',
      name: 'IC 상품권 NFT 대여 60일',
      description: '60일 중기 NFT 대여로 안정적인 수익을 보장합니다.',
      nft_type: 'ic_gift_card',
      apy: 22.0,
      duration_days: 60,
      min_amount: 500,
      max_amount: 50000,
      available: true,
      collateral_ratio: 130,
      available_slots: 8,
      total_lent: 85000
    },
    {
      id: 'lend3',
      name: 'IC 상품권 NFT 대여 90일',
      description: '90일 장기 NFT 대여로 최고 수익률을 제공합니다.',
      nft_type: 'ic_gift_card',
      apy: 28.0,
      duration_days: 90,
      min_amount: 1000,
      max_amount: 100000,
      available: false,
      collateral_ratio: 140,
      available_slots: 0,
      total_lent: 150000
    }
  ];

  // Mock data for loan products
  const loanProducts: LoanProduct[] = [
    {
      id: 'loan1',
      name: '단기 대출 30일',
      description: '30일 단기 대출 상품으로 빠른 자금 조달이 가능합니다.',
      interest_rate: 12.0,
      duration_days: 30,
      min_amount: 100,
      max_amount: 5000,
      available: true,
      collateral_required: false,
      loan_to_value_ratio: 80,
      available_slots: 20,
      total_loaned: 25000
    },
    {
      id: 'loan2',
      name: '중기 대출 90일',
      description: '90일 중기 대출 상품으로 안정적인 자금 운용이 가능합니다.',
      interest_rate: 18.0,
      duration_days: 90,
      min_amount: 500,
      max_amount: 20000,
      available: true,
      collateral_required: true,
      loan_to_value_ratio: 70,
      available_slots: 12,
      total_loaned: 75000
    },
    {
      id: 'loan3',
      name: '장기 대출 180일',
      description: '180일 장기 대출 상품으로 대규모 자금 조달에 적합합니다.',
      interest_rate: 25.0,
      duration_days: 180,
      min_amount: 1000,
      max_amount: 50000,
      available: true,
      collateral_required: true,
      loan_to_value_ratio: 60,
      available_slots: 5,
      total_loaned: 120000
    }
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

  const handleLend = (productId: string) => {
    console.log('Lending NFT for product:', productId);
    // TODO: Implement lending logic
  };

  const handleLoan = (productId: string) => {
    console.log('Applying for loan:', productId);
    // TODO: Implement loan application logic
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
          <TrendingUp className="w-4 h-4 inline mr-2" />
          스테이킹
        </TabButton>
        <TabButton
          active={activeTab === 'lend'}
          onClick={() => setActiveTab('lend')}
        >
          <HandCoins className="w-4 h-4 inline mr-2" />
          LEND
        </TabButton>
        <TabButton
          active={activeTab === 'loan'}
          onClick={() => setActiveTab('loan')}
        >
          <CreditCard className="w-4 h-4 inline mr-2" />
          LOAN
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === 'staking' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">IC 상품권 NFT 스테이킹</h2>
            <p className="text-gray-600">IC 상품권 NFT를 구매하여 스테이킹하고 안정적인 수익을 얻으세요.</p>
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

      {activeTab === 'lend' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">IC 상품권 NFT 대여</h2>
            <p className="text-gray-600">IC 상품권 NFT를 구매하여 회사에 대여하고 높은 수익률을 얻으세요.</p>
          </div>
          <div className="space-y-4">
            {lendProducts.map((product) => (
              <LendCard
                key={product.id}
                product={product}
                onLend={handleLend}
              />
            ))}
          </div>
        </div>
      )}

      {activeTab === 'loan' && (
        <div className="space-y-6">
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">대출 서비스</h2>
            <p className="text-gray-600">회사로부터 대출을 받고 합리적인 이자율로 자금을 조달하세요.</p>
          </div>
          <div className="space-y-4">
            {loanProducts.map((product) => (
              <LoanCard
                key={product.id}
                product={product}
                onLoan={handleLoan}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};