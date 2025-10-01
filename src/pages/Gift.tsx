import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'react-router-dom';
import { Search, Filter, QrCode, ShoppingCart, Star, Gift as GiftIcon, CreditCard, Smartphone, Coins, Package, Award, X, Check, Loader2 } from 'lucide-react';
import { useGiftStore } from '@/stores/giftStore';
import { useUserStore } from '@/stores/userStore';
import { formatCurrency, cn } from '@/lib/utils';
import { GiftCardProduct, GiftCard } from '@/types';
import { toast } from 'sonner';
import { TabButton, LoadingSpinner, EmptyState } from '@/components/common';
import ICGiftCard from '../components/ICGiftCard';

type TabType = 'store' | 'my-cards' | 'qr-pay';
type ProductType = 'ic-gift-nft' | 'existing-gift-cards' | 'general-products';
type PaymentMethod = 'usdt' | 'icf' | 'ic-nft';

interface PurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  productType: 'ic-nft' | 'gift-card' | 'general';
  productInfo: {
    name: string;
    price: number;
    denomination?: number;
    id?: string;
  };
  onConfirm: (paymentMethod: PaymentMethod, quantity?: number) => void;
  isLoading?: boolean;
}

interface ICGiftNFT {
  denomination: number;
  price: number;
  discount: number;
}

interface GeneralProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating: number;
  stock: number;
}

interface ProductTypeInfo {
  id: ProductType;
  name: string;
  icon: string;
  color: string;
}



