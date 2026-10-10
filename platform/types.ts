
export interface Message {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
  isAI?: boolean;
  status?: 'normal' | 'flagged' | 'highlight' | 'clip_alert' | 'system';
}

export interface StreamData {
  id: string;
  title: string;
  creator: string;
  viewers: number;
  thumbnail: string;
  category: string;
  isLive: boolean;
}

export interface LinkedPlatform {
  id: string;
  name: string;
  icon: string;
  status: 'online' | 'offline' | 'error';
  viewers: number;
  linked: boolean;
  bitrate?: string;
  latency?: string;
}

export interface ClipSuggestion {
  id: string;
  startTime: string;
  endTime: string;
  reason: string;
  confidence: number;
  title: string;
  thumbnail?: string;
}

export interface StreamStats {
  viewers: number;
  likes: number;
  avgWatchTime: string;
  engagement: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  burnoutRisk: 'low' | 'moderate' | 'high';
}

export enum View {
  Studio = 'studio',
  Discovery = 'discovery',
  Marketplace = 'marketplace',
  Wallet = 'wallet',
  Governance = 'governance',
  VideoForge = 'videoforge'
}
