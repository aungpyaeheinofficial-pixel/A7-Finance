'use client';

import React from 'react';
import { Brain } from 'lucide-react';

interface HeaderProps {
  deepThinkMode: boolean;
  onToggleDeepThink: () => void;
}

export default function Header({ deepThinkMode, onToggleDeepThink }: HeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-4 md:px-8 py-4">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Left: Title */}
        <div>
          <h1 className="text-2xl font-bold font-myanmar text-gray-900">
            AI စီးပွားရေး: အကြံပေး
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Myanmar Finance AI Business Advisor
          </p>
        </div>

        {/* Right: Status Indicators */}
        <div className="flex flex-wrap items-center gap-4 md:gap-6">
          {/* Status Dots */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Groq</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Gemini</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500"></div>
              <span className="text-sm text-gray-600">Vector DB</span>
            </div>
          </div>

          {/* Deep Think Toggle */}
          <div className="flex items-center gap-3 pl-6 border-l border-gray-200">
            <Brain className="w-5 h-5 text-gray-400" />
            <span className="text-sm text-gray-600 font-myanmar">Deep Think</span>
            <button
              onClick={onToggleDeepThink}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                deepThinkMode ? 'bg-blue-500' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  deepThinkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}

