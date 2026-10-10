import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeWhipEndpoint } from './whipClient.ts';

test('WHIP requires HTTPS outside localhost', () => {
  assert.equal(normalizeWhipEndpoint('https://media.example.test/whip').pathname, '/whip');
  assert.equal(normalizeWhipEndpoint('http://localhost:8889/whip').port, '8889');
  assert.throws(() => normalizeWhipEndpoint('http://media.example.test/whip'), /HTTPS/);
  assert.throws(() => normalizeWhipEndpoint('https://secret:password@media.example.test/whip'), /credentials/);
  assert.throws(() => normalizeWhipEndpoint('https://media.example.test/whip#token'), /fragment/);
});

test('201+Location, connected peer, outbound RTP and DELETE lifecycle', async () => {
  const oldRTCPeerConnection = globalThis.RTCPeerConnection;
  const oldFetch = globalThis.fetch;
  const methods: string[] = [];
  class Peer {
    connectionState = 'new';
    iceGatheringState = 'complete';
    localDescription: any = null;
    listeners = new Map<string, Function[]>();
    addTrack() { return {}; }
    createOffer() { return Promise.resolve({ type: 'offer', sdp: 'v=0\r\nm=video 9 UDP/TLS/RTP/SAVPF 96' }); }
    setLocalDescription(offer: any) { this.localDescription = offer; return Promise.resolve(); }
    async setRemoteDescription() { this.connectionState = 'connected'; this.listeners.get('connectionstatechange')?.forEach(fn => fn()); }
    addEventListener(k:string,fn:Function) { this.listeners.set(k, [...(this.listeners.get(k) || []), fn]); }
    removeEventListener(k:string,fn:Function) { this.listeners.set(k, (this.listeners.get(k) || []).filter(x=>x!==fn)); }
    getStats() { return Promise.resolve(new Map([['a', { type:'outbound-rtp', bytesSent: 5678, isRemote:false }]])); }
    close() { this.connectionState='closed'; }
  }
  (globalThis as any).RTCPeerConnection = Peer;
  (globalThis as any).fetch = async (_url: string, opts: any) => {
    methods.push(opts.method);
    if (opts.method === 'DELETE') return new Response(null, {status:204});
    return new Response('v=0\r\nm=video 9 UDP/TLS/RTP/SAVPF 96', { status:201, headers: { Location:'/whip/session/abc' } });
  };
  try {
    const { publishWhip } = await import('./whipClient.ts');
    const stream = { getTracks: () => [{ readyState: 'live', kind: 'video' }] } as any;
    const published = await publishWhip(stream, 'https://media.example.test/whip');
    assert.equal(published.pc.connectionState, 'connected');
    assert.equal(await published.outboundBytes(), 5678);
    assert.equal(published.resourceUrl, 'https://media.example.test/whip/session/abc');
    await published.stop();
    assert.deepEqual(methods, ['POST','DELETE']);
  } finally {
    globalThis.fetch=oldFetch;
    (globalThis as any).RTCPeerConnection=oldRTCPeerConnection;
  }
});

test('WHIP does not accept a successful-looking 200 as a published session', async () => {
  const oldRTCPeerConnection = globalThis.RTCPeerConnection;
  const oldFetch = globalThis.fetch;
  class Peer {
    iceGatheringState='complete'; connectionState='new';
    localDescription:any={sdp:'v=0\r\nm=audio 9 UDP/TLS/RTP/SAVPF 111'};
    addTrack() {}
    createOffer(){return Promise.resolve(this.localDescription);}
    setLocalDescription(){return Promise.resolve();}
    addEventListener(){} removeEventListener(){} close(){this.connectionState='closed';}
  }
  (globalThis as any).RTCPeerConnection=Peer;
  (globalThis as any).fetch=async()=>new Response('fake response',{status:200});
  try {
    const { publishWhip } = await import('./whipClient.ts');
    await assert.rejects(publishWhip({getTracks:()=>[{readyState:'live'}]} as any,'https://media.example.test/whip'),/HTTP 201/);
  } finally {globalThis.fetch=oldFetch;(globalThis as any).RTCPeerConnection=oldRTCPeerConnection;}
});
