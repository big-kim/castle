import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Send, QrCode, Plus, TrendingUp, Activity, Zap, ChevronDown, ChevronUp, History } from 'lucide-react';
import { useAssetStore } from '@/stores/assetStore';
import { useGiftStore } from '@/stores/giftStore';
import { useWalletStore } from '@/stores/walletStore';
import { formatCurrency, formatTokenAmount, cn } from '@/lib/utils';
import { getCoinIcon, getCoinInitial } from '@/utils/coinIcons';
import { TokenSymbol } from '@/types';
import { ReceiveModal } from '@/components/ReceiveModal';
import { SendModal } from '@/components/SendModal';

interface QuickActionProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

const QuickAction: React.FC<QuickActionProps> = ({ icon: Icon, label, onClick, variant = 'secondary' }) => {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center space-y-2 p-4 rounded-2xl transition-all duration-200 min-w-[80px]',
        variant === 'primary'
          ? 'bg-primary text-white shadow-lg hover:bg-primary/90'
          : 'bg-white text-gray-700 shadow-sm hover:shadow-md border border-gray-100'
      )}
    >
      <Icon className="w-6 h-6" />
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};



interface TokenCardProps {
  symbol: string;
  balance: number;
  usdtValue: number;
  change24h?: number;
  isExpanded: boolean;
  onToggle: () => void;
  onSend: () => void;
  onReceive: () => void;
}



