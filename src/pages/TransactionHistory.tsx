import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Clock, CheckCircle, XCircle, Filter, Search, Coins, Gift } from 'lucide-react';
import { useWalletStore } from '../stores/walletStore';
import { formatCurrency, formatTokenAmount } from '../lib/utils';
import { getCoinIcon } from '../utils/coinIcons';

interface Transaction {
  id: string;
  type: 'send' | 'receive';
  assetType: 'bnb' | 'point' | 'nft';
  coinType?: string;
  coinSymbol?: string;
  amount?: number;
  value?: number;
  toAddress?: string;
  fromAddress?: string;
  status: 'pending' | 'completed' | 'failed';
  timestamp: string;
  createdAt?: string;
  txHash?: string;
  memo?: string;
  paymentMethod?: string;
}

export const TransactionHistory: React.FC = () => {
  const navigate = useNavigate();
  const walletStore = useWalletStore();
  const { 
    bnbTransactions, 
    pointTransactions, 
    nftTransactions,
    fetchBNBTransactions, 
    fetchPointTransactions,
    fetchNFTTransactions,
    isLoading 
  } = walletStore || {};
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filter, setFilter] = useState<'all' | 'token' | 'nft'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'send' | 'receive'>('all');
  const [activeTab, setActiveTab] = useState<'token' | 'nft'>('token');

  useEffect(() => {
    loadTransactions();
    if (typeof fetchBNBTransactions === 'function') {
      fetchBNBTransactions().catch(error => {
        console.error('Failed to fetch BNB transactions:', error);
      });
    }
    if (typeof fetchNFTTransactions === 'function') {
      fetchNFTTransactions().catch(error => {
        console.error('Failed to fetch NFT transactions:', error);
      });
    }
  }, [fetchBNBTransactions, fetchNFTTransactions]);

  const loadTransactions = async () => {
    try {
      let allTransactions: Transaction[] = [];

      // Safely fetch BNB transactions
      if (typeof fetchBNBTransactions === 'function') {
        try {
          const bnbTxs = await fetchBNBTransactions();
          if (Array.isArray(bnbTxs)) {
            const formattedBnbTxs: Transaction[] = bnbTxs.map(tx => ({
              id: tx.id || 'unknown',
              type: (tx.type as 'send' | 'receive') || 'receive',
              assetType: 'bnb' as const,
              amount: tx.amount || 0,
              toAddress: tx.toAddress,
              fromAddress: tx.fromAddress,
              status: (tx.status as 'pending' | 'completed' | 'failed') || 'pending',
              timestamp: tx.timestamp || new Date().toISOString(),
              txHash: tx.txHash,
              memo: tx.memo
            }));
            allTransactions = [...allTransactions, ...formattedBnbTxs];
          }
        } catch (bnbError) {
          console.error('Failed to fetch BNB transactions:', bnbError);
        }
      } else {
        console.warn('fetchBNBTransactions is not a function');
      }

      // Safely fetch point transactions
      if (typeof fetchPointTransactions === 'function') {
        try {
          const pointTxs = await fetchPointTransactions();
          if (Array.isArray(pointTxs)) {
            const formattedPointTxs: Transaction[] = pointTxs.map(tx => ({
              id: tx.id || 'unknown',
              type: (tx.type as 'send' | 'receive') || 'receive',
              assetType: 'point' as const,
              coinType: tx.coinSymbol,
              amount: tx.amount || 0,
              status: (tx.status as 'pending' | 'completed' | 'failed') || 'pending',
              timestamp: tx.timestamp || new Date().toISOString(),
              memo: tx.memo
            }));
            allTransactions = [...allTransactions, ...formattedPointTxs];
          }
        } catch (pointError) {
          console.error('Failed to fetch point transactions:', pointError);
        }
      }

      // Safely fetch NFT transactions
      if (typeof fetchNFTTransactions === 'function') {
        try {
          const nftTxs = await fetchNFTTransactions();
          if (Array.isArray(nftTxs)) {
            const formattedNftTxs: Transaction[] = nftTxs.map(tx => ({
              id: tx.id || 'unknown',
              type: (tx.type as 'send' | 'receive') || 'receive',
              assetType: 'nft' as const,
              amount: tx.value || 0,
              toAddress: tx.toAddress,
              status: (tx.status as 'pending' | 'completed' | 'failed') || 'pending',
              timestamp: tx.timestamp || new Date().toISOString(),
              memo: tx.memo
            }));
            allTransactions = [...allTransactions, ...formattedNftTxs];
          }
        } catch (nftError) {
          console.error('Failed to fetch NFT transactions:', nftError);
        }
      }

      // Sort transactions by timestamp
      allTransactions.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Failed to load transactions:', error);
      setTransactions([]); // Set empty array as fallback
    }
  };

  const getFilteredTransactions = () => {
    let transactionList: any[] = [];
    
    switch (activeTab) {
      case 'token':
        transactionList = bnbTransactions || [];
        break;
      case 'nft':
        transactionList = nftTransactions || [];
        break;
    }
    
    return transactionList.filter(tx => {
      const matchesSearch = searchTerm === '' || 
        tx.toAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.fromAddress?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.memo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.coinSymbol?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesFilter = filterType === 'all' || tx.type === filterType;
      
      return matchesSearch && matchesFilter;
    });
  };

  const filteredTransactions = getFilteredTransactions();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'pending':
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'failed':
        return '실패';
      case 'pending':
      default:
        return '대기중';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50 px-2 py-1 rounded-full text-xs';
      case 'failed':
        return 'text-red-600 bg-red-50 px-2 py-1 rounded-full text-xs';
      case 'pending':
      default:
        return 'text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full text-xs';
    }
  };

  const formatDate = (timestamp: string | undefined) => {
    if (!timestamp) return '날짜 없음';
    
    try {
      const date = new Date(timestamp);
      if (isNaN(date.getTime())) return '잘못된 날짜';
      
      const now = new Date();
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' });
      } else if (diffInHours < 24 * 7) {
        return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
      } else {
        return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'short', day: 'numeric' });
      }
    } catch (error) {
      console.error('Date formatting error:', error);
      return '날짜 오류';
    }
  };

  const getAssetDisplayName = (tx: Transaction) => {
    if (!tx) return 'Unknown';
    if (tx.assetType === 'bnb') return 'BNB';
    if (tx.assetType === 'point' && tx.coinType) return tx.coinType;
    if (tx.assetType === 'point' && tx.coinSymbol) return tx.coinSymbol;
    if (tx.assetType === 'nft') return 'NFT';
    return 'Unknown';
  };

  const truncateAddress = (address: string | undefined) => {
    if (!address || address.length < 10) return address || '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const safeFormatTokenAmount = (amount: number | undefined, symbol: string | undefined) => {
    if (amount === undefined || amount === null) return '0';
    if (!symbol) return amount.toString();
    
    try {
      return formatTokenAmount(amount, symbol);
    } catch (error) {
      console.error('Token amount formatting error:', error);
      return `${amount} ${symbol}`;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">거래 내역을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-md mx-auto bg-white min-h-screen">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
            <h1 className="text-xl font-semibold">거래 내역</h1>
            <div className="w-10" /> {/* Spacer */}
          </div>

          {/* Tab Navigation */}
          <div className="flex bg-white/20 rounded-lg p-1 mb-4">
            <button
              onClick={() => setActiveTab('token')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'token' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              <Coins className="w-4 h-4" />
              토큰
            </button>
            <button
              onClick={() => setActiveTab('nft')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md transition-colors ${
                activeTab === 'nft' ? 'bg-white text-blue-600 shadow-sm' : 'text-white/80 hover:text-white'
              }`}
            >
              <Gift className="w-4 h-4" />
              NFT
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/70" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="주소, 해시, 메모 검색..."
              className="w-full pl-10 pr-4 py-3 bg-white/20 text-white placeholder-white/70 rounded-lg border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/50"
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex space-x-2">
            {[
              { key: 'all', label: '전체' },
              { key: 'token', label: '토큰' },
              { key: 'nft', label: 'NFT' }
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setFilter(key as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  filter === key
                    ? 'bg-white text-blue-600'
                    : 'bg-white/20 text-white hover:bg-white/30'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Transaction List */}
        <div className="p-4 space-y-3">
          {filteredTransactions.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">거래 내역이 없습니다</p>
              <p className="text-sm text-gray-400">
                {searchTerm ? '검색 조건을 확인해주세요' : '첫 거래를 시작해보세요'}
              </p>
            </div>
          ) : (
            filteredTransactions.map((tx) => (
              <div key={tx.id} className="bg-white rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${
                      tx.type === 'send' || tx.type === 'withdraw' ? 'bg-red-100 text-red-600' : 
                      tx.type === 'receive' || tx.type === 'earn' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {tx.type === 'send' || tx.type === 'withdraw' ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : tx.type === 'receive' || tx.type === 'earn' ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <Gift className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {tx.type === 'send' ? '전송' : 
                         tx.type === 'receive' ? '수신' :
                         tx.type === 'withdraw' ? '출금' :
                         tx.type === 'earn' ? '채굴 수익' :
                         tx.type === 'buy' ? 'NFT 구매' : tx.type}
                      </div>
                      <div className="text-sm text-gray-500">
                        {activeTab === 'token' ? tx.coinSymbol?.toUpperCase() || 'BNB' : 
                         'NFT'} • {formatDate(tx.createdAt || tx.timestamp)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`font-medium ${
                      tx.type === 'send' || tx.type === 'withdraw' ? 'text-red-600' : 
                      tx.type === 'receive' || tx.type === 'earn' ? 'text-green-600' :
                      'text-blue-600'
                    }`}>
                      {tx.type === 'send' || tx.type === 'withdraw' ? '-' : 
                       tx.type === 'receive' || tx.type === 'earn' ? '+' : ''}
                      {activeTab === 'token' ? safeFormatTokenAmount(tx.amount, tx.coinSymbol || 'BNB') :
                       tx.value ? `$${tx.value}` : 'NFT'}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                      {getStatusIcon(tx.status)}
                      <span className={getStatusColor(tx.status)}>
                        {getStatusText(tx.status)}
                      </span>
                    </div>
                  </div>
                </div>
                
                {(tx.toAddress || tx.fromAddress) && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">
                      {tx.type === 'send' || tx.type === 'withdraw' ? '받는 주소: ' : '보낸 주소: '}
                    </span>
                    <span className="font-mono">
                      {truncateAddress(tx.type === 'send' || tx.type === 'withdraw' ? tx.toAddress : tx.fromAddress)}
                    </span>
                  </div>
                )}
                
                {tx.memo && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">메모: </span>
                    {tx.memo}
                  </div>
                )}
                
                {tx.paymentMethod && activeTab === 'nft' && (
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">결제 방법: </span>
                    {tx.paymentMethod}
                  </div>
                )}
                
                {tx.txHash && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">트랜잭션 해시: </span>
                    <span className="font-mono text-blue-600 cursor-pointer hover:underline">
                      {truncateAddress(tx.txHash)}
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};