import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, Clock, Gift, DollarSign, Calendar, ArrowUpRight, ArrowDownLeft, Plus, Coins, HandCoins, CreditCard } from 'lucide-react';
import { useAssetStore } from '@/stores/assetStore';
import { formatCurrency, formatTokenAmount, cn } from '@/lib/utils';
import { StakingProduct, LendProduct, LoanProduct, WithdrawalHistory } from '@/types';
import { TabButton, LoadingSpinner, EmptyState } from '@/components/common';

type TabType = 'staking' | 'lend' | 'loan';

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
      case 'giftCard':
        return '🎁';
      default:
        return '🎁';
    }
  };

  const getProductName = (type: string) => {
    switch (type) {
      case 'giftCard':
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
              {formatCurrency(product.minAmount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">최대 금액</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(product.maxAmount)}
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">사용 가능한 슬롯</span>
            <span className="font-medium">{product.availableSlots}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">총 스테이킹</span>
            <span className="font-medium">{formatCurrency(product.totalStaked)}</span>
          </div>
        </div>
        
        <button
          onClick={() => onStake(product.id)}
          disabled={product.availableSlots === 0}
          className={cn(
            'w-full py-3 font-medium rounded-xl transition-colors',
            product.availableSlots > 0
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          {product.availableSlots > 0 ? '지금 스테이킹' : '매진'}
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
            <p className="text-sm text-gray-500">{product.durationDays} days</p>
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
              {formatCurrency(product.minAmount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">담보 비율</p>
            <p className="font-semibold text-gray-900">
              {product.collateralRatio}%
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">사용 가능한 슬롯</span>
            <span className="font-medium">{product.availableSlots}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">총 대여금</span>
            <span className="font-medium">{formatCurrency(product.totalLent || 0)}</span>
          </div>
        </div>
        
        <button
          onClick={() => onLend(product.id)}
          disabled={!product.available || product.availableSlots === 0}
          className={cn(
            'w-full py-3 font-medium rounded-xl transition-colors',
            product.available && (product.availableSlots || 0) > 0
              ? 'bg-green-600 text-white hover:bg-green-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          {product.available && (product.availableSlots || 0) > 0 ? 'NFT 대여하기' : '매진'}
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
            <p className="text-sm text-gray-500">{product.durationDays} days</p>
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
          <p className="text-3xl font-bold text-blue-600">{product.interestRate}%</p>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500">최소 금액</p>
            <p className="font-semibold text-gray-900">
              {formatCurrency(product.minAmount)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500">LTV 비율</p>
            <p className="font-semibold text-gray-900">
              {product.loanToValueRatio}%
            </p>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">담보 필요</span>
            <span className="font-medium">{product.collateralRequired ? '예' : '아니오'}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">총 대출금</span>
            <span className="font-medium">{formatCurrency(product.totalLoaned || 0)}</span>
          </div>
        </div>
        
        <button
          onClick={() => onLoan(product.id)}
          disabled={!product.available || product.availableSlots === 0}
          className={cn(
            'w-full py-3 font-medium rounded-xl transition-colors',
            product.available && (product.availableSlots || 0) > 0
              ? 'bg-blue-600 text-white hover:bg-blue-700'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          {product.available && (product.availableSlots || 0) > 0 ? '대출 신청하기' : '한도 초과'}
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
      case 'stakingReward':
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
      case 'stakingReward':
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
            {getTypeIcon(item.transactionType)}
          </div>
          <div>
            <h4 className="font-medium text-gray-900">{getTypeName(item.transactionType)}</h4>
            <p className="text-sm text-gray-500">
              {new Date(item.createdAt).toLocaleDateString()}
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
      type: 'giftCard',
      name: 'IC 상품권 NFT 스테이킹 30일',
      description: '30일 IC 상품권 NFT 스테이킹으로 8.0% 수익률',
      apy: 8.0,
      durationDays: 30,
      minAmount: 50,
      maxAmount: 5000,
      available: true,
      productType: 'giftCard',
      duration: 30,
      availableSlots: 25,
      totalStaked: 75000,
    },
    {
      id: '4',
      type: 'giftCard',
      name: 'IC 상품권 NFT 스테이킹 60일',
      description: '60일 IC 상품권 NFT 스테이킹으로 12.0% 수익률',
      apy: 12.0,
      durationDays: 60,
      minAmount: 100,
      maxAmount: 10000,
      available: true,
      productType: 'giftCard',
      duration: 60,
      availableSlots: 15,
      totalStaked: 125000,
    },
    {
      id: '5',
      type: 'giftCard',
      name: 'IC 상품권 NFT 스테이킹 90일',
      description: '90일 IC 상품권 NFT 스테이킹으로 15.0% 수익률',
      apy: 15.0,
      durationDays: 90,
      minAmount: 200,
      maxAmount: 20000,
      available: true,
      productType: 'giftCard',
      duration: 90,
      availableSlots: 8,
      totalStaked: 180000,
    },
  ];

  // Mock data for lend products
  const lendProducts: LendProduct[] = [
    {
      id: 'lend1',
      name: 'IC 상품권 NFT 대여 30일',
      description: '30일 단기 NFT 대여로 높은 수익률을 제공합니다.',
      nftType: 'icGiftCard',
      apy: 15.0,
      durationDays: 30,
      minAmount: 200,
      maxAmount: 20000,
      available: true,
      collateralRatio: 120,
      availableSlots: 10,
      totalLent: 35000
    },
    {
      id: 'lend2',
      name: 'IC 상품권 NFT 대여 60일',
      description: '60일 중기 NFT 대여로 안정적인 수익을 보장합니다.',
      nftType: 'icGiftCard',
      apy: 22.0,
      durationDays: 60,
      minAmount: 500,
      maxAmount: 50000,
      available: true,
      collateralRatio: 130,
      availableSlots: 8,
      totalLent: 85000
    },
    {
      id: 'lend3',
      name: 'IC 상품권 NFT 대여 90일',
      description: '90일 장기 NFT 대여로 최고 수익률을 제공합니다.',
      nftType: 'icGiftCard',
      apy: 28.0,
      durationDays: 90,
      minAmount: 1000,
      maxAmount: 100000,
      available: false,
      collateralRatio: 140,
      availableSlots: 0,
      totalLent: 150000
    }
  ];

  // Mock data for loan products
  const loanProducts: LoanProduct[] = [
    {
      id: 'loan1',
      name: '단기 대출 30일',
      description: '30일 단기 대출 상품으로 빠른 자금 조달이 가능합니다.',
      interestRate: 12.0,
      durationDays: 30,
      minAmount: 100,
      maxAmount: 5000,
      available: true,
      collateralRequired: false,
      loanToValueRatio: 80,
      availableSlots: 20,
      totalLoaned: 25000
    },
    {
      id: 'loan2',
      name: '중기 대출 90일',
      description: '90일 중기 대출 상품으로 안정적인 자금 운용이 가능합니다.',
      interestRate: 18.0,
      durationDays: 90,
      minAmount: 500,
      maxAmount: 20000,
      available: true,
      collateralRequired: true,
      loanToValueRatio: 70,
      availableSlots: 12,
      totalLoaned: 75000
    },
    {
      id: 'loan3',
      name: '장기 대출 180일',
      description: '180일 장기 대출 상품으로 대규모 자금 조달에 적합합니다.',
      interestRate: 25.0,
      durationDays: 180,
      minAmount: 1000,
      maxAmount: 50000,
      available: true,
      collateralRequired: true,
      loanToValueRatio: 60,
      availableSlots: 5,
      totalLoaned: 120000
    }
  ];

  // Mock data for transaction history
  const transactionHistory: WithdrawalHistory[] = [
    {
      id: '1',
      transactionType: 'stakingReward',
      amount: 125.50,
      status: 'completed',
      createdAt: '2024-01-15T10:30:00Z',
    },
    {
      id: '2',
      transactionType: 'deposit',
      amount: 1000.00,
      status: 'completed',
      createdAt: '2024-01-14T15:20:00Z',
    },
    {
      id: '3',
      transactionType: 'withdrawal',
      amount: 500.00,
      status: 'pending',
      createdAt: '2024-01-13T09:15:00Z',
    },
    {
      id: '4',
      transactionType: 'stakingReward',
      amount: 87.25,
      status: 'completed',
      createdAt: '2024-01-12T14:45:00Z',
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