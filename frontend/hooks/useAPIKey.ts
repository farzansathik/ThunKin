import { useState, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_KEY_STORAGE_KEY = "groq_api_key";

export const useAPIKey = () => {
  const [apiKey, setApiKey] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAPIKey();
  }, []);

  const loadAPIKey = async () => {
    try {
      // First check if it's in environment
      const envKey = process.env.EXPO_PUBLIC_GROQ_API_KEY;
      if (envKey) {
        setApiKey(envKey);
        setLoading(false);
        return;
      }

      // Then check AsyncStorage
      const storedKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
      if (storedKey) {
        setApiKey(storedKey);
      }
    } catch (error) {
      console.error("Error loading API key:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveAPIKey = async (key: string) => {
    try {
      await AsyncStorage.setItem(API_KEY_STORAGE_KEY, key);
      setApiKey(key);
    } catch (error) {
      console.error("Error saving API key:", error);
      throw error;
    }
  };

  const clearAPIKey = async () => {
    try {
      await AsyncStorage.removeItem(API_KEY_STORAGE_KEY);
      setApiKey(null);
    } catch (error) {
      console.error("Error clearing API key:", error);
    }
  };

  const hasAPIKey = !!apiKey;

  return { apiKey, loading, saveAPIKey, clearAPIKey, hasAPIKey };
};
