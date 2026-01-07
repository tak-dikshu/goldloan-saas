import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Shop } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateShop: (shop: Shop) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user: User) =>
        set({
          user,
          token: user.token,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
        }),
      updateShop: (shop: Shop) =>
        set((state) => ({
          user: state.user ? { ...state.user, shop } : null,
        })),
    }),
    {
      name: 'auth-storage',
    }
  )
);