const TokenCard: React.FC<TokenCardProps> = ({ symbol, balance, usdtValue, change24h, isExpanded, onToggle, onSend, onReceive }) => {

  const getTokenName = (symbol: string) => {
    const nameMap = {
      ICC: 'IC Coin',
      ICS: 'IC Silver',
      ICF: 'IC Finance',
      ICG: 'IC Gold',
      AITC: 'AI Trading Coin',
      AITCP: 'AI Trading Coin Plus',
      BNB: 'Binance Coin',
      USDT: 'Tether USD',
    };
    return nameMap[symbol as keyof typeof nameMap] || symbol;
  };

  return (
    <div 
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 active:scale-[0.98]"
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <img 
              src={getCoinIcon(symbol)} 
              alt={symbol}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling!.textContent = getCoinInitial(symbol);
              }}
            />
            <span className="text-sm font-bold text-gray-600 hidden">{getCoinInitial(symbol)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{symbol}</h3>
            {!isExpanded && (
              <p className="text-sm text-gray-500">
                {formatTokenAmount(balance, 2)} {symbol}
              </p>
            )}
            {isExpanded && (
              <p className="text-sm text-gray-500">{getTokenName(symbol)}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isExpanded && change24h !== undefined && (
            <div className={cn(
              'flex items-center space-x-1 text-xs font-medium',
              change24h >= 0 ? 'text-green-600' : 'text-red-600'
            )}>
              <span>{change24h >= 0 ? '+' : ''}{change24h.toFixed(1)}%</span>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-gray-400" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-400" />
          )}
        </div>
      </div>
      
      <div className={cn(
        'overflow-hidden transition-all duration-300 ease-in-out',
        isExpanded ? 'max-h-32 opacity-100' : 'max-h-0 opacity-0'
      )}>
        <div className="mt-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-base sm:text-lg font-semibold text-gray-900">
                {formatTokenAmount(balance, 2)} {symbol}
              </p>
              <p className="text-xs sm:text-sm text-gray-500">
                ≈ ${formatTokenAmount(usdtValue, 2)}
              </p>
            </div>
            {change24h !== undefined && (
              <div className={cn(
                'flex items-center space-x-1 text-xs sm:text-sm font-medium',
                change24h >= 0 ? 'text-green-600' : 'text-red-600'
              )}>
                <TrendingUp className={cn(
                  'w-3 h-3 sm:w-4 sm:h-4',
                  change24h < 0 && 'rotate-180'
                )} />
                <span>{change24h >= 0 ? '+' : ''}{change24h.toFixed(2)}%</span>
              </div>
            )}
          </div>
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                <button 
                  onClick={onSend}
                  className="flex items-center justify-center space-x-2 p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span className="text-sm font-medium">보내기</span>
                </button>
                <button 
                  onClick={onReceive}
                  className="flex items-center justify-center space-x-2 p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                >
                  <ArrowDownLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">받기</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

interface GiftCardNFTProps {
  id: string;
  cardType: string;
  faceValue: number;
  currentBalance: number;
}

const GiftCardNFT: React.FC<GiftCardNFTProps & { onClick: () => void }> = ({ id, cardType, faceValue, currentBalance, onClick }) => {
  const getCardImage = (cardType: string) => {
    const imageMap = {
      starbucks: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=starbucks%20gift%20card%20nft%20premium%20green%20design&image_size=landscape_4_3',
      cgv: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=cgv%20cinema%20gift%20card%20nft%20red%20movie%20design&image_size=landscape_4_3',
      lotte: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=lotte%20department%20store%20gift%20card%20nft%20luxury%20gold&image_size=landscape_4_3',
    };
    return imageMap[cardType as keyof typeof imageMap] || imageMap.starbucks;
  };

  const getCardName = (cardType: string) => {
    // 모든 기프트 카드를 'IC Gift NFT'로 통일
    return 'IC Gift NFT';
  };

  return (
    <div 
      className="bg-white rounded-2xl p-3 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 active:scale-[0.98]"
      onClick={onClick}
    >
      <div className="aspect-[4/3] rounded-xl overflow-hidden mb-3">
        <img
          src={getCardImage(cardType)}
          alt={`${getCardName(cardType)} Gift Card`}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="space-y-1">
        <h4 className="font-medium text-gray-900 text-sm">{getCardName(cardType)}</h4>
        <p className="text-xs text-gray-500">
          {formatCurrency(currentBalance)} / {formatCurrency(faceValue)}
        </p>
      </div>
    </div>
  );
};

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { summary, fetchSummary, isLoading: assetsLoading } = useAssetStore();
  const { userGiftCards, fetchUserGiftCards, isLoading: giftsLoading } = useGiftStore();
  const { overview, fetchWalletOverview, isLoading: walletLoading } = useWalletStore();

  // State for managing card expansion
  const [expandedTokens, setExpandedTokens] = useState<Set<string>>(new Set());
  
  // Modal states
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [sendModalOpen, setSendModalOpen] = useState(false);
  const [selectedAssetType, setSelectedAssetType] = useState<'bnb' | 'point' | 'nft'>('bnb');
  const [selectedCoinType, setSelectedCoinType] = useState<string>('');

  // Fetch data on component mount
  useEffect(() => {
    fetchSummary();
    fetchUserGiftCards();
    fetchWalletOverview();
  }, [fetchSummary, fetchUserGiftCards, fetchWalletOverview]);

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'send':
        setSelectedAssetType('bnb');
        setSelectedCoinType('BNB');
        setSendModalOpen(true);
        break;
      case 'receive':
        setSelectedAssetType('bnb');
        setSelectedCoinType('BNB');
        setReceiveModalOpen(true);
        break;
      case 'qr-pay':
        setSelectedAssetType('bnb');
        setSelectedCoinType('BNB');
        setReceiveModalOpen(true);
        break;
      case 'buy':
        navigate('/buy');
        break;
      default:
        break;
    }
  };

  const handleTokenAction = (symbol: string, action: 'send' | 'receive') => {
    if (symbol === 'BNB') {
      setSelectedAssetType('bnb');
      setSelectedCoinType('BNB');
    } else {
      // For other tokens, we'll treat them as BNB network tokens for now
      setSelectedAssetType('bnb');
      setSelectedCoinType(symbol);
    }
    
    if (action === 'send') {
      setSendModalOpen(true);
    } else {
      setReceiveModalOpen(true);
    }
  };



  // Toggle functions for card expansion
  const toggleTokenExpansion = (symbol: string) => {
    setExpandedTokens(prev => {
      const newSet = new Set(prev);
      if (newSet.has(symbol)) {
        newSet.delete(symbol);
      } else {
        newSet.add(symbol);
      }
      return newSet;
    });
  };



  // BNB-based tokens data - use real data from wallet store or fallback to mock data
  const bnbTokens = overview?.bnbWallet ? [
    { symbol: 'BNB', balance: overview.bnbWallet.balance, usdtValue: overview.bnbWallet.balance * 500, change24h: 4.1 },
    // Add other tokens from the BNB network
    { symbol: 'ICC', balance: 1250.50, usdtValue: 2501.00, change24h: 5.2 },
    { symbol: 'ICS', balance: 850.25, usdtValue: 1700.50, change24h: -2.1 },
    { symbol: 'ICF', balance: 500.75, usdtValue: 1502.25, change24h: 3.8 },
    { symbol: 'ICG', balance: 125.00, usdtValue: 3750.00, change24h: 8.7 },
    { symbol: 'AITC', balance: 2500.00, usdtValue: 750.00, change24h: 12.5 },
    { symbol: 'AITCP', balance: 100.50, usdtValue: 1005.00, change24h: 15.2 },
    { symbol: 'USDT', balance: 1000.00, usdtValue: 1000.00, change24h: 0.1 },
  ] : [
    { symbol: 'ICC', balance: 1250.50, usdtValue: 2501.00, change24h: 5.2 },
    { symbol: 'ICS', balance: 850.25, usdtValue: 1700.50, change24h: -2.1 },
    { symbol: 'ICF', balance: 500.75, usdtValue: 1502.25, change24h: 3.8 },
    { symbol: 'ICG', balance: 125.00, usdtValue: 3750.00, change24h: 8.7 },
    { symbol: 'AITC', balance: 2500.00, usdtValue: 750.00, change24h: 12.5 },
    { symbol: 'AITCP', balance: 100.50, usdtValue: 1005.00, change24h: 15.2 },
    { symbol: 'BNB', balance: 5.25, usdtValue: 2625.00, change24h: 4.1 },
    { symbol: 'USDT', balance: 1000.00, usdtValue: 1000.00, change24h: 0.1 },
  ];





  // 초기 로딩 상태 - 모든 데이터가 로딩 중일 때만 전체 로딩 화면 표시
  const isInitialLoading = assetsLoading && walletLoading && !summary && !overview;
  
  if (isInitialLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">자산 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Total Assets Dashboard */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-lg font-medium mb-4">총 자산</h2>
        <div className="space-y-2">
          <p className="text-3xl font-bold">
            ${formatCurrency(overview?.totalValue || summary?.totalValueUsdt || 0)}
          </p>
          <p className="text-white/80 text-sm">
            ≈ {formatTokenAmount(overview?.totalValue || summary?.totalValueUsdt || 0, 2)} USDT
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">빠른 실행</h3>
        <div className="grid grid-cols-3 gap-3">
          <QuickAction
            icon={Send}
            label="보내기"
            onClick={() => handleQuickAction('send')}
            variant="primary"
          />
          <QuickAction
            icon={ArrowDownLeft}
            label="받기"
            onClick={() => handleQuickAction('receive')}
          />
          <QuickAction
            icon={History}
            label="거래내역"
            onClick={() => navigate('/wallet/transactions')}
          />
        </div>
      </div>

      {/* Crypto Assets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">내 자산</h3>
          <button className="text-primary text-sm font-medium">
            전체 보기
          </button>
        </div>
        
        <div className="space-y-3">
          {bnbTokens.map((token) => (
            <TokenCard
              key={token.symbol}
              symbol={token.symbol}
              balance={token.balance}
              usdtValue={token.usdtValue}
              change24h={token.change24h}
              isExpanded={expandedTokens.has(token.symbol)}
              onToggle={() => toggleTokenExpansion(token.symbol)}
              onSend={() => handleTokenAction(token.symbol, 'send')}
              onReceive={() => handleTokenAction(token.symbol, 'receive')}
            />
          ))}
        </div>
      </div>



      {/* Gift Card NFTs */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">내 기프트 카드</h3>
          <button 
            className="text-primary text-sm font-medium"
            onClick={() => navigate('/gift')}
          >
            전체 보기
          </button>
        </div>
        
        {giftsLoading || walletLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-32 animate-pulse"></div>
            ))}
          </div>
        ) : (overview?.nftWallet?.nfts && overview.nftWallet.nfts.length > 0) || (userGiftCards && userGiftCards.length > 0) ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Show NFT wallet items first, then fallback to gift cards */}
            {overview?.nftWallet?.nfts ? 
              overview.nftWallet.nfts.slice(0, 6).map((nft) => (
                <div key={nft.id} className="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-3 border border-purple-200">
                  <div className="aspect-square bg-white rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                    <img 
                      src={nft.imageUrl} 
                      alt={nft.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.classList.remove('hidden');
                      }}
                    />
                    <div className="hidden w-full h-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">{nft.name.charAt(0)}</span>
                    </div>
                  </div>
                  <h3 className="font-medium text-gray-900 text-sm truncate">{nft.name}</h3>
                  <p className="text-xs text-gray-600 mt-1">${nft.value}</p>
                </div>
              )) :
              userGiftCards?.slice(0, 6).map((card) => (
                <GiftCardNFT
                  key={card.id}
                  id={card.id}
                  cardType={card.cardType}
                  faceValue={card.faceValue}
                  currentBalance={card.currentBalance}
                  onClick={() => navigate('/gift')}
                />
              ))
            }
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-500 mb-4">아직 보유한 상품권 NFT가 없습니다</p>
            <button 
              onClick={() => navigate('/gift')}
              className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
            >
              상품권 구매하기
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <ReceiveModal
        isOpen={receiveModalOpen}
        onClose={() => setReceiveModalOpen(false)}
        assetType={selectedAssetType}
        coinType={selectedCoinType}
      />
      
      <SendModal
        isOpen={sendModalOpen}
        onClose={() => setSendModalOpen(false)}
        assetType={selectedAssetType}
        coinType={selectedCoinType}
      />
    </div>
  );
};