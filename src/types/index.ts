// Core types for Project-R1

export interface Message {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
  model?: string;
  isStreaming?: boolean;
  error?: string;
}

export interface Chat {
  id: string;
  title: string;
  messages: Message[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface AIModel {
  id: string;
  name: string;
  displayName: string;
  provider: 'openai' | 'google' | 'deepseek' | 'anthropic' | 'local';
  capabilities: {
    chat: boolean;
    streaming: boolean;
    functionCalling: boolean;
    vision: boolean;
  };
  maxTokens?: number;
  contextWindow?: number;
  pricing?: {
    input: number;
    output: number;
  };
}

export interface APIConfig {
  openai?: {
    apiKey: string;
    baseUrl?: string;
  };
  google?: {
    apiKey: string;
  };
  deepseek?: {
    apiKey: string;
    baseUrl?: string;
  };
  anthropic?: {
    apiKey: string;
  };
}

export interface AppSettings {
  defaultModel: string;
  theme: 'dark' | 'light' | 'system';
  streamingEnabled: boolean;
  saveHistory: boolean;
  apiConfigs: APIConfig;
}

export interface ChatContextType {
  chats: Chat[];
  currentChat: Chat | null;
  isLoading: boolean;
  error: string | null;
  createChat: (title?: string, model?: string) => Chat;
  deleteChat: (chatId: string) => void;
  selectChat: (chatId: string) => void;
  sendMessage: (content: string, model?: string) => Promise<void>;
  clearHistory: () => void;
}
