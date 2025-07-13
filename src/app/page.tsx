'use client';

import React, { useState, useRef } from 'react';
import { Search, MessageCircle, FileText, CheckSquare, Folder, Clock, Plus, Settings, Trash2, Navigation, Download, Upload, MoreVertical } from 'lucide-react';
import { ChatProvider, useChat } from '@/hooks/useChat';
import { Chat } from '@/types';
import { ChatMessages } from '@/components/ChatMessages';
import { ChatInput } from '@/components/ChatInput';
import { ModelSelector } from '@/components/ModelSelector';
import { SettingsModal } from '@/components/SettingsModal';
import { ChatNavigator } from '@/components/ChatNavigator';
import { exportChats, importChats, exportChatAsMarkdown } from '@/lib/export';
import { DEFAULT_MODEL } from '@/lib/models';

function ChatInterface() {
  const { chats, currentChat, createChat, selectChat, deleteChat } = useChat();
  const [selectedModel, setSelectedModel] = useState(DEFAULT_MODEL);
  const [showSettings, setShowSettings] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showChatMenu, setShowChatMenu] = useState<string | null>(null);
  const importFileRef = useRef<HTMLInputElement>(null);

  const sidebarItems = [
    { icon: Search, label: "Search", shortcut: "Ctrl+K" },
    { icon: MessageCircle, label: "Chat", active: true },
    { icon: FileText, label: "Files" },
    { icon: CheckSquare, label: "Tasks" },
    { icon: Folder, label: "Projects" },
    { icon: Clock, label: "History" }
  ];

  const handleNewChat = () => {
    createChat('New Chat', selectedModel);
  };

  const handleExportChats = () => {
    exportChats(chats);
  };

  const handleImportChats = () => {
    importFileRef.current?.click();
  };

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedChats = await importChats(file);
      // TODO: Add imported chats to current chats (merge or replace)
      console.log('Imported chats:', importedChats);
      alert(`Successfully imported ${importedChats.length} chats!`);
    } catch (error) {
      alert('Failed to import chats. Please check the file format.');
    }

    // Reset file input
    if (importFileRef.current) {
      importFileRef.current.value = '';
    }
  };

  const handleExportChatAsMarkdown = (chat: Chat) => {
    exportChatAsMarkdown(chat);
    setShowChatMenu(null);
  };

  const formatChatDate = (date: Date) => {
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  };

  // Group chats by date
  const groupedChats = chats.reduce((acc, chat) => {
    const dateKey = formatChatDate(chat.updatedAt);
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(chat);
    return acc;
  }, {} as Record<string, typeof chats>);

  return (
    <div className="flex h-screen bg-neutral-950 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <div className="w-4 h-4 bg-gray-900 rounded-full"></div>
              </div>
              <span className="text-xl font-semibold">R1</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleExportChats}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Export All Chats"
                disabled={chats.length === 0}
              >
                <Download size={16} />
              </button>
              <button
                onClick={handleImportChats}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Import Chats"
              >
                <Upload size={16} />
              </button>
              <button
                onClick={handleNewChat}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="New Chat"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>
          {/* Hidden file input for import */}
          <input
            type="file"
            ref={importFileRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
          />
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-1 flex flex-col">
          {/* Navigation items */}
          <div className="space-y-1.5 pb-4">
            {sidebarItems.map((item, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 p-2 rounded-md cursor-pointer transition-colors ${
                  item.active
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                }`}
              >
                <item.icon size={18} />
                <span className="flex-1 text-base">{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-gray-500">{item.shortcut}</span>
                )}
              </div>
            ))}
          </div>

          {/* Chat History */}
          <div className="flex-1 overflow-y-auto">
            <div className="space-y-2 text-sm">
              {Object.entries(groupedChats).map(([dateKey, dateChats]) => (
                <div key={dateKey}>
                  <div className="font-medium text-gray-400 mb-2 px-2">{dateKey}</div>
                  {dateChats.map((chat) => (
                    <div
                      key={chat.id}
                      className={`flex items-center group p-2 hover:bg-gray-700 rounded cursor-pointer transition-colors relative ${
                        currentChat?.id === chat.id ? 'bg-gray-700' : ''
                      }`}
                      onClick={() => selectChat(chat.id)}
                    >
                      <div className="flex-1 truncate">
                        <div className="text-gray-300 truncate">
                          {chat.title}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {chat.messages.length} messages • {chat.model}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowChatMenu(showChatMenu === chat.id ? null : chat.id);
                          }}
                          className="p-1 hover:bg-gray-600 rounded transition-all"
                        >
                          <MoreVertical size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteChat(chat.id);
                          }}
                          className="p-1 hover:bg-gray-600 rounded transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>

                      {/* Chat Context Menu */}
                      {showChatMenu === chat.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={() => setShowChatMenu(null)}
                          />
                          <div className="absolute right-0 top-8 z-20 bg-gray-800 border border-gray-700 rounded-lg shadow-lg py-1 min-w-48">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportChatAsMarkdown(chat);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                            >
                              <Download size={14} />
                              <span>Export as Markdown</span>
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // TODO: Implement duplicate chat
                                setShowChatMenu(null);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-gray-700 transition-colors flex items-center space-x-2"
                            >
                              <FileText size={14} />
                              <span>Duplicate Chat</span>
                            </button>
                            <hr className="border-gray-700 my-1" />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteChat(chat.id);
                                setShowChatMenu(null);
                              }}
                              className="w-full text-left px-3 py-2 hover:bg-red-600 transition-colors flex items-center space-x-2 text-red-400"
                            >
                              <Trash2 size={14} />
                              <span>Delete Chat</span>
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              ))}
              
              {chats.length === 0 && (
                <div className="text-gray-500 text-center p-4">
                  No conversations yet.
                  <br />
                  Start a new chat!
                </div>
              )}
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-800 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-lg font-semibold">
                {currentChat?.title || 'R1 Assistant'}
              </h1>
              {currentChat && (
                <span className="text-sm text-gray-400">
                  {currentChat.messages.length} messages
                </span>
              )}
            </div>
            <div className="flex items-center space-x-3">
              <ModelSelector
                selectedModel={selectedModel}
                onModelChange={setSelectedModel}
              />
              <button
                onClick={() => setShowNavigator(true)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Chat Navigator"
                disabled={!currentChat || currentChat.messages.length === 0}
              >
                <Navigation size={18} />
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
                title="Settings"
              >
                <Settings size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ChatMessages />

        {/* Chat Input */}
        <ChatInput onOpenSettings={() => setShowSettings(true)} />

        {/* Settings Modal */}
        <SettingsModal
          isOpen={showSettings}
          onClose={() => setShowSettings(false)}
        />

        {/* Chat Navigator */}
        <ChatNavigator
          isOpen={showNavigator}
          onClose={() => setShowNavigator(false)}
        />
      </div>
    </div>
  );
}

export default function Home() {
  return <ChatInterface />;
}