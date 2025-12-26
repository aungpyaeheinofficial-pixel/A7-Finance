import React from 'react';
import { Message, Sender, ModelProvider } from '../types';

interface ChatMessageProps {
  message: Message;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isAi = message.sender === Sender.AI;

  return (
    <div className={`flex w-full ${isAi ? 'justify-start' : 'justify-end'} mb-6`}>
      <div className={`flex max-w-[85%] md:max-w-[70%] flex-col ${isAi ? 'items-start' : 'items-end'}`}>
        
        {/* Metadata Label */}
        <div className="flex items-center gap-2 mb-1 px-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {isAi ? (message.provider || 'AI Assistant') : 'You'}
          </span>
          {isAi && message.provider === ModelProvider.GEMINI && (
            <span className="text-[10px] bg-blue-900/50 text-blue-300 px-1.5 py-0.5 rounded border border-blue-800">
              Deep Analysis
            </span>
          )}
          {isAi && message.provider === ModelProvider.GROQ && (
            <span className="text-[10px] bg-orange-900/50 text-orange-300 px-1.5 py-0.5 rounded border border-orange-800">
              Llama 3.3
            </span>
          )}
        </div>

        {/* Bubble */}
        <div
          className={`relative p-4 rounded-2xl text-sm md:text-base leading-relaxed shadow-lg ${
            isAi
              ? 'bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700'
              : 'bg-emerald-700 text-white rounded-tr-none'
          }`}
        >
          {/* Render Image if present */}
          {message.image && (
            <div className="mb-3">
              <img 
                src={message.image} 
                alt="Uploaded content" 
                className="max-h-64 rounded-lg border border-white/20"
              />
            </div>
          )}
          
          <div className="whitespace-pre-wrap">{message.text}</div>
        </div>

        {/* Timestamp */}
        <span className="text-[10px] text-slate-500 mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>
    </div>
  );
};

export default ChatMessage;