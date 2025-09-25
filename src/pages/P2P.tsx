import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Clock, User, Shield, Star, Filter, Search, Gift, Ticket, Package, Coins, Plus, X } from 'lucide-react';
import { useP2PStore } from '../stores/p2pStore';
import { useUserStore } from '../stores/userStore';
import { formatCurrency, formatTokenAmount, cn } from '../lib/utils';
import { P2POrder, TokenSymbol, P2PProductType, P2POrderForm, TradeMethod } from '../types';
import { web3Manager, formatAddress, formatTxHash, getBSCScanUrl } from '../utils/web3';
import { ExternalLink } from 'lucide-react';

type TabType = 'sell' | 'buy' | 'my-trades';
type ProductTabType = 'token' | 'nft' | 'coupon' | 'other';

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

  const [isExpanded, setIsExpanded] = useState(false);
  const isMyOrder = order.user_id === currentUserId;
  const isBuyOrder = order.type === 'buy';
  
  const getTokenIcon = (symbol: TokenSymbol) => {
    const iconMap = {
      ICC: '🪙',
      ICS: '💎',
      ICF: '🎁',
      ICG: '🏆',
      USDT: '💵',
      BTC: '₿',
      ETH: 'Ξ',
      BNB: '🔶',
      ADA: '🔷',
    };
    return iconMap[symbol] || '🪙';
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return '🏷️'; // 판매중 아이콘
      case 'completed':
        return ''; // 판매완료 아이콘
      case 'cancelled':
        return '🔒'; // 취소됨 아이콘
      default:
        return '🏷️';
    }
  };

  const getProductTypeIcon = (productType: P2PProductType) => {
    switch (productType) {
      case 'token':
        return <Coins className="w-5 h-5" />;
      case 'nft':
        return <Gift className="w-5 h-5" />;
      case 'coupon':
        return <Ticket className="w-5 h-5" />;
      case 'other':
        return <Package className="w-5 h-5" />;
      default:
        return <Coins className="w-5 h-5" />;
    }
  };

  const getProductTypeName = (productType: P2PProductType) => {
    switch (productType) {
      case 'token':
        return '코인';
      case 'nft':
        return 'IC상품권NFT';
      case 'coupon':
        return '쿠폰';
      case 'other':
        return '기타상품';
      default:
        return '코인';
    }
  };

  // Generate IC gift certificate product code based on denomination
  const generateICGiftCode = (amount: number) => {
    if (amount >= 500000) return '50W0000';
    if (amount >= 100000) return '10W0000';
    if (amount >= 50000) return '5W0000';
    if (amount >= 10000) return '1W0000';
    return '1W0000'; // Default to 1만원권
  };

  // Get IC gift certificate denomination
  const getICGiftDenomination = (amount: number) => {
    if (amount >= 500000) return '50만원권';
    if (amount >= 100000) return '10만원권';
    if (amount >= 50000) return '5만원권';
    if (amount >= 10000) return '1만원권';
    return '1만원권';
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
        return '판매중';
      case 'completed':
        return '판매완료';
      case 'cancelled':
        return '취소됨';
      default:
        return status;
    }
  };

  // Generate product code (6-character alphanumeric)
  const generateProductCode = (orderId: string) => {
    const hash = orderId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const code = Math.abs(hash).toString(36).toUpperCase().slice(0, 6).padEnd(6, '0');
    return code;
  };

  // Generate coupon code (C + 5-character alphanumeric)
  const generateCouponCode = (orderId: string) => {
    const hash = orderId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    const code = 'C' + Math.abs(hash).toString(36).toUpperCase().slice(0, 5).padEnd(5, '0');
    return code;
  };

  // Get coupon discount based on total value (adjusted for reasonable coupon prices)
  const getCouponDiscount = (amount: number) => {
    if (amount >= 80) return '50%';
    if (amount >= 60) return '30%';
    if (amount >= 40) return '20%';
    if (amount >= 25) return '15%';
    if (amount >= 15) return '10%';
    return '5%';
  };

  return (
    <div 
      className={`bg-white rounded-2xl p-4 shadow-sm border-2 cursor-pointer hover:shadow-lg transition-all duration-200 ${
        order.smart_contract_status === 'completed' ? 'border-green-200 bg-green-50/30' :
        order.smart_contract_status === 'listed' ? 'border-blue-200 bg-blue-50/30' :
        order.smart_contract_status === 'pending' ? 'border-yellow-200 bg-yellow-50/30' :
        'border-gray-100'
      }`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Header - Enhanced */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {/* Status Badge - Only 판매중 or 판매완료 */}
            <span className={`px-3 py-2 rounded-full text-sm font-semibold shadow-sm ${
              order.status === 'completed' || order.smart_contract_status === 'completed' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
              'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
            }`}>
              {order.status === 'completed' || order.smart_contract_status === 'completed' ? '판매완료' : '판매중'}
            </span>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">
              {order.product_type === 'nft' 
                ? `IC상품권 NFT 판매 / ${generateICGiftCode(order.total_value)}`
                : order.product_type === 'coupon'
                ? `쿠폰 판매 / ${generateCouponCode(order.id)}`
                : `${order.token_symbol} ${isBuyOrder ? '구매' : '판매'} / ${generateProductCode(order.id)}`
              }
            </h3>
            <div className="text-sm text-gray-600 flex items-center space-x-2">
              <span className="flex items-center space-x-1">
                <span>📦</span>
                <span>
                  {order.product_type === 'coupon' 
                    ? `${formatCurrency(order.amount)}`
                    : order.product_type === 'token' 
                    ? `${formatTokenAmount(order.amount, 2)} ${order.token_symbol}`
                    : `${order.amount}개`
                  }
                </span>
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <span>💰</span>
                <span>
                  {order.product_type === 'coupon' 
                    ? `${formatCurrency(order.price_per_token)} (할인가)`
                    : `${formatCurrency(order.price_per_token)}`
                  }
                </span>
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-gray-400">
            {isExpanded ? '▲' : '▼'}
          </div>
        </div>
      </div>

      {/* Expanded Details */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          {/* Order Details */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">
                {order.product_type === 'coupon' ? '쿠폰 금액' : '수량'}
              </p>
              <p className="font-semibold text-gray-900">
                {order.product_type === 'coupon' 
                  ? `${formatCurrency(order.amount)}`
                  : order.product_type === 'token' 
                  ? `${formatTokenAmount(order.amount, 2)} ${order.token_symbol}`
                  : `${order.amount}개`
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">
                {order.product_type === 'coupon' ? '할인가' : '가격'}
              </p>
              <p className="font-semibold text-gray-900">
                {order.product_type === 'coupon' 
                  ? `${formatCurrency(order.price_per_token)}`
                  : `${formatCurrency(order.price_per_token)}`
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">총액</p>
              <p className="font-semibold text-primary">
                {formatCurrency(order.total_value)}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">결제코인</p>
              <p className="text-sm text-gray-700">
                USDT
              </p>
            </div>
          </div>

          {/* Product Details */}
          {order.product_details && (
            <div className="mb-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-500 mb-1">상품 정보</p>
              <div className="text-sm text-gray-700 space-y-1">
                {order.product_type === 'nft' ? (
                  <>
                    <p><strong>상품명:</strong> IC 상품권 NFT {getICGiftDenomination(order.total_value)}</p>
                    <p><strong>설명:</strong> IC 상품권 NFT - {getICGiftDenomination(order.total_value)} 디지털 상품권</p>
                    <p><strong>브랜드:</strong> IC Castle</p>
                    <p><strong>카테고리:</strong> gift_card</p>
                    {order.product_details.nft_token_id && (
                      <p><strong>NFT ID:</strong> {order.product_details.nft_token_id}</p>
                    )}
                  </>
                ) : order.product_type === 'coupon' ? (
                  <>
                    <p><strong>상품명:</strong> {order.product_details.name || `디지털 쿠폰 ${getCouponDiscount(order.total_value)}`}</p>
                    <p><strong>브랜드:</strong> {order.product_details.brand || 'IC Castle'}</p>
                    <p><strong>카테고리:</strong> digital_coupon</p>
                    <p><strong>할인율:</strong> {getCouponDiscount(order.total_value)}</p>
                    <p><strong>유효기간:</strong> {order.product_details.expiry_date || '발급일로부터 1년'}</p>
                    <p><strong>사용처:</strong> {order.product_details.usage_location || 'IC Castle 플랫폼 내 모든 상품'}</p>
                    {order.product_details.coupon_code && (
                      <p><strong>쿠폰코드:</strong> {order.product_details.coupon_code}</p>
                    )}
                  </>
                ) : (
                  <>
                    <p><strong>상품명:</strong> {order.product_details.name}</p>
                    {order.product_details.brand && (
                      <p><strong>브랜드:</strong> {order.product_details.brand}</p>
                    )}
                    {order.product_details.category && (
                      <p><strong>카테고리:</strong> {order.product_details.category}</p>
                    )}
                    {order.product_details.coupon_code && (
                      <p><strong>쿠폰코드:</strong> {order.product_details.coupon_code}</p>
                    )}
                    {order.product_details.expiry_date && (
                      <p><strong>만료일:</strong> {order.product_details.expiry_date}</p>
                    )}
                    {order.product_details.nft_token_id && (
                      <p><strong>NFT ID:</strong> {order.product_details.nft_token_id}</p>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Smart Contract Status Indicator */}
          {order.smart_contract_status === 'listed' && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-blue-700 flex items-center space-x-2">
                <span>🔒</span>
                <span>상품이 스마트 컨트랙트 에스크로에 안전하게 보관되어 있습니다</span>
              </div>
            </div>
          )}

          {order.smart_contract_status === 'completed' && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-green-700 flex items-center space-x-2">
                <span>🎉</span>
                <span>스마트 컨트랙트 거래가 성공적으로 완료되었습니다</span>
              </div>
            </div>
          )}

          {order.smart_contract_status === 'pending' && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="text-sm text-yellow-700 flex items-center space-x-2">
                <span>⏳</span>
                <span>스마트 컨트랙트 거래가 처리중입니다</span>
              </div>
            </div>
          )}

          {/* Time and Action */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <Clock className="w-4 h-4" />
              <span>{new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            
            {order.status === 'active' && (
              <div className="flex space-x-2">
                {isMyOrder ? (
                  <SmartContractSellerActions order={order} />
                ) : (
                  <SmartContractBuyerActions order={order} />
                )}
              </div>
            )}
          </div>

          {/* Enhanced Purchase Button - Always show for purchasable items */}
          {!isMyOrder && order.status === 'active' && (order.smart_contract_status === 'listed' || !order.smart_contract_status) && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <PurchaseButton order={order} />
            </div>
          )}
        </div>
      )}



    </div>
  );
};

interface ProductTypeTabProps {
  activeProductType: ProductTabType;
  onProductTypeChange: (type: ProductTabType) => void;
}

const ProductTypeTabs: React.FC<ProductTypeTabProps> = ({ activeProductType, onProductTypeChange }) => {
  const productTypes: { type: ProductTabType; label: string; icon: React.ReactNode }[] = [
    { type: 'token', label: '코인', icon: <Coins className="w-4 h-4" /> },
    { type: 'nft', label: 'IC상품권NFT', icon: <Gift className="w-4 h-4" /> },
    { type: 'coupon', label: '쿠폰', icon: <Ticket className="w-4 h-4" /> },
    { type: 'other', label: '기타', icon: <Package className="w-4 h-4" /> },
  ];

  return (
    <div 
      className="flex space-x-2 overflow-x-auto pb-2 product-type-scroll"
      style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#d1d5db #f3f4f6',
        WebkitOverflowScrolling: 'touch',
        msOverflowStyle: 'auto'
      }}
    >
      {productTypes.map(({ type, label, icon }) => (
        <button
          key={type}
          onClick={() => onProductTypeChange(type)}
          className={cn(
            'flex items-center space-x-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-colors',
            activeProductType === type
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          )}
        >
          {icon}
          <span>{label}</span>
        </button>
      ))}
    </div>
  );
};

interface FilterBarProps {
  onTokenFilter: (token: TokenSymbol | 'all') => void;
  onSearch: (query: string) => void;
  selectedToken: TokenSymbol | 'all';
  activeProductType: ProductTabType;
}

const FilterBar: React.FC<FilterBarProps> = ({ onTokenFilter, onSearch, selectedToken, activeProductType }) => {
  const tokens: (TokenSymbol | 'all')[] = ['all', 'ICC', 'ICS'];
  
  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="거래 코드(숫자+영문조합6자리 코드) 검색"
          onChange={(e) => onSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
        />
      </div>
      
      {/* Token Filter - Only show for token type */}
      {activeProductType === 'token' && (
        <div className="grid grid-cols-3 gap-2 pb-2">
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
              {token === 'all' ? '모든 토큰' : token}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// Smart Contract Seller Actions Component
const SmartContractSellerActions = ({ order }: { order: P2POrder }) => {
  const { reclaimAsset } = useP2PStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string>('');

  const handleReclaimAsset = async () => {
    // 자산 회수 확인 모달
    const confirmed = window.confirm(
      '⚠️ 자산 회수 확인\n\n' +
      '정말로 자산을 회수하시겠습니까?\n' +
      '• 자산 회수 시 판매 주문이 취소됩니다\n' +
      '• 가스비가 발생할 수 있습니다\n' +
      '• 이 작업은 되돌릴 수 없습니다'
    );
    
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const hash = await reclaimAsset(order.id);
      setTxHash(hash);
      alert('✅ 자산이 성공적으로 회수되었습니다!');
    } catch (error) {
      console.error('Failed to reclaim asset:', error);
      alert('❌ 자산 회수에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'listed': return '🛒 판매중';
      case 'pending': return '🛒 판매중';
      case 'completed': return '판매완료';
      case 'canceled': return '❌ 거래 취소';
      default: return '🛒 판매중';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'listed': return 'text-blue-600 bg-blue-50 border border-blue-200';
      case 'pending': return 'text-yellow-600 bg-yellow-50 border border-yellow-200';
      case 'completed': return 'text-green-600 bg-green-50 border border-green-200';
      case 'canceled': return 'text-red-600 bg-red-50 border border-red-200';
      default: return 'text-gray-600 bg-gray-50 border border-gray-200';
    }
  };

  return (
    <div className="space-y-3">
      <div className={`px-3 py-2 rounded-lg text-sm font-medium ${getStatusColor(order.smart_contract_status)}`}>
        {getStatusText(order.smart_contract_status)}
      </div>
      
      {order.smart_contract_status === 'listed' && (
        <div className="space-y-2">
          <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
            💡 상품이 스마트 컨트랙트에 안전하게 보관되어 있습니다.
          </div>
          <button
            onClick={handleReclaimAsset}
            disabled={isProcessing}
            className="w-full px-4 py-2 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 disabled:opacity-50 transition-colors"
          >
            {isProcessing ? '⏳ 처리중...' : '🔄 자산 회수'}
          </button>
        </div>
      )}
      
      {order.smart_contract_status === 'completed' && (
        <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
          ✅ 거래가 완료되어 결제금이 지갑으로 전송되었습니다.
        </div>
      )}
      
      {txHash && (
        <a
          href={getBSCScanUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border"
        >
          <span>📋 {formatTxHash(txHash)}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};

// Purchase Button Component
const PurchaseButton = ({ order }: { order: P2POrder }) => {
  const { depositAndExecute } = useP2PStore();
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePurchase = async () => {
    // 구매 확인 모달
    const confirmed = window.confirm(
      '💰 구매 확인\n\n' +
      `정말로 이 상품을 구매하시겠습니까?\n\n` +
      `📦 상품: ${order.token_symbol || '상품'} ${order.amount}개\n` +
      `💵 결제금액: ${formatCurrency(order.total_value)}\n\n` +
      '⚠️ 주의사항:\n' +
      '• 결제 즉시 상품이 지갑으로 전송됩니다\n' +
      '• 거래 완료 후 취소/환불이 불가능합니다\n' +
      '• 가스비가 추가로 발생할 수 있습니다\n' +
      '• 충분한 잔액을 보유하고 있는지 확인하세요'
    );
    
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      await depositAndExecute(order.id, order.total_value);
      alert(
        '🎉 구매가 성공적으로 완료되었습니다!\n\n' +
        '✅ 결제금이 판매자에게 전송되었습니다\n' +
        '✅ 상품이 귀하의 지갑으로 전송되었습니다\n' +
        '📋 트랜잭션 해시를 확인하여 거래 내역을 조회할 수 있습니다'
      );
    } catch (error) {
      console.error('Failed to purchase:', error);
      alert(
        '❌ 구매에 실패했습니다\n\n' +
        '가능한 원인:\n' +
        '• 잔액 부족\n' +
        '• 네트워크 오류\n' +
        '• 가스비 부족\n\n' +
        '잔액과 네트워크 상태를 확인 후 다시 시도해주세요.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handlePurchase}
      disabled={isProcessing}
      className="w-full px-6 py-3 text-white font-bold bg-gradient-to-r from-green-500 to-green-600 rounded-xl hover:from-green-600 hover:to-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
    >
      {isProcessing ? (
        <span className="flex items-center justify-center space-x-2">
          <span className="animate-spin">⏳</span>
          <span>구매 처리중...</span>
        </span>
      ) : (
        <span className="flex items-center justify-center space-x-2">
          <span>🛒</span>
          <span>즉시 구매 ({formatCurrency(order.total_value)})</span>
        </span>
      )}
    </button>
  );
};

// Smart Contract Buyer Actions Component
const SmartContractBuyerActions = ({ order }: { order: P2POrder }) => {
  const { depositAndExecute } = useP2PStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [txHash, setTxHash] = useState<string>('');

  const handlePurchase = async () => {
    // 구매 확인 모달
    const confirmed = window.confirm(
      '💰 구매 확인\n\n' +
      `정말로 이 상품을 구매하시겠습니까?\n\n` +
      `📦 상품: ${order.token_symbol || '상품'} ${order.amount}개\n` +
      `💵 결제금액: ${formatCurrency(order.total_value)}\n\n` +
      '⚠️ 주의사항:\n' +
      '• 결제 즉시 상품이 지갑으로 전송됩니다\n' +
      '• 거래 완료 후 취소/환불이 불가능합니다\n' +
      '• 가스비가 추가로 발생할 수 있습니다\n' +
      '• 충분한 잔액을 보유하고 있는지 확인하세요'
    );
    
    if (!confirmed) return;

    setIsProcessing(true);
    try {
      const hash = await depositAndExecute(order.id, order.total_value);
      setTxHash(hash);
      alert(
        '🎉 구매가 성공적으로 완료되었습니다!\n\n' +
        '✅ 결제금이 판매자에게 전송되었습니다\n' +
        '✅ 상품이 귀하의 지갑으로 전송되었습니다\n' +
        '📋 트랜잭션 해시를 확인하여 거래 내역을 조회할 수 있습니다'
      );
    } catch (error) {
      console.error('Failed to purchase:', error);
      alert(
        '❌ 구매에 실패했습니다\n\n' +
        '가능한 원인:\n' +
        '• 잔액 부족\n' +
        '• 네트워크 오류\n' +
        '• 가스비 부족\n\n' +
        '잔액과 네트워크 상태를 확인 후 다시 시도해주세요.'
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const canPurchase = order.smart_contract_status === 'listed';
  const isCompleted = order.smart_contract_status === 'completed';
  const isPending = order.smart_contract_status === 'pending';

  return (
    <div className="space-y-3">

      

      

      
      {isCompleted && (
        <div className="space-y-2">
          <div className="px-3 py-2 rounded-lg text-sm font-medium text-green-600 bg-green-50 border border-green-200">
            ✅ 거래 완료
          </div>
          <div className="text-xs text-green-600 bg-green-50 p-2 rounded border border-green-200">
            🎉 상품이 귀하의 지갑으로 성공적으로 전송되었습니다!
          </div>
        </div>
      )}
      
      {txHash && (
        <a
          href={getBSCScanUrl(txHash)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-1 text-xs text-blue-600 hover:text-blue-800 bg-blue-50 px-2 py-1 rounded border"
        >
          <span>📋 {formatTxHash(txHash)}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}
    </div>
  );
};

export const P2P: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('sell');
  const [activeProductType, setActiveProductType] = useState<ProductTabType>('token');
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
        await executeOrder(orderId); // Amount will be determined by the order
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
    
    // Filter by product type
    filtered = filtered.filter(order => order.product_type === activeProductType);
    
    // Filter by token (only for token type)
    if (activeProductType === 'token' && selectedToken !== 'all') {
      filtered = filtered.filter(order => order.token_symbol === selectedToken);
    }
    
    // Filter by search query (search by order ID/trade code)
    if (searchQuery) {
      filtered = filtered.filter(order => 
        order.id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  };

  // Create Order Button Component
  interface CreateOrderButtonProps {
    orderType: 'sell' | 'buy';
    productType: ProductTabType;
    onCreateOrder: (orderData: Partial<P2POrderForm>) => void;
  }

  const CreateOrderButton: React.FC<CreateOrderButtonProps> = ({ orderType, productType, onCreateOrder }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
    const [selectedDenomination, setSelectedDenomination] = useState<number>(10000);
    const [discountRate, setDiscountRate] = useState<number>(0);
    const [formData, setFormData] = useState<Partial<P2POrderForm>>({
      type: orderType,
      product_type: productType,
      payment_token_symbol: 'USDT',
      amount: 0,
      price_per_token: '',
      trade_method: 'smart_contract',
    });

    // IC Gift Certificate denominations
    const denominations = [
      { value: 10000, label: '1만원권', basePrice: 10 },
      { value: 50000, label: '5만원권', basePrice: 50 },
      { value: 100000, label: '10만원권', basePrice: 100 },
      { value: 500000, label: '50만원권', basePrice: 500 }
    ];

    // Get base price for selected denomination
    const getBasePrice = (denomination: number) => {
      const denom = denominations.find(d => d.value === denomination);
      return denom ? denom.basePrice : 10;
    };

    // Calculate final price with discount/premium
    const calculateFinalPrice = (basePrice: number, discountRate: number) => {
      return basePrice * (1 - discountRate / 100);
    };

    // Generate IC gift certificate product code
    const generateICGiftCode = (denomination: number) => {
      switch (denomination) {
        case 500000: return '50W0000';
        case 100000: return '10W0000';
        case 50000: return '5W0000';
        case 10000: return '1W0000';
        default: return '1W0000';
      }
    };

    // Generate product name for IC gift certificate
    const generateICGiftName = (denomination: number) => {
      const label = denominations.find(d => d.value === denomination)?.label || '1만원권';
      return `IC 상품권 NFT ${label}`;
    };

    // Update form data when denomination or discount changes for NFT
    const updateNFTFormData = (denomination: number, discount: number) => {
      const basePrice = getBasePrice(denomination);
      const finalPrice = calculateFinalPrice(basePrice, discount);
      const productName = generateICGiftName(denomination);
      const productCode = generateICGiftCode(denomination);
      
      setFormData({
        ...formData,
        amount: 1, // NFT는 항상 1개
        price_per_token: finalPrice.toString(),
        product_details: {
          name: productName,
          denomination: denomination,
          base_price: basePrice,
          discount_rate: discount,
          product_code: productCode
        }
      });
    };

    // Handle denomination change
    const handleDenominationChange = (denomination: number) => {
      setSelectedDenomination(denomination);
      if ((formData.product_type || productType) === 'nft') {
        updateNFTFormData(denomination, discountRate);
      }
    };

    // Handle discount rate change
    const handleDiscountRateChange = (discount: number) => {
      setDiscountRate(discount);
      if ((formData.product_type || productType) === 'nft') {
        updateNFTFormData(selectedDenomination, discount);
      }
    };

    // ICC/ICS 거래는 항상 USDT로 결제, 쿠폰은 모든 단위가 USDT
    const getPaymentTokens = (productType: P2PProductType): TokenSymbol[] => {
      if (productType === 'token' || productType === 'coupon') {
        return ['USDT']; // ICC/ICS 거래와 쿠폰은 USDT만 사용
      }
      return ['ICF', 'USDT']; // 기타 상품은 기존 방식
    };
    
    const tradingTokens: TokenSymbol[] = ['ICC', 'ICS'];

    const getProductTypeName = (productType: P2PProductType) => {
      switch (productType) {
        case 'token':
          return '코인';
        case 'nft':
          return 'IC상품권NFT';
        case 'coupon':
          return '쿠폰';
        case 'other':
          return '기타상품';
        default:
          return '코인';
      }
    };

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      
      // NFT 타입일 때 최종 데이터 업데이트
      if ((formData.product_type || productType) === 'nft') {
        const finalPrice = calculateFinalPrice(getBasePrice(selectedDenomination), discountRate);
        const productName = generateICGiftName(selectedDenomination);
        const productCode = generateICGiftCode(selectedDenomination);
        
        setFormData({
          ...formData,
          price_per_token: finalPrice.toString(),
          product_details: {
            name: productName,
            denomination: selectedDenomination,
            base_price: getBasePrice(selectedDenomination),
            discount_rate: discountRate,
            product_code: productCode
          }
        });
      }
      
      setIsConfirmModalOpen(true);
    };

    const handleConfirmOrder = async () => {
      try {
        const orderData = {
          ...formData,
          price_per_token: parseFloat(String(formData.price_per_token || '0'))
        };
        await onCreateOrder(orderData);
        
        // 성공 피드백
        alert('주문이 성공적으로 등록되었습니다!');
        
        setIsModalOpen(false);
        setIsConfirmModalOpen(false);
        setFormData({
          type: orderType,
          product_type: productType,
          payment_token_symbol: 'USDT',
          amount: 0,
          price_per_token: '',
          trade_method: 'smart_contract',
        });
      } catch (error) {
        console.error('주문 생성 실패:', error);
        alert('주문 생성에 실패했습니다. 다시 시도해주세요.');
      }
    };

    const getTokenIcon = (symbol: TokenSymbol) => {
      const iconMap = {
        ICC: '🪙',
        ICS: '💎',
        ICF: '🎁',
        ICG: '🏆',
        USDT: '💵',
        BTC: '₿',
        ETH: 'Ξ',
        BNB: '🔶',
        ADA: '🔷',
      };
      return iconMap[symbol] || '🪙';
    };

    return (
      <>
        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full py-3 bg-primary text-white font-medium rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center space-x-2"
        >
          <Plus className="w-5 h-5" />
          <span>{orderType === 'sell' ? '판매' : '구매'} 주문 생성</span>
        </button>

        {/* Modal */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900">
                    {orderType === 'sell' ? '판매' : '구매'} 주문 생성
                  </h2>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Product Type Display */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상품 타입
                    </label>
                    <select
                      value={formData.product_type || productType}
                      onChange={(e) => setFormData({ ...formData, product_type: e.target.value as P2PProductType })}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    >
                      <option value="token">코인</option>
                      <option value="nft">IC상품권NFT</option>
                      <option value="coupon">쿠폰</option>
                      <option value="other">기타</option>
                    </select>
                  </div>

                  {/* Smart Contract Info */}
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <div className="text-blue-500 mt-0.5">🔒</div>
                      <div className="text-sm text-blue-700">
                        <div className="font-medium mb-1">스마트 컨트랙트 안전거래</div>
                        <ul className="space-y-1 text-xs">
                          <li>• 자동화된 에스크로 시스템</li>
                          <li>• 투명하고 안전한 거래</li>
                          <li>• 네트워크 수수료 발생</li>
                          <li>• 1시간 타임아웃 적용</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Token Selection (for token type) */}
                  {(formData.product_type || productType) === 'token' && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        거래할 코인
                      </label>
                      <select
                        value={formData.token_symbol || ''}
                        onChange={(e) => setFormData({ ...formData, token_symbol: e.target.value as TokenSymbol })}
                        className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                      >
                        <option value="">코인을 선택하세요</option>
                        {tradingTokens.map((token) => (
                          <option key={token} value={token}>
                            {getTokenIcon(token)} {token}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* IC Gift Certificate Denomination Selection (for NFT type) */}
                  {(formData.product_type || productType) === 'nft' && (
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">
                          🎁 IC상품권 권종 선택
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {denominations.map((denom) => (
                            <button
                              key={denom.value}
                              type="button"
                              onClick={() => handleDenominationChange(denom.value)}
                              className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                selectedDenomination === denom.value
                                  ? 'border-primary bg-primary/10 text-primary font-semibold'
                                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                              }`}
                            >
                              <div className="text-sm font-medium">{denom.label}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                기본가: {denom.basePrice} USDT
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          💰 할인율/프리미엄 설정
                        </label>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-3">
                            <input
                              type="range"
                              min="-20"
                              max="20"
                              step="1"
                              value={discountRate}
                              onChange={(e) => handleDiscountRateChange(parseFloat(e.target.value))}
                              className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="w-20 text-center">
                              <span className={`text-sm font-semibold ${
                                discountRate > 0 ? 'text-red-600' : discountRate < 0 ? 'text-green-600' : 'text-gray-600'
                              }`}>
                                {discountRate > 0 ? '+' : ''}{discountRate}%
                              </span>
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 text-center">
                            음수: 할인 (예: -5% = 5% 할인) | 양수: 프리미엄 (예: +3% = 3% 추가)
                          </div>
                        </div>
                      </div>

                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="text-sm">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600">선택된 권종:</span>
                            <span className="font-semibold text-blue-800">
                              {denominations.find(d => d.value === selectedDenomination)?.label}
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600">기본 가격:</span>
                            <span className="text-gray-800">
                              {getBasePrice(selectedDenomination)} USDT
                            </span>
                          </div>
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-gray-600">할인율:</span>
                            <span className={discountRate > 0 ? 'text-red-600' : discountRate < 0 ? 'text-green-600' : 'text-gray-800'}>
                              {discountRate > 0 ? '+' : ''}{discountRate}%
                            </span>
                          </div>
                          <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                            <span className="text-gray-600 font-medium">최종 판매가:</span>
                            <span className="font-bold text-primary text-lg">
                              {calculateFinalPrice(getBasePrice(selectedDenomination), discountRate).toFixed(2)} USDT
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}



                  {/* Amount */}
                  <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     {(formData.product_type || productType) === 'nft' ? 'IC상품권 수량' :
                      (formData.product_type || productType) === 'coupon' ? '쿠폰 금액 (USDT)' : 
                      (formData.product_type || productType) === 'token' ? `수량 (${formData.token_symbol || '코인'})` : 
                      '수량'}
                   </label>
                   <input
                     type="number"
                     value={formData.amount || ''}
                     onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                     placeholder={
                       (formData.product_type || productType) === 'nft' ? '판매할 IC상품권 수량을 입력하세요' :
                       (formData.product_type || productType) === 'coupon' ? '쿠폰 금액을 USDT로 입력하세요' : 
                       (formData.product_type || productType) === 'token' ? `${formData.token_symbol || '코인'} 수량을 입력하세요` : 
                       '수량을 입력하세요'
                     }
                     className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                     min={(formData.product_type || productType) === 'nft' ? "1" : "0"}
                     step={(formData.product_type || productType) === 'nft' ? "1" : "0.01"}
                     required
                   />
                   {(formData.product_type || productType) === 'nft' && (
                     <div className="mt-1 text-xs text-gray-500">
                       💡 IC상품권은 개별 단위로 판매됩니다 (최소 1개)
                     </div>
                   )}
                 </div>

                 {/* Payment Token Selection */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     결제 코인
                   </label>
                   <select
                     value={formData.payment_token_symbol || 'USDT'}
                     onChange={(e) => setFormData({ ...formData, payment_token_symbol: e.target.value as TokenSymbol })}
                     className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                     required
                   >
                     {getPaymentTokens(formData.product_type || productType).map((token) => (
                       <option key={token} value={token}>
                         {getTokenIcon(token)} {token}
                       </option>
                     ))}
                   </select>
                 </div>

                 {/* Price */}
                 <div>
                   <label className="block text-sm font-medium text-gray-700 mb-2">
                     {(formData.product_type || productType) === 'nft' ? 'IC상품권 개당 가격 (USDT)' :
                      (formData.product_type || productType) === 'coupon' ? '할인가 (USDT)' : 
                      `개당 가격 (${formData.payment_token_symbol || 'USDT'})`}
                   </label>
                   {(formData.product_type || productType) === 'nft' ? (
                     <div className="space-y-2">
                       <input
                         type="number"
                         value={calculateFinalPrice(getBasePrice(selectedDenomination), discountRate).toFixed(4)}
                         readOnly
                         className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                       />
                       <div className="text-xs text-gray-500">
                         💡 가격은 선택한 권종과 할인율에 따라 자동 계산됩니다
                       </div>
                     </div>
                   ) : (
                     <input
                       type="number"
                       value={formData.price_per_token || ''}
                       onChange={(e) => setFormData({ ...formData, price_per_token: e.target.value === '' ? '' : e.target.value })}
                       placeholder={(formData.product_type || productType) === 'coupon' ? '할인된 가격을 USDT로 입력하세요' : 
                                   `개당 가격을 ${formData.payment_token_symbol || 'USDT'}로 입력하세요 (예: 1.2345)`}
                       className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                       min="0"
                       step="0.0001"
                       required
                     />
                   )}
                 </div>

                 {/* Total Value Display */}
                 {formData.amount && (
                   <div className="p-3 bg-primary/10 rounded-lg">
                     <div className="flex justify-between items-center">
                       <span className="text-sm text-gray-600">총 금액:</span>
                       <span className="font-semibold text-primary">
                         {(formData.product_type || productType) === 'nft' ? (
                           formatCurrency(formData.amount * calculateFinalPrice(getBasePrice(selectedDenomination), discountRate))
                         ) : formData.price_per_token ? (
                           formatCurrency(formData.amount * parseFloat(String(formData.price_per_token || '0')))
                         ) : (
                           '가격을 입력하세요'
                         )}
                       </span>
                     </div>
                   </div>
                 )}

                 {/* Submit Button */}
                 <div className="flex space-x-3 pt-4">
                   <button
                     type="button"
                     onClick={() => setIsModalOpen(false)}
                     className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                   >
                     취소
                   </button>
                   <button
                     type="submit"
                     className="flex-1 py-3 px-4 text-white bg-primary rounded-lg hover:bg-primary/90 transition-colors"
                   >
                     주문 생성
                   </button>
                 </div>
               </form>
             </div>
           </div>
         </div>
       )}

       {/* Confirmation Modal */}
       {isConfirmModalOpen && (
         <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
             <div className="p-6">
               <div className="text-center mb-6">
                 <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                   <span className="text-2xl">🔒</span>
                 </div>
                 <h3 className="text-xl font-bold text-gray-900 mb-2">
                   스마트 컨트랙트 {formData.type === 'sell' ? '판매' : '구매'} 등록
                 </h3>
                 <p className="text-gray-600 text-sm">
                   {formData.type === 'sell' ? '판매 등록' : '구매 등록'} 전에 다음 사항을 확인해주세요.
                 </p>
               </div>

               <div className="space-y-4 mb-6">
                 <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                   <h4 className="font-semibold text-red-800 mb-2">⚠️ 중요한 주의사항</h4>
                   <ul className="text-sm text-red-700 space-y-1">
                     {formData.type === 'sell' ? (
                       <>
                         <li>• <strong>{formData.type === 'sell' ? '판매 등록' : '구매 등록'} 즉시 상품이 에스크로 지갑으로 이동됩니다</strong></li>
                         <li>• 충분한 {formData.token_symbol} {formData.amount}개를 보유하고 있어야 합니다</li>
                         <li>• 가스비가 추가로 발생합니다 (본인 부담)</li>
                         <li>• 거래는 블록체인에서 실행되며 되돌릴 수 없습니다</li>
                         <li>• 구매자가 나타나면 즉시 거래가 완료됩니다</li>
                         <li>• {formData.type === 'sell' ? '판매' : '구매'} 취소 시에도 가스비가 발생합니다</li>
                       </>
                     ) : (
                       <>
                         <li>• <strong>구매 등록 즉시 결제금이 에스크로 지갑으로 이동됩니다</strong></li>
                         <li>• 충분한 {formatCurrency((formData.amount || 0) * parseFloat(String(formData.price_per_token || '0')))}를 보유하고 있어야 합니다</li>
                         <li>• 가스비가 추가로 발생합니다 (본인 부담)</li>
                         <li>• 거래는 블록체인에서 실행되며 되돌릴 수 없습니다</li>
                         <li>• 판매자가 나타나면 즉시 거래가 완료됩니다</li>
                         <li>• 구매 취소 시에도 가스비가 발생합니다</li>
                       </>
                     )}
                   </ul>
                 </div>

                 <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                   <div className="text-sm text-blue-800">
                     <p className="font-medium mb-1">💡 거래 프로세스</p>
                     <p className="text-xs">
                       {formData.type === 'sell' 
                         ? '1. 상품 즉시 에스크로 이동 → 2. 구매자 결제 → 3. 자동 거래 완료'
                         : '1. 결제금 즉시 에스크로 이동 → 2. 판매자 상품 전송 → 3. 자동 거래 완료'
                       }
                     </p>
                   </div>
                 </div>

                 <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-3 flex items-center space-x-2">
              <span>📋</span>
              <span>스마트 컨트랙트 주문 정보 확인</span>
            </h4>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 flex items-center space-x-1">
                  <span>🔄</span>
                  <span>거래 유형:</span>
                </span>
                <span className="font-semibold text-gray-900">{formData.type === 'sell' ? '판매' : '구매'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-gray-100">
                <span className="text-gray-600 flex items-center space-x-1">
                  <span>📦</span>
                  <span>상품 타입:</span>
                </span>
                <span className="font-semibold text-gray-900">{getProductTypeName(formData.product_type || 'token')}</span>
              </div>
              {(formData.product_type || productType) === 'nft' ? (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <span>🎁</span>
                      <span>상품권 권종:</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {denominations.find(d => d.value === selectedDenomination)?.label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <span>📊</span>
                      <span>수량:</span>
                    </span>
                    <span className="font-semibold text-gray-900">{formData.amount}개</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <span>💰</span>
                      <span>기본 가격:</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {getBasePrice(selectedDenomination)} USDT
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <span>📈</span>
                      <span>할인율:</span>
                    </span>
                    <span className={`font-semibold ${
                      discountRate > 0 ? 'text-red-600' : discountRate < 0 ? 'text-green-600' : 'text-gray-900'
                    }`}>
                      {discountRate > 0 ? '+' : ''}{discountRate}%
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <span>💵</span>
                      <span>개당 판매가:</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {calculateFinalPrice(getBasePrice(selectedDenomination), discountRate).toFixed(2)} USDT
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <span>🪙</span>
                      <span>거래 코인:</span>
                    </span>
                    <span className="font-semibold text-gray-900">{formData.token_symbol}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <span>📊</span>
                      <span>{(formData.product_type || productType) === 'coupon' ? '쿠폰 금액:' : '수량:'}</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {(formData.product_type || productType) === 'coupon' 
                        ? `${formatCurrency(formData.amount || 0)}`
                        : (formData.product_type || productType) === 'token'
                        ? `${formData.amount} ${formData.token_symbol}`
                        : `${formData.amount}개`
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="text-gray-600 flex items-center space-x-1">
                      <span>💰</span>
                      <span>{(formData.product_type || productType) === 'coupon' ? '할인가:' : '개당 가격:'}</span>
                    </span>
                    <span className="font-semibold text-gray-900">
                      {(formData.product_type || productType) === 'coupon' 
                        ? `${formatCurrency(formData.price_per_token || 0)}`
                        : `${formatCurrency(formData.price_per_token || 0)}`
                      }
                    </span>
                  </div>
                </>
              )}
              <div className="flex justify-between items-center py-3 bg-primary/5 rounded-lg px-3 border border-primary/20">
                <span className="text-primary font-semibold flex items-center space-x-1">
                  <span>💵</span>
                  <span>총 결제금액:</span>
                </span>
                <span className="font-bold text-xl text-primary">
                  {(formData.product_type || productType) === 'coupon' 
                    ? `${formatCurrency((formData.amount || 0) * parseFloat(String(formData.price_per_token || '0')))}`
                    : `${formatCurrency((formData.amount || 0) * parseFloat(String(formData.price_per_token || '0')))}`
                  }
                </span>
              </div>
            </div>
          </div>
               </div>

               <div className="flex space-x-3">
                 <button
                   type="button"
                   onClick={() => setIsConfirmModalOpen(false)}
                   className="flex-1 py-3 px-4 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                 >
                   취소
                 </button>
                 <button
                   type="button"
                   onClick={handleConfirmOrder}
                   className="flex-1 py-3 px-4 text-white bg-gradient-to-r from-primary to-primary/90 rounded-lg hover:from-primary/90 hover:to-primary/80 transition-all duration-200 font-bold shadow-lg"
                 >
                   <span className="flex items-center justify-center space-x-2">
                     <span>🔒</span>
                     <span>스마트 컨트랙트 {formData.type === 'sell' ? '판매' : '구매'} 등록</span>
                   </span>
                 </button>
               </div>
             </div>
           </div>
         </div>
       )}
     </>
   );
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
          판매
        </TabButton>
        <TabButton
          active={activeTab === 'buy'}
          onClick={() => setActiveTab('buy')}
        >
          구매
        </TabButton>
        <TabButton
          active={activeTab === 'my-trades'}
          onClick={() => setActiveTab('my-trades')}
        >
          거래내역
        </TabButton>
      </div>

      {/* Product Type Tabs */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-700">상품 타입</h3>
        <ProductTypeTabs
          activeProductType={activeProductType}
          onProductTypeChange={setActiveProductType}
        />
        
        {/* IC Gift Certificate Info for NFT Tab */}
        {activeProductType === 'nft' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1 flex items-center space-x-1">
                <span>🎁</span>
                <span>IC상품권 NFT 안내</span>
              </p>
              <p className="text-xs mb-2">
                이 탭에서는 IC상품권 NFT만 거래됩니다. (1만원권, 5만원권, 10만원권, 50만원권)
              </p>
              <p className="text-xs text-blue-600">
                💡 다른 상품권은 "쿠폰" 또는 "기타" 탭에서 거래하실 수 있습니다.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Filter Bar */}
      <FilterBar
        onTokenFilter={setSelectedToken}
        onSearch={setSearchQuery}
        selectedToken={selectedToken}
        activeProductType={activeProductType}
      />

      {/* Create Order Button */}
      {activeTab !== 'my-trades' && (
        <CreateOrderButton
          orderType={activeTab}
          productType={activeProductType}
          onCreateOrder={async (orderData) => {
            try {
              await createOrder(orderData as P2POrderForm);
              // createOrder already updates the store, no need to fetch again
            } catch (error) {
              console.error('Failed to create order:', error);
              throw error; // Re-throw to handle in CreateOrderButton
            }
          }}
        />
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {activeTab === 'my-trades' ? '거래' : `${activeTab === 'sell' ? '판매' : '구매'} 주문`}를 찾을 수 없습니다
            </h3>
            <p className="text-gray-500">
              {activeTab === 'my-trades'
                ? '아직 거래를 하지 않았습니다.'
                : `조건에 맞는 ${activeTab === 'sell' ? '판매' : '구매'} 주문이 없습니다.`}
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