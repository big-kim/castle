import React, { useState, useEffect } from 'react';
import { X, Send, QrCode, User, AlertCircle, ChevronDown } from 'lucide-react';
import { useWalletStore } from '../stores/walletStore';
import { getCoinIcon, getCoinInitial } from '../utils/coinIcons';
import { toast } from 'sonner';
import { QRScanner } from './QRScanner';

interface SendModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetType: 'bnb' | 'point' | 'nft';
  coinType?: string;
  nftId?: string;
}

export const SendModal: React.FC<SendModalProps> = ({
  isOpen,
  onClose,
  assetType,
  coinType,
  nftId
}) => {
  const { sendBNB, withdrawPoint, sendNFT, isLoading, overview } = useWalletStore();
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [memo, setMemo] = useState('');
  const [showQRScanner, setShowQRScanner] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [selectedToken, setSelectedToken] = useState('BNB');
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);

  // Available tokens
  const availableTokens = [
    { symbol: 'BNB', balance: overview?.bnbWallet?.balance || 5.25, usdtValue: 2625.00 },
    { symbol: 'ICC', balance: 1250.50, usdtValue: 2501.00 },
    { symbol: 'ICS', balance: 850.25, usdtValue: 1700.50 },
    { symbol: 'ICF', balance: 500.75, usdtValue: 1502.25 },
    { symbol: 'ICG', balance: 125.00, usdtValue: 3750.00 },
    { symbol: 'AITC', balance: 2500.00, usdtValue: 750.00 },
    { symbol: 'AITCP', balance: 100.50, usdtValue: 1005.00 },
    { symbol: 'USDT', balance: 1000.00, usdtValue: 1000.00 },
  ];

  // Get available balance
  const getAvailableBalance = () => {
    if (assetType === 'bnb') {
      const token = availableTokens.find(t => t.symbol === selectedToken);
      return token?.balance || 0;
    } else if (assetType === 'point' && coinType) {
      const pointWallet = overview?.pointWallets?.find(w => w.coinType === coinType);
      return pointWallet?.balance || 0;
    }
    return 0;
  };

  const availableBalance = getAvailableBalance();
  const selectedTokenData = availableTokens.find(t => t.symbol === selectedToken);

  useEffect(() => {
    if (isOpen) {
      setRecipient('');
      setAmount('');
      setMemo('');
      setErrors({});
      setSelectedToken('BNB');
      setShowTokenDropdown(false);
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showTokenDropdown) {
        const target = event.target as HTMLElement;
        if (!target.closest('.token-dropdown')) {
          setShowTokenDropdown(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTokenDropdown]);

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!recipient.trim()) {
      newErrors.recipient = '받는 사람 주소를 입력해주세요';
    } else if (recipient.length < 10) {
      newErrors.recipient = '올바른 지갑 주소를 입력해주세요';
    }

    if (assetType !== 'nft') {
      if (!amount.trim()) {
          newErrors.amount = '보낼 금액을 입력해주세요';
      } else {
        const numAmount = parseFloat(amount);
        if (isNaN(numAmount) || numAmount <= 0) {
          newErrors.amount = '올바른 금액을 입력해주세요';
        } else if (numAmount > availableBalance) {
          newErrors.amount = '잔액이 부족합니다';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    try {
      if (assetType === 'bnb') {
        await sendBNB(recipient, parseFloat(amount), memo);
        toast.success(`${selectedToken} 보내기가 완료되었습니다`);
      } else if (assetType === 'point' && coinType) {
        await withdrawPoint(coinType, parseFloat(amount), recipient);
        toast.success(`${coinType} 보내기가 완료되었습니다`);
      } else if (assetType === 'nft' && nftId) {
        await sendNFT(nftId, recipient);
        toast.success('NFT 보내기가 완료되었습니다');
      }
      onClose();
    } catch (error) {
      toast.error('보내기에 실패했습니다. 다시 시도해주세요.');
    }
  };

  const handleMaxAmount = () => {
    if (assetType === 'bnb') {
      // Reserve some BNB for gas fees only for BNB token
      if (selectedToken === 'BNB') {
        const maxSendable = Math.max(0, availableBalance - 0.001);
        setAmount(maxSendable.toString());
      } else {
        setAmount(availableBalance.toString());
      }
    } else {
      setAmount(availableBalance.toString());
    }
  };

  const handleQRScan = () => {
    setShowQRScanner(true);
  };

  const handleQRScanSuccess = (address: string) => {
    setRecipient(address);
    setShowQRScanner(false);
    // Clear any existing recipient errors
    if (errors.recipient) {
      setErrors(prev => ({ ...prev, recipient: '' }));
    }
  };

  const handleQRScanClose = () => {
    setShowQRScanner(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {assetType === 'nft' ? 'NFT 보내기' : assetType === 'bnb' ? '토큰 보내기' : `${coinType} 보내기`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Token Selection Dropdown */}
          {assetType === 'bnb' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                보낼 토큰
              </label>
              <div className="relative token-dropdown">
                 <button
                   onClick={() => setShowTokenDropdown(!showTokenDropdown)}
                   className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white hover:bg-gray-50 transition-colors"
                 >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <img 
                        src={getCoinIcon(selectedToken)} 
                        alt={selectedToken}
                        className="w-6 h-6 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.textContent = getCoinInitial(selectedToken);
                        }}
                      />
                      <span className="text-sm font-bold text-blue-600 hidden">{getCoinInitial(selectedToken)}</span>
                    </div>
                    <span className="font-medium text-gray-900">{selectedToken}</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showTokenDropdown ? 'rotate-180' : ''}`} />
                </button>
                
                {showTokenDropdown && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
                    {availableTokens.map((token) => (
                      <button
                        key={token.symbol}
                        onClick={() => {
                          setSelectedToken(token.symbol);
                          setShowTokenDropdown(false);
                          setAmount(''); // Reset amount when token changes
                        }}
                        className="w-full flex items-center justify-between p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                            <img 
                              src={getCoinIcon(token.symbol)} 
                              alt={token.symbol}
                              className="w-6 h-6 rounded-full"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling!.textContent = getCoinInitial(token.symbol);
                              }}
                            />
                            <span className="text-sm font-bold text-blue-600 hidden">{getCoinInitial(token.symbol)}</span>
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-gray-900">{token.symbol}</div>
                            <div className="text-xs text-gray-500">{(token.balance || 0).toFixed(6)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">${(token.usdtValue || 0).toFixed(2)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Available Balance */}
          {assetType !== 'nft' && (
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-blue-700">사용 가능한 잔액</span>
                <div className="flex items-center space-x-2">
                  {assetType === 'bnb' && selectedTokenData && (
                    <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                      <img 
                        src={getCoinIcon(selectedToken)} 
                        alt={selectedToken}
                        className="w-4 h-4 rounded-full"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.nextElementSibling!.textContent = getCoinInitial(selectedToken);
                        }}
                      />
                      <span className="text-xs font-bold text-blue-600 hidden">{getCoinInitial(selectedToken)}</span>
                    </div>
                  )}
                  <span className="font-semibold text-blue-900">
                    {availableBalance.toFixed(6)} {assetType === 'bnb' ? selectedToken : coinType}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Recipient Address */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              받는 사람 주소
            </label>
            <div className="flex space-x-2">
              <div className="flex-1">
                <input
                  type="text"
                  value={recipient}
                  onChange={(e) => setRecipient(e.target.value)}
                  placeholder="지갑 주소를 입력하세요"
                  className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.recipient ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.recipient && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.recipient}
                  </p>
                )}
              </div>
              <button
                onClick={handleQRScan}
                className="p-3 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <QrCode className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Amount */}
          {assetType !== 'nft' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                보낼 금액
              </label>
              <div className="space-y-2">
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.000001"
                    min="0"
                    max={availableBalance}
                    className={`flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      errors.amount ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <button
                    onClick={handleMaxAmount}
                    className="px-4 py-3 bg-blue-100 text-blue-600 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
                  >
                    최대
                  </button>
                </div>
                {errors.amount && (
                  <p className="text-red-500 text-xs flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    {errors.amount}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Memo */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              메모 (선택사항)
            </label>
            <textarea
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
              placeholder="메모를 입력하세요"
              rows={3}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Transaction Fee Info */}
          {assetType === 'bnb' && (
            <div className="bg-yellow-50 p-4 rounded-lg">
              <div className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">거래 수수료 안내</p>
                  <p>
                    {selectedToken === 'BNB' 
                      ? 'BNB 네트워크 수수료가 별도로 차감됩니다. (약 0.001 BNB)'
                      : `${selectedToken} 보내기 시 BNB 네트워크 수수료가 별도로 차감됩니다. (약 0.001 BNB)`
                    }
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              onClick={handleSend}
              disabled={isLoading}
              className="flex-1 flex items-center justify-center space-x-2 p-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>보내기</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* QR Scanner Modal */}
      <QRScanner
        isOpen={showQRScanner}
        onClose={handleQRScanClose}
        onScanSuccess={handleQRScanSuccess}
      />
    </div>
  );
};