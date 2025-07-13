'use client';

import React, { useState } from 'react';
import { Search, Clock, User, Bot, ChevronDown, ChevronUp } from 'lucide-react';
import { useChat } from '@/hooks/useChat';
import { Message } from '@/types';

interface ChatNavigatorProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatNavigator = React.memo(function ChatNavigator({ isOpen, onClose }: ChatNavigatorProps) {
  const { currentChat } = useChat();
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['recent']));

  if (!isOpen || !currentChat) return null;

  // Filter messages based on search query
  const filteredMessages = currentChat.messages.filter(message =>
    message.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Group messages by time periods
  const groupedMessages = {
    recent: filteredMessages.slice(-10), // Last 10 messages
    older: filteredMessages.slice(0, -10),
  };

  const toggleSection = (section: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(section)) {
      newExpanded.delete(section);
    } else {
      newExpanded.add(section);
    }
    setExpandedSections(newExpanded);
  };

  const scrollToMessage = (messageId: string) => {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-message');
      setTimeout(() => {
        element.classList.remove('highlight-message');
      }, 2000);
    }
    onClose();
  };

  const formatMessagePreview = (content: string) => {
    return content.length > 100 ? content.substring(0, 100) + '...' : content;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose} />
      
      {/* Navigator Panel */}
      <div className="fixed right-4 top-4 bottom-4 w-80 bg-gray-900 border border-gray-700 rounded-lg shadow-xl z-50 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-white">Chat Navigator</h3>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-700 rounded transition-colors"
            >
              ×
            </button>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Chat Info */}
          <div className="text-sm text-gray-400">
            <p>Total messages: {currentChat.messages.length}</p>
            <p>Created: {currentChat.createdAt.toLocaleDateString()}</p>
            <p>Model: {currentChat.model}</p>
          </div>

          {/* Recent Messages */}
          {groupedMessages.recent.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('recent')}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-800 rounded transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="font-medium text-white">Recent Messages</span>
                  <span className="text-xs text-gray-500">({groupedMessages.recent.length})</span>
                </div>
                {expandedSections.has('recent') ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>
              
              {expandedSections.has('recent') && (
                <div className="ml-4 mt-2 space-y-2">
                  {groupedMessages.recent.map((message, index) => (
                    <button
                      key={message.id}
                      onClick={() => scrollToMessage(message.id)}
                      className="w-full text-left p-2 hover:bg-gray-800 rounded transition-colors"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 mt-1">
                          {message.role === 'user' ? (
                            <User size={14} className="text-blue-400" />
                          ) : (
                            <Bot size={14} className="text-green-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-300 truncate">
                            {formatMessagePreview(message.content)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Older Messages */}
          {groupedMessages.older.length > 0 && (
            <div>
              <button
                onClick={() => toggleSection('older')}
                className="w-full flex items-center justify-between p-2 hover:bg-gray-800 rounded transition-colors"
              >
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="text-gray-400" />
                  <span className="font-medium text-white">Earlier Messages</span>
                  <span className="text-xs text-gray-500">({groupedMessages.older.length})</span>
                </div>
                {expandedSections.has('older') ? (
                  <ChevronUp size={16} className="text-gray-400" />
                ) : (
                  <ChevronDown size={16} className="text-gray-400" />
                )}
              </button>
              
              {expandedSections.has('older') && (
                <div className="ml-4 mt-2 space-y-2">
                  {groupedMessages.older.map((message, index) => (
                    <button
                      key={message.id}
                      onClick={() => scrollToMessage(message.id)}
                      className="w-full text-left p-2 hover:bg-gray-800 rounded transition-colors"
                    >
                      <div className="flex items-start space-x-2">
                        <div className="flex-shrink-0 mt-1">
                          {message.role === 'user' ? (
                            <User size={14} className="text-blue-400" />
                          ) : (
                            <Bot size={14} className="text-green-400" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-300 truncate">
                            {formatMessagePreview(message.content)}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {filteredMessages.length === 0 && searchQuery && (
            <div className="text-center text-gray-500 py-8">
              <Search size={32} className="mx-auto mb-2 opacity-50" />
              <p>No messages found</p>
              <p className="text-sm">Try different search terms</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
});
