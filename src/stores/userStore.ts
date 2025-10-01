import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserStore, UserSettings } from '../types';

// ============================================================================
// CONSTANTS
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004/api';
const TOKEN_KEY = 'ic-wallet-token';

// ============================================================================
// API UTILITY FUNCTIONS
// ============================================================================

const createApiCall = (baseUrl: string) => {
  return async (endpoint: string, options: RequestInit = {}) => {
    const token = localStorage.getItem(TOKEN_KEY);
    
    const response = await fetch(`${baseUrl}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers,
      },
      credentials: 'include',
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Network error' }));
      throw new Error(error.message || 'API request failed');
    }

    return response.json();
  };
};

const apiCall = createApiCall(API_BASE_URL);

// ============================================================================
// REAL API FUNCTIONS
// ============================================================================

const realLogin = async (email: string, password: string, turnstileToken: string) => {
  const response = await apiCall('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password, turnstileToken }),
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Login failed');
  }
  
  return {
    user: response.data.user,
    token: response.data.token
  };
};

const realRegister = async (email: string, password: string, name: string, turnstileToken: string) => {
  const response = await apiCall('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ email, password, name, turnstileToken }),
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Registration failed');
  }
  
  return {
    user: response.data.user,
    token: response.data.token
  };
};

const realLogout = async () => {
  const response = await apiCall('/auth/logout', {
    method: 'POST',
  });
  
  if (!response.success) {
    throw new Error(response.message || 'Logout failed');
  }
  
  return response;
};

const realFetchUser = async () => {
  const response = await apiCall('/auth/me');
  
  if (!response.success) {
    throw new Error(response.message || 'Failed to fetch user');
  }
  
  return response.data.user;
};

const realUpdateProfile = async (updates: Partial<User>) => {
  // For now, return the user with updates since there's no update profile endpoint yet
  // This can be implemented when the backend endpoint is available
  const user = await realFetchUser();
  return { ...user, ...updates, updatedAt: new Date().toISOString() };
};

const realSocialLogin = async (provider: 'kakao' | 'google' | 'apple') => {
  // Social login is handled via OAuth redirects, not direct API calls
  // This function is mainly for consistency, actual social login happens via OAuth flow
  throw new Error(`Social login for ${provider} should be handled via OAuth redirect`);
};

// ============================================================================
// TOKEN MANAGEMENT
// ============================================================================

const tokenManager = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token: string) => localStorage.setItem(TOKEN_KEY, token),
  remove: () => localStorage.removeItem(TOKEN_KEY),
};

// ============================================================================
// USER STORE
// ============================================================================

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      // State
      user: null,
      isAuthenticated: false,
      isLoading: false,
      token: null,

      // Token management
      setUser: (user: User | null) => {
        set({ user, isAuthenticated: !!user });
      },

      setToken: (token: string | null) => {
        set({ token });
        if (token) {
          tokenManager.set(token);
        } else {
          tokenManager.remove();
        }
      },

      // Authentication actions
      login: async (email: string, password: string, turnstileToken: string) => {
        set({ isLoading: true });
        try {
          const { user, token } = await realLogin(email, password, turnstileToken);
          get().setToken(token);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (email: string, password: string, name: string, turnstileToken: string) => {
        set({ isLoading: true });
        try {
          const { user, token } = await realRegister(email, password, name, turnstileToken);
          get().setToken(token);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      socialLogin: async (provider: 'kakao' | 'google' | 'apple') => {
        set({ isLoading: true });
        try {
          // Use test social login for development
          const response = await apiCall('/auth/test-social-login', {
            method: 'POST',
            body: JSON.stringify({ provider }),
          });
          
          if (!response.success) {
            throw new Error(response.message || 'Social login failed');
          }
          
          const { user, token } = response.data;
          get().setToken(token);
          set({ user, isAuthenticated: true, isLoading: false });
          
          // Show success message
          console.log(`${provider} 로그인 성공:`, user.name);
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await realLogout();
        } catch (error) {
          console.error('Logout error:', error);
        } finally {
          get().setToken(null);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },

      // User data management
      refreshUser: async () => {
        const token = tokenManager.get();
        if (!token) return;

        try {
          const user = await realFetchUser();
          set({ user, isAuthenticated: true });
        } catch (error) {
          console.error('Failed to refresh user:', error);
          get().setToken(null);
          set({ user: null, isAuthenticated: false });
        }
      },

      updateProfile: async (data: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) throw new Error('No user logged in');

        set({ isLoading: true });
        try {
          const updatedUser = await realUpdateProfile(data);
          set({ 
            user: updatedUser, 
            isLoading: false 
          });
        } catch (error) {
          console.error('Profile update failed:', error);
          set({ isLoading: false });
          throw error;
        }
      },

      updateSettings: async (settings: Partial<UserSettings>) => {
        const currentUser = get().user;
        if (!currentUser) throw new Error('No user logged in');

        const updatedSettings = { ...currentUser.settings, ...settings };
        await get().updateProfile({ settings: updatedSettings });
      },

      // Initialize authentication state
      initialize: async () => {
        const token = tokenManager.get();
        if (!token) {
          set({ isAuthenticated: false, user: null });
          return;
        }

        try {
          const user = await realFetchUser();
          set({ 
            user, 
            isAuthenticated: true, 
            token,
            isLoading: false 
          });
        } catch (error) {
          console.error('Failed to initialize user:', error);
          // Token is invalid, clear it
          get().setToken(null);
          set({ 
            user: null, 
            isAuthenticated: false, 
            isLoading: false 
          });
        }
      },
    }),
    {
      name: 'ic-wallet-user',
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        token: state.token
      }),
    }
  )
);