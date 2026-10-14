const checks = [
  { label: 'Camera + microphone', status: 'Check in Studio' },
  { label: 'External broadcast transport', status: 'Not configured' },
  { label: 'Destination bitrate', status: 'Unavailable' },
  { label: 'Platform authentication', status: 'Not configured' },
];

export function PreFlightChecklist() {
  return (
    <div className="rounded-xl border border-slate-700 bg-slate-900/80 p-4">
      <h3 className="mb-1 text-sm font-semibold uppercase tracking-widest text-slate-400">Pre-flight readiness</h3>
      <p className="mb-3 text-xs leading-5 text-slate-500">
        These states stay unverified until the browser or a real external service can confirm them.
      </p>
      <ul className="space-y-2">
        {checks.map((check) => (
          <li key={check.label} className="flex items-center justify-between gap-3 rounded bg-slate-800/80 px-3 py-2 text-sm">
            <span>{check.label}</span>
            <span className="text-right text-xs font-medium text-slate-400">{check.status}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
