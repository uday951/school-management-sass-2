import axios from 'axios';
import { secureTokenStorage } from '../storage/secure-store';
import { Platform, NativeModules } from 'react-native';

// Dynamically extract host IP from Metro bundler's scriptURL (Expo Go support)
const getDevHostIp = (): string => {
  const scriptURL = NativeModules.SourceCode?.scriptURL || '';
  const match = scriptURL.match(/^(?:https?|exps?):\/\/([^:/]+)(:\d+)?/);
  if (match && match[1]) {
    return match[1];
  }
  return '10.227.148.49'; // Fallback developer machine IP
};

const HOST_IP = getDevHostIp();
console.log('Expo Go Metro Host IP resolved:', HOST_IP);

const DEV_URLS = Platform.OS === 'android'
  ? [
      `http://${HOST_IP}:3001/api`,      // Metro host computer IP (Expo Go Wi-Fi)
      'http://10.0.2.2:3001/api',       // Android Emulator loopback
      'http://localhost:3001/api',      // Physical USB adb reverse loopback
    ]
  : [
      `http://${HOST_IP}:3001/api`,      // Metro host IP Wi-Fi
      'http://localhost:3001/api',      // iOS Simulator loopback
    ];

let activeUrlIndex = 0;

export const apiClient = axios.create({
  baseURL: DEV_URLS[activeUrlIndex],
  timeout: 8000, // Snappy timeout for responsive cycling
});

let isRefreshing = false;
let refreshSubscribers: ((token: string) => void)[] = [];

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb);
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token));
  refreshSubscribers = [];
}

apiClient.interceptors.request.use(
  async (config) => {
    // Keep configuration synchronized with currently verified active URL
    config.baseURL = DEV_URLS[activeUrlIndex];
    const token = await secureTokenStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    const originalRequest = config;

    // 1. AUTO-FALLBACK: Handle network connectivity timeouts and failures (no response received)
    if (!response) {
      // Move to the next development URL candidate
      const failedUrl = originalRequest.baseURL || DEV_URLS[activeUrlIndex];
      activeUrlIndex = (activeUrlIndex + 1) % DEV_URLS.length;
      const fallbackUrl = DEV_URLS[activeUrlIndex];
      
      console.log(`Connection failed on ${failedUrl}. Retrying on fallback: ${fallbackUrl}`);
      
      apiClient.defaults.baseURL = fallbackUrl;
      originalRequest.baseURL = fallbackUrl;
      return apiClient(originalRequest);
    }

    // 2. Token expiration refresh rotation
    if (response && response.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            resolve(apiClient(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await secureTokenStorage.getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        const res = await axios.post(`${DEV_URLS[activeUrlIndex]}/auth/refresh`, { refreshToken });
        const { accessToken, refreshToken: newRefreshToken } = res.data.data;

        await secureTokenStorage.saveAccessToken(accessToken);
        if (newRefreshToken) {
          await secureTokenStorage.saveRefreshToken(newRefreshToken);
        }

        isRefreshing = false;
        onRefreshed(accessToken);

        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        await secureTokenStorage.clearTokens();
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
export default apiClient;
