import { create } from 'zustand';
import { AuthStore } from './types';
import { axiosInstance } from '../../lib/axios';

export const useAuthStore = create<AuthStore>((set) => ({
  authUser: null,
  isLoggingOut: false,
  
  fetchUser: async () => {
   
  },
  
  logout: async () => {
    set({ isLoggingOut: true})
    try{
      await axiosInstance.post("/api/auth/logout")
      set({ authUser: null });
    } catch (e) {
      console.error("Error while logging out: ", e)
    }
    finally {
      set({ isLoggingOut: false})
    }
    
  }
}));
