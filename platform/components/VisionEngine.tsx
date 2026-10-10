import React, { useState, useEffect, useRef } from 'react';
import { visualStreamAnalysis } from '../services/geminiService';

const VisionEngine: React.FC = () => {
  const [data, setData] = useState<{ description: string; detectedObjects: string[]; hypeLevel: number; errorType?: 'quota' | 'other' } | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isScanningRef = useRef(false);

  const performScan = async () => {
    // Prevent overlapping scans or scanning during cooldown
    if (isScanningRef.current || cooldown > 0) return;
    
    isScanningRef.current = true;
    setIsScanning(true);
    
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        // Mocking a frame with noise
        ctx.fillStyle = '#0b0e14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        for(let i=0; i<10; i++) {
          ctx.fillStyle = `rgba(92, 114, 255, ${Math.random() * 0.1})`;
          ctx.fillRect(Math.random()*canvas.width, Math.random()*canvas.height, 50, 50);
        }

        const base64 = canvas.toDataURL('image/jpeg', 0.6).split(',')[1];
        const result = await visualStreamAnalysis(base64);
        
        setData(result);
        
        if (result.errorType === 'quota') {
          // 5 minute cooldown for visual analysis if we hit the limit
          setCooldown(300); 
        }
      }
    }
    
    setIsScanning(false);
    isScanningRef.current = false;
  };

  useEffect(() => {
    // Initial scan with delay only if not in cooldown
    const initialScan = setTimeout(() => {
      if (cooldown === 0) performScan();
    }, 3000);

    // Standard polling: scan every 90s (reduced from 60s to conserve quota)
    const interval = setInterval(() => {
      if (cooldown === 0 && !isScanningRef.current) {
        performScan();
      }
    }, 90000); 

    return () => {
      clearTimeout(initialScan);
      clearInterval(interval);
    };
  }, [cooldown]);

  // Cooldown timer effect
  useEffect(() => {
    if (cooldown > 0) {
      const timer = setInterval(() => {
        setCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [cooldown]);

  return (
    <div className="bg-base-850 border border-white/5 rounded-[2.5rem] p-6 relative overflow-hidden group shadow-xl transition-all hover:border-brand-500/20">
      <canvas ref={canvasRef} className="hidden" width="300" height="200" />
      
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500">Vision Node</h3>
        <div className={`flex items-center gap-2`}>
           {cooldown > 0 && (
             <span className="text-[8px] font-mono text-amber-500 animate-pulse bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
               COOLDOWN: {cooldown}s
             </span>
           )}
           <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-brand-500 animate-ping' : cooldown > 0 ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' : 'bg-emerald-500/40 shadow-[0_0_8px_rgba(16,185,129,0.2)]'}`}></div>
        </div>
      </div>

      {data ? (
        <div className="space-y-5">
          {data.errorType === 'quota' ? (
            <div className="bg-amber-500/10 rounded-2xl p-4 border border-amber-500/20 text-center space-y-3">
              <div className="text-xl">⏳</div>
              <p className="text-[10px] text-amber-400 font-black uppercase tracking-widest">
                AI Vision Saturated
              </p>
              <p className="text-[10px] text-slate-500 leading-relaxed italic font-medium px-2">
                "RESOURCE_EXHAUSTED (429). Vision engine paused to prevent API lockout."
              </p>
              <button 
                onClick={() => { setCooldown(0); performScan(); }}
                className="w-full py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all border border-amber-500/20 mt-2"
              >
                Force Recalibration
              </button>
            </div>
          ) : (
            <>
              <div className="bg-base-950/50 rounded-2xl p-4 border border-white/5 group-hover:border-brand-500/20 transition-all">
                <p className="text-xs text-slate-400 leading-relaxed italic">
                  "{data.description}"
                </p>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {data.detectedObjects?.length > 0 ? (
                  data.detectedObjects.map((obj, i) => (
                    <span key={i} className="text-[9px] font-black bg-brand-600/10 text-brand-400 px-2.5 py-1 rounded-lg border border-brand-500/20 uppercase tracking-widest transition-all hover:bg-brand-600/20">
                      {obj}
                    </span>
                  ))
                ) : (
                  <span className="text-[9px] font-black text-slate-600 italic">Zero entities identified</span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Vision Fidelity</span>
                  <span className="text-[9px] font-mono text-brand-400">{Math.round(data.hypeLevel * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800/50 h-1.5 rounded-full overflow-hidden">
                   <div className="bg-brand-500 h-full transition-all duration-[2000ms] shadow-[0_0_12px_rgba(92,114,255,0.4)]" style={{ width: `${data.hypeLevel * 100}%` }}></div>
                </div>
              </div>
            </>
          )}
        </div>
      ) : (
        <div className="py-12 text-center flex flex-col items-center">
          <div className="w-10 h-10 border-2 border-brand-500/20 border-t-brand-500 rounded-full animate-spin mb-4"></div>
          <p className="text-[10px] text-slate-600 font-black uppercase tracking-widest animate-pulse">Establishing Ingest Link...</p>
        </div>
      )}
    </div>
  );
};

export default VisionEngine;