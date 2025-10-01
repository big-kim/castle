import React, { useState, useEffect } from 'react';
import { X, Copy, Download, Share2, ChevronDown, Check, QrCode } from 'lucide-react';
import { useWalletStore } from '../stores/walletStore';
import { getCoinIcon, getCoinInitial } from '../utils/coinIcons';
import { toast } from 'sonner';

interface ReceiveModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetType: 'bnb' | 'point' | 'nft';
  coinType?: string;
}

export const ReceiveModal: React.FC<ReceiveModalProps> = ({
  isOpen,
  onClose,
  assetType,
  coinType
}) => {
  const walletStore = useWalletStore();
  const { generateQRCode, qrData, isLoading, overview } = walletStore || {};
  const [selectedToken, setSelectedToken] = useState('BNB');
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  // Get current balance
  const getCurrentBalance = () => {
    if (assetType === 'bnb') {
      const token = availableTokens.find(t => t.symbol === selectedToken);
      return token?.balance || 0;
    } else if (assetType === 'point' && coinType) {
      // Fix: pointWallets에서 symbol로 찾기
      const pointWallet = overview?.pointWallets?.find(w => w.symbol === coinType);
      return pointWallet?.balance || 0;
    }
    return 0;
  };

  const currentBalance = getCurrentBalance();
  const selectedTokenData = availableTokens.find(t => t.symbol === selectedToken);

  // Get receive address based on asset type
  const getReceiveAddress = () => {
    if (qrData?.address) {
      return qrData.address;
    }
    // Fallback addresses
    if (assetType === 'bnb') {
      return '0x1234567890abcdef1234567890abcdef12345678';
    } else if (assetType === 'point') {
      return 'point_address_1234567890abcdef';
    }
    return 'address_not_available';
  };

  const receiveAddress = getReceiveAddress();

  useEffect(() => {
    if (isOpen) {
      try {
        const tokenToSet = coinType || 'BNB';
        setSelectedToken(tokenToSet);
        setShowTokenDropdown(false);
        setCopied(false);
        setError(null);
        
        // Generate QR code when modal opens
        console.log('Generating QR code for:', { assetType, tokenToSet });
        if (typeof generateQRCode === 'function') {
          generateQRCode(assetType, undefined, undefined, tokenToSet).catch((err) => {
            console.error('Failed to generate QR code:', err);
            setError('QR 코드 생성에 실패했습니다.');
          });
        } else {
          console.error('generateQRCode is not a function');
          setError('QR 코드 생성 기능을 사용할 수 없습니다.');
        }
      } catch (err) {
        console.error('Error in ReceiveModal useEffect:', err);
        setError('모달 초기화 중 오류가 발생했습니다.');
      }
    }
  }, [isOpen, assetType, coinType, generateQRCode]);

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

  const handleCopyAddress = async () => {
    try {
      await navigator.clipboard.writeText(receiveAddress);
      setCopied(true);
      toast.success('주소가 복사되었습니다');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('주소 복사에 실패했습니다');
    }
  };

  const handleDownloadQR = () => {
    if (qrData?.qrCode) {
      const link = document.createElement('a');
      const svgBlob = new Blob([qrData.qrCode], { type: 'image/svg+xml' });
      link.href = URL.createObjectURL(svgBlob);
      link.download = `${assetType === 'bnb' ? selectedToken : coinType}_receive_qr.svg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
      toast.success('QR 코드가 다운로드되었습니다');
    } else {
      toast.error('QR 코드를 다운로드할 수 없습니다');
    }
  };

  const handleShareAddress = async () => {
    const tokenName = assetType === 'bnb' ? selectedToken : coinType;
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${tokenName} 받기 주소`,
          text: `${tokenName} 받기 주소: ${receiveAddress}`,
          url: window.location.href
        });
      } catch (error) {
        // Fallback to copy
        handleCopyAddress();
      }
    } else {
      // Fallback to copy
      handleCopyAddress();
    }
  };

  const handleTokenChange = (tokenSymbol: string) => {
    try {
      setSelectedToken(tokenSymbol);
      setShowTokenDropdown(false);
      setError(null);
      
      // Generate new QR code for selected token
      console.log('Token changed to:', tokenSymbol);
      if (typeof generateQRCode === 'function') {
        generateQRCode(assetType, undefined, undefined, tokenSymbol).catch((err) => {
          console.error('Failed to generate QR code for token change:', err);
          setError('QR 코드 생성에 실패했습니다.');
        });
      } else {
        setError('QR 코드 생성 기능을 사용할 수 없습니다.');
      }
    } catch (err) {
      console.error('Error in handleTokenChange:', err);
      setError('토큰 변경 중 오류가 발생했습니다.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-gray-900">
            {assetType === 'nft' ? 'NFT 받기' : assetType === 'bnb' ? '토큰 받기' : `${coinType} 받기`}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center space-x-2">
                <div className="w-5 h-5 text-red-500">⚠️</div>
                <p className="text-red-700 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Token Selection Dropdown */}
          {assetType === 'bnb' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                받을 토큰
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
                        onClick={() => handleTokenChange(token.symbol)}
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
                            <div className="text-xs text-gray-500">{token.balance.toFixed(6)}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-gray-900">${token.usdtValue.toFixed(2)}</div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Current Balance */}
          {assetType !== 'nft' && (
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-green-700">현재 잔액</span>
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
                  <span className="font-semibold text-green-900">
                    {currentBalance.toFixed(6)} {assetType === 'bnb' ? selectedToken : coinType}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* QR Code Display */}
          <div className="space-y-4">
            <div className="text-center">
              <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 inline-block">
                {isLoading ? (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : qrData?.qrCode ? (
                  <div className="w-48 h-48 flex items-center justify-center">
                    <img 
                      src={qrData.qrCode} 
                      alt="QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded-lg">
                    <div className="text-center">
                      <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">QR 코드 생성 중...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Receive Address */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">
                받기 주소
              </label>
              <div className="bg-gray-50 p-3 rounded-lg border">
                <div className="text-sm font-mono text-gray-800 break-all">
                  {receiveAddress}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-3 gap-3">
              <button
                onClick={handleCopyAddress}
                className="flex flex-col items-center space-y-2 p-3 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
              >
                {copied ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
                <span className="text-xs font-medium">
                  {copied ? '복사됨' : '주소 복사'}
                </span>
              </button>
              
              <button
                onClick={handleDownloadQR}
                disabled={!qrData?.qrCode}
                className="flex flex-col items-center space-y-2 p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Download className="w-5 h-5" />
                <span className="text-xs font-medium">QR 저장</span>
              </button>
              
              <button
                onClick={handleShareAddress}
                className="flex flex-col items-center space-y-2 p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100 transition-colors"
              >
                <Share2 className="w-5 h-5" />
                <span className="text-xs font-medium">주소 공유</span>
              </button>
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">받기 안내</p>
              <p>
                위 주소로 {assetType === 'bnb' ? selectedToken : coinType}을(를) 보내주세요. 
                QR 코드를 스캔하거나 주소를 복사해서 사용할 수 있습니다.
              </p>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex">
            <button
              onClick={onClose}
              className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};