import { AIModel, APIConfig, Message } from '@/types';

export interface StreamCallback {
  onToken: (token: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: string) => void;
}

export abstract class AIProvider {
  abstract sendMessage(
    messages: Message[],
    model: AIModel,
    apiConfig: APIConfig,
    streamCallback?: StreamCallback
  ): Promise<string>;
  
  abstract isConfigured(apiConfig: APIConfig): boolean;
}

// OpenAI Provider
export class OpenAIProvider extends AIProvider {
  async sendMessage(
    messages: Message[],
    model: AIModel,
    apiConfig: APIConfig,
    streamCallback?: StreamCallback
  ): Promise<string> {
    if (!this.isConfigured(apiConfig)) {
      throw new Error('OpenAI API key not configured');
    }

    const openaiMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const baseUrl = apiConfig.openai?.baseUrl || 'https://api.openai.com/v1';
    const url = `${baseUrl}/chat/completions`;

    const requestBody = {
      model: model.name,
      messages: openaiMessages,
      stream: !!streamCallback,
      max_tokens: model.maxTokens,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.openai?.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    if (streamCallback) {
      return this.handleStream(response, streamCallback);
    } else {
      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    }
  }

  private async handleStream(response: Response, streamCallback: StreamCallback): Promise<string> {
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available for streaming');
    }

    let fullResponse = '';
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                streamCallback.onToken(content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      streamCallback.onComplete(fullResponse);
      return fullResponse;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown streaming error';
      streamCallback.onError(errorMsg);
      throw error;
    }
  }

  isConfigured(apiConfig: APIConfig): boolean {
    return !!apiConfig.openai?.apiKey;
  }
}

// Google (Gemini) Provider
export class GoogleProvider extends AIProvider {
  async sendMessage(
    messages: Message[],
    model: AIModel,
    apiConfig: APIConfig,
    streamCallback?: StreamCallback
  ): Promise<string> {
    if (!this.isConfigured(apiConfig)) {
      throw new Error('Google API key not configured');
    }

    console.log('GoogleProvider: Sending message with model:', model.name);

    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const url = streamCallback 
      ? `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:streamGenerateContent?key=${apiConfig.google?.apiKey}`
      : `https://generativelanguage.googleapis.com/v1beta/models/${model.name}:generateContent?key=${apiConfig.google?.apiKey}`;

    console.log('GoogleProvider: Using URL:', url.replace(apiConfig.google?.apiKey || '', '[API_KEY]'));

    const requestBody = {
      contents,
      generationConfig: {
        maxOutputTokens: model.maxTokens,
      },
    };

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('GoogleProvider: API error:', error);
        throw new Error(`Google API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      console.log('GoogleProvider: Full API response:', JSON.stringify(data, null, 2));
      
      // Check for various possible response structures
      let content = '';
      
      // Handle array of response chunks (streaming format)
      if (Array.isArray(data)) {
        console.log('GoogleProvider: Processing array response format');
        for (const chunk of data) {
          if (chunk.candidates && chunk.candidates.length > 0) {
            const candidate = chunk.candidates[0];
            if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
              const chunkText = candidate.content.parts[0].text || '';
              content += chunkText;
            }
          }
        }
      } 
      // Handle single response object
      else if (data.candidates && data.candidates.length > 0) {
        const candidate = data.candidates[0];
        console.log('GoogleProvider: First candidate:', JSON.stringify(candidate, null, 2));
        
        // Check if content was blocked by safety filters
        if (candidate.finishReason === 'SAFETY') {
          throw new Error('Response was blocked by Google\'s safety filters. Please try a different message.');
        }
        
        if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
          content = candidate.content.parts[0].text || '';
        } else if (candidate.text) {
          content = candidate.text;
        } else if (candidate.output) {
          content = candidate.output;
        }
      } 
      // Handle other response formats
      else if (data.text) {
        content = data.text;
      } else if (data.content) {
        content = data.content;
      }
      
      // Check for blocked content or other errors
      if (data.promptFeedback?.blockReason) {
        throw new Error(`Message blocked by Google API: ${data.promptFeedback.blockReason}`);
      }
      
      console.log('GoogleProvider: Extracted content:', content);
      console.log('GoogleProvider: Content length:', content.length);

      if (streamCallback) {
        console.log('GoogleProvider: Starting streaming response');
        
        // Simulate streaming by sending the content in chunks
        if (content && content.trim()) {
          const words = content.split(' ');
          
          for (let i = 0; i < words.length; i++) {
            streamCallback.onToken(words[i] + (i < words.length - 1 ? ' ' : ''));
            
            // Small delay to simulate streaming
            if (i % 5 === 0) {
              await new Promise(resolve => setTimeout(resolve, 50));
            }
          }
          
          streamCallback.onComplete(content);
          return content;
        } else {
          console.error('GoogleProvider: No content found in response structure');
          throw new Error('No content received from Google API. Response structure: ' + JSON.stringify(data));
        }
      } else {
        if (content && content.trim()) {
          return content;
        } else {
          console.error('GoogleProvider: No content found in response structure');
          throw new Error('No content received from Google API. Response structure: ' + JSON.stringify(data));
        }
      }
    } catch (error) {
      console.error('GoogleProvider: Request failed:', error);
      throw error;
    }
  }

  isConfigured(apiConfig: APIConfig): boolean {
    return !!apiConfig.google?.apiKey;
  }
}

// DeepSeek Provider
export class DeepSeekProvider extends AIProvider {
  async sendMessage(
    messages: Message[],
    model: AIModel,
    apiConfig: APIConfig,
    streamCallback?: StreamCallback
  ): Promise<string> {
    if (!this.isConfigured(apiConfig)) {
      throw new Error('DeepSeek API key not configured');
    }

    const deepseekMessages = messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    const baseUrl = apiConfig.deepseek?.baseUrl || 'https://api.deepseek.com/v1';
    const url = `${baseUrl}/chat/completions`;

    const requestBody = {
      model: model.name,
      messages: deepseekMessages,
      stream: !!streamCallback,
      max_tokens: model.maxTokens,
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiConfig.deepseek?.apiKey}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`DeepSeek API error: ${response.status} - ${error}`);
    }

    if (streamCallback) {
      return this.handleStream(response, streamCallback);
    } else {
      const data = await response.json();
      return data.choices[0]?.message?.content || '';
    }
  }

  private async handleStream(response: Response, streamCallback: StreamCallback): Promise<string> {
    // Similar to OpenAI streaming implementation
    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('No reader available for streaming');
    }

    let fullResponse = '';
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') continue;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices[0]?.delta?.content;
              if (content) {
                fullResponse += content;
                streamCallback.onToken(content);
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      streamCallback.onComplete(fullResponse);
      return fullResponse;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown streaming error';
      streamCallback.onError(errorMsg);
      throw error;
    }
  }

  isConfigured(apiConfig: APIConfig): boolean {
    return !!apiConfig.deepseek?.apiKey;
  }
}

// Provider factory
export class AIProviderFactory {
  private static providers = new Map<string, AIProvider>([
    ['openai', new OpenAIProvider()],
    ['google', new GoogleProvider()],
    ['deepseek', new DeepSeekProvider()],
  ]);

  static getProvider(providerName: string): AIProvider {
    const provider = this.providers.get(providerName);
    if (!provider) {
      throw new Error(`Unsupported provider: ${providerName}`);
    }
    return provider;
  }
}
