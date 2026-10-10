
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
  }
  return buffer;
}

const CoPilot: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [transcript, setTranscript] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [level, setLevel] = useState(0);
  
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

  const stopSession = useCallback(() => {
    if (sessionRef.current) {
      sessionRef.current.close();
      sessionRef.current = null;
    }
    setIsActive(false);
  }, []);

  const startSession = async () => {
    if (isActive || isConnecting) return;
    setIsConnecting(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = inputCtx;
      outputAudioContextRef.current = outputCtx;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            const source = inputCtx.createMediaStreamSource(stream);
            const processor = inputCtx.createScriptProcessor(4096, 1, 1);
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              let sum = 0;
              for (let i = 0; i < inputData.length; i++) sum += Math.abs(inputData[i]);
              setLevel(sum / inputData.length);

              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({ 
                  media: { data: encode(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' }
                });
              });
            };
            source.connect(processor);
            processor.connect(inputCtx.destination);
            setIsActive(true);
            setIsConnecting(false);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.serverContent?.outputTranscription) {
              setTranscript(prev => [...prev.slice(-10), { role: 'ai', text: message.serverContent!.outputTranscription!.text }]);
            } else if (message.serverContent?.inputTranscription) {
              setTranscript(prev => [...prev.slice(-10), { role: 'user', text: message.serverContent!.inputTranscription!.text }]);
            }

            const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (base64Audio) {
              const audioBuffer = await decodeAudioData(decode(base64Audio), outputCtx, 24000, 1);
              const source = outputCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(outputCtx.destination);
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => stopSession(),
          onerror: (e) => { console.error(e); stopSession(); }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } } },
          systemInstruction: 'You are Kore, a brilliant and slightly edgy AI stream co-host. You provide real-time commentary, hype the creator, and help with tech stats. Keep responses concise and production-ready.',
          outputAudioTranscription: {},
          inputAudioTranscription: {},
        }
      });

      sessionRef.current = await sessionPromise;
    } catch (error) {
      console.error("CoPilot Init Error:", error);
      setIsConnecting(false);
    }
  };

  return (
    <div className="bg-base-850 border border-white/5 rounded-[2.5rem] p-6 shadow-2xl relative overflow-hidden group">
      <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/5 rounded-bl-[100%] pointer-events-none"></div>
      
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500">Neural Co-Pilot</h3>
          <p className="text-[8px] font-mono text-slate-500">OS-INTEL-KORE-v3</p>
        </div>
        <button 
          onClick={isActive ? stopSession : startSession}
          disabled={true}
                title="AI co-pilot needs a server-side API proxy; no browser API key is exposed"
          className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
            isActive ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-brand-600 text-white shadow-lg shadow-brand-900/20'
          }`}
        >
          {isConnecting ? 'Syncing...' : isActive ? 'Disconnect' : 'Activate Kore'}
        </button>
      </div>

      <div className="space-y-4">
        {isActive ? (
          <>
            <div className="flex items-center gap-3 h-12 bg-black/40 rounded-2xl px-4 border border-white/5">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1 bg-brand-500 rounded-full transition-all duration-75"
                  style={{ height: `${20 + level * 200 * (0.5 + Math.random() * 0.5)}%` }}
                ></div>
              ))}
              <span className="flex-1 text-[10px] font-black text-brand-400 uppercase tracking-widest text-right">Voice Link Active</span>
            </div>

            <div className="space-y-2 max-h-32 overflow-y-auto custom-scrollbar pr-2">
              {transcript.map((t, i) => (
                <div key={i} className={`text-[10px] leading-relaxed ${t.role === 'ai' ? 'text-brand-300 italic' : 'text-slate-500'}`}>
                  <span className="font-black uppercase mr-2">{t.role === 'ai' ? 'Kore:' : 'You:'}</span>
                  {t.text}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="py-8 text-center bg-black/20 rounded-[2rem] border border-dashed border-white/5">
            <span className="text-2xl mb-3 block">🧬</span>
            <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest px-8">AI voice bridge pending secure server-side connection</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default CoPilot;
