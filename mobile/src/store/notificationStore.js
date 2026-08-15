import { create } from 'zustand';

export const useNotificationStore = create((set) => ({
  unreadCount: 0,
  notifications: [],
  loading: false,

  setNotifications: (notifications) => {
    const unreadCount = notifications.filter((n) => !n.readStatus && !n.isRead).length;
    set({ notifications, unreadCount });
  },

  decrementUnread: () => set((state) => ({ unreadCount: Math.max(0, state.unreadCount - 1) })),

  setLoading: (loading) => set({ loading }),

  reset: () => set({ unreadCount: 0, notifications: [], loading: false })
}));

export default useNotificationStore;
