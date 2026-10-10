
import React, { useState, useEffect, useCallback } from 'react';
import { Message, ClipSuggestion, StreamStats } from '../types';
import { detectClippableMoments, analyzeStreamVitals } from '../services/geminiService';
import VisionEngine from './VisionEngine';
import Soundboard from './Soundboard';
import ClipVault from './ClipVault';
import StreamRelay from './StreamRelay';
import CoPilot from './CoPilot';
import TalkingPoints from './TalkingPoints';

interface DashboardProps {
  chatLog: Message[];
}

const Dashboard: React.FC<DashboardProps> = ({ chatLog }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [clips, setClips] = useState<ClipSuggestion[]>([]);
  const [isQuotaLimited, setIsQuotaLimited] = useState(false);
  const [vitals, setVitals] = useState<Partial<StreamStats>>({
    sentiment: 'neutral',
    burnoutRisk: 'low',
    engagement: 78
  });
  const [coachingTip, setCoachingTip] = useState("Awaiting audience data...");

  const runPulseIntelligence = useCallback(async () => {
    if (chatLog.length < 1 || isAnalyzing) return;
    setIsAnalyzing(true);
    setIsQuotaLimited(false);
    
    try {
      const [newClips, newVitals] = await Promise.all([
        detectClippableMoments(chatLog),
        analyzeStreamVitals(chatLog)
      ]);
      
      setVitals({
        ...vitals,
        sentiment: newVitals.sentiment,
        burnoutRisk: newVitals.burnoutRisk,
      });
      setCoachingTip(newVitals.coachingTip);
      
      if (newVitals.errorType === 'quota') setIsQuotaLimited(true);

      setClips(prev => {
        const combined = [...newClips, ...prev];
        return Array.from(new Map(combined.map(item => [item.id || item.title, item])).values()).slice(0, 10);
      });
    } catch (e) {
      console.error("Dashboard Intelligence Error:", e);
    } finally {
      setIsAnalyzing(false);
    }
  }, [chatLog, vitals, isAnalyzing]);

  useEffect(() => {
    const initialDelay = setTimeout(runPulseIntelligence, 5000);
    const interval = setInterval(runPulseIntelligence, 120000); 
    return () => {
      clearTimeout(initialDelay);
      clearInterval(interval);
    };
  }, [runPulseIntelligence]);

  return (
    <div className="space-y-8 pb-12">
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Left Col: AI Agents */}
        <div className="xl:col-span-3 space-y-6">
          <CoPilot />
          <VisionEngine />
          <Soundboard />
        </div>

        {/* Center Col: Production Core */}
        <div className="xl:col-span-6 space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <MetricCard label="Audience" value={vitals.sentiment!} status={vitals.sentiment === 'positive' ? 'success' : 'none'} />
            <MetricCard label="Burnout" value={vitals.burnoutRisk!} status={vitals.burnoutRisk === 'high' ? 'error' : vitals.burnoutRisk === 'moderate' ? 'warning' : 'success'} />
            <MetricCard label="Retention" value="94%" />
            <MetricCard label="Grounding" value="Active" status="success" />
          </div>

          <div className="bg-base-850 border border-white/5 p-8 rounded-[2.5rem] relative overflow-hidden group shadow-2xl transition-all hover:border-brand-500/10">
             <div className="absolute top-0 left-0 w-1.5 h-full bg-brand-600 shadow-[0_0_15px_rgba(92,114,255,0.4)]"></div>
             <div className="flex justify-between items-start mb-6">
                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Co-Pilot Command Center</h3>
                <div className="flex items-center gap-3">
                  {isQuotaLimited && (
                    <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      Quota Throttled
                    </span>
                  )}
                  {isAnalyzing && <div className="text-brand-500 animate-spin text-lg">⚙️</div>}
                </div>
             </div>
             
             <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest mb-2 block">AI Strategy Pulse</span>
                  <p className={`text-slate-200 text-lg font-bold italic leading-relaxed tracking-tight group-hover:text-white transition-colors ${isQuotaLimited ? 'opacity-50' : ''}`}>
                    "{isQuotaLimited ? "Strategy engine in cooldown due to high traffic..." : coachingTip}"
                  </p>
                </div>
                
                <div className="flex gap-3">
                  <button 
                    onClick={runPulseIntelligence}
                    disabled={isAnalyzing}
                    className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-30"
                  >
                    Refresh Intelligence
                  </button>
                  <button className="flex-1 bg-brand-600 hover:bg-brand-500 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-brand-900/30">
                    Deploy Tactics
                  </button>
                </div>
             </div>
          </div>

          <TalkingPoints />
          <StreamRelay />
        </div>

        {/* Right Col: Clip Vault */}
        <div className="xl:col-span-3">
          <ClipVault clips={clips} />
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value: string; status?: 'success' | 'warning' | 'error' | 'none' }> = ({ label, value, status = 'none' }) => (
  <div className="bg-base-850 border border-white/5 p-5 rounded-3xl hover:border-white/10 transition-all shadow-xl group">
    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-black block mb-3 group-hover:text-slate-400 transition-colors">{label}</span>
    <span className={`text-xl font-black capitalize tracking-tight ${
      status === 'success' ? 'text-emerald-500' :
      status === 'warning' ? 'text-amber-500' :
      status === 'error' ? 'text-rose-500' : 'text-slate-100'
    }`}>{value}</span>
  </div>
);

export default Dashboard;
