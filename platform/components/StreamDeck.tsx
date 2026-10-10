
import React from 'react';

interface StreamDeckProps {
  onClose: () => void;
  onAction: (action: string) => void;
}

const ACTION_GROUPS = [
  {
    title: 'Production Scenes',
    actions: [
      { id: 'scene-main', label: 'Main', icon: '🖼️', color: 'bg-brand-600' },
      { id: 'scene-game', label: 'Game', icon: '🎮', color: 'bg-brand-600' },
      { id: 'scene-chat', label: 'Chat', icon: '💬', color: 'bg-brand-600' },
      { id: 'scene-brb', label: 'BRB', icon: '☕', color: 'bg-amber-600' },
    ]
  },
  {
    title: 'AI Intelligence',
    actions: [
      { id: 'ai-vision', label: 'Vision', icon: '👁️', color: 'bg-purple-600' },
      { id: 'ai-voice', label: 'TTS', icon: '🗣️', color: 'bg-purple-600' },
      { id: 'ai-pulse', label: 'Pulse', icon: '💓', color: 'bg-purple-600' },
      { id: 'ai-clip', label: 'Clip', icon: '🎞️', color: 'bg-purple-600' },
    ]
  },
  {
    title: 'Overlays',
    actions: [
      { id: 'ov-hype', label: 'Hype', icon: '🔥', color: 'bg-brand-400' },
      { id: 'ov-subs', label: 'Subs', icon: '⭐', color: 'bg-brand-400' },
      { id: 'ov-chat', label: 'Feed', icon: '📜', color: 'bg-brand-400' },
      { id: 'ov-clear', label: 'Clear', icon: '🧹', color: 'bg-slate-700' },
    ]
  },
  {
    title: 'Emergency',
    actions: [
      { id: 'sys-mute', label: 'Mute', icon: '🔇', color: 'bg-slate-700' },
      { id: 'sys-stop', label: 'Stop', icon: '🛑', color: 'bg-rose-700' },
    ]
  }
];

const StreamDeck: React.FC<StreamDeckProps> = ({ onClose, onAction }) => {
  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center p-4 md:p-8 pointer-events-none">
      <div className="bg-base-900/98 backdrop-blur-3xl border border-white/10 rounded-[3.5rem] w-full max-w-2xl h-fit max-h-[90%] overflow-hidden shadow-[0_40px_120px_rgba(0,0,0,0.9)] pointer-events-auto animate-in zoom-in-95 duration-300">
        
        {/* Console Header */}
        <div className="p-8 border-b border-white/5 flex items-center justify-between bg-gradient-to-r from-brand-600/10 to-transparent">
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-brand-600 rounded-2xl flex items-center justify-center shadow-xl shadow-brand-900/50 border border-brand-400/20">
              <span className="text-white font-black italic text-xl">SD</span>
            </div>
            <div>
              <h3 className="text-xl font-black tracking-tight text-white uppercase italic">Neural Deck Console</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-[0.3em]">Direct Neural Ingest • v2.4.1</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-12 h-12 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-all border border-white/10 hover:border-brand-500/30"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        {/* Console Grid */}
        <div className="p-10 overflow-y-auto custom-scrollbar space-y-10">
          {ACTION_GROUPS.map((group, idx) => (
            <div key={idx} className="space-y-6">
              <div className="flex items-center gap-4">
                <h4 className="text-[10px] font-black text-brand-400 uppercase tracking-[0.3em]">{group.title}</h4>
                <div className="flex-1 h-px bg-white/5"></div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                {group.actions.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => {
                      onAction(action.id);
                      const audio = new Audio('https://www.soundjay.com/buttons/button-20.mp3');
                      audio.volume = 0.2;
                      audio.play().catch(() => {});
                    }}
                    className="group flex flex-col items-center justify-center gap-4 p-6 rounded-[2.5rem] bg-base-950 border border-white/5 hover:border-brand-500/50 hover:bg-brand-500/5 transition-all active:scale-90 shadow-2xl relative overflow-hidden"
                  >
                    <div className={`absolute top-0 left-0 w-full h-1 opacity-0 group-hover:opacity-100 transition-opacity ${action.color} shadow-[0_0_15px_rgba(255,255,255,0.2)]`}></div>
                    <span className="text-4xl group-hover:scale-125 transition-transform duration-500">
                      {action.icon}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white transition-colors">
                      {action.label}
                    </span>
                    <div className="absolute inset-0 bg-brand-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Console Footer */}
        <div className="px-8 py-6 bg-black/40 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-brand-600 animate-pulse shadow-[0_0_8px_rgba(255,60,242,0.6)]"></div>
               <span className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Interface Synchronized</span>
            </div>
            <div className="h-4 w-px bg-white/10"></div>
            <span className="text-[9px] font-mono text-slate-500 uppercase">Input Latency: 2.8ms</span>
          </div>
          <div className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em] italic">
            Amalgam OS // Production Deck
          </div>
        </div>
      </div>
    </div>
  );
};

export default StreamDeck;
