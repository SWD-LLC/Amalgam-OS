
import React, { useState, useEffect, useCallback } from 'react';
import { getNeuralTalkingPoints } from '../services/geminiService';

const TalkingPoints: React.FC = () => {
  const [topic, setTopic] = useState('AI Technology & Gaming');
  const [data, setData] = useState<{points: string[], sources: {title: string, uri: string}[]}>({ 
    points: [
      "Latest VR headset shipments exceed 10 million units.",
      "Game engine optimizations now support real-time path tracing on mobile.",
      "Content moderation AI reduces toxicity by 40% in large-scale tests."
    ], 
    sources: [] 
  });
  const [loading, setLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [errorType, setErrorType] = useState<'quota' | 'other' | null>(null);

  const fetchPoints = useCallback(async () => {
    if (loading || cooldown > 0) return;
    
    setLoading(true);
    setErrorType(null);
    const result = await getNeuralTalkingPoints(topic);
    
    if (result.errorType === 'quota') {
      setErrorType('quota');
      setCooldown(300); // 5 min cooldown
      // Keep old data or use the fallback points returned by the service
      if (result.points.length > 0) {
        setData({ points: result.points, sources: result.sources });
      }
    } else {
      setData({ points: result.points, sources: result.sources });
    }
    setLoading(false);
  }, [topic, loading, cooldown]);

  useEffect(() => {
    fetchPoints();
    const interval = setInterval(() => {
      if (cooldown === 0) fetchPoints();
    }, 300000); // 5 mins
    return () => clearInterval(interval);
  }, [fetchPoints, cooldown]);

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => setCooldown(prev => Math.max(0, prev - 1)), 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  return (
    <div className="bg-base-850 border border-white/5 rounded-[2.5rem] p-8 shadow-xl relative group">
      <div className="flex justify-between items-start mb-8">
        <div>
          <h3 className="text-xl font-black tracking-tighter text-white uppercase italic">Neural Pulse</h3>
          <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Grounding Engine • Web Grounded</p>
        </div>
        <div className="flex items-center gap-3">
          {cooldown > 0 && (
            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest animate-pulse flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
              QUOTA DELAY: {cooldown}s
            </span>
          )}
          <button 
            onClick={fetchPoints}
            disabled={loading || cooldown > 0}
            className={`p-2 rounded-xl transition-all ${loading ? 'bg-brand-500/10 text-brand-400' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
          >
            <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {errorType === 'quota' && (
          <div className="bg-amber-500/5 rounded-2xl p-4 border border-amber-500/20 mb-4">
             <div className="flex items-center gap-3">
                <span className="text-lg">📡</span>
                <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">Running on cached intelligence</p>
             </div>
          </div>
        )}

        {data.points.map((p, i) => (
          <div key={i} className="bg-base-950/50 p-5 rounded-3xl border border-white/5 hover:border-brand-500/30 transition-all group/point">
            <p className="text-sm text-slate-200 font-medium leading-relaxed mb-4 group-hover/point:text-white transition-colors">"{p}"</p>
            {data.sources[i] && (
              <a 
                href={data.sources[i].uri} 
                target="_blank" 
                rel="noreferrer"
                className="text-[9px] font-black text-brand-400 uppercase tracking-widest hover:text-brand-300 transition-colors flex items-center gap-2"
              >
                <span>Verification Source: {data.sources[i].title}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </a>
            )}
          </div>
        ))}
        
        {data.points.length === 0 && !loading && (
          <div className="py-12 text-center text-slate-600 font-mono text-[9px] uppercase tracking-widest">
            Awaiting neural signal acquisition...
          </div>
        )}
      </div>
    </div>
  );
};

export default TalkingPoints;
