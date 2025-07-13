import { AIModel } from '@/types';

export const SUPPORTED_MODELS: AIModel[] = [
  // OpenAI Models
  {
    id: 'gpt-4-turbo',
    name: 'gpt-4-turbo',
    displayName: 'GPT-4 Turbo',
    provider: 'openai',
    capabilities: {
      chat: true,
      streaming: true,
      functionCalling: true,
      vision: true,
    },
    maxTokens: 4096,
    contextWindow: 128000,
    pricing: {
      input: 0.01,
      output: 0.03,
    },
  },
  {
    id: 'gpt-3.5-turbo',
    name: 'gpt-3.5-turbo',
    displayName: 'GPT-3.5 Turbo',
    provider: 'openai',
    capabilities: {
      chat: true,
      streaming: true,
      functionCalling: true,
      vision: false,
    },
    maxTokens: 4096,
    contextWindow: 16385,
    pricing: {
      input: 0.0005,
      output: 0.0015,
    },
  },
  
  // Google Models
  {
    id: 'gemini-1.5-flash',
    name: 'gemini-1.5-flash',
    displayName: 'Gemini 1.5 Flash',
    provider: 'google',
    capabilities: {
      chat: true,
      streaming: true,
      functionCalling: true,
      vision: true,
    },
    maxTokens: 8192,
    contextWindow: 1048576, // 1M tokens
  },
  {
    id: 'gemini-2.5-flash',
    name: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    provider: 'google',
    capabilities: {
      chat: true,
      streaming: true,
      functionCalling: true,
      vision: true,
    },
    maxTokens: 8192,
    contextWindow: 2097152, // 2M tokens
  },
  
  // DeepSeek Models
  {
    id: 'deepseek-chat',
    name: 'deepseek-chat',
    displayName: 'DeepSeek Chat',
    provider: 'deepseek',
    capabilities: {
      chat: true,
      streaming: true,
      functionCalling: false,
      vision: false,
    },
    maxTokens: 4096,
    contextWindow: 32768,
  },
  {
    id: 'deepseek-coder',
    name: 'deepseek-coder',
    displayName: 'DeepSeek Coder',
    provider: 'deepseek',
    capabilities: {
      chat: true,
      streaming: true,
      functionCalling: false,
      vision: false,
    },
    maxTokens: 4096,
    contextWindow: 16384,
  },
  
  // Anthropic Models
  {
    id: 'claude-3-haiku',
    name: 'claude-3-haiku-20240307',
    displayName: 'Claude 3 Haiku',
    provider: 'anthropic',
    capabilities: {
      chat: true,
      streaming: true,
      functionCalling: false,
      vision: true,
    },
    maxTokens: 4096,
    contextWindow: 200000,
  },
];

export const getModelById = (id: string): AIModel | undefined => {
  return SUPPORTED_MODELS.find(model => model.id === id);
};

export const getModelsByProvider = (provider: string): AIModel[] => {
  return SUPPORTED_MODELS.filter(model => model.provider === provider);
};

export const DEFAULT_MODEL = 'gpt-3.5-turbo';
