import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, UserStore, UserSettings } from '../types';

// Mock API functions - replace with actual API calls
const mockLogin = async (email: string, password: string): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (email === 'demo@example.com' && password === 'password') {
    return {
      id: '1',
      icastle_id: 'icastle_001',
      name: 'John Doe',
      email: 'john@example.com',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
      walletAddress: '0x1234567890abcdef',
      wallet_address: '0x1234567890abcdef',
      settings: {
        app_lock_enabled: false,
        notifications_enabled: true,
        notifications: true,
        biometric_enabled: false,
        language: 'ko',
        currency: 'USDT'
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
  }
  
  throw new Error('Invalid credentials');
};

const mockSocialLogin = async (provider: 'kakao' | 'google' | 'apple'): Promise<User> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  // Generate random wallet address
  const generateWalletAddress = () => {
    const chars = '0123456789abcdef';
    let address = '0x';
    for (let i = 0; i < 40; i++) {
      address += chars[Math.floor(Math.random() * chars.length)];
    }
    return address;
  };
  
  const providerData = {
    kakao: {
      name: '카카오 사용자',
      email: 'user@kakao.com',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face'
    },
    google: {
      name: 'Google User',
      email: 'user@gmail.com',
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop&crop=face'
    },
    apple: {
      name: 'Apple User',
      email: 'user@icloud.com',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  };
  
  const userData = providerData[provider];
  
  const userId = Math.random().toString(36).substr(2, 9);
  const walletAddress = generateWalletAddress();
  
  return {
    id: userId,
    icastle_id: `icastle_${userId}`,
    name: userData.name,
    email: userData.email,
    avatar: userData.avatar,
    walletAddress: walletAddress,
    wallet_address: walletAddress,
    socialProvider: provider,
    settings: {
      app_lock_enabled: false,
      notifications_enabled: true,
      notifications: true,
      biometric_enabled: false,
      language: 'ko',
      currency: 'USDT'
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
};

const mockUpdateProfile = async (data: Partial<User>): Promise<User> => {
  // Simulate API call
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Return updated user data
  return {
    id: '1',
    icastle_id: 'user123',
    email: data.email || 'user@example.com',
    name: data.name || '김태열',
    profile_image: data.profile_image || 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20korean%20businessman%20avatar%20portrait&image_size=square',
    wallet_address: data.wallet_address || '0x1234567890123456789012345678901234567890',
    settings: data.settings || {
      app_lock_enabled: false,
      notifications_enabled: true,
      notifications: true,
      biometric_enabled: false,
      language: 'ko',
      currency: 'USDT',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const useUserStore = create<UserStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (email: string, password: string) => {
        set({ isLoading: true });
        try {
          const user = await mockLogin(email, password);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },
      
      socialLogin: async (provider: 'kakao' | 'google' | 'apple') => {
        set({ isLoading: true });
        try {
          const user = await mockSocialLogin(provider);
          set({ user, isAuthenticated: true, isLoading: false });
        } catch (error) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      },

      updateProfile: async (data: Partial<User>) => {
        const currentUser = get().user;
        if (!currentUser) throw new Error('No user logged in');

        set({ isLoading: true });
        try {
          const updatedUser = await mockUpdateProfile({ ...currentUser, ...data });
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
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
);