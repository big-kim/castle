import React from 'react';
import { Award, Coins, QrCode, ShoppingCart, X } from 'lucide-react';

// Props 인터페이스 정의
export interface ICGiftCardProps {
  // 기본 정보
  id?: string;
  denomination: number;
  currentBalance?: number;
  faceValue?: number;
  
  // 상태 정보
  status?: 'active' | 'used' | 'expired';
  
  // 구매 정보 (선택적)
  purchaseDate?: string;
  purchasePrice?: number;
  price?: number;
  discount?: number;
  
  // 이벤트 핸들러
  onClick?: () => void;
  onPurchase?: (denomination: number) => void;
  
  // 표시 모드
  displayMode: 'wallet' | 'store' | 'my-cards';
  
  // 추가 옵션
  showPurchaseButton?: boolean;
  className?: string;
}

// 권종별 색상 테마 정의
const getCardTheme = (denomination: number) => {
  switch (denomination) {
    case 10000:
      return {
        gradient: 'from-slate-400 via-slate-500 to-slate-600',
        accent: 'from-slate-300 to-slate-400',
        text: 'text-slate-100',
        border: 'border-slate-300',
        shadow: 'shadow-slate-500/30',
        name: '실버'
      };
    case 50000:
      return {
        gradient: 'from-yellow-400 via-yellow-500 to-yellow-600',
        accent: 'from-yellow-300 to-yellow-400',
        text: 'text-yellow-100',
        border: 'border-yellow-300',
        shadow: 'shadow-yellow-500/30',
        name: '골드'
      };
    case 100000:
      return {
        gradient: 'from-gray-300 via-gray-400 to-gray-500',
        accent: 'from-gray-200 to-gray-300',
        text: 'text-gray-100',
        border: 'border-gray-300',
        shadow: 'shadow-gray-500/30',
        name: '플래티넘'
      };
    case 500000:
      return {
        gradient: 'from-blue-400 via-purple-500 to-pink-500',
        accent: 'from-blue-300 to-purple-400',
        text: 'text-white',
        border: 'border-purple-300',
        shadow: 'shadow-purple-500/30',
        name: '다이아몬드'
      };
    default:
      return {
        gradient: 'from-slate-400 via-slate-500 to-slate-600',
        accent: 'from-slate-300 to-slate-400',
        text: 'text-slate-100',
        border: 'border-slate-300',
        shadow: 'shadow-slate-500/30',
        name: '실버'
      };
  }
};

// 상태별 색상 정의
const getStatusColor = (status: string) => {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-800';
    case 'used': return 'bg-gray-100 text-gray-800';
    case 'expired': return 'bg-red-100 text-red-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'active': return '사용 가능';
    case 'used': return '사용 완료';
    case 'expired': return '만료됨';
    default: return '알 수 없음';
  }
};

// 성 실루엣 SVG 컴포넌트 (castle_logo.svg 참조)
const CastleIcon: React.FC<{ size?: number; className?: string }> = ({ 
  size = 40, 
  className = "opacity-80" 
}) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 197 197" 
    fill="none" 
    className={className}
  >
    <path 
      d="M45.5734 88.5486H70.977V88.7231L69.5812 90.4329H46.9692L45.5734 88.7231V88.5486ZM43.375 86.3153H73.1056V72.3922H67.1385V78.9176H61.2412V72.3922H55.2393V78.9176H49.0629V72.3922H43.375V86.3153ZM68.953 92.6313V137.332C55.3091 132.028 42.8516 136.913 42.8516 136.913C43.7937 124.56 47.5973 92.6313 47.5973 92.6313H68.9879H68.953ZM58.2054 98.9822C55.0997 98.9822 54.8903 103.728 54.8903 103.728V108.892H60.997V103.798C60.997 103.798 61.2761 99.0171 58.1705 99.0171L58.2054 98.9822ZM162.053 88.5486H136.649V88.7231L138.045 90.4329H160.657L162.053 88.7231V88.5486ZM164.251 72.4271H158.563V78.9525H152.387V72.4271H146.385V78.9525H140.488V72.4271H134.521V86.3502H164.251V72.4271ZM160.064 92.6313C160.064 92.6313 165.228 136.634 166.171 148.987C166.171 148.987 152.422 150.034 138.673 142.427V92.6313H160.064ZM146.629 103.798V108.892H152.736V103.728C152.736 103.728 152.527 98.9822 149.421 98.9822C146.315 98.9822 146.594 103.763 146.594 103.763L146.629 103.798ZM81.4106 64.0174C104.755 61.8888 126.53 64.0174 126.53 64.0174V49.2219H120.982V55.6775H114.7V49.2219H107.477V55.6775H100.708V49.2219H93.5889V55.6775H87.238V49.2219H81.1314L81.3757 64.0174H81.4106ZM83.7485 66.0413L85.4933 67.8209C85.4933 67.8209 106.814 66.3902 122.098 67.8209L124.122 66.0413C124.122 66.0413 103.045 63.3544 83.7485 66.0413ZM86.5401 70.2636V96.1208H95.8222V102.611H98.9977V96.1557H108.629V102.611H112.467V96.1557H121.261V70.2985C121.261 70.2985 102.103 68.4142 86.575 70.2985L86.5401 70.2636ZM92.0536 45.4881H116.445L105.104 29.8203V22.8412C105.104 22.8412 110.478 21.8991 113.758 23.0157C117.038 24.1324 123.11 24.4115 126.949 18.7585C126.949 18.7585 119.446 20.7475 115.747 16.4206C112.083 12.1285 105.035 14.1524 105.035 14.1524V11.8493L103.708 10.2441L102.278 11.9191V29.7854L92.0536 45.4532V45.4881ZM72.5123 98.1796L73.1056 138.693C73.1056 138.693 83.8881 145.393 93.3796 144.311V123.653C93.3796 123.653 93.9728 114.615 103.883 114.615C113.793 114.615 114.7 123.967 114.7 123.967V138.658C114.7 138.658 123.32 136.564 134.556 141.135V98.2145H127.472V104.775H121.714V98.2145H115.014V104.565H106.535V98.2145H101.196V104.565H92.891V98.2145H85.9469V104.705H80.259V98.2145H72.5123V98.1796Z" 
      fill="currentColor"
    />
  </svg>
);

