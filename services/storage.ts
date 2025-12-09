import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

/**
 * Storage service that wraps SecureStore and AsyncStorage
 * Prefers SecureStore for sensitive data, falls back to AsyncStorage
 */

const isSecureStoreAvailable = Platform.OS === "ios" || Platform.OS === "android";

export const storage = {
  /**
   * Store a value securely
   * @param key - Storage key
   * @param value - Value to store
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isSecureStoreAvailable) {
        await SecureStore.setItemAsync(key, value);
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error(`Error storing item ${key}:`, error);
      // Fallback to AsyncStorage if SecureStore fails
      try {
        await AsyncStorage.setItem(key, value);
      } catch (fallbackError) {
        console.error(`Error storing item ${key} in AsyncStorage:`, fallbackError);
        throw fallbackError;
      }
    }
  },

  /**
   * Retrieve a stored value
   * @param key - Storage key
   * @returns The stored value or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (isSecureStoreAvailable) {
        return await SecureStore.getItemAsync(key);
      } else {
        return await AsyncStorage.getItem(key);
      }
    } catch (error) {
      console.error(`Error retrieving item ${key}:`, error);
      // Fallback to AsyncStorage if SecureStore fails
      try {
        return await AsyncStorage.getItem(key);
      } catch (fallbackError) {
        console.error(`Error retrieving item ${key} from AsyncStorage:`, fallbackError);
        return null;
      }
    }
  },

  /**
   * Remove a stored value
   * @param key - Storage key
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (isSecureStoreAvailable) {
        await SecureStore.deleteItemAsync(key);
      } else {
        await AsyncStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing item ${key}:`, error);
      // Fallback to AsyncStorage if SecureStore fails
      try {
        await AsyncStorage.removeItem(key);
      } catch (fallbackError) {
        console.error(`Error removing item ${key} from AsyncStorage:`, fallbackError);
        throw fallbackError;
      }
    }
  },
};
