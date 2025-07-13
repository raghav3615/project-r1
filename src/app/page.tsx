'use client';

import React, { useState } from 'react';
import { Search, MessageCircle, FileText, CheckSquare, Folder, Clock, ChevronDown, Calendar, Plus, ArrowUp, User } from 'lucide-react';

const R1UI = () => {
  const [selectedModel, setSelectedModel] = useState('R1');
  const [searchQuery, setSearchQuery] = useState('');

  const historyItems = [
    { title: "Growing Your Presence on X", date: "Yesterday" },
    { title: "Swachh Bharat Mission Overview", date: "April" },
    { title: "Gamifying Wikipedia Editor Community", date: "April" },
    { title: "Gamifying Wikipedia Editor Community", date: "April" },
    { title: "Gamifying Wikipedia Editor Community", date: "April" },
    { title: "Raghav Dadlhich: Engineer, Entrepreneur", date: "May" },
    { title: "Stalkl: Time-Tracking Browser Extension", date: "May" },
    { title: "Caffeine: How Much is Too Much?", date: "May" }
  ];

  const sidebarItems = [
    { icon: Search, label: "Search", shortcut: "Ctrl+K" },
    { icon: MessageCircle, label: "Chat", active: true },
    { icon: FileText, label: "Files" },
    { icon: CheckSquare, label: "Tasks" },
    { icon: Folder, label: "Projects" },
    { icon: Clock, label: "History" }
  ];

  return (
    <div className="flex h-screen bg-neutral-950 text-white">
      {/* Sidebar */}
      <div className="w-64 bg-neutral-950 border-r border-neutral-800 flex flex-col">
        {/* Logo */}
        <div className="p-4 border-b border-gray-700">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
              <div className="w-4 h-4 bg-gray-900 rounded-full"></div>
            </div>
            <span className="text-xl font-semibold">R1</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-1 ">
          {/* Make sidebar items section bigger */}
          <div className="flex-1 space-y-1.5 pb-2">
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

          {/* Make history section smaller */}
          <div className="mb-4">
            <div className="space-y-0.5 text-sm">
              <div className="font-medium text-gray-400 mb-2">Yesterday</div>
              <div className="text-gray-300 p-1.5 hover:bg-gray-700 rounded cursor-pointer truncate">
                Growing Your Presence on X
              </div>
              
              <div className="font-medium text-gray-400 mb-2 mt-4">April</div>
              <div className="text-gray-300 p-1.5 hover:bg-gray-700 rounded cursor-pointer truncate">
                Swachh Bharat Mission Overview
              </div>
              <div className="text-gray-300 p-1.5 hover:bg-gray-700 rounded cursor-pointer truncate">
                Gamifying Wikipedia Editor Community
              </div>
              <div className="text-gray-300 p-1.5 hover:bg-gray-700 rounded cursor-pointer truncate">
                Gamifying Wikipedia Editor Community
              </div>
              <div className="text-gray-300 p-1.5 hover:bg-gray-700 rounded cursor-pointer truncate">
                Gamifying Wikipedia Editor Community
              </div>
              
              <div className="font-medium text-gray-400 mb-2 mt-4">May</div>
              <div className="text-gray-300 p-1.5 hover:bg-gray-700 rounded cursor-pointer truncate">
                Raghav Dadlhich: Engineer, Entrepreneur
              </div>
              <div className="text-gray-300 p-1.5 hover:bg-gray-700 rounded cursor-pointer truncate">
                Stalkl: Time-Tracking Browser Extension
              </div>
              <div className="text-gray-300 p-1.5 hover:bg-gray-700 rounded cursor-pointer truncate">
                Caffeine: How Much is Too Much?
              </div>
              
              <div className="text-blue-400 p-1.5 hover:bg-gray-700 rounded cursor-pointer mt-3">
                See all
              </div>
            </div>
          </div>
        </nav>

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          {/* Grok Logo */}
          <div className="mb-12">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <div className="w-6 h-6 bg-gray-900 rounded-full"></div>
              </div>
              <span className="text-4xl font-bold">R1</span>
            </div>
          </div>

          {/* Search Container */}
          <div className="w-full max-w-2xl">
            <div className="relative bg-gray-950 rounded-xl border border-gray-700 p-4">
              <div className="flex items-center space-x-4">
                <div className="flex-1">
                  <input
                    type="text"
                    placeholder="What do you want to know?"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent text-white placeholder-gray-400 focus:outline-none text-lg"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Plus size={20} className="text-gray-400" />
                  </button>
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <Search size={20} className="text-gray-400" />
                  </button>
                </div>
              </div>
              
              {/* Bottom row */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                    <Search size={16} />
                    <span className="text-sm">DeepSearch</span>
                    <ChevronDown size={14} />
                  </button>
                  <button className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors">
                    <MessageCircle size={16} />
                    <span className="text-sm">Think</span>
                  </button>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2 text-gray-400">
                    <span className="text-sm">{selectedModel}</span>
                    <ChevronDown size={14} />
                  </div>
                  <button className="p-2 hover:bg-gray-700 rounded-lg transition-colors">
                    <ArrowUp size={16} className="text-gray-400" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Actions */}
          <div className="mt-8 flex items-center space-x-4">
            <button className="flex items-center space-x-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">
              <Calendar size={16} />
              <span className="text-sm">Receive a Weekly Sports Update</span>
              <ChevronDown size={14} />
            </button>
            <button className="flex items-center space-x-2 px-4 py-2 border border-gray-700 hover:bg-gray-800 rounded-lg transition-colors">
              <CheckSquare size={16} />
              <span className="text-sm">Schedule Task</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default R1UI;