'use client';

import React, { useState, useRef, useEffect } from 'react';
import { 
  Message, Sender, ModelProvider, MessageType
} from '../types';
import { routeChatRequest } from '../services/routerService';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import QuickActionCards from './components/QuickActionCards';
import ChatInput from './components/ChatInput';

// ============ CHAT MESSAGE COMPONENT ============
function ChatMessage({ message }: { message: Message }) {
  const isUser = message.sender === Sender.USER;
  const isSystem = message.sender === Sender.SYSTEM;

  if (isSystem) {
    return (
      <div className="flex justify-center py-3 animate-fade-in">
        <div className="message-bubble system flex items-center gap-2 px-4 py-2">
          <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
          <span>{message.text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex gap-4 py-4 px-6 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
      {/* Avatar */}
      <div className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${
        isUser ? 'bg-gradient-to-r from-blue-500 to-purple-600' : 'bg-gray-100'
      }`}>
        {isUser ? (
          <span className="text-xs font-semibold text-white">You</span>
        ) : (
          <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
        )}
      </div>

      {/* Message */}
      <div className="flex flex-col gap-2 max-w-2xl">
        {message.image && (
          <img src={message.image} alt="Uploaded" className="max-w-xs rounded-lg border border-gray-200" />
        )}

        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
          isUser 
            ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-br-md' 
            : 'bg-white border border-gray-200 text-gray-700 rounded-bl-md shadow-sm'
        }`}>
          <p className="whitespace-pre-wrap font-myanmar">{message.text}</p>
        </div>

        {!isUser && message.provider && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="px-2 py-0.5 bg-gray-100 rounded-full text-xs">{message.provider}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ============ MAIN COMPONENT ============
export default function Home() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deepThinkMode, setDeepThinkMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState('chat');
  const [imageFile, setImageFile] = useState<File | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleImageSelect = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setSelectedImage(reader.result as string);
    reader.readAsDataURL(file);
  };

  const handleImageClear = () => {
    setSelectedImage(null);
    setImageFile(null);
  };

  const handleCardClick = (text: string) => {
    setInput(text);
    // Auto-focus input after a brief delay
    setTimeout(() => {
      const textarea = document.querySelector('textarea');
      textarea?.focus();
    }, 100);
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: Sender.USER,
      timestamp: new Date(),
      image: selectedImage || undefined,
      type: MessageType.TEXT
    };

    setMessages(prev => [...prev, userMsg]);
    const messageText = input;
    setInput('');
    setIsLoading(true);
    
    const imageToSend = selectedImage;
    handleImageClear();

    try {
      const response = await routeChatRequest({
        message: messageText,
        history: messages,
        useComplexModel: deepThinkMode,
        image: imageToSend || undefined
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: Sender.AI,
        timestamp: new Date(),
        provider: response.provider,
        type: MessageType.TEXT,
        analysisResult: response.analysisResult,
        citations: response.citations
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "စနစ်တွင် ပြဿနာတစ်ခု ဖြစ်ပေါ်နေပါသည်။ ထပ်မံကြိုးစားပါ။",
        sender: Sender.AI,
        timestamp: new Date(),
        provider: ModelProvider.SYSTEM,
        type: MessageType.ERROR
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar activeSection={activeSection} onNavigate={setActiveSection} />

      <main className="flex flex-col flex-1 md:ml-[180px] min-h-screen">
        <Header 
          deepThinkMode={deepThinkMode} 
          onToggleDeepThink={() => setDeepThinkMode(!deepThinkMode)} 
        />

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto pb-32">
          {messages.length === 0 ? (
            <div>
              <HeroSection />
              <QuickActionCards onCardClick={handleCardClick} />
            </div>
          ) : (
            <div className="max-w-4xl mx-auto">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              
              {isLoading && (
                <div className="flex gap-4 py-4 px-6 animate-fade-in">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <svg className="w-5 h-5 text-gray-600 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                  <div className="flex items-center gap-3 px-4 py-3 bg-white rounded-2xl border border-gray-200 shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 rounded-full bg-blue-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {deepThinkMode ? 'Analyzing with Gemini...' : 'Processing with Groq...'}
                    </span>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Section - Fixed at bottom */}
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          isLoading={isLoading}
          selectedImage={selectedImage}
          onImageSelect={handleImageSelect}
          onImageClear={handleImageClear}
          deepThinkMode={deepThinkMode}
        />
      </main>
    </div>
  );
}
