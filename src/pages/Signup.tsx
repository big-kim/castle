import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useUserStore } from '../stores/userStore'
import { TurnstileWidget } from '../components/TurnstileWidget'
import { verifyTurnstileToken } from '../utils/turnstile'
import castleLogo from '../assets/images/castle_logo.svg'

// Social platform icons as SVG components
const KakaoIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 2C5.58 2 2 4.69 2 8c0 2.16 1.4 4.08 3.5 5.19L4.5 16.5c-.1.3.2.6.5.4l3.5-2.3c.5.1 1 .1 1.5.1 4.42 0 8-2.69 8-6S14.42 2 10 2z" fill="currentColor"/>
  </svg>
)

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M19.99 10.187c0-.82-.069-1.417-.216-2.037H10.2v3.698h5.62c-.113.76-.568 1.96-1.634 2.75l-.014.093 2.373 1.84.164.015c1.51-1.394 2.38-3.44 2.38-5.859" fill="#4285F4"/>
    <path d="M10.2 19.931c2.16 0 3.97-.72 5.296-1.94L13.122 16.15c-.706.48-1.61.77-2.922.77-2.237 0-4.134-1.48-4.817-3.515l-.09.007-2.47 1.91-.032.085c1.32 2.6 4.02 4.524 7.41 4.524" fill="#34A853"/>
    <path d="M5.38 11.893c-.197-.58-.308-1.204-.308-1.837s.111-1.257.296-1.837L5.357 8.13 2.9 6.232l-.085.041A9.928 9.928 0 0 0 1.93 10c0 1.34.29 2.617.885 3.727l2.565-1.834" fill="#FBBC05"/>
    <path d="M10.2 4.544c1.587 0 2.66.69 3.275 1.266l2.4-2.347C14.16.99 12.36.069 10.2.069 6.81.069 4.11 1.99 2.79 4.595l2.48 1.919C6.06 4.82 7.94 4.544 10.2 4.544" fill="#EA4335"/>
  </svg>
)

const AppleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M12.87 0C12.74 1.27 12.26 2.48 11.46 3.4C10.72 4.26 9.68 4.9 8.54 4.84C8.65 3.57 9.2 2.33 9.96 1.5C10.76 0.62 11.94 0.05 12.87 0ZM12.83 5.05C14.46 5.05 15.8 6.05 16.5 6.05C17.2 6.05 18.8 5.1 20.7 5.15C21.64 5.2 23.18 5.6 24.05 6.85C22.2 7.85 21.05 9.6 21.05 11.7C21.05 14.15 22.65 15.85 24 16.6C23.6 17.7 23.05 18.75 22.35 19.8C21.75 20.7 21.1 21.6 20.15 21.6C19.25 21.6 18.95 21.05 17.85 21.05C16.8 21.05 16.4 21.65 15.55 21.6C14.65 21.55 13.9 20.55 13.3 19.65C12.05 17.75 11.1 14.65 11.1 11.9C11.1 8.4 13.25 6.65 15.35 6.65C16.3 6.65 17.1 7.25 17.7 7.25C18.35 7.25 19.25 6.6 20.4 6.6C20.85 6.6 21.55 6.7 22.1 7.05C20.9 4.8 18.45 3.4 15.8 3.4C14.2 3.4 12.83 4.15 12.83 5.05Z" fill="currentColor"/>
  </svg>
)

export const Signup: React.FC = () => {
  const navigate = useNavigate()
  const { socialLogin } = useUserStore()
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const [showTurnstileError, setShowTurnstileError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleTurnstileVerify = (token: string) => {
    setTurnstileToken(token)
    setShowTurnstileError(false)
  }

  const handleTurnstileError = () => {
    setTurnstileToken('')
    setShowTurnstileError(true)
  }

  const handleTurnstileExpire = () => {
    setTurnstileToken('')
    setShowTurnstileError(true)
  }

  const handleSocialSignup = async (provider: 'kakao' | 'google' | 'apple') => {
    if (!turnstileToken) {
      setShowTurnstileError(true)
      return
    }

    setIsLoading(true)
    try {
      // Verify turnstile token with backend before proceeding
      const verificationResult = await verifyTurnstileToken(turnstileToken)
      
      if (!verificationResult.success) {
        console.error('Turnstile verification failed:', verificationResult.error)
        setShowTurnstileError(true)
        setTurnstileToken('')
        return
      }
      
      // Use the socialLogin function from userStore for signup
      await socialLogin(provider)
      navigate('/home')
    } catch (error) {
      console.error('Signup failed:', error)
      setShowTurnstileError(true)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header with Logo */}
      <div className="flex justify-center pt-16 pb-8">
        <img src={castleLogo} alt="IC Wallet" className="h-16 w-auto" />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">회원가입</h1>
            <p className="text-gray-600">소셜 계정으로 간편하게 가입하세요</p>
          </div>

          {/* Security Verification */}
          <div className="mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-blue-700 font-medium">보안 검증</span>
              </div>
              <p className="text-xs text-blue-600 mt-1">
                안전한 회원가입을 위해 보안 검증을 완료해주세요
              </p>
            </div>
            
            <TurnstileWidget
              siteKey={import.meta.env.VITE_TURNSTILE_SITE_KEY}
              onVerify={handleTurnstileVerify}
              onError={handleTurnstileError}
              onExpire={handleTurnstileExpire}
              theme="light"
              size="normal"
            />
            
            {showTurnstileError && (
              <div className="mt-2 text-sm text-red-600">
                보안 검증에 실패했습니다. 다시 시도해주세요.
              </div>
            )}
          </div>

          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialSignup('kakao')}
              disabled={!turnstileToken || isLoading}
              className="w-full flex items-center justify-center space-x-3 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              <KakaoIcon />
              <span>카카오로 가입하기</span>
            </button>

            <button
              onClick={() => handleSocialSignup('google')}
              disabled={!turnstileToken || isLoading}
              className="w-full flex items-center justify-center space-x-3 bg-white hover:bg-gray-50 disabled:bg-gray-200 disabled:cursor-not-allowed border border-gray-300 text-gray-700 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              <GoogleIcon />
              <span>Google로 가입하기</span>
            </button>

            <button
              onClick={() => handleSocialSignup('apple')}
              disabled={!turnstileToken || isLoading}
              className="w-full flex items-center justify-center space-x-3 bg-black hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              <AppleIcon />
              <span>Apple로 가입하기</span>
            </button>
          </div>

          {/* Terms and Privacy */}
          <div className="mt-6 text-center">
            <p className="text-xs text-gray-500">
              가입 시{' '}
              <Link to="/terms" className="text-primary underline">
                이용약관
              </Link>
              {' '}및{' '}
              <Link to="/privacy" className="text-primary underline">
                개인정보처리방침
              </Link>
              에 동의하는 것으로 간주됩니다.
            </p>
          </div>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              이미 계정이 있으신가요?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                로그인
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup