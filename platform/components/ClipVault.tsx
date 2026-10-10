
import React from 'react';
import { ClipSuggestion } from '../types';

interface ClipVaultProps {
  clips: ClipSuggestion[];
}

const ClipVault: React.FC<ClipVaultProps> = ({ clips }) => {
  return (
    <div className="bg-base-850 border border-white/5 rounded-[2.5rem] overflow-hidden h-full flex flex-col shadow-2xl">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
        <h3 className="text-lg font-black tracking-tighter text-white flex items-center gap-3">
          <svg className="w-5 h-5 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          CLIP VAULT
        </h3>
        <span className="bg-orange-500/10 text-orange-400 text-[10px] font-black px-2 py-0.5 rounded uppercase border border-orange-500/20">
          {clips.length} DETECTED
        </span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {clips.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-slate-600 border border-dashed border-white/10 rounded-[2rem] p-8 text-center bg-white/[0.02]">
             <div className="w-12 h-12 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 text-2xl">🎬</div>
             <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-2">Awaiting Thresholds</p>
             <p className="text-xs italic leading-relaxed text-slate-500">Peak engagement detection is active. Generating short-form candidates...</p>
          </div>
        ) : (
          clips.map((clip) => (
            <div key={clip.id} className="bg-base-950/40 border border-white/5 p-5 rounded-3xl hover:border-brand-500/50 transition-all group animate-in slide-in-from-right-4">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-bold text-sm text-slate-100 group-hover:text-white transition-colors leading-tight line-clamp-2">{clip.title}</h4>
                <span className="text-[9px] text-brand-400 font-mono bg-brand-500/10 px-1.5 py-0.5 rounded border border-brand-500/20">{clip.startTime}</span>
              </div>
              <p className="text-[10px] text-slate-500 line-clamp-2 mb-4 leading-relaxed">{clip.reason}</p>
              <div className="flex gap-2">
                <button className="flex-1 bg-brand-600 hover:bg-brand-500 text-white text-[10px] font-black py-2.5 rounded-xl transition-all uppercase tracking-widest shadow-lg shadow-brand-900/20">
                  Export Short
                </button>
                <button className="p-2.5 bg-white/5 hover:bg-white/10 rounded-xl text-slate-400 transition-all">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6a3 3 0 100-2.684l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/></svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      <div className="p-6 bg-white/[0.02] border-t border-white/5">
        <button className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-400 text-[10px] font-black uppercase tracking-widest transition-all">
          View All History
        </button>
      </div>
    </div>
  );
};

export default ClipVault;
