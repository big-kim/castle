import React, { useEffect, useRef, useState } from 'react';

interface TurnstileWidgetProps {
  onVerify: (token: string) => void;
  onError?: (error: string) => void;
  onExpire?: () => void;
  className?: string;
  theme?: 'light' | 'dark' | 'auto';
  size?: 'normal' | 'compact';
}

interface TurnstileWidgetRef {
  reset: () => void;
  getResponse: () => string;
}

// Extend the global Window interface to include turnstile
declare global {
  interface Window {
    turnstile?: {
      render: (element: string | HTMLElement, options: any) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
      getResponse: (widgetId?: string) => string;
    };
  }
}

export const TurnstileWidget = React.forwardRef<TurnstileWidgetRef, TurnstileWidgetProps>(({
  onVerify,
  onError,
  onExpire,
  className = '',
  theme = 'light',
  size = 'normal'
}, ref) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isRendered, setIsRendered] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const containerId = useRef(`turnstile-${Math.random().toString(36).substr(2, 9)}`);
  const maxRetries = 3;

  const siteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY;

  const handleError = (errorMessage: string) => {
    console.error('Turnstile error:', errorMessage);
    setError(errorMessage);
    
    // 오류 코드별 메시지 처리
    let userFriendlyMessage = errorMessage;
    if (errorMessage === '400020') {
      userFriendlyMessage = '보안 검증 설정에 문제가 있습니다. 잠시 후 다시 시도해주세요.';
    } else if (errorMessage === '400010') {
      userFriendlyMessage = '보안 검증 서비스에 연결할 수 없습니다.';
    } else if (errorMessage === '400030') {
      userFriendlyMessage = '보안 검증이 만료되었습니다. 다시 시도해주세요.';
    }
    
    onError?.(userFriendlyMessage);
  };

  const retryWidget = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setError(null);
      setIsRendered(false);
      
      // 기존 위젯 제거
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
          widgetIdRef.current = null;
        } catch (e) {
          console.warn('Failed to remove existing widget:', e);
        }
      }
    } else {
      handleError('최대 재시도 횟수를 초과했습니다. 페이지를 새로고침해주세요.');
    }
  };

  useEffect(() => {
    // Check if Turnstile script is already loaded
    if (window.turnstile) {
      setIsLoaded(true);
      return;
    }

    // Check if script is already in DOM to prevent duplicate loading
    const existingScript = document.querySelector('script[src="https://challenges.cloudflare.com/turnstile/v0/api.js"]');
    if (existingScript) {
      // Wait for existing script to load
      const checkTurnstile = setInterval(() => {
        if (window.turnstile) {
          setIsLoaded(true);
          clearInterval(checkTurnstile);
        }
      }, 100);
      
      // Timeout after 10 seconds
      setTimeout(() => {
        clearInterval(checkTurnstile);
        if (!window.turnstile) {
          handleError('보안 검증 스크립트 로딩 시간이 초과되었습니다.');
        }
      }, 10000);
      
      return;
    }

    // Load Turnstile script
    const script = document.createElement('script');
    script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js';
    script.async = true;
    script.defer = true;
    
    script.onload = () => {
      setIsLoaded(true);
    };
    
    script.onerror = () => {
      handleError('보안 검증 스크립트를 로드할 수 없습니다. 네트워크 연결을 확인해주세요.');
    };

    document.head.appendChild(script);

    return () => {
      // Note: Don't remove script on unmount as it might be used by other components
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || !window.turnstile || isRendered) {
      return;
    }

    if (!siteKey) {
      handleError('보안 검증 사이트 키가 설정되지 않았습니다.');
      return;
    }

    // Wait for the container to be available
    const container = containerRef.current;
    if (!container) {
      return;
    }

    try {
      // Render the Turnstile widget using CSS selector
      const widgetId = window.turnstile.render(`#${containerId.current}`, {
        sitekey: siteKey,
        theme,
        size,
        callback: (token: string) => {
          onVerify(token);
        },
        'error-callback': (error: string) => {
          handleError(error);
        },
        'expired-callback': () => {
          onExpire?.();
        }
      });

      widgetIdRef.current = widgetId;
      setIsRendered(true);
    } catch (error) {
      console.error('Error rendering Turnstile widget:', error);
      handleError('보안 검증 위젯을 렌더링하는 중 오류가 발생했습니다.');
    }
  }, [isLoaded, siteKey, theme, size, onVerify, onError, onExpire, isRendered]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (window.turnstile && widgetIdRef.current) {
        try {
          window.turnstile.remove(widgetIdRef.current);
        } catch (error) {
          console.error('Error removing Turnstile widget:', error);
        }
      }
    };
  }, []);

  const reset = () => {
    if (window.turnstile && widgetIdRef.current) {
      window.turnstile.reset(widgetIdRef.current);
    }
  };

  const getResponse = () => {
    if (window.turnstile && widgetIdRef.current) {
      return window.turnstile.getResponse(widgetIdRef.current);
    }
    return '';
  };

  // Expose reset and getResponse methods via ref
  React.useImperativeHandle(ref, () => ({
    reset,
    getResponse
  }));

  if (!siteKey) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        보안 검증 설정 오류: 사이트 키를 찾을 수 없습니다
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={containerRef} id={containerId.current} />
      {!isLoaded && !error && (
        <div className="flex items-center justify-center py-4">
          <div className="w-5 h-5 border-2 border-gray-300 border-t-primary rounded-full animate-spin" />
          <span className="ml-2 text-sm text-gray-500">보안 검증 로딩 중...</span>
        </div>
      )}
      {error && (
        <div className="flex flex-col items-center justify-center py-4 space-y-2">
          <div className="text-red-500 text-sm text-center">{error}</div>
          {retryCount < maxRetries && (
            <button
              onClick={retryWidget}
              className="px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              다시 시도 ({retryCount + 1}/{maxRetries})
            </button>
          )}
        </div>
      )}
    </div>
  );
});

export default TurnstileWidget;