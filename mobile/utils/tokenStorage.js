import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * Storage abstraction — uses SecureStore on native, localStorage on web.
 */
const TokenStorage = {
  async getItem(key) {
    if (Platform.OS === "web") {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    }
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },

  async setItem(key, value) {
    if (Platform.OS === "web") {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      /* ignore */
    }
  },

  async removeItem(key) {
    if (Platform.OS === "web") {
      try {
        localStorage.removeItem(key);
      } catch {
        /* ignore */
      }
      return;
    }
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {
      /* ignore */
    }
  },
};

export default TokenStorage;