// Purchase Modal Component
const PurchaseModal: React.FC<PurchaseModalProps> = ({ 
  isOpen, 
  onClose, 
  productType, 
  productInfo, 
  onConfirm, 
  isLoading = false 
}) => {
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethod>('usdt');
  const [quantity, setQuantity] = useState(1);
  const [showDeliveryInfo, setShowDeliveryInfo] = useState(false);
  const [deliveryInfo, setDeliveryInfo] = useState({
    name: '',
    phone: '',
    address: '',
    memo: ''
  });

  if (!isOpen) return null;

  const getPaymentMethods = () => {
    switch (productType) {
      case 'ic-nft':
        return [
          { id: 'usdt' as PaymentMethod, name: 'USDT', icon: '💰', description: 'USDT로 결제' },
          { id: 'icf' as PaymentMethod, name: 'ICF', icon: '🪙', description: 'ICF 토큰으로 결제' }
        ];
      case 'gift-card':
        return [
          { id: 'usdt' as PaymentMethod, name: 'USDT', icon: '💰', description: 'USDT로 결제' },
          { id: 'icf' as PaymentMethod, name: 'ICF', icon: '🪙', description: 'ICF 토큰으로 결제' },
          { id: 'ic-nft' as PaymentMethod, name: 'IC상품권 NFT', icon: '🎫', description: 'IC상품권 NFT로 결제' }
        ];
      case 'general':
        return [
          { id: 'usdt' as PaymentMethod, name: 'USDT', icon: '💰', description: 'USDT로 결제' },
          { id: 'icf' as PaymentMethod, name: 'ICF', icon: '🪙', description: 'ICF 토큰으로 결제' },
          { id: 'ic-nft' as PaymentMethod, name: 'IC상품권 NFT', icon: '🎫', description: 'IC상품권 NFT로 결제' }
        ];
      default:
        return [];
    }
  };

  const handleConfirm = () => {
    if (productType === 'general' && showDeliveryInfo) {
      // 배송 정보 검증
      if (!deliveryInfo.name || !deliveryInfo.phone || !deliveryInfo.address) {
        toast.error('배송 정보를 모두 입력해주세요.');
        return;
      }
    }
    onConfirm(selectedPayment, quantity);
  };

  const totalPrice = productInfo.price * quantity;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold text-gray-900">구매 확인</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-medium text-gray-900 mb-2">{productInfo.name}</h4>
            {productInfo.denomination && (
              <p className="text-sm text-gray-600 mb-2">
                권종: {productInfo.denomination.toLocaleString()}원
              </p>
            )}
            <p className="text-lg font-bold text-primary">
              {formatCurrency(productInfo.price)}
            </p>
          </div>

          {/* Quantity Selection (for gift cards and general products) */}
          {productType !== 'ic-nft' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                수량
              </label>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  -
                </button>
                <span className="w-12 text-center font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-8 h-8 rounded-lg border border-gray-300 flex items-center justify-center hover:bg-gray-50"
                >
                  +
                </button>
              </div>
            </div>
          )}

          {/* Payment Method Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              결제 방법
            </label>
            <div className="space-y-2">
              {getPaymentMethods().map((method) => (
                <button
                  key={method.id}
                  onClick={() => setSelectedPayment(method.id)}
                  className={cn(
                    'w-full p-3 rounded-xl border-2 transition-all duration-200 text-left',
                    selectedPayment === method.id
                      ? 'border-primary bg-primary/5'
                      : 'border-gray-200 hover:border-gray-300'
                  )}
                >
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{method.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{method.name}</p>
                      <p className="text-sm text-gray-500">{method.description}</p>
                    </div>
                    {selectedPayment === method.id && (
                      <Check className="w-5 h-5 text-primary" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Delivery Info for General Products */}
          {productType === 'general' && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-700">
                  배송 정보
                </label>
                <button
                  onClick={() => setShowDeliveryInfo(!showDeliveryInfo)}
                  className="text-sm text-primary hover:text-primary/80"
                >
                  {showDeliveryInfo ? '숨기기' : '입력하기'}
                </button>
              </div>
              
              {showDeliveryInfo && (
                <div className="space-y-3 bg-gray-50 rounded-xl p-4">
                  <input
                    type="text"
                    placeholder="받는 분 성함"
                    value={deliveryInfo.name}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, name: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="tel"
                    placeholder="연락처"
                    value={deliveryInfo.phone}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, phone: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <input
                    type="text"
                    placeholder="배송 주소"
                    value={deliveryInfo.address}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, address: e.target.value})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <textarea
                    placeholder="배송 메모 (선택사항)"
                    value={deliveryInfo.memo}
                    onChange={(e) => setDeliveryInfo({...deliveryInfo, memo: e.target.value})}
                    rows={2}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                  />
                </div>
              )}
            </div>
          )}

          {/* Total Price */}
          <div className="bg-primary/5 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">총 결제 금액</span>
              <span className="text-xl font-bold text-primary">
                {formatCurrency(totalPrice)}
              </span>
            </div>
            {quantity > 1 && (
              <p className="text-xs text-gray-500 mt-1">
                {formatCurrency(productInfo.price)} × {quantity}개
              </p>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 rounded-b-2xl">
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-3 px-4 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              취소
            </button>
            <button
              onClick={handleConfirm}
              disabled={isLoading}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>처리중...</span>
                </>
              ) : (
                <span>구매 확정</span>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};



// Existing Gift Cards Component (Smaller)
interface ExistingGiftCardProps {
  product: GiftCardProduct;
  onPurchase: (productId: string) => void;
}

const ExistingGiftCard: React.FC<ExistingGiftCardProps> = ({ product, onPurchase }) => {
  const getBrandIcon = (brand: string) => {
    const icons: Record<string, string> = {
      'starbucks': '☕',
      'cgv': '🎬',
      'lotte': '🏪',
      'gmarket': '🛒',
      'olive_young': '💄',
      'kyobo': '📚',
    };
    return icons[brand] || '🎁';
  };

  const getBrandColor = (brand: string) => {
    const colors: Record<string, string> = {
      'starbucks': 'from-green-500 to-green-600',
      'cgv': 'from-red-500 to-red-600',
      'lotte': 'from-blue-500 to-blue-600',
      'gmarket': 'from-orange-500 to-orange-600',
      'olive_young': 'from-pink-500 to-pink-600',
      'kyobo': 'from-purple-500 to-purple-600',
    };
    return colors[brand] || 'from-gray-500 to-gray-600';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
      {/* Compact Header */}
      <div className={cn(
        'relative h-20 bg-gradient-to-br text-white p-3',
        getBrandColor(product.brand)
      )}>
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center space-x-2">
            <div className="text-2xl">{getBrandIcon(product.brand)}</div>
            <div>
              <h4 className="font-semibold text-sm">{product.name}</h4>
            </div>
          </div>
        </div>
      </div>
      
      {/* Compact Content */}
      <div className="p-3 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-primary">
            {formatCurrency(product.price || 0)}
          </p>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs">{product.rating}</span>
          </div>
        </div>
        
        <button
          onClick={() => onPurchase(product.id)}
          disabled={product.stock === 0}
          className={cn(
            'w-full py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-1',
            product.stock > 0
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          <ShoppingCart className="w-3 h-3" />
          <span>{product.stock > 0 ? '구매' : '품절'}</span>
        </button>
      </div>
    </div>
  );
};

// General Products Component (Smaller)
interface GeneralProductProps {
  product: {
    id: string;
    name: string;
    price: number;
    image: string;
    category: string;
    rating: number;
    stock: number;
  };
  onPurchase: (productId: string) => void;
}

const GeneralProduct: React.FC<GeneralProductProps> = ({ product, onPurchase }) => {
  const getCategoryIcon = (category: string) => {
    const icons: Record<string, string> = {
      'electronics': '📱',
      'home': '🏠',
      'fashion': '👕',
      'sports': '⚽',
      'books': '📚',
      'toys': '🧸',
    };
    return icons[category] || '📦';
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100 hover:shadow-lg transition-shadow">
      {/* Product Image */}
      <div className="h-24 bg-gray-100 flex items-center justify-center">
        <div className="text-3xl">{getCategoryIcon(product.category)}</div>
      </div>
      
      {/* Product Info */}
      <div className="p-3 space-y-2">
        <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{product.name}</h4>
        
        <div className="flex items-center justify-between">
          <p className="text-lg font-bold text-primary">
            {formatCurrency(product.price)}
          </p>
          <div className="flex items-center space-x-1">
            <Star className="w-3 h-3 text-yellow-400 fill-current" />
            <span className="text-xs">{product.rating}</span>
          </div>
        </div>
        
        <button
          onClick={() => onPurchase(product.id)}
          disabled={product.stock === 0}
          className={cn(
            'w-full py-2 text-sm font-medium rounded-lg transition-colors flex items-center justify-center space-x-1',
            product.stock > 0
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          <ShoppingCart className="w-3 h-3" />
          <span>{product.stock > 0 ? '구매' : '품절'}</span>
        </button>
      </div>
    </div>
  );
};

interface GiftCardProps {
  product: GiftCardProduct;
  onPurchase: (productId: string) => void;
}

const GiftCardItem: React.FC<GiftCardProps> = ({ product, onPurchase }) => {
  const getBrandIcon = (brand: string) => {
    const icons: Record<string, string> = {
      'starbucks': '☕',
      'cgv': '🎬',
      'lotte': '🏪',
      'gmarket': '🛒',
      'olive_young': '💄',
      'kyobo': '📚',
    };
    return icons[brand] || '🎁';
  };

  const getBrandColor = (brand: string) => {
    const colors: Record<string, string> = {
      'starbucks': 'from-green-600 to-green-700',
      'cgv': 'from-red-600 to-red-700',
      'lotte': 'from-blue-600 to-blue-700',
      'gmarket': 'from-orange-600 to-orange-700',
      'olive_young': 'from-pink-600 to-pink-700',
      'kyobo': 'from-purple-600 to-purple-700',
    };
    return colors[brand] || 'from-gray-600 to-gray-700';
  };

  const getDiscountPercentage = () => {
    if (product.original_price && product.original_price > product.price) {
      return Math.round(((product.original_price - product.price) / product.original_price) * 100);
    }
    return 0;
  };

  const discount = getDiscountPercentage();

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* Premium Banknote Design Header */}
      <div className={cn(
        'relative h-32 bg-gradient-to-br text-white p-4',
        getBrandColor(product.brand)
      )}>
        {/* Decorative Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-2 w-8 h-8 border-2 border-white rounded-full"></div>
          <div className="absolute top-2 right-2 w-6 h-6 border border-white rounded-full"></div>
          <div className="absolute bottom-2 left-2 w-4 h-4 border border-white rounded-full"></div>
          <div className="absolute bottom-2 right-2 w-10 h-10 border-2 border-white rounded-full"></div>
        </div>
        
        {/* Brand Info */}
        <div className="relative z-10 flex items-center justify-between h-full">
          <div className="flex items-center space-x-3">
            <div className="text-4xl">{getBrandIcon(product.brand)}</div>
            <div>
              <h3 className="font-bold text-lg">{product.name}</h3>
              <p className="text-sm opacity-90">{product.description}</p>
            </div>
          </div>
          
          {discount > 0 && (
            <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1">
              <p className="text-sm font-bold">{discount}% OFF</p>
            </div>
          )}
        </div>
      </div>
      
      {/* Card Content */}
      <div className="p-4 space-y-4">
        {/* Price Section */}
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <p className="text-2xl font-bold text-primary">
              {formatCurrency(product.price || 0)}
            </p>
              {product.original_price && product.original_price > (product.price || 0) && (
                <p className="text-sm text-gray-500 line-through">
                  {formatCurrency(product.original_price)}
                </p>
              )}
            </div>
            <p className="text-sm text-gray-500">Gift Card Value</p>
          </div>
          
          <div className="flex items-center space-x-1">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">{product.rating}</span>
            <span className="text-sm text-gray-500">({product.reviews})</span>
          </div>
        </div>
        
        {/* Features */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Validity</span>
            <span className="font-medium">{product.validity_days} days</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">Available</span>
            <span className={cn(
              'font-medium',
              product.stock > 0 ? 'text-green-600' : 'text-red-600'
            )}>
              {product.stock > 0 ? `${product.stock} left` : 'Out of Stock'}
            </span>
          </div>
        </div>
        
        {/* Purchase Button */}
        <button
          onClick={() => onPurchase(product.id)}
          disabled={product.stock === 0}
          className={cn(
            'w-full py-3 font-medium rounded-xl transition-all duration-200 flex items-center justify-center space-x-2',
            product.stock > 0
              ? 'bg-primary text-white hover:bg-primary/90 shadow-md hover:shadow-lg'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          )}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>{product.stock > 0 ? 'Purchase Now' : 'Out of Stock'}</span>
        </button>
      </div>
    </div>
  );
};

// IC Gift NFT Card for My Cards Tab


// Purchase Detail Modal
interface PurchaseDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  nftData: {
    id: string;
    denomination: number;
    currentBalance: number;
    purchaseDate: string;
    status: 'active' | 'used' | 'expired';
    transactionHash: string;
    purchasePrice: number;
  } | null;
}

const PurchaseDetailModal: React.FC<PurchaseDetailModalProps> = ({ isOpen, onClose, nftData }) => {
  if (!isOpen || !nftData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-900">구매 내역 상세</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* NFT Image */}
          <div className="text-center">
            <img
              src="https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=ic%20gift%20card%20nft%20premium%20blue%20modern%20design&image_size=square"
              alt="IC Gift NFT"
              className="w-32 h-32 object-cover rounded-xl mx-auto mb-4"
            />
            <h3 className="text-lg font-semibold text-gray-900">IC Gift NFT</h3>
            <p className="text-sm text-gray-500">#{nftData.id.slice(-8)}</p>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h4 className="font-medium text-gray-900">기본 정보</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">액면가</span>
                  <span className="font-medium">{nftData.denomination.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">현재 잔액</span>
                  <span className="font-medium text-primary">{nftData.currentBalance.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">상태</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    nftData.status === 'active' ? 'bg-green-100 text-green-800' :
                    nftData.status === 'used' ? 'bg-gray-100 text-gray-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {nftData.status === 'active' ? '사용 가능' :
                     nftData.status === 'used' ? '사용 완료' : '만료됨'}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h4 className="font-medium text-gray-900">구매 정보</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">구매일</span>
                  <span className="font-medium">{nftData.purchaseDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">구매 가격</span>
                  <span className="font-medium">{nftData.purchasePrice.toLocaleString()}원</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">할인율</span>
                  <span className="font-medium text-green-600">
                    {Math.round(((nftData.denomination - nftData.purchasePrice) / nftData.denomination) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4 space-y-3">
              <h4 className="font-medium text-gray-900">블록체인 정보</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">트랜잭션 해시</span>
                  <span className="font-mono text-xs text-gray-500 break-all">
                    {nftData.transactionHash}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">네트워크</span>
                  <span className="font-medium">BNB Smart Chain</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
            {nftData.status === 'active' && (
              <button className="flex-1 bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary/90 transition-colors">
                사용하기
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

interface MyGiftCardProps {
  giftCard: GiftCard;
  onGenerateQR: (cardId: string) => void;
  onUseCard: (cardId: string) => void;
}

const MyGiftCard: React.FC<MyGiftCardProps> = ({ giftCard, onGenerateQR, onUseCard }) => {
  const getBrandIcon = (brand: string) => {
    const icons: Record<string, string> = {
      'starbucks': '☕',
      'cgv': '🎬',
      'lotte': '🏪',
      'gmarket': '🛒',
      'olive_young': '💄',
      'kyobo': '📚',
    };
    return icons[brand] || '🎁';
  };

  const getBrandColor = (brand: string) => {
    const colors: Record<string, string> = {
      'starbucks': 'from-green-600 to-green-700',
      'cgv': 'from-red-600 to-red-700',
      'lotte': 'from-blue-600 to-blue-700',
      'gmarket': 'from-orange-600 to-orange-700',
      'olive_young': 'from-pink-600 to-pink-700',
      'kyobo': 'from-purple-600 to-purple-700',
    };
    return colors[brand] || 'from-gray-600 to-gray-700';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600 bg-green-50';
      case 'used':
        return 'text-gray-600 bg-gray-50';
      case 'expired':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'used':
        return 'Used';
      case 'expired':
        return 'Expired';
      default:
        return status;
    }
  };

  const isUsable = giftCard.status === 'active';

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100">
      {/* Gift Card Design */}
      <div className={cn(
        'relative h-40 bg-gradient-to-br text-white p-4',
        getBrandColor(giftCard.brand)
      )}>
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-3 left-3 w-12 h-12 border-2 border-white rounded-full"></div>
          <div className="absolute top-3 right-3 w-8 h-8 border border-white rounded-full"></div>
          <div className="absolute bottom-3 left-3 w-6 h-6 border border-white rounded-full"></div>
          <div className="absolute bottom-3 right-3 w-14 h-14 border-2 border-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-20 h-20 border border-white rounded-full"></div>
        </div>
        
        {/* Card Header */}
        <div className="relative z-10 flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="text-3xl">{getBrandIcon(giftCard.brand)}</div>
            <div>
              <h3 className="font-bold text-lg">{giftCard.product_name}</h3>
            </div>
          </div>
          
          <div className={cn(
            'px-3 py-1 rounded-lg text-xs font-medium',
            getStatusColor(giftCard.status)
          )}>
            {getStatusText(giftCard.status)}
          </div>
        </div>
        
        {/* Card Value */}
        <div className="relative z-10 mt-auto">
          <p className="text-sm opacity-90">Card Value</p>
          <p className="text-2xl font-bold">{formatCurrency(giftCard.value || giftCard.face_value || giftCard.current_balance)}</p>
        </div>
      </div>
      
      {/* Card Details */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-500">Card Number</p>
            <p className="font-mono font-medium">{giftCard.card_number}</p>
          </div>
          <div>
            <p className="text-gray-500">Expires</p>
            <p className="font-medium">
              {new Date(giftCard.expires_at).toLocaleDateString()}
            </p>
          </div>
        </div>
        
        {giftCard.pin && (
          <div className="text-sm">
            <p className="text-gray-500">PIN</p>
            <p className="font-mono font-medium">{giftCard.pin}</p>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onGenerateQR(giftCard.id)}
            disabled={!isUsable}
            className={cn(
              'py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2',
              isUsable
                ? 'bg-primary text-white hover:bg-primary/90'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            <QrCode className="w-4 h-4" />
            <span>QR Code</span>
          </button>
          
          <button
            onClick={() => onUseCard(giftCard.id)}
            disabled={!isUsable}
            className={cn(
              'py-2 px-4 rounded-xl text-sm font-medium transition-colors flex items-center justify-center space-x-2',
              isUsable
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            )}
          >
            <CreditCard className="w-4 h-4" />
            <span>Use Card</span>
          </button>
        </div>
      </div>
    </div>
  );
};

interface QRPaymentProps {
  onGeneratePaymentQR: () => void;
}

const QRPayment: React.FC<QRPaymentProps> = ({ onGeneratePaymentQR }) => {
  const [selectedCard, setSelectedCard] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [qrGenerated, setQrGenerated] = useState(false);

  const handleGenerateQR = () => {
    if (selectedCard && amount) {
      setQrGenerated(true);
      onGeneratePaymentQR();
    }
  };

  return (
    <div className="space-y-6">
      {!qrGenerated ? (
        <>
          {/* QR Payment Setup */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                QR Payment
              </h3>
              <p className="text-gray-500">
                Generate QR code to pay with your gift cards
              </p>
            </div>
            
            <div className="space-y-4">
              {/* Card Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Gift Card
                </label>
                <select
                  value={selectedCard}
                  onChange={(e) => setSelectedCard(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Choose a gift card</option>
                  <option value="starbucks-001">IC Gift NFT - 50.00 USDT</option>
                  <option value="cgv-002">IC Gift NFT - 30.00 USDT</option>
                  <option value="lotte-003">IC Gift NFT - 100.00 USDT</option>
                </select>
              </div>
              
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">USDT</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
              
              {/* Generate Button */}
              <button
                onClick={handleGenerateQR}
                disabled={!selectedCard || !amount}
                className={cn(
                  'w-full py-3 font-medium rounded-xl transition-colors flex items-center justify-center space-x-2',
                  selectedCard && amount
                    ? 'bg-primary text-white hover:bg-primary/90'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                )}
              >
                <QrCode className="w-5 h-5" />
                <span>QR 코드 생성</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Generated QR Code */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              결제 QR 코드
            </h3>
            
            {/* QR Code Placeholder */}
            <div className="w-64 h-64 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <div className="text-8xl">⬛</div>
            </div>
            
            <div className="space-y-2 mb-6">
              <p className="text-lg font-semibold text-primary">
                {amount} USDT
              </p>
              <p className="text-sm text-gray-500">
                이 QR 코드를 가맹점에 보여주세요
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setQrGenerated(false)}
                className="py-2 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                뒤로
              </button>
              <button className="py-2 px-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors">
                공유
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const Gift: React.FC = () => {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<TabType>('store');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedProductType, setSelectedProductType] = useState<ProductType>('ic-gift-nft');
  const [purchaseDetailModal, setPurchaseDetailModal] = useState<{
    isOpen: boolean;
    nftData: any;
  }>({ isOpen: false, nftData: null });
  
  const { 
    products, 
    userGiftCards, 
    fetchProducts, 
    fetchUserGiftCards, 
    purchaseGiftCard,
    generateQRCode,
    useGiftCard,
    isLoading 
  } = useGiftStore();
  
  const { user } = useUserStore();

  // IC Gift NFT Data
  const icGiftNFTs = [
    { denomination: 10000, price: 10, discount: 5 },
    { denomination: 50000, price: 48, discount: 4 },
    { denomination: 100000, price: 95, discount: 5 },
    { denomination: 500000, price: 470, discount: 6 },
  ];

  // Mock IC Gift NFT data for My Cards tab
  const myICGiftNFTs = [
    {
      id: 'ic-nft-001',
      denomination: 10000,
      currentBalance: 8500,
      purchaseDate: '2024-01-15',
      status: 'active' as const,
      transactionHash: '0x1234567890abcdef1234567890abcdef12345678',
      purchasePrice: 9500
    },
    {
      id: 'ic-nft-002',
      denomination: 50000,
      currentBalance: 42000,
      purchaseDate: '2024-01-20',
      status: 'active' as const,
      transactionHash: '0xabcdef1234567890abcdef1234567890abcdef12',
      purchasePrice: 47500
    },
    {
      id: 'ic-nft-003',
      denomination: 100000,
      currentBalance: 0,
      purchaseDate: '2024-01-10',
      status: 'used' as const,
      transactionHash: '0x567890abcdef1234567890abcdef1234567890ab',
      purchasePrice: 95000
    },
    {
      id: 'ic-nft-004',
      denomination: 500000,
      currentBalance: 500000,
      purchaseDate: '2024-01-25',
      status: 'active' as const,
      transactionHash: '0xcdef1234567890abcdef1234567890abcdef1234',
      purchasePrice: 475000
    }
  ];

  // Existing Gift Cards Data (Mock)
  const existingGiftCards: GiftCardProduct[] = [
    {
      id: 'starbucks-1',
      card_type: 'starbucks',
      name: '스타벅스',
      description: '스타벅스 기프트카드',
      face_values: [10000, 30000, 50000],
      discount_rate: 0.1,
      image_url: '/images/starbucks.png',
      is_available: true,
      brand: 'starbucks',
      category: 'food',
      price: 10,
      original_price: 12,
      rating: 4.8,
      reviews: 1250,
      validity_days: 365,
      stock: 50,
    },
    {
      id: 'cgv-1',
      card_type: 'cgv',
      name: 'CGV',
      description: 'CGV 영화관람권',
      face_values: [12000, 15000],
      discount_rate: 0.2,
      image_url: '/images/cgv.png',
      is_available: true,
      brand: 'cgv',
      category: 'entertainment',
      price: 12,
      original_price: 15,
      rating: 4.7,
      reviews: 890,
      validity_days: 180,
      stock: 30,
    },
    {
      id: 'lotte-1',
      card_type: 'lotte',
      name: '롯데리아',
      description: '롯데리아 기프트카드',
      face_values: [8000, 10000],
      discount_rate: 0.2,
      image_url: '/images/lotte.png',
      is_available: true,
      brand: 'lotte',
      category: 'food',
      price: 8,
      original_price: 10,
      rating: 4.5,
      reviews: 650,
      validity_days: 365,
      stock: 25,
    },
    {
      id: 'gmarket-1',
      card_type: 'gmarket',
      name: 'G마켓',
      description: 'G마켓 상품권',
      face_values: [20000, 50000],
      discount_rate: 0.2,
      image_url: '/images/gmarket.png',
      is_available: true,
      brand: 'gmarket',
      category: 'shopping',
      price: 20,
      original_price: 25,
      rating: 4.6,
      reviews: 1100,
      validity_days: 365,
      stock: 40,
    },
    {
      id: 'olive-1',
      card_type: 'olive_young',
      name: '올리브영',
      description: '올리브영 기프트카드',
      face_values: [15000, 30000],
      discount_rate: 0.15,
      image_url: '/images/olive_young.png',
      is_available: true,
      brand: 'olive_young',
      category: 'beauty',
      price: 15,
      original_price: 18,
      rating: 4.9,
      reviews: 780,
      validity_days: 365,
      stock: 35,
    },
    {
      id: 'kyobo-1',
      card_type: 'kyobo',
      name: '교보문고',
      description: '교보문고 도서상품권',
      face_values: [10000, 20000],
      discount_rate: 0.15,
      image_url: '/images/kyobo.png',
      is_available: true,
      brand: 'kyobo',
      category: 'books',
      price: 10,
      original_price: 12,
      rating: 4.7,
      reviews: 520,
      validity_days: 365,
      stock: 20,
    },
  ];

  // General Products Data (Mock)
  const generalProducts = [
    {
      id: 'phone-1',
      name: '아이폰 15 Pro',
      price: 1200,
      image: '',
      category: 'electronics',
      rating: 4.8,
      stock: 10,
    },
    {
      id: 'laptop-1',
      name: '맥북 프로 M3',
      price: 2000,
      image: '',
      category: 'electronics',
      rating: 4.9,
      stock: 5,
    },
    {
      id: 'headphone-1',
      name: '에어팟 프로 2세대',
      price: 250,
      image: '',
      category: 'electronics',
      rating: 4.7,
      stock: 15,
    },
    {
      id: 'watch-1',
      name: '애플워치 시리즈 9',
      price: 400,
      image: '',
      category: 'electronics',
      rating: 4.6,
      stock: 8,
    },
    {
      id: 'bag-1',
      name: '명품 핸드백',
      price: 800,
      image: '',
      category: 'fashion',
      rating: 4.5,
      stock: 3,
    },
    {
      id: 'shoes-1',
      name: '나이키 에어맥스',
      price: 150,
      image: '',
      category: 'fashion',
      rating: 4.4,
      stock: 12,
    },
  ];

  // Handle URL query parameters for tab selection
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    
    if (tabParam === 'my-cards') {
      setActiveTab('my-cards');
    } else if (tabParam === 'qr-pay') {
      setActiveTab('qr-pay');
    } else if (tabParam === 'store') {
      setActiveTab('store');
    }
  }, [location.search]);

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchUserGiftCards();
    }
  }, [fetchProducts, fetchUserGiftCards, user]);

  const productTypes = [
    { id: 'ic-gift-nft' as ProductType, name: 'IC상품권 NFT', icon: '🎫', color: 'from-purple-500 to-blue-500' },
    { id: 'existing-gift-cards' as ProductType, name: '기성 상품권', icon: '🎁', color: 'from-green-500 to-teal-500' },
    { id: 'general-products' as ProductType, name: '일반 상품', icon: '📦', color: 'from-orange-500 to-red-500' },
  ];

  const categories = [
    { id: 'all', name: '전체', icon: '🎁' },
    { id: 'food', name: '음식 & 음료', icon: '🍽️' },
    { id: 'entertainment', name: '엔터테인먼트', icon: '🎬' },
    { id: 'shopping', name: '쇼핑', icon: '🛒' },
    { id: 'beauty', name: '뷰티', icon: '💄' },
    { id: 'books', name: '도서', icon: '📚' },
    { id: 'electronics', name: '전자제품', icon: '📱' },
    { id: 'fashion', name: '패션', icon: '👕' },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredExistingGiftCards = existingGiftCards.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredGeneralProducts = generalProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Purchase Modal State
  const [purchaseModal, setPurchaseModal] = useState<{
    isOpen: boolean;
    productType: 'ic-nft' | 'gift-card' | 'general';
    productInfo: any;
  }>({ isOpen: false, productType: 'ic-nft', productInfo: null });
  const [isProcessingPurchase, setIsProcessingPurchase] = useState(false);

  const handlePurchase = (productId: string) => {
    const product = existingGiftCards.find(p => p.id === productId);
    if (product) {
      setPurchaseModal({
        isOpen: true,
        productType: 'gift-card',
        productInfo: {
          id: product.id,
          name: product.name,
          price: product.price,
          brand: product.brand
        }
      });
    }
  };

  const handleICGiftNFTPurchase = (denomination: number) => {
    const nftProduct = icGiftNFTs.find(nft => nft.denomination === denomination);
    if (nftProduct) {
      setPurchaseModal({
        isOpen: true,
        productType: 'ic-nft',
        productInfo: {
          id: `ic-nft-${denomination}`,
          name: `IC상품권 NFT ${denomination.toLocaleString()}원`,
          price: nftProduct.price,
          denomination: denomination
        }
      });
    }
  };

  const handleGeneralProductPurchase = (productId: string) => {
    const product = generalProducts.find(p => p.id === productId);
    if (product) {
      setPurchaseModal({
        isOpen: true,
        productType: 'general',
        productInfo: {
          id: product.id,
          name: product.name,
          price: product.price,
          category: product.category
        }
      });
    }
  };

  const handleICNFTClick = (nft: any) => {
    setPurchaseDetailModal({
      isOpen: true,
      nftData: nft
    });
  };

  // Purchase confirmation handler
  const handlePurchaseConfirm = async (paymentMethod: PaymentMethod, quantity: number = 1) => {
    setIsProcessingPurchase(true);
    
    try {
      const { productType, productInfo } = purchaseModal;
      const totalAmount = productInfo.price * quantity;
      
      // Show processing toast
      toast.loading('결제를 처리하고 있습니다...', { id: 'purchase-processing' });
      
      // Simulate API call with realistic delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate random failure for demonstration (10% chance)
      if (Math.random() < 0.1) {
        throw new Error('Payment processing failed');
      }
      
      // Process different payment methods
      switch (paymentMethod) {
        case 'usdt':
          console.log(`USDT 결제 처리: ${totalAmount.toLocaleString()}원`);
          break;
        case 'icf':
          console.log(`ICF 토큰 결제 처리: ${totalAmount.toLocaleString()}원`);
          break;
        case 'ic-nft':
          console.log(`IC상품권 NFT 결제 처리: ${totalAmount.toLocaleString()}원`);
          break;
      }
      
      // Dismiss processing toast
      toast.dismiss('purchase-processing');
      
      // Success handling based on product type
      switch (productType) {
        case 'ic-nft':
          toast.success(
            `🎉 IC상품권 NFT ${productInfo.denomination?.toLocaleString()}원권 구매가 완료되었습니다!\n결제 금액: ${totalAmount.toLocaleString()}원`,
            { duration: 5000 }
          );
          break;
          
        case 'gift-card':
          toast.success(
            `🎁 ${productInfo.name} ${quantity}개 구매가 완료되었습니다!\n총 결제 금액: ${totalAmount.toLocaleString()}원`,
            { duration: 5000 }
          );
          break;
          
        case 'general':
          toast.success(
            `📦 ${productInfo.name} ${quantity}개 주문이 완료되었습니다!\n총 주문 금액: ${totalAmount.toLocaleString()}원\n배송 준비 중입니다.`,
            { duration: 5000 }
          );
          break;
      }
      
      // Save purchase to local storage for history
      const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
      const newPurchase = {
        id: Date.now().toString(),
        productName: productInfo.name,
        productType,
        quantity,
        totalAmount,
        paymentMethod,
        purchaseDate: new Date().toISOString(),
        status: 'completed'
      };
      purchaseHistory.unshift(newPurchase);
      localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory.slice(0, 50))); // Keep last 50 purchases
      
      // Close modal
      setPurchaseModal({ isOpen: false, productType: 'ic-nft', productInfo: null });
      
    } catch (error) {
      console.error('Purchase error:', error);
      
      // Dismiss processing toast
      toast.dismiss('purchase-processing');
      
      // Show specific error messages
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      if (errorMessage.includes('insufficient')) {
        toast.error('잔액이 부족합니다. 충전 후 다시 시도해주세요.', { duration: 4000 });
      } else if (errorMessage.includes('network')) {
        toast.error('네트워크 연결을 확인하고 다시 시도해주세요.', { duration: 4000 });
      } else if (errorMessage.includes('timeout')) {
        toast.error('요청 시간이 초과되었습니다. 다시 시도해주세요.', { duration: 4000 });
      } else {
        toast.error('구매 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.', { duration: 4000 });
      }
      
      // Save failed purchase attempt
      const purchaseHistory = JSON.parse(localStorage.getItem('purchaseHistory') || '[]');
      const failedPurchase = {
        id: Date.now().toString(),
        productName: purchaseModal.productInfo?.name || 'Unknown Product',
        productType: purchaseModal.productType,
        quantity,
        totalAmount: (purchaseModal.productInfo?.price || 0) * quantity,
        paymentMethod,
        purchaseDate: new Date().toISOString(),
        status: 'failed',
        errorMessage
      };
      purchaseHistory.unshift(failedPurchase);
      localStorage.setItem('purchaseHistory', JSON.stringify(purchaseHistory.slice(0, 50)));
      
    } finally {
      setIsProcessingPurchase(false);
    }
  };

  const handleGenerateQR = async (cardId: string) => {
    try {
      const qrCode = await generateQRCode(cardId);
      console.log('QR Code generated:', qrCode);
      // Show QR code modal or navigate to QR display
    } catch (error) {
      console.error('Failed to generate QR code:', error);
    }
  };

  const handleUseCard = async (cardId: string) => {
    try {
      await useGiftCard(cardId, 10); // Default amount
      console.log('Gift card used successfully');
    } catch (error) {
      console.error('Failed to use gift card:', error);
    }
  };

  const handleGeneratePaymentQR = () => {
    console.log('Payment QR code generated');
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-4"></div>
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
          active={activeTab === 'store'}
          onClick={() => setActiveTab('store')}
        >
          <div className="flex items-center space-x-2">
            <GiftIcon className="w-4 h-4" />
            <span>스토어</span>
          </div>
        </TabButton>
        <TabButton
          active={activeTab === 'my-cards'}
          onClick={() => setActiveTab('my-cards')}
        >
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>내 카드</span>
          </div>
        </TabButton>
        <TabButton
          active={activeTab === 'qr-pay'}
          onClick={() => setActiveTab('qr-pay')}
        >
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4" />
            <span>QR 결제</span>
          </div>
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === 'store' && (
        <div className="space-y-8">
          {/* Product Type Navigation */}
          <div className="flex flex-wrap gap-2 mb-6">
            {productTypes.map(type => (
              <button
                key={type.id}
                onClick={() => setSelectedProductType(type.id)}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                  selectedProductType === type.id
                    ? `bg-gradient-to-r ${type.color} text-white shadow-lg`
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <span className="mr-2">{type.icon}</span>
                {type.name}
              </button>
            ))}
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="상품 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* IC Gift NFT Section */}
          {selectedProductType === 'ic-gift-nft' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900 mb-2">IC상품권 NFT</h2>
                <p className="text-gray-600">프리미엄 디지털 상품권을 NFT로 소유하세요</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {icGiftNFTs.map((nft, index) => (
                  <ICGiftCard
                    key={index}
                    denomination={nft.denomination}
                    price={nft.price}
                    discount={nft.discount}
                    displayMode="store"
                    onPurchase={(denomination) => handleICGiftNFTPurchase(denomination)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Existing Gift Cards Section */}
          {selectedProductType === 'existing-gift-cards' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">기성 상품권</h2>
                <p className="text-gray-600">다양한 브랜드의 기프트카드를 만나보세요</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredExistingGiftCards.map(product => (
                  <ExistingGiftCard
                    key={product.id}
                    product={product}
                    onPurchase={handlePurchase}
                  />
                ))}
              </div>
              {filteredExistingGiftCards.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          )}

          {/* General Products Section */}
          {selectedProductType === 'general-products' && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">일반 상품</h2>
                <p className="text-gray-600">USDT/ICF 또는 IC상품권 NFT로 구매 가능한 상품들</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredGeneralProducts.map(product => (
                  <GeneralProduct
                    key={product.id}
                    product={product}
                    onPurchase={(productId) => handleGeneralProductPurchase(productId)}
                  />
                ))}
              </div>
              {filteredGeneralProducts.length === 0 && (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === 'my-cards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">내 기프트 카드</h2>
          </div>
          
          {/* IC Gift NFTs Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">IC상품권 NFT</h3>
              <span className="text-sm text-gray-500">{myICGiftNFTs.length}개 보유</span>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {myICGiftNFTs.map((nft) => (
                <ICGiftCard
                  key={nft.id}
                  id={nft.id}
                  denomination={nft.denomination}
                  currentBalance={nft.currentBalance}
                  purchaseDate={nft.purchaseDate}
                  status={nft.status}
                  displayMode="my-cards"
                  onClick={() => handleICNFTClick(nft)}
                />
              ))}
            </div>
          </div>

          {/* Existing Gift Cards Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">기성 상품권</h3>
              <span className="text-sm text-gray-500">{userGiftCards.length}개 보유</span>
            </div>
            
            <div className="space-y-4">
              {userGiftCards.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">💳</div>
                  <p className="text-gray-500">보유한 기성 상품권이 없습니다.</p>
                </div>
              ) : (
                userGiftCards.map((giftCard) => (
                  <MyGiftCard
                    key={giftCard.id}
                    giftCard={giftCard}
                    onGenerateQR={handleGenerateQR}
                    onUseCard={handleUseCard}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'qr-pay' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">QR 결제</h2>
          <QRPayment onGeneratePaymentQR={handleGeneratePaymentQR} />
        </div>
      )}

      {/* Purchase Modal */}
      <PurchaseModal
        isOpen={purchaseModal.isOpen}
        onClose={() => setPurchaseModal({ isOpen: false, productType: 'ic-nft', productInfo: null })}
        productType={purchaseModal.productType}
        productInfo={purchaseModal.productInfo}
        onConfirm={handlePurchaseConfirm}
        isLoading={isProcessingPurchase}
      />

      {/* Purchase Detail Modal */}
      <PurchaseDetailModal
        isOpen={purchaseDetailModal.isOpen}
        onClose={() => setPurchaseDetailModal({ isOpen: false, nftData: null })}
        nftData={purchaseDetailModal.nftData}
      />
    </div>
  );
};