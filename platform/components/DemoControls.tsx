import React from 'react';

interface DemoControlsProps {
  onTriggerEvent: (text: string, user: string, isAI: boolean, status: any) => void;
}

const SimulationButton: React.FC<{ onClick: () => void; label: string; icon: string; colorClass?: string }> = ({ onClick, label, icon, colorClass = 'hover:border-brand-600/40 hover:bg-brand-600/10' }) => (
  <button 
    onClick={onClick}
    className={`px-5 py-2.5 rounded-2xl bg-base-900 border border-white/5 transition-all flex items-center gap-3 group ${colorClass}`}
  >
    <span className="text-xl group-hover:scale-125 transition-transform duration-300">{icon}</span>
    <div className="text-left">
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-white block">{label}</span>
      <span className="text-[7px] font-mono text-slate-600 group-hover:text-brand-400 uppercase">Simulate Trigger</span>
    </div>
  </button>
);

const DemoControls: React.FC<DemoControlsProps> = ({ onTriggerEvent }) => {
  return (
    <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] bg-base-950/80 backdrop-blur-3xl border border-brand-600/30 p-3 rounded-[2.5rem] shadow-[0_30px_100px_rgba(0,0,0,0.8)] flex items-center gap-4 animate-in slide-in-from-bottom-6 duration-700">
      <div className="pl-6 pr-6 border-r border-white/10 flex flex-col items-start">
         <div className="flex items-center gap-2 mb-1">
           <div className="w-2 h-2 rounded-full bg-brand-600 animate-pulse"></div>
           <span className="text-[11px] font-black text-brand-400 uppercase tracking-tighter">Sandbox v1.0.4</span>
         </div>
         <span className="text-[8px] font-mono text-slate-500 uppercase">Neural Preview Build</span>
      </div>
      
      <div className="flex gap-2">
        <SimulationButton 
          onClick={() => onTriggerEvent("VIRAL ALERT: 54.2K new connections detected from Reddit. Hype levels exceeding 90%!", "Amalgam AI", true, "highlight")}
          label="Viral Peak"
          icon="🚀"
          colorClass="hover:border-brand-600/50 hover:bg-brand-600/10"
        />
        <SimulationButton 
          onClick={() => onTriggerEvent("User flagged for potential toxicity: 'You guys are literally trash at this game.' Initiating shadow-ban.", "Neural Filter", true, "flagged")}
          label="Toxicity"
          icon="🛡️"
          colorClass="hover:border-rose-500/50 hover:bg-rose-500/10"
        />
        <SimulationButton 
          onClick={() => onTriggerEvent("NEW DONATION: $500.00 from Pixel_Vanguard! 'Love the new OES architecture.'", "Gateway", false, "highlight")}
          label="High Donation"
          icon="💎"
          colorClass="hover:border-emerald-500/50 hover:bg-emerald-500/10"
        />
        <SimulationButton 
          onClick={() => onTriggerEvent("System Check: Vision node synchronization complete. All 12 relay clusters online.", "System", true, "system")}
          label="System Pulse"
          icon="🛰️"
        />
      </div>
      
      <div className="pr-4 pl-2">
        <button 
          className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-all text-slate-500 hover:text-white"
          title="Sandbox Settings"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
        </button>
      </div>
    </div>
  );
};

export default DemoControls;