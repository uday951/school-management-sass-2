import * as SecureStore from 'expo-secure-store';

export const secureTokenStorage = {
  saveAccessToken: async (token: string) => {
    await SecureStore.setItemAsync('accessToken', token);
  },
  getAccessToken: async () => {
    return await SecureStore.getItemAsync('accessToken');
  },
  saveRefreshToken: async (token: string) => {
    await SecureStore.setItemAsync('refreshToken', token);
  },
  getRefreshToken: async () => {
    return await SecureStore.getItemAsync('refreshToken');
  },
  clearTokens: async () => {
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
  }
};
