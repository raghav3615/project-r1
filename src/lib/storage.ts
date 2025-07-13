import { Chat, AppSettings, APIConfig } from '@/types';

const STORAGE_KEYS = {
  CHATS: 'r1-chats',
  SETTINGS: 'r1-settings',
  API_CONFIGS: 'r1-api-configs',
} as const;

// Chat storage functions
export const saveChats = (chats: Chat[]): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(chats));
  } catch (error) {
    console.error('Failed to save chats:', error);
  }
};

export const loadChats = (): Chat[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.CHATS);
    if (!stored) return [];
    
    const chats = JSON.parse(stored);
    // Convert date strings back to Date objects and migrate old model names
    return chats.map((chat: any) => ({
      ...chat,
      model: migrateModelName(chat.model),
      createdAt: new Date(chat.createdAt),
      updatedAt: new Date(chat.updatedAt),
      messages: chat.messages.map((msg: any) => ({
        ...msg,
        timestamp: new Date(msg.timestamp),
      })),
    }));
  } catch (error) {
    console.error('Failed to load chats:', error);
    return [];
  }
};

// Model migration utility
const migrateModelName = (modelName: string): string => {
  const migrations: Record<string, string> = {
    'gemini-pro': 'gemini-2.5-flash',
    'gemini-pro-vision': 'gemini-1.5-pro',
    'gemini-2.0-flash': 'gemini-2.5-flash', // Migrate to newest version
    'gemini-1.5-flash': 'gemini-2.5-flash', // Migrate to newest version
  };
  
  return migrations[modelName] || modelName;
};

export const clearChats = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.CHATS);
  } catch (error) {
    console.error('Failed to clear chats:', error);
  }
};

// Settings storage functions
export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
};

export const loadSettings = (): AppSettings | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return null;
  }
};

// API configuration storage (encrypted/secure)
export const saveAPIConfigs = (configs: APIConfig): void => {
  try {
    // In a production app, you might want to encrypt this data
    localStorage.setItem(STORAGE_KEYS.API_CONFIGS, JSON.stringify(configs));
  } catch (error) {
    console.error('Failed to save API configs:', error);
  }
};

export const loadAPIConfigs = (): APIConfig => {
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.API_CONFIGS);
    return stored ? JSON.parse(stored) : {};
  } catch (error) {
    console.error('Failed to load API configs:', error);
    return {};
  }
};

export const clearAPIConfigs = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.API_CONFIGS);
  } catch (error) {
    console.error('Failed to clear API configs:', error);
  }
};

// Utility to check if we're in browser environment
export const isBrowser = (): boolean => {
  return typeof window !== 'undefined';
};
