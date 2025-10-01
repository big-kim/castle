import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserStore, UserSettings } from '../types';
import { createMockFetch, generateId } from '../utils/mockData';

// ============================================================================
// CONSTANTS
// ============================================================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3004/api';
const TOKEN_KEY = 'ic-wallet-token';

// ============================================================================
// MOCK DATA GENERATORS
// ============================================================================

const generateMockUser = (provider?: 'kakao' | 'google' | 'apple'): User => ({
  id: generateId(),
  email: provider ? `user@${provider}.com` : 'user@example.com',
  name: provider ? `${provider.charAt(0).toUpperCase() + provider.slice(1)} User` : 'Test User',
  avatar: null,
  settings: {
    language: 'ko',
    theme: 'light',
    notifications: {
      email: true,
      push: true,
      sms: false
    },
    privacy: {
      profileVisibility: 'public',
      showEmail: false,
      showPhone: false
    }
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
});

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
// MOCK API FUNCTIONS
// ============================================================================

const mockLogin = createMockFetch(
  (email: string, password: string, turnstileToken: string) => {
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    const user = generateMockUser();
    const token = `mock_token_${generateId()}`;
    
    return { user, token };
  },
  { delay: [800, 1500] }
);

const mockRegister = createMockFetch(
  (email: string, password: string, name: string, turnstileToken: string) => {
    if (!email || !password || !name) {
      throw new Error('All fields are required');
    }
    
    const user = { ...generateMockUser(), email, name };
    const token = `mock_token_${generateId()}`;
    
    return { user, token };
  },
  { delay: [1000, 2000] }
);

const mockLogout = createMockFetch(
  () => ({ success: true }),
  { delay: [300, 600] }
);

const mockFetchUser = createMockFetch(
  () => generateMockUser(),
  { delay: [400, 800] }
);

const mockUpdateProfile = createMockFetch(
  (updates: Partial<User>) => {
    const user = generateMockUser();
    return { ...user, ...updates, updatedAt: new Date().toISOString() };
  },
  { delay: [600, 1200] }
);

const mockSocialLogin = createMockFetch(
  (provider: 'kakao' | 'google' | 'apple') => {
    const user = generateMockUser(provider);
    const token = `mock_${provider}_token_${generateId()}`;
    
    return { user, token };
  },
  { delay: [1000, 1500] }
);

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
          const { user, token } = await mockLogin(email, password, turnstileToken);
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
          const { user, token } = await mockRegister(email, password, name, turnstileToken);
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
          const { user, token } = await mockSocialLogin(provider);
          get().setToken(token);
          set({ user, isAuthenticated: true, isLoading: false });
          
          // Redirect to home page
          window.location.href = '/';
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await mockLogout();
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
          const user = await mockFetchUser();
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
          const updatedUser = await mockUpdateProfile(data);
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