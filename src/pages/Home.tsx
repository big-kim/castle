import React, { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, ArrowDownLeft, Send, QrCode, Plus, TrendingUp, Pickaxe, Activity, Zap, ChevronDown, ChevronUp } from 'lucide-react';
import { useAssetStore } from '../stores/assetStore';
import { useGiftStore } from '../stores/giftStore';
import { formatCurrency, formatTokenAmount, cn } from '../lib/utils';
import { TokenSymbol } from '../types';

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

const MiningAssetCard: React.FC<MiningAssetProps> = ({ symbol, name, balance, currentPrice, isExpanded, onToggle }) => {
  const getMiningIcon = (symbol: string) => {
    return `/images/${symbol.toLowerCase()}.svg`;
  };

  return (
    <div 
      className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border border-gray-200 cursor-pointer hover:shadow-md hover:border-gray-300 transition-all duration-200 active:scale-[0.98]"
      onClick={onToggle}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-100 flex items-center justify-center">
            <img 
              src={getMiningIcon(symbol)} 
              alt={symbol}
              className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling!.textContent = symbol.charAt(0);
              }}
            />
            <span className="text-xs sm:text-sm font-bold text-gray-600 hidden">{symbol.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm sm:text-base">{symbol}</h3>
            {!isExpanded && (
              <p className="text-xs sm:text-sm text-gray-500">
                {formatTokenAmount(balance, 4)} {symbol}
              </p>
            )}
            {isExpanded && (
              <p className="text-xs sm:text-sm text-gray-500">{name}</p>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {!isExpanded && (
            <div className="text-right">
              <p className="text-xs sm:text-sm text-gray-500">
                ${currentPrice.toFixed(4)}
              </p>
            </div>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-200" />
          ) : (
            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 transition-transform duration-200" />
          )}
        </div>
      </div>
      
      <div className={cn(
         'overflow-hidden transition-all duration-300 ease-in-out',
         isExpanded ? 'max-h-20 opacity-100' : 'max-h-0 opacity-0'
       )}>
         <div className="mt-3">
           <div className="flex items-center justify-between">
             <div>
               <p className="text-base sm:text-lg font-semibold text-gray-900">
                 {formatTokenAmount(balance, 4)} {symbol}
               </p>
             </div>
             <div className="text-right">
               <p className="text-xs sm:text-sm text-gray-500">
                 ${currentPrice.toFixed(4)}
               </p>
             </div>
           </div>
         </div>
       </div>
    </div>
  );
};

interface TokenCardProps {
  symbol: string;
  balance: number;
  usdtValue: number;
  change24h?: number;
  isExpanded: boolean;
  onToggle: () => void;
}

interface MiningAssetProps {
  symbol: string;
  name: string;
  balance: number;
  currentPrice: number;
  isExpanded: boolean;
  onToggle: () => void;
}

const TokenCard: React.FC<TokenCardProps> = ({ symbol, balance, usdtValue, change24h, isExpanded, onToggle }) => {
  const getTokenIcon = (symbol: string) => {
    // Use SVG icons from assets/images folder
    return `/images/${symbol.toLowerCase()}.svg`;
  };

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
              src={getTokenIcon(symbol)} 
              alt={symbol}
              className="w-8 h-8 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling!.textContent = symbol.charAt(0);
              }}
            />
            <span className="text-sm font-bold text-gray-600 hidden">{symbol.charAt(0)}</span>
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

  // State for managing card expansion
  const [expandedTokens, setExpandedTokens] = useState<Set<string>>(new Set());
  const [expandedMiningAssets, setExpandedMiningAssets] = useState<Set<string>>(new Set());

  // Fetch data on component mount
  useEffect(() => {
    fetchSummary();
    fetchUserGiftCards();
  }, [fetchSummary, fetchUserGiftCards]);

  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    // TODO: Implement navigation to respective pages
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

  const toggleMiningAssetExpansion = (symbol: string) => {
    setExpandedMiningAssets(prev => {
      const newSet = new Set(prev);
      if (newSet.has(symbol)) {
        newSet.delete(symbol);
      } else {
        newSet.add(symbol);
      }
      return newSet;
    });
  };

  // BNB-based tokens data
  const bnbTokens = [
    { symbol: 'ICC', balance: 1250.50, usdtValue: 2501.00, change24h: 5.2 },
    { symbol: 'ICS', balance: 850.25, usdtValue: 1700.50, change24h: -2.1 },
    { symbol: 'ICF', balance: 500.75, usdtValue: 1502.25, change24h: 3.8 },
    { symbol: 'ICG', balance: 125.00, usdtValue: 3750.00, change24h: 8.7 },
    { symbol: 'AITC', balance: 2500.00, usdtValue: 750.00, change24h: 12.5 },
    { symbol: 'AITCP', balance: 100.50, usdtValue: 1005.00, change24h: 15.2 },
    { symbol: 'BNB', balance: 5.25, usdtValue: 2625.00, change24h: 4.1 },
    { symbol: 'USDT', balance: 1000.00, usdtValue: 1000.00, change24h: 0.1 },
  ];

  // Mining assets data
  const miningAssets = [
    { symbol: 'LTC', name: 'Litecoin', balance: 0.2450, currentPrice: 92.35 },
    { symbol: 'DOGE', name: 'Dogecoin', balance: 1250.75, currentPrice: 0.0825 },
    { symbol: 'BELLS', name: 'Bellscoin', balance: 850.50, currentPrice: 0.0012 },
    { symbol: 'PEP', name: 'Pepecoin', balance: 0.0000, currentPrice: 0.0008 },
    { symbol: 'JKC', name: 'Junkcoin', balance: 450.25, currentPrice: 0.0005 },
    { symbol: 'LKY', name: 'Luckycoin', balance: 125.80, currentPrice: 0.0015 },
    { symbol: 'DINGO', name: 'Dingocoin', balance: 0.0000, currentPrice: 0.0003 },
    { symbol: 'SHIC', name: 'Shiba Inu Classic', balance: 2500.00, currentPrice: 0.0002 },
  ];

  if (assetsLoading) {
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
      {/* Total Assets Dashboard */}
      <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg">
        <h2 className="text-lg font-medium mb-4">Total Assets</h2>
        <div className="space-y-2">
          <p className="text-3xl font-bold">
            ${formatTokenAmount(summary?.total_value_usdt || 0, 2)}
          </p>
          <p className="text-white/80 text-sm">
            ≈ {formatCurrency((summary?.total_value_usdt || 0) * 1380)}
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Quick actions</h3>
        <div className="flex space-x-3 overflow-x-auto pb-2">
          <QuickAction
            icon={ArrowUpRight}
            label="Send"
            onClick={() => handleQuickAction('send')}
            variant="primary"
          />
          <QuickAction
            icon={ArrowDownLeft}
            label="Receive"
            onClick={() => handleQuickAction('receive')}
          />
          <QuickAction
            icon={QrCode}
            label="QR Pay"
            onClick={() => handleQuickAction('qr-pay')}
          />
          <QuickAction
            icon={Plus}
            label="Buy"
            onClick={() => handleQuickAction('buy')}
          />
        </div>
      </div>

      {/* Crypto Assets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">My assets</h3>
          <button className="text-primary text-sm font-medium">
            View All
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
            />
          ))}
        </div>
      </div>

      {/* Mining Assets */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Pickaxe className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-gray-900">My mining assets</h3>
          </div>
          <button className="text-primary text-sm font-medium">
            View All
          </button>
        </div>
        
        <div className="space-y-3">
          {miningAssets.map((asset) => (
            <MiningAssetCard
              key={asset.symbol}
              symbol={asset.symbol}
              name={asset.name}
              balance={asset.balance}
              currentPrice={asset.currentPrice}
              isExpanded={expandedMiningAssets.has(asset.symbol)}
              onToggle={() => toggleMiningAssetExpansion(asset.symbol)}
            />
          ))}
        </div>
      </div>

      {/* Gift Card NFTs */}
      {userGiftCards.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">My gift cards</h3>
            <button 
              className="text-primary text-sm font-medium"
              onClick={() => navigate('/gift')}
            >
              View All
            </button>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {userGiftCards.slice(0, 6).map((card) => (
              <GiftCardNFT
                key={card.id}
                id={card.id}
                cardType={card.card_type}
                faceValue={card.face_value}
                currentBalance={card.current_balance}
                onClick={() => navigate('/gift')}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};