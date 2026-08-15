import axios from 'axios';
import { useAuthStore } from '../../store/authStore';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Request Interceptor: Attach JWT Bearer Token
apiClient.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle Auth Session Expiration (401) and other API errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    // Prevent infinite loops if refresh token fails
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        // If JWT refresh token support exists in mobile:
        // const res = await axios.post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true });
        // const { accessToken } = res.data.data;
        // useAuthStore.getState().login(accessToken, useAuthStore.getState().user);
        // originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        // return apiClient(originalRequest);
        
        // Since local dev leverages mock sessions or cookie refresh (which is cookie-based),
        // we fallback to logging out on 401 for native apps if refresh fails or is unsupported.
        console.warn('Session expired (401), logging out.');
        useAuthStore.getState().logout();
      } catch (refreshError) {
        useAuthStore.getState().logout();
        return Promise.reject(refreshError);
      }
    }
    
    // Structure error message
    const apiError = {
      status: error.response?.status || 500,
      message: error.response?.data?.message || 'A network error occurred. Please try again.',
      errors: error.response?.data?.errors || null,
      originalError: error
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;
