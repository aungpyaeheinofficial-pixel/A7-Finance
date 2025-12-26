import React, { useState, useRef, useEffect } from 'react';
import { Message, Sender, ChatState, ModelProvider } from './types';
import { routeChatRequest } from './services/routerService';
import ChatMessage from './components/ChatMessage';
import ToggleSwitch from './components/ToggleSwitch';

// Icons as SVG components
const AttachmentIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.71-5.71a9 9 0 1 1-9-9" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
    <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
    <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
  </svg>
);

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [deepThinkMode, setDeepThinkMode] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      text: input,
      sender: Sender.USER,
      timestamp: new Date(),
      image: selectedImage || undefined
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);
    
    // Clear image after sending
    const imageToSend = selectedImage;
    clearImage();

    try {
      // Route request based on flags
      const response = await routeChatRequest({
        message: userMsg.text,
        history: messages,
        useComplexModel: deepThinkMode,
        image: imageToSend || undefined
      });

      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        sender: Sender.AI,
        timestamp: new Date(),
        provider: response.provider
      };

      setMessages(prev => [...prev, aiMsg]);

    } catch (error) {
      const errorMsg: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error processing your request.",
        sender: Sender.AI,
        timestamp: new Date(),
        provider: ModelProvider.GEMINI // Fallback
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r border-slate-800 bg-slate-900">
        <div className="p-4 border-b border-slate-800">
          <h1 className="text-xl font-bold text-emerald-500 tracking-tight">
            Myanmar Finance
          </h1>
          <p className="text-xs text-slate-500 mt-1">Hybrid AI Backend</p>
        </div>
        
        <div className="flex-1 p-4">
          <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            System Status
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="w-2 h-2 rounded-full bg-green-500"></span>
              <span>Supabase Vector DB</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span>Groq (Llama 3.3)</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-300">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>Gemini 2.5 Flash</span>
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-slate-800">
             <div className="text-xs text-slate-600">
                Authorized Use Only
             </div>
        </div>
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col relative">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-6">
          <div className="flex items-center gap-2 md:hidden">
             <span className="font-bold text-emerald-500">MF AI</span>
          </div>
          <div className="flex-1 flex justify-end">
            <ToggleSwitch 
              label="Deep Think / Analyze" 
              enabled={deepThinkMode} 
              setEnabled={setDeepThinkMode} 
            />
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 opacity-60">
              <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center mb-4">
                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-emerald-500">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                 </svg>
              </div>
              <p className="text-lg font-medium">Myanmar Finance Assistant</p>
              <p className="text-sm mt-2 max-w-md text-center">
                Ask about exchange rates, CBM policies, or upload financial documents for analysis. 
                Toggle "Deep Think" for complex reasoning using Gemini.
              </p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && (
                <div className="flex w-full justify-start mb-6">
                  <div className="flex items-center gap-2">
                     <span className="text-xs text-slate-500 animate-pulse">
                       {deepThinkMode ? 'Gemini is analyzing...' : 'Groq is processing...'}
                     </span>
                     <div className="flex space-x-1">
                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-75"></div>
                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-150"></div>
                        <div className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce delay-300"></div>
                     </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/80">
          <div className="max-w-3xl mx-auto">
            {/* Image Preview */}
            {selectedImage && (
              <div className="mb-2 flex items-start">
                <div className="relative group">
                  <img src={selectedImage} alt="Preview" className="h-20 w-20 object-cover rounded-lg border border-slate-700" />
                  <button 
                    onClick={clearImage}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                  >
                    <TrashIcon />
                  </button>
                </div>
              </div>
            )}
            
            <div className="flex items-end gap-2 bg-slate-800/50 p-2 rounded-xl border border-slate-700 focus-within:border-emerald-500/50 focus-within:ring-1 focus-within:ring-emerald-500/20 transition-all">
              <input 
                type="file" 
                ref={fileInputRef}
                onChange={handleImageUpload}
                accept="image/*"
                className="hidden"
              />
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="p-3 text-slate-400 hover:text-emerald-400 transition-colors rounded-lg hover:bg-slate-700/50"
                title="Upload Image"
              >
                <AttachmentIcon />
              </button>
              
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about MMK rates, inflation, or regulations..."
                className="flex-1 bg-transparent border-0 focus:ring-0 text-slate-200 placeholder-slate-500 resize-none py-3 max-h-32 min-h-[48px]"
                rows={1}
                style={{ height: 'auto', minHeight: '24px' }}
                onInput={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = target.scrollHeight + 'px';
                }}
              />
              
              <button 
                onClick={handleSend}
                disabled={isLoading || (!input.trim() && !selectedImage)}
                className={`p-3 rounded-xl transition-all duration-200 ${
                  isLoading || (!input.trim() && !selectedImage)
                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20'
                }`}
              >
                <SendIcon />
              </button>
            </div>
            <div className="text-center mt-2">
                <span className="text-[10px] text-slate-600">
                    {deepThinkMode ? 'Complex Mode: Gemini 2.5 Flash' : 'Fast Mode: Llama 3.3 via Groq (Low Latency)'}
                </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}