// 통화 포맷 함수
const formatCurrency = (amount: number) => {
  return `₩${amount.toLocaleString()}`;
};

// 메인 IC상품권 카드 컴포넌트
export const ICGiftCard: React.FC<ICGiftCardProps> = ({
  id,
  denomination,
  currentBalance = denomination,
  faceValue = denomination,
  status = 'active',
  purchaseDate,
  purchasePrice,
  price,
  discount = 0,
  onClick,
  onPurchase,
  displayMode,
  showPurchaseButton = false,
  className = ''
}) => {
  const theme = getCardTheme(denomination);

  // 지갑 페이지 모드
  if (displayMode === 'wallet') {
    return (
      <div 
        className={`relative bg-gradient-to-br ${theme.gradient} rounded-2xl p-4 shadow-xl ${theme.shadow} border ${theme.border} cursor-pointer hover:shadow-2xl hover:scale-105 transition-all duration-300 active:scale-[0.98] overflow-hidden ${className}`}
        onClick={onClick}
      >
        {/* 배경 장식 요소들 */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 right-2">
            <CastleIcon />
          </div>
          <div className="absolute bottom-2 left-2 transform rotate-12 opacity-50">
            <CastleIcon />
          </div>
        </div>
        
        {/* 상단 헤더 */}
        <div className="relative z-10 flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <CastleIcon />
            <div>
              <p className={`text-xs font-medium ${theme.text} opacity-90`}>IC Resort</p>
              <p className={`text-xs ${theme.text} opacity-70`}>{theme.name} 등급</p>
            </div>
          </div>
          <div className={`px-2 py-1 bg-gradient-to-r ${theme.accent} rounded-full`}>
            <span className="text-xs font-bold text-white">NFT</span>
          </div>
        </div>

        {/* 카드 정보 */}
        <div className="relative z-10 space-y-2">
          <h3 className={`text-sm font-bold ${theme.text}`}>
            IC Resort NFT
          </h3>
          
          <div className="space-y-1">
            <div className="flex justify-between items-center">
              <span className={`text-xs ${theme.text} opacity-80`}>액면가</span>
              <span className={`text-sm font-bold ${theme.text}`}>
                ₩{faceValue.toLocaleString()}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className={`text-xs ${theme.text} opacity-80`}>잔액</span>
              <span className={`text-sm font-bold ${theme.text}`}>
                ₩{currentBalance.toLocaleString()}
              </span>
            </div>
          </div>

          {/* 프로그레스 바 */}
          <div className="w-full bg-white/20 rounded-full h-1.5 mt-2">
            <div 
              className={`bg-gradient-to-r ${theme.accent} h-1.5 rounded-full transition-all duration-300`}
              style={{ width: `${(currentBalance / faceValue) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* 홀로그램 효과 */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent opacity-50 pointer-events-none"></div>
      </div>
    );
  }

  // 스토어 페이지 모드
  if (displayMode === 'store') {
    return (
      <div className={`bg-gradient-to-br ${theme.gradient} rounded-3xl shadow-2xl overflow-hidden border ${theme.border} transform hover:scale-105 transition-all duration-300 ${className}`}>
        {/* Premium NFT Header */}
        <div className="relative p-5 text-white">
          {/* Decorative Castle Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-3 left-3 w-12 h-12 border-2 border-white rounded-full"></div>
            <div className="absolute top-3 right-3 w-8 h-8 border border-white rounded-full"></div>
            <div className="absolute bottom-3 left-3 w-6 h-6 border border-white rounded-full"></div>
            <div className="absolute bottom-3 right-3 w-16 h-16 border-2 border-white rounded-full"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 border border-white rounded-full"></div>
          </div>
          
          {/* Castle Icon and Branding */}
          <div className="relative z-10 flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {/* Castle SVG Icon */}
              <div className="w-12 h-12 text-white">
                <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                  <rect x="10" y="60" width="80" height="30" />
                  <rect x="20" y="40" width="15" height="20" />
                  <rect x="35" y="50" width="30" height="10" />
                  <rect x="65" y="40" width="15" height="20" />
                  <polygon points="15,40 25,30 30,40" />
                  <polygon points="40,50 50,35 60,50" />
                  <polygon points="70,40 75,30 80,40" />
                  <rect x="45" y="70" width="10" height="15" />
                  <circle cx="25" cy="45" r="2" />
                  <circle cx="75" cy="45" r="2" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold">IC Resort</h3>
                <p className={`${theme.text} text-sm`}>{theme.name} Gift Card</p>
              </div>
            </div>
          </div>
          
          {/* Denomination Display */}
          <div className="relative z-10 text-center">
            <p className="text-sm opacity-90 mb-1">상품권 금액</p>
            <p className="text-4xl font-bold mb-3">{denomination.toLocaleString()}원</p>
            {price && (
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <p className="text-xs opacity-75">판매가격</p>
                  <p className="text-xl font-semibold">{formatCurrency(price)}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Purchase Section */}
        <div className="bg-white p-4">
          <div className="space-y-3">
            {/* Features */}
            <div className="grid grid-cols-3 gap-3 text-xs">
              <div className="text-center">
                <Award className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-gray-600">NFT 인증</p>
              </div>
              <div className="text-center">
                <Coins className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-gray-600">USDT/ICF</p>
              </div>
              <div className="text-center">
                <QrCode className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                <p className="text-gray-600">QR 결제</p>
              </div>
            </div>
            
            {/* Purchase Button */}
            {(showPurchaseButton || onPurchase) && (
              <button
                onClick={() => onPurchase?.(denomination)}
                className={`w-full py-3 bg-gradient-to-r ${theme.gradient} text-white font-bold text-base rounded-2xl hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2`}
              >
                <ShoppingCart className="w-5 h-5" />
                <span>구매하기</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 내 카드 탭 모드
  if (displayMode === 'my-cards') {
    return (
      <div 
        className={`bg-white rounded-2xl shadow-lg border border-gray-100 cursor-pointer hover:shadow-xl hover:border-gray-300 transition-all duration-200 active:scale-[0.98] overflow-hidden ${className}`}
        onClick={onClick}
      >
        {/* Card Header with Castle Design */}
        <div className={`relative bg-gradient-to-br ${theme.gradient} p-4 text-white`}>
          {/* Decorative Castle Elements */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-2 w-8 h-8 border border-white rounded-full"></div>
            <div className="absolute top-2 right-2 w-6 h-6 border border-white rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-4 h-4 border border-white rounded-full"></div>
            <div className="absolute bottom-2 right-2 w-10 h-10 border border-white rounded-full"></div>
          </div>
          
          {/* Status Badge */}
          {status && (
            <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)} z-10`}>
              {getStatusText(status)}
            </div>
          )}
          
          {/* Castle Icon and Branding */}
          <div className="relative z-10 flex items-center space-x-3 mb-3">
            {/* Castle SVG Icon */}
            <div className="w-8 h-8 text-white">
              <svg viewBox="0 0 100 100" className="w-full h-full fill-current">
                <rect x="10" y="60" width="80" height="30" />
                <rect x="20" y="40" width="15" height="20" />
                <rect x="35" y="50" width="30" height="10" />
                <rect x="65" y="40" width="15" height="20" />
                <polygon points="15,40 25,30 30,40" />
                <polygon points="40,50 50,35 60,50" />
                <polygon points="70,40 75,30 80,40" />
                <rect x="45" y="70" width="10" height="15" />
                <circle cx="25" cy="45" r="2" />
                <circle cx="75" cy="45" r="2" />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-white">IC Resort</h3>
              <p className={`${theme.text} text-xs`}>{theme.name} Gift Card</p>
            </div>
          </div>
          
          {/* Denomination Display */}
          <div className="relative z-10 text-center">
            <p className="text-2xl font-bold">{denomination.toLocaleString()}원</p>
            {id && <span className="text-xs text-white opacity-75">#{id.slice(-4)}</span>}
          </div>
        </div>

        {/* Card Info */}
        <div className="p-4 space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">잔액</span>
              <span className="font-medium text-primary">{currentBalance.toLocaleString()}원</span>
            </div>
            {purchaseDate && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">구매일</span>
                <span className="text-gray-500">{purchaseDate}</span>
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>사용률</span>
              <span>{Math.round(((denomination - currentBalance) / denomination) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`bg-gradient-to-r ${theme.gradient} h-2 rounded-full transition-all duration-300`}
                style={{ width: `${((denomination - currentBalance) / denomination) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ICGiftCard;