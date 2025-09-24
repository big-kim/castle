import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Search, Filter, QrCode, ShoppingCart, Star, Gift as GiftIcon, CreditCard, Smartphone } from 'lucide-react';
import { useGiftStore } from '../stores/giftStore';
import { useUserStore } from '../stores/userStore';
import { formatCurrency, cn } from '../lib/utils';
import { GiftCardProduct, GiftCard } from '../types';

type TabType = 'store' | 'my-cards' | 'qr-pay';

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
              {formatCurrency(product.price)}
            </p>
              {product.original_price && product.original_price > product.price && (
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
          <p className="text-2xl font-bold">{formatCurrency(giftCard.value)}</p>
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
                  <option value="starbucks-001">IC Gift NFT - $50.00</option>
                  <option value="cgv-002">IC Gift NFT - $30.00</option>
                  <option value="lotte-003">IC Gift NFT - $100.00</option>
                </select>
              </div>
              
              {/* Amount Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Payment Amount
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
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
                <span>Generate QR Code</span>
              </button>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Generated QR Code */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">
              Payment QR Code
            </h3>
            
            {/* QR Code Placeholder */}
            <div className="w-64 h-64 mx-auto bg-gray-100 rounded-2xl flex items-center justify-center mb-6">
              <div className="text-8xl">⬛</div>
            </div>
            
            <div className="space-y-2 mb-6">
              <p className="text-lg font-semibold text-primary">
                ${amount}
              </p>
              <p className="text-sm text-gray-500">
                Show this QR code to the merchant
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setQrGenerated(false)}
                className="py-2 px-4 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors"
              >
                Back
              </button>
              <button className="py-2 px-4 bg-primary text-white rounded-xl hover:bg-primary/90 transition-colors">
                Share
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const Gift: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('store');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
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

  useEffect(() => {
    fetchProducts();
    if (user) {
      fetchUserGiftCards();
    }
  }, [fetchProducts, fetchUserGiftCards, user]);

  const categories = [
    { id: 'all', name: 'All', icon: '🎁' },
    { id: 'food', name: 'Food & Drink', icon: '🍽️' },
    { id: 'entertainment', name: 'Entertainment', icon: '🎬' },
    { id: 'shopping', name: 'Shopping', icon: '🛒' },
    { id: 'beauty', name: 'Beauty', icon: '💄' },
    { id: 'books', name: 'Books', icon: '📚' },
  ];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handlePurchase = async (productId: string) => {
    try {
      const purchaseForm = {
        product_id: productId,
        card_type: 'starbucks' as const,
        face_value: 10, // Default value
        quantity: 1,
        payment_method: 'wallet' as const
      };
      await purchaseGiftCard(purchaseForm);
      // Show success message
      console.log('Gift card purchased successfully');
    } catch (error) {
      console.error('Failed to purchase gift card:', error);
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
            <span>Store</span>
          </div>
        </TabButton>
        <TabButton
          active={activeTab === 'my-cards'}
          onClick={() => setActiveTab('my-cards')}
        >
          <div className="flex items-center space-x-2">
            <CreditCard className="w-4 h-4" />
            <span>My Cards</span>
          </div>
        </TabButton>
        <TabButton
          active={activeTab === 'qr-pay'}
          onClick={() => setActiveTab('qr-pay')}
        >
          <div className="flex items-center space-x-2">
            <Smartphone className="w-4 h-4" />
            <span>QR Pay</span>
          </div>
        </TabButton>
      </div>

      {/* Tab Content */}
      {activeTab === 'store' && (
        <div className="space-y-6">
          {/* Search and Filter */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search gift cards..."
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
            
            {/* Category Filter */}
            <div className="flex space-x-2 overflow-x-auto pb-2">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    'flex items-center space-x-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors',
                    selectedCategory === category.id
                      ? 'bg-primary text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  )}
                >
                  <span>{category.icon}</span>
                  <span className="text-sm font-medium">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
          
          {/* Gift Cards Grid */}
          <div className="space-y-4">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎁</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Gift Cards Found
                </h3>
                <p className="text-gray-500">
                  Try adjusting your search or filter criteria.
                </p>
              </div>
            ) : (
              filteredProducts.map((product) => (
                <GiftCardItem
                  key={product.id}
                  product={product}
                  onPurchase={handlePurchase}
                />
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'my-cards' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">My Gift Cards</h2>
            <button className="text-primary text-sm font-medium">
              View All
            </button>
          </div>
          
          <div className="space-y-4">
            {userGiftCards.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💳</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Gift Cards Yet
                </h3>
                <p className="text-gray-500 mb-4">
                  Purchase gift cards from the store to see them here.
                </p>
                <button
                  onClick={() => setActiveTab('store')}
                  className="bg-primary text-white px-6 py-2 rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Browse Store
                </button>
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
      )}

      {activeTab === 'qr-pay' && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900">QR Payment</h2>
          <QRPayment onGeneratePaymentQR={handleGeneratePaymentQR} />
        </div>
      )}
    </div>
  );
};