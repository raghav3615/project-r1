'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Mic, Square, X, FileText, Image } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { loadAPIConfigs } from '@/lib/storage';
import { isAnyAPIConfigured } from '@/lib/utils';

interface ChatInputProps {
  disabled?: boolean;
  onOpenSettings?: () => void;
}

interface UploadedFile {
  file: File;
  preview?: string;
  type: 'image' | 'document';
}

export const ChatInput = React.memo(function ChatInput({ disabled, onOpenSettings }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [hasAPIKeys, setHasAPIKeys] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { sendMessage, isLoading } = useChat();

  // Check for API keys on mount and when window gains focus
  useEffect(() => {
    const checkAPIKeys = () => {
      const configs = loadAPIConfigs();
      setHasAPIKeys(isAnyAPIConfigured(configs));
    };

    checkAPIKeys();
    window.addEventListener('focus', checkAPIKeys);
    
    return () => window.removeEventListener('focus', checkAPIKeys);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || disabled || !hasAPIKeys) return;

    const message = input.trim();
    setInput('');
    setUploadedFiles([]); // Clear uploaded files after sending
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // TODO: Include file information in the message
    await sendMessage(message);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    files.forEach((file) => {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        alert(`File ${file.name} is too large. Maximum size is 10MB.`);
        return;
      }

      const fileType = file.type.startsWith('image/') ? 'image' : 'document';
      const uploadedFile: UploadedFile = {
        file,
        type: fileType,
      };

      if (fileType === 'image') {
        const reader = new FileReader();
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string;
          setUploadedFiles(prev => [...prev, uploadedFile]);
        };
        reader.readAsDataURL(file);
      } else {
        setUploadedFiles(prev => [...prev, uploadedFile]);
      }
    });

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="border-t border-gray-800 bg-gray-950 p-4">
      {!hasAPIKeys && (
        <div className="max-w-4xl mx-auto mb-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-400 font-medium">No API keys configured</p>
              <p className="text-yellow-300 text-sm mt-1">
                Configure your API keys to start chatting with AI models
              </p>
            </div>
            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-colors"
              >
                Configure
              </button>
            )}
          </div>
        </div>
      )}
      
      
      {/* File Previews */}
      {uploadedFiles.length > 0 && (
        <div className="max-w-4xl mx-auto mb-4">
          <div className="flex flex-wrap gap-2">
            {uploadedFiles.map((uploadedFile, index) => (
              <div
                key={index}
                className="relative bg-gray-800 border border-gray-700 rounded-lg p-2 flex items-center space-x-2 max-w-xs"
              >
                {uploadedFile.type === 'image' && uploadedFile.preview ? (
                  <img
                    src={uploadedFile.preview}
                    alt={uploadedFile.file.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                ) : (
                  <div className="w-8 h-8 bg-gray-700 rounded flex items-center justify-center">
                    {uploadedFile.type === 'image' ? (
                      <Image size={16} className="text-gray-400" />
                    ) : (
                      <FileText size={16} className="text-gray-400" />
                    )}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {(uploadedFile.file.size / 1024 / 1024).toFixed(1)} MB
                  </p>
                </div>
                <button
                  onClick={() => removeFile(index)}
                  className="p-1 hover:bg-gray-700 rounded transition-colors"
                >
                  <X size={14} className="text-gray-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="relative flex items-end space-x-3">
          {/* File upload button */}
          <button
            type="button"
            onClick={triggerFileUpload}
            className="flex-shrink-0 p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-800 rounded-lg transition-colors"
            disabled={disabled || isLoading || !hasAPIKeys}
          >
            <Paperclip size={20} />
          </button>

          {/* Hidden file input */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            accept="image/*,application/pdf,.txt,.md,.doc,.docx"
            className="hidden"
          />

          {/* Text input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}                      value={input}
                      onChange={handleInputChange}
                      onKeyDown={handleKeyDown}
                      placeholder={!hasAPIKeys ? "Configure API keys to start chatting..." : "Type your message..."}
                      disabled={disabled || isLoading || !hasAPIKeys}
                      rows={1}
                      className="w-full bg-gray-800 text-white placeholder-gray-400 border border-gray-700 rounded-lg p-3 pr-12 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ minHeight: '48px', maxHeight: '200px' }}
            />
            
            {/* Character count */}
            {input.length > 0 && (
              <div className="absolute bottom-1 right-1 text-xs text-gray-500">
                {input.length}
              </div>
            )}
          </div>

          {/* Voice recording button */}
          <button
            type="button"
            onClick={toggleRecording}
            className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
              isRecording
                ? 'text-red-400 bg-red-400/10 hover:bg-red-400/20'
                : 'text-gray-400 hover:text-gray-300 hover:bg-gray-800'
            }`}
            disabled={disabled || isLoading || !hasAPIKeys}
          >
            {isRecording ? <Square size={20} /> : <Mic size={20} />}
          </button>

          {/* Send button */}
          <button
            type="submit"
            disabled={!input.trim() || isLoading || disabled || !hasAPIKeys}
            className="flex-shrink-0 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>

        {/* Status indicators */}
        {isLoading && (
          <div className="flex items-center justify-center mt-3 text-gray-400 text-sm">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-2" />
            Generating response...
          </div>
        )}
      </form>
    </div>
  );
});
