import React, { useState, useEffect } from 'react';
import { X, Wallet, TrendingUp, ChevronDown, ChevronUp, PieChart, Hash } from 'lucide-react';
import { getCoinIcon, getCoinInitial } from '../utils/coinIcons';
import { useMiningStore } from '../stores/miningStore';
import type { MineableCoin } from '../types';

interface MiningCoin {
  symbol: MineableCoin; // string에서 MineableCoin으로 변경
  name: string;
  price: number;
  balance: number;
  hashRate: number;
  isActive?: boolean;
}

interface DailyMiningData {
  date: string;
  time: string;
  depositAmount: number;
  hashRate: number;
  cumulative: number;
  baseReward: number;
  hashRateMultiplier: number;
  finalReward: number;
  usdValue: number;
}

interface HashRateData {
  time: string;
  hashRate: number;
  rejectionRate: number;
}

const Mining: React.FC = () => {
  const [selectedCoin, setSelectedCoin] = useState<MiningCoin | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showWithdrawForm, setShowWithdrawForm] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [coinexEmail, setCoinexEmail] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [hashRateData, setHashRateData] = useState<HashRateData[]>([]);
  const [currentHashRate, setCurrentHashRate] = useState(125.5);
  const [rejectionRate, setRejectionRate] = useState(2.1);
  const [showSummaryDetails, setShowSummaryDetails] = useState(false);

  // Use mining store
  const { 
    miningData, 
    activeMiningCoins,
    fetchMiningData, 
    startMining, 
    stopMining 
  } = useMiningStore();

  // Load mining data on component mount
  useEffect(() => {
    fetchMiningData();
  }, [fetchMiningData]);

  // Convert mining store data to component format
  const miningCoins: MiningCoin[] = miningData?.mineableCoins?.map(coin => ({
    symbol: coin.symbol,
    name: coin.name,
    price: coin.currentPriceUsdt,
    balance: coin.dailyReward,
    hashRate: coin.hashPowerAllocated,
    isActive: activeMiningCoins.includes(coin.symbol)
  })) || [];

  // Calculate summary data
  const calculateSummaryData = () => {
    const totalHashRate = miningCoins.reduce((sum, coin) => sum + coin.hashRate, 0);
    const totalUSDTValue = miningCoins.reduce((sum, coin) => sum + (coin.balance * coin.price), 0);
    
    const coinDetails = miningCoins.map(coin => {
      const usdtValue = coin.balance * coin.price;
      const percentage = totalUSDTValue > 0 ? (usdtValue / totalUSDTValue) * 100 : 0;
      
      return {
        ...coin,
        usdtValue,
        percentage
      };
    }).sort((a, b) => b.usdtValue - a.usdtValue);
    
    return {
      totalHashRate,
      totalUSDTValue,
      coinDetails
    };
  };

  const summaryData = calculateSummaryData();

  const handleCardClick = (coin: MiningCoin) => {
    setSelectedCoin(coin);
    setIsModalOpen(true);
  };



  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCoin(null);
  };

  // 7일간의 가상 채굴 데이터 생성
  const generateMiningData = (coin: MiningCoin): DailyMiningData[] => {
    const data: DailyMiningData[] = [];
    const today = new Date();
    let cumulativeAmount = 0;

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const baseReward = 0.001000;
      const hashRateMultiplier = 1.25;
      const depositAmount = baseReward * hashRateMultiplier + (Math.random() * 0.0005 - 0.00025);
      cumulativeAmount += depositAmount;
      
      data.push({
        date: date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }),
        time: '14:00',
        depositAmount: Math.max(0.0001, depositAmount),
        hashRate: coin.hashRate,
        cumulative: cumulativeAmount,
        baseReward,
        hashRateMultiplier,
        finalReward: Math.max(0.0001, depositAmount),
        usdValue: Math.max(0.0001, depositAmount) * coin.price
      });
    }
    
    return data.reverse();
  };

  const getMiningData = () => {
    if (!selectedCoin) return [];
    return generateMiningData(selectedCoin);
  };

  const getTotalDeposits = () => {
    const data = getMiningData();
    return data.reduce((sum, item) => sum + item.depositAmount, 0);
  };

  const getTotalValue = () => {
    const data = getMiningData();
    return data.reduce((sum, item) => sum + item.usdValue, 0);
  };

  const getWithdrawableAmount = () => {
    return selectedCoin ? selectedCoin.balance : 0;
  };

  const handleWithdraw = async () => {
    if (!selectedCoin || !withdrawAmount || !coinexEmail) return;
    
    const amount = parseFloat(withdrawAmount);
    if (amount <= 0 || amount > getWithdrawableAmount()) return;
    
    setIsWithdrawing(true);
    
    setTimeout(() => {
      alert(`${amount} ${selectedCoin.symbol}이(가) ${coinexEmail}로 출금 요청되었습니다.`);
      setWithdrawAmount('');
      setCoinexEmail('');
      setShowWithdrawForm(false);
      setIsWithdrawing(false);
    }, 2000);
  };

  const isWithdrawDisabled = () => {
    const withdrawableAmount = getWithdrawableAmount();
    return withdrawableAmount <= 0 || withdrawableAmount < 0.001;
  };

  const isWithdrawFormValid = () => {
    const amount = parseFloat(withdrawAmount);
    return withdrawAmount && 
           coinexEmail && 
           amount > 0 && 
           amount <= getWithdrawableAmount() &&
           coinexEmail.includes('@');
  };

  // Generate 24-hour hash rate data (API connection ready)
  const generateHashRateData = (): HashRateData[] => {
    const data: HashRateData[] = [];
    const now = new Date();
    
    for (let i = 23; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60 * 60 * 1000);
      const baseHashRate = 120;
      const variation = Math.sin(i * 0.3) * 20 + Math.random() * 10;
      const hashRate = Math.max(80, baseHashRate + variation);
      const rejectionRate = Math.max(0.5, Math.min(5, 2 + Math.random() * 2 - 1));
      
      data.push({
        time: time.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }),
        hashRate: Math.round(hashRate * 10) / 10,
        rejectionRate: Math.round(rejectionRate * 10) / 10
      });
    }
    
    return data;
  };

  // 부드러운 데이터 업데이트 함수
  const updateDataSmoothly = React.useCallback(() => {
    const newData = generateHashRateData();
    
    setTimeout(() => {
      setHashRateData(newData);
      
      if (newData.length > 0) {
        const latest = newData[newData.length - 1];
        setCurrentHashRate(latest.hashRate);
        setRejectionRate(latest.rejectionRate);
      }
    }, 300);
  }, []);

  // 컴포넌트 마운트 시 데이터 초기화
  React.useEffect(() => {
    const data = generateHashRateData();
    setHashRateData(data);
    
    if (data.length > 0) {
      const latest = data[data.length - 1];
      setCurrentHashRate(latest.hashRate);
      setRejectionRate(latest.rejectionRate);
    }
    
    const interval = setInterval(updateDataSmoothly, 8000);
    
    return () => clearInterval(interval);
  }, [updateDataSmoothly]);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Mining Summary Card */}
        <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                <PieChart className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">채굴 요약</h2>
                <p className="text-sm text-gray-500">전체 채굴 개요</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Total Hash Rate */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <Hash className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-medium">총 해시율</p>
                  <p className="text-2xl font-bold text-blue-900">
                    {summaryData.totalHashRate.toFixed(2)} <span className="text-sm font-normal text-blue-600">MH/s</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Total USDT Value */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm text-green-600 font-medium">총 포트폴리오 가치</p>
                  <p className="text-2xl font-bold text-green-900">
                    {summaryData.totalUSDTValue.toFixed(4)} <span className="text-sm font-normal text-green-600">USDT</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Portfolio Details Toggle */}
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setShowSummaryDetails(!showSummaryDetails)}
              className="w-full flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <div className="flex items-center space-x-2">
                <PieChart className="w-4 h-4 text-gray-600" />
                <span className="font-medium text-gray-700">포트폴리오 분석</span>
              </div>
              {showSummaryDetails ? (
                <ChevronUp className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              )}
            </button>

            {/* Portfolio Details */}
            {showSummaryDetails && (
              <div className="mt-4 space-y-3">
                {summaryData.coinDetails.map((coin) => (
                  <div key={coin.symbol} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                        <img 
                          src={getCoinIcon(coin.symbol)} 
                          alt={coin.symbol}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.nextElementSibling!.textContent = getCoinInitial(coin.symbol);
                          }}
                        />
                        <span className="text-xs font-bold text-gray-600 hidden">{getCoinInitial(coin.symbol)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{coin.symbol}</p>
                        <p className="text-sm text-gray-500">{coin.balance.toFixed(4)} {coin.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{coin.usdtValue.toFixed(4)} USDT</p>
                      <p className="text-sm text-gray-500">{coin.percentage.toFixed(1)}%</p>
                    </div>
                  </div>
                ))}
                {summaryData.coinDetails.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <p>No mining coins available</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* ECG style hash rate graph card */}
        <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 shadow-lg border border-primary/30 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white font-mono">REAL-TIME HASH RATE</h2>
                <p className="text-sm text-white/80 font-mono">24H MINING PERFORMANCE MONITOR</p>
              </div>
            </div>
          </div>
          
          {/* ECG 스타일 그래프 영역 */}
          <div className="h-32 bg-primary-900/50 rounded-lg mb-4 relative overflow-hidden border border-white/20">
            <svg width="100%" height="100%" viewBox="0 0 800 200" className="overflow-visible">
              <defs>
                {/* 의료용 그리드 패턴 */}
                <pattern id="medicalGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#ffffff" strokeWidth="0.5" opacity="0.2"/>
                </pattern>
                <pattern id="medicalGridMajor" width="100" height="100" patternUnits="userSpaceOnUse">
                  <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#ffffff" strokeWidth="0.8" opacity="0.3"/>
                </pattern>
                {/* 스캔 라인 효과 */}
                <linearGradient id="scanLine" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#ffffff" stopOpacity="0" />
                  <stop offset="50%" stopColor="#ffffff" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                </linearGradient>
              </defs>
              
              {/* 의료용 그리드 배경 */}
              <rect width="100%" height="100%" fill="url(#medicalGrid)" />
              <rect width="100%" height="100%" fill="url(#medicalGridMajor)" />
              
              {/* ECG 파형 라인 */}
              {hashRateData.length > 0 && (
                <polyline
                  fill="none"
                  stroke="#ffffff"
                  strokeWidth="3"
                  points={hashRateData.map((item, index) => {
                    const x = (index * (800 / (hashRateData.length - 1)));
                    const y = 100 - ((item.hashRate - 80) / (160 - 80)) * 80 + 40;
                    return `${x},${Math.max(20, Math.min(180, y))}`;
                  }).join(' ')}
                  className="ecg-line"
                />
              )}
              
              {/* 스캔 라인 */}
              <line
                x1="0"
                y1="0"
                x2="0"
                y2="200"
                stroke="url(#scanLine)"
                strokeWidth="3"
                className="scan-line"
              />
            </svg>
            
            {/* ECG 스타일 CSS 애니메이션 */}
             <style>{`
               .ecg-line {
                 animation: ecgFlow 8s linear infinite;
               }
               
               .scan-line {
                 animation: scanMove 3s linear infinite;
               }
               
               @keyframes ecgFlow {
                 0% {
                   transform: translateX(0);
                 }
                 100% {
                   transform: translateX(-50px);
                 }
               }
               
               @keyframes scanMove {
                 0% {
                   transform: translateX(0);
                   opacity: 0;
                 }
                 10% {
                   opacity: 1;
                 }
                 90% {
                   opacity: 1;
                 }
                 100% {
                   transform: translateX(800px);
                   opacity: 0;
                 }
               }
             `}</style>
          </div>
          
          {/* 의료 장비 스타일 하단 통계 */}
          <div className="flex justify-between items-center bg-white/10 rounded-lg p-4 border border-white/20">
            <div className="flex items-center space-x-3">
              <div className="relative">
                 <div className="w-3 h-3 bg-white rounded-full animate-pulse"></div>
               </div>
              <div>
                <p className="text-sm text-white/80 font-mono">HASH RATE</p>
                <p className="text-xl font-bold text-white font-mono transition-all duration-500">
                  {currentHashRate} <span className="text-sm font-normal text-white/70">MH/s</span>
                </p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-red-300 font-mono">REJECT RATE</p>
              <p className="text-xl font-bold text-red-300 font-mono transition-all duration-500">
                {rejectionRate}<span className="text-sm font-normal text-red-200">%</span>
              </p>
            </div>
          </div>
        </div>

        {/* 마이닝 코인 목록 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {miningCoins.map((coin) => (
            <div
              key={coin.symbol}
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => handleCardClick(coin)}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                    <img 
                      src={getCoinIcon(coin.symbol)} 
                      alt={coin.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.textContent = getCoinInitial(coin.symbol);
                      }}
                    />
                    <span className="text-base font-bold text-gray-600 hidden">{getCoinInitial(coin.symbol)}</span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 text-base">{coin.symbol}</h3>
                  </div>
                </div>
                
                <div className="text-right">
                  <p className="text-base font-bold text-gray-900">{(typeof coin.price === 'number' ? coin.price : 0).toFixed(4)} USDT</p>
                </div>
              </div>

              <div className="text-center">
                <p className="text-xs text-gray-500 mb-1">보유량</p>
                <p className="font-semibold text-gray-900 text-base">
                  {(coin.balance || 0).toFixed(4)} {coin.symbol}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 채굴 내역 모달 */}
        {isModalOpen && selectedCoin && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-md max-h-[90vh] overflow-hidden">
              {/* 모달 헤더 */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <img 
                      src={getCoinIcon(selectedCoin.symbol)} 
                      alt={selectedCoin.symbol}
                      className="w-8 h-8 rounded-full"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling!.textContent = getCoinInitial(selectedCoin.symbol);
                      }}
                    />
                    <span className="text-lg font-bold text-blue-600 hidden">{getCoinInitial(selectedCoin.symbol)}</span>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{selectedCoin.symbol}</h2>
                    <p className="text-sm text-gray-500">Daily deposit history</p>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* 총 입금액 및 총 가치 */}
              <div className="p-6 bg-gray-50">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-500">Total deposits (7 days)</p>
                    <p className="text-xl font-bold text-gray-900">
                      {getTotalDeposits().toFixed(4)} {selectedCoin.symbol}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Total value</p>
                    <p className="text-xl font-bold text-green-600">
                      {getTotalValue().toFixed(2)} USDT
                    </p>
                  </div>
                </div>
              </div>

              {/* 출금 섹션 */}
              <div className="p-6 border-b border-gray-100">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <p className="text-sm text-gray-500">출금 가능 수량</p>
                    <p className="text-lg font-bold text-gray-900">
                      {getWithdrawableAmount().toFixed(4)} {selectedCoin.symbol}
                    </p>
                  </div>
                  <button
                    onClick={() => setShowWithdrawForm(!showWithdrawForm)}
                    disabled={isWithdrawDisabled()}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 ${
                      isWithdrawDisabled()
                        ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    <Wallet className="w-4 h-4" />
                    <span>출금</span>
                  </button>
                </div>

                {/* 출금 폼 */}
                {showWithdrawForm && (
                  <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        출금 수량
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={withdrawAmount}
                          onChange={(e) => setWithdrawAmount(e.target.value)}
                          placeholder="0.0000"
                          max={getWithdrawableAmount()}
                          min="0.001"
                          step="0.0001"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <div className="absolute right-3 top-2 text-sm text-gray-500">
                          {selectedCoin.symbol}
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        최소 출금액: 0.001 {selectedCoin.symbol}
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        CoinEX 이메일 주소
                      </label>
                      <input
                        type="email"
                        value={coinexEmail}
                        onChange={(e) => setCoinexEmail(e.target.value)}
                        placeholder="your-email@example.com"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>

                    <div className="flex space-x-3">
                      <button
                        onClick={() => setShowWithdrawForm(false)}
                        className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        취소
                      </button>
                      <button
                        onClick={handleWithdraw}
                        disabled={!isWithdrawFormValid() || isWithdrawing}
                        className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
                          !isWithdrawFormValid() || isWithdrawing
                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        }`}
                      >
                        {isWithdrawing ? '처리 중...' : '출금 확인'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* 일자별 내역 */}
              <div className="overflow-y-auto max-h-96">
                {getMiningData().map((item, index) => (
                  <div key={index} className="p-4 border-b border-gray-100 last:border-b-0">
                    {/* 날짜 및 입금량 */}
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-blue-100 rounded flex items-center justify-center">
                          <span className="text-xs text-blue-600">📅</span>
                        </div>
                        <span className="font-medium text-gray-900">{item.date} {item.time}</span>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">+{(item.depositAmount || 0).toFixed(4)} {selectedCoin.symbol}</p>
                        <p className="text-sm text-gray-500">{(item.usdValue || 0).toFixed(2)} USDT</p>
                      </div>
                    </div>

                    {/* Hash rate and cumulative amount */}
                    <div className="flex justify-between items-center mb-3 text-sm">
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">#</span>
                        <span className="text-gray-600">Hash rate:</span>
                        <span className="font-medium text-blue-600">{(item.hashRate || 0).toFixed(1)} MH/s</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500">🔗</span>
                        <span className="text-gray-600">Cumulative:</span>
                        <span className="font-medium text-gray-900">{(item.cumulative || 0).toFixed(2)}</span>
                      </div>
                    </div>

                    {/* 보상 계산 */}
                    <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Base reward:</span>
                        <span className="font-medium text-gray-900">{(item.baseReward || 0).toFixed(6)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Hash rate multiplier:</span>
                        <span className="font-medium text-blue-600">×{(item.hashRateMultiplier || 0).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-sm font-semibold">
                        <span className="text-gray-900">Final reward:</span>
                        <span className="text-green-600">{(item.finalReward || 0).toFixed(6)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Mining;