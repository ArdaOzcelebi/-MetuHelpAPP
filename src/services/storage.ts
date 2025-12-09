import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

/**
 * Storage service that uses SecureStore for native platforms (iOS/Android)
 * and falls back to AsyncStorage for web
 */

const isWeb = Platform.OS === "web";

export const storage = {
  /**
   * Store a value securely
   * @param key - The key to store the value under
   * @param value - The value to store
   */
  async setItem(key: string, value: string): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      console.error(`Error storing item with key "${key}":`, error);
      throw error;
    }
  },

  /**
   * Retrieve a stored value
   * @param key - The key to retrieve the value for
   * @returns The stored value or null if not found
   */
  async getItem(key: string): Promise<string | null> {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      console.error(`Error retrieving item with key "${key}":`, error);
      return null;
    }
  },

  /**
   * Remove a stored value
   * @param key - The key to remove
   */
  async removeItem(key: string): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      console.error(`Error removing item with key "${key}":`, error);
      throw error;
    }
  },
};
