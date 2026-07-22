import { create } from 'zustand'

export const useSidebarStore = create((set) => ({
  isCollapsed: false,
  isOpenMobile: false,
  
  toggleSidebar: () => set((state) => ({ isCollapsed: !state.isCollapsed })),
  setSidebarCollapsed: (isCollapsed) => set({ isCollapsed }),
  
  toggleMobileSidebar: () => set((state) => ({ isOpenMobile: !state.isOpenMobile })),
  setMobileSidebarOpen: (isOpenMobile) => set({ isOpenMobile })
}))
