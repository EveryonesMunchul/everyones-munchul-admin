import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AuthState {
  token: string | null;
  adminId: number | null;
  nickname: string | null;
  isLoggedIn: boolean;
  login: (token: string, adminId: number, nickname: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      adminId: null,
      nickname: null,
      isLoggedIn: false,

      login: (token, adminId, nickname) => {
        localStorage.setItem('adminToken', token);
        set({ token, adminId, nickname, isLoggedIn: true });
      },

      logout: () => {
        localStorage.removeItem('adminToken');
        set({ token: null, adminId: null, nickname: null, isLoggedIn: false });
      },
    }),
    { name: 'admin-auth' }
  )
);
