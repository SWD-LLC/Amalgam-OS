
import React, { useState, useRef } from 'react';
import { generateAIVoiceClip } from '../services/geminiService';

interface SoundItem {
  id: string;
  label: string;
  icon: string;
  category: 'DISCORD' | 'AI SYNTH' | 'SFX' | 'REACTION';
  color: string;
  prompt: string;
}

const SOUNDS: SoundItem[] = [
  // DISCORD FAVORITES
  { id: 'dc-notif', label: 'Notification', icon: '🔔', category: 'DISCORD', color: 'bg-indigo-500', prompt: 'Perform a sharp, cheerful "Ping!" sound like a Discord notification.' },
  { id: 'dc-call', label: 'Incoming Call', icon: '📞', category: 'DISCORD', color: 'bg-indigo-500', prompt: 'Hum the rhythmic melody of the Discord ringtone.' },
  { id: 'dc-join', label: 'User Joined', icon: '📥', category: 'DISCORD', color: 'bg-emerald-500', prompt: 'Make a soft "bloop" sound for someone joining a voice channel.' },
  { id: 'dc-leave', label: 'User Left', icon: '📤', category: 'DISCORD', color: 'bg-rose-500', prompt: 'Make a descending "phew" sound for someone leaving a channel.' },
  { id: 'dc-mute', label: 'Muted', icon: '🔇', category: 'DISCORD', color: 'bg-slate-600', prompt: 'Say with a digital filter: "Mic muted."' },
  { id: 'dc-mod', label: 'The Mod', icon: '🛡️', category: 'DISCORD', color: 'bg-indigo-700', prompt: 'In a deep, serious voice, say: "Please refrain from posting memes in general."' },

  // AI SYNTH
  { id: 'ai-welcome', label: 'Amalgam OS', icon: '✨', category: 'AI SYNTH', color: 'bg-brand-600', prompt: 'Welcome to Amalgam OS. All systems nominal.' },
  { id: 'ai-hype', label: 'Hype Pulse', icon: '🔥', category: 'AI SYNTH', color: 'bg-brand-600', prompt: 'Warning: Audience hype levels are exceeding safety parameters! LFG!' },
  { id: 'ai-clip', label: 'Clip Saved', icon: '🎞️', category: 'AI SYNTH', color: 'bg-purple-600', prompt: 'Moment captured. Clipping to decentralized vault.' },
  
  // SFX
  // Fix: Added missing prompt property and completed the object
  { id: 'sfx-horn', label: 'Airhorn', icon: '📣', category: 'SFX', color: 'bg-orange-600', prompt: 'A loud, classic stadium airhorn sound.' },
  { id: 'sfx-applause', label: 'Applause', icon: '👏', category: 'SFX', color: 'bg-emerald-600', prompt: 'A short burst of enthusiastic applause.' },
  
  // REACTION
  { id: 'react-wow', label: 'Wow', icon: '😮', category: 'REACTION', color: 'bg-blue-500', prompt: 'A dramatic, surprised "Wow!"' },
];

/**
 * Soundboard component for triggering AI-generated audio clips.
 */
const Soundboard: React.FC = () => {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  const playSound = async (item: SoundItem) => {
    if (playingId) return;
    setPlayingId(item.id);
    
    try {
      const base64 = await generateAIVoiceClip(item.prompt);
      if (base64) {
        if (!audioContextRef.current) {
          audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        const ctx = audioContextRef.current;
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        
        // Manual PCM decoding for Gemini TTS output
        const dataInt16 = new Int16Array(bytes.buffer);
        const frameCount = dataInt16.length;
        const buffer = ctx.createBuffer(1, frameCount, 24000);
        const channelData = buffer.getChannelData(0);
        for (let i = 0; i < frameCount; i++) {
          channelData[i] = dataInt16[i] / 32768.0;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        source.onended = () => setPlayingId(null);
        source.start();
      } else {
        setPlayingId(null);
      }
    } catch (error) {
      console.error("Soundboard Error:", error);
      setPlayingId(null);
    }
  };

  return (
    <div className="bg-base-850 border border-white/5 rounded-[2.5rem] p-6 shadow-xl">
      <div className="flex justify-between items-center mb-6 px-2">
        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-500">Neural Soundboard</h3>
        <span className="text-[9px] font-mono text-slate-500">OES-CORE-v2</span>
      </div>
      
      <div className="grid grid-cols-3 gap-3">
        {SOUNDS.map(sound => (
          <button
            key={sound.id}
            onClick={() => playSound(sound)}
            disabled={!!playingId}
            className={`flex flex-col items-center justify-center p-3 rounded-2xl border border-white/5 transition-all group relative overflow-hidden ${
              playingId === sound.id ? 'ring-2 ring-brand-500 scale-95' : 'hover:border-white/10 hover:bg-white/5 active:scale-95'
            }`}
          >
            <div className={`absolute top-0 left-0 w-full h-0.5 opacity-40 ${sound.color}`}></div>
            <span className={`text-xl mb-1 transition-transform ${playingId === sound.id ? 'animate-bounce' : 'group-hover:scale-110'}`}>
              {sound.icon}
            </span>
            <span className="text-[8px] font-black uppercase tracking-tight text-slate-400 group-hover:text-slate-200 text-center leading-tight">
              {sound.label}
            </span>
            {playingId === sound.id && (
              <div className="absolute inset-0 bg-brand-500/10 flex items-center justify-center">
                 <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
};

// Fix: Added default export to resolve error in Dashboard.tsx
export default Soundboard;
