import * as SecureStore from "expo-secure-store";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_PREFIX = "metu_help_app:";

export async function setItem(key: string, value: string): Promise<void> {
  try {
    await SecureStore.setItemAsync(KEY_PREFIX + key, value);
  } catch {
    await AsyncStorage.setItem(KEY_PREFIX + key, value);
  }
}

export async function getItem(key: string): Promise<string | null> {
  try {
    const v = await SecureStore.getItemAsync(KEY_PREFIX + key);
    if (v !== null) return v;
  } catch {}
  try {
    return await AsyncStorage.getItem(KEY_PREFIX + key);
  } catch {
    return null;
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await SecureStore.deleteItemAsync(KEY_PREFIX + key);
  } catch {}
  try {
    await AsyncStorage.removeItem(KEY_PREFIX + key);
  } catch {}
}
