import apiClient from '../api/client';
import { API_ENDPOINTS } from '../../constants/api';
import { useAuthStore } from '../../store/authStore';

export const authService = {
  /**
   * Performs standard credential authentication.
   */
  async login(email, password) {
    try {
      const response = await apiClient.post(API_ENDPOINTS.LOGIN, { email, password });
      const { accessToken, user } = response.data.data;
      await useAuthStore.getState().login(accessToken, user);
      return { success: true, user };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  /**
   * Bypasses credential authentication in dev mode using mock tokens.
   * Leverages backend mock token support.
   */
  async loginMock(role) {
    try {
      const token = `mock_token_${role}`;
      let user = { role, name: `Mock ${role}` };
      
      // Map mock users to valid database ObjectIDs from backend/src/middlewares/auth.middleware.js
      if (role === 'parent') {
        user = {
          id: '6a63785e11b63a63ef656825',
          _id: '6a63785e11b63a63ef656825',
          email: '123@gmail.com',
          role: 'parent',
          name: 'Robert Daniel',
          tenantId: 'default_school'
        };
      } else if (role === 'teacher') {
        user = {
          id: '6a6237bed724b22b37b5255a',
          _id: '6a6237bed724b22b37b5255a',
          email: 's.jenkins@school.edu',
          role: 'teacher',
          name: 'Sarah Jenkins',
          tenantId: 'default_school'
        };
      } else if (role === 'school_admin') {
        user = {
          id: '6a6237bed724b22b37b5255a',
          _id: '6a6237bed724b22b37b5255a',
          role: 'school_admin',
          name: 'Principal Mock',
          tenantId: 'default_school'
        };
      }

      await useAuthStore.getState().login(token, user);
      return { success: true, user };
    } catch (error) {
      console.error('Mock login error:', error);
      throw error;
    }
  },

  /**
   * Logs out the user.
   */
  async logout() {
    try {
      // Best effort API call to logout on backend
      await apiClient.post(API_ENDPOINTS.LOGOUT).catch(() => {});
    } finally {
      await useAuthStore.getState().logout();
    }
  }
};

export default authService;
