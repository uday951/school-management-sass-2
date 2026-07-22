import { create } from 'zustand'

export const useAuthStore = create((set) => ({
  accessToken: null,
  user: null,
  isAuthenticated: false,
  
  login: (accessToken, user) => set({
    accessToken,
    user,
    isAuthenticated: true
  }),
  
  logout: () => set({
    accessToken: null,
    user: null,
    isAuthenticated: false
  }),
  
  updateUser: (user) => set((state) => ({
    user: { ...state.user, ...user }
  }))
}))
