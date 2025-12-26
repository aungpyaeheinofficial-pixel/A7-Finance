'use client';

import React, { useRef, useEffect } from 'react';
import { Paperclip, Send } from 'lucide-react';

interface ChatInputProps {
  input: string;
  setInput: (value: string) => void;
  onSend: () => void;
  isLoading: boolean;
  selectedImage: string | null;
  onImageSelect: (file: File) => void;
  onImageClear: () => void;
  deepThinkMode: boolean;
}

export default function ChatInput({
  input,
  setInput,
  onSend,
  isLoading,
  selectedImage,
  onImageSelect,
  onImageClear,
  deepThinkMode,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [input]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onImageSelect(file);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 md:left-[180px] right-0 bg-white border-t border-gray-200 px-4 md:px-8 py-4 z-40">
      {/* System Status - Left aligned */}
      <div className="absolute left-8 top-3">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500"></div>
          <span className="text-xs text-green-600">All systems operational</span>
        </div>
      </div>

      {/* Mode Indicator - Centered */}
      <div className="text-center mb-2">
        <span className="text-xs text-gray-500">
          {deepThinkMode 
            ? '✨ Deep Analysis: Gemini → Logic Engine → Groq' 
            : '⚡ Fast Mode: RAG → Groq (Low Latency)'}
        </span>
      </div>

      {/* Image Preview */}
      {selectedImage && (
        <div className="mb-3 flex items-start">
          <div className="relative group">
            <img 
              src={selectedImage} 
              alt="Preview" 
              className="h-16 w-16 object-cover rounded-lg border border-gray-200" 
            />
            <button 
              onClick={onImageClear}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors"
            >
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Input Container */}
      <div className="flex items-end gap-3 bg-white border border-gray-200 rounded-xl px-4 py-3 focus-within:border-blue-300 focus-within:shadow-sm transition-all">
        {/* File Upload */}
        <input 
          type="file" 
          ref={fileInputRef}
          onChange={handleImageUpload}
          accept="image/*"
          className="hidden"
        />
        <button 
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          title="Upload Image"
        >
          <Paperclip className="w-5 h-5" />
        </button>
        
        {/* Text Input */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="မေးခွန်းရိုက်ထည့်ပါ... (MMK rates, profit analysis, regulations...)"
          className="flex-1 bg-transparent border-0 focus:ring-0 text-gray-700 placeholder-gray-400 resize-none py-1 font-myanmar text-sm leading-relaxed"
          rows={1}
          style={{ minHeight: '24px', maxHeight: '120px' }}
        />
        
        {/* Send Button */}
        <button 
          onClick={onSend}
          disabled={isLoading || (!input.trim() && !selectedImage)}
          className={`flex items-center gap-2 rounded-lg px-5 py-2 font-medium text-white transition-all duration-200 ${
            isLoading || (!input.trim() && !selectedImage)
              ? 'bg-gray-300 cursor-not-allowed opacity-50'
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:opacity-90 shadow-sm'
          }`}
        >
          <Send className="w-4 h-4" />
          <span className="text-sm">Send</span>
        </button>
      </div>
    </div>
  );
}

