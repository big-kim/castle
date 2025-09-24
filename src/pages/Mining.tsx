import React, { useState } from 'react';
import { X, Calendar, TrendingUp, Hash } from 'lucide-react';
import { formatTokenAmount } from '../lib/utils';

interface MiningCoin {
  symbol: string;
  name: string;
  icon: string;
  holdings: number;
  hashRate: number;
  price: number;
}

interface DailyDepositRecord {
  date: string;
  time: string;
  amount: number;
  hashRate: number;
  usdValue: number;
  cumulativeAmount: number;
  rewardCalculation: {
    baseReward: number;
    hashRateMultiplier: number;
    finalReward: number;
  };
}

interface DepositHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  coin: MiningCoin | null;
  depositHistory: DailyDepositRecord[];
}

interface MiningCardProps {
  coin: MiningCoin;
  onClick: (coin: MiningCoin) => void;
}

const DepositHistoryModal: React.FC<DepositHistoryModalProps> = ({ isOpen, onClose, coin, depositHistory }) => {
  if (!isOpen || !coin) return null;

  const totalDeposits = depositHistory.reduce((sum, record) => sum + record.amount, 0);
  const totalValue = depositHistory.reduce((sum, record) => sum + record.usdValue, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
              <img 
                src={`/src/assets/images/${coin.symbol}.svg`} 
                alt={coin.symbol}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling!.textContent = coin.symbol.charAt(0);
                }}
              />
              <span className="text-sm font-bold text-gray-600 hidden">{coin.symbol.charAt(0)}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{coin.symbol}</h3>
              <p className="text-sm text-gray-500">Daily deposit history</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-100">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-600">Total deposits (7 days)</p>
              <p className="font-bold text-lg text-gray-900">{formatTokenAmount(totalDeposits, 4)} {coin.symbol}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total value</p>
              <p className="font-bold text-lg text-green-600">${formatTokenAmount(totalValue, 2)}</p>
            </div>
          </div>
        </div>

        {/* Deposit History */}
        <div className="p-4 overflow-y-auto max-h-[50vh]">
          <div className="space-y-3">
            {depositHistory.map((record, index) => (
              <div key={index} className="bg-gray-50 rounded-xl p-4 space-y-3">
                {/* Date and Time */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="font-medium text-gray-900">{record.date}</span>
                    <span className="text-sm text-gray-500">{record.time}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-green-600">+{formatTokenAmount(record.amount, 4)} {coin.symbol}</p>
                    <p className="text-sm text-gray-500">${formatTokenAmount(record.usdValue, 2)}</p>
                  </div>
                </div>
                
                {/* Mining Details */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <Hash className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">Hash rate:</span>
                    <span className="font-medium text-blue-600">{formatTokenAmount(record.hashRate, 1)} MH/s</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="w-3 h-3 text-gray-400" />
                    <span className="text-gray-600">Cumulative:</span>
                    <span className="font-medium text-gray-900">{formatTokenAmount(record.cumulativeAmount, 2)}</span>
                  </div>
                </div>
                
                {/* Reward Calculation Details */}
                <div className="bg-white rounded-lg p-3 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Base reward:</span>
                    <span className="text-gray-900">{formatTokenAmount(record.rewardCalculation.baseReward, 6)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Hash rate multiplier:</span>
                    <span className="text-blue-600">×{record.rewardCalculation.hashRateMultiplier.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between border-t pt-1">
                    <span className="font-medium text-gray-700">Final reward:</span>
                    <span className="font-semibold text-green-600">{formatTokenAmount(record.rewardCalculation.finalReward, 6)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
};

const MiningCard: React.FC<MiningCardProps> = ({ coin, onClick }) => {
  const getTokenIcon = (symbol: string) => {
    return `/src/assets/images/${symbol}.svg`;
  };

  return (
    <div 
      className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(coin)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <img 
              src={getTokenIcon(coin.symbol)} 
              alt={coin.symbol}
              className="w-10 h-10 rounded-full"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling!.textContent = coin.symbol.charAt(0);
              }}
            />
            <span className="text-lg font-bold text-gray-600 hidden">{coin.symbol.charAt(0)}</span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">{coin.symbol}</h3>
            <p className="text-sm text-gray-500">{coin.name}</p>
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-bold text-gray-900">${formatTokenAmount(coin.price, 4)}</p>
          <p className="text-sm text-gray-500">Current price</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <p className="text-sm text-gray-500">Holdings</p>
          <p className="font-semibold text-gray-900">
            {formatTokenAmount(coin.holdings, 4)} {coin.symbol}
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Hash rate</p>
          <p className="font-semibold text-blue-600">
            {formatTokenAmount(coin.hashRate, 2)} MH/s
          </p>
        </div>
      </div>
      

    </div>
  );
};



export const Mining: React.FC = () => {
  // 8개 마이닝 코인 데이터
  const initialMiningCoins: MiningCoin[] = [
    {
      symbol: 'LTC',
      name: 'Litecoin',
      icon: '/src/assets/images/LTC.svg',
      holdings: 0.234,
      hashRate: 125.5,
      price: 89.45
    },
    {
      symbol: 'DOGE',
      name: 'Dogecoin',
      icon: '/src/assets/images/DOGE.svg',
      holdings: 456.78,
      hashRate: 89.2,
      price: 0.0823
    },
    {
      symbol: 'BELLS',
      name: 'Bellscoin',
      icon: '/src/assets/images/BELLS.svg',
      holdings: 1234.56,
      hashRate: 0,
      price: 0.0045
    },
    {
      symbol: 'PEP',
      name: 'Pepecoin',
      icon: '/src/assets/images/PEP.svg',
      holdings: 8901.23,
      hashRate: 67.8,
      price: 0.000234
    },
    {
      symbol: 'JKC',
      name: 'Junkcoin',
      icon: '/src/assets/images/JKC.svg',
      holdings: 567.89,
      hashRate: 0,
      price: 0.0012
    },
    {
      symbol: 'LKY',
      name: 'Luckycoin',
      icon: '/src/assets/images/LKY.svg',
      holdings: 2345.67,
      hashRate: 156.3,
      price: 0.0567
    },
    {
      symbol: 'DINGO',
      name: 'Dingocoin',
      icon: '/src/assets/images/DINGO.svg',
      holdings: 123.45,
      hashRate: 0,
      price: 0.0089
    },
    {
      symbol: 'SHIC',
      name: 'Shitcoin',
      icon: '/src/assets/images/SHIC.svg',
      holdings: 4567.89,
      hashRate: 98.7,
      price: 0.000045
    }
  ];
  
  const [coins, setCoins] = useState<MiningCoin[]>(initialMiningCoins);
  const [selectedCoin, setSelectedCoin] = useState<MiningCoin | null>(null);
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  
  // 일자별 채굴 보상 입금 내역 생성 함수
  const generateDepositHistory = (coin: MiningCoin): DailyDepositRecord[] => {
    const history: DailyDepositRecord[] = [];
    const today = new Date();
    let cumulativeAmount = coin.holdings;
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeStr = '14:00'; // 매일 오후 2시 자동 지급
      
      // 해시레이트가 0이면 채굴 보상 없음
      if (coin.hashRate === 0) {
        history.push({
          date: dateStr,
          time: timeStr,
          amount: 0,
          hashRate: 0,
          usdValue: 0,
          cumulativeAmount,
          rewardCalculation: {
            baseReward: 0,
            hashRateMultiplier: 0,
            finalReward: 0
          }
        });
        continue;
      }
      
      // 해시레이트 기반 보상 계산
      const baseReward = 0.001; // 기본 보상 (코인별로 다를 수 있음)
      const hashRateMultiplier = coin.hashRate / 100; // 해시레이트 100 MH/s 기준
      const dailyVariation = 0.85 + Math.random() * 0.3; // 85% ~ 115% 변동
      const finalReward = baseReward * hashRateMultiplier * dailyVariation;
      
      const usdValue = finalReward * coin.price;
      cumulativeAmount -= finalReward; // 역순으로 계산하므로 빼기
      
      history.push({
        date: dateStr,
        time: timeStr,
        amount: finalReward,
        hashRate: coin.hashRate,
        usdValue,
        cumulativeAmount: cumulativeAmount + finalReward,
        rewardCalculation: {
          baseReward,
          hashRateMultiplier,
          finalReward
        }
      });
    }
    
    return history.reverse(); // 최신 날짜가 위로 오도록
  };
  
  const handleCoinClick = (coin: MiningCoin) => {
    setSelectedCoin(coin);
    setIsDepositModalOpen(true);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      <div className="max-w-md mx-auto p-4 space-y-6">
        {/* Header */}
        <div className="text-center py-4">
          <h1 className="text-2xl font-bold text-gray-900">Mining</h1>
          <p className="text-gray-600 mt-1">Manage your mining activities</p>
        </div>
        
        {/* Mining Coins */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Mining coins</h2>
          
          {coins.map((coin) => (
            <MiningCard
              key={coin.symbol}
              coin={coin}
              onClick={handleCoinClick}
            />
          ))}
        </div>
      </div>
      
      {/* Deposit History Modal */}
      {isDepositModalOpen && selectedCoin && (
        <DepositHistoryModal
          coin={selectedCoin}
          depositHistory={generateDepositHistory(selectedCoin)}
          isOpen={isDepositModalOpen}
          onClose={() => setIsDepositModalOpen(false)}
        />
      )}
    </div>
  );
};