
import React, { useState, useEffect, useCallback } from 'react';
import { Message, View } from './types';
import Studio from './components/Studio';
import { Discovery, Marketplace, Wallet, Governance } from './components/OtherViews';
import VideoForge from './components/VideoForge';
import DemoControls from './components/DemoControls';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.Studio);
  const [isDemoMode, setIsDemoMode] = useState(true);
  const [messages, setMessages] = useState<Message[]>([
    { 
      id: '1', 
      user: 'Amalgam AI', 
      text: 'Neural Sandbox v1.0.4 Initialized. All simulation nodes ready for ingest.', 
      timestamp: new Date(), 
      isAI: true, 
      status: 'system' 
    }
  ]);

  const handleSendMessage = useCallback((text: string, user: string = 'You', isAI: boolean = false, status: Message['status'] = 'normal') => {
    const newMessage: Message = { 
      id: Math.random().toString(36).substr(2, 9), 
      user, 
      text, 
      timestamp: new Date(),
      isAI,
      status
    };
    setMessages(prev => [...prev, newMessage]);
  }, []);

  useEffect(() => {
    let interval: any;
    if (isDemoMode) {
      interval = setInterval(() => {
        const fakeUsers = ['ByteMaster', 'PixelPioneer', 'NovaStream', 'QuantumCoder', 'CyberCat'];
        const fakeTexts = [
          "This demo is incredibly smooth!", "The AI vision is seeing my desk perfectly.", 
          "LFG 🚀", "How do I trigger the viral moment?", "WASM production is the future."
        ];
        const user = fakeUsers[Math.floor(Math.random() * fakeUsers.length)];
        const text = fakeTexts[Math.floor(Math.random() * fakeTexts.length)];
        handleSendMessage(text, user);
      }, 15000); 
    }
    return () => clearInterval(interval);
  }, [isDemoMode, handleSendMessage]);

  return (
    <div className="flex h-screen overflow-hidden text-slate-200 bg-base-950 font-sans">
      {/* Background Orbs */}
      <div className="gradient-blur w-[600px] h-[600px] bg-brand-600 top-[-200px] left-[-200px]"></div>
      <div className="gradient-blur w-[500px] h-[500px] bg-purple-600 bottom-[-200px] right-[-200px] opacity-10"></div>

      {/* Sidebar Navigation */}
      <nav className="w-20 md:w-24 border-r border-white/5 flex flex-col items-center py-8 space-y-10 shrink-0 bg-base-900/50 backdrop-blur-xl z-10">
        <div 
          className="w-12 h-12 md:w-14 md:h-14 bg-brand-600 rounded-2xl flex items-center justify-center cursor-pointer shadow-2xl shadow-brand-900/40 hover:scale-105 active:scale-95 transition-all"
          onClick={() => setCurrentView(View.Studio)}
        >
          <span className="text-2xl md:text-3xl font-black text-white italic tracking-tighter">A</span>
        </div>
        
        <div className="flex flex-col space-y-6 md:space-y-8 flex-1">
          <NavItem active={currentView === View.Discovery} onClick={() => setCurrentView(View.Discovery)} icon="🔍" label="Discover" />
          <NavItem active={currentView === View.Studio} onClick={() => setCurrentView(View.Studio)} icon="🎥" label="Studio" />
          <NavItem active={currentView === View.VideoForge} onClick={() => setCurrentView(View.VideoForge)} icon="🎞️" label="Forge" />
          <NavItem active={currentView === View.Marketplace} onClick={() => setCurrentView(View.Marketplace)} icon="📦" label="Market" />
          <NavItem active={currentView === View.Wallet} onClick={() => setCurrentView(View.Wallet)} icon="💳" label="Wallet" />
          <NavItem active={currentView === View.Governance} onClick={() => setCurrentView(View.Governance)} icon="🏛️" label="Gov" />
        </div>

        <div className="flex flex-col items-center gap-6">
          <button 
            onClick={() => setIsDemoMode(!isDemoMode)} 
            className={`p-3 md:p-4 rounded-2xl transition-all ${isDemoMode ? 'bg-brand-500/20 text-brand-400 border border-brand-500/30' : 'bg-white/5 text-slate-500 hover:text-white'}`}
            title="Toggle Neural Sandbox"
          >
            <span className="text-xl">🛠️</span>
          </button>
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-slate-800 border-2 border-white/5 overflow-hidden hover:border-brand-500 transition-all cursor-pointer">
            <img src="https://picsum.photos/seed/creator/100" alt="Profile" className="w-full h-full object-cover" />
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {currentView === View.Studio ? (
          <Studio messages={messages} onSendMessage={handleSendMessage} onSystemMessage={handleSendMessage} />
        ) : (
          <div className="flex-1 overflow-y-auto">
            {currentView === View.Discovery && <Discovery />}
            {currentView === View.VideoForge && <VideoForge />}
            {currentView === View.Marketplace && <Marketplace />}
            {currentView === View.Wallet && <Wallet />}
            {currentView === View.Governance && <Governance />}
          </div>
        )}
        
        {isDemoMode && <DemoControls onTriggerEvent={handleSendMessage} />}
      </main>
    </div>
  );
};

interface NavItemProps {
  icon: string;
  active?: boolean;
  onClick: () => void;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ icon, active, onClick, label }) => (
  <button 
    onClick={onClick} 
    className={`flex flex-col items-center gap-1.5 group transition-all ${active ? 'text-brand-500' : 'text-slate-500 hover:text-slate-300'}`}
  >
    <div className={`w-12 h-12 md:w-14 md:h-14 flex items-center justify-center rounded-2xl transition-all ${active ? 'bg-brand-600/10 border border-brand-600/20 shadow-lg shadow-brand-900/10' : 'group-hover:bg-white/5 border border-transparent'}`}>
      <span className="text-xl md:text-2xl">{icon}</span>
    </div>
    <span className={`text-[10px] font-bold uppercase tracking-widest transition-opacity ${active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
      {label}
    </span>
  </button>
);

export default App;
