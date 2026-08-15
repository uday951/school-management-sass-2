import { create } from 'zustand';

export const useChildStore = create((set) => ({
  activeChild: null,
  children: [],
  loading: false,

  setChildren: (children) => set({ children }),
  
  setActiveChild: (child) => set({ activeChild: child }),
  
  setLoading: (loading) => set({ loading }),

  reset: () => set({ activeChild: null, children: [], loading: false })
}));

export default useChildStore;
