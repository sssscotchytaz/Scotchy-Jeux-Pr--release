import React, { useState, useRef, useEffect } from 'react';
import { Game } from '../types';
import { askLibraryAssistant } from '../services/geminiService';

interface AssistantModalProps {
  games: Game[];
  onClose: () => void;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
}

const AssistantModal: React.FC<AssistantModalProps> = ({ games, onClose }) => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', text: "Salut ! Je suis l'assistant virtuel. Une question sur les jeux faits en stream ?" }
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!query.trim() || isThinking) return;

    const userText = query;
    setQuery('');
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setIsThinking(true);

    const response = await askLibraryAssistant(userText, games);
    
    setMessages(prev => [...prev, { role: 'ai', text: response }]);
    setIsThinking(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSend();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex justify-end items-end sm:items-center sm:justify-center p-4">
      <div className="bg-slate-800 w-full max-w-md sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-600 flex flex-col h-[500px] sm:h-[600px] overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-violet-600 to-indigo-600 p-4 flex justify-between items-center text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center backdrop-blur">
              <i className="fas fa-robot text-white"></i>
            </div>
            <h3 className="font-bold">Assistant Stream</h3>
          </div>
          <button onClick={onClose} className="hover:text-slate-200 transition-colors">
            <i className="fas fa-chevron-down"></i>
          </button>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50" ref={scrollRef}>
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                  msg.role === 'user' 
                    ? 'bg-violet-600 text-white rounded-br-none' 
                    : 'bg-slate-700 text-slate-200 rounded-bl-none'
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-slate-700 p-3 rounded-2xl rounded-bl-none flex gap-1 items-center">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200"></div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="p-4 bg-slate-800 border-t border-slate-700">
          <div className="flex gap-2">
            <input 
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pose ta question..."
              className="flex-1 bg-slate-900 border border-slate-600 rounded-full px-4 py-2 text-white focus:ring-2 focus:ring-violet-500 outline-none"
            />
            <button 
              onClick={handleSend}
              disabled={!query.trim() || isThinking}
              className="w-10 h-10 rounded-full bg-violet-600 hover:bg-violet-500 flex items-center justify-center text-white disabled:opacity-50 transition-all"
            >
              <i className="fas fa-paper-plane"></i>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AssistantModal;