
import React, { useState, useRef, useEffect } from 'react';
import { generateVideo } from '../services/geminiService';

const VideoForge: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16'>('16:9');
  const [resolution, setResolution] = useState<'720p' | '1080p'>('1080p');
  
  const videoRef = useRef<HTMLVideoElement>(null);

  const checkApiKey = async () => {
    // @ts-ignore
    const hasKey = await window.aistudio.hasSelectedApiKey();
    if (!hasKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
    }
    return true;
  };

  const handleForge = async () => {
    if (!prompt.trim() || isGenerating) return;

    try {
      await checkApiKey();
      setIsGenerating(true);
      setVideoUrl(null);
      
      const result = await generateVideo(
        prompt, 
        { aspectRatio, resolution }, 
        (status) => setStatusMessage(status)
      );
      
      if (result) {
        setVideoUrl(result);
      } else {
        setStatusMessage("Temporal Link Fractured. Retrying Ingest...");
      }
    } catch (e) {
      setStatusMessage("Critical Error in Neural Forge.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto h-full flex flex-col space-y-12 animate-in fade-in duration-500 pb-32">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Video Forge</h2>
          <p className="text-slate-500 font-medium">Synthesize Cinematic B-Roll & BRB Loops powered by Veo 3.1 Neural Ingest.</p>
        </div>
        <div className="flex gap-3">
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
             <button 
               onClick={() => setAspectRatio('16:9')}
               className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${aspectRatio === '16:9' ? 'bg-brand-600 text-white' : 'text-slate-500'}`}
             >
               16:9
             </button>
             <button 
               onClick={() => setAspectRatio('9:16')}
               className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${aspectRatio === '9:16' ? 'bg-brand-600 text-white' : 'text-slate-500'}`}
             >
               9:16
             </button>
          </div>
          <select 
            value={resolution}
            onChange={(e) => setResolution(e.target.value as any)}
            className="bg-white/5 border border-white/5 text-slate-400 rounded-2xl px-4 py-2 text-[9px] font-black uppercase tracking-widest focus:outline-none focus:border-brand-500"
          >
            <option value="720p">720P Standard</option>
            <option value="1080p">1080P Ultra</option>
          </select>
        </div>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Main Stage */}
        <div className="lg:col-span-8 space-y-8">
           <div className={`relative w-full overflow-hidden rounded-[3rem] border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.8)] bg-base-950 transition-all duration-700 ${aspectRatio === '9:16' ? 'max-w-sm mx-auto aspect-[9/16]' : 'aspect-video'}`}>
              {!videoUrl && !isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center space-y-6">
                  <div className="w-24 h-24 bg-brand-600/10 rounded-full flex items-center justify-center border border-brand-500/20 text-4xl animate-pulse">
                    🎬
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-black text-white uppercase italic tracking-tighter">Awaiting Prompt Ingest</h3>
                    <p className="text-xs text-slate-500 max-w-sm leading-relaxed">Enter a detailed description below to forge a high-fidelity cinematic sequence for your production.</p>
                  </div>
                </div>
              )}

              {isGenerating && (
                <div className="absolute inset-0 flex flex-col items-center justify-center space-y-12 bg-base-950/80 backdrop-blur-xl z-20">
                   <div className="relative">
                      <div className="w-32 h-32 border-4 border-brand-600/20 rounded-full"></div>
                      <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                         <span className="text-2xl animate-pulse">⚡</span>
                      </div>
                   </div>
                   <div className="text-center space-y-4">
                      <p className="text-sm font-black text-brand-400 uppercase tracking-[0.4em] animate-pulse">{statusMessage}</p>
                      <div className="flex justify-center gap-1">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="w-1.5 h-1.5 rounded-full bg-brand-500 animate-bounce" style={{ animationDelay: `${i * 200}ms` }}></div>
                        ))}
                      </div>
                   </div>
                </div>
              )}

              {videoUrl && (
                <video 
                  ref={videoRef}
                  src={videoUrl}
                  autoPlay
                  loop
                  controls
                  className="w-full h-full object-cover"
                />
              )}
              
              <div className="absolute bottom-6 left-6 right-6 pointer-events-none">
                 <div className="flex items-center justify-between">
                    <div className="bg-black/40 backdrop-blur-xl border border-white/10 px-4 py-1.5 rounded-full">
                       <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Veo 3.1 Preview Build</span>
                    </div>
                    {videoUrl && (
                      <a 
                        href={videoUrl} 
                        download="amalgam-forge.mp4"
                        className="bg-brand-600 hover:bg-brand-500 text-white px-5 py-2 rounded-full text-[9px] font-black uppercase tracking-widest shadow-xl pointer-events-auto"
                      >
                        Export HQ MP4
                      </a>
                    )}
                 </div>
              </div>
           </div>

           {/* Input Bar */}
           <div className="relative group">
              <textarea 
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe a cinematic sequence... (e.g. A futuristic cyberpunk lounge with neon highlights, smooth camera pan over a holographic dashboard)"
                className="w-full bg-base-850 border border-white/10 rounded-[2.5rem] px-8 py-6 text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-brand-500 transition-all min-h-[120px] shadow-2xl group-hover:bg-base-800"
              />
              <button 
                onClick={handleForge}
                disabled={isGenerating || !prompt.trim()}
                className={`absolute bottom-6 right-6 px-10 py-4 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-2xl flex items-center gap-4 ${
                  isGenerating ? 'bg-slate-800 text-slate-500' : 'bg-brand-600 text-white hover:bg-brand-500 hover:scale-105 active:scale-95 shadow-brand-900/40'
                }`}
              >
                {isGenerating ? 'FORGING...' : 'INITIATE FORGE'}
                {!isGenerating && <span className="text-xl">🔥</span>}
              </button>
           </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-8">
           <div className="bg-base-850 border border-white/5 rounded-[3rem] p-10 shadow-xl space-y-8">
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest mb-4">Forge Tips</h3>
                <ul className="space-y-4">
                   {[
                     "Be descriptive about lighting (e.g. 'cinematic neon', 'volumetric fog').",
                     "Specify camera movement for better flow ('slow pan', 'dolly in').",
                     "Generation typically takes 60-90 seconds."
                   ].map((tip, i) => (
                     <li key={i} className="flex gap-4 text-xs text-slate-500 leading-relaxed">
                        <span className="text-brand-500">✦</span>
                        {tip}
                     </li>
                   ))}
                </ul>
              </div>

              <div className="pt-8 border-t border-white/5 space-y-6">
                 <h3 className="text-sm font-black text-white uppercase tracking-widest">History</h3>
                 <div className="space-y-4">
                    <div className="bg-base-950 p-4 rounded-2xl border border-white/5 opacity-40">
                       <p className="text-[10px] text-slate-400 italic">No recent forges detected in this node.</p>
                    </div>
                 </div>
              </div>
              
              <div className="bg-brand-500/5 border border-brand-500/20 p-6 rounded-3xl">
                 <p className="text-[10px] text-brand-400 font-bold leading-relaxed">
                    IMPORTANT: Veo 3.1 requires a paid project API key. Select your key to ensure uninterrupted generation access.
                 </p>
                 <a 
                    href="https://ai.google.dev/gemini-api/docs/billing" 
                    target="_blank" 
                    className="text-[9px] font-black text-white underline block mt-2 uppercase tracking-widest"
                  >
                    Billing Documentation
                 </a>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default VideoForge;
