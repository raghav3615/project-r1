'use client';

import React, { useEffect, useRef, useMemo } from 'react';
import { Message } from './Message';
import { useChat } from '@/hooks/useChat';

export const ChatMessages = React.memo(function ChatMessages() {
  const { currentChat, isLoading, error } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [currentChat?.messages?.length]); // Only scroll when message count changes

  // Memoize the messages to prevent unnecessary re-renders
  const memoizedMessages = useMemo(() => {
    if (!currentChat?.messages) return [];
    return currentChat.messages;
  }, [currentChat?.messages]);

  if (!currentChat) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-bold mb-4">R1</div>
          <div className="text-gray-400">
            Select a chat or start a new conversation
          </div>
        </div>
      </div>
    );
  }

  if (currentChat.messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center max-w-2xl mx-auto px-4">
          <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="w-8 h-8 bg-gray-900 rounded-full"></div>
          </div>
          <h1 className="text-4xl font-bold mb-4">R1</h1>
          <p className="text-gray-400 text-lg mb-8">
            Your privacy-first AI assistant that works with multiple models. 
            Ask me anything!
          </p>
          
          {/* Quick starter prompts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-left">
            <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
              <div className="font-medium mb-1">📝 Help me write</div>
              <div className="text-sm text-gray-400">
                Draft emails, essays, or creative content
              </div>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
              <div className="font-medium mb-1">💡 Brainstorm ideas</div>
              <div className="text-sm text-gray-400">
                Generate creative solutions and concepts
              </div>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
              <div className="font-medium mb-1">🔍 Research topics</div>
              <div className="text-sm text-gray-400">
                Get comprehensive information and analysis
              </div>
            </div>
            <div className="p-4 bg-gray-800 rounded-lg hover:bg-gray-700 cursor-pointer transition-colors">
              <div className="font-medium mb-1">💻 Code assistance</div>
              <div className="text-sm text-gray-400">
                Debug, explain, or write code in any language
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
            <div className="text-red-400 font-medium mb-1">Error</div>
            <div className="text-red-300 text-sm">{error}</div>
          </div>
        )}
        
        {memoizedMessages.map((message, index) => (
          <Message
            key={message.id}
            message={message}
            isLast={index === memoizedMessages.length - 1}
          />
        ))}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
});
