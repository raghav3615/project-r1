// Robust Chat Context for Project-R1
'use client';

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { Chat, Message, ChatContextType, AppSettings, APIConfig } from '@/types';
import { DEFAULT_MODEL, getModelById } from '@/lib/models';
import { AIProviderFactory, StreamCallback } from '@/lib/ai-providers';
import { saveChats, loadChats, loadAPIConfigs, loadSettings, saveSettings } from '@/lib/storage';

interface ChatState {
  chats: Chat[];
  currentChatId: string | null;
  isLoading: boolean;
  error: string | null;
  settings: AppSettings;
  apiConfigs: APIConfig;
}

type ChatAction =
  | { type: 'SET_CHATS'; payload: Chat[] }
  | { type: 'ADD_CHAT'; payload: Chat }
  | { type: 'DELETE_CHAT'; payload: string }
  | { type: 'SELECT_CHAT'; payload: string }
  | { type: 'UPDATE_CHAT'; payload: Chat }
  | { type: 'ADD_MESSAGE'; payload: { chatId: string; message: Message } }
  | { type: 'UPDATE_MESSAGE'; payload: { chatId: string; messageId: string; content: string; isStreaming?: boolean } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_SETTINGS'; payload: AppSettings }
  | { type: 'SET_API_CONFIGS'; payload: APIConfig };

const defaultSettings: AppSettings = {
  defaultModel: DEFAULT_MODEL,
  theme: 'dark',
  streamingEnabled: true,
  saveHistory: true,
  apiConfigs: {},
};

const initialState: ChatState = {
  chats: [],
  currentChatId: null,
  isLoading: false,
  error: null,
  settings: defaultSettings,
  apiConfigs: {},
};

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'SET_CHATS': {
      const chats = action.payload;
      let currentChatId = state.currentChatId;
      if (!chats.find(c => c.id === currentChatId)) {
        currentChatId = chats.length > 0 ? chats[0].id : null;
      }
      return { ...state, chats, currentChatId };
    }
    case 'ADD_CHAT': {
      return {
        ...state,
        chats: [action.payload, ...state.chats],
        currentChatId: action.payload.id,
      };
    }
    case 'DELETE_CHAT': {
      const chats = state.chats.filter(chat => chat.id !== action.payload);
      let currentChatId = state.currentChatId;
      if (currentChatId === action.payload) {
        currentChatId = chats.length > 0 ? chats[0].id : null;
      }
      return { ...state, chats, currentChatId };
    }
    case 'SELECT_CHAT': {
      return { ...state, currentChatId: action.payload };
    }
    case 'UPDATE_CHAT': {
      const chats = state.chats.map(chat =>
        chat.id === action.payload.id ? action.payload : chat
      );
      return { ...state, chats };
    }
    case 'ADD_MESSAGE': {
      const chats = state.chats.map(chat => {
        if (chat.id === action.payload.chatId) {
          return {
            ...chat,
            messages: [...chat.messages, action.payload.message],
            updatedAt: new Date(),
          };
        }
        return chat;
      });
      return { ...state, chats };
    }
    case 'UPDATE_MESSAGE': {
      const chats = state.chats.map(chat => {
        if (chat.id === action.payload.chatId) {
          return {
            ...chat,
            messages: chat.messages.map(msg =>
              msg.id === action.payload.messageId
                ? {
                    ...msg,
                    content: action.payload.content,
                    isStreaming:
                      action.payload.isStreaming !== undefined
                        ? action.payload.isStreaming
                        : msg.isStreaming,
                  }
                : msg
            ),
            updatedAt: new Date(),
          };
        }
        return chat;
      });
      return { ...state, chats };
    }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_SETTINGS':
      return { ...state, settings: action.payload };
    case 'SET_API_CONFIGS':
      return { ...state, apiConfigs: action.payload };
    default:
      return state;
  }
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Load data from localStorage on mount
  useEffect(() => {
    const savedChats = loadChats();
    const savedSettings = loadSettings() || defaultSettings;
    const savedAPIConfigs = loadAPIConfigs();
    dispatch({ type: 'SET_CHATS', payload: savedChats });
    dispatch({ type: 'SET_SETTINGS', payload: savedSettings });
    dispatch({ type: 'SET_API_CONFIGS', payload: savedAPIConfigs });
    if (savedChats.length > 0) {
      dispatch({ type: 'SELECT_CHAT', payload: savedChats[0].id });
    }
  }, []);

  // Save chats to localStorage whenever they change
  useEffect(() => {
    if (state.settings.saveHistory) {
      saveChats(state.chats);
    }
  }, [state.chats, state.settings.saveHistory]);

  // Save settings whenever they change
  useEffect(() => {
    saveSettings(state.settings);
  }, [state.settings]);

  const createChat = (title?: string, model?: string): Chat => {
    const newChat: Chat = {
      id: `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: title || 'New Chat',
      messages: [],
      model: model || state.settings.defaultModel,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    dispatch({ type: 'ADD_CHAT', payload: newChat });
    return newChat;
  };

  const deleteChat = (chatId: string): void => {
    dispatch({ type: 'DELETE_CHAT', payload: chatId });
  };

  const selectChat = (chatId: string): void => {
    dispatch({ type: 'SELECT_CHAT', payload: chatId });
  };

  const sendMessage = async (content: string, model?: string): Promise<void> => {
    dispatch({ type: 'SET_ERROR', payload: null });
    let chat = state.chats.find(c => c.id === state.currentChatId) || null;
    if (!chat) {
      chat = createChat('New Chat', model);
      dispatch({ type: 'SELECT_CHAT', payload: chat.id });
      setTimeout(() => {
        sendMessage(content, model);
      }, 0);
      return;
    }
    const selectedModel = getModelById(model || chat.model);
    if (!selectedModel) {
      dispatch({ type: 'SET_ERROR', payload: 'Invalid model selected' });
      return;
    }
    const provider = AIProviderFactory.getProvider(selectedModel.provider);
    if (!provider.isConfigured(state.apiConfigs)) {
      dispatch({ type: 'SET_ERROR', payload: `${selectedModel.provider} API key not configured` });
      return;
    }
    // Add user message
    const userMessage: Message = {
      id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content,
      role: 'user',
      timestamp: new Date(),
      model: selectedModel.id,
    };
    dispatch({ type: 'ADD_MESSAGE', payload: { chatId: chat.id, message: userMessage } });
    // Add assistant message placeholder
    const assistantMessage: Message = {
      id: `msg_${Date.now() + 1}_${Math.random().toString(36).substr(2, 9)}`,
      content: '',
      role: 'assistant',
      timestamp: new Date(),
      model: selectedModel.id,
      isStreaming: true,
    };
    dispatch({ type: 'ADD_MESSAGE', payload: { chatId: chat.id, message: assistantMessage } });
    dispatch({ type: 'SET_LOADING', payload: true });
    dispatch({ type: 'SET_ERROR', payload: null });
    try {
      const messages = [...chat.messages, userMessage];
      if (state.settings.streamingEnabled && selectedModel.capabilities.streaming) {
        let accumulatedContent = '';
        let lastUpdateTime = 0;
        let updateTimeoutId: NodeJS.Timeout | null = null;
        let batchCount = 0;
        const throttleMs = 50;
        const maxBatchSize = 10;
        const flushUpdate = () => {
          dispatch({
            type: 'UPDATE_MESSAGE',
            payload: {
              chatId: chat.id,
              messageId: assistantMessage.id,
              content: accumulatedContent,
              isStreaming: true,
            },
          });
          lastUpdateTime = Date.now();
          updateTimeoutId = null;
          batchCount = 0;
        };
        const streamCallback: StreamCallback = {
          onToken: (token: string) => {
            accumulatedContent += token;
            batchCount++;
            const now = Date.now();
            const timeSinceLastUpdate = now - lastUpdateTime;
            if (updateTimeoutId) {
              clearTimeout(updateTimeoutId);
            }
            if (timeSinceLastUpdate >= throttleMs || batchCount >= maxBatchSize) {
              flushUpdate();
            } else {
              updateTimeoutId = setTimeout(flushUpdate, throttleMs - timeSinceLastUpdate);
            }
          },
          onComplete: (fullResponse: string) => {
            if (updateTimeoutId) {
              clearTimeout(updateTimeoutId);
            }
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: {
                chatId: chat.id,
                messageId: assistantMessage.id,
                content: fullResponse,
                isStreaming: false,
              },
            });
            dispatch({ type: 'SET_LOADING', payload: false });
          },
          onError: (error: string) => {
            if (updateTimeoutId) {
              clearTimeout(updateTimeoutId);
            }
            dispatch({ type: 'SET_ERROR', payload: error });
            dispatch({ type: 'SET_LOADING', payload: false });
            dispatch({
              type: 'UPDATE_MESSAGE',
              payload: {
                chatId: chat.id,
                messageId: assistantMessage.id,
                content: accumulatedContent,
                isStreaming: false,
              },
            });
          },
        };
        await provider.sendMessage(messages, selectedModel, state.apiConfigs, streamCallback);
      } else {
        const response = await provider.sendMessage(messages, selectedModel, state.apiConfigs);
        dispatch({
          type: 'UPDATE_MESSAGE',
          payload: {
            chatId: chat.id,
            messageId: assistantMessage.id,
            content: response,
            isStreaming: false,
          },
        });
        dispatch({ type: 'SET_LOADING', payload: false });
      }
      if (chat.messages.length === 0) {
        const updatedChat = { ...chat, title: content.slice(0, 50) + (content.length > 50 ? '...' : '') };
        dispatch({ type: 'UPDATE_CHAT', payload: updatedChat });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      dispatch({ type: 'SET_ERROR', payload: errorMessage });
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const clearHistory = (): void => {
    dispatch({ type: 'SET_CHATS', payload: [] });
    dispatch({ type: 'SELECT_CHAT', payload: '' });
  };

  const currentChat = state.chats.find(c => c.id === state.currentChatId) || null;

  const contextValue: ChatContextType = {
    chats: state.chats,
    currentChat,
    isLoading: state.isLoading,
    error: state.error,
    createChat,
    deleteChat,
    selectChat,
    sendMessage,
    clearHistory,
  };

  return (
    <ChatContext.Provider value={contextValue}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat(): ChatContextType {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
