import axios from 'axios';
import { Platform, NativeModules } from 'react-native';
import { useAuthStore } from '../../store/authStore';

const getMetroHostIp = () => {
  try {
    const scriptURL = NativeModules.SourceCode?.scriptURL;
    if (scriptURL) {
      const address = scriptURL.split('://')[1]?.split('/')[0];
      const host = address?.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return host;
      }
    }
  } catch (_e) {
    // Ignore error
  }
  return null;
};

const hostIp = getMetroHostIp();
let defaultBase = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://192.168.31.201:5000/api/v1';

if (hostIp) {
  defaultBase = `http://${hostIp}:5000/api/v1`;
} else if (defaultBase.includes('localhost') || defaultBase.includes('127.0.0.1') || defaultBase.includes('10.171.37.49')) {
  defaultBase = 'http://192.168.31.201:5000/api/v1';
}

const apiClient = axios.create({
  baseURL: defaultBase,
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
    
    // Structure error message cleanly
    const isNetworkError = !error.response || error.code === 'ERR_NETWORK' || error.message === 'Network Error';
    const apiError = {
      status: error.response?.status || (isNetworkError ? 503 : 500),
      message: error.response?.data?.error?.message || error.response?.data?.message || (isNetworkError ? 'Backend server unreachable. Using local offline mode.' : 'A network error occurred. Please try again.'),
      errors: error.response?.data?.error?.details || error.response?.data?.errors || null,
      isNetworkError,
      originalError: error
    };

    return Promise.reject(apiError);
  }
);

export default apiClient;
