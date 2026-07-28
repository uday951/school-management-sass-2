import { create } from 'zustand'

export const useChildStore = create((set) => ({
  children: [],
  activeChild: null,
  loading: false,
  
  setChildren: (children) => {
    set({ children })
    
    // Set default active child from localStorage or fallback to first child
    if (children.length > 0) {
      const savedId = localStorage.getItem('parent_active_child_id')
      const matched = children.find(c => c.id === savedId || c._id === savedId)
      set({ activeChild: matched || children[0] })
    } else {
      set({ activeChild: null })
    }
  },
  
  setActiveChild: (child) => {
    set({ activeChild: child })
    if (child) {
      localStorage.setItem('parent_active_child_id', child.id || child._id)
    } else {
      localStorage.removeItem('parent_active_child_id')
    }
  },
  
  setLoading: (loading) => set({ loading })
}))
