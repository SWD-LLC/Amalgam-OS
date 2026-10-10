
import React, { useRef, useEffect, useState, useCallback } from 'react';
import StreamDeck from './StreamDeck';
import BroadcastTransport from './BroadcastTransport';

type StreamHealth = 'NOMINAL' | 'DEGRADED' | 'HEALING' | 'CRITICAL';

const BUFFER_DURATION_SECONDS = 60;
const SEGMENT_DURATION_MS = 2000;
const MAX_SEGMENTS = BUFFER_DURATION_SECONDS / (SEGMENT_DURATION_MS / 1000);

const DEMO_VIDEO_URL = "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4";

interface SavedSegment {
  id: string;
  timestamp: Date;
  duration: number;
}

const LiveStream: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const bufferChunksRef = useRef<Blob[]>([]);
  
  const [isLive, setIsLive] = useState(false);
  const [showDeck, setShowDeck] = useState(false);
  const [activeScene, setActiveScene] = useState('Main');
  const [resolution, setResolution] = useState<{w: number, h: number} | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [toasts, setToasts] = useState<{id: string, text: string, type: string}[]>([]);

  // Overlays State
  const [showHypeBar, setShowHypeBar] = useState(true);
  const [showChatOverlay, setShowChatOverlay] = useState(false);

  // Pre-recording & Archive state
  const [isPreRecording, setIsPreRecording] = useState(false);
  const [autoStartPreRecord, setAutoStartPreRecord] = useState(true);
  const [autoSaveArchive, setAutoSaveArchive] = useState(false);
  const [bufferSize, setBufferSize] = useState(0);

  // Ref for autoSave
  const autoSaveRef = useRef(autoSaveArchive);
  useEffect(() => { autoSaveRef.current = autoSaveArchive; }, [autoSaveArchive]);

  // Engagement Metrics State
  const [engagement, setEngagement] = useState({ current: 450, target: 1000 });

  const addToast = (text: string, type: string = 'info') => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts(prev => [...prev, {id, text, type}]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Canvas Overlay Rendering Logic
  useEffect(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || !isLive) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let frame = 0;

    const render = () => {
      frame++;
      const { width, height } = canvas;
      ctx.clearRect(0, 0, width, height);

      // --- Draw Hype Goal Bar ---
      if (showHypeBar) {
        const barWidth = width * 0.3;
        const barHeight = 12;
        const x = 30;
        const y = height - 60;
        const progress = engagement.current / engagement.target;
        const displayProgress = progress + Math.sin(frame * 0.05) * 0.005;

        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth, barHeight, 6);
        ctx.fill();

        const gradient = ctx.createLinearGradient(x, 0, x + barWidth * displayProgress, 0);
        gradient.addColorStop(0, '#C7A6FF'); 
        gradient.addColorStop(0.5, '#FF3CF2'); 
        gradient.addColorStop(1, '#FFF2A6'); 
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.roundRect(x, y, barWidth * displayProgress, barHeight, 6);
        ctx.fill();

        ctx.font = 'bold 10px "Plus Jakarta Sans"';
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fillText('NEURAL HYPE GOAL', x, y - 10);
        
        ctx.textAlign = 'right';
        ctx.font = '900 12px "JetBrains Mono"';
        ctx.fillStyle = '#FF3CF2';
        ctx.fillText(`${engagement.current} / ${engagement.target}`, x + barWidth, y - 10);
        ctx.textAlign = 'left';
      }

      // --- Draw Toasts ---
      toasts.forEach((toast, i) => {
        const tx = width - 250;
        const ty = 80 + (i * 50);
        ctx.fillStyle = 'rgba(11, 6, 20, 0.8)';
        ctx.beginPath();
        ctx.roundRect(tx, ty, 220, 40, 12);
        ctx.fill();
        ctx.strokeStyle = '#FF3CF2';
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.font = 'bold 9px "Plus Jakarta Sans"';
        ctx.fillStyle = '#F7F3FF';
        ctx.fillText(toast.text, tx + 15, ty + 24);
      });

      animationId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationId);
  }, [isLive, engagement, showHypeBar, toasts]);

  const saveLastSixty = useCallback((isAuto = false) => {
    if (bufferChunksRef.current.length === 0) return;
    const blob = new Blob(bufferChunksRef.current, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const now = new Date();
    a.download = `amalgam-${isAuto ? 'archive' : 'highlight'}-${now.getTime()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    if (isAuto) {
      bufferChunksRef.current = [];
      setBufferSize(0);
    }
  }, []);

  useEffect(() => {
    if (isPreRecording && isLive && streamRef.current) {
      try {
        const recorder = new MediaRecorder(streamRef.current, { mimeType: 'video/webm;codecs=vp9,opus' });
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            bufferChunksRef.current.push(e.data);
            if (bufferChunksRef.current.length > MAX_SEGMENTS) {
              if (autoSaveRef.current) saveLastSixty(true);
              else bufferChunksRef.current.shift();
            }
            setBufferSize(bufferChunksRef.current.length);
          }
        };
        recorder.start(SEGMENT_DURATION_MS);
        recorderRef.current = recorder;
      } catch (err) { setIsPreRecording(false); }
    } else {
      if (recorderRef.current && recorderRef.current.state !== 'inactive') recorderRef.current.stop();
      recorderRef.current = null;
      bufferChunksRef.current = [];
      setBufferSize(0);
    }
  }, [isPreRecording, isLive, saveLastSixty]);

  useEffect(() => {
    let analyzer: AnalyserNode | null = null;
    let animationFrameId: number;

    async function setupMedia() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        streamRef.current = stream;
        setIsLive(true);
        setIsDemoMode(false);
        if (autoStartPreRecord) setIsPreRecording(true);
        {
          const AudioContextClass = (window as any).AudioContext || (window as any).webkitAudioContext;
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          analyzer = audioCtx.createAnalyser();
          analyzer.fftSize = 256;
          const dataArray = new Uint8Array(analyzer.frequencyBinCount);
          const updateLevel = () => {
            if (analyzer) {
              analyzer.getByteFrequencyData(dataArray);
              let sum = 0;
              for (let i = 0; i < dataArray.length; i++) sum += dataArray[i];
              setAudioLevel(sum / dataArray.length);
            }
            animationFrameId = requestAnimationFrame(updateLevel);
          };
          updateLevel();
          source.connect(analyzer);
        }
      } catch (err) {
        setIsDemoMode(true);
        setIsLive(true);
      }
    }
    setupMedia();
    return () => {
      if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
      cancelAnimationFrame(animationFrameId);
      void audioContextRef.current?.close().catch(() => undefined);
    };
  }, []); // Capture once per mount; UI preferences must not restart active media tracks.


  useEffect(() => {
    if (!isLive || !videoRef.current) return;
    const video = videoRef.current;
    if (isDemoMode) {
      video.srcObject = null;
      video.src = DEMO_VIDEO_URL;
      video.loop = true;
    } else if (streamRef.current) {
      video.removeAttribute('src');
      video.srcObject = streamRef.current;
    }
    void video.play().catch(() => undefined);
  }, [isLive, isDemoMode]);

  const handleDeckAction = (id: string) => {
    // Scene Switching
    if (id.startsWith('scene-')) {
      setActiveScene(id.replace('scene-', '').toUpperCase());
      addToast(`SCENE: ${id.replace('scene-', '').toUpperCase()}`, 'scene');
    }
    
    // AI Commands
    if (id === 'ai-vision') addToast("COMMAND: Vision Node Ingest", "ai");
    if (id === 'ai-voice') addToast("COMMAND: Neural TTS Burst", "ai");
    if (id === 'ai-pulse') addToast("COMMAND: Strategy Analysis", "ai");
    if (id === 'ai-clip') {
      addToast("COMMAND: Clipping Engagement Peak", "ai");
      saveLastSixty(false);
    }

    // Overlays
    if (id === 'ov-hype') {
      setShowHypeBar(!showHypeBar);
      addToast(showHypeBar ? "OVERLAY: Hype Bar Off" : "OVERLAY: Hype Bar On", "overlay");
    }
    if (id === 'ov-clear') {
      setShowHypeBar(false);
      setShowChatOverlay(false);
      addToast("OVERLAY: Clear All", "overlay");
    }

    // Emergency
    if (id === 'sys-stop') {
       window.dispatchEvent(new Event('amalgam:emergency-stop'));
       if (autoSaveRef.current && isPreRecording) saveLastSixty(true);
       setIsLive(false);
       if (streamRef.current) streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (id.startsWith('scene-')) setShowDeck(false);
  };

  return (
    <>
    <div className="relative aspect-video w-full bg-base-950 rounded-[2.5rem] overflow-hidden shadow-[0_20px_60px_rgba(0,0,0,0.8)] group border border-white/5 ring-1 ring-white/10">
      {isLive ? (
        <>
          <video 
            ref={videoRef} 
            autoPlay 
            muted 
            playsInline 
            className={`w-full h-full object-cover transition-all duration-1000 ${activeScene === 'BRB' ? 'blur-3xl grayscale opacity-30' : 'grayscale-[10%] group-hover:grayscale-0'}`}
          />
          <canvas 
            ref={overlayCanvasRef}
            width={1280}
            height={720}
            className="absolute inset-0 pointer-events-none z-20 w-full h-full"
          />
        </>
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center bg-base-950 p-12 text-center">
          <div className="w-20 h-20 bg-brand-600/10 rounded-full flex items-center justify-center mb-6 animate-pulse border border-brand-600/20">
            <span className="text-4xl">📽️</span>
          </div>
          <h3 className="text-xl font-black text-brand-400 mb-2 uppercase tracking-tighter italic">Initializing Core...</h3>
          <p className="text-[10px] text-slate-500 max-w-md font-black uppercase tracking-[0.2em]">Syncing Production Nodes</p>
        </div>
      )}

      {activeScene !== 'Main' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
           <div className="bg-black/60 backdrop-blur-2xl px-16 py-8 rounded-[3rem] border border-brand-600/30 shadow-[0_0_50px_rgba(255,60,242,0.2)] animate-in fade-in zoom-in duration-500">
              <span className="text-5xl font-black text-white tracking-tighter uppercase italic neon-text-pink">{activeScene}</span>
           </div>
        </div>
      )}
      
      {isLive && (
        <div className="absolute top-8 left-8 flex flex-col gap-4 pointer-events-none z-30">
          <div className="bg-black/40 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-white/10 flex items-center gap-4 shadow-2xl">
            <div className={`w-2.5 h-2.5 rounded-full animate-pulse neon-glow-pink ${isDemoMode ? 'bg-brand-800' : 'bg-brand-600'}`}></div>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white">{isDemoMode ? 'DEMO PREVIEW' : 'LOCAL CAMERA PREVIEW'}</span>
          </div>
          
          <div className="bg-brand-600/5 backdrop-blur-xl px-4 py-3 rounded-2xl border border-brand-600/20 flex flex-col gap-2 w-52 shadow-xl">
            <div className="flex items-center gap-1 h-3">
              {[...Array(24)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1 rounded-full bg-brand-500 transition-all duration-100"
                  style={{ 
                    height: `${20 + (audioLevel * 1.5) * (Math.sin(i * 0.4 + (Date.now()/500)) + 1)}%`,
                    opacity: 0.3 + (audioLevel / 100)
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-y-4 group-hover:translate-y-0 z-30">
        <button 
          onClick={() => setShowDeck(true)}
          className="bg-brand-600 hover:bg-brand-700 text-white px-8 py-4 rounded-2xl font-black text-xs shadow-2xl transition-all uppercase tracking-[0.2em] flex items-center gap-4 border border-brand-400/20 neon-glow-pink"
        >
          <span className="text-xl">🎮</span>
          Deck Console
        </button>
      </div>

      {showDeck && <StreamDeck onClose={() => setShowDeck(false)} onAction={handleDeckAction} />}
    </div>
    <BroadcastTransport getStream={() => streamRef.current} />
    </>
  );
};

export default LiveStream;
