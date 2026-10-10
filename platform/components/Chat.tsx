import React, { useState, useEffect, useRef } from 'react';
import { Message } from '../types';
import { moderateMessage } from '../services/geminiService';

interface ChatProps {
  messages: Message[];
  onSendMessage: (text: string) => void;
  onSystemMessage: (text: string, user?: string, isAI?: boolean, status?: Message['status']) => void;
}

const Chat: React.FC<ChatProps> = ({ messages, onSendMessage, onSystemMessage }) => {
  const [inputText, setInputText] = useState('');
  const [isModerating, setIsModerating] = useState(false);
  const [modCooldown, setModCooldown] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  useEffect(() => {
    if (modCooldown > 0) {
      const timer = setInterval(() => setModCooldown(prev => Math.max(0, prev - 1)), 1000);
      return () => clearInterval(timer);
    }
  }, [modCooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isModerating) return;

    const currentText = inputText;
    setInputText('');
    onSendMessage(currentText);

    // Only moderate if not in cooldown
    if (modCooldown === 0) {
      setIsModerating(true);
      const modResult = await moderateMessage(currentText);
      
      if (modResult.errorType === 'quota') {
        setModCooldown(120); // 2 minute cooldown for chat AI
        onSystemMessage("AI Moderation Node saturated. Switching to basic filter...", 'Amalgam AI', true, 'system');
      } else if (!modResult.isSafe) {
        onSystemMessage(`Message flagged: ${modResult.reason}`, 'Amalgam AI', true, 'flagged');
      } else if (modResult.autoResponse) {
        setTimeout(() => {
          onSystemMessage(modResult.autoResponse!, 'Amalgam AI', true, 'normal');
        }, 1000);
      }
      setIsModerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-base-900 border-l border-white/5 w-80 lg:w-96 shrink-0 z-20">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <div>
          <h3 className="font-black text-sm tracking-tighter text-white">INTELLIGENT FEED</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Ingest</p>
        </div>
        <div className="flex items-center gap-2 bg-brand-500/10 px-3 py-1 rounded-full border border-brand-500/20 shadow-inner shadow-brand-500/5">
          <div className={`w-1.5 h-1.5 rounded-full ${modCooldown > 0 ? 'bg-amber-500' : 'bg-brand-500 animate-pulse'}`}></div>
          <span className={`text-[9px] ${modCooldown > 0 ? 'text-amber-500' : 'text-brand-400'} font-black uppercase tracking-widest`}>
            {modCooldown > 0 ? `MOD COOLDOWN ${modCooldown}s` : 'Active Insight'}
          </span>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {messages.map((msg) => (
          <div key={msg.id} className={`group animate-in fade-in slide-in-from-bottom-2 duration-300 ${msg.status === 'flagged' ? 'opacity-30' : ''}`}>
             <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`text-[11px] font-black tracking-tight ${msg.isAI ? 'text-brand-400' : 'text-slate-400'}`}>
                    {msg.user}
                    {msg.isAI && <span className="ml-1 text-[8px] bg-brand-600/20 text-brand-400 border border-brand-500/30 px-1 rounded uppercase">OS</span>}
                  </span>
                </div>
                <span className="text-[9px] text-slate-600 font-mono">
                  {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              <div className={`p-3 rounded-2xl text-sm leading-relaxed border transition-all ${
                msg.isAI 
                  ? 'bg-brand-600/5 border-brand-500/10 text-slate-200' 
                  : msg.status === 'flagged' 
                    ? 'bg-red-500/5 border-red-500/10 text-slate-500 line-through' 
                    : 'bg-white/5 border-white/5 text-slate-300'
              }`}>
                {msg.text}
              </div>
          </div>
        ))}
      </div>

      <div className="p-6 bg-base-900 border-t border-white/5 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
        <form onSubmit={handleSubmit} className="relative group">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={isModerating ? "Analyzing context..." : "Send a message..."}
            className="w-full bg-base-950 border border-white/10 rounded-2xl pl-5 pr-12 py-4 text-sm focus:outline-none focus:border-brand-600 focus:ring-1 focus:ring-brand-600/30 transition-all placeholder:text-slate-600"
            disabled={isModerating}
          />
          <button 
            type="submit"
            className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-brand-500 hover:text-brand-400 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/></svg>
          </button>
        </form>
        <p className="text-[9px] text-slate-600 text-center mt-3 font-medium tracking-widest uppercase">
          {modCooldown > 0 ? "AI Node cooling down..." : "Messages moderated by Gemini"}
        </p>
      </div>
    </div>
  );
};

export default Chat;