'use client';

import React, { useState } from 'react';
import { ChevronDown, Check, Settings } from 'lucide-react';
import { SUPPORTED_MODELS, getModelById } from '@/lib/models';
import { useChat } from '@/hooks/useChat';

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

export function ModelSelector({ selectedModel, onModelChange, disabled }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { currentChat } = useChat();
  
  const currentModel = getModelById(selectedModel);
  
  const groupedModels = SUPPORTED_MODELS.reduce((acc, model) => {
    if (!acc[model.provider]) {
      acc[model.provider] = [];
    }
    acc[model.provider].push(model);
    return acc;
  }, {} as Record<string, typeof SUPPORTED_MODELS>);

  const providerNames = {
    openai: 'OpenAI',
    google: 'Google',
    deepseek: 'DeepSeek',
    anthropic: 'Anthropic',
    local: 'Local',
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`flex items-center space-x-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors ${
          disabled ? 'opacity-50 cursor-not-allowed' : ''
        }`}
      >
        <span className="text-sm font-medium">
          {currentModel?.displayName || 'Select Model'}
        </span>
        <ChevronDown size={14} className={`transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-80 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-20 max-h-96 overflow-y-auto">
            <div className="p-3 border-b border-gray-700">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Select AI Model</h3>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    // TODO: Open settings modal
                  }}
                  className="p-1 hover:bg-gray-700 rounded"
                >
                  <Settings size={16} />
                </button>
              </div>
            </div>

            <div className="py-2">
              {Object.entries(groupedModels).map(([provider, models]) => (
                <div key={provider} className="mb-2 last:mb-0">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                    {providerNames[provider as keyof typeof providerNames] || provider}
                  </div>
                  {models.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => {
                        onModelChange(model.id);
                        setIsOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left hover:bg-gray-700 transition-colors flex items-center justify-between group"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm">{model.displayName}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {model.capabilities.vision && '👁️ Vision • '}
                          {model.capabilities.functionCalling && '🔧 Functions • '}
                          {model.capabilities.streaming && '⚡ Streaming • '}
                          {model.contextWindow && `${(model.contextWindow / 1000).toFixed(0)}K context`}
                        </div>
                        {model.pricing && (
                          <div className="text-xs text-gray-500 mt-1">
                            ${model.pricing.input}/1K input • ${model.pricing.output}/1K output
                          </div>
                        )}
                      </div>
                      {selectedModel === model.id && (
                        <Check size={16} className="text-blue-400 flex-shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              ))}
            </div>

            <div className="p-3 border-t border-gray-700 text-xs text-gray-400">
              {currentChat ? `Current chat: ${currentChat.model}` : 'No active chat'}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
