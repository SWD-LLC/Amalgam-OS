
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { optimizeProductListing } from '../services/geminiService';

const CATEGORIES = ["All", "Neural Art", "Gaming", "Ingest", "Social", "Dev"];

// Varied video sources for simulation
const VIDEO_SOURCES = [
  "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
  "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4"
];

interface SimulatedStream {
  id: string;
  title: string;
  creator: string;
  viewers: number;
  category: string;
  node: string;
  thumbnailId: number;
  videoUrl: string;
  isTrending?: boolean;
  quality: '720p' | '1080p' | '4K';
}

export const Discovery: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState("All");
  const [streams, setStreams] = useState<SimulatedStream[]>([]);
  const [selectedStream, setSelectedStream] = useState<SimulatedStream | null>(null);
  const [isTuning, setIsTuning] = useState(false);

  // Initialize simulated filler streams
  useEffect(() => {
    const creators = ["SynthWave", "0xAlpha", "Glitch_King", "Neural_Knight", "CodeRunner", "ByteMistress", "Void_Walker", "Kernel_Panic", "Pixel_Pioneer", "Echo_Logic"];
    const titles = [
      "Deep-Sea Neural Ingest", "Binary ASMR: Hardware edition", "Training Llama 4 on 128 GPUs", 
      "The Void: 24/7 Lo-fi Code", "Ingesting the Global Feed", "Level 99 Neural Sculpting", 
      "Hardware Modding live from Node-7", "Quantum Chess: Grandmaster Tier", "Synthesizing the Future", "OES Core Troubleshooting"
    ];
    const nodes = ["WEST-US-1", "EUR-DE-4", "ASIA-JP-9", "NORTH-CA-2", "SOUTH-BR-1"];
    const qualities: ('720p' | '1080p' | '4K')[] = ['720p', '1080p', '4K'];

    const initialStreams = Array.from({ length: 16 }).map((_, i) => ({
      id: `sim-${i}`,
      title: titles[i % titles.length],
      creator: creators[i % creators.length],
      viewers: Math.floor(Math.random() * 15000) + 500,
      category: CATEGORIES[1 + (i % (CATEGORIES.length - 1))],
      node: nodes[i % nodes.length],
      thumbnailId: i + 100,
      videoUrl: VIDEO_SOURCES[i % VIDEO_SOURCES.length],
      isTrending: Math.random() > 0.8,
      quality: qualities[i % qualities.length]
    }));

    setStreams(initialStreams);
  }, []);

  // Viewer fluctuation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setStreams(prev => prev.map(s => ({
        ...s,
        viewers: Math.max(10, s.viewers + (Math.random() > 0.5 ? 1 : -1) * Math.floor(Math.random() * 50))
      })));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleStreamClick = (stream: SimulatedStream) => {
    setIsTuning(true);
    setSelectedStream(stream);
    setTimeout(() => setIsTuning(false), 1500); // Simulate connection latency
  };

  const filteredStreams = useMemo(() => {
    if (activeCategory === "All") return streams;
    return streams.filter(s => s.category === activeCategory);
  }, [streams, activeCategory]);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 pb-32">
      <div className="border-b border-white/5 pb-8 space-y-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Discovery Node</h2>
          <p className="text-slate-500 font-medium">Deep-indexed Creatorverse content. Minimum 720p standard enforced across all nodes.</p>
        </div>

        {/* Category Pill Bar */}
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border ${
                activeCategory === cat 
                  ? 'bg-brand-600 border-brand-500 text-white shadow-lg shadow-brand-900/40' 
                  : 'bg-white/5 border-white/5 text-slate-500 hover:border-white/10 hover:text-slate-300'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredStreams.map((stream) => (
          <div key={stream.id} className="group cursor-pointer" onClick={() => handleStreamClick(stream)}>
            <div className="bg-base-850 aspect-video rounded-[2.5rem] border border-white/5 mb-5 group-hover:border-brand-500/40 transition-all overflow-hidden relative shadow-2xl">
              <video 
                src={stream.videoUrl} 
                muted 
                autoPlay 
                loop 
                playsInline
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 opacity-60 group-hover:opacity-100" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
              
              {/* Overlay Tags */}
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="bg-red-600 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-2 shadow-lg">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                  Live
                </div>
                <div className="bg-white/10 backdrop-blur-md text-white text-[8px] font-black px-2 py-1 rounded-full border border-white/10 uppercase tracking-widest">
                  {stream.quality}
                </div>
              </div>

              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10 text-[9px] font-mono text-slate-300">
                {stream.node}
              </div>

              {/* Bottom In-Image Info */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-3">
                   <div className="w-8 h-8 rounded-full border-2 border-brand-500/50 overflow-hidden shadow-lg">
                      <img src={`https://picsum.photos/seed/${stream.creator}/50`} className="w-full h-full object-cover" />
                   </div>
                   <div className="flex-1">
                      <p className="text-[10px] font-black text-white tracking-widest uppercase mb-0.5">{stream.creator}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono text-brand-400">{stream.viewers.toLocaleString()}</span>
                        <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">ingesting</span>
                      </div>
                   </div>
                </div>
              </div>
            </div>

            <div className="px-3 space-y-1.5">
              <h3 className="text-sm font-bold text-slate-100 group-hover:text-brand-400 transition-colors leading-tight line-clamp-1">{stream.title}</h3>
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{stream.category}</span>
                <span className="text-[9px] font-mono text-slate-700 uppercase">Quality: {stream.quality}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Immersive Cinema Mode Modal */}
      {selectedStream && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-3xl animate-in fade-in duration-300 overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-20">
             <video src={selectedStream.videoUrl} autoPlay muted loop className="w-full h-full object-cover blur-3xl" />
          </div>

          <div className="relative w-full h-full max-w-[1600px] flex flex-col md:flex-row p-4 md:p-12 gap-8 z-10">
            {/* Player Area */}
            <div className="flex-1 flex flex-col gap-6">
               <div className="relative aspect-video w-full bg-base-950 rounded-[3rem] overflow-hidden border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)]">
                  {isTuning ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center space-y-8 bg-base-950">
                       <div className="w-24 h-24 relative">
                          <div className="absolute inset-0 border-4 border-brand-600/20 rounded-full"></div>
                          <div className="absolute inset-0 border-4 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                       </div>
                       <div className="text-center space-y-2">
                          <p className="text-xs font-black text-brand-400 uppercase tracking-[0.4em]">Establishing Neural Link</p>
                          <p className="text-[10px] text-slate-600 font-mono">NODE: {selectedStream.node} // QUALITY: {selectedStream.quality}</p>
                       </div>
                    </div>
                  ) : (
                    <video 
                      src={selectedStream.videoUrl} 
                      autoPlay 
                      controls={false}
                      loop 
                      className="w-full h-full object-contain"
                    />
                  )}

                  {/* Player Overlays */}
                  <div className="absolute top-8 left-8 flex items-center gap-4">
                     <button 
                       onClick={() => setSelectedStream(null)}
                       className="bg-black/60 hover:bg-black/80 text-white w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10 transition-all hover:scale-105"
                     >
                       ✕
                     </button>
                     <div className="bg-red-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-xl">
                       {selectedStream.quality} Production
                     </div>
                  </div>
               </div>

               <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-[2rem] border-2 border-brand-500 overflow-hidden shadow-2xl">
                      <img src={`https://picsum.photos/seed/${selectedStream.creator}/200`} className="w-full h-full object-cover" />
                    </div>
                    <div>
                      <h1 className="text-2xl font-black text-white tracking-tight leading-tight">{selectedStream.title}</h1>
                      <p className="text-[11px] font-black text-brand-400 uppercase tracking-widest">{selectedStream.creator}</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="text-right">
                       <span className="text-2xl font-black text-white block tracking-tighter">{selectedStream.viewers.toLocaleString()}</span>
                       <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Global Ingests</span>
                     </div>
                  </div>
               </div>
            </div>

            {/* Simulated Live Chat for the specific stream */}
            <div className="w-full md:w-[400px] flex flex-col bg-base-900/60 backdrop-blur-md rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
               <div className="p-8 border-b border-white/5">
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">Local Ingest Feed</h3>
               </div>
               <div className="flex-1 p-6 space-y-6 overflow-y-auto custom-scrollbar">
                  {[1,2,3,4,5,6,7,8,9,10].map(i => (
                    <div key={i} className="animate-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${i * 100}ms` }}>
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black text-brand-400 uppercase">User_{i * 123}</span>
                          <span className="text-[9px] text-slate-600 font-mono">12:{i}pm</span>
                       </div>
                       <div className="bg-white/5 p-4 rounded-2xl text-xs text-slate-300 border border-white/5">
                          {["Incredible fidelity!", "LFG!!!", "Node health looking green.", "This neural ingest is peak.", "How do I subscribe?", "Amalgam v2.5 confirmed?"][i % 6]}
                       </div>
                    </div>
                  ))}
               </div>
               <div className="p-6 bg-black/20 border-t border-white/5">
                  <div className="bg-base-950 border border-white/10 p-4 rounded-2xl text-[10px] font-black text-slate-600 uppercase tracking-widest text-center italic">
                    Connection encrypted via Node-Relay
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface MerchItem {
  name: string;
  cat: string;
  price: string;
  isNew?: boolean;
  description?: string;
}

export const Marketplace: React.FC = () => {
  const [items, setItems] = useState<MerchItem[]>([
    { name: 'Ultra-Real Voice Stems', cat: 'Audio Extension', price: '$24.99', description: 'Neural voice reproduction for background synthesis.' },
    { name: 'Neural Overlays v2', cat: 'Vision Extension', price: '$49.00', description: 'Advanced face tracking and AR visual layers.' },
    { name: 'Multicast Pro', cat: 'Network Extension', price: '$12.00/mo', description: 'Simultaneous stream delivery to 12+ platforms.' },
    { name: 'Amalgam Signature Hoodie', cat: 'Apparel', price: '$65.00', description: 'Premium creator-grade fabric with NFC identity tag.' },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [newMerch, setNewMerch] = useState({ name: '', price: '' });

  const handleAddMerch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMerch.name || !newMerch.price) return;

    setIsOptimizing(true);
    // Use Gemini to optimize the listing before adding
    const optimized = await optimizeProductListing(newMerch.name, newMerch.price);
    
    const newItem: MerchItem = {
      name: optimized.title,
      cat: optimized.category,
      price: newMerch.price,
      description: optimized.description,
      isNew: true
    };

    setItems([newItem, ...items]);
    setNewMerch({ name: '', price: '' });
    setIsOptimizing(false);
    setIsModalOpen(false);
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-12 animate-in fade-in duration-500 relative">
      <div className="flex flex-col md:flex-row md:items-end justify-between border-b border-white/5 pb-8 gap-6">
        <div>
          <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">OES Marketplace</h2>
          <p className="text-slate-500 font-medium italic">Streamer-owned assets & Neural extensions.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-brand-600 hover:bg-brand-500 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-brand-900/20 transition-all hover:scale-105 active:scale-95"
        >
          List New Merch
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item, i) => (
          <div key={i} className={`bg-base-850 rounded-[2.5rem] border ${item.isNew ? 'border-brand-500/40 shadow-brand-500/10' : 'border-white/5'} p-10 hover:border-brand-600/30 transition-all group shadow-xl relative overflow-hidden animate-in zoom-in duration-300`}>
            {item.isNew && (
              <div className="absolute top-6 right-6 bg-brand-500 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-widest animate-pulse">
                New Release
              </div>
            )}
            <div className={`w-14 h-14 rounded-2xl mb-8 flex items-center justify-center text-sm font-black italic transition-all ${item.isNew ? 'bg-brand-600 text-white shadow-lg' : 'bg-brand-600/10 text-brand-500 group-hover:bg-brand-600 group-hover:text-white'}`}>
              OES
            </div>
            <h3 className="text-xl font-black text-white mb-2 leading-tight">{item.name}</h3>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">{item.cat}</p>
            <p className="text-xs text-slate-400 mb-8 line-clamp-2 leading-relaxed">
              {item.description || "A premium creator asset from the Amalgam ecosystem."}
            </p>
            <div className="flex items-center justify-between mb-8">
              <span className="text-2xl font-black text-brand-400">{item.price}</span>
              <span className="text-[9px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded uppercase tracking-widest">Verified</span>
            </div>
            <button className="w-full py-4 bg-white/5 hover:bg-white text-slate-400 hover:text-black rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
              License Now
            </button>
          </div>
        ))}
      </div>

      {/* Add Merch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-black/60 animate-in fade-in duration-200">
          <div className="bg-base-900 border border-white/10 rounded-[3rem] w-full max-w-lg overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h3 className="text-xl font-black text-white tracking-tight uppercase">Merchant Portal</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">AI Listing Specialist Active</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 transition-all"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleAddMerch} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Product Concept</label>
                <input 
                  autoFocus
                  type="text" 
                  value={newMerch.name}
                  onChange={(e) => setNewMerch({...newMerch, name: e.target.value})}
                  placeholder="e.g. Neon Samurai Hoodie"
                  className="w-full bg-base-950 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-500 transition-all text-white placeholder:text-slate-700"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-2">Listing Price</label>
                <input 
                  type="text" 
                  value={newMerch.price}
                  onChange={(e) => setNewMerch({...newMerch, price: e.target.value})}
                  placeholder="$49.00"
                  className="w-full bg-base-950 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:border-brand-500 transition-all text-white placeholder:text-slate-700"
                />
              </div>

              <div className="bg-brand-500/5 border border-brand-500/10 p-4 rounded-2xl">
                <p className="text-[10px] text-brand-400 italic text-center">
                  Gemini AI will automatically optimize your title and description for high-fidelity production feel upon submission.
                </p>
              </div>

              <button 
                type="submit"
                disabled={isOptimizing || !newMerch.name || !newMerch.price}
                className={`w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center justify-center gap-3 ${
                  isOptimizing ? 'bg-slate-800 text-slate-500' : 'bg-brand-600 text-white hover:bg-brand-500 shadow-brand-900/40'
                }`}
              >
                {isOptimizing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    Optimizing Brand...
                  </>
                ) : 'Submit to Market'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export const Wallet: React.FC = () => (
  <div className="p-8 max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
    <div className="border-b border-white/5 pb-8">
      <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic">Amalgam Revenue</h2>
      <p className="text-slate-500 font-medium">Secure financial routing and creator earnings management.</p>
    </div>
    <div className="bg-gradient-to-br from-brand-700 to-indigo-900 p-16 rounded-[4rem] shadow-2xl relative overflow-hidden group">
       <div className="absolute -top-32 -right-32 w-80 h-80 bg-white/10 rounded-full blur-[100px] group-hover:scale-110 transition-transform duration-1000"></div>
       <div className="absolute top-12 right-12 text-6xl opacity-20 group-hover:rotate-12 transition-transform">💳</div>
       <span className="text-brand-200/60 text-[11px] font-black uppercase tracking-[0.3em] mb-4 block">Current Available Liquidity</span>
       <h3 className="text-7xl font-black text-white mb-16 tracking-tighter">$14,242.80</h3>
       <div className="flex flex-col sm:flex-row gap-4">
          <button className="flex-1 px-10 py-5 bg-white text-brand-900 rounded-[2rem] font-black text-xs uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl">Withdraw Funds</button>
          <button className="flex-1 px-10 py-5 bg-brand-600/40 text-white rounded-[2rem] font-black text-xs uppercase tracking-widest border border-brand-400/20 hover:bg-brand-600/60 transition-all backdrop-blur-md">Platform Bridge</button>
       </div>
    </div>
    
    <div className="bg-base-850 border border-white/5 rounded-[2.5rem] p-10 shadow-xl">
       <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">Recent Ingest Transactions</h3>
       <div className="space-y-6">
          {[
            { label: 'Marketplace Sale', date: '2h ago', amount: '+$42.00', type: 'Credit' },
            { label: 'Relay Fee Distribution', date: '5h ago', amount: '-$12.50', type: 'Debit' },
            { label: 'Twitch Partner Payout', date: '1d ago', amount: '+$1,120.00', type: 'Credit' },
          ].map((tx, i) => (
            <div key={i} className="flex items-center justify-between py-4 border-b border-white/5 last:border-0">
               <div>
                  <span className="text-sm font-bold text-slate-200 block">{tx.label}</span>
                  <span className="text-[10px] text-slate-500 font-medium">{tx.date} • {tx.type}</span>
               </div>
               <span className={`text-lg font-black ${tx.amount.startsWith('+') ? 'text-emerald-500' : 'text-slate-400'}`}>
                  {tx.amount}
               </span>
            </div>
          ))}
       </div>
    </div>
  </div>
);

export const Governance: React.FC = () => {
  const [votes, setVotes] = useState({ yes: 1240, no: 340 });
  const [voted, setVoted] = useState(false);

  const handleVote = (type: 'yes' | 'no') => {
    if (voted) return;
    setVotes(prev => ({ ...prev, [type]: prev[type] + 1 }));
    setVoted(true);
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-16 pb-32 animate-in fade-in duration-500">
      <div className="text-center space-y-6">
        <h2 className="text-6xl font-black italic tracking-tighter uppercase text-white">Amalgam Constitution</h2>
        <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg">Autonomous governance for the Creatorverse. Code is Law. Community is Ingest.</p>
      </div>

      <div className="bg-base-850 border border-white/5 rounded-[3rem] p-12 shadow-[0_40px_80px_rgba(0,0,0,0.5)] relative overflow-hidden">
         <div className="absolute top-0 right-0 w-32 h-32 bg-brand-500/10 rounded-bl-[10rem] border-b border-l border-white/5"></div>
         <div className="flex justify-between items-start mb-10">
            <div>
              <span className="text-[11px] font-black text-brand-500 uppercase tracking-widest mb-3 block">Proposal #104 (Injected)</span>
              <h3 className="text-3xl font-black text-white tracking-tight">Standardize OES Relay Fees to 2.5%</h3>
            </div>
            <div className="bg-emerald-500/10 text-emerald-500 px-5 py-2 rounded-full text-[10px] font-black border border-emerald-500/20 tracking-widest shadow-lg shadow-emerald-950/20">VOTING ACTIVE</div>
         </div>
         
         <p className="text-slate-400 text-lg leading-relaxed mb-12">
            This proposal suggests a reduction in mandatory restreaming relay fees to encourage ecosystem growth. By lowering the entry barrier, we aim to increase global node density and reduce overall platform latency.
         </p>

         <div className="space-y-4 mb-12">
            <div className="flex justify-between text-[11px] font-black uppercase tracking-widest mb-2">
               <span className="text-brand-400">Support ({Math.round((votes.yes / (votes.yes + votes.no)) * 100)}%)</span>
               <span className="text-slate-500">Oppose ({Math.round((votes.no / (votes.yes + votes.no)) * 100)}%)</span>
            </div>
            <div className="w-full h-5 bg-base-950 rounded-full overflow-hidden flex ring-1 ring-white/5">
               <div className="bg-brand-600 h-full transition-all duration-1000 shadow-[0_0_20px_rgba(92,114,255,0.4)]" style={{ width: `${(votes.yes / (votes.yes + votes.no)) * 100}%` }}></div>
            </div>
         </div>

         <div className="flex flex-col sm:flex-row gap-6">
            <button 
              onClick={() => handleVote('yes')} 
              disabled={voted} 
              className="flex-1 py-6 rounded-[2rem] font-black text-xs bg-brand-600 text-white uppercase tracking-[0.3em] disabled:bg-slate-800 disabled:text-slate-600 transition-all hover:scale-[1.02] shadow-xl shadow-brand-900/20"
            >
              {voted ? 'Ingested' : 'Vote Affirmative'}
            </button>
            <button 
              onClick={() => handleVote('no')} 
              disabled={voted} 
              className="flex-1 py-6 rounded-[2rem] font-black text-xs bg-white/5 text-slate-400 border border-white/10 uppercase tracking-[0.3em] disabled:bg-slate-800 transition-all hover:bg-white/10"
            >
              Vote Negative
            </button>
         </div>
      </div>
    </div>
  );
};
