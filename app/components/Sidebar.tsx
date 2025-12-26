'use client';

import React from 'react';
import { 
  Sparkles, 
  MessageCircle, 
  FileText, 
  Book, 
  Database, 
  Settings 
} from 'lucide-react';

interface SidebarProps {
  activeSection: string;
  onNavigate: (section: string) => void;
}

export default function Sidebar({ activeSection, onNavigate }: SidebarProps) {
  const buildItems = [
    { id: 'advisor', label: 'အကြံဉာဏ်', icon: Sparkles },
    { id: 'chat', label: 'အကြံပေး', icon: MessageCircle },
    { id: 'portfolio', label: 'ရင်းနှီးမြှုပ်', icon: FileText },
    { id: 'library', label: 'စာကြည့်တိုက်', icon: Book },
  ];

  const manageItems = [
    { id: 'admin', label: 'စီမံခန့်ခွဲ', icon: Database },
    { id: 'settings', label: 'ဆက်တင်', icon: Settings },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-[180px] bg-white border-r border-gray-200 flex flex-col z-50 hidden md:flex">
      {/* Logo Section */}
      <div className="px-4 py-6 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="font-bold text-gray-900 text-sm leading-tight">Myanmar Finance</h1>
            <p className="text-xs text-gray-500 leading-tight">AI Business Advisor</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 py-4">
        {/* BUILD Section */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider px-3 mb-2 font-medium">
            Build
          </div>
          {buildItems.map(item => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-myanmar transition-all duration-200 mb-1 ${
                activeSection === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>

        {/* MANAGE Section */}
        <div className="mb-4">
          <div className="text-xs text-gray-400 uppercase tracking-wider px-3 mb-2 font-medium">
            Manage
          </div>
          {manageItems.map(item => (
            <button
              key={item.id}
              onClick={() => item.id === 'admin' ? window.location.href = '/admin' : onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-myanmar transition-all duration-200 mb-1 ${
                activeSection === item.id
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="truncate">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      {/* Footer Status */}
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 flex-shrink-0"></div>
          <span className="text-xs text-gray-500">All systems operational</span>
        </div>
      </div>
    </aside>
  );
}

