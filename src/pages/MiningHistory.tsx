import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Download, TrendingUp, Calendar, DollarSign, Mail, CheckCircle, AlertCircle } from 'lucide-react';
import { useMiningStore } from '../stores/miningStore';
import { Layout } from '../components/Layout';

interface DailyDepositRecord {
  id: string;
  date: string;
  time: string;
  amount: number;
  hashRate: number;
  coinSymbol: string;
  usdValue: number;
}

interface CoinEXAccount {
  email: string;
  registeredAt: string;
  isVerified: boolean;
}

// Helper function to get coin price (mock data)
const getCoinPrice = (coinSymbol: string): number => {
  const prices: { [key: string]: number } = {
    'ICC': 0.15,
    'ICS': 0.12,
    'ICG': 0.18,
    'USDT': 1.0,
    'BTC': 45000,
    'ETH': 2800,
    'BNB': 320,
    'ADA': 0.45,
    'LTC': 95,
    'DOGE': 0.08,
    'BELLS': 0.002
  };
  return prices[coinSymbol] || 1.0;
};

const MiningHistory: React.FC = () => {
  const { coinSymbol } = useParams<{ coinSymbol: string }>();
  const navigate = useNavigate();
  const { 
    coinexAccounts, 
    depositHistory, 
    withdrawalHistory,
    registerCoinEXAccount, 
    getCoinEXAccount, 
    generateDepositHistory,
    withdraw,
    withdrawToCoinEX,
    getWithdrawalHistory,
    getAvailableBalance,
    miningData 
  } = useMiningStore();

  const [currentDepositHistory, setCurrentDepositHistory] = useState<DailyDepositRecord[]>([]);
  const [coinexEmail, setCoinexEmail] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [mockUserId] = useState('user123');
  
  // 최소 출금 수량 설정 (코인별로 다르게 설정 가능)
  const getMinWithdrawalAmount = (symbol: string): number => {
    const minAmounts: { [key: string]: number } = {
      'ICC': 0.001,
      'ICS': 0.001,
      'ICG': 0.001,
      'USDT': 1.0,
      'BTC': 0.0001,
      'ETH': 0.001,
      'BNB': 0.01,
      'ADA': 1.0,
      'LTC': 0.01,
      'DOGE': 10.0,
      'BELLS': 100.0
    };
    return minAmounts[symbol] || 0.001;
  };

  useEffect(() => {
    if (coinSymbol) {
      // Find the mining data for this coin to get hashRate
      const coinData = miningData.find(data => data.token_symbol === coinSymbol);
      const hashRate = coinData?.hash_power || 0;
      const price = getCoinPrice(coinSymbol); // Get current price
      
      const history = generateDepositHistory(coinSymbol, hashRate, price);
      setCurrentDepositHistory(history);
    }
  }, [coinSymbol, generateDepositHistory, miningData]);

  const currentAccount = getCoinEXAccount(mockUserId);
  const totalEarnings = currentDepositHistory.reduce((sum, record) => sum + record.amount, 0);
  const totalUsdValue = currentDepositHistory.reduce((sum, record) => sum + record.usdValue, 0);
  const averageDailyProfit = currentDepositHistory.length > 0 ? totalEarnings / currentDepositHistory.length : 0;

  const handleRegisterCoinEX = async () => {
    if (!coinexEmail || !coinexEmail.includes('@')) {
      alert('올바른 이메일 주소를 입력해주세요.');
      return;
    }

    setIsRegistering(true);
    try {
      await registerCoinEXAccount(mockUserId, coinexEmail);
      alert('CoinEX 계정이 성공적으로 등록되었습니다!');
      setCoinexEmail('');
    } catch (error) {
      alert('계정 등록에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsRegistering(false);
    }
  };

  const handleWithdrawFromHistory = async () => {
    if (!currentAccount) {
      alert('먼저 CoinEX 계정을 등록해주세요.');
      return;
    }

    const amount = parseFloat(withdrawAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('올바른 출금 금액을 입력해주세요.');
      return;
    }

    const availableBalance = getAvailableBalance(coinSymbol!);
    if (amount > availableBalance) {
      alert('출금 가능한 금액을 초과했습니다.');
      return;
    }

    setIsWithdrawing(true);
    try {
      await withdrawToCoinEX(coinSymbol!, amount, currentAccount.email);
      alert(`${amount} ${coinSymbol}이(가) 성공적으로 출금되었습니다.`);
      setWithdrawAmount('');
      // 출금 후 히스토리 새로고침
      const coinData = miningData.find(data => data.token_symbol === coinSymbol);
      const hashRate = coinData?.hash_power || 0;
      const price = getCoinPrice(coinSymbol!);
      const updatedHistory = generateDepositHistory(coinSymbol!, hashRate, price);
      setCurrentDepositHistory(updatedHistory);
    } catch (error) {
      alert('출금에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsWithdrawing(false);
    }
  };

  return (
    <Layout>
      <div className="p-4">
        <div className="max-w-6xl mx-auto">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-h1 text-gray-800">
              {coinSymbol} 채굴 수익 내역
            </h1>
          </div>

          {/* Withdrawal Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm mb-8">
            <h2 className="text-h2 text-gray-800 mb-4">출금</h2>
            
            {/* Available Balance */}
            <div className="bg-blue-50 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-blue-800">출금 가능 잔액</h3>
              </div>
              <p className="text-body font-bold text-blue-900">
                {getAvailableBalance(coinSymbol!).toFixed(6)} {coinSymbol}
              </p>
              <p className="text-body-sm text-blue-600">
                ≈ {totalUsdValue.toFixed(2)} USDT
              </p>
              <div className="mt-3 pt-3 border-t border-blue-200">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">최소 출금 수량:</span> {getMinWithdrawalAmount(coinSymbol!)} {coinSymbol}
                </p>
                {getAvailableBalance(coinSymbol!) < getMinWithdrawalAmount(coinSymbol!) && (
                  <p className="text-sm text-orange-600 mt-1">
                    ⚠️ 최소 출금 수량에 도달하지 않았습니다.
                  </p>
                )}
              </div>
            </div>
            
            {currentAccount ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-green-800">
                      등록된 CoinEX 계정: {currentAccount.email}
                    </p>
                    <p className="text-body-sm text-green-600">
                      등록일: {new Date(currentAccount.registeredAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-body-sm font-medium text-gray-700 mb-2">
                      출금 금액
                    </label>
                    <input
                      type="number"
                      placeholder="출금할 금액을 입력하세요"
                      value={withdrawAmount}
                      onChange={(e) => setWithdrawAmount(e.target.value)}
                      max={totalEarnings}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-body-sm font-medium text-gray-700 mb-2">
                      CoinEX 계정
                    </label>
                    <input
                      type="email"
                      value={currentAccount.email}
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500"
                    />
                  </div>
                </div>
                
                <button
                  onClick={handleWithdrawFromHistory}
                  disabled={
                    isWithdrawing || 
                    !withdrawAmount || 
                    parseFloat(withdrawAmount) > getAvailableBalance(coinSymbol!) ||
                    parseFloat(withdrawAmount) < getMinWithdrawalAmount(coinSymbol!) ||
                    getAvailableBalance(coinSymbol!) < getMinWithdrawalAmount(coinSymbol!)
                  }
                  className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {isWithdrawing ? '출금 처리 중...' : `${withdrawAmount || '0'} ${coinSymbol} 출금하기`}
                </button>
                
                {/* 에러 메시지들 */}
                {parseFloat(withdrawAmount) > getAvailableBalance(coinSymbol!) && withdrawAmount && (
                  <p className="text-body-sm text-red-600 mt-2">
                    출금 가능한 금액을 초과했습니다. (최대: {getAvailableBalance(coinSymbol!).toFixed(6)} {coinSymbol})
                  </p>
                )}
                {parseFloat(withdrawAmount) < getMinWithdrawalAmount(coinSymbol!) && withdrawAmount && (
                  <p className="text-body-sm text-red-600 mt-2">
                    최소 출금 수량보다 적습니다. (최소: {getMinWithdrawalAmount(coinSymbol!)} {coinSymbol})
                  </p>
                )}
                {getAvailableBalance(coinSymbol!) < getMinWithdrawalAmount(coinSymbol!) && (
                  <p className="text-body-sm text-orange-600 mt-2">
                    잔액이 최소 출금 수량에 도달하지 않아 출금할 수 없습니다.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">
                      CoinEX 계정이 등록되지 않았습니다
                    </p>
                    <p className="text-body-sm text-yellow-600">
                      출금을 위해서는 CoinEX 거래소 계정(이메일)을 등록해야 합니다.
                    </p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-body-sm font-medium text-gray-700 mb-2">
                      CoinEX 계정 이메일
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="email"
                        placeholder="CoinEX 계정 이메일을 입력하세요"
                        value={coinexEmail}
                        onChange={(e) => setCoinexEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                  <div className="flex items-end">
                    <button
                      onClick={handleRegisterCoinEX}
                      disabled={isRegistering}
                      className="w-full px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                    >
                      {isRegistering ? '등록 중...' : '계정 등록'}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>



          {/* Mining History Table */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-h2 text-gray-800">채굴 수익 내역</h2>
              <p className="text-body-sm text-gray-600 mt-1">
                매일 일정 시간에 보유 해시 파워에 따라 입금된 내역입니다.
              </p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-body-sm font-medium text-gray-500 uppercase tracking-wider">
                      날짜
                    </th>
                    <th className="px-6 py-3 text-left text-body-sm font-medium text-gray-500 uppercase tracking-wider">
                      입금량
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentDepositHistory.map((record, index) => (
                    <tr key={`${record.id}-${record.date}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-body-sm font-medium text-gray-900">
                            {record.date}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-body-sm font-semibold text-green-600">
                          +{record.amount.toFixed(6)} {record.coinSymbol}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {currentDepositHistory.length === 0 && (
              <div className="p-8 text-center">
                <p className="text-gray-500">아직 채굴 수익 내역이 없습니다.</p>
              </div>
            )}
          </div>

          {/* Withdrawal History */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-body font-semibold text-gray-900 mb-4">출금 내역</h3>
            <div className="overflow-x-auto">
              {getWithdrawalHistory().filter(record => record.coinSymbol === coinSymbol).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  출금 내역이 없습니다.
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 text-body-sm font-medium text-gray-700">날짜</th>
                      <th className="text-left py-3 px-4 text-body-sm font-medium text-gray-700">수량</th>
                      <th className="text-left py-3 px-4 text-body-sm font-medium text-gray-700">CoinEX 이메일</th>
                      <th className="text-left py-3 px-4 text-body-sm font-medium text-gray-700">상태</th>
                    </tr>
                  </thead>
                  <tbody>
                    {getWithdrawalHistory()
                      .filter(record => record.coinSymbol === coinSymbol)
                      .map((record, index) => (
                      <tr key={`${record.id}-${index}`} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-body-sm text-gray-900">
                          {new Date(record.timestamp).toLocaleDateString('ko-KR')}
                        </td>
                        <td className="py-3 px-4 text-body-sm text-gray-900">
                          {record.amount.toFixed(6)} {coinSymbol}
                        </td>
                        <td className="py-3 px-4 text-body-sm text-gray-900">{record.coinexEmail}</td>
                        <td className="py-3 px-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-body-sm font-medium ${
                            record.status === 'completed' 
                              ? 'bg-green-100 text-green-800'
                              : record.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {record.status === 'completed' ? '완료' : record.status === 'pending' ? '처리중' : '실패'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default MiningHistory;