import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, User, Bell, Star, ChevronDown, LogOut } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';

interface GlobalHeaderProps {
  title?: string;
  showBackButton?: boolean;
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  title,
  showBackButton = false,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useUserStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleBack = () => {
    navigate(-1);
  };

  const handleProfile = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleMyPage = () => {
    navigate('/mypage');
    setIsDropdownOpen(false);
  };

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    navigate('/');
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const getPageTitle = () => {
    if (title) return title;
    
    switch (location.pathname) {
      case '/':
        return '지갑';
      case '/p2p':
        return 'P2P 마켓';
      case '/mining':
        return '채굴';
      case '/finance':
        return '금융';
      case '/gift':
        return '스토어';
      case '/mypage':
        return '마이페이지';
      default:
        return 'IC Wallet';
    }
  };

  return (
    <header className="bg-white border-b border-gray-100 px-3 sm:px-4 py-2.5 sm:py-3 flex items-center justify-between sticky top-0 z-50 shadow-sm">
      {/* Left Section */}
      <div className="flex items-center space-x-3">
        {showBackButton ? (
          <button
            onClick={handleBack}
            className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
            aria-label="뒤로 가기"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
        ) : (
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
            aria-label="홈으로 가기"
          >
            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-gray-100">
              <img
                src="/images/castle_logo.svg"
                alt="IC Wallet"
                className="w-10 h-10 object-contain"
              />
            </div>
          </button>
        )}
        
        <h1 className="text-base sm:text-lg font-semibold text-gray-900 truncate">
          {getPageTitle()}
        </h1>
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        {user && (
          <>
            {/* Notification Bell */}
            <div className="relative">
              <button
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors relative"
                aria-label="알림"
              >
                <Bell className="w-5 h-5" />
                {/* Notification Badge */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                  <span className="text-xs text-white font-bold">3</span>
                </div>
              </button>
            </div>

            {/* User Profile Section */}
            <div className="relative" ref={dropdownRef}>
             <button
               onClick={handleProfile}
               className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-xl hover:bg-gray-50 transition-all duration-200 group"
               aria-label="사용자 프로필"
             >
              {/* Avatar */}
              <div className="relative">
                {user.profile_image ? (
                  <img
                    src={user.profile_image}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border-2 border-primary/20 group-hover:border-primary/40 transition-colors"
                  />
                ) : (
                  <div className="w-10 h-10 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center border-2 border-primary/20 group-hover:border-primary/40 transition-colors">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                )}
                {/* Online Status */}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
              </div>

              {/* User Info - Hidden on very small screens */}
                <div className="hidden sm:flex flex-col items-start min-w-0">
                 <div className="flex items-center space-x-1">
                   <span className="text-sm font-semibold text-gray-900 truncate max-w-16 sm:max-w-20">
                     {user.name || 'User'}
                   </span>
                   <div className="flex items-center space-x-0.5">
                     <Star className="w-3 h-3 text-yellow-500 fill-current" />
                     <span className="text-xs text-yellow-600 font-medium">VIP</span>
                   </div>
                 </div>
                 <div className="flex items-center space-x-1 sm:space-x-2">
                   <span className="text-xs text-gray-500">잔액:</span>
                   <span className="text-xs font-semibold text-primary">₩1,234,567</span>
                 </div>
               </div>
               
               {/* Dropdown Arrow */}
               <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {/* Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-50">
                <button
                  onClick={handleMyPage}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  <span>마이페이지</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>로그아웃</span>
                </button>
              </div>
            )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};