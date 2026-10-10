
import React from 'react';
import { Message } from '../types';
import LiveStream from './LiveStream';
import Chat from './Chat';
import Dashboard from './Dashboard';

interface StudioProps {
  messages: Message[];
  onSendMessage: (text: string, user?: string, isAI?: boolean, status?: Message['status']) => void;
  onSystemMessage: (text: string, user?: string, isAI?: boolean, status?: Message['status']) => void;
}

const Studio: React.FC<StudioProps> = ({ messages, onSendMessage, onSystemMessage }) => {
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Studio Workspace */}
      <div className="flex-1 overflow-y-auto custom-scrollbar bg-gradient-to-b from-transparent to-base-950">
        <div className="max-w-[1200px] mx-auto p-4 md:p-8 space-y-8">
          {/* Header */}
          <header className="flex items-center justify-between pb-4 border-b border-white/5">
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
                <span className="w-3 h-3 bg-slate-500 rounded-full"></span>
                PRODUCTION STUDIO
              </h2>
              <p className="text-slate-500 text-sm font-medium">Local preview and creator controls • <span className="text-brand-400 font-bold uppercase tracking-widest text-[10px]">Broadcast status appears below preview</span></p>
            </div>
            <div className="flex gap-3">
              <button className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                Project Settings
              </button>

            </div>
          </header>

          <LiveStream />
          <Dashboard chatLog={messages} />
        </div>
      </div>

      {/* Real-time Interaction Column */}
      <Chat 
        messages={messages} 
        onSendMessage={(txt) => onSendMessage(txt)} 
        onSystemMessage={(txt, user, isAI, status) => onSystemMessage(txt, user, isAI, status)} 
      />
    </div>
  );
};

export default Studio;
