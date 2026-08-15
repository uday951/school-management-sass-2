import { create } from 'zustand';
import secureStorage, { KEYS } from '../services/storage/secureStorage';

export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  role: null,
  isAuthenticated: false,
  isLoading: true,

  initialize: async () => {
    try {
      const token = await secureStorage.getItem(KEYS.ACCESS_TOKEN);
      const user = await secureStorage.getItem(KEYS.USER_INFO);
      const role = await secureStorage.getItem(KEYS.USER_ROLE);

      if (token && user && role) {
        set({
          accessToken: token,
          user,
          role,
          isAuthenticated: true,
          isLoading: false
        });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Failed to initialize auth store:', error);
      set({ isLoading: false });
    }
  },

  login: async (token, user) => {
    try {
      const role = user.role;
      await secureStorage.setItem(KEYS.ACCESS_TOKEN, token);
      await secureStorage.setItem(KEYS.USER_INFO, user);
      await secureStorage.setItem(KEYS.USER_ROLE, role);

      set({
        accessToken: token,
        user,
        role,
        isAuthenticated: true
      });
    } catch (error) {
      console.error('Failed to login:', error);
      throw error;
    }
  },

  logout: async () => {
    try {
      await secureStorage.clearAll();
      set({
        accessToken: null,
        user: null,
        role: null,
        isAuthenticated: false
      });
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  },

  updateUser: (updatedUser) => {
    set((state) => {
      const newUser = { ...state.user, ...updatedUser };
      secureStorage.setItem(KEYS.USER_INFO, newUser);
      return { user: newUser };
    });
  }
}));

export default useAuthStore;
