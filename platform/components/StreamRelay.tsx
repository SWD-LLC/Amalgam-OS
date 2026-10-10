
import React from 'react';
import { LinkedPlatform } from '../types';

const PLATFORMS: LinkedPlatform[] = [
  { id: 'yt', name: 'YouTube Live', icon: '🔴', status: 'online', viewers: 4200, linked: true, bitrate: '12.2 Mbps', latency: '40ms' },
  { id: 'tw', name: 'Twitch', icon: '🟣', status: 'online', viewers: 1850, linked: true, bitrate: '8.5 Mbps', latency: '12ms' },
  { id: 'tt', name: 'TikTok', icon: '🎵', status: 'online', viewers: 12400, linked: true, bitrate: '4.8 Mbps', latency: '90ms' },
];

const StreamRelay: React.FC = () => {
  return (
    <div className="bg-base-850 border border-white/5 p-8 rounded-[2.5rem] shadow-xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-xl font-black tracking-tight text-white uppercase">Relay Hub</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Global Ingest Nodes</p>
        </div>
        <span className="text-[10px] font-black bg-emerald-500/10 text-emerald-500 px-4 py-1.5 rounded-full border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
          ALL NODES NOMINAL
        </span>
      </div>
      <div className="space-y-4">
        {PLATFORMS.map((p) => (
          <div key={p.id} className="bg-base-950/50 border border-white/5 rounded-3xl p-5 flex items-center justify-between hover:border-brand-500/20 transition-all group">
            <div className="flex items-center gap-5">
              <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
                {p.icon}
              </div>
              <div>
                <span className="text-sm font-black block leading-tight text-slate-100">{p.name}</span>
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">{p.bitrate} • {p.latency} Lag</span>
              </div>
            </div>
            <div className="flex items-center gap-6">
               <div className="text-right">
                  <span className="text-sm font-black text-brand-400 block tracking-tight">{p.viewers.toLocaleString()}</span>
                  <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Active</span>
               </div>
               <div className="w-10 h-1 bg-slate-800 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-full"></div>
               </div>
            </div>
          </div>
        ))}
      </div>
      <button className="w-full mt-6 py-4 bg-brand-600/5 hover:bg-brand-600/10 border border-brand-600/10 rounded-2xl text-[10px] font-black text-brand-500 uppercase tracking-widest transition-all">
        Manage Endpoints
      </button>
    </div>
  );
};

export default StreamRelay;
