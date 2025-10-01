/**
 * Turnstile verification utility functions
 */

export interface TurnstileVerificationResult {
  success: boolean;
  message?: string;
  error?: string;
  details?: string[];
}

/**
 * Verify Turnstile token with backend API
 * @param token - The Turnstile token to verify
 * @returns Promise<TurnstileVerificationResult>
 */
export const verifyTurnstileToken = async (token: string): Promise<TurnstileVerificationResult> => {
  try {
    // Use environment variable for API URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3004/api';
    const url = `${apiUrl}/auth/verify-turnstile`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token }),
    });

    // Check if response is valid before parsing JSON
    if (!response.ok) {
      // Try to parse error response if possible
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorDetails: string[] = [];
      
      try {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorResult = await response.json();
          errorMessage = errorResult.error || errorMessage;
          errorDetails = errorResult.details || [];
        }
      } catch (parseError) {
        console.warn('Failed to parse error response:', parseError);
      }
      
      return {
        success: false,
        error: errorMessage,
        details: errorDetails
      };
    }

    // Validate response content type
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {
        success: false,
        error: 'Server returned non-JSON response'
      };
    }

    // Check if response body is empty
    const responseText = await response.text();
    if (!responseText || responseText.trim() === '') {
      return {
        success: false,
        error: 'Server returned empty response'
      };
    }

    // Parse JSON safely
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      return {
        success: false,
        error: 'Invalid JSON response from server'
      };
    }

    return {
      success: true,
      message: result.message || 'Verification successful'
    };
  } catch (error) {
    console.error('Turnstile verification error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Network error during verification';
    if (error instanceof TypeError && error.message.includes('fetch')) {
      errorMessage = 'Failed to connect to verification server';
    } else if (error instanceof Error) {
      errorMessage = `Verification error: ${error.message}`;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Check if Turnstile is available in the current environment
 * @returns boolean
 */
export const isTurnstileAvailable = (): boolean => {
  return typeof window !== 'undefined' && !!import.meta.env.VITE_TURNSTILE_SITE_KEY;
};

/**
 * Get Turnstile site key from environment
 * @returns string | undefined
 */
export const getTurnstileSiteKey = (): string | undefined => {
  return import.meta.env.VITE_TURNSTILE_SITE_KEY;
};