import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { TurnstileWidget } from '../components/TurnstileWidget'
import { verifyTurnstileToken } from '../utils/turnstile'
import castleLogo from '../assets/images/castle_logo.svg'
import { ArrowLeft, Mail, CheckCircle } from 'lucide-react'

export const ForgotPassword: React.FC = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [turnstileToken, setTurnstileToken] = useState<string>('')
  const [showTurnstileError, setShowTurnstileError] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [emailError, setEmailError] = useState('')

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

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Reset errors
    setEmailError('')
    setShowTurnstileError(false)

    // Validate email
    if (!email.trim()) {
      setEmailError('이메일을 입력해주세요.')
      return
    }

    if (!validateEmail(email)) {
      setEmailError('올바른 이메일 형식을 입력해주세요.')
      return
    }

    // Check Turnstile verification
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

      // TODO: Implement actual password reset API call
      // const response = await resetPassword(email)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsEmailSent(true)
    } catch (error) {
      console.error('Password reset failed:', error)
      setEmailError('비밀번호 재설정 요청에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={() => navigate('/login')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>로그인으로 돌아가기</span>
          </button>
        </div>

        {/* Success Content */}
        <div className="flex-1 flex items-center justify-center px-6">
          <div className="max-w-sm mx-auto text-center">
            <div className="mb-6">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-gray-900 mb-2">이메일을 확인해주세요</h1>
              <p className="text-gray-600">
                <span className="font-medium">{email}</span>로<br />
                비밀번호 재설정 링크를 보내드렸습니다.
              </p>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-sm text-blue-700">
                이메일이 도착하지 않았다면 스팸 폴더를 확인해주세요.
              </p>
            </div>

            <button
              onClick={() => {
                setIsEmailSent(false)
                setEmail('')
                setTurnstileToken('')
              }}
              className="w-full bg-primary hover:bg-primary/90 text-white py-3 px-4 rounded-lg font-medium transition-colors"
            >
              다시 시도하기
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <button
          onClick={() => navigate('/login')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>로그인</span>
        </button>
      </div>

      {/* Logo */}
      <div className="flex justify-center pt-8 pb-8">
        <img src={castleLogo} alt="IC Wallet" className="h-16 w-auto" />
      </div>

      {/* Main Content */}
      <div className="flex-1 px-6 pb-8">
        <div className="max-w-sm mx-auto">
          {/* Title */}
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">비밀번호 찾기</h1>
            <p className="text-gray-600">
              가입하신 이메일 주소를 입력하시면<br />
              비밀번호 재설정 링크를 보내드립니다.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                이메일 주소
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    setEmailError('')
                  }}
                  className={`w-full pl-10 pr-3 py-3 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                    emailError ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="example@email.com"
                  disabled={isLoading}
                />
              </div>
              {emailError && (
                <p className="mt-2 text-sm text-red-600">{emailError}</p>
              )}
            </div>

            {/* Security Verification */}
            <div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-sm text-blue-700 font-medium">보안 검증</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  안전한 비밀번호 재설정을 위해 보안 검증을 완료해주세요
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

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!email.trim() || !turnstileToken || isLoading}
              className="w-full bg-primary hover:bg-primary/90 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>전송 중...</span>
                </>
              ) : (
                <span>재설정 링크 보내기</span>
              )}
            </button>
          </form>

          {/* Back to Login */}
          <div className="mt-8 text-center">
            <p className="text-gray-600">
              계정이 기억나셨나요?{' '}
              <Link to="/login" className="text-primary font-medium hover:underline">
                로그인하기
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ForgotPassword