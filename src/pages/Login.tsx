import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../stores/userStore';
import { cn } from '../lib/utils';

// Social platform icons as SVG components
const KakaoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 2C5.58 2 2 4.69 2 8c0 2.16 1.4 4.08 3.5 5.19L4.5 16.5c-.1.3.2.6.5.4l3.5-2.3c.5.1 1 .1 1.5.1 4.42 0 8-2.69 8-6S14.42 2 10 2z" fill="currentColor"/>
  </svg>
);

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M19.99 10.187c0-.82-.069-1.417-.216-2.037H10.2v3.698h5.62c-.113.76-.583 1.916-1.679 2.693l-.015.099 2.441 1.885.169.017c1.551-1.427 2.454-3.522 2.454-6.355z" fill="#4285F4"/>
    <path d="M10.2 19.931c2.217 0 4.064-.695 5.418-1.908l-2.595-1.991c-.703.492-1.623.821-2.823.821-2.181 0-4.031-1.407-4.696-3.35l-.096.008-2.54 1.945-.033.094c1.338 2.652 4.086 4.381 7.365 4.381z" fill="#34A853"/>
    <path d="M5.504 11.503c-.165-.492-.259-1.016-.259-1.564 0-.548.094-1.072.259-1.564l-.008-.105-2.573-1.982-.084.04C1.617 7.532 1.08 8.702 1.08 9.939c0 1.237.537 2.407 1.759 3.611l2.665-2.047z" fill="#FBBC05"/>
    <path d="M10.2 4.375c1.548 0 2.594.672 3.19 1.229l2.342-2.27C14.251 1.94 12.417 1.08 10.2 1.08c-3.279 0-6.027 1.729-7.365 4.381l2.657 2.047c.665-1.943 2.515-3.35 4.708-3.35z" fill="#EB4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M15.5 7.5c-.1 2.2 1.9 3.2 2 3.3-.1.2-1.1 2.8-2.8 4.2-1.5 1.2-3 1.2-3.6 1.2-.6 0-1.5-.2-2.4-.2-.9 0-1.9.2-2.5.2-.6 0-2.1 0-3.6-1.2C.9 13.6-.1 11 .8 7.5c.4-1.7 1.6-3 2.8-3.7.6-.4 1.4-.6 2.1-.6.7 0 1.4.2 2 .2.6 0 1.4-.2 2.4-.2 1.2 0 2.2.4 2.9 1.1-.1.1-1.7 1-1.5 3.2zM12.8 3.5c.7-.8 1.2-2 1.1-3.2-1 0-2.3.7-3 1.5-.7.8-1.3 2-1.1 3.1 1.1.1 2.3-.6 3-1.4z" fill="currentColor"/>
  </svg>
);

export const Login: React.FC = () => {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const navigate = useNavigate();
  const { login } = useUserStore();

  const handleSocialLogin = async (provider: 'kakao' | 'google' | 'apple') => {
    setIsLoading(provider);
    
    try {
      // Use the login function from userStore
      await login(provider, 'password123'); // Mock password for social login
      
      // Navigate to home dashboard
      navigate('/home');
    } catch (error) {
      console.error('Social login failed:', error);
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header with Logo */}
      <div className="flex-1 flex flex-col justify-center px-4 py-8">
        <div className="max-w-md mx-auto w-full">
          {/* Logo Section */}
          <div className="text-center mb-12">
            <div className="w-24 h-24 mx-auto mb-6 bg-white rounded-2xl flex items-center justify-center shadow-lg p-4">
              <img 
                src="/src/assets/images/castle_logo.svg" 
                alt="IC Castle Logo" 
                className="w-full h-full object-contain"
              />
            </div>
            <h1 className="text-h1 font-bold text-text-main mb-2">IC Wallet</h1>
            <p className="text-body text-text-secondary">i-Castle 멤버를 위한 Web3 라이프스타일 지갑</p>
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-4">
            {/* Kakao Login */}
            <button
              onClick={() => handleSocialLogin('kakao')}
              disabled={isLoading !== null}
              className={cn(
                'w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-medium text-body transition-all duration-200',
                'bg-[#FEE500] text-[#3C1E1E] hover:bg-[#FDD835] focus:ring-2 focus:ring-[#FEE500] focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'min-h-touch shadow-sm'
              )}
            >
              {isLoading === 'kakao' ? (
                <div className="w-5 h-5 border-2 border-[#3C1E1E] border-t-transparent rounded-full animate-spin" />
              ) : (
                <KakaoIcon />
              )}
              <span>카카오로 시작하기</span>
            </button>

            {/* Google Login */}
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading !== null}
              className={cn(
                'w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-medium text-body transition-all duration-200',
                'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'min-h-touch shadow-sm'
              )}
            >
              {isLoading === 'google' ? (
                <div className="w-5 h-5 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon />
              )}
              <span>구글로 시작하기</span>
            </button>

            {/* Apple Login */}
            <button
              onClick={() => handleSocialLogin('apple')}
              disabled={isLoading !== null}
              className={cn(
                'w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-xl font-medium text-body transition-all duration-200',
                'bg-black text-white hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'min-h-touch shadow-sm'
              )}
            >
              {isLoading === 'apple' ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <AppleIcon />
              )}
              <span>Apple로 시작하기</span>
            </button>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-8 text-center">
            <p className="text-body-sm text-text-secondary leading-relaxed">
              계속 진행하면{' '}
              <button className="text-primary hover:underline">
                이용약관
              </button>
              {' '}및{' '}
              <button className="text-primary hover:underline">
                개인정보처리방침
              </button>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-6 text-center">
        <p className="text-body-sm text-text-secondary">
          © 2024 i-Castle. All rights reserved.
        </p>
      </div>
    </div>
  );
};