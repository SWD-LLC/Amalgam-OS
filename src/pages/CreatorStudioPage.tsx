import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

type StudioPanel = 'session' | 'chat' | 'people' | 'brand' | 'media' | 'layout' | 'health';
type StageLayout = 'solo' | 'split';

const panels: Array<{ id: StudioPanel; label: string }> = [
  { id: 'session', label: 'Session' },
  { id: 'chat', label: 'Chat' },
  { id: 'people', label: 'People' },
  { id: 'brand', label: 'Brand' },
  { id: 'media', label: 'Media' },
  { id: 'layout', label: 'Layout' },
  { id: 'health', label: 'Health' },
];

function PanelIcon({ panel }: { panel: StudioPanel }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (panel) {
    case 'session':
      return <svg {...common}><circle cx="12" cy="12" r="7" /><path d="M12 8v4l3 2" /></svg>;
    case 'chat':
      return <svg {...common}><path d="M5 6h14v9H9l-4 3V6Z" /></svg>;
    case 'people':
      return <svg {...common}><circle cx="9" cy="9" r="3" /><circle cx="17" cy="10" r="2.5" /><path d="M4 19c.7-3 2.5-4.5 5-4.5s4.3 1.5 5 4.5M15 15.5c2.5.2 4 1.4 4.8 3.5" /></svg>;
    case 'brand':
      return <svg {...common}><path d="M5 8h14v10H5z" /><path d="M8 8V5h8v3M9 13h6" /></svg>;
    case 'media':
      return <svg {...common}><rect x="4" y="5" width="16" height="14" rx="2" /><path d="m9 9 6 3-6 3V9Z" /></svg>;
    case 'layout':
      return <svg {...common}><rect x="4" y="4" width="7" height="7" rx="1" /><rect x="13" y="4" width="7" height="7" rx="1" /><rect x="4" y="13" width="7" height="7" rx="1" /><rect x="13" y="13" width="7" height="7" rx="1" /></svg>;
    case 'health':
      return <svg {...common}><path d="M4 13h4l2-5 4 9 2-4h4" /></svg>;
  }
}

