import * as SecureStore from 'expo-secure-store';

export const KEYS = {
  ACCESS_TOKEN: 'access_token',
  USER_INFO: 'user_info',
  USER_ROLE: 'user_role'
};

const secureStorage = {
  async setItem(key, value) {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      await SecureStore.setItemAsync(key, stringValue);
      return true;
    } catch (error) {
      console.error('Error saving to secure store:', error);
      return false;
    }
  },

  async getItem(key) {
    try {
      const value = await SecureStore.getItemAsync(key);
      if (!value) return null;
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      console.error('Error reading from secure store:', error);
      return null;
    }
  },

  async removeItem(key) {
    try {
      await SecureStore.deleteItemAsync(key);
      return true;
    } catch (error) {
      console.error('Error deleting from secure store:', error);
      return false;
    }
  },

  async clearAll() {
    try {
      await Promise.all([
        SecureStore.deleteItemAsync(KEYS.ACCESS_TOKEN),
        SecureStore.deleteItemAsync(KEYS.USER_INFO),
        SecureStore.deleteItemAsync(KEYS.USER_ROLE)
      ]);
      return true;
    } catch (error) {
      console.error('Error clearing secure store:', error);
      return false;
    }
  }
};

export default secureStorage;
