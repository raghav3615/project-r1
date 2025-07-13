import { APIConfig } from '@/types';

export const isAnyAPIConfigured = (configs: APIConfig): boolean => {
  return !!(
    configs.openai?.apiKey ||
    configs.google?.apiKey ||
    configs.deepseek?.apiKey ||
    configs.anthropic?.apiKey
  );
};

export const getConfiguredProviders = (configs: APIConfig): string[] => {
  const providers: string[] = [];
  
  if (configs.openai?.apiKey) providers.push('OpenAI');
  if (configs.google?.apiKey) providers.push('Google');
  if (configs.deepseek?.apiKey) providers.push('DeepSeek');
  if (configs.anthropic?.apiKey) providers.push('Anthropic');
  
  return providers;
};

export const getProviderStatus = (configs: APIConfig): Record<string, boolean> => {
  return {
    openai: !!configs.openai?.apiKey,
    google: !!configs.google?.apiKey,
    deepseek: !!configs.deepseek?.apiKey,
    anthropic: !!configs.anthropic?.apiKey,
  };
};