export function CreatorStudioPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const [activePanel, setActivePanel] = useState<StudioPanel>('session');
  const [stageLayout, setStageLayout] = useState<StageLayout>('solo');
  const [cameraEnabled, setCameraEnabled] = useState(true);
  const [micEnabled, setMicEnabled] = useState(true);
  const [previewActive, setPreviewActive] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [recordingType, setRecordingType] = useState('video/webm');
  const [error, setError] = useState<string | null>(null);
  const [lowerThirdVisible, setLowerThirdVisible] = useState(true);
  const [lowerThirdName, setLowerThirdName] = useState('Creator');
  const [lowerThirdDetail, setLowerThirdDetail] = useState('Amalgam session');

  const recorderSupported = typeof MediaRecorder !== 'undefined';

  useEffect(() => {
    return () => {
      recorderRef.current?.state === 'recording' && recorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  useEffect(() => {
    return () => {
      if (recordingUrl) URL.revokeObjectURL(recordingUrl);
    };
  }, [recordingUrl]);

  async function ensureStream() {
    if (streamRef.current) return streamRef.current;

    if (!navigator.mediaDevices?.getUserMedia) {
      setError('Camera and microphone access are not available in this browser.');
      return null;
    }

    if (!cameraEnabled && !micEnabled) {
      setError('Turn on the camera or microphone before starting local capture.');
      return null;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: cameraEnabled,
        audio: micEnabled,
      });

      streamRef.current = stream;
      setPreviewActive(true);
      setError(null);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      return stream;
    } catch {
      setError('Amalgam could not access the selected camera or microphone. Check browser permissions.');
      return null;
    }
  }

  async function startPreview() {
    await ensureStream();
  }

  function stopPreview() {
    if (recorderRef.current?.state === 'recording') {
      stopRecording();
    }

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setPreviewActive(false);
  }

  function toggleCamera() {
    const next = !cameraEnabled;
    setCameraEnabled(next);
    streamRef.current?.getVideoTracks().forEach((track) => {
      track.enabled = next;
    });
  }

  function toggleMicrophone() {
    const next = !micEnabled;
    setMicEnabled(next);
    streamRef.current?.getAudioTracks().forEach((track) => {
      track.enabled = next;
    });
  }

  function chooseMimeType(stream: MediaStream) {
    if (!recorderSupported) return '';

    const candidates = stream.getVideoTracks().length > 0
      ? [
          'video/webm;codecs=vp9,opus',
          'video/webm;codecs=vp8,opus',
          'video/webm',
        ]
      : [
          'audio/webm;codecs=opus',
          'audio/webm',
        ];

    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) ?? '';
  }

  async function startRecording() {
    if (!recorderSupported) {
      setError('Local browser recording is not supported here.');
      return;
    }

    const stream = await ensureStream();
    if (!stream) return;

    try {
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl);
        setRecordingUrl(null);
      }

      chunksRef.current = [];
      const mimeType = chooseMimeType(stream);
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      recorderRef.current = recorder;

      recorder.addEventListener('dataavailable', (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      });

      recorder.addEventListener('stop', () => {
        const type = recorder.mimeType || mimeType || 'video/webm';
        const blob = new Blob(chunksRef.current, { type });
        setRecordingType(type);

        if (blob.size > 0) {
          setRecordingUrl(URL.createObjectURL(blob));
        }

        setRecording(false);
      });

      recorder.addEventListener('error', () => {
        setError('The browser recorder stopped unexpectedly.');
        setRecording(false);
      });

      recorder.start(1000);
      setRecording(true);
      setError(null);
    } catch {
      setError('Amalgam could not start local recording with the current browser media configuration.');
    }
  }

  function stopRecording() {
    const recorder = recorderRef.current;
    if (!recorder || recorder.state === 'inactive') return;

    try {
      if (recorder.state === 'recording') recorder.requestData();
    } catch {
      // Some browsers do not allow requestData during a state transition.
    }

    recorder.stop();
  }

  function endSession() {
    stopPreview();
    setActivePanel('session');
  }

  function renderPanel() {
    if (activePanel === 'session') {
      return (
        <div className="space-y-5">
          <PanelHeading title="Session" copy="One place for capture state, recording output and external broadcast readiness." />
          <div className="grid gap-3">
            <StatusCard
              title="Local preview"
              status={previewActive ? 'Active in this browser' : 'Off'}
              tone={previewActive ? 'ready' : 'neutral'}
            />
            <StatusCard
              title="Local recording"
              status={recording ? 'Recording' : recordingUrl ? 'Recording ready' : 'Idle'}
              tone={recording ? 'recording' : recordingUrl ? 'ready' : 'neutral'}
            />
            <StatusCard title="External broadcast" status="Not configured" tone="neutral" />
          </div>
          <div className="border-t border-slate-800 pt-4">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Destinations</p>
            {['Twitch', 'YouTube', 'Kick', 'Custom RTMP'].map((destination) => (
              <div key={destination} className="flex items-center justify-between border-b border-slate-900 py-3 last:border-0">
                <span className="text-sm text-slate-300">{destination}</span>
                <span className="text-xs text-slate-500">Unavailable until configured</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    if (activePanel === 'chat') {
      return (
        <div className="flex h-full flex-col">
          <PanelHeading title="Chat" copy="Platform chat stays empty until a real provider connection is available." />
          <div className="mt-6 flex flex-1 items-center justify-center border border-dashed border-slate-800 bg-slate-950/50 p-6 text-center">
            <div>
              <p className="font-medium text-slate-200">No chat source connected</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">Twitch, YouTube and other platform chat will appear here after OAuth and chat transport are configured.</p>
              <Link to="/settings" className="mt-4 inline-flex border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 hover:border-slate-500">
                Open settings
              </Link>
            </div>
          </div>
        </div>
      );
    }

    if (activePanel === 'people') {
      return (
        <div className="space-y-5">
          <PanelHeading title="People" copy="The local creator is present. Remote guests require a connected guest/session service." />
          <div className="border border-slate-800 bg-slate-950/60 p-4">
            <p className="text-sm font-semibold text-slate-100">You</p>
            <p className="mt-1 text-xs text-slate-500">Local browser participant</p>
          </div>
          <div className="border border-dashed border-slate-800 p-4">
            <p className="text-sm text-slate-300">Guest invitations are not available in this build.</p>
          </div>
        </div>
      );
    }

    if (activePanel === 'brand') {
      return (
        <div className="space-y-5">
          <PanelHeading title="Brand" copy="Control the local lower third shown over the preview." />
          <label className="block text-xs font-medium text-slate-400">
            Display name
            <input
              value={lowerThirdName}
              onChange={(event) => setLowerThirdName(event.target.value)}
              className="mt-2 w-full border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-500"
            />
          </label>
          <label className="block text-xs font-medium text-slate-400">
            Detail
            <input
              value={lowerThirdDetail}
              onChange={(event) => setLowerThirdDetail(event.target.value)}
              className="mt-2 w-full border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none focus:border-violet-500"
            />
          </label>
          <button
            type="button"
            onClick={() => setLowerThirdVisible((value) => !value)}
            className="w-full bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400"
          >
            {lowerThirdVisible ? 'Hide lower third' : 'Show lower third'}
          </button>
        </div>
      );
    }

    if (activePanel === 'media') {
      return (
        <div className="space-y-5">
          <PanelHeading title="Media" copy="Local browser recordings appear here after the recorder finishes." />
          {recordingUrl ? (
            <div className="border border-slate-800 bg-slate-950/60 p-4">
              <p className="font-medium text-slate-100">Recording ready</p>
              <p className="mt-1 text-xs text-slate-500">{recordingType}</p>
              <a
                href={recordingUrl}
                download="amalgam-recording.webm"
                className="mt-4 inline-flex bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400"
              >
                Download recording
              </a>
            </div>
          ) : (
            <div className="border border-dashed border-slate-800 p-5 text-sm text-slate-500">
              No completed local recording yet.
            </div>
          )}
        </div>
      );
    }

    if (activePanel === 'layout') {
      return (
        <div className="space-y-5">
          <PanelHeading title="Layout" copy="Stage composition is local only. Split mode reserves a second participant slot." />
          <div className="grid grid-cols-2 gap-3">
            {(['solo', 'split'] as StageLayout[]).map((layout) => (
              <button
                type="button"
                key={layout}
                onClick={() => setStageLayout(layout)}
                className={`border px-3 py-4 text-sm font-semibold capitalize ${
                  stageLayout === layout
                    ? 'border-violet-500 bg-violet-500/10 text-violet-200'
                    : 'border-slate-800 text-slate-400 hover:border-slate-600'
                }`}
              >
                {layout}
              </button>
            ))}
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-5">
        <PanelHeading title="Health" copy="Health states report only what this browser can verify." />
        <StatusCard title="Camera / microphone API" status={navigator.mediaDevices?.getUserMedia ? 'Available' : 'Unavailable'} tone={navigator.mediaDevices?.getUserMedia ? 'ready' : 'neutral'} />
        <StatusCard title="Browser recorder" status={recorderSupported ? 'Available' : 'Unavailable'} tone={recorderSupported ? 'ready' : 'neutral'} />
        <StatusCard title="External ingest confirmation" status="Unavailable" tone="neutral" />
        <p className="text-xs leading-5 text-slate-500">
          Amalgam does not label a session live until an external transport and destination receipt are actually available.
        </p>
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-[#080b12] text-slate-100">
      <header className="flex min-h-[70px] flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#0b0f17] px-4 py-3 lg:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link to="/" className="text-sm font-black tracking-[0.22em] text-white">AMALGAM</Link>
          <span className="hidden h-5 w-px bg-slate-700 sm:block" />
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-200">Creator Studio</p>
            <p className="truncate text-xs text-slate-500">Untitled session</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-400">
            Broadcast off
          </span>
          <span className="border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-semibold text-slate-400">
            {previewActive ? 'Local preview on' : 'Preview off'}
          </span>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-70px)] lg:grid-cols-[minmax(0,1fr)_370px]">
        <div className="relative flex min-h-[620px] flex-col overflow-hidden bg-[#06090f]">
          <div className="flex flex-1 items-center justify-center p-4 lg:p-8">
            <div className={`grid w-full max-w-6xl gap-3 ${stageLayout === 'split' ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
              <div className="relative aspect-video overflow-hidden border border-slate-800 bg-black shadow-2xl shadow-black/40">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`h-full w-full object-cover ${previewActive && cameraEnabled ? 'block' : 'hidden'}`}
                />

                {(!previewActive || !cameraEnabled) && (
                  <div className="absolute inset-0 flex items-center justify-center bg-[#0a0f18]">
                    <div className="max-w-md px-8 text-center">
                      <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-slate-700 bg-slate-900 text-xl text-slate-300">A</div>
                      <p className="text-lg font-semibold text-slate-100">{cameraEnabled ? 'Camera preview is off' : 'Camera is muted'}</p>
                      <p className="mt-2 text-sm leading-6 text-slate-500">Preview stays inside this browser. Starting it does not send video to Twitch, YouTube or any other service.</p>
                      {!previewActive && (
                        <button
                          type="button"
                          onClick={startPreview}
                          className="mt-5 bg-violet-500 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-400"
                        >
                          Start local preview
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {lowerThirdVisible && previewActive && (
                  <div className="absolute bottom-5 left-5 max-w-[75%] border-l-4 border-violet-500 bg-black/80 px-4 py-3 backdrop-blur-sm">
                    <p className="truncate text-sm font-bold text-white">{lowerThirdName || 'Creator'}</p>
                    <p className="truncate text-xs text-slate-300">{lowerThirdDetail || 'Amalgam session'}</p>
                  </div>
                )}

                {recording && (
                  <div className="absolute right-4 top-4 flex items-center gap-2 bg-rose-500 px-3 py-1.5 text-xs font-bold text-white">
                    <span className="h-2 w-2 rounded-full bg-white" />
                    RECORDING
                  </div>
                )}
              </div>

              {stageLayout === 'split' && (
                <div className="flex aspect-video items-center justify-center border border-dashed border-slate-800 bg-[#0a0f18]">
                  <div className="px-8 text-center">
                    <p className="text-sm font-semibold text-slate-300">Guest slot empty</p>
                    <p className="mt-2 text-xs leading-5 text-slate-500">Remote participant transport is not configured.</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="mx-4 mb-3 border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-sm text-rose-200 lg:mx-8">
              {error}
            </div>
          )}

          <div className="border-t border-slate-800 bg-[#0b0f17] px-3 py-4">
            <div className="mx-auto flex max-w-4xl flex-wrap items-end justify-center gap-2 sm:gap-3">
              <StudioControl
                label={recording ? 'Stop' : 'Record'}
                active={recording}
                emphasis
                onClick={recording ? stopRecording : startRecording}
              />
              <StudioControl label="Mic" active={micEnabled} onClick={toggleMicrophone} />
              <StudioControl label="Cam" active={cameraEnabled} onClick={toggleCamera} />
              <StudioControl label="Brand" active={lowerThirdVisible} onClick={() => setLowerThirdVisible((value) => !value)} />
              <StudioControl label="Layout" active={stageLayout === 'split'} onClick={() => setActivePanel('layout')} />
              <StudioControl label="End" danger onClick={endSession} />
            </div>
          </div>
        </div>

        <aside className="grid border-t border-slate-800 bg-[#0b0f17] lg:grid-cols-[72px_1fr] lg:border-l lg:border-t-0">
          <nav className="flex overflow-x-auto border-b border-slate-800 bg-[#090d14] lg:flex-col lg:border-b-0 lg:border-r">
            {panels.map((panel) => {
              const active = activePanel === panel.id;
              return (
                <button
                  key={panel.id}
                  type="button"
                  onClick={() => setActivePanel(panel.id)}
                  className={`flex min-w-[72px] flex-col items-center gap-1.5 border-b-2 px-2 py-3 text-[10px] font-medium transition lg:min-w-0 lg:border-b-0 lg:border-r-2 lg:py-4 ${
                    active
                      ? 'border-violet-500 bg-violet-500/10 text-violet-200'
                      : 'border-transparent text-slate-500 hover:bg-slate-900 hover:text-slate-300'
                  }`}
                  aria-pressed={active}
                >
                  <PanelIcon panel={panel.id} />
                  {panel.label}
                </button>
              );
            })}
          </nav>
          <div className="min-h-[380px] p-5 lg:min-h-0 lg:overflow-y-auto">
            {renderPanel()}
          </div>
        </aside>
      </div>
    </section>
  );
}

function PanelHeading({ title, copy }: { title: string; copy: string }) {
  return (
    <div>
      <p className="text-base font-semibold text-white">{title}</p>
      <p className="mt-1 text-sm leading-6 text-slate-500">{copy}</p>
    </div>
  );
}

function StatusCard({
  title,
  status,
  tone,
}: {
  title: string;
  status: string;
  tone: 'ready' | 'recording' | 'neutral';
}) {
  const toneClass =
    tone === 'ready'
      ? 'text-emerald-300'
      : tone === 'recording'
        ? 'text-rose-300'
        : 'text-slate-500';

  return (
    <div className="flex items-center justify-between gap-4 border border-slate-800 bg-slate-950/60 px-4 py-3">
      <span className="text-sm text-slate-300">{title}</span>
      <span className={`text-xs font-semibold ${toneClass}`}>{status}</span>
    </div>
  );
}

function StudioControl({
  label,
  active = false,
  emphasis = false,
  danger = false,
  onClick,
}: {
  label: string;
  active?: boolean;
  emphasis?: boolean;
  danger?: boolean;
  onClick: () => void;
}) {
  const buttonClass = danger
    ? 'border-rose-500/40 bg-rose-500/10 text-rose-200 hover:bg-rose-500/20'
    : emphasis
      ? active
        ? 'border-rose-500 bg-rose-500 text-white hover:bg-rose-400'
        : 'border-violet-500 bg-violet-500 text-white hover:bg-violet-400'
      : active
        ? 'border-violet-500/60 bg-violet-500/10 text-violet-200'
        : 'border-slate-700 bg-slate-900 text-slate-400 hover:border-slate-600 hover:text-slate-200';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-w-[72px] border px-3 py-2.5 text-xs font-semibold transition ${buttonClass}`}
      aria-pressed={active}
    >
      {label}
    </button>
  );
}
