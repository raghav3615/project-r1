'use client';

import React, { useState, useEffect } from 'react';
import { X, Eye, EyeOff, Save, Trash2 } from 'lucide-react';
import { APIConfig } from '@/types';
import { saveAPIConfigs, loadAPIConfigs, clearAPIConfigs } from '@/lib/storage';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [apiConfigs, setApiConfigs] = useState<APIConfig>({});
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const configs = loadAPIConfigs();
      setApiConfigs(configs);
      setHasChanges(false);
    }
  }, [isOpen]);

  const handleSave = () => {
    saveAPIConfigs(apiConfigs);
    setHasChanges(false);
    onClose();
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all API configurations?')) {
      clearAPIConfigs();
      setApiConfigs({});
      setHasChanges(true);
    }
  };

  const updateConfig = (provider: string, field: string, value: string) => {
    setApiConfigs(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider as keyof APIConfig],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  const toggleShowKey = (key: string) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-semibold">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="space-y-8">
            {/* API Configuration Section */}
            <div>
              <h3 className="text-lg font-medium mb-4">API Configuration</h3>
              <p className="text-gray-400 text-sm mb-6">
                Configure your API keys for different AI providers. Your keys are stored locally and never sent to our servers.
              </p>

              {/* OpenAI */}
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-blue-400">OpenAI</h4>
                <div>
                  <label className="block text-sm font-medium mb-2">API Key</label>
                  <div className="relative">
                    <input
                      type={showKeys.openai ? 'text' : 'password'}
                      value={apiConfigs.openai?.apiKey || ''}
                      onChange={(e) => updateConfig('openai', 'apiKey', e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('openai')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showKeys.openai ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Base URL (Optional)</label>
                  <input
                    type="text"
                    value={apiConfigs.openai?.baseUrl || ''}
                    onChange={(e) => updateConfig('openai', 'baseUrl', e.target.value)}
                    placeholder="https://api.openai.com/v1"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Google */}
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-green-400">Google (Gemini)</h4>
                <div>
                  <label className="block text-sm font-medium mb-2">API Key</label>
                  <div className="relative">
                    <input
                      type={showKeys.google ? 'text' : 'password'}
                      value={apiConfigs.google?.apiKey || ''}
                      onChange={(e) => updateConfig('google', 'apiKey', e.target.value)}
                      placeholder="AIza..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('google')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showKeys.google ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* DeepSeek */}
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-purple-400">DeepSeek</h4>
                <div>
                  <label className="block text-sm font-medium mb-2">API Key</label>
                  <div className="relative">
                    <input
                      type={showKeys.deepseek ? 'text' : 'password'}
                      value={apiConfigs.deepseek?.apiKey || ''}
                      onChange={(e) => updateConfig('deepseek', 'apiKey', e.target.value)}
                      placeholder="sk-..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('deepseek')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showKeys.deepseek ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Base URL (Optional)</label>
                  <input
                    type="text"
                    value={apiConfigs.deepseek?.baseUrl || ''}
                    onChange={(e) => updateConfig('deepseek', 'baseUrl', e.target.value)}
                    placeholder="https://api.deepseek.com/v1"
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Anthropic */}
              <div className="space-y-4 mb-6">
                <h4 className="font-medium text-orange-400">Anthropic (Claude)</h4>
                <div>
                  <label className="block text-sm font-medium mb-2">API Key</label>
                  <div className="relative">
                    <input
                      type={showKeys.anthropic ? 'text' : 'password'}
                      value={apiConfigs.anthropic?.apiKey || ''}
                      onChange={(e) => updateConfig('anthropic', 'apiKey', e.target.value)}
                      placeholder="sk-ant-..."
                      className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => toggleShowKey('anthropic')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showKeys.anthropic ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Privacy Notice */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <h4 className="font-medium text-blue-400 mb-2">🔒 Privacy First</h4>
              <p className="text-sm text-gray-300">
                Your API keys are stored locally in your browser and never sent to our servers. 
                All communication with AI providers happens directly from your browser.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700">
          <button
            onClick={handleClearAll}
            className="flex items-center space-x-2 px-4 py-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            <span>Clear All</span>
          </button>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Save size={16} />
              <span>Save Changes</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
