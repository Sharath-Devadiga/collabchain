// store/auth.ts
import { create } from 'zustand';
import axios from 'axios';
import { AuthStore } from './types';



export const useAuth = create<AuthStore>((set) => ({
  user: null,
  fetchUser: async () => {
    try {
      const res = await axios.get('/api/auth/me', { withCredentials: true });
      set({ user: res.data });
    } catch (error) {
      set({ user: null });
      console.error("Error while getting user information", error)
    }
  },
  logout: () => {
    set({ user: null });
  }
}));